//******************************************************************************************************
//  BarChartBase.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//******************************************************************************************************

import * as d3 from "d3";
import * as React from 'react';
import { AnalyticContext, SelectAnalyticOptions } from '../Context/AnalyticContext';
import { PlotDataStateContext } from '../Context/PlotDataContext';
import { PlotStateStateContext } from '../Context/PlotStateContext';
import { toPlotKey } from '../Context/PlotKeys';
import { selectYLimits, selectYLabels, selectActiveUnit, selectRelevantUnits, selectEnabledUnits } from '../PlotSelectors';
import { getPrimaryAxis } from '../Context/PlotStateUtilities';
import { OpenSee } from '../global';
import { useAppSelector } from '../hooks';
import { SelectColor, SelectMouseMode, SelectZoomMode } from '../store/settingSlice';
import Legend from './Legend/Legend';
import ChartContainer from './ChartContainer';
import { updateZoomWindow } from './Renderers/ZoomWindow';
import { updateYAxes, updateYAxisLabels, updateYAxisPositionsOnResize, updateYAxisVisibility } from './Renderers/YAxes';
import { drawBars, updateBarColors, updateBarGeometry, updateBarVisibility } from './BarChart/Renderers/Bars';
import { drawAnglePoints, updateAnglePointColors, updateAnglePointGeometry, updateAnglePointVisibility } from './BarChart/Renderers/AnglePoints';
import { CreateBarPlotFrame } from './BarChart/Renderers/CreateBarPlotFrame';
import { setFrequencyDomainFromBands, syncFrequencyScaleRange, updateFrequencyXAxisOnResize, updateFrequencyXAxisTicks } from './BarChart/Renderers/XAxisFreq';
import { useChartScales, useYLabelFontSize } from "./Utils/Utilities";
import { IBarScales, useBarMouseInteractions } from "./BarChart/Utils";

interface IProps {
    height: number,
    width: number,
    dataKey: OpenSee.IGraphProps
}

