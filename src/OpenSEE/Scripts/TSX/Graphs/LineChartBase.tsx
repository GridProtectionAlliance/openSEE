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
import { uniq } from "lodash";
import * as d3 from "d3";
import { OpenSee } from '../global';

import moment from "moment"
import Legend from './LegendBase';
import { useSelector, useDispatch } from 'react-redux';
import { selectColor, selectActiveUnit, selectTimeUnit, selectSnap } from '../store/settingSlice'
import { selectData, selectEnabled, selectStartTime, selectEndTime, selectLoading, selectYLimits, selectHover, SetHover, SelectPoint, selectMouseMode, SetTimeLimit, selectZoomMode, SetYLimits, selectCycleStart, selectCycleEnd, SetCycleLimit } from '../store/dataSlice';
import { selectAnalyticOptions, selectCycles, selectFFTWindow, selectShowFFTWindow, SetFFTWindow } from '../store/analyticSlice';
import { LoadingIcon, NoDataIcon } from './ChartIcons';
import { GetDisplayLabel } from './Utilities';



interface iProps {   
    type: OpenSee.graphType,
    eventId: number,
    height: number,
    width: number,
    eventStartTime: number,
    timeLabel: string,
};

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
    const dataKey: OpenSee.IGraphProps = { DataType: props.type, EventId: props.eventId };
    const SelectActiveUnitInstance = React.useMemo(() => selectActiveUnit(dataKey), [props.eventId, props.type])
    const selectAnalyticOptionInstance = React.useMemo(() => selectAnalyticOptions(props.type), [props.type])

    const selectStartTimeInstance = React.useMemo(() => (props.type == 'OverlappingWave' ? selectCycleStart : selectStartTime), [props.type])

    const selectEndTimeInstance = React.useMemo(() => (props.type == 'OverlappingWave' ? selectCycleEnd : selectEndTime), [props.type])

    const SelectData = React.useMemo(() => selectData(dataKey), [props.eventId, props.type]);
    const SelectEnabled = React.useMemo(() => selectEnabled(dataKey), [props.eventId, props.type]);
    const SelectYLimits = React.useMemo(() => selectYLimits(dataKey), [props.eventId, props.type]);

    const xScaleRef = React.useRef<any>();
    const yScaleRef = React.useRef<any>();

    //const [xScale, setXscale] = React.useState<any>(null);
    //const [yScale, setYscale] = React.useState<any>(null);

    const [isCreated, setCreated] = React.useState<boolean>(false);
    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    const [mouseDownInit, setMouseDownInit] = React.useState<boolean>(false);
    const [pointMouse, setPointMouse] = React.useState<[number, number]>([0, 0]);

    const [toolTipLocation, setTooltipLocation] = React.useState<number>(10);
    

    const lineData = useSelector(SelectData);
    const enabledLine = useSelector(SelectEnabled);

    const startTime = useSelector(selectStartTimeInstance);
    const endTime = useSelector(selectEndTimeInstance);
    const yLimits = useSelector(SelectYLimits);

    const loading = useSelector(selectLoading(dataKey));

    const colors = useSelector(selectColor);
    const timeUnit = useSelector(selectTimeUnit);
    const activeUnit = useSelector(SelectActiveUnitInstance);
    const snapToPoint = useSelector(selectSnap);
    const mouseMode = useSelector(selectMouseMode);
    const zoomMode = useSelector(selectZoomMode);

    const fftWindow = useSelector(selectFFTWindow);
    const showFFT = useSelector(selectShowFFTWindow);

    const hover = useSelector(selectHover);
    const options = useSelector(selectAnalyticOptionInstance);
    const fftCycles = useSelector(selectCycles);
    const [oldFFTWindow, setOldFFTWindow] = React.useState<[number,number]>([0, 0]);

    const [leftSelectCounter, setLeftSelectCounter] = React.useState<number>(0);

    const dispatch = useDispatch();

    //Effect to update the Data 
    React.useEffect(() => {
        if (loading == 'Loading')
            return;
        if (lineData.length == 0)
            return;
        if (isCreated) {
            UpdateData();
            return () => { };
        }

        createPlot();
        UpdateData();
        updateVisibility();
        setCreated(true);
        //setSelectedPoints([]);
        return () => {}
    }, [lineData, loading]);

    //Effect to adjust Axes Labels when Scale changes
    React.useEffect(() => {
        if (yScaleRef.current != undefined && xScaleRef.current != undefined)
            updateSize();

    }, [props.height, props.width])

    React.useEffect(() => {
        updateVisibility();
    }, [enabledLine])

    //Effect to change location of tool tip
    React.useEffect(() => {
        if (xScaleRef.current != undefined)
            setTooltipLocation(xScaleRef.current(hover[0]))
        updateHover();
        return () => { };
    }, [hover])

    // For performance Combine a bunch of Hooks that call updateLimits() since that is what re-renders the Lines
    //Effect to adjust Axes when Units change
    React.useEffect(() => {
        if (yScaleRef.current == undefined || xScaleRef.current == undefined)
            return;

        yScaleRef.current.domain(yLimits);
        xScaleRef.current.domain([startTime, endTime])
        
        updateLimits();


    }, [activeUnit, yLimits, startTime, endTime])

    React.useEffect(() => {

        if (leftSelectCounter == 0)
            return;
        if (leftSelectCounter == 1)
            return;
        let handle = setTimeout(() => { MouseLeft(); }, 500);
        return () => { clearTimeout(handle) };
    }, [leftSelectCounter])
    

    React.useEffect(() => {
        if (!mouseDownInit) {
            setMouseDownInit(true);
            return;
        }
        if (!mouseDown && mouseMode == 'zoom' && zoomMode == "x" && props.type != 'OverlappingWave')
            dispatch(SetTimeLimit({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
        if (!mouseDown && mouseMode == 'zoom' && zoomMode == "x" && props.type == 'OverlappingWave')
            dispatch(SetCycleLimit({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "y")
            dispatch(SetYLimits({ max: Math.max(pointMouse[1], hover[1]), min: Math.min(pointMouse[1], hover[1]), key: dataKey }))
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "xy" && props.type != 'OverlappingWave') {
            dispatch(SetTimeLimit({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
            dispatch(SetYLimits({ max: Math.max(pointMouse[1], hover[1]), min: Math.min(pointMouse[1], hover[1]), key: dataKey }))
        }
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "xy" && props.type == 'OverlappingWave') {
            dispatch(SetCycleLimit({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
            dispatch(SetYLimits({ max: Math.max(pointMouse[1], hover[1]), min: Math.min(pointMouse[1], hover[1]), key: dataKey }))
        }
    }, [mouseDown])

    React.useEffect(() => {
        updateColors();
    }, [colors])

    React.useEffect(() => {
        updateFFTWindow()
    }, [fftWindow, showFFT])

    //This Clears the Plot if loading is activated
    React.useEffect(() => {
        d3.select("#graphWindow-" + props.type + "-" + props.eventId + ">svg").select("g.root").remove()

        if (loading == 'Loading') {
            setCreated(false);
            return;
        }
        if (lineData.length == 0) {
            setCreated(false);
            return;
        }

        createPlot();
        UpdateData();
        updateVisibility();

        return () => {}
      
    }, [props.type, props.eventId, options]);

    // This Function needs to be called whenever Data is Added
    function UpdateData() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        let lineGen = d3.line()
            .x(function (d) { return 0 })
            .y(function (d) { return 0 })
           

        if (xScaleRef.current != undefined && yScaleRef.current != undefined)
            lineGen = d3.line()
                .x(function (d) { return xScaleRef.current(d[0]) })
                .y(function (d) { return yScaleRef.current(d[1]) })
                .defined(function (d) {
                    let tx = !isNaN(parseFloat(xScaleRef.current(d[0])));
                    let ty = !isNaN(parseFloat(yScaleRef.current(d[1])));
                    tx = tx && isFinite(parseFloat(xScaleRef.current(d[0])));
                    ty = ty && isFinite(parseFloat(yScaleRef.current(d[1])));
                    return tx && ty
                })

        container.select(".DataContainer").selectAll(".Line").data(lineData).enter().append("path").classed("Line", true)
            .attr("fill", "none")
            .attr("stroke-width", 0.0)
            .attr("stroke", (d) => (Object.keys(colors).indexOf(d.Color) > -1 ? colors[d.Color] : colors.random))
            .attr("stroke-dasharray", (d) => (d.LineType == undefined || d.LineType == "-"? 0 : 5))
            .attr("d", function (d) {
                return lineGen(d.DataPoints)
            })

        container.select(".DataContainer").selectAll(".Line").data(lineData).exit().remove();
        updateLimits();

    }

    function createPlot() {
        d3.select("#graphWindow-" + props.type + "-" + props.eventId + ">svg").select("g.root").remove()

        let svg = d3.select("#graphWindow-" + props.type + "-" + props.eventId).select("svg")
            .append("g").classed("root", true)
                .attr("transform", "translate(40,10)");

        // Now Create Axis
        yScaleRef.current = d3.scaleLinear()
            .domain(yLimits)
            .range([props.height - 60, 0]);

        xScaleRef.current = d3.scaleLinear()
            .domain([startTime, endTime])
            .range([20, props.width - 280]);

        svg.append("g").classed("yAxis", true).attr("transform", "translate(20,0)").call(d3.axisLeft(yScaleRef.current).tickFormat((d, i) => formatValueTick(d)));
        svg.append("g").classed("xAxis", true).attr("transform", "translate(0," + (props.height - 60) + ")").call(d3.axisBottom(xScaleRef.current).tickFormat((d, i) => formatTimeTick(d)));

        //Create Axis Labels
        svg.append("text").classed("xAxisLabel", true)
            .attr("transform", "translate(" + ((props.width - 280) / 2) + " ," + (props.height - 20) + ")")
            .style("text-anchor", "middle")
            .text(props.timeLabel);

        svg.append("text").classed("yAxisLabel", true)
            .attr("transform", "rotate(-90)")
            .attr("y", -30)
            .attr("x", - (props.height / 2 - 30))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Units Go here");
            //.text(uniq(lineData.map(d => units.get[d.Unit].options[activeUnit.get({ ...settingKey, unit: d.Unit })].short)).join("/"));

        setTooltipLocation(10);

        //Add Clip Path
        svg.append("defs").append("svg:clipPath")
            .attr("id", "clip-" + props.type + "-" + props.eventId)
            .append("svg:rect").classed("clip",true)
            .attr("width", 'calc(100% - 60px)')
            .attr("height", 'calc(100% - 60px)')
            .attr("x", 20)
            .attr("y", 0);


        //Add Window to indicate Zooming

        svg.append("rect").classed("zoomWindow",true)
            .attr("stroke", "#000")
            .attr("x", 10).attr("width", 0)
            .attr("y", 0).attr("height", props.height - 60)
            .attr("fill", "black")
            .style("opacity", 0);

        // Window Indicating fft 
        if (props.type == 'Voltage' || props.type == 'Current')
            svg.append("rect").classed("fftWindow", true)
                .attr("stroke", "#000")
                .attr("x", 10).attr("width", 0)
                .attr("y", 0).attr("height", props.height - 60)
                .attr("fill", "black")
                .style("opacity", 0);

        //Add Empty group for Data Points
        svg.append("g").classed("DataContainer", true)
            .attr("clip-path", "url(#clip-" + props.type + "-" + props.eventId + ")");

        //Event overlay

        svg.append("svg:rect").classed("Overlay",true)
            .attr("width", 'calc(100% - 60px)')
            .attr("height", '100%')
            .attr("x", 20)
            .attr("y", 0)
            .style("opacity", 0)
            .on('mousemove', (evt) => MouseMove(evt) )
            .on('mouseout', (evt) => MouseOut(evt) )
            .on('mousedown', (evt) => MouseDown(evt) )
            .on('mouseup', (evt) => MouseUp(evt))
            .on('mouseenter', () => { setLeftSelectCounter(1) })
    }

    function formatTimeTick(d: number) {
        let TS = moment(d);
        let h = 100;
        if (xScaleRef.current != undefined)
            h = xScaleRef.current.domain()[1] - xScaleRef.current.domain()[0]

        
        if (timeUnit.options[timeUnit.current].short == 'auto') {
            if (h < 100)
                return TS.format("SSS.S")
            else if (h < 1000)
                return TS.format("ss.SS")
            else
                return TS.format("ss.S")
        }
        else if (timeUnit.options[timeUnit.current].short  == 's') {
            if (h < 100)
                return TS.format("ss.SSS")
            else if (h < 1000)
                return TS.format("ss.SS")
            else
                return TS.format("ss.S")
        }
        else if (timeUnit.options[timeUnit.current].short  == 'ms')
            if (h < 100)
                return TS.format("SSS.S")
            else
                return TS.format("SSS")

        else if (timeUnit.options[timeUnit.current].short  == 'min')
            return TS.format("mm:ss")

        else if (timeUnit.options[timeUnit.current].short == 'ms since event') {
            let ms = d - props.eventStartTime;
            if (props.type == 'OverlappingWave')
                ms = d;
            if (h < 2)
                return ms.toFixed(3)
            if (h < 5)
                return ms.toFixed(2)
            else
                return ms.toFixed(1)
        }

        else if (timeUnit.options[timeUnit.current].short == 'cycles') {
            let cyc = (d - props.eventStartTime) * 60.0 / 1000.0;
            if (props.type == 'OverlappingWave')
                cyc = (d) * 60.0 / 1000.0;

            h = h * 60.0 / 1000.0;
            if (h < 2)
                return cyc.toFixed(3)
            if (h < 5)
                return cyc.toFixed(2)
            else
                return cyc.toFixed(1)
        }
    }

    function formatValueTick(d: number) {
        let h = 1;

        if (yScaleRef.current != undefined)
            h = yScaleRef.current.domain()[1] - yScaleRef.current.domain()[0]

        if (h > 100)
            return d.toFixed(0)

        if (h > 10)
            return d.toFixed(1)
        else
            return d.toFixed(2)

    }

    // This Function should be called anytime the Scale changes as it will adjust the Axis, Path and Points
    function updateLimits() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        container.select(".yAxis").call(d3.axisLeft(yScaleRef.current).tickFormat((d, i) => formatValueTick(d)));
        container.select(".xAxis").call(d3.axisBottom(xScaleRef.current).tickFormat((d, i) => formatTimeTick(d)));

        let lineGen = (unit: OpenSee.Unit, base: number) => {

            let factor = 1.0;
            if (activeUnit[unit as string] != undefined) {
                factor = activeUnit[unit as string].factor
                factor = (activeUnit[unit as string].short == 'pu' || activeUnit[unit as string].short == 'pu/s' ? 1.0 / base : factor);
            }
            return d3.line()
                .x(function (d) { return xScaleRef.current(d[0]) })
                .y(function (d) { return yScaleRef.current(d[1] * factor) })
                .defined(function (d) {
                    let tx = !isNaN(parseFloat(xScaleRef.current(d[0])));
                    let ty = !isNaN(parseFloat(yScaleRef.current(d[1])));
                    tx = tx && isFinite(parseFloat(xScaleRef.current(d[0])));
                    ty = ty && isFinite(parseFloat(yScaleRef.current(d[1])));
                    return tx && ty;
                })
        }

        container.select(".DataContainer").selectAll(".Line").attr("d", function (d) {
                return lineGen(d.Unit, d.BaseValue)(d.DataPoints)
            })

        updateLabels();
        updateFFTWindow();
    }

    function MouseMove(evt) {

        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        let x0 = d3.pointer(evt,container.select(".Overlay").node())[0];
        let y0 = d3.pointer(evt,container.select(".Overlay").node())[1];
        let t0 = (xScaleRef.current as any).invert(x0);
        let d0 = (yScaleRef.current as any).invert(y0);
        dispatch(SetHover({ t: t0, snap: snapToPoint, y: d0 }));
    }

    function MouseDown(evt) {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        let x0 = d3.pointer(evt,container.select(".Overlay").node())[0];
        let y0 = d3.pointer(evt,container.select(".Overlay").node())[1];

        let t0 = (xScaleRef.current as any).invert(x0);
        let d0 = (yScaleRef.current as any).invert(y0);

        setMouseDown(true);
        setPointMouse([t0, d0]);

        if (props.type == 'OverlappingWave')
            return;

        dispatch(SelectPoint([t0, d0]));
        setOldFFTWindow(() => { return fftWindow });

    }

    function MouseUp(evt) {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        setMouseDown(false);
        container.select(".zoomWindow").style("opacity", 0)
    }

    // This function needs to be called if hover is updated
    function updateHover() {
        
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        if (xScaleRef.current == undefined || yScaleRef.current == undefined)
            return;

        //container.select(".toolTip").attr("x1", xScaleRef.current(hover[0]))
        //    .attr("x2", xScaleRef.current(hover[0]));

        if (mouseMode == 'zoom' && mouseDown) {
            if (zoomMode == "x")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", (xScaleRef.current as any)(Math.min(hover[0], pointMouse[0])))
                    .attr("width", Math.abs((xScaleRef.current as any)(hover[0]) - (xScaleRef.current as any)(pointMouse[0])))
                    .attr("height", props.height - 60)
                    .attr("y", 0)
            else if (zoomMode == "y")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", (xScaleRef.current as any)(startTime))
                    .attr("width", (xScaleRef.current as any)(endTime) - (xScaleRef.current as any)(startTime))
                    .attr("height", Math.abs((yScaleRef.current as any)(pointMouse[1]) - (yScaleRef.current as any)(hover[1])))
                    .attr("y", Math.min((yScaleRef.current as any)(pointMouse[1]), (yScaleRef.current as any)(hover[1])))
            else if (zoomMode == "xy")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", (xScaleRef.current as any)(Math.min(hover[0], pointMouse[0])))
                    .attr("width", Math.abs((xScaleRef.current as any)(hover[0]) - (xScaleRef.current as any)(pointMouse[0])))
                    .attr("height", Math.abs((yScaleRef.current as any)(pointMouse[1]) - (yScaleRef.current as any)(hover[1])))
                    .attr("y", Math.min((yScaleRef.current as any)(pointMouse[1]), (yScaleRef.current as any)(hover[1])))
        }
        let deltaT = hover[0] - pointMouse[0];
        let deltaData = hover[1] - pointMouse[1];


        if (mouseMode == 'pan' && mouseDown && (zoomMode == "x" || zoomMode == "xy") && props.type != 'OverlappingWave')
            dispatch(SetTimeLimit({ start: (startTime - deltaT), end: (endTime - deltaT) }));
        if (mouseMode == 'pan' && mouseDown && (zoomMode == "x" || zoomMode == "xy") && props.type == 'OverlappingWave')
            dispatch(SetCycleLimit({ start: (startTime - deltaT), end: (endTime - deltaT) }));

        if (mouseMode == 'pan' && mouseDown && (zoomMode == "y" || zoomMode == "xy"))
            dispatch(SetYLimits({ min: (yLimits[0] - deltaData), max: (yLimits[1] - deltaData), key: dataKey }));

        deltaT = pointMouse[0] - oldFFTWindow[0];
        deltaData = oldFFTWindow[1] - oldFFTWindow[0];

        if (mouseMode == 'fftMove' && mouseDown && pointMouse[0] < oldFFTWindow[1] && pointMouse[0] > oldFFTWindow[0]) {
            let Tstart = (hover[0] - deltaT);
            Tstart = (Tstart < xScaleRef.current.domain()[0]? xScaleRef.current.domain()[0] : Tstart)
            Tstart = ((Tstart + deltaData) > xScaleRef.current.domain()[1] ? xScaleRef.current.domain()[1] - deltaData : Tstart);

            dispatch(SetFFTWindow({ startTime: Tstart, cycle: fftCycles }));
        }
    }

    function updateFFTWindow() {
        if (props.type != 'Voltage' && props.type != 'Current')
            return;

        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        if (xScaleRef.current == undefined || yScaleRef.current == undefined)
            return;

        container.select(".fftWindow")
            .attr("x", xScaleRef.current(fftWindow[0])).attr("width", xScaleRef.current(fftWindow[1]) - xScaleRef.current(fftWindow[0]))
            .style("opacity", (showFFT? 0.5: 0))
    }

    function MouseOut(evt) {
        setLeftSelectCounter((n) => -1);
    }

    // Mouse Left only get's called if we left for a minimum of time
    function MouseLeft() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        container.select(".zoomWindow").style("opacity", 0);
        setMouseDown(false);
    }
    //This function needs to be called whenever (a) Unit Changes (b) Data Changes (c) Data Visibility changes (d) Limitw change (due to auto Units)
    function updateLabels() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        function GetTLabel() {
            let h = 100;
            if (xScaleRef.current != undefined)
                h = xScaleRef.current.domain()[1] - xScaleRef.current.domain()[0]


            if ((timeUnit as OpenSee.IUnitSetting).options[timeUnit.current].short != 'auto' && props.type != 'OverlappingWave')
                return (timeUnit as OpenSee.IUnitSetting).options[timeUnit.current].short;

            if (props.type != 'OverlappingWave') {
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

        function GetYLabel() {
            return uniq(lineData.map(d => d.Unit)).map(unit => {
                return "[" + (activeUnit[unit] != undefined ? activeUnit[unit].short : "N/A")+ "]";
            }).join("  ")
        }

        container.select(".xAxisLabel").text(props.timeLabel + " (" + GetTLabel() + ")")
        container.select(".yAxisLabel").text(GetDisplayLabel(props.type) + ' ' + GetYLabel())

    }

    //This Function needs to be called whenever (a) Color Setting changes occur
    function updateColors() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        function GetColor(col: OpenSee.Color) {
                return colors[col as string]
        }

        container.select(".DataContainer").selectAll(".Line").attr("stroke", (d) => GetColor(d.Color));

    }

    // This determines the active Units if "auto" is used
   
    //This Function needs to be called whenever a item is selected or deselected in the Legend
    function updateVisibility() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        //.transition().duration(1000) leads to a performance issue. need to investigate how to avoid this
        container.selectAll(".Line").data(lineData).classed("active", (d, index) => enabledLine[index])

        container.select(".DataContainer").selectAll(".Line.active").attr("stroke-width", 2.5);

        container.select(".DataContainer").selectAll(".Line:not(.active)").attr("stroke-width", 0);

    }

    // This Function needs to be called whenever height or width change
    function updateSize() {

        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        container.select(".xAxis").attr("transform", "translate(0," + (props.height - 60) + ")");

        container.select(".xAxisLabel").attr("transform", "translate(" + ((props.width - 320) / 2) + " ," + (props.height - 20) + ")")
        container.select(".yAxisLabel").attr("x", - (props.height / 2 - 30))
        xScaleRef.current.range([20, props.width - 280]);
        yScaleRef.current.range([props.height - 60, 0]);

        container.select(".clip").attr("height", props.height - 60)
        //container.select(".toolTip").attr("y2", props.height - 60)
        container.select(".fftwindow").attr("y", 0).attr("height", props.height - 60);
        updateLimits();
    }
    
    return (
        <div>
            <Container eventID={props.eventId} height={props.height} loading={loading} type={props.type} hover={toolTipLocation} hasData={lineData.length > 0} hasTrace={enabledLine.some(i=> i)} />
            {loading == 'Loading' || lineData.length == 0 ? null : <Legend height={props.height} type={props.type} eventId={props.eventId} />}
        </div>
    );
}


const Container = React.memo((props: { height: number, eventID: number, type: OpenSee.graphType, loading: OpenSee.LoadingState, hover: number, hasData: boolean, hasTrace: boolean }) => {
    const showSVG = props.loading != 'Loading' && props.hasData;

    return (<div id={"graphWindow-" + props.type + "-" + props.eventID} style={{ height: props.height, float: 'left', width: 'calc(100% - 220px)' }}>
        {props.loading == 'Loading' ? <LoadingIcon /> : null}
        {props.loading != 'Loading' && !props.hasData ? <NoDataIcon /> : null}
        <svg className="root" style={{ width: (showSVG ? '100%' : 0), height: (showSVG ? '100%' : 0) }}>
            {props.loading == 'Loading' || !props.hasData ? null : <ToolTip height={props.height} left={props.hover} />}
            {props.loading != 'Loading' && props.hasData && !props.hasTrace ?
                <text x={'50%'} y={'45%'} style={{ textAnchor: 'middle', fontSize: 'x-large' }} > Select a Trace in the Legend to Display. </text> : null}
        </svg>
    </div>)
})

const ToolTip = (props: { height: number, left: number }) => {

    return <g>
        <polyline points={`${props.left},0 ${props.left},${props.height - 60}`} style={{ stroke: "#000", opacity: 0.5 }} transform={'translate(40,10)'}/>
        </g>
}

export default LineChart;

