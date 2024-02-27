//******************************************************************************************************
//  LineChartBase.tsx - Gbtc
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
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  01/22/2020 - C. Lackner
//       Generated original version of source code
//
//******************************************************************************************************

import * as React from 'react';
import * as _ from "lodash";
import * as d3 from "d3";
import { OpenSee } from '../global';

import moment from "moment"
import Legend from './LegendBase';
import { GetDisplayLabel } from './Utilities'
import { SelectColor, SelectActiveUnit, SelectTimeUnit, SelectSinglePlot, SelectPlotMarkers, SelectUseOverlappingTime, SelectOverlappingWaveTimeUnit, SelectZoomMode, SelectMouseMode } from '../store/settingSlice'

import {
    SelectData, SelectRelevantUnits, SelectIsZoomed, SelectEnabled, SelectStartTime,
    SelectEndTime, SelectLoading, SelectYLimits, SetZoomedLimits, SetSelectPoint, SetTimeLimit, SelectEnabledUnits,
    SetCycleLimit, SelectYLabels, SelectDeltaHoverPoints, getPrimaryAxis, SelectCycleLimits
} from '../store/dataSlice';

import { SelectEventID, SelectEventInfo } from '../store/eventInfoSlice'

import { SelectEventList } from '../store/overlappingEventsSlice'

import { SelectAnalyticOptions, SelectCycles, SelectFFTWindow, SelectShowFFTWindow, SelectAnalytics, UpdateAnalytic } from '../store/analyticSlice';
import { LoadingIcon, NoDataIcon } from './ChartIcons';
import { useAppDispatch, useAppSelector } from '../hooks';

import HoverContext from '../Context/HoverContext'
import { defaultSettings } from '../defaults';

interface iProps {   
    height: number,
    width: number,
    showToolTip: boolean,
    dataKey: OpenSee.IGraphProps
};

interface IMarker { x: number, y: number, unit: string, base: number }

// The following Classes are used in this 
// xAxis, yaxis => The axis Labels
// xAxisLabel, yAxisLabel => The Text next to the Axis
// root => The SVG Container 
// line => The Trace
// active => indicates an active trace
// SelectedPoints => a group of points Selected
// selectedPoint => a single point 
// toolTip => The vertical Line used as tooltip
// zoomWindow => Window shown when zooming
// clip => The Clipp Path
// DataContainer => The Container that has all the Databased elements (Line, Marker etc)
// Overlay => The Container Overlayed for eventHandling

