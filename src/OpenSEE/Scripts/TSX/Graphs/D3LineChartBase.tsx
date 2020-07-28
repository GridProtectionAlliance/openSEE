//******************************************************************************************************
//  D3LineChartBase.ts - Gbtc
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
//  01/06/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React  from 'react';
import { clone, isEqual, each, findLast, cloneDeep } from "lodash";
import * as d3 from '../../D3/d3';

import { utc } from "moment";
import D3Legend from './D3Legend';
import { StandardAnalyticServiceFunction } from '../../TS/Services/OpenSEE';
import moment from "moment"
import duration from "moment"
import { GraphUnits, Colors, yLimits } from '../jQueryUI Widgets/SettingWindow';

export type LegendClickCallback = (event?: React.MouseEvent<HTMLDivElement>, index?: Array<number>, enabled?: boolean) => void;
export type GetDataFunction = (props: D3LineChartBaseProps, ctrl: D3LineChartBase) => void;
export type ZoomMode = "x" | "y" | "xy"
export type MouseMode = "pan" | "zoom" | "collect"


export interface D3LineChartBaseProps {
    eventId: number,
    compareEvents: Array<number>,
    startTime: number,
    endTime: number,
    stateSetter: Function,
    height: number,
    width: number,
    hover: number,
    unitSettings: GraphUnits,
    colorSettings: Colors,
    zoomMode: ZoomMode,
    yLimits: yLimits,
    mouseMode: MouseMode,
    options?: D3PlotOptions,
    fftStartTime?: number,
    fftWindow?: number,
    tableSetter?: Function,
    activeUnitSetter?: (fx: Function, plotLbl: string) => void,
};

interface D3LineChartBaseClassProps extends D3LineChartBaseProps{
    legendKey: string,
    openSEEServiceFunction: StandardAnalyticServiceFunction,
    getData?: GetDataFunction,   
}

export interface D3PlotOptions {
    showXLabel: boolean,
}

export interface iD3DataSet {
    Data: Array<iD3DataSeries>,
    EventStartTime: number,
    EventEndTime: number,
    FaultTime: number
}

export interface iD3DataSeries {
    LegendHorizontal: string,
    LegendVertical: string,
    LegendGroup: string,

    ChannelID: number,
    ChartLabel: string,

    Unit: string,
    Color: string,

    Display: boolean,
    Enabled: boolean,
    
    LegendClass: string,
    SecondaryLegendClass: string,


    BaseValue: number,
    DataPoints: Array<[number, number]>,
    DataMarker: Array<[number, number]>,

    path?: any,
}

export interface iActiveUnits extends GraphUnits {
    TimeLimits?: [number, number],
    Tstart?: number
}

interface D3LineChartBaseState {
    dataSet: iD3DataSet, dataHandle: JQuery.jqXHR
}

// Obsolete
export interface iD3DataPoint {
    LegendHorizontal: string,
    ChannelID: number,
    ChartLabel: string,
    XaxisLabel: string,
    Color: string,
    LegendKey: string,
    Enabled: boolean,
    BaseValue: number,

    LegendClass: string,
    LegendGroup: string,
    SecondaryLegendClass: string,
    Value: number,
    Time: number,
}

export default class D3LineChartBase extends React.Component<D3LineChartBaseClassProps, any>{

    //Graph Elements from D3
    yAxis: any;
    xAxis: any;
    yScale: any;
    xScale: any;
    area: any;
    xlabel: any;
    ylabel: any;

    paths: any;
    brush: any;
    
    mousedownPos: { x: number, y: number, t: number, data: number };
    isMouseDown: boolean;
    hover: any;

    cycle: any;
    movingCycle: boolean;

    ActiveUnits: iActiveUnits;

    cycleStart: number;
    cycleEnd: number;

    yMax: number;
    yMin: number;
    dataMax: number;
    dataMin: number;

    

    state: D3LineChartBaseState

    constructor(props, context) {
        super(props, context);
        var ctrl = this;
        this.movingCycle = false;

        ctrl.state = {
            dataSet: {
                Data: null,
                EventEndTime: 0,
                EventStartTime: 0,
                FaultTime: 0
            } , 
            dataHandle: undefined,
        };
        
        if (ctrl.props.getData != undefined) ctrl.getData = (props) => ctrl.props.getData(props, ctrl);
        

        ctrl.mousedownPos = { x: 0, y: 0, t: 0, data: 0 };
        ctrl.isMouseDown = false;
    }

    componentDidMount() {
        this.createPlot();

        this.getData(this.props);

        if (this.props.activeUnitSetter !== undefined) this.props.activeUnitSetter(this.GetCurrentUnit.bind(this), this.props.legendKey);
    }

