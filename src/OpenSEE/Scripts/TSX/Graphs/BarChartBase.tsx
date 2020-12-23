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
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  12/15/2020 - C. Lackner
//       Generated original version of source code
//
//******************************************************************************************************

import * as React from 'react';
import { range, uniq } from "lodash";
import * as d3 from '../../D3/d3';
import { OpenSee } from '../global';


import Legend from './LegendBase';
import { useSelector, useDispatch } from 'react-redux';
import { selectColor, selectActiveUnit, selectTimeUnit, selectSnap } from '../store/settingSlice'
import { selectData, selectEnabled, selectStartTime, selectEndTime, selectLoading, selectYLimits, selectHover, SetHover, SelectPoint, selectMouseMode, SetTimeLimit, selectZoomMode, SetYLimits, selectFFTLimits, SetFFTLimits } from '../Store/dataSlice';
import { selectAnalyticOptions } from '../Store/analyticSlice';



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
// bar => The Trace
// active => indicates an active trace
// SelectedPoints => a group of points Selected
// selectedPoint => a single point 
// toolTip => The vertical Line used as tooltip
// zoomWindow => Window shown when zooming
// clip => The Clipp Path
// DataContainer => The Container that has all the Databased elements (Line, Marker etc)
// Overlay => The Container Overlayed for eventHandling

