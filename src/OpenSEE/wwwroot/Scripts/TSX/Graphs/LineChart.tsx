//******************************************************************************************************
//  LineChartBase.tsx - Gbtc
//
//  Copyright � 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  01/22/2020 - C. Lackner
//       Generated original version of source code
//
//******************************************************************************************************

import * as d3 from "d3";
import * as React from 'react';
import { AnalyticContext, SelectAnalyticOptions } from '../Context/AnalyticContext';
import { PlotDataStateContext } from '../Context/PlotDataContext';
import { PlotStateStateContext } from '../Context/PlotStateContext';
import { OverlappingStateContext } from '../Context/OverlappingContext';
import { toPlotKey } from '../Context/PlotKeys';
import { selectYLimits, selectYLabels, selectActiveUnit, selectRelevantUnits, selectEnabledUnits, selectFFTEnabled, selectDeltaHoverPoints } from '../PlotSelectors';
import EventContext from '../Context/EventContext';
import HoverContext from '../Context/HoverContext';
import { OpenSee } from '../global';
import { useAppSelector } from '../hooks';
import { SelectColor, SelectDataMarkers, SelectMouseMode, SelectOverlappingWaveTimeUnit, SelectPlotMarkers, SelectSinglePlot, SelectTimeUnit, SelectUseOverlappingTime, SelectZoomMode } from '../Store/settingSlice';
import Legend from './Legend/Legend';
import ChartContainer from './ChartContainer';
import { GetDisplayLabel, useChartScales, useTooltipLocations, useYLabelFontSize } from './Utils/Utilities';
import { getPrimaryAxis } from '../Context/PlotStateUtilities';
import { useFFTWindow } from './LineChart/hooks/useFFTWindow';
import { useTimeFormatContext } from './LineChart/hooks/useTimeFormatContext';
import { useMouseInteractions } from './LineChart/hooks/useMouseInteractions';
import { CreateLinePlot } from './LineChart/Renderers/CreatePlot';
import { drawLines, updateLineGeometry, updateLineColors, updateLineVisibility, IScales } from './LineChart/Renderers/Lines';
import { drawMarkers, updateMarkerGeometry, updateMarkerColors, updateMarkerVisibility } from './Renderers/Markers';
import { updateXAxisTicks, updateXAxisLabel, updateXAxisPositionOnResize } from './LineChart/Renderers/XAxes';
import { updateYAxes, updateYAxisLabels, updateYAxisVisibility, updateYAxisPositionsOnResize } from './Renderers/YAxes';
import { updateFFTWindow as updateFFTWindowD3, updateDurationWindowRect } from './LineChart/Renderers/Overlays';
import { computeZoomWindow } from './Renderers/ZoomWindow';
import { PolyLineSpec } from './PolyLine';

interface IProps {
    height: number,
    width: number,
    showToolTip: boolean,
    dataKey: OpenSee.IGraphProps
}

const hoverLineStyle: React.CSSProperties = { stroke: "#000", opacity: 0.5 };

