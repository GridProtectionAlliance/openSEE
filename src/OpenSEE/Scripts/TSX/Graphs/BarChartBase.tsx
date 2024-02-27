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
import * as _ from "lodash";
import * as d3 from "d3";
import { OpenSee } from '../global';


import Legend from './LegendBase';
import { SelectColor, SelectActiveUnit, SelectMouseMode, SelectZoomMode, } from '../store/settingSlice'
import {
    SelectData, SelectEnabled, SelectLoading, SelectYLimits, SetZoomedLimits, SelectFFTLimits,
    SetFFTLimits, SelectRelevantUnits, getPrimaryAxis, SelectYLabels, SelectEnabledUnits
} from '../store/dataSlice';
import { SelectAnalyticOptions } from '../store/analyticSlice';
import { LoadingIcon, NoDataIcon } from './ChartIcons';
import { useAppDispatch, useAppSelector } from '../hooks';

interface iProps {
    height: number,
    width: number,
    dataKey: OpenSee.IGraphProps
};

// The following Classes are used in this 
// xAxis, yaxis => The axis Labels
// xAxisExtLeft, xAxisExtRight => axis extensions because Xaxis stops left and right center Bar
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
    const dataKey: OpenSee.IGraphProps = { DataType: props.dataKey.DataType, EventId: props.dataKey.EventId };
    const SelectActiveUnitInstance = React.useMemo(() => SelectActiveUnit(dataKey), [props.dataKey.EventId, props.dataKey.DataType])
    const selectAnalyticOptionInstance = React.useMemo(() => SelectAnalyticOptions(props.dataKey.DataType), [props.dataKey.DataType])
    const MemoSelectNumUnits = React.useMemo(() => SelectRelevantUnits(dataKey), []);
    const yLimits = useAppSelector(SelectYLimits(dataKey));

    const MemoSelectData = React.useMemo(() => SelectData(dataKey), []);
    const MemoSelecEnable = React.useMemo(() => SelectEnabled(dataKey), []);

    const xScaleRef = React.useRef<d3.ScaleBand<number>>();
    const xScaleLblRef = React.useRef<any>();
    const yScaleRef = React.useRef<OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}>({});

    const [isCreated, setCreated] = React.useState<boolean>(false);
    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    const [pointMouse, setPointMouse] = React.useState<[number, number]>([0, 0]);
    const [mouseDownInit, setMouseDownInit] = React.useState<boolean>(false);
    const relevantUnits = useAppSelector(MemoSelectNumUnits);
    const MemoSelectEnabledUnit = React.useMemo(() => SelectEnabledUnits(props.dataKey), []);
    const enabledUnits = useAppSelector(MemoSelectEnabledUnit);

    const barData = useAppSelector(MemoSelectData);
    const enabledBar = useAppSelector(MemoSelecEnable);

    const yLabels = useAppSelector(SelectYLabels(dataKey));

    const xLimits = useAppSelector(SelectFFTLimits);

    const loading = useAppSelector(SelectLoading(dataKey));

    const colors = useAppSelector(SelectColor);
    const activeUnit = useAppSelector(SelectActiveUnitInstance);
    const mouseMode = useAppSelector(SelectMouseMode);
    const zoomMode = useAppSelector(SelectZoomMode);

    const dispatch = useAppDispatch();
    const options = useAppSelector(selectAnalyticOptionInstance)

    const [hover, setHover] = React.useState<[number, number]>([0, 0]);
    const [yLblFontSize, setYLblFontSize] = React.useState<OpenSee.IUnitCollection<number> | {}>({});
    const primaryAxis = getPrimaryAxis(dataKey)

    React.useEffect(() => {

        if (barData && barData?.length > 0 && loading !== 'Loading') {
            if (isCreated) 
                UpdateData();
            
            createPlot();
            UpdateData();
            updateVisibility();
            setCreated(true);
        }

    }, [barData, loading]);

    //Effect to adjust Axes Labels when Scale changes
    React.useEffect(() => {
        if (yScaleRef.current != undefined && xScaleRef.current != undefined)
            updateSize();

    }, [props.height, props.width])


    React.useEffect(() => {
        if (barData && barData?.length > 0)
            updateVisibility();
    }, [enabledBar])

    //Effect to adjust Axes when Units change
    React.useEffect(() => {
        if (yScaleRef.current == undefined || xScaleRef.current == undefined)
            return;

        relevantUnits.forEach(unit => {
            if (yScaleRef.current?.[unit] && yLimits?.[unit]) {
                yScaleRef.current[unit].domain(yLimits[unit]);
            }
        });

        if (barData && barData.length > 0) {
            let domain = barData[0].DataPoints.filter(pt => pt[0] >= xLimits[0] && pt[0] <= xLimits[1]).map(pt => pt[0]);
            xScaleRef.current.domain(domain);
            xScaleLblRef.current.domain([60.0 * domain[0], 60.0 * domain[domain.length - 1]]);
        }

        if (yLimits) 
            updateLimits();
        

    }, [activeUnit, yLimits])


    React.useEffect(() => {
        updateHover();
    }, [hover]);

    React.useEffect(() => {
        if (!mouseDownInit) {
            setMouseDownInit(true);
            return;
        }

        if (!mouseDown && mouseMode == 'zoom' && zoomMode == "x")
            dispatch(SetFFTLimits({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "y")
            dispatch(SetZoomedLimits({ limits: [Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], key: dataKey }))
        else if (!mouseDown && mouseMode == 'zoom' && zoomMode == "xy") {
            dispatch(SetFFTLimits({ end: Math.max(pointMouse[0], hover[0]), start: Math.min(pointMouse[0], hover[0]) }))
            dispatch(SetZoomedLimits({ limits: [Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], key: dataKey }))
        }
    }, [mouseDown])


    React.useEffect(() => {
        updateColors();
    }, [colors])

    //This Clears the Plot if loading is activated
    React.useEffect(() => {
        d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId + ">svg").select("g.root").remove()

        if (loading == 'Loading') {
            setCreated(false);
            return;
        }

        if (barData?.length == 0) {
            setCreated(false);
            return;
        }
        createPlot();
        UpdateData();
        updateVisibility();

        return () => { }

    }, [props.dataKey, options]);

    React.useEffect(() => {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        if (container == null || container.select(".yAxisLabel") == null)
            return;

        let yLabelLeft = container.select(`.yAxisLabel.left`)

        yLabelLeft.style('font-size', yLblFontSize.toString() + 'rem');
        yLabelLeft.text(yLabels[primaryAxis])

        relevantUnits.forEach(unit => {
            container.select(`.yAxisLabel.right[type='axis-${unit}']`).style('font-size', yLblFontSize.toString() + 'rem');
            container.select(".yAxisLabel.right").text(yLabels[unit])
        })

    }, [yLabels, yLblFontSize]);


    React.useLayoutEffect(() => {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        if (container == null || container.select(".yAxisLabel") == null || yLabels[primaryAxis].length == 0)
            return;

        relevantUnits.forEach(unit => {
            let fs = 1;
            let l = GetTextWidth('', '1rem', yLabels[unit]);

            while ((l > props.height - 60) && fs > 0.2) {
                fs = fs - 0.05;
                l = GetTextWidth('', fs.toString() + 'rem', yLabels[unit]);
            }

            if (fs != yLblFontSize[unit])
                setYLblFontSize(prevState => ({
                    ...prevState,
                    [unit]: fs
                }));
        })

    });

    function createLineGen(unit = null, base = null) {
        let factor = 1.0

        // Calculate factor if unit and base are provided
        if (unit && base && activeUnit[unit]) {
            factor = activeUnit[unit].factor;
            if (factor === undefined)  //p.u case
                factor = 1.0 / base
        }

        if (enabledUnits?.length > 2)
            xScaleRef.current.range([120, props.width - 110]);

        if (enabledUnits?.length > 3)
            xScaleRef.current.range([120, props.width - 170]);

        return d3.line()
            .x(d => xScaleRef.current ? (xScaleRef.current(d[0]) + (xScaleRef.current.bandwidth() / 2)) : 0)
            .y(d => yScaleRef?.current[unit] ? yScaleRef?.current[unit](d[1] * factor) : 0)
            .defined(d => {
                let tx = !isNaN(parseFloat(xScaleRef.current ? (xScaleRef.current(d[0]) + (xScaleRef.current.bandwidth() / 2)?.toString()) : '0'));
                let ty = !isNaN(parseFloat(yScaleRef?.current[unit] ? yScaleRef.current[unit](d[1] * factor)?.toString() : '0'));
                tx = tx && isFinite(parseFloat(xScaleRef.current ? (xScaleRef.current(d[0]) + (xScaleRef.current.bandwidth() / 2))?.toString() : '0'));
                ty = ty && isFinite(parseFloat(yScaleRef?.current[unit] ? yScaleRef.current[unit](d[1] * factor)?.toString() : '0'));
                return tx && ty;
            });
    }

    // This Function needs to be called whenever Data is Added
    function UpdateData() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        //draw bars for Mag 
        const rectData = barData.filter(d => d.LegendHorizontal === "Mag")

        let rectangles = container.select(".DataContainer").selectAll(".Bar")
            .data(rectData)
            .enter().append("g")
            .classed("Bar", true)
            .attr("stroke", d => colors[d.Color])
            .selectAll('rect')
            .data(d => d.DataPoints.map(pt => { return { unit: d.Unit, data: pt, color: d.Color, base: d.BaseValue, enabled: d.Enabled } }) as OpenSee.BarSeries[])
            .enter()
            .append('rect')
            .attr("x", d => {
                let x = xScaleRef.current(d.data[0]);
                return isNaN(x) ? 0 : x
            })
            .attr("y", d => { let y = yScaleRef.current[d.unit](d.data[1]); return isNaN(y) ? 0 : y })
            .attr("width", xScaleRef.current.bandwidth())
            .attr("height", d => {
                let h = yScaleRef.current[d.unit](d.data[1])
                return isNaN(h) ? 0 : Math.max(((props.height - 60) - yScaleRef.current[d.unit](d.data[1])), 0)
            })
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .style("transition", 'x 0.5s')
            .style("transition", 'y 0.5s')
            .style("transition", 'width 0.5s')
            .style("height", 'width 0.5s')



        //draw circles for Ang
        const pointData = barData.filter(d => d.LegendHorizontal === "Ang")
        let circles = container.select(".DataContainer").selectAll(".Point")
            .data(pointData)
            .enter().append("g")
            .classed("Point", true)
            .attr("fill", d => colors[d.Color])
            .selectAll('circle')
            .data(d => d.DataPoints.map(pt => { return { unit: d.Unit, data: pt, color: d.Color, base: d.BaseValue, enabled: d.Enabled } }) as OpenSee.BarSeries[])
            .enter().append('circle')
            .attr("cx", d => isNaN(xScaleRef.current(d.data[0])) ? -1 : xScaleRef.current(d.data[0])) //set the circle cx position
            .attr("cy", d => isNaN(yScaleRef.current[d.unit](d.data[1])) ? -1 : yScaleRef.current[d.unit](d.data[1])) //set the circle cy position
            .attr("r", 5) //set the radius as 5
            .attr("stroke", "none") //set the stroke as none
            .style("transition", 'cx 0.5s')
            .style("transition", 'cy 0.5s')
            .style("transition", 'r 0.5s')


        //draw lines to connect Ang circles
        let lines = container.select(".DataContainer").selectAll(".Line").data(pointData);
        lines.enter().append("path").classed("Line", true)
            .attr("type", d => `axis-${d.Unit}`)
            .attr("fill", "none")
            .attr("stroke", d => (Object.keys(colors).indexOf(d.Color) > -1 ? colors[d.Color] : colors.random))
            .attr("stroke-dasharray", d => (d.LineType == undefined || d.LineType == "-" ? 0 : 5))
            .attr("d", d => {
                let lineGen = createLineGen(d.Unit)
                if (d.SmoothDataPoints.length > 0)
                    return lineGen.curve(d3.curveNatural)(d.SmoothDataPoints);
                return lineGen(d.DataPoints);
            })

        lines.exit().remove();


        container.select(".DataContainer").selectAll(".Bar").data(rectData).exit().remove();
        container.select(".DataContainer").selectAll(".Point").data(pointData).exit().remove();


        updateLimits();

    }

    // This Function should be called anytime the Scale changes as it will adjust the Axis, Path and Points
    function updateLimits() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        container.selectAll(".xAxis").transition().call(d3.axisBottom(xScaleLblRef.current).tickFormat(d => formatFrequencyTick(d as number)).tickSizeOuter(0) as any);

        const offsetLeft = xScaleRef.current.step() * xScaleRef.current.paddingOuter() * xScaleRef.current.align() * 2 + 0.5 * xScaleRef.current.bandwidth();
        const offsetRight = xScaleRef.current.step() * xScaleRef.current.paddingOuter() * (1 - xScaleRef.current.align()) * 2 + 0.5 * xScaleRef.current.bandwidth();

        xScaleLblRef.current.range([60 + offsetLeft, props.width - 110 - offsetRight]);
        container.select('.xAxisExtLeft').attr("x2", 60 + offsetLeft)
        container.select('.xAxisExtRight').attr("x2", props.width - 110 - offsetRight)

        let barGen = (unit: OpenSee.Unit, base: number) => {
            //Determine Factors
            let factor = 1.0;
            if (activeUnit?.[unit]) {
                factor = activeUnit[unit].factor
                if (factor === undefined)  //p.u case
                    factor = 1.0 / base
            }

            return (d) => {
                return yScaleRef.current[d.unit](d.data[1] * factor)
            }
        }

        container.select(".DataContainer").selectAll(".Bar").selectAll('rect')
            .attr("x", (d: OpenSee.BarSeries) => { let v = xScaleRef.current(d.data[0]); return (isNaN(v) ? 0.0 : v) })
            .style("opacity", (d: OpenSee.BarSeries) => { let v = xScaleRef.current(d.data[0]); return (isNaN(v) ? 0.0 : 1.0) })
            .attr("y", (d: OpenSee.BarSeries) => { let y = barGen(d.unit, d.base)(d); return (isNaN(y) ? 0 : y) })
            .attr("width", Math.max(xScaleRef.current.bandwidth()))
            .attr("height", (d: OpenSee.BarSeries) => {
                let h = barGen(d.unit, d.base)(d)
                if (isNaN(h))
                    return 0
                return Math.max(((props.height - 40) - barGen(d.unit, d.base)(d)), 0)
            })

        container.select(".DataContainer").selectAll(".Point").selectAll('circle')
            .attr("cx", (d: OpenSee.BarSeries) => { let v = (xScaleRef.current(d.data[0])) + (xScaleRef.current.bandwidth() / 2); return (isNaN(v) ? 0 : v) })
            .style("opacity", (d: OpenSee.BarSeries) => { let v = xScaleRef.current(d.data[0]); return (isNaN(v) ? 0.0 : 1.0) })
            .attr("cy", (d: OpenSee.BarSeries) => (isNaN(yScaleRef.current[d.unit](d.data[0])) ? -1 : (barGen(d.unit, d.base)(d))))
            .attr("r", (d: OpenSee.BarSeries) => { let v = xScaleRef.current(d.data[0]); return (isNaN(v) ? 0.0 : 5) })

        updateYAxises();

    }


    function createPlot() {
        d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId + ">svg").select("g.root").remove()

        let svg = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId).select("svg")
            .append("g").classed("root", true)
            .attr("transform", "translate(10,0)");

        // Set yScales
        if (yLimits) {
            Object.keys(yLimits).forEach(unit => {
                if (yLimits?.[unit])
                    yScaleRef.current[unit] = d3.scaleLinear().domain(yLimits?.[unit]).range([props.height - 40, 20]);
                else
                    yScaleRef.current[unit] = d3.scaleLinear().domain([0, 1]).range([props.height - 40, 20]);
            })
        }

        // We can assume consistent sampling rate for now
        let domain = barData[0].DataPoints.filter(pt => pt[0] >= xLimits[0] && pt[0] <= xLimits[1]).map(pt => pt[0]);
        xScaleRef.current = d3.scaleBand(domain, [60, props.width - 150])

        const offsetLeft = xScaleRef.current.step() * xScaleRef.current.paddingOuter() * xScaleRef.current.align() * 2 + 0.5 * xScaleRef.current.bandwidth();
        const offsetRight = xScaleRef.current.step() * xScaleRef.current.paddingOuter() * (1 - xScaleRef.current.align()) * 2 + 0.5 * xScaleRef.current.bandwidth();

        xScaleLblRef.current = d3.scaleLinear().domain([(domain[0] * 60.0), (domain[domain.length - 1] * 60.0)]).range([60 + offsetLeft, props.width - 110 - offsetRight]);

        //create xAxis 
        svg.append("g").classed("xAxis", true).attr("transform", "translate(0," + (props.height - 40) + ")").call(() => d3.axisBottom(xScaleRef.current).tickFormat((d, i) => formatFrequencyTick(d as number)).tickSize(6));

        let isAxisLeft = true;
        let axisCount = 0;

        //Create yAxises
        relevantUnits.forEach(unit => {
            let axisTransform = isAxisLeft ? "translate(60,0)" : `translate(${props.width - 110},0)`;
            const enabledUnit = enabledUnits.includes(unit)

            svg.append("g")
                .classed(`yAxis`, true)
                .attr("type", `${unit}`)
                .attr("transform", axisTransform)
                .call(isAxisLeft ? d3.axisLeft(yScaleRef.current[unit]).tickFormat(d => formatValueTick(d as number, unit)) : d3.axisRight(yScaleRef.current[unit]).tickFormat(d => formatValueTick(d as number, unit)))
                .style("opacity", enabledUnit ? 1 : 0)

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
                .style("opacity", enabledUnit ? 1 : 0)
                .text(yLabels[unit]);

            isAxisLeft = !isAxisLeft;
            axisCount++;

        });
        //Create Axis Labels
        svg.append("text").classed("xAxisLabel", true)
            .attr("transform", "translate(" + ((props.width - 210) / 2 + 60) + " ," + (props.height - 10) + ")")
            .style("text-anchor", "middle")
            .text('Harmonic (Hz)');

        // Create Plot Title
        svg.append("text").classed("plotTitle", true)
            .attr("transform", "translate(" + ((props.width - 210) / 2 + 60) + ", 20)")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text(dataKey.DataType);

        svg.append("line").classed("xAxisExtLeft", true)
            .attr("stroke", "currentColor")
            .attr("x1", 60).attr("x2", 60 + offsetLeft)
            .attr("y1", props.height - 40).attr("y2", props.height - 40)

        svg.append("line").classed("xAxisExtRight", true)
            .attr("stroke", "currentColor")
            .attr("x1", props.width - 110).attr("x2", props.width - 110 - offsetRight)
            .attr("y1", props.height - 40).attr("y2", props.height - 40)


        //Add Clip Path
        svg.append("defs").append("svg:clipPath")
            .attr("id", "clip-" + props.dataKey.DataType + "-" + props.dataKey.EventId)
            .append("svg:rect").classed("clip", true)
            .attr("width", props.width - 170)
            .attr("height", props.height - 60)
            .attr("x", 60)
            .attr("y", 20);


        //Add Window to indicate Zooming
        svg.append("rect").classed("zoomWindow", true)
            .attr("stroke", "#000")
            .attr("x", 60).attr("width", 0)
            .attr("y", 20).attr("height", props.height - 40)
            .attr("fill", "black")
            .style("opacity", 0);


        //Add Empty group for Data Points
        svg.append("g").classed("DataContainer", true)
            .attr("clip-path", "url(#clip-" + props.dataKey.DataType + "-" + props.dataKey.EventId + ")");

        //Event overlay
        svg.append("svg:rect").classed("Overlay", true)
            .attr("width", props.width - 110)
            .attr("height", '100%')
            .attr("x", 20)
            .attr("y", 0)
            .style("opacity", 0)
            .on('mousemove', MouseMove)
            .on('mouseout', MouseOut)
            .on('mousedown', MouseDown)
            .on('mouseup', MouseUp)
    }


    function formatValueTick(d: number, unit) {
        let h = 1;

        if (yScaleRef.current != undefined)
            h = yScaleRef.current[unit].domain()[1] - yScaleRef.current[unit].domain()[0]

        if (h > 100)
            return d.toFixed(0)

        if (h > 10)
            return d.toFixed(1)
        if (h > 1)
            return d.toFixed(2)
        else
            return d.toFixed(3)

    }

    function formatFrequencyTick(d: number) {
        let h = 1;

        if (xScaleLblRef.current != undefined)
            h = xScaleLblRef.current.domain()[1] - xScaleLblRef.current.domain()[0]

        if (h > 100)
            return d.toFixed(0)

        if (h > 10)
            return d.toFixed(1)
        if (h > 1)
            return d.toFixed(2)
        else
            return d.toFixed(3)

    }

    function MouseMove(evt) {

        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        let x0 = d3.pointer(evt, container.select(".Overlay").node())[0];
        let y0 = d3.pointer(evt, container.select(".Overlay").node())[1];
        let t0 = getXbucket(x0);
        let d0 = (yScaleRef.current[primaryAxis] as any).invert(y0);
        setHover([t0, d0])
    }

    function MouseDown(evt) {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        let x0 = d3.pointer(evt, container.select(".Overlay").node())[0];
        let y0 = d3.pointer(evt, container.select(".Overlay").node())[1];

        let t0 = getXbucket(x0);
        let d0 = (yScaleRef.current[primaryAxis] as any).invert(y0);

        setMouseDown(true);
        setPointMouse([t0, d0]);

    }

    function MouseUp() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        setMouseDown(false);
        container.select(".zoomWindow").style("opacity", 0);

    }

    function getXbucket(pixel: number) {

        let scaleSize = xScaleRef.current.range();
        let p = pixel - scaleSize[0];

        let eachBand = xScaleRef.current.step();

        let index = Math.floor((p / eachBand));
        if (index == xScaleRef.current.domain().length)
            index = index - 1

        return xScaleRef.current.domain()[index];
    }

    // This function needs to be called if hover is updated
    function updateHover() {

        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        if (mouseMode == 'zoom' && mouseDown) {
            if (zoomMode == "x")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", (xScaleRef.current as any)(Math.min(hover[0], pointMouse[0])) + 0.5 * (xScaleRef.current.bandwidth()))
                    .attr("width", Math.abs((xScaleRef.current as any)(hover[0]) - (xScaleRef.current as any)(pointMouse[0])))
                    .attr("height", props.height - 60)
                    .attr("y", 20)
            else if (zoomMode == "y")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", (xScaleRef.current as any)(xLimits[0]))
                    .attr("width", (xScaleRef.current as any)(xLimits[1]) - (xScaleRef.current as any)(xLimits[0]))
                    .attr("height", Math.abs((yScaleRef.current[primaryAxis] as any)(pointMouse[1]) - (yScaleRef.current[primaryAxis] as any)(hover[1])))
                    .attr("y", Math.min((yScaleRef.current[primaryAxis] as any)(pointMouse[1]), (yScaleRef.current[primaryAxis] as any)(hover[1])))
            else if (zoomMode == "xy")
                container.select(".zoomWindow").style("opacity", 0.5)
                    .attr("x", (xScaleRef.current as any)(Math.min(hover[0], pointMouse[0])))
                    .attr("width", Math.abs((xScaleRef.current as any)(hover[0]) - (xScaleRef.current as any)(pointMouse[0])))
                    .attr("height", Math.abs((yScaleRef.current[primaryAxis] as any)(pointMouse[1]) - (yScaleRef.current[primaryAxis] as any)(hover[1])))
                    .attr("y", Math.min((yScaleRef.current[primaryAxis] as any)(pointMouse[1]), (yScaleRef.current[primaryAxis] as any)(hover[1])))
        }

        let deltaT = hover[0] - pointMouse[0];
        let deltaData = hover[1] - pointMouse[1];

        if (mouseMode == 'pan' && mouseDown && (zoomMode == "x" || zoomMode == "xy") && Math.abs(deltaT) > 0)
            dispatch(SetFFTLimits({ start: (xLimits[0] - deltaT), end: (xLimits[1] - deltaT) }));

        if (mouseMode == 'pan' && mouseDown && (zoomMode == "y" || zoomMode == "xy"))
            dispatch(SetZoomedLimits({ limits: [(yLimits[primaryAxis][0] - deltaData), (yLimits[primaryAxis][1] - deltaData)], key: props.dataKey }));
    }

    function updateYAxises() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        let svg = container.select(".DataContainer");

        if (container === undefined)
            return

        //Flag to alternate axis placement
        let isAxisLeft = true; //this can just be exchanged for a % 2 since we have a counter now.
        let currentAxis = 0;

        //Update yAxises
        enabledUnits?.forEach(unit => {
            let axisType = `[type='${unit}']`;
            let firstLeftAxisType = `[type='${enabledUnits[0]}']`
            let firstRightAxisType = `[type='${enabledUnits[1]}']`

            if (isAxisLeft) {
                container.selectAll(`.yAxis${axisType}`).transition().call(d3.axisLeft(yScaleRef.current[unit]).tickFormat(d => formatValueTick(d as number, unit)) as any);

                if (currentAxis > 1) {
                    container.selectAll(`.yAxis${firstLeftAxisType}`).attr("transform", "translate(120, 0)")
                    container.selectAll(`.yAxisLabelLeft${firstLeftAxisType}`).attr("y", "62")
                }
            }
            else {
                if (currentAxis > 2) {
                    container.selectAll(`.yAxis${firstRightAxisType}`).attr("transform", `translate(${props.width - 170},0)`)
                    container.selectAll(`.yAxisLabelRight${firstRightAxisType}`).attr("y", props.width - 135)
                }
                container.selectAll(`.yAxis`).selectAll(`[type='${unit}']`).transition().call(d3.axisRight(yScaleRef.current[unit]).tickFormat(d => formatValueTick(d as number, unit)) as any);
                svg.selectAll(`path[type='axis-${unit}']`)
                    .attr("d", function (d: OpenSee.iD3DataSeries) {
                        const scopedLineGen = createLineGen(d.Unit, d.BaseValue);
                        if (d.SmoothDataPoints.length > 0)
                            return scopedLineGen.curve(d3.curveNatural)(d.SmoothDataPoints);
                        return scopedLineGen(d.DataPoints);
                    })
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

    function MouseOut() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        container.select(".zoomWindow").style("opacity", 0);
        setMouseDown(false);
    }


    //This Function needs to be called whenever (a) Color Setting changes occur
    function updateColors() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);

        function GetColor(col: OpenSee.Color) {
            return colors[col as string]
        }

        container.select(".DataContainer").selectAll(".Bar").attr("fill", (d: OpenSee.iD3DataSeries) => GetColor(d.Color));

    }


    //This Function needs to be called whenever a item is selected or deselected in the Legend
    function updateVisibility() {
        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        if (barData) {
            //.transition().duration(1000) leads to a performance issue. need to investigate how to avoid this
            const rectData = barData.filter(d => d.LegendHorizontal === "Mag")
            container.select(".DataContainer").selectAll(".Bar").data(rectData).classed("active", d => d.Enabled)
            container.select(".DataContainer").selectAll(".Bar.active").style("opacity", 1.0);
            container.select(".DataContainer").selectAll(".Bar:not(.active)").style("opacity", 0);

            const pointData = barData.filter(d => d.LegendHorizontal === "Ang")

            container.select(".DataContainer").selectAll(".Point").data(pointData).classed("active", d => d.Enabled)
            container.select(".DataContainer").selectAll(".Line").data(pointData).classed("active", d => d.Enabled)
            container.select(".DataContainer").selectAll(".Line.active").style("opacity", 1.0);
            container.select(".DataContainer").selectAll(".Line:not(.active)").style("opacity", 0);


            container.select(".DataContainer").selectAll(".Point.active").style("opacity", 1.0);
            container.select(".DataContainer").selectAll(".Point:not(.active)").style("opacity", 0);

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

    }


    // This Function needs to be called whenever height or width change
    function updateSize() {

        let container = d3.select("#graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId);
        container.select(".xAxis").attr("transform", "translate(0," + (props.height - 40) + ")");

        container.select(".xAxisLabel").attr("transform", "translate(" + ((props.width - 210) / 2 + 60) + " ," + (props.height - 5) + ")")
        container.select(".plotTitle").attr("transform", "translate(" + ((props.width - 210) / 2 + 60) + ",20)").style("font-weight", "bold")

        container.select(".yAxisLabelLeft").attr("x", - (props.height / 2 - 20))
        container.select(".yAxisLabelRight").attr("y", props.width - 120).attr("x", - (props.height / 2 - 20))
        xScaleRef.current.range([60, props.width - 110]);
        container.select(".yAxisRight").attr("transform", "translate(" + (props.width - 150) + ",0)");

        const offsetLeft = xScaleRef.current.step() * xScaleRef.current.paddingOuter() * xScaleRef.current.align() * 2 + 0.5 * xScaleRef.current.bandwidth();
        const offsetRight = xScaleRef.current.step() * xScaleRef.current.paddingOuter() * (1 - xScaleRef.current.align()) * 2 + 0.5 * xScaleRef.current.bandwidth();

        xScaleLblRef.current.range([60 + offsetLeft, props.width - 110 - offsetRight]);

        container.select('.xAxisExtLeft')
            .attr("x2", 60 + offsetLeft)
            .attr("y1", props.height - 40)
            .attr("y2", props.height - 40)

        container.select('.xAxisExtRight')
            .attr("x2", props.width - 140 - offsetRight)
            .attr("y1", props.height - 40)
            .attr("y2", props.height - 40)
            .attr("x1", props.width - 140)

        relevantUnits.forEach(unit => {
            yScaleRef.current[unit].range([props.height - 40, 20]);
        })

        container.select(".clip").attr("height", props.height - 60).attr("width", props.width - 210)
        container.select(".Overlay").attr("width", props.width - 210)

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
            <Container key={props.dataKey.DataType + props.dataKey.EventId + "container"} eventID={props.dataKey.EventId} height={props.height} loading={loading} type={props.dataKey.DataType} hasData={barData?.length > 0} hasTrace={enabledBar.some(i => i)} />
            {loading == 'Loading' || barData?.length == 0 ? null : <Legend key={props.dataKey.DataType + props.dataKey.EventId} height={props.height} dataKey={{ DataType: props.dataKey.DataType, EventId: props.dataKey.EventId }} />}
        </div>
    );
}

const Container = React.memo((props: { height: number, eventID: number, type: OpenSee.graphType, loading: OpenSee.LoadingState, hasData: boolean, hasTrace: boolean }) => {
    const showSVG = props.loading != 'Loading' && props.hasData;

    return (
        <div data-drawer={"graphWindow-" + props.type + "-" + props.eventID} id={"graphWindow-" + props.type + "-" + props.eventID} style={{ height: props.height, float: 'left', width: '100%' }}>
            {props.loading == 'Loading' ? <LoadingIcon /> : null}
            {props.loading != 'Loading' && !props.hasData ? <NoDataIcon /> : null}
            <svg className="root" style={{ width: (showSVG ? '100%' : 0), height: (showSVG ? '100%' : 0) }}>
                {props.loading != 'Loading' && props.hasData && !props.hasTrace ?
                    <text x={'50%'} y={'45%'} style={{ textAnchor: 'middle', fontSize: 'x-large' }} > Select a Trace in the Legend to Display. </text> : null}
            </svg>
        </div>)
})

export default BarChart;