const BarChart = (props: iProps) => {
    const dataKey: OpenSee.IGraphProps = { DataType: props.type, EventId: props.eventId };
    const SelectActiveUnitInstance = React.useMemo(() => selectActiveUnit(dataKey), [props.eventId, props.type])
    const selectAnalyticOptionInstance = React.useMemo(() => selectAnalyticOptions(props.type), [props.type])

    const xScaleRef = React.useRef<any>();
    const yScaleRef = React.useRef<any>();

    //const [xScale, setXscale] = React.useState<any>(null);
    //const [yScale, setYscale] = React.useState<any>(null);

    const [isCreated, setCreated] = React.useState<boolean>(false);
    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    const [pointMouse, setPointMouse] = React.useState<[number, number]>([0, 0]);

    const barData = useSelector(selectData(dataKey));
    const enabledBar = useSelector(selectEnabled(dataKey));

    const xLimits = useSelector(selectFFTLimits);
 
    const loading = useSelector(selectLoading(dataKey));

    const colors = useSelector(selectColor);
    const activeUnit = useSelector(SelectActiveUnitInstance);
    const mouseMode = useSelector(selectMouseMode);
    const zoomMode = useSelector(selectZoomMode);

    const dispatch = useDispatch();
    const yLimits = useSelector(selectYLimits(dataKey));
    const options = useSelector(selectAnalyticOptionInstance)

    const [hover, setHover] = React.useState<[number, number]>([0, 0]);

    //Effect to update the Data 
    React.useEffect(() => {
        if (loading)
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
    }, [barData, loading]);

    //Effect to adjust Axes Labels when Scale changes
    React.useEffect(() => {
        if (yScaleRef.current != undefined && xScaleRef.current != undefined)
            updateSize();

    }, [props.height, props.width])

    React.useEffect(() => {
        updateVisibility();
    }, [enabledBar])

    //Effect to adjust Axes when Units change
    React.useEffect(() => {
        if (yScaleRef.current != undefined && xScaleRef.current != undefined)
                updateLimits();


    }, [activeUnit])

    //Effect if y Limits change
    React.useEffect(() => {
        if (yScaleRef.current != undefined) {
            yScaleRef.current.domain(yLimits);
            updateLimits();
        }
    }, [yLimits])

    //Effect if x Limits change
    React.useEffect(() => {
        if (xScaleRef.current != undefined) {
            xScaleRef.current.domain(range(xLimits[0], xLimits[1] + 1))
            updateLimits();
        }
    }, [xLimits])

    React.useEffect(() => { updateHover(); }, [hover]);

    React.useEffect(() => {
        if (!mouseDown && mouseMode == 'zoom' && zoomMode == "x")
            dispatch(SetFFTLimits({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "y")
            dispatch(SetYLimits({ max: Math.max(pointMouse[1], hover[1]), min: Math.min(pointMouse[1], hover[1]), key: dataKey }))
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "xy") {
            dispatch(SetFFTLimits({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
            dispatch(SetYLimits({ max: Math.max(pointMouse[1], hover[1]), min: Math.min(pointMouse[1], hover[1]), key: dataKey }))
        }
    }, [mouseDown])


    React.useEffect(() => {
        updateColors();
    }, [colors])

    //This Clears the Plot if loading is activated
    React.useEffect(() => {
        d3.select("#graphWindow-" + props.type + "-" + props.eventId + ">svg").remove();

        if (loading) {
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

        container.select(".DataContainer").selectAll(".Bar").data(barData).enter().append("g")
            .classed("Bar", true)
            .attr("fill", (d) => colors[d.Color])
            .selectAll('rect')
            .data(d => d.DataPoints.map(pt => { return { unit: d.Unit, data: pt, color: d.Color } }))
            .enter().append('rect')
            .attr("x", d => xScaleRef.current(d.data[0]))
            .attr("y", d => yScaleRef.current(d.data[1]))
            .attr("width", xScaleRef.current.bandwidth() - 1)
            .attr("height", d => { return ((props.height - 60) - yScaleRef.current(d.data[1])) })
            

        container.select(".DataContainer").selectAll(".Bar").data(barData).exit().remove();
        updateLimits();

    }

    function createPlot() {
        d3.select("#graphWindow-" + props.type + "-" + props.eventId + ">svg").remove()

        let svg = d3.select("#graphWindow-" + props.type + "-" + props.eventId).append("svg").classed("root",true)
            .attr("width", '100%')
            .attr("height", '100%')
            .append("g")
                .attr("transform", "translate(40,10)");

        // Now Create Axis
        yScaleRef.current = d3.scaleLinear()
            .domain(yLimits)
            .range([props.height - 60, 0]);

        xScaleRef.current = d3.scaleBand()
            .domain(range(xLimits[0], xLimits[1]+ 1))
            .range([20, props.width - 320])
            .padding(0.1);

        svg.append("g").classed("yAxis", true).attr("transform", "translate(20,0)").call(d3.axisLeft(yScaleRef.current).tickFormat((d, i) => formatValueTick(d)));
    
        svg.append("g").classed("xAxis", true).attr("transform", "translate(0," + (props.height - 60) + ")").call(d3.axisBottom(xScaleRef.current).tickValues(GetTicks()));

        //Create Axis Labels
        svg.append("text").classed("xAxisLabel", true)
            .attr("transform", "translate(" + ((props.width - 320) / 2) + " ," + (props.height - 20) + ")")
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

        //Add ToolTip
        //svg.append("line").classed("toolTip", true)
        //    .attr("stroke", "#000")
        //    .attr("x1", 10).attr("x2", 10)
        //    .attr("y1", 0).attr("y2", props.height - 60)
        //    .style("opacity", 0.5);


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
            .on('mousemove', MouseMove )
            .on('mouseout',  MouseOut )
            .on('mousedown', MouseDown )
            .on('mouseup', MouseUp )
    }

    function formatValueTick(d: number) {
        let h = 1;

        if (yScaleRef.current != undefined)
            h = yScaleRef.current.domain()[1] - yScaleRef.current.domain()[0]

        if (h > 100)
            return d.toFixed(0)

        if (h > 10)
            return d.toFixed(1)
        if (h > 1)
            return d.toFixed(2)
        else
            return d.toFixed(3)

    }

    function GetTicks(): number[] {
        let ticks = xScaleRef.current.domain();
        if (ticks.length < 15)
            return ticks;
        let n = Math.floor(ticks.length/15)
        ticks = ticks.filter((d, i) => i % n == 0);
        return ticks;

    }
    // This Function should be called anytime the Scale changes as it will adjust the Axis, Path and Points
    function updateLimits() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        container.select(".yAxis").call(d3.axisLeft(yScaleRef.current).tickFormat((d, i) => formatValueTick(d)));
        container.select(".xAxis").call(d3.axisBottom(xScaleRef.current).tickValues(GetTicks()));

        let barGen = (unit: OpenSee.Unit) => {
            //Determine Factors

            let factor = activeUnit[unit as string].factor

            return (d) => { return yScaleRef.current(d.data[1] * factor)}
          
        }

        container.select(".DataContainer").selectAll(".Bar").selectAll('rect')
            .attr("x", d => xScaleRef.current(d.data[0]))
            .attr("y", d => barGen(d.unit)(d))
            .attr("width", xScaleRef.current.bandwidth() - 1)
            .attr("height", d => { return Math.max(((props.height - 60) - barGen(d.unit)(d)),0)})
      
        updateLabels();
    }

    function MouseMove() {

        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        let x0 = d3.mouse(container.select(".Overlay").node())[0];
        let y0 = d3.mouse(container.select(".Overlay").node())[1];
        let t0 = getXbucket(x0);
        let d0 = (yScaleRef.current as any).invert(y0);
        setHover([t0,d0])
    }

    function MouseDown() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        let x0 = d3.mouse(container.select(".Overlay").node())[0];
        let y0 = d3.mouse(container.select(".Overlay").node())[1];

        let t0 = getXbucket(x0);
        let d0 = (yScaleRef.current as any).invert(y0);

        setMouseDown(true);
        setPointMouse([t0, d0]);

    }

    function MouseUp() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        setMouseDown(false);
        container.select(".zoomWindow").style("opacity", 0);

    }

    function getXbucket(pixel: number) {
        let eachBand = xScaleRef.current.step();

        let index = Math.floor((pixel / eachBand));
        if (index == xScaleRef.current.domain().length)
            index = index - 1
        return xScaleRef.current.domain()[index];
    }

    // This function needs to be called if hover is updated
    function updateHover() {
        
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        if (mouseMode == 'zoom' && mouseDown) {
            if (zoomMode == "x")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", (xScaleRef.current as any)(Math.min(hover[0], pointMouse[0])))
                    .attr("width", Math.abs((xScaleRef.current as any)(hover[0]) - (xScaleRef.current as any)(pointMouse[0])))
                    .attr("height", props.height - 60)
                    .attr("y", 0)
            else if (zoomMode == "y")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", (xScaleRef.current as any)(xLimits[0]))
                    .attr("width", (xScaleRef.current as any)(xLimits[1]) - (xScaleRef.current as any)(xLimits[0]))
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

        if (mouseMode == 'pan' && mouseDown && zoomMode == "x" || zoomMode == "xy")
            dispatch(SetFFTLimits({ start: (xLimits[0] - deltaT), end: (xLimits[1] - deltaT) }));

        
        if (mouseMode == 'pan' && mouseDown && zoomMode == "y" || zoomMode == "xy")
            dispatch(SetYLimits({ min: (yLimits[0] - deltaData), max: (yLimits[1] - deltaData), key: dataKey }));
    }

    function MouseOut() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        container.select(".zoomWindow").style("opacity", 0);
        setMouseDown(false);
    }

    //This function needs to be called whenever (a) Unit Changes (b) Data Changes (c) Data Visibility changes (d) Limitw change (due to auto Units)
    function updateLabels() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        function GetYLabel() {
            return uniq(barData.map(d => d.Unit)).map(unit => {
                return "[" + (activeUnit[unit] != undefined ? activeUnit[unit].short : "N/A")+ "]";
            }).join("  ")
        }

        container.select(".yAxisLabel").text(GetYLabel())

    }


    //This Function needs to be called whenever (a) Color Setting changes occur
    function updateColors() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        function GetColor(col: OpenSee.Color) {
                return colors[col as string]
        }

        container.select(".DataContainer").selectAll(".Bar").attr("fill", (d) => GetColor(d.Color));

    }

    // This determines the active Units if "auto" is used
   
    //This Function needs to be called whenever a item is selected or deselected in the Legend
    function updateVisibility() {
        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);

        //.transition().duration(1000) leads to a performance issue. need to investigate how to avoid this
        container.select(".DataContainer").selectAll(".Bar").data(barData).classed("active", (d, index) => enabledBar[index])

        container.select(".DataContainer").selectAll(".Bar.active").style("opacity", 1.0);

        container.select(".DataContainer").selectAll(".Bar:not(.active)").style("opacity", 0);

    }

    // This Function needs to be called whenever height or width change
    function updateSize() {

        let container = d3.select("#graphWindow-" + props.type + "-" + props.eventId);
        container.select(".xAxis").attr("transform", "translate(0," + (props.height - 60) + ")");

        container.select(".xAxisLabel").attr("transform", "translate(" + ((props.width - 320) / 2) + " ," + (props.height - 20) + ")")
        container.select(".yAxisLabel").attr("x", - (props.height / 2 - 30))
        xScaleRef.current.range([20, props.width - 320]);
        yScaleRef.current.range([props.height - 60, 0]);

        container.select(".clip").attr("height", props.height - 60)
        container.select(".toolTip").attr("y2", props.height - 60)

    }
    
    return (
        <div>
            <div id={"graphWindow-" + props.type + "-" + props.eventId} style={{ height: props.height, float: 'left', width: 'calc(100% - 220px)' }}>
                {loading? <p> Loading...</p>: null}
            </div>
            {loading ? null : <Legend height={props.height} type={props.type} eventId={props.eventId} />}
        </div>
    );
}


export default BarChart;