const LineChart = (props: iProps) => {
    const dispatch = useAppDispatch();
    const cycleLimits = useAppSelector(SelectCycleLimits);
    const isOverlappingWaveform = props.dataKey.DataType === "OverlappingWave"

    const MemoSelectActiveUnit = React.useMemo(() => SelectActiveUnit(props.dataKey), [props.dataKey])
    const activeUnit = useAppSelector(MemoSelectActiveUnit);

    const MemoSelectAnalyticOption = React.useMemo(() => SelectAnalyticOptions(props.dataKey.DataType), [props.dataKey])
    const options = useAppSelector(MemoSelectAnalyticOption);

    const MemoSelectStartTime = React.useMemo(() => (SelectStartTime), [props.dataKey])
    const MemoSelectEndTime = React.useMemo(() => (SelectEndTime), [props.dataKey])

    const MemoSelectData = React.useMemo(() => SelectData(props.dataKey), []);
    const lineData = useAppSelector(MemoSelectData);

    const MemoSelectRelevantUnits = React.useMemo(() => SelectRelevantUnits(props.dataKey), []);
    const relevantUnits = useAppSelector(MemoSelectRelevantUnits);

    const MemoSelectEnabledUnit = React.useMemo(() => SelectEnabledUnits(props.dataKey), []);
    const enabledUnits = useAppSelector(MemoSelectEnabledUnit);

    const MemoSelectEnabled = React.useMemo(() => SelectEnabled(props.dataKey), []);
    const enabledLine = useAppSelector(MemoSelectEnabled);

    const SelectYlimits = React.useMemo(() => SelectYLimits(props.dataKey), [props.dataKey, lineData]);
    const yLimits = useAppSelector(SelectYlimits);

    const isZoomed = useAppSelector(SelectIsZoomed(props.dataKey));

    const xScaleRef = React.useRef<d3.ScaleLinear<number, number>>();
    const yScaleRef = React.useRef<OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}>({});

    const primaryAxis = getPrimaryAxis(props.dataKey)

    const [isCreated, setCreated] = React.useState<boolean>(false);
    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    const [fftMouseDown, setFFTMouseDown] = React.useState<boolean>(false);
    const [mouseDownInit, setMouseDownInit] = React.useState<boolean>(false);
    const [pointMouse, setPointMouse] = React.useState<[number, number]>([0, 0]);

    const [toolTipLocation, setTooltipLocation] = React.useState<number>(10);
    const [selectedPointLocation, setSelectedPointLocation] = React.useState<number>(null);
    const [inceptionLocation, setInceptionLocation] = React.useState<number>(10);
    const [durationLocation, setDurationLocation] = React.useState<number>(10);

    const evtID = useAppSelector(SelectEventID);
    const isOriginalEvt = props.dataKey.EventId === evtID
    
    const singlePlot = useAppSelector(SelectSinglePlot);
    const plotMarkers = useAppSelector(SelectPlotMarkers);

    const startTime = isOverlappingWaveform ? cycleLimits[0] : useAppSelector(MemoSelectStartTime);
    const endTime = isOverlappingWaveform ? cycleLimits[1] : useAppSelector(MemoSelectEndTime);

    const analytics = useAppSelector(SelectAnalytics);
    const overlappingEvents = useAppSelector(SelectEventList);
    const useRelevantTime = useAppSelector(SelectUseOverlappingTime);

    const loading = useAppSelector(SelectLoading(props.dataKey));

    const colors = useAppSelector(SelectColor);
    const timeUnit = useAppSelector(SelectTimeUnit);

    const overlappingWaveTimeUnit = useAppSelector(SelectOverlappingWaveTimeUnit);

    const yLabels = useAppSelector(SelectYLabels(props.dataKey));
    const [yLblFontSize, setYLblFontSize] = React.useState<number>(1);

    const mouseMode = useAppSelector(SelectMouseMode);
    const zoomMode = useAppSelector(SelectZoomMode);

    const eventInfo = useAppSelector(SelectEventInfo);
    const originalStartTime = new Date(eventInfo?.EventDate + "Z").getTime()

    const fftWindow = useAppSelector(SelectFFTWindow);
    const showFFT = useAppSelector(SelectShowFFTWindow);
    const fftCycles = useAppSelector(SelectCycles);
    const { hover, setHover } = React.useContext(HoverContext);

    const [currentFFTWindow, setCurrentFFTWindow] = React.useState<[number, number]>(fftWindow);
    const [oldFFTWindow, setOldFFTWindow] = React.useState<[number, number]>([0, 0]);
    const [leftSelectCounter, setLeftSelectCounter] = React.useState<number>(0);

    const points = useAppSelector(SelectDeltaHoverPoints(hover));

    //Effect to update the Data 
    React.useEffect(() => {
        if (lineData && lineData?.length > 0 && loading !== 'Loading') {
            if (isCreated)
            UpdateData();

        createPlot();
        UpdateData();
        updateVisibility();
        setCreated(true);
        }

    }, [lineData, loading]);


    //Effect to adjust Axes Labels when Scale changes
    React.useEffect(() => {
        if (yScaleRef.current != undefined && xScaleRef.current != undefined)
            updateSize();

    }, [props.height, props.width])

    React.useEffect(() => {
        if (lineData && lineData?.length > 0)
        updateVisibility();
    }, [enabledLine])


    //Effect to change location of tool tip
    React.useEffect(() => {
        if (xScaleRef.current)
            setTooltipLocation(xScaleRef.current(hover?.[0]))

        updateHover();
    }, [hover])

    //Effect to change location of tool tip
    React.useEffect(() => {
        if (xScaleRef.current) {
            const newTime = points.length > 0 ? points[0].Time : null
            if (newTime && selectedPointLocation !== xScaleRef.current(newTime)) 
                setSelectedPointLocation(xScaleRef.current(newTime))
        }
    }, [points, startTime, endTime])


    // For performance Combine a bunch of Hooks that call updateLimits() since that is what re-renders the Lines
    //Effect to adjust Axes when Units change
    React.useEffect(() => {
        if (yScaleRef.current === undefined || xScaleRef.current === undefined)
            return;

        relevantUnits.forEach(unit => {
            if (yScaleRef.current?.[unit] && yLimits?.[unit]) {
                yScaleRef.current[unit].domain(yLimits[unit]);
            }
        });

        if (enabledUnits?.length > 2)
            xScaleRef.current.range([120, props.width - 110])
        else if (enabledUnits?.length > 3)
            xScaleRef.current.range([120, props.width - 170])

        if (yLimits)
        updateLimits();


    }, [activeUnit, yLimits, startTime, endTime, isZoomed, timeUnit, lineData, useRelevantTime])


    React.useEffect(() => {

        if (leftSelectCounter == 0)
            return;
        if (leftSelectCounter == 1)
            return;
        let handle = setTimeout(() => { MouseLeft(); }, 500);
        return () => { clearTimeout(handle) };
    }, [leftSelectCounter])
    

    React.useEffect(() => { //mouseDown Effect
        if (!mouseDownInit) {
            setMouseDownInit(true);
            return;
        }

        if (!mouseDown && mouseMode == 'zoom' && zoomMode == "x" && !isOverlappingWaveform)
            dispatch(SetTimeLimit({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
        if (!mouseDown && mouseMode == 'zoom' && zoomMode == "x" && !isOverlappingWaveform)
            dispatch(SetCycleLimit({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "y")
            dispatch(SetZoomedLimits({ limits: [Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], key: props.dataKey }));
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "xy" && !isOverlappingWaveform) {
            dispatch(SetTimeLimit({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
            dispatch(SetZoomedLimits({ limits: [Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], key: props.dataKey }));
        }
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "xy" && !isOverlappingWaveform) {
            dispatch(SetCycleLimit({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
            dispatch(SetZoomedLimits({ limits: [Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], key: props.dataKey }));
        }
        else if (!fftMouseDown && mouseMode == 'fftMove' && pointMouse[0] < oldFFTWindow[1] && pointMouse[0] > oldFFTWindow[0]) {
            let deltaT = pointMouse[0] - oldFFTWindow[0];
            const deltaData = oldFFTWindow[1] - oldFFTWindow[0];
            let Tstart = hover[0] - deltaT;

            Tstart = (Tstart < xScaleRef.current.domain()[0] ? xScaleRef.current.domain()[0] : Tstart)
            Tstart = ((Tstart + deltaData) > xScaleRef.current.domain()[1] ? xScaleRef.current.domain()[1] - deltaData : Tstart);
            dispatch(UpdateAnalytic({ settings: { ...analytics, FFTStartTime: Tstart, FFTCycles: fftCycles }, key: { DataType: "FFT", EventId: evtID } }));
        }
    }, [mouseDown, fftMouseDown])


    React.useEffect(() => {
        updateColors();
    }, [colors])


    React.useEffect(() => {
        updateFFTWindow();
    }, [fftWindow, showFFT, currentFFTWindow])

    React.useEffect(() => {
        if (xScaleRef.current)
            updateDurationWindow();
    }, [plotMarkers, startTime, endTime, props.width, props.height, timeUnit])

    React.useEffect(() => {
        if (xScaleRef.current)
            setCurrentFFTWindow([(xScaleRef.current(fftWindow[0])), (xScaleRef.current(fftWindow[1]))]);
    }, [fftWindow])


    //This Clears the Plot if loading is activated
    React.useEffect(() => {
        d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId + ">svg").select("g.root").remove()

        if (loading == 'Loading') {
            setCreated(false);
            return;
        }

        if (lineData?.length == 0) {
            setCreated(false);
            return;
        }

        createPlot();
        UpdateData();
        updateVisibility();

    }, [props.dataKey, options]);

    React.useEffect(() => {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        if (container == null || container.select(".yAxisLabel") == null)
            return;
        relevantUnits.forEach(unit => {
            container.select(`.yAxisLabelLeft[type='${unit}']`).style('font-size', yLblFontSize.toString() + 'rem');
            container.select(`.yAxisLabelLeft[type='${unit}']`).text(yLabels[unit])

            container.select(`.yAxisLabelRight[type='${unit}']`).style('font-size', yLblFontSize.toString() + 'rem');
            container.select(`.yAxisLabelRight[type='${unit}']`).text(yLabels[unit])
        })

    }, [yLabels, yLblFontSize]);

    React.useEffect(() => {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        if (container == null || container.select(".yAxisLabel") == null)
            return;

        let fs = 1;
        let l = GetTextWidth('', '1rem', yLabels?.[primaryAxis]);
        let r = GetTextWidth('', '1rem', yLabels?.[primaryAxis] ? yLabels?.[primaryAxis] : "");

        while (((l > props.height - 60) || (r > props.height - 60)) && fs > 0.2) {
            fs = fs - 0.05;
            l = GetTextWidth('', fs.toString() + 'rem', yLabels?.[primaryAxis]);
            r = GetTextWidth('', fs.toString() + 'rem', yLabels?.[primaryAxis] ? yLabels?.[primaryAxis] : "");
        }
        if (fs != yLblFontSize)
            setYLblFontSize(fs)

    }, [props.height, yLabels])

    function createLineGen(unit: OpenSee.Unit = null, base = null) {
        let factor = 1.0

        // Calculate factor if unit and base are provided
        if (unit && base && activeUnit?.[unit]) {
            factor = activeUnit?.[unit].factor;
            if (factor === undefined)  //p.u case
                factor = 1.0 / base
        }

        return d3.line()
            .x(d => {
                return xScaleRef.current ? xScaleRef.current(d[0]) : 0
            })
            .y(d => yScaleRef?.current[unit] ? yScaleRef?.current[unit](d[1] * factor) : 0)
            .defined(d => {
                let tx = !isNaN(parseFloat(xScaleRef.current ? xScaleRef.current(d[0])?.toString() : '0'));
                let ty = !isNaN(parseFloat(yScaleRef?.current[unit] ? yScaleRef.current[unit](d[1] * factor)?.toString() : '0'));
                tx = tx && isFinite(parseFloat(xScaleRef.current ? xScaleRef.current(d[0])?.toString() : '0'));
                ty = ty && isFinite(parseFloat(yScaleRef?.current[unit] ? yScaleRef.current[unit](d[1] * factor)?.toString() : '0'));
                return tx && ty;
            });
    }

            
    // This Function needs to be called whenever Data is Added
    function UpdateData() {
        // Set x scale range based on the number of enabled units

        if (enabledUnits?.length > 2)
            xScaleRef.current.range([120, props.width - 110]);
        if (enabledUnits?.length > 3)
            xScaleRef.current.range([120, props.width - 170]);


        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        let lines = container.select(".DataContainer").selectAll(".Line").data(lineData);

        lines.enter().append("path").classed(`Line`, true)
            .attr("type", d => `${d.Unit}`)
            .attr("stroke", d => (Object.keys(colors).indexOf(d.Color) > -1 ? colors[d.Color] : colors.random))
            .attr("stroke-dasharray", d => singlePlot && evtID !== d.EventID ? 5 : 0)
            .attr("d", d => {
                let lineGen = createLineGen(d.Unit)
                if (d.SmoothDataPoints.length > 0)
                    return lineGen.curve(d3.curveNatural)(d.SmoothDataPoints);
                return lineGen(d.DataPoints);
            })
            
        lines.exit().remove();

        let points = container.select(".DataContainer").selectAll(".Markers")
            .data(lineData)
            .enter()
            .append("g")
            .attr("fill", d => (Object.keys(colors).indexOf(d.Color) > -1 ? colors[d.Color] : colors.random))
            .classed("Markers", true)
            .selectAll("circle")
            .data(d => d.DataMarker.map(v => ({
                    x: v[0], y: v[1], unit: d.Unit as string, base: d.BaseValue
            }) as IMarker)
            );


        points.enter()
            .append("circle")
            .classed("Circle", true)
            .attr("cx", d => isNaN(xScaleRef.current(d[0])) ? null : xScaleRef.current(d.x))
            .attr("cy", d => isNaN(yScaleRef.current[d.unit](d[1])) ? null : yScaleRef.current[d.unit](d.y))
            .attr("r", 10);


        points.exit().remove();

        updateLimits();
        updateDurationWindow();
    }


    // This Function should be called anytime the Scale changes as it will adjust the Axis, Path and Points
    function updateLimits() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        let svg = container.select(".DataContainer");

        svg.selectAll(".Line").attr("d", function (d: OpenSee.iD3DataSeries) {
            const scopedLineGen = createLineGen(d.Unit, d.BaseValue);
            if (d.SmoothDataPoints.length > 0)
                return scopedLineGen.curve(d3.curveNatural)(d.SmoothDataPoints);
            return scopedLineGen(d.DataPoints);
        });

        svg.selectAll("circle")
            .attr("cx", function (d: IMarker) {
                return isNaN(xScaleRef.current(d.x)) ? null : xScaleRef.current(d.x);
            })
            .attr("cy", function (d: IMarker) {
                let factor: number = 1.0;
                if (activeUnit?.[d.unit] != undefined)
                    factor = activeUnit?.[d.unit].factor === undefined ? (1.0 / d.base) : factor;

                return isNaN(yScaleRef.current[d.unit](d.y)) ? null : yScaleRef.current[d.unit](d.y * factor);
            });

        updateYAxises()
        updateLabels();

        //Format Time Axis with current xScale
        container.selectAll(".xAxis").transition().call(d3.axisBottom(xScaleRef.current).tickFormat(d => formatTimeTick(d as number)) as any);

        if (xScaleRef.current != null && showFFT) {
            setCurrentFFTWindow([(xScaleRef.current(fftWindow[0])), (xScaleRef.current(fftWindow[1]))]);
    }

    }

    function createPlot() {
        d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId + ">svg").select("g.root").remove()

        let svg = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId).select("svg")
            .append("g").classed("root", true)
            .attr("transform", "translate(10,0)");

        // Everything should start at 40, 20 except the div for overlay...
        //Update x/y scales
        if (yLimits) {
            Object.keys(yLimits).forEach(unit => {
                if (yLimits?.[unit])
                    yScaleRef.current[unit] = d3.scaleLinear().domain(yLimits?.[unit]).range([props.height - 40, 20]);
                else
                    yScaleRef.current[unit] = d3.scaleLinear().domain([0, 1]).range([props.height - 40, 20]);
            })
        }

            xScaleRef.current = d3.scaleLinear().domain([startTime, endTime]).range([60, props.width - 110])

        //Create xAxis
        svg.append("g").classed("xAxis", true).attr("transform", "translate(0," + (props.height - 40) + ")").call(d3.axisBottom(xScaleRef.current).tickFormat((d, i) => formatTimeTick(d as number)));

        let isAxisLeft = true;
        let axisCount = 0;

        //Create yAxises that have enabled Units
        enabledUnits.forEach(unit => {
            let axisTransform = isAxisLeft ? "translate(60,0)" : `translate(${props.width - 110},0)`;
            
            svg.append("g")
                .classed(`yAxis`, true)
                .attr("type", `${unit}`)
                .attr("transform", axisTransform)
                .call(isAxisLeft ? d3.axisLeft(yScaleRef.current[unit]).tickFormat(d => formatValueTick(d as number, unit)) : d3.axisRight(yScaleRef.current[unit]).tickFormat(d => formatValueTick(d as number, unit)))
                .style("opacity", 1)

            // Create axis label
            let labelYPos = isAxisLeft ? 2 : props.width - 70;

            svg.append("text")
                .classed(isAxisLeft ? `yAxisLabelLeft` : `yAxisLabelRight`, true)
                .attr("type", `${unit}`)
            .attr("x", - (props.height / 2 - 20))
                .attr("y", labelYPos)
            .attr("dy", "1em")
                .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
                .style("opacity", 1)
                .text(yLabels[unit]);

            isAxisLeft = !isAxisLeft;
            axisCount++;


        });

        //Create Axis Labels
        svg.append("text").classed("xAxisLabel", true)
            .attr("transform", "translate(" + ((props.width - 210) / 2 + 60) + " ," + (props.height - 5) + ")")
            .style("text-anchor", "middle")
            .text("Time");

        // Create Plot Title
        svg.append("text").classed("plotTitle", true)
            .attr("transform", "translate(" + ((props.width - 210) / 2 + 60) + ", 20)")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text(GetDisplayLabel(props.dataKey.DataType));

        setTooltipLocation(10);

        //Add Clip Path
        svg.append("defs").append("svg:clipPath")
            .attr("id", "clipData-" + props.dataKey.DataType + "-" + props.dataKey.EventId)
            .append("svg:rect").classed("clip", true)
            .attr("width", props.width - 170)
            .attr("height", props.height - 60)
            .attr("x", 60)
            .attr("y", 20);

        //Add Window to indicate Zooming
        svg.append("rect").classed("zoomWindow", true)
            .attr("stroke", "#000")
            .attr("x", 60).attr("width", 0)
            .attr("y", 20).attr("height", props.height - 60)
            .attr("fill", "black")
            .style("opacity", 0);

        //Add Window to indicate Inception and Duration of event
        svg.append("rect").classed("DurationWindow", true)
            .attr("clip-path", "url(#clipData-" + props.dataKey.DataType + "-" + props.dataKey.EventId + ")")
            .attr("stroke", "#d3d3d3")
            .attr("x", xScaleRef.current(eventInfo?.Inception))
            .attr("width", eventInfo?.DurationEndTime - eventInfo?.Inception)
            .style("opacity", (plotMarkers ? 0.25 : 0))
                .attr("y", 20).attr("height", props.height - 60)
                .attr("fill", "black")

        //Add Empty group for Data Points
        svg.append("g").classed("DataContainer", true)
            .attr("clip-path", "url(#clipData-" + props.dataKey.DataType + "-" + props.dataKey.EventId + ")")
            .style("transition", 'd 0.5s')
            .attr("fill", "none")
            .attr("stroke-width", 0.0);

        //Event overlay - needs to be treated seperately
        svg.append("svg:rect").classed("Overlay", true)
            .attr("width", props.width - 110)
            .attr("height", '100%')
            .attr("x", 20)
            .attr("y", 0)
            .style("opacity", 0)
            .on('mousemove', (evt) => MouseMove(evt))
            .on('mouseout', () => MouseOut())
            .on('mousedown', (evt) => MouseDown(evt))
            .on('mouseup', () => MouseUp())
            .on('mouseenter', () => { setLeftSelectCounter(1) })
            .call(wheelZoom)
            .on('wheel', (evt) => evt.preventDefault());


        //Window to indicate FFT -- this needs to be placed after the Event Overlay so it can capture mouseEvents
        if (props.dataKey.DataType == 'Voltage' || props.dataKey.DataType == 'Current')
            svg.append("rect").classed("fftWindow", true)
                .attr("clip-path", "url(#clipData-" + props.dataKey.DataType + "-" + props.dataKey.EventId + ")")
                .attr("stroke", "#000")
                .style("z-index", 9999)
                .attr("x", xScaleRef.current(fftWindow[0]))
                .attr("width", currentFFTWindow[1] - currentFFTWindow[0])
                .style("opacity", (showFFT ? 0.5 : 0))
                .style('cursor', (mouseMode === 'fftMove' && showFFT ? 'grab' : 'default'))
                .attr("y", 20).attr("height", props.height - 60)
                .attr("fill", "black")
                .on('mousemove', (evt) => MouseMove(evt))
                .on('mousedown', (evt) => FFTMouseDown(evt))
                .on('mouseup', () => setFFTMouseDown(false))

    }


    function formatTimeTick(d: number) {
        let TS = moment(d);
        let h = 100;

        if (xScaleRef.current != undefined)
            h = xScaleRef.current.domain()[1] - xScaleRef.current.domain()[0]

        if (isOverlappingWaveform) {
            if (defaultSettings.OverlappingWaveTimeUnit.options[overlappingWaveTimeUnit].short === "ms") {
                if (h < 2)
                    return d.toFixed(3)
                if (h < 5)
                    return d.toFixed(2)
                else
                    return d.toFixed(1)
            } else if (defaultSettings.OverlappingWaveTimeUnit.options[overlappingWaveTimeUnit].short === "cycles") {
                const cyc = d * 60.0 / 1000.0;
                h = h * 60.0 / 1000.0;
                if (h < 2)
                    return cyc.toFixed(3)
                if (h < 5)
                    return cyc.toFixed(2)
                else
                    return cyc.toFixed(1)
            }
        
        }
        else if (timeUnit.options[timeUnit.current].short == 'auto') {
            if (h < 100)
                return TS.format("SSS.S")
            else if (h < 1000)
                return TS.format("ss.SS")
            else
                return TS.format("ss.S")
        }
        else if (timeUnit.options[timeUnit.current].short == 's') {
            if (h < 100)
                return TS.format("ss.SSS")
            else if (h < 1000)
                return TS.format("ss.SS")
            else
                return TS.format("ss.S")
        }
        else if (timeUnit.options[timeUnit.current].short == 'ms')
            if (h < 100)
                return TS.format("SSS.S")
            else
                return TS.format("SSS")

        else if (timeUnit.options[timeUnit.current].short == 'min')
            return TS.format("mm:ss")

        else if (timeUnit.options[timeUnit.current].short == 'ms since record') {
            let ms = d - originalStartTime;

            if (useRelevantTime && !isOriginalEvt) {
                const evt = overlappingEvents.find(evt => evt.EventID === props.dataKey.EventId)
                ms = d - evt.StartTime
            }

            if (h < 2)
                return ms.toFixed(3)
            if (h < 5)
                return ms.toFixed(2)
            else
                return ms.toFixed(1)
        }

        else if (timeUnit.options[timeUnit.current].short == 'ms since inception') {
            let ms = d - (new Date(eventInfo?.InceptionDate + "Z").getTime());

            if (useRelevantTime && !isOriginalEvt) {
                const evt = overlappingEvents.find(evt => evt.EventID === props.dataKey.EventId)
                ms = d - (new Date(evt.InceptionDate + "Z").getTime())
            }

            if (h < 2)
                return ms.toFixed(3)
            if (h < 5)
                return ms.toFixed(2)
            else
                return ms.toFixed(1)
        }

        else if (timeUnit.options[timeUnit.current].short == 'cycles since record') {
            let cyc = (d - startTime) * 60.0 / 1000.0;

            h = h * 60.0 / 1000.0;
            if (h < 2)
                return cyc.toFixed(3)
            if (h < 5)
                return cyc.toFixed(2)
            else
                return cyc.toFixed(1)
        }
        else if (timeUnit.options[timeUnit.current].short == 'cycles since inception') {
            let cyc = (d - startTime) * 60.0 / 1000.0;

            h = h * 60.0 / 1000.0;
            if (h < 2)
                return cyc.toFixed(3)
            if (h < 5)
                return cyc.toFixed(2)
            else
                return cyc.toFixed(1)
        }
    }

    function formatValueTick(d: number, unit: OpenSee.Unit) {
        let h = 1;

        if (yScaleRef.current)
            h = yScaleRef.current[unit].domain()[1] - yScaleRef.current[unit].domain()[0]

        if (Math.abs(d) >= 100000) {
            return d.toString().slice(0, 4) + '...';
        }

        if (h > 100)
            return d.toFixed(0)

        if (h > 10)
            return d.toFixed(1)
        else
            return d.toFixed(2)

    }

    function MouseMove(evt) {

        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        let x0 = d3.pointer(evt, container.select(".Overlay").node())[0];
        let y0 = d3.pointer(evt, container.select(".Overlay").node())[1];

        if (x0 < 60)
            x0 = 60;
        if (x0 > (props.width - 140))
            x0 = props.width - 140;

        if (y0 < 20)
            y0 = 20;
        if (y0 > (props.height - 40))
            y0 = props.height - 40;

        let t0 = xScaleRef.current.invert(x0)
        let d0 = yScaleRef.current[primaryAxis].invert(y0);
        setHover([t0, d0])
    }

    function MouseDown(evt) {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        let x0 = d3.pointer(evt, container.select(".Overlay").node())[0];
        let y0 = d3.pointer(evt, container.select(".Overlay").node())[1];

        let t0 = xScaleRef.current.invert(x0);
        let d0 = yScaleRef.current[primaryAxis].invert(y0);

        setMouseDown(true);
        setPointMouse([t0, d0]);

        if (isOverlappingWaveform)
            return;

        if (x0 > 60 && x0 < props.width - 140 && mouseMode === 'select')
            dispatch(SetSelectPoint({ time: t0, key: props.dataKey }));

        setOldFFTWindow(() => {
            return fftWindow
        });

    }

    function FFTMouseDown(evt) {
        setFFTMouseDown(true);

        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        let x0 = d3.pointer(evt, container.select(".Overlay").node())[0];
        let y0 = d3.pointer(evt, container.select(".Overlay").node())[1];

        let t0 = xScaleRef.current.invert(x0);
        let d0 = yScaleRef.current[primaryAxis].invert(y0);

        setPointMouse([t0, d0]);

        setOldFFTWindow(() => {
            return fftWindow
        });

    }

    function MouseUp() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        setMouseDown(false);
        container.select(".zoomWindow").style("opacity", 0)
    }

    // This function needs to be called if hover is updated
    function updateHover() {
        
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        if (xScaleRef.current == undefined || yScaleRef.current == undefined)
            return;

        //container.select(".toolTip").attr("x1", xScaleRef.current(hover[0]))
        //    .attr("x2", xScaleRef.current(hover[0]));

        if (mouseMode == 'zoom' && mouseDown) {
            if (zoomMode == "x")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", xScaleRef.current(Math.min(hover[0], pointMouse[0])))
                    .attr("width", Math.abs(xScaleRef.current(hover[0]) - xScaleRef.current(pointMouse[0])))
                    .attr("height", props.height - 60)
                    .attr("y", 20)
            else if (zoomMode == "y")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", xScaleRef.current(startTime))
                    .attr("width", xScaleRef.current(endTime) - xScaleRef.current(startTime))
                    .attr("height", Math.abs(yScaleRef.current[primaryAxis](pointMouse[1]) - yScaleRef.current[primaryAxis](hover[1])))
                    .attr("y", Math.min(yScaleRef.current[primaryAxis](pointMouse[1]), yScaleRef.current[primaryAxis](hover[1])))
            else if (zoomMode == "xy")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", xScaleRef.current(Math.min(hover[0], pointMouse[0])))
                    .attr("width", Math.abs(xScaleRef.current(hover[0]) - xScaleRef.current(pointMouse[0])))
                    .attr("height", Math.abs(yScaleRef.current[primaryAxis](pointMouse[1]) - yScaleRef.current[primaryAxis](hover[1])))
                    .attr("y", Math.min(yScaleRef.current[primaryAxis](pointMouse[1]), yScaleRef.current[primaryAxis](hover[1])))
        }

        let deltaT = hover[0] - pointMouse[0];
        let deltaData = hover[1] - pointMouse[1];

        if (mouseMode === 'pan' && mouseDown && (zoomMode === "x" || zoomMode === "xy")) {
                if (!isOverlappingWaveform) {
            dispatch(SetTimeLimit({ start: (startTime - deltaT), end: (endTime - deltaT) }));
                } else if (isOverlappingWaveform) {
            dispatch(SetCycleLimit({ start: (startTime - deltaT), end: (endTime - deltaT) }));
        }
        }

        if (mouseMode === 'pan' && mouseDown && (zoomMode === "y" || zoomMode === "xy")) {
            dispatch(SetZoomedLimits({ limits: [(yLimits[primaryAxis][0] - deltaData), (yLimits[primaryAxis][1] - deltaData)], key: props.dataKey }));
        }
        

        if (mouseMode == 'fftMove' && fftMouseDown && pointMouse[0] < oldFFTWindow[1] && pointMouse[0] > oldFFTWindow[0]) {
            setCurrentFFTWindow([xScaleRef.current(oldFFTWindow[0] + hover[0] - pointMouse[0]), xScaleRef.current(oldFFTWindow[1] + hover[0] - pointMouse[0])])
        }

    }

    function updateFFTWindow() {
        if (props.dataKey.DataType != 'Voltage' && props.dataKey.DataType != 'Current')
            return;

        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        if (xScaleRef.current == undefined || yScaleRef.current == undefined)
            return;

        container.select(".fftWindow")
            .attr("x", currentFFTWindow[0])
            .attr("width", currentFFTWindow[1] - currentFFTWindow[0])
            .style("opacity", (showFFT ? 0.5 : 0))
            .style('cursor', (mouseMode === 'fftMove' && showFFT ? 'grab' : 'default'))

    }

    function updateYAxises() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        //Flag to alternate axis placement
        if (container === undefined)
            return

        let isAxisLeft = true; //this can just be exchanged for a % 2 since we have a counter now.
        let currentAxis = 0;

        //Update yAxises
        enabledUnits?.forEach(unit => {
            let axisType = `[type='${unit}']`;
            let firstLeftAxisType = `[type='${enabledUnits[0]}']`
            let firstRightAxisType = `[type='${enabledUnits[1]}']`

            if (isAxisLeft) {
                if (currentAxis > 1) {
                    container.selectAll(`.yAxis${firstLeftAxisType}`).attr("transform", "translate(120, 0)")
                    container.selectAll(`.yAxisLabelLeft${firstLeftAxisType}`).attr("y", "62")
                }
                container.selectAll(`.yAxis${axisType}`).transition().call(d3.axisLeft(yScaleRef.current[unit]).tickFormat(d => formatValueTick(d as number, unit)) as any);
            }
            else {
                if (currentAxis > 2) {
                    container.selectAll(`.yAxis${firstRightAxisType}`).attr("transform", `translate(${props.width - 170},0)`)
                    container.selectAll(`.yAxisLabelRight${firstRightAxisType}`).attr("y", props.width - 135)
                }
                container.selectAll(`.yAxis`).selectAll(`[type='${unit}']`).transition().call(d3.axisRight(yScaleRef.current[unit]).tickFormat(d => formatValueTick(d as number, unit)) as any);
            }

            isAxisLeft = !isAxisLeft;
            currentAxis++;


        });


        if (enabledUnits.length < 3)
            return

        let clipPath = container.select(`#clipData-${props.dataKey.DataType}-${props.dataKey.EventId} > rect`)
        let evtOverlay = container.select(`rect.Overlay`)

        if (enabledUnits.length === 3) {
            clipPath.attr("x", 120).attr("width", props.width - 270)
            evtOverlay.attr("x", 120).attr("width", props.width - 270)
        }
        else if (enabledUnits.length === 4) {
            clipPath.attr("x", 120).attr("width", props.width - 210 - 120)
            evtOverlay.attr("x", 120).attr("width", props.width - 210 - 120)
        }

    }

    function updateDurationWindow() {
        if (xScaleRef.current === undefined)
            return;

        setInceptionLocation(xScaleRef.current(eventInfo?.Inception))
        setDurationLocation(xScaleRef.current(eventInfo?.DurationEndTime))

        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        let width = 1
        let x = 1

        width = xScaleRef.current(eventInfo?.DurationEndTime) - xScaleRef.current(eventInfo?.Inception)
        x = xScaleRef.current(eventInfo?.Inception)


        container.select(".DurationWindow")
            .attr("x", x)
            .attr("width", width)
            .style("opacity", (plotMarkers ? 0.25 : 0))
    }

    const wheelZoom = d3.zoom() //probably could include panning in here...
        .filter(event => {
            return event.type === 'wheel';
        })
        .on("zoom", (event) => {
            //need to scale here whenever since inception is enabled and overlapping stuff..
            let newTime = event.transform.rescaleX(xScaleRef.current).domain();
            let newYLimits = event.transform.rescaleX(yScaleRef.current[primaryAxis]).domain();

            if (mouseMode == 'zoom' && zoomMode == "x" && !isOverlappingWaveform)
                dispatch(SetTimeLimit({ start: newTime[0], end: newTime[1] }))

            if (mouseMode == 'zoom' && zoomMode == "y" && !isOverlappingWaveform)
                dispatch(SetZoomedLimits({ limits: newYLimits, key: props.dataKey }))

            if (mouseMode == 'zoom' && zoomMode == "xy" && !isOverlappingWaveform) {
                dispatch(SetTimeLimit({ start: newTime[0], end: newTime[1] }))
                dispatch(SetZoomedLimits({ limits: newYLimits, key: props.dataKey }))
    }

        });

    function MouseOut() {
        setLeftSelectCounter(() => -1);
    }

    // Mouse Left only get's called if we left for a minimum of time
    function MouseLeft() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        container.select(".zoomWindow").style("opacity", 0);
        setMouseDown(false);
    }

    //This function needs to be called whenever (a) Unit Changes (b) Data Changes (c) Data Visibility changes (d) Limits change (due to auto Units)s
    function updateLabels() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        function GetTLabel() {
            let h = 100;
            if (xScaleRef.current != undefined)
                h = xScaleRef.current.domain()[1] - xScaleRef.current.domain()[0]


            if ((timeUnit as OpenSee.IUnitSetting).options[timeUnit.current].short != 'auto' && !isOverlappingWaveform)
                return (timeUnit as OpenSee.IUnitSetting).options[timeUnit.current].short;

            if (isOverlappingWaveform) {
                if (h < 100)
                    return "ms"
                else
                    return "s"
            }

            if ((timeUnit as OpenSee.IUnitSetting).options[timeUnit.current].short == 'ms since event')
                return "ms";
            if ((timeUnit as OpenSee.IUnitSetting).options[timeUnit.current].short == 'cycles')
                return "cycle"
            if (h < 100)
                return "ms"
            else
                return "s"
        }

        container.select(".xAxisLabel").text("Time (" + GetTLabel() + ")")
    }

    //This Function needs to be called whenever (a) Color Setting changes occur
    function updateColors() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        function GetColor(col: OpenSee.Color) {
                return colors[col as string]
        }

        container.select(".DataContainer").selectAll(".Line").attr("stroke", (d: OpenSee.iD3DataSeries) => GetColor(d.Color));
        container.select(".DataContainer").selectAll(".Markers").attr("fill", (d: OpenSee.iD3DataSeries) => GetColor(d.Color));
    }

    //This Function needs to be called whenever a item is selected or deselected in the Legend
    function updateVisibility() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        // Update line visibility for each unit
        container.selectAll(`.Line`).data(lineData)
            .classed("active", d => d.Enabled)
            .attr("stroke-width", d => d.Enabled ? 2.5 : 0);

        // Update markers for primary lines
        container.selectAll(`.Markers`).data(lineData)
            .classed("active", d => d.Enabled)
            .attr("opacity", d => d.Enabled ? 1.0 : 0);


        // Update axis visibility based on whether the unit is enabled
        let isAxisLeft = true;

        relevantUnits.forEach(unit => {
            let enabledUnit = enabledUnits?.includes(unit);
            let axisType = `[type='${unit}']`;
            if (enabledUnit) {
                container.selectAll(`.yAxis${axisType}`).style("opacity", 1);
                container.selectAll(`.yAxisLabel${axisType}`).style("opacity", 1);
            } else {
                container.selectAll(`.yAxis${axisType}`).remove();
                container.selectAll(`.yAxisLabel${axisType}`).remove();
            }

            isAxisLeft = !isAxisLeft;
        })

    }

    // This Function needs to be called whenever height or width change
    function updateSize() {

        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        container.select(".xAxisLabel").attr("transform", "translate(" + ((props.width - 210) / 2 + 60) + " ," + (props.height - 5) + ")")
        container.select(".plotTitle").attr("transform", "translate(" + ((props.width - 210) / 2 + 60) + ",20)").style("font-weight", "bold")

        //this is gonna have to change for the addition of more than 2 axises
        container.select(".yAxisLabelLeft").attr("x", - (props.height / 2 - 20))
        container.select(".yAxisLabelRight").attr("y", props.width - 120).attr("x", - (props.height / 2 - 20))

        let isAxisLeft = true;
        relevantUnits.forEach(unit => {
            //Update yScale
            yScaleRef.current[unit].range([props.height - 40, 20]);

            let axisType = `[type='${unit}']`;
            let axisTransform = isAxisLeft ? "translate(60,0)" : `translate(${props.width - 110},0)`;

            if (isAxisLeft)
                container.selectAll(`.yAxis${axisType}`).attr("transform", axisTransform);
            else
                container.selectAll(`.yAxis${axisType}`).attr("transform", axisTransform);

            isAxisLeft = !isAxisLeft;
        })


        // Set x scale range based on the number of enabled units
        xScaleRef.current.range([60, props.width - 110]);

        if (enabledUnits?.length > 2) {
            xScaleRef.current.range([120, props.width - 110]);
        } else if (enabledUnits?.length > 3) {
            xScaleRef.current.range([120, props.width - 170]);
        }

        container.select(".xAxis").attr("transform", "translate(0," + (props.height - 40) + ")")

        container.select(".clip").attr("width", props.width - 110).attr("height", props.height - 60)
        container.select(".fftwindow").attr("height", props.height - 60);
        container.select(".Overlay").attr("width", props.width - 110)
        updateLimits();
    }

    // Helper Function
    function GetTextWidth(font: string, fontSize: string, word: string): number {

        const text = document.createElement("span");
        document.body.appendChild(text);

        text.style.font = font;
        text.style.fontSize = fontSize;
        text.style.height = 'auto';
        text.style.width = 'auto';
        text.style.position = 'absolute';
        text.style.whiteSpace = 'no-wrap';
        text.innerHTML = word;

        const width = Math.ceil(text.clientWidth);
        document.body.removeChild(text);
        return width;
    } 

    return (
        <div>
            <Container key={props.dataKey.DataType + props.dataKey.EventId + 'container'} dataKey={props.dataKey} height={props.height} loading={loading} hover={toolTipLocation} hasData={lineData?.length > 0} hasTrace={enabledLine?.some(i => i)}
                selectedPointLocation={selectedPointLocation} showToolTip={props.showToolTip} inceptionLocation={inceptionLocation} durationLocation={durationLocation} plotMarkers={plotMarkers} />
            {loading === 'Loading' || lineData?.length == 0 ? null : <Legend key={props.dataKey.DataType + props.dataKey.EventId + 'legend'} height={props.height} dataKey={props.dataKey} />}
        </div>
    );
}