    componentWillUnmount() {
        if (this.state.dataHandle !== undefined && this.state.dataHandle.abort !== undefined) {
            this.state.dataHandle.abort();
            this.setState({ dataHandle: undefined });
        }
    }

    getData(props: D3LineChartBaseProps) {
        var handle = this.props.openSEEServiceFunction(props.eventId).then((data: iD3DataSet) => {
            if (data == null) {
                return;
            }

            this.addData(data, this)

            
            if (this.props.endTime == 0) this.props.stateSetter({ graphEndTime: this.props.endTime });
            if (this.props.startTime == 0) this.props.stateSetter({ graphStartTime: this.props.startTime });



        });
        this.setState({ dataHandle: handle });

    }

    createPlot() {
        
        var ctrl = this;
        // remove the previous SVG object
        d3.select("#graphWindow-" + this.props.legendKey + "-" + this.props.eventId + ">svg").remove()

        //add new Plot
        var container = d3.select("#graphWindow-" + this.props.legendKey + "-" + this.props.eventId);

        var svg = container.append("svg")
            .attr("width", '100%')
            .attr("height", this.props.height).append("g")
            .attr("transform", "translate(40,10)");

        // First Thing is we Resolve any auto Units properly
        this.updateYLimits(ctrl)
        this.ActiveUnits = this.resolveAutoScale(ctrl)
        this.updateYLimits(ctrl)

        //Then Create Axisis
        this.yScale = d3.scaleLinear()
            .domain([ctrl.yMin, ctrl.yMax])
            .range([this.props.height - 60, 0]);

        this.xScale = d3.scaleLinear()
            .domain([this.props.startTime, this.props.endTime])
            .range([20, container.node().getBoundingClientRect().width - 100])
            ;

        this.yAxis = svg.append("g").attr("transform", "translate(20,0)").call(d3.axisLeft(this.yScale).tickFormat((d, i) => this.formatValueTick(ctrl, d)));

        this.xAxis = svg.append("g").attr("transform", "translate(0," + (this.props.height - 60) + ")").call(d3.axisBottom(this.xScale).tickFormat((d, i) => this.formatTimeTick(ctrl, d)));

        if (this.props.options.showXLabel) {
            let timeLabel = this.getTimeAxisLabel(this)

            this.xlabel = svg.append("text")
                .attr("transform", "translate(" + ((container.node().getBoundingClientRect().width - 100) / 2) + " ," + (this.props.height - 20) + ")")
                .style("text-anchor", "middle")
                .text(timeLabel);
        }
        else
            this.xlabel = svg.append("text")
                .attr("transform", "translate(" + ((container.node().getBoundingClientRect().width - 100) / 2) + " ," + (this.props.height - 20) + ")")
                .style("text-anchor", "middle")
                .text("");

        //Add Ylabel
        let yUnitLabel = ""
        if (ctrl.state.dataSet.Data != null)
            yUnitLabel = this.getYAxisLabel(ctrl)

        this.ylabel = svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -30)
            .attr("x", -(this.props.height / 2 - 30))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yUnitLabel);

        //Add Hover
        this.hover = svg.append("line")
            .attr("stroke", "#000")
            .attr("x1", 10).attr("x2", 10)
            .attr("y1", 0).attr("y2", this.props.height - 60)
            .style("opacity", 0.5);

        //Add clip Path
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip-" + this.props.legendKey)
            .append("svg:rect")
            .attr("width", 'calc(100% - 120px)')
            .attr("height", this.props.height - 60)
            .attr("x", 20)
            .attr("y", 0);
        //Add Zoom Window
        this.brush = svg.append("rect")
            .attr("stroke", "#000")
            .attr("x", 10).attr("width", 0)
            .attr("y", 0).attr("height", this.props.height - 60)
            .attr("fill", "black")
            .style("opacity", 0);

        this.paths = svg.append("g").attr("id", "path-" + this.props.legendKey).attr("clip-path", "url(#clip-" + this.props.legendKey + ")");

        if (this.state.dataSet.Data !== null)
            ctrl.setState(function (state, props) {
                let ste = cloneDeep(state.dataSet)
                    ste.Data = state.dataSet.Data.map(item => {
                        let row = item;
                        if (row.Enabled)
                            row.path = ctrl.paths.append("path").datum(row.DataPoints.map(item => { return { x: item[0], y: item[1], unit: row.Unit, base: row.BaseValue, color: row.Color } })).attr("fill", "none")
                                .attr("stroke", ctrl.getColor(ctrl, row.Color))
                                .attr("stroke-width", 2.0)
                                .attr("d", d3.line()
                                    .x(function (d) { return ctrl.xScale(ctrl.AdjustX(ctrl, d)) })
                                    .y(function (d) { return ctrl.yScale(ctrl.AdjustY(ctrl, d)) })
                                    .defined(function (d) {
                                        let tx = !isNaN(parseFloat(ctrl.xScale(ctrl.AdjustX(ctrl, d))));
                                        let ty = !isNaN(parseFloat(ctrl.yScale(ctrl.AdjustY(ctrl, d))));
                                        return tx && ty;
                                    })
                            );
                        else
                            row.path = null
                        return row;
                    });
                return { dataSet: ste };
            });

        this.area = svg.append("g").append("svg:rect")
            .attr("width", 'calc(100% - 120px)')
            .attr("height", '100%')
            .attr("x", 20)
            .attr("y", 0)
            .style("opacity", 0)
            .on('mousemove', function () { ctrl.mousemove(ctrl) })
            .on('mouseout', function () { ctrl.mouseout(ctrl) })
            .on('mousedown', function () { ctrl.mousedown(ctrl) })
            .on('mouseup', function () { ctrl.mouseup(ctrl) })

        if (this.state.dataSet.Data == null) {
            return;
        }

        this.updateLines(this);
        this.updatePlot(this);
       
    }

    addData(data: iD3DataSet, ctrl: D3LineChartBase, clear?: boolean) {

        clear = (clear == undefined ? false : clear);

        ctrl.setState(function (state, props) {
            let ste = cloneDeep(state.dataSet)

            if (ste.EventEndTime === 0)
                ste.EventEndTime = data.EventEndTime;

            if (ste.EventStartTime === 0)
                ste.EventStartTime = data.EventStartTime;

            if (ste.Data !== null && !clear)
                ste.Data = state.dataSet.Data.concat(data.Data.map(item => {
                    let row = item;
                    if (ctrl.paths !== undefined) {
                        row.path = ctrl.paths.append("path").datum(row.DataPoints.map(item => { return { x: item[0], y: item[1], unit: row.Unit, base: row.BaseValue, color: row.Color} })).attr("fill", "none")
                            .attr("stroke", ctrl.getColor(ctrl, row.Color))
                            .attr("stroke-width", 2.0)
                            .attr("d", d3.line()
                                .x(function (d) { return ctrl.xScale(ctrl.AdjustX(ctrl, d)) })
                                .y(function (d) { return ctrl.yScale(ctrl.AdjustY(ctrl, d)) })
                                .defined(function (d) {
                                    let tx = !isNaN(parseFloat(ctrl.xScale(ctrl.AdjustX(ctrl, d))));
                                    let ty = !isNaN(parseFloat(ctrl.yScale(ctrl.AdjustY(ctrl, d))));
                                    return tx && ty;
                                })
                            );
                    }
                    else
                        row.path = null;

                    return row;
                }));
            else
                ste.Data = data.Data.map(item => {
                    let row = item;

                    if (ctrl.paths !== undefined) {
                        row.path = ctrl.paths.append("path").datum(row.DataPoints.map(item => { return { x: item[0], y: item[1], unit: row.Unit, base: row.BaseValue, color: row.Color} })).attr("fill", "none")
                            .attr("stroke", ctrl.getColor(ctrl, row.Color))
                            .attr("stroke-width", 2.0)
                            .attr("d", d3.line()
                                .x(function (d) { return ctrl.xScale(ctrl.AdjustX(ctrl, d)) })
                                .y(function (d) { return ctrl.yScale(ctrl.AdjustY(ctrl, d)) })
                                .defined(function (d) {
                                    let tx = !isNaN(parseFloat(ctrl.xScale(ctrl.AdjustX(ctrl, d))));
                                    let ty = !isNaN(parseFloat(ctrl.yScale(ctrl.AdjustY(ctrl, d))));
                                    return tx && ty;
                                })
                            );
                    }
                    else
                        row.path = null

                    return row;
                });

            return { dataSet: ste};
        });
    }

    updatePlot(ctrl: D3LineChartBase) {
        // Update Units
        ctrl.updateYLimits(ctrl)
        ctrl.ActiveUnits = ctrl.resolveAutoScale(ctrl)
        ctrl.updateYLimits(ctrl)

        if (ctrl.paths == undefined)
            ctrl.createPlot();

        let t = 0;
        if (ctrl.props.mouseMode == "zoom")
            t = 1000

        //Update Axis
        ctrl.xScale.domain([ctrl.props.startTime, ctrl.props.endTime]);
        ctrl.updateTimeAxis(ctrl)
        ctrl.ActiveUnits.TimeLimits = [ctrl.props.endTime, ctrl.props.startTime]
        ctrl.ActiveUnits.Tstart = ctrl.state.dataSet.EventStartTime


        ctrl.yScale.domain([ctrl.yMin, ctrl.yMax]);
        ctrl.ylabel.text(ctrl.getYAxisLabel(ctrl))
        ctrl.yAxis.transition().duration(t).call(d3.axisLeft(ctrl.yScale).tickFormat((d, i) => ctrl.formatValueTick(ctrl, d)))

        //Set Colors, update Visibility and Points
        ctrl.paths.selectAll('path')
            .transition()
            .duration(t)
            .attr("d", d3.line()
                .x(function (d) {
                    return ctrl.xScale(ctrl.AdjustX(ctrl, d))
                })
                .y(function (d) {
                    return ctrl.yScale(ctrl.AdjustY(ctrl, d))
                })
                .defined(function (d) {
                    let tx = !isNaN(parseFloat(ctrl.xScale(ctrl.AdjustX(ctrl, d))));
                    let ty = !isNaN(parseFloat(ctrl.yScale(ctrl.AdjustY(ctrl, d))));
                    return tx && ty;
                })
        ).attr('stroke', function (d) { return ctrl.getColor(ctrl, d[0].color) });

        

    }

    updateLines(ctrl: D3LineChartBase) {

        if (ctrl.state.dataSet.Data == null)
            return;

        ctrl.state.dataSet.Data.map(item => {
            let row = item;
            if (!row.Enabled && row.path !== null) {
                row.path.remove()
                row.path = null
            }
            if (row.Enabled && row.path == null )
                row.path = ctrl.paths.append("path").datum(row.DataPoints.map(item => { return { x: item[0], y: item[1], unit: row.Unit, base: row.BaseValue, color: row.Color } })).attr("fill", "none")
                    .attr("stroke", ctrl.getColor(ctrl, row.Color))
                    .attr("stroke-width", 2.0)
                    .attr("d", d3.line()
                        .x(function (d) { return ctrl.xScale(ctrl.AdjustX(ctrl, d)) })
                        .y(function (d) { return ctrl.yScale(ctrl.AdjustY(ctrl, d)) })
                        .defined(function (d) {
                            let tx = !isNaN(parseFloat(ctrl.xScale(ctrl.AdjustX(ctrl, d))));
                            let ty = !isNaN(parseFloat(ctrl.yScale(ctrl.AdjustY(ctrl, d))));
                            return tx && ty;
                        })
                    );
        });

    }

    componentDidUpdate(prevProps: D3LineChartBaseClassProps, prevState: D3LineChartBaseState) {

  
        var nextPropsClone = clone(this.props) as any;
        var props = clone(prevProps);

        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
      
        delete props.openSEEServiceFunction;
        delete nextPropsClone.openSEEServiceFunction;

        delete props.getData;
        delete nextPropsClone.getData;

        delete props.hover;
        delete nextPropsClone.hover;

        delete props.legendKey;
        delete nextPropsClone.legendKey;

        delete props.tableSetter;
        delete nextPropsClone.tableSetter;

        delete props.zoomMode;
        delete nextPropsClone.zoomMode;

        delete props.mouseMode;
        delete nextPropsClone.mouseMode;

        delete props.height;
        delete nextPropsClone.height
        delete props.width;
        delete nextPropsClone.width;

        delete props.yLimits;
        delete nextPropsClone.yLimits;

        delete props.compareEvents;
        delete nextPropsClone.compareEvents;

        delete props.activeUnitSetter;
        delete nextPropsClone.activeUnitSetter;
        
        if (this.props.hover != null && prevProps.hover != this.props.hover) {
            this.updateHover(this, this.props.hover);
        }

        if ((prevProps.legendKey != this.props.legendKey) || (!isEqual(this.props.compareEvents, prevProps.compareEvents))) {
            if (this.props.activeUnitSetter !== undefined) this.props.activeUnitSetter(this.GetCurrentUnit.bind(this), this.props.legendKey);
            this.createPlot();
            this.getData(this.props);
            return;
        }

        if ((prevProps.height != this.props.height) || (prevProps.width != this.props.width)) {
            this.createPlot();
            return;
        }

        if (prevProps.yLimits.auto != this.props.yLimits.auto) {
            this.updatePlot(this);
        }

        if (((prevProps.yLimits.max != this.props.yLimits.max) || (prevProps.yLimits.min != this.props.yLimits.min)) && !this.props.yLimits.auto) {
            this.updatePlot(this);
        }

        if (!(isEqual(prevState, this.state))) {
           this.updateLines(this);
           this.updatePlot(this);
           return;
        }

        
        if (!(isEqual(props, nextPropsClone))) {
            this.updatePlot(this);
        }
        
    }

    AdjustX(ctrl: D3LineChartBase, d: any) {
        return d.x
    }

    AdjustY(ctrl: D3LineChartBase, d: any) {
        if (ctrl.ActiveUnits[d.unit] == undefined)
            return d.y
        if (ctrl.ActiveUnits[d.unit].current.Short == "pu")
            return d.y / d.base;

        return d.y * ctrl.ActiveUnits[d.unit].current.Factor
    }

    AdjustTime(ctrl: D3LineChartBase, d: number) {
        let a = { x: d }
        return ctrl.AdjustX(ctrl, a);
    }

    formatTimeTick(ctrl: D3LineChartBase, d: number) {
       let TS = moment(d);
       let h = ctrl.xScale.domain()[1] - ctrl.xScale.domain()[0]

        if (ctrl.props.unitSettings.Time.current.Short == 'auto') {
            if (h < 100)
                return TS.format("SSS.S")
            else if (h < 1000)
                return TS.format("ss.SS")
            else
                return TS.format("ss.S")
        }
        else if (ctrl.props.unitSettings.Time.current.Short == 's') {
            if (h < 100)
                return TS.format("ss.SSS")
            else if (h < 1000)
                return TS.format("ss.SS")
            else
                return TS.format("ss.S")
        }
        else if (ctrl.props.unitSettings.Time.current.Short == 'ms')
            if (h < 100)
                return TS.format("SSS.S")
            else
                return TS.format("SSS")

        else if (ctrl.props.unitSettings.Time.current.Short == 'min')
            return TS.format("mm:ss")

        else if (ctrl.props.unitSettings.Time.current.Short == 'ms since event') {
            let ms = d - ctrl.state.dataSet.EventStartTime
            if (h < 2)
                return ms.toFixed(3)
            if (h < 5)
                return ms.toFixed(2)
            else
                return ms.toFixed(1)
        }

        else if (ctrl.props.unitSettings.Time.current.Short == 'cycles') {
            let cyc = (d - ctrl.state.dataSet.EventStartTime) * 60.0 / 1000.0;
            h = h * 60.0 / 1000.0;
            if (h < 2)
                return cyc.toFixed(3)
            if (h < 5)
                return cyc.toFixed(2)
            else
                return cyc.toFixed(1)
        }
    }

    formatValueTick(ctrl: D3LineChartBase, d: number) {
       
        let h = ctrl.yScale.domain()[1] - ctrl.yScale.domain()[0]
       
        if (h > 100) 
            return d.toFixed(0)
            
        if (h > 10)
            return d.toFixed(1)
        else
            return d.toFixed(2)
        
    }

    mousemove(ctrl: D3LineChartBase) {
        
        // t is in ms, x,y are in px, d is in Units (see ActiveUnits to get actual units depending on line)
        var t0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);
        var d0 = ctrl.yScale.invert(d3.mouse(ctrl.area.node())[1]);
        var x0 = d3.mouse(ctrl.area.node())[0];
        var y0 = d3.mouse(ctrl.area.node())[1];

        let selectedData = t0

        if (!ctrl.state.dataSet.Data)
            return

        if (ctrl.state.dataSet.Data.length > 0) {
            let i = d3.bisect(ctrl.state.dataSet.Data[0].DataPoints.map(item => item[0]), t0, 1);
            if (ctrl.state.dataSet.Data[0].DataPoints[i] != undefined)
                selectedData = ctrl.state.dataSet.Data[0].DataPoints[i][0]
            else
                selectedData = t0
        }

        //Note that we don't want to doublecall the statesetter so we only call it for Hover if we are not about to move the axis
        if (ctrl.props.mouseMode == "pan" && ctrl.isMouseDown) {
            let deltaT = t0 - ctrl.mousedownPos.t;
            let deltaData = d0 - ctrl.mousedownPos.data;

            if (ctrl.props.zoomMode == "x")
                ctrl.props.stateSetter({
                    Hover: x0,
                    startTime: ctrl.xScale.domain()[0] - deltaT,
                    endTime: ctrl.xScale.domain()[1] - deltaT,
                });
            if (ctrl.props.zoomMode == "y") {
                ctrl.props.yLimits.setter(ctrl.yScale.domain()[0] - deltaData, ctrl.yScale.domain()[1] - deltaData, false);
                ctrl.props.stateSetter({ Hover: ctrl.xScale(selectedData) });
            }
            if (ctrl.props.zoomMode == "xy") {
                ctrl.props.yLimits.setter(ctrl.yScale.domain()[0] - deltaData, ctrl.yScale.domain()[1] - deltaData, false);
                ctrl.props.stateSetter({
                    Hover: x0,
                    startTime: ctrl.xScale.domain()[0] - deltaT,
                    endTime: ctrl.xScale.domain()[1] - deltaT,
                });
            }

        }
        else
            ctrl.props.stateSetter({ Hover: ctrl.xScale(selectedData) });

        if (ctrl.props.mouseMode == "zoom") {
            //h and w are in px
            let h = ctrl.mousedownPos.x - ctrl.xScale(selectedData);
            let w = ctrl.mousedownPos.y - y0;

            if (ctrl.props.zoomMode == "x") {
                if (h < 0) {
                    ctrl.brush.attr("width", -h)
                        .attr("x", ctrl.mousedownPos.x)
                        .attr("y", 0).attr("height", this.props.height - 60)
                }
                else {
                    ctrl.brush.attr("width", h)
                        .attr("x", ctrl.xScale(selectedData))
                        .attr("y", 0).attr("height", this.props.height - 60)
                }
            }

            if (ctrl.props.zoomMode == "y") {
                if (w < 0) {
                    ctrl.brush.attr("height", -w)
                        .attr("y", ctrl.mousedownPos.y)
                        .attr("x", 20).attr("width", 'calc(100% - 120px)')

                }
                else {
                    ctrl.brush.attr("height", w)
                        .attr("y", y0)
                        .attr("x", 20).attr("width", 'calc(100% - 120px)')
                }
            }

            if (ctrl.props.zoomMode == "xy") {
                if (w < 0) {
                    ctrl.brush.attr("height", -w)
                        .attr("y", ctrl.mousedownPos.y)
                }
                else {
                    ctrl.brush.attr("height", w)
                        .attr("y", y0)
                }

                if (h < 0) {
                    ctrl.brush.attr("width", -h)
                        .attr("x", ctrl.mousedownPos.x)
                }
                else {
                    ctrl.brush.attr("width", h)
                        .attr("x", ctrl.xScale(selectedData))
                }
            }
        }
    }

    mousedown(ctrl: D3LineChartBase) {

        ctrl.isMouseDown = true;
        // create square as neccesarry
        var x0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);
        var y0 = ctrl.yScale.invert(d3.mouse(ctrl.area.node())[1]);


        ctrl.mousedownPos.x = ctrl.xScale(x0)
        ctrl.mousedownPos.y = ctrl.yScale(y0)
        ctrl.mousedownPos.t = x0
        ctrl.mousedownPos.data = y0

        //Check if we are clicking in cycle marker
        // This is unneccesarry for now
        if (ctrl.props.mouseMode == "collect") {
            if (ctrl.cycleStart && ctrl.cycleEnd) {
                if (x0 > ctrl.cycleStart && x0 < ctrl.cycleEnd) {
                    ctrl.movingCycle = true;
                    return;
                }
            }
        }

        if (ctrl.props.mouseMode == "zoom")
            ctrl.brush
                .attr("x", ctrl.mousedownPos.x)
                .attr("width", 0)
                .style("opacity", 0.25)

    }

    mouseout(ctrl: D3LineChartBase) {
        ctrl.isMouseDown = false;
        ctrl.setState({ Hover: null });
        ctrl.brush.style("opacity", 0);
        ctrl.mousedownPos = { x: 0, y: 0, t: 0, data: 0 };
    }

    mouseup(ctrl: D3LineChartBase) {

        ctrl.isMouseDown = false;

        let x0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);
        let y0 = ctrl.yScale.invert(d3.mouse(ctrl.area.node())[1]);

        let h = ctrl.mousedownPos.x - ctrl.xScale(x0);
        let w = ctrl.mousedownPos.y - ctrl.yScale(y0);


        if (ctrl.mousedownPos.x < 10) {
            ctrl.brush.style("opacity", 0);
            ctrl.mousedownPos.x = 0;
            return;
        }

        let xMouse = ctrl.xScale.invert(ctrl.mousedownPos.x)
        let yMouse = ctrl.yScale.invert(ctrl.mousedownPos.y)

        if ((Math.abs(h)) < 10 && (Math.abs(w) < 10)) {
            ctrl.props.tableSetter(ctrl.props.legendKey, ctrl.state.dataSet.Data.filter(item => item.Enabled).map(item => {
                let idx = item.DataPoints.findIndex(pt => pt[0] > x0);
                if (idx === -1)
                    idx = item.DataPoints.length - 1;
                return {
                    LegendHorizontal: item.LegendHorizontal,
                    LegendVertical: item.LegendVertical,
                    LegendGroup: item.LegendGroup,
                    Unit: item.Unit,
                    Color: item.Color,
                    Current: [0, 0],
                    Selected: [item.DataPoints[idx]],
                    ChannelName: item.ChartLabel
                }
            }));

        }


        if (ctrl.props.mouseMode == "zoom") {
            
            if (ctrl.props.zoomMode == "x") {
                if (Math.abs(xMouse - x0) > 10) {

                    if (h < 0) {
                        ctrl.props.stateSetter({ startTime: xMouse, endTime: x0 });
                    }
                    else {
                        ctrl.props.stateSetter({ startTime: x0, endTime: xMouse });
                    }
                }
            }
            if (ctrl.props.zoomMode == "y") {

                if (Math.abs(yMouse - y0) > 0.00001) {

                    if (w < 0) {
                        ctrl.props.yLimits.setter(y0, yMouse, false);
                    }
                    else {
                        ctrl.props.yLimits.setter(yMouse, y0, false);
                    }
                }
            }
            if (ctrl.props.zoomMode == "xy") {

                if (Math.abs(xMouse - x0) > 10) {

                    if (h < 0) {
                        ctrl.props.stateSetter({ startTime: xMouse, endTime: x0 });
                    }
                    else {
                        ctrl.props.stateSetter({ startTime: x0, endTime: xMouse });
                    }
                }

                if (Math.abs(yMouse - y0) > 0.00001) {

                    if (w < 0) {
                        ctrl.props.yLimits.setter(y0, yMouse, false);
                    }
                    else {
                        ctrl.props.yLimits.setter(yMouse, y0, false);
                    }
                }
            }

            ctrl.brush.style("opacity", 0);
            ctrl.mousedownPos = { x: 0, y: 0, t: 0, data: 0 };
        }        
    }

    updateHover(ctrl: D3LineChartBase, hover: number) {
        if (ctrl.hover == null)
            return;
        if (hover == null) {
            ctrl.hover.style("opacity", 0);
            return;
        }
        /*
        if (ctrl.props.tableSetter && ctrl.state.dataSet) {

            let points = [];
            ctrl.state.dataSet.Data.forEach((row, key, map) => {
                if (row.Display) {
                    let i = d3.bisect( row.DataPoints.map(item => item[0]), ctrl.xScale.invert(hover), 1);
                    if (row.DataPoints[i] != undefined) {
                        points.push({
                            ChannelID: row.ChannelID,
                            ChartLabel: row.ChartLabel,
                            Unit: row.Unit,
                            Color: row.Color,
                            LegendKey: ctrl.props.legendKey,

                            LegendClass: row.LegendClass,
                            LegendGroup: row.LegendGroup,
                            SecondaryLegendClass: row.SecondaryLegendClass,
                            Value: row.DataPoints[i][1],
                            Time: row.DataPoints[i][0],
                            BaseValue: row.BaseValue,
                            Enabled: row.Enabled
                        })
                    }
                }
            });

            ctrl.props.tableSetter(points)
           
        }
        */
        ctrl.hover.attr("x1", hover)
            .attr("x2", hover)

        ctrl.hover.style("opacity", 1);

    }

    updateTimeAxis(ctrl: D3LineChartBase) {

        let t = 0;
        if (ctrl.props.mouseMode == "zoom")
            t = 1000

        ctrl.xAxis.transition().duration(t).call(d3.axisBottom(ctrl.xScale).tickFormat((d, i) => ctrl.formatTimeTick(ctrl, d)))

        if (ctrl.props.options.showXLabel) {
            ctrl.xlabel.text(ctrl.getTimeAxisLabel(ctrl))
        }
        else
            if (ctrl.props.options.showXLabel) {
                ctrl.xlabel.text("")
            }
    }

    getTimeAxisLabel(ctrl: D3LineChartBase) {

        let difference = ctrl.props.endTime - ctrl.props.startTime
        let timeLabel = "Time"
        if (ctrl.ActiveUnits.Time.current.Short == 'auto') {
            if (difference < 100)
                timeLabel = timeLabel + " (ms)";
            else
                timeLabel = timeLabel + " (s)";
        }
        else
            timeLabel = timeLabel + " (" + ctrl.ActiveUnits.Time.current.Short + ")";

        return timeLabel
        
    }

    getYAxisLabel(ctrl: D3LineChartBase) {

        const distinct = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        if (ctrl.state.dataSet.Data == null)
            return ""

        return ctrl.state.dataSet.Data.filter(item => item.Enabled).map(item => {
            if (ctrl.ActiveUnits[item.Unit] === undefined)
                return item.Unit;
            else
                return ctrl.ActiveUnits[item.Unit].current.Short
        }).filter(distinct).join("/");

    }

    updateYLimits(ctrl: D3LineChartBase) {

        if (ctrl.state.dataSet.Data == null)
            return
        let data = ctrl.state.dataSet.Data.filter(item => item.Enabled);

        let datapt = data.map(item => item.DataPoints.filter(pt => pt[0] < ctrl.props.endTime && pt[0] > ctrl.props.startTime))

        let resDatapt = data.map(item => item.DataPoints.filter(pt => pt[0] < ctrl.props.endTime && pt[0] > ctrl.props.startTime).map(pt => ctrl.AdjustY(ctrl, { y: pt[1], unit: item.Unit, base: item.BaseValue })))

        
        ctrl.dataMin = Math.min(...datapt.map(series => Math.min(...series.map(pt => pt[1]).filter(ctrl.isNumber))))
        ctrl.dataMax = Math.max(...datapt.map(series => Math.max(...series.map(pt => pt[1]).filter(ctrl.isNumber))))

        ctrl.yMin = Math.min(...resDatapt.map(series => Math.min(...series.filter(ctrl.isNumber))))
        ctrl.yMax = Math.max(...resDatapt.map(series => Math.max(...series.filter(ctrl.isNumber))))

        if (!ctrl.props.yLimits.auto) {
            ctrl.dataMin = ctrl.props.yLimits.min
            ctrl.dataMax = ctrl.props.yLimits.max
        
            ctrl.yMin = ctrl.props.yLimits.min
            ctrl.yMax = ctrl.props.yLimits.max
        }
        if (ctrl.props.yLimits.auto) 
            ctrl.props.yLimits.setter(ctrl.yMin, ctrl.yMax, ctrl.props.yLimits.auto)
        
        

    }

    isNumber(d): boolean {
        if (!isNaN(parseFloat(d)))
            return true
        return false
    }

    resolveAutoScale(ctrl: D3LineChartBase): iActiveUnits {

        if (ctrl.state.dataSet.Data == null)
            return ctrl.props.unitSettings

        let result = cloneDeep(ctrl.props.unitSettings);
        for (let property in ctrl.props.unitSettings) {
            //skip Time since that is resolved on the x axis
            if (property == 'Time')
                continue

            if (ctrl.props.unitSettings[property].current.Label == "auto") {

                let tempData = ctrl.state.dataSet.Data.filter(item => item.Enabled && item.Unit == property)
                if (tempData.length > 0) {

                    let datapt = tempData.map(item => item.DataPoints.filter(pt => pt[0] < ctrl.props.endTime && pt[0] > ctrl.props.startTime))
                    let ymin = Math.min(...datapt.map(series => Math.min(...series.map(pt => pt[1]))))
                    let ymax = Math.max(...datapt.map(series => Math.max(...series.map(pt => pt[1]))))

                    //Logic to determine Unit
                    let autoFactor = 0.000001
                    if (Math.max(Math.abs(ymax), Math.abs(ymin)) < 1)
                        autoFactor = 1000
                    else if (Math.max(Math.abs(ymax), Math.abs(ymin)) < 1000)
                        autoFactor = 1
                    else if (Math.max(Math.abs(ymax), Math.abs(ymin)) < 1000000)
                        autoFactor = 0.001

                    //Logic to move on to next if We can not find that Factor
                    if (ctrl.props.unitSettings[property].options.find(item => item.Factor == autoFactor) != undefined)
                        result[property].current = ctrl.props.unitSettings[property].options.find(item => item.Factor == autoFactor)
                    else {
                        //Unable to find Factor try moving one down/up
                        if (autoFactor < 1)
                            autoFactor = autoFactor * 1000
                        else
                            autoFactor = 1

                        if (ctrl.props.unitSettings[property].options.find(item => item.Factor == autoFactor) != undefined)
                            result[property].current = ctrl.props.unitSettings[property].options.find(item => item.Factor == autoFactor)
                        else
                            result[property].current = ctrl.props.unitSettings[property].options.find(item => item.Factor != 0)
                    }
                }
            }
        }     

        if (ctrl.ActiveUnits.TimeLimits !== undefined)
            result['TimeLimits'] = ctrl.ActiveUnits.TimeLimits;
        if (ctrl.ActiveUnits.Tstart !== undefined)
            result['Tstart'] = ctrl.ActiveUnits.Tstart;
        return result;

    }

    getColor(ctrl: D3LineChartBase, color: string) {

        if (ctrl.props.colorSettings[color] !== undefined)
            return ctrl.props.colorSettings[color]
        return ctrl.props.colorSettings.random
    }

    handleSeriesLegendClick(event?: React.MouseEvent<HTMLDivElement>, index?: Array<number>, enabled?: boolean) {
        this.setState(function (state, props) {
            let data = cloneDeep(state.dataSet);

            index.forEach(item =>
                data.Data[item].Enabled = enabled
            );

            return { dataSet: data };
        });
    }

    render() {
        return (
            <div>
                <div id={"graphWindow-" + this.props.legendKey + "-" + this.props.eventId} style={{ height: this.props.height, float: 'left', width: 'calc(100% - 220px)' }}></div>
                <D3Legend colors={this.props.colorSettings} data={this.state.dataSet.Data} callback={this.handleSeriesLegendClick.bind(this)} type={this.props.legendKey} height={this.props.height} />
            </div>
        );
    }

    GetCurrentUnit() {
        return this.ActiveUnits;
    }

  


    
    
}