const LineChart = (props: IProps) => {
    const [hover, setHover] = React.useContext(HoverContext);
    const [analytic, setAnalytic] = React.useContext(AnalyticContext);
    const evt = React.useContext(EventContext);
    const { plots: plotData } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);
    const overlapping = React.useContext(OverlappingStateContext);
    const pk = toPlotKey(props.dataKey);
    const plotMeta = plotState.meta[pk];

    const isOverlappingWaveform = props.dataKey.DataType === "OverlappingWave";
    const primaryAxis = getPrimaryAxis(props.dataKey);
    const isOriginalEvt = props.dataKey.EventId === evt.Context.EventID;

    const lineData = plotData[pk] ?? [];
    const loading = plotMeta?.loading ?? 'Uninitiated';
    const enabledLine = plotMeta?.enabled ?? {};
    const isZoomed = plotMeta?.isZoomed ?? false;

    const activeUnit = React.useMemo(() => plotMeta ? selectActiveUnit(plotMeta) : null, [plotMeta]);
    const relevantUnits = React.useMemo(() => selectRelevantUnits(props.dataKey, lineData), [lineData]);
    const enabledUnits = React.useMemo(() => selectEnabledUnits(props.dataKey, lineData, plotMeta?.enabled ?? {}), [lineData, plotMeta?.enabled]);
    const yLimits = React.useMemo(() => plotMeta ? selectYLimits(plotMeta) : {} as any, [plotMeta]);
    const yLabels = React.useMemo(() => plotMeta ? selectYLabels(plotMeta) : {} as any, [plotMeta]);
    const options = React.useMemo(() => SelectAnalyticOptions(analytic, props.dataKey.DataType), [analytic, props.dataKey]);
    const fftWindow = React.useMemo(() => ([analytic.FFTStartTime, analytic.FFTStartTime + (analytic.FFTCycles * 1 / 60.0 * 1000.0)] as [number, number]), [analytic]);
    const showFFT = React.useMemo(() => selectFFTEnabled(plotState.meta), [plotState.meta]);
    const points = React.useMemo(() => selectDeltaHoverPoints(hover, props.dataKey.EventId, plotData, plotState.meta, props.dataKey, options?.[0]), [hover, props.dataKey, plotData, plotState.meta, options]);

    const singlePlot = useAppSelector(SelectSinglePlot);
    const plotMarkers = useAppSelector(SelectPlotMarkers);
    const dataMarkers = useAppSelector(SelectDataMarkers);
    const colors = useAppSelector(SelectColor);
    const timeUnit = useAppSelector(SelectTimeUnit);
    const overlappingWaveTimeUnit = useAppSelector(SelectOverlappingWaveTimeUnit);
    const mouseMode = useAppSelector(SelectMouseMode);
    const zoomMode = useAppSelector(SelectZoomMode);
    const useRelevantTime = useAppSelector(SelectUseOverlappingTime);

    const startTime = isOverlappingWaveform ? plotState.cycleLimits[0] : plotState.startTime;
    const endTime = isOverlappingWaveform ? plotState.cycleLimits[1] : plotState.endTime;
    const originalStartTime = new Date(evt.Context.EventInfo?.EventDate + "Z").getTime();
    const inceptionTime = new Date(evt.Context.EventInfo?.InceptionDate + "Z").getTime();

    const containerRef = React.useRef<HTMLDivElement>(null);
    const { xScaleRef, yScaleRef } = useChartScales(d3.scaleLinear());
    const firstAnalyticOption = options?.[0];
    const xRange = React.useMemo<[number, number]>(() => {
        if (enabledUnits?.length > 2)
            return [120, props.width - 110];
        return [60, props.width - 110];
    }, [enabledUnits, props.width]);

    React.useLayoutEffect(() => {
        if (xScaleRef.current == null) return;
        xScaleRef.current.domain([startTime, endTime]).range(xRange);
    }, [startTime, endTime, xRange]);

    const buildTimeCtx = useTimeFormatContext(
        xScaleRef,
        isOverlappingWaveform,
        overlappingWaveTimeUnit,
        timeUnit,
        originalStartTime,
        useRelevantTime,
        isOriginalEvt,
        overlapping.events,
        props.dataKey.EventId,
        inceptionTime,
        startTime
    );

    const { currentFFTWindow, setCurrentFFTWindow, oldFFTWindow, setOldFFTWindow } = useFFTWindow(xScaleRef, fftWindow);
    const yLblFontSize = useYLabelFontSize(yLabels, primaryAxis, props.height);
    const { toolTipLocation, selectedPointLocation, inceptionLocation, durationLocation } = useTooltipLocations(xScaleRef, hover, points, evt.Context.EventInfo, startTime, endTime, xRange);
    const hoverValueLocation = React.useMemo(() => {
        const scale = (yScaleRef.current as Record<string, d3.ScaleLinear<number, number>>)[primaryAxis];
        const location = scale?.(hover[1]);

        return location == null || !Number.isFinite(location) ? null : location;
    }, [hover, primaryAxis, activeUnit, yLimits]);

    const { handlers, wheelZoom, mouseDown, pointMouse } = useMouseInteractions({
        containerRef, xScaleRef, yScaleRef, primaryAxis,
        hover, setHover, isOverlappingWaveform,
        mouseMode, zoomMode, setAnalytic,
        plotData, dataKey: props.dataKey,
        width: props.width, height: props.height,
        fftWindow, startTime, endTime, yLimits,
        oldFFTWindow, setOldFFTWindow, setCurrentFFTWindow,
    });

    const [isCreated, setCreated] = React.useState<boolean>(false);
    const lineBottom = props.height - 40;
    const hoverLines = React.useMemo<PolyLineSpec[]>(() => {
        const lines: PolyLineSpec[] = [];

        if (zoomMode === 'x' || zoomMode === 'xy')
            lines.push({ className: 'hoverX', points: `${toolTipLocation},20 ${toolTipLocation},${lineBottom}`, style: hoverLineStyle });

        if ((zoomMode === 'y' || zoomMode === 'xy') && hoverValueLocation != null)
            lines.push({ className: 'hoverY', points: `${xRange[0]},${hoverValueLocation} ${xRange[1]},${hoverValueLocation}`, style: hoverLineStyle });

        return lines;
    }, [zoomMode, toolTipLocation, hoverValueLocation, lineBottom, xRange]);

    const zoomWindow = React.useMemo(() => {
        if (xScaleRef.current == null) return null;
        const yScale = (yScaleRef.current as Record<string, d3.ScaleLinear<number, number>>)[primaryAxis];
        return computeZoomWindow(d => xScaleRef.current(d), yScale, hover, pointMouse, mouseMode, zoomMode, mouseDown, startTime, endTime, props.height);
    }, [hover, pointMouse, mouseDown, mouseMode, zoomMode, startTime, endTime, yLimits, primaryAxis, props.height]);

    const getScales = (): IScales => ({ x: xScaleRef.current, y: yScaleRef.current as Record<string, d3.ScaleLinear<number, number>> });

    function updateLimits() {
        const scales = getScales();
        updateLineGeometry(containerRef.current, enabledLine, scales, activeUnit);
        updateMarkerGeometry(containerRef.current, scales, activeUnit);
        updateYAxes(containerRef.current, enabledUnits, scales.y, props.width, props.dataKey.DataType, props.dataKey.EventId);
        updateXAxisTicks(containerRef.current, scales.x, buildTimeCtx());
        updateXAxisLabel(containerRef.current, scales.x, isOverlappingWaveform, timeUnit);

        if (xScaleRef.current != null && showFFT)
            setCurrentFFTWindow([xScaleRef.current(fftWindow[0]), xScaleRef.current(fftWindow[1])]);
    }

    // Data load: create plot chrome, draw data, update visibility
    React.useEffect(() => {
        if (!lineData || lineData.length === 0 || loading === 'Loading') return;

        if (isCreated) {
            drawLines(containerRef.current, lineData, enabledLine, getScales(), activeUnit, colors, singlePlot, evt.Context.EventInfo?.EventId ?? null);
            drawMarkers(containerRef.current, lineData, getScales(), colors);
        }

        CreateLinePlot(
            containerRef.current,
            xScaleRef,
            yScaleRef as { current: Record<string, d3.ScaleLinear<number, number>> },
            {
                height: props.height, width: props.width, dataKey: props.dataKey,
                yLimits, enabledUnits, yLabels, startTime, endTime,
                showFFT, plotMarkers, fftWindow, currentFFTWindow, mouseMode,
                timeCtx: buildTimeCtx(), displayLabel: GetDisplayLabel(props.dataKey.DataType, firstAnalyticOption),
                eventInfo: evt.Context.EventInfo,
            },
            { ...handlers, wheelZoom }
        );

        drawLines(containerRef.current, lineData, enabledLine, getScales(), activeUnit, colors, singlePlot, evt.Context.EventInfo?.EventId ?? null);
        drawMarkers(containerRef.current, lineData, getScales(), colors);
        updateLimits();
        updateDurationWindowRect(containerRef.current, xScaleRef.current, evt.Context.EventInfo?.Inception ?? 0, evt.Context.EventInfo?.DurationEndTime ?? 0, plotMarkers);
        updateLineVisibility(containerRef.current, lineData, enabledLine);
        updateMarkerVisibility(containerRef.current, lineData, enabledLine, dataMarkers);
        updateYAxisVisibility(containerRef.current, relevantUnits, enabledUnits);
        setCreated(true);
    }, [lineData, loading, firstAnalyticOption]);

    // Resize: reposition axes, recompute scale ranges
    React.useEffect(() => {
        if (xScaleRef.current == null || yScaleRef.current == null) return;

        updateXAxisPositionOnResize(containerRef.current, props.height, props.width);
        updateYAxisPositionsOnResize(containerRef.current, relevantUnits, getScales().y, props.height, props.width);

        xScaleRef.current.domain([startTime, endTime]).range(xRange);

        const container = d3.select(containerRef.current);
        container.select('.clip').attr('width', props.width - 110).attr('height', props.height - 60);
        container.select('.fftwindow').attr('height', props.height - 60);
        container.select('.Overlay').attr('width', props.width - 110);
        updateLimits();

    }, [props.height, props.width]);

    // Visibility: legend enable/disable
    React.useEffect(() => {
        if (lineData == null || lineData.length === 0) return;
        updateLineVisibility(containerRef.current, lineData, enabledLine);
        updateMarkerVisibility(containerRef.current, lineData, enabledLine, dataMarkers);
        updateYAxisVisibility(containerRef.current, relevantUnits, enabledUnits);
    }, [enabledLine, dataMarkers]);

    // Scale/limits update: y domain, x range, then re-render geometry
    React.useEffect(() => {
        if (yScaleRef.current == null || xScaleRef.current == null) return;

        relevantUnits.forEach(unit => {
            if ((yScaleRef.current as any)[unit] && yLimits?.[unit])
                (yScaleRef.current as any)[unit].domain(yLimits[unit]);
        });

        xScaleRef.current.domain([startTime, endTime]).range(xRange);

        if (yLimits) updateLimits();

    }, [activeUnit, yLimits, startTime, endTime, isZoomed, timeUnit, lineData, useRelevantTime]);

    // Colors: update line and marker colors on theme change
    React.useEffect(() => {
        updateLineColors(containerRef.current, colors);
        updateMarkerColors(containerRef.current, colors);
    }, [colors]);

    // FFT window D3: render the FFT window overlay
    React.useEffect(() => {
        updateFFTWindowD3(containerRef.current, props.dataKey.DataType, currentFFTWindow, showFFT, mouseMode);
    }, [fftWindow, showFFT, currentFFTWindow, mouseMode]);

    // Duration window: update rect and marker positions
    React.useEffect(() => {
        if (xScaleRef.current == null || evt.Context.EventInfo == null) return;
        updateDurationWindowRect(containerRef.current, xScaleRef.current, evt.Context.EventInfo.Inception, evt.Context.EventInfo.DurationEndTime, plotMarkers);
    }, [plotMarkers, startTime, endTime, props.width, props.height, timeUnit]);

    // dataKey / options change: clear and recreate the whole plot
    React.useEffect(() => {
        d3.select(containerRef.current).select('svg.root').select('g.root').remove();

        if (loading === 'Loading' || lineData?.length === 0) {
            setCreated(false);
            return;
        }

        CreateLinePlot(
            containerRef.current,
            xScaleRef,
            yScaleRef as { current: Record<string, d3.ScaleLinear<number, number>> },
            {
                height: props.height,
                width: props.width,
                dataKey: props.dataKey,
                yLimits,
                enabledUnits,
                yLabels,
                startTime,
                endTime,
                showFFT,
                plotMarkers,
                fftWindow,
                currentFFTWindow,
                mouseMode,
                timeCtx: buildTimeCtx(),
                displayLabel: GetDisplayLabel(props.dataKey.DataType, firstAnalyticOption),
                eventInfo: evt.Context.EventInfo,
            },
            { ...handlers, wheelZoom }
        );

        drawLines(containerRef.current, lineData, enabledLine, getScales(), activeUnit, colors, singlePlot, evt.Context.EventInfo?.EventId ?? null);
        drawMarkers(containerRef.current, lineData, getScales(), colors);
        updateLimits();
        updateLineVisibility(containerRef.current, lineData, enabledLine);
        updateMarkerVisibility(containerRef.current, lineData, enabledLine, dataMarkers);
        updateYAxisVisibility(containerRef.current, relevantUnits, enabledUnits);
    }, [props.dataKey, firstAnalyticOption]);

    // Y-axis labels: re-render when labels or font size change
    React.useEffect(() => {
        updateYAxisLabels(containerRef.current, relevantUnits, yLabels, yLblFontSize);
    }, [yLabels, yLblFontSize]);

    return (
        <>
            <ChartContainer
                ref={containerRef}
                key={props.dataKey.DataType + props.dataKey.EventId + 'container'}
                dataKey={props.dataKey}
                height={props.height}
                loading={loading}
                hasData={lineData?.length > 0}
                hasTrace={Object.values(enabledLine).some(v => v)}
                zoomWindow={zoomWindow}
                polyLines={[
                    ...hoverLines,
                    ...(props.showToolTip && selectedPointLocation != null ? [{ className: 'selectedPoint', points: `${selectedPointLocation},20 ${selectedPointLocation},${lineBottom}`, style: { stroke: "#000", opacity: 1, strokeDasharray: "5,5" } }] : []),
                    ...(plotMarkers ? [
                        { className: 'inception', points: `${inceptionLocation},20 ${inceptionLocation},${lineBottom}`, style: { stroke: "#a30000", strokeDasharray: "5,5", opacity: 0.5 } },
                        { className: 'duration', points: `${durationLocation},20 ${durationLocation},${lineBottom}`, style: { stroke: "#a30000", strokeDasharray: "5,5", opacity: 0.5 } }
                    ] : [])
                ]}
            />
            {loading === 'Loading' || lineData?.length === 0 ? null :
                <Legend
                    key={props.dataKey.DataType + props.dataKey.EventId + 'legend'}
                    height={props.height}
                    dataKey={props.dataKey}
                />
            }
        </>
    );
}

export default LineChart;