const Container = React.memo((props: {
    height: number, dataKey: OpenSee.IGraphProps, loading: OpenSee.LoadingState, hover: number, hasData: boolean,
    hasTrace: boolean, selectedPointLocation: number, showToolTip: boolean, inceptionLocation: number, durationLocation: number, plotMarkers: boolean
}) => {
    const showSVG = props.loading != 'Loading' && props.hasData;
    return (
        <div data-drawer={"graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId} id={"graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId} style={{ height: props.height, width: '100%' }}>
            {props.loading === 'Loading' ? <LoadingIcon /> : null}
            {props.loading != 'Loading' && !props.hasData ? <NoDataIcon /> : null}

        <svg className="root" style={{ width: (showSVG ? '100%' : 0), height: (showSVG ? '100%' : 0) }}>
                { /*PolyLine for the mouse position*/}
                {props.loading !== 'Loading' && props.hasData ? <PolyLine class={"hover"} key={'hover'} height={props.height - 40} left={props.hover} style={{ stroke: "#000", opacity: 0.5 }} /> : null}
                { /*PolyLine for the position of Selected Point*/}
                {props.showToolTip && props.selectedPointLocation ? <PolyLine class={"selectedPoint"} key={'selectedPoint'} height={props.height - 40} left={props.selectedPointLocation} style={{ stroke: "#000", opacity: 1, strokeDasharray: "5,5" }} /> : null}

                { /*PolyLine for the inception of the event*/}
                {props.loading !== 'Loading' && props.hasData && props.plotMarkers ? <PolyLine class={"inception"} key={'inception'} height={props.height - 40} left={props.inceptionLocation} style={{ stroke: "#a30000", strokeDasharray: "5,5", opacity: 0.5 }} /> : null}
                { /*PolyLine for the end of the duration of the event*/}
                {props.loading !== 'Loading' && props.hasData && props.plotMarkers ? <PolyLine class={"duration"} key={'duration'} height={props.height - 40} left={props.durationLocation} style={{ stroke: "#a30000", strokeDasharray: "5,5", opacity: 0.5 }} /> : null}

            {props.loading != 'Loading' && props.hasData && !props.hasTrace ?
                <text x={'50%'} y={'45%'} style={{ textAnchor: 'middle', fontSize: 'x-large' }} > Select a Trace in the Legend to Display. </text> : null}
        </svg>
        </div>
    )
})

const PolyLine = (props: { height: number, left: number, style: React.CSSProperties, class: string }) => {
    return (
        <g className={props.class} >
            <polyline className="polyLine" points={`${props.left + 10},20 ${props.left + 10},${props.height}`} style={props.style} />
        </g>
    )
}

export default LineChart;