const BarChart = (props: IProps) => {
    const [analytic] = React.useContext(AnalyticContext);
    const { plots: plotData } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);

    const dataKey: OpenSee.IGraphProps = { DataType: props.dataKey.DataType, EventId: props.dataKey.EventId };
    const pk = toPlotKey(dataKey);
    const plotMeta = plotState.meta[pk];
    const barData = plotData[pk] ?? [];
    const enabledBar = plotMeta?.enabled ?? {};
    const loading = plotMeta?.loading ?? 'Uninitiated';

    const primaryAxis = getPrimaryAxis(dataKey);
    const activeUnit = React.useMemo(() => plotMeta ? selectActiveUnit(plotMeta) : null, [plotMeta]);
    const relevantUnits = React.useMemo(() => selectRelevantUnits(dataKey, barData), [barData]);
    const enabledUnits = React.useMemo(() => selectEnabledUnits(dataKey, barData, plotMeta?.enabled ?? {}), [barData, plotMeta?.enabled]);
    const yLimits = React.useMemo(() => plotMeta ? selectYLimits(plotMeta) : {}, [plotMeta]); //type properly
    const yLabels = React.useMemo(() => plotMeta ? selectYLabels(plotMeta) : {}, [plotMeta]); //type properly
    const options = React.useMemo(() => SelectAnalyticOptions(analytic, props.dataKey.DataType), [analytic, props.dataKey]);

    const colors = useAppSelector(SelectColor);
    const mouseMode = useAppSelector(SelectMouseMode);
    const zoomMode = useAppSelector(SelectZoomMode);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const { xScaleRef, yScaleRef } = useChartScales(d3.scaleBand<number>([], [0, 0]));
    const xScaleLblRef = React.useRef<d3.ScaleLinear<number, number>>(d3.scaleLinear().domain([0, 1]).range([0, 0]));
    const [hover, setHover] = React.useState<[number, number]>([0, 0]);
    const [isCreated, setCreated] = React.useState<boolean>(false);
    const yLblFontSize = useYLabelFontSize(yLabels, primaryAxis, props.height);

    const { handlers, mouseDown, pointMouse } = useBarMouseInteractions({
        containerRef,
        xScaleRef,
        yScaleRef,
        primaryAxis,
        hover,
        setHover,
        mouseMode,
        zoomMode,
        plotData,
        dataKey,
        height: props.height,
        width: props.width,
        fftLimits: plotState.fftLimits,
        yLimits
    });

    const getScales = (): IBarScales => ({
        x: xScaleRef.current,
        y: yScaleRef.current as Record<string, d3.ScaleLinear<number, number>>
    });

    const syncDomains = () => {
        relevantUnits.forEach(unit => {
            if ((yScaleRef.current as any)[unit] && yLimits?.[unit])
                (yScaleRef.current as any)[unit].domain(yLimits[unit]);
        });

        const domain = (barData?.[0]?.DataPoints ?? [])
            .filter(pt => pt[0] >= plotState.fftLimits[0] && pt[0] <= plotState.fftLimits[1])
            .map(pt => pt[0]);

        xScaleRef.current.domain(domain).range([60, props.width - 110]);
        setFrequencyDomainFromBands(xScaleRef.current, xScaleLblRef.current);
        syncFrequencyScaleRange(xScaleRef.current, xScaleLblRef.current, props.width);
    }

    const rebuildPlot = () => {
        CreateBarPlotFrame(
            containerRef.current,
            xScaleRef,
            xScaleLblRef,
            yScaleRef as { current: Record<string, d3.ScaleLinear<number, number>> },
            {
                height: props.height,
                width: props.width,
                dataKey,
                yLimits,
                enabledUnits,
                yLabels,
                barData,
                fftLimits: plotState.fftLimits
            },
            handlers
        );
        drawBars(containerRef.current, barData, getScales(), colors, enabledBar, activeUnit, props.height - 40);
        drawAnglePoints(containerRef.current, barData, getScales(), colors, enabledBar, activeUnit);
        updateLimits();
        updateVisibility();
    }

    const updateLimits = () => {
        const scales = getScales();
        updateBarGeometry(containerRef.current, scales, activeUnit, props.height - 40);
        updateAnglePointGeometry(containerRef.current, scales, activeUnit);
        updateYAxes(containerRef.current, enabledUnits, scales.y, props.width, dataKey.DataType, dataKey.EventId);
        updateFrequencyXAxisTicks(containerRef.current, xScaleLblRef.current);
    }

    const updateVisibility = () => {
        updateBarVisibility(containerRef.current, barData, enabledBar);
        updateAnglePointVisibility(containerRef.current, barData, enabledBar);
        updateYAxisVisibility(containerRef.current, relevantUnits, enabledUnits);
    }

    React.useEffect(() => {
        if (barData == null || barData.length === 0 || loading === 'Loading') return;
        rebuildPlot();
        setCreated(true);
    }, [barData, loading]);

    React.useEffect(() => {
        if (!isCreated || xScaleRef.current == null || yScaleRef.current == null) return;

        xScaleRef.current.range([60, props.width - 110]);
        updateFrequencyXAxisOnResize(containerRef.current, xScaleRef.current, xScaleLblRef.current, props.height, props.width);
        updateYAxisPositionsOnResize(containerRef.current, relevantUnits, getScales().y, props.height, props.width);

        relevantUnits.forEach(unit => {
            if ((yScaleRef.current as any)[unit] != null)
                (yScaleRef.current as any)[unit].range([props.height - 40, 20]);
        });

        d3.select(containerRef.current).select(".clip").attr("height", props.height - 60).attr("width", props.width - 170);
        d3.select(containerRef.current).select(".Overlay").attr("width", props.width - 110);
        updateLimits();
    }, [props.height, props.width]);

    React.useEffect(() => {
        if (barData == null || barData.length === 0) return;
        updateVisibility();
    }, [enabledBar]);

    React.useEffect(() => {
        if (!isCreated || yScaleRef.current == null || xScaleRef.current == null) return;
        syncDomains();
        if (yLimits)
            updateLimits();
    }, [activeUnit, yLimits, plotState.fftLimits]);

    React.useEffect(() => {
        if (xScaleRef.current == null || yScaleRef.current == null) return;
        const scales = getScales();
        updateZoomWindow(
            containerRef.current,
            d => (scales.x(d) ?? 0) + scales.x.bandwidth() / 2,
            scales.y[primaryAxis],
            hover,
            pointMouse,
            mouseMode,
            zoomMode,
            mouseDown,
            plotState.fftLimits[0],
            plotState.fftLimits[1],
            props.height
        );
    }, [hover]);

    React.useEffect(() => {
        updateBarColors(containerRef.current, colors);
        updateAnglePointColors(containerRef.current, colors);
    }, [colors]);

    React.useEffect(() => {
        d3.select(containerRef.current).select('svg.root').select('g.root').remove();

        if (loading === 'Loading' || barData?.length === 0) {
            setCreated(false);
            return;
        }

        rebuildPlot();
        setCreated(true);
    }, [props.dataKey, options]);

    React.useEffect(() => {
        updateYAxisLabels(containerRef.current, relevantUnits, yLabels, yLblFontSize);
    }, [yLabels, yLblFontSize]);

    return (
        <>
            <ChartContainer
                ref={containerRef}
                key={props.dataKey.DataType + props.dataKey.EventId + "container"}
                dataKey={dataKey}
                height={props.height}
                loading={loading}
                hasData={(barData?.length ?? -1) > 0}
                hasTrace={Object.values(enabledBar).some(v => v)}
            />
            {loading === 'Loading' || barData?.length === 0 ? null :
                <Legend
                    key={props.dataKey.DataType + props.dataKey.EventId}
                    height={props.height}
                    dataKey={dataKey}
                />
            }
        </>
    );
}

export default BarChart;
