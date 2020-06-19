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
import { Unit, GraphUnits, Colors } from '../jQueryUI Widgets/SettingWindow';

export type LegendClickCallback = (event?: React.MouseEvent<HTMLDivElement>, row?: iD3DataSeries, getData?: boolean) => void;
export type GetDataFunction = (props: D3LineChartBaseProps, ctrl: D3LineChartBase) => void;
export type ZoomMode = "x" | "y" | "xy"

export interface D3LineChartBaseProps {
    eventId: number, startTime: number, endTime: number, startTimeVis: number, endTimeVis: number, stateSetter: Function, height: number, hover: number,
    unitSettings: GraphUnits,
    colorSettings: Colors,
    zoomMode: ZoomMode,
    pointTable?: Array<iD3DataPoint>,
    options?: D3PlotOptions, fftStartTime?: number, fftWindow?: number, tableSetter?: Function, tableReset?: Function, 
};

interface D3LineChartBaseClassProps extends D3LineChartBaseProps{
    legendKey: string, openSEEServiceFunction: StandardAnalyticServiceFunction
    getData?: GetDataFunction,
   
}

export interface D3PlotOptions {
    showXLabel: boolean,
}

export interface iD3DataSet {
    Data: Array<iD3DataSeries>,
}

export interface iD3DataSeries {
    ChannelID: number,
    ChartLabel: string,
    XaxisLabel: string,

    Color: string,
    Display: boolean,
    Enabled: boolean,
    
    LegendClass: string,
    LegendGroup: string,
    SecondaryLegendClass: string,
    DataPoints: Array<[number, number]>,
    DataMarker: Array<[number, number]>,
}

export interface iD3DataPoint {
    ChannelID: number,
    ChartLabel: string,
    XaxisLabel: string,
    Color: string,
    LegendKey: string,
    Enabled: boolean,

    LegendClass: string,
    LegendGroup: string,
    SecondaryLegendClass: string,
    Value: number,
    Time: number,
}

export default class D3LineChartBase extends React.Component<D3LineChartBaseClassProps, any>{

    yAxis: any;
    xAxis: any;
    yScale: any;
    xScale: any;
    paths: any;
    brush: any;
    
    area: any;
    xlabel: any;
    ylabel: any;
    cycle: any;
    movingCycle: boolean;

    mousedownPos: { x: number, y: number };
    hover: any;

    cycleStart: number;
    cycleEnd: number;

    yMax: number;
    yMin: number;
    dataMax: number;
    dataMin: number;

    ActiveUnits: GraphUnits;

    state: { dataSet: iD3DataSet, dataHandle: JQuery.jqXHR }
    constructor(props, context) {
        super(props, context);
        var ctrl = this;
        this.movingCycle = false;

        ctrl.state = {
            dataSet: {
                Data: null,
            } , 
            dataHandle: undefined,
        };
        
        if (ctrl.props.getData != undefined) ctrl.getData = (props) => ctrl.props.getData(props, ctrl);

        ctrl.mousedownPos = { x: 0, y: 0 };
    }

    componentDidMount() {
        this.getData(this.props);
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


            var dataSet = this.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

            if (this.props.endTimeVis == null) this.props.stateSetter({ endTimeVis: this.props.endTime });
            if (this.props.startTimeVis == null) this.props.stateSetter({ startTimeVis: this.props.startTime });

            dataSet.Data = this.createLegendRows(dataSet.Data);

            this.createDataRows(dataSet.Data);

            this.setState({ dataSet: data });
        });
        this.setState({ dataHandle: handle });

    }

   createLegendRows(data) {
        var ctrl = this;

        let legend: Array<iD3DataSeries> = [];

        data.sort((a, b) => {
            if (a.LegendGroup == b.LegendGroup) {
                return (a.ChartLabel > b.ChartLabel) ? 1 : ((b.ChartLabel > a.ChartLabel) ? -1 : 0)
            }
            return (a.LegendGroup > b.LegendGroup) ? 1 : ((b.LegendGroup > a.LegendGroup) ? -1 : 0)
        })

        let secondaryHeader: Array<string> = Array.from(new Set(data.map(item => item.SecondaryLegendClass)));
        let primaryHeader: Array<string> = Array.from(new Set(data.map(item => item.LegendClass)));


        $.each(data, function (i, key) {

            key.Display = false;
            key.Enabled = false;

            if (primaryHeader.length < 2 || key.LegendClass == primaryHeader[0]) {

                key.Display = true;

                if (secondaryHeader.length < 2 || key.SecondaryLegendClass == secondaryHeader[0]) {
                    key.Enabled = true;
                }
            }

            legend.push(key);
        });

        return legend;

    }

    componentDidUpdate(prevProps: D3LineChartBaseClassProps) {
        var nextPropsClone = clone(this.props) as any;
        var props = clone(prevProps);

        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
      
        delete props.openSEEServiceFunction;
        delete nextPropsClone.openSEEServiceFunction;

        delete props.getData;
        delete nextPropsClone.getData;

        delete props.startTime;
        delete nextPropsClone.startTime;
        delete props.endTime;
        delete nextPropsClone.endTime;

        delete props.startTimeVis;
        delete nextPropsClone.startTimeVis;
        delete props.endTimeVis;
        delete nextPropsClone.endTimeVis;


        delete props.hover;
        delete nextPropsClone.hover;

        delete props.legendKey;
        delete nextPropsClone.legendKey;

        delete props.fftWindow;
        delete nextPropsClone.fftWindow;

        delete props.fftStartTime;
        delete nextPropsClone.fftStartTime;

        delete props.tableSetter;
        delete nextPropsClone.tableSetter;

        delete props.tableReset;
        delete nextPropsClone.tableReset;

        delete props.pointTable;
        delete nextPropsClone.pointTable;

        delete props.unitSettings;
        delete nextPropsClone.unitSettings;

        delete props.colorSettings;
        delete nextPropsClone.colorSettings;

        delete props.zoomMode;
        delete nextPropsClone.zoomMode;


        if (this.props.startTimeVis && this.props.endTimeVis) {
            if (this.xScale != null && (this.props.startTimeVis != prevProps.startTimeVis || this.props.endTimeVis != prevProps.endTimeVis)) {
                this.updateZoom(this);
            }
        }

        if (this.props.hover != null && prevProps.hover != this.props.hover) {
            this.updateHover(this, this.props.hover);
            
        }

        if (prevProps.legendKey != this.props.legendKey) {
            this.setState({
                dataSet: {
                    Data: null,
                    startDate: null,
                    endDate: null
                } })
            this.getData(this.props);
        }

        if (prevProps.fftStartTime != this.props.fftStartTime || prevProps.fftWindow != this.props.fftWindow) {
            if (this.props.fftStartTime > 0) 
                this.updateCycle(this, this.props.fftStartTime, this.props.fftWindow);
            
            else 
                this.updateCycle(this, null, null);
            
       }

        if (!(isEqual(prevProps.colorSettings, this.props.colorSettings))) {
            this.createDataRows(this.state.dataSet.Data);
        }

        if (!(isEqual(prevProps.unitSettings, this.props.unitSettings))) {
            this.createDataRows(this.state.dataSet.Data);
        }

       if (!(isEqual(props, nextPropsClone))) {
           this.getData(this.props);
        }
        
    }

   
    // create Plot
   createDataRows(data) {
        
        // if start and end date are not provided calculate them from the data set
       var ctrl = this;

        // remove the previous SVG object
        d3.select("#graphWindow-" + this.props.legendKey + "-" + this.props.eventId +  ">svg").remove()

        //add new Plot
        var container = d3.select("#graphWindow-" + this.props.legendKey + "-" + this.props.eventId);
        
        var svg = container.append("svg")
            .attr("width", '100%')
            .attr("height", this.props.height).append("g")
            .attr("transform", "translate(40,10)");


       // First Thing is we Resolve any auto Units properly
       ctrl.updateYLimits(ctrl)
       ctrl.ActiveUnits = ctrl.resolveAutoScale(ctrl)
       ctrl.updateYLimits(ctrl)

       //Then Create Axisis
       ctrl.yScale = d3.scaleLinear()
           .domain([ctrl.yMin,ctrl.yMax])
           .range([this.props.height - 60, 0]);

       ctrl.xScale = d3.scaleLinear()
            .domain([this.props.startTimeVis, this.props.endTimeVis])
            .range([20, container.node().getBoundingClientRect().width - 100])
            ;

        ctrl.yAxis = svg.append("g").attr("transform", "translate(20,0)").call(d3.axisLeft(ctrl.yScale).tickFormat((d, i) => ctrl.formatValueTick(ctrl, d)));

        ctrl.xAxis = svg.append("g").attr("transform", "translate(0," + (this.props.height - 60) + ")").call(d3.axisBottom(ctrl.xScale).tickFormat((d, i) => ctrl.formatTimeTick(ctrl, d)));

     
        // Calculate cycle window if neccesarry
        if (this.props.fftStartTime && this.props.fftWindow) {
            this.cycleStart = this.props.fftStartTime;
            this.cycleEnd = this.props.fftStartTime + this.props.fftWindow * 16.6666
        }
        else {
            this.cycleStart = null;
            this.cycleEnd = null;
        }
        
       if (ctrl.props.options.showXLabel) {
           let timeLabel = this.getTimeAxisLabel(ctrl)


            this.xlabel = svg.append("text")
                .attr("transform", "translate(" + ((container.node().getBoundingClientRect().width - 100) / 2) + " ," + (this.props.height - 20) + ")")
                .style("text-anchor", "middle")
                .text(timeLabel);
        }

       //Add the YLabel
        

       let yUnitLabel = ""
       if (ctrl.state.dataSet.Data != null)
           yUnitLabel = this.getYAxisLabel(ctrl)
       
        this.ylabel = svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y",-30)
            .attr("x", -(this.props.height / 2 - 30))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yUnitLabel);

        this.hover = svg.append("line")
            .attr("stroke", "#000")
            .attr("x1", 10).attr("x2", 10)
            .attr("y1", 0).attr("y2", this.props.height - 60)
            .style("opacity", 0.5);

        // for zooming
        this.brush = svg.append("rect")
            .attr("stroke", "#000")
            .attr("x", 10).attr("width", 0)
            .attr("y", 0).attr("height", this.props.height - 60)
            .attr("fill", "black")
            .style("opacity", 0);

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip-" + this.props.legendKey)
            .append("svg:rect")
            .attr("width", 'calc(100% - 120px)')
            .attr("height", '100%')
            .attr("x", 20)
            .attr("y", 0);

        if (this.cycleStart != null && this.cycleEnd != null) {
            this.cycle = svg.append("rect")
                .attr("stroke", "#000")
                .attr("x", this.xScale(this.cycleStart)).attr("width", (this.xScale(this.cycleEnd) - this.xScale(this.cycleStart)))
                .attr("y", 0).attr("height", this.props.height - 60)
                .attr("fill", "black")
                .style("opacity", 0.5)
                .attr("clip-path", "url(#clip-" + this.props.legendKey + ")");
        }
        else
        {
            this.cycle = svg.append("rect")
                .attr("stroke", "#000")
                .attr("x", 10).attr("width", 0)
                .attr("y", 0).attr("height", this.props.height - 60)
                .attr("fill", "black")
                .style("opacity", 0)
                .attr("clip-path", "url(#clip-" + this.props.legendKey + ")");
        }

        
        ctrl.paths = svg.append("g").attr("id","path-" + this.props.legendKey).attr("clip-path", "url(#clip-" + this.props.legendKey + ")");

       if (ctrl.state.dataSet.Data != null)
           ctrl.state.dataSet.Data.filter(item => item.Enabled).forEach((row, key, map) => {
               ctrl.paths.append("path").datum(row.DataPoints.map(item => { return { x: item[0], y: item[1], unit: row.XaxisLabel } })).attr("fill", "none")
                   .attr("stroke", ctrl.getColor(ctrl,row.Color))
                    .attr("stroke-width", 2.0)
                    .attr("d", d3.line()
                        .x(function (d) { return ctrl.xScale(ctrl.AdjustX(ctrl, d)) })
                        .y(function (d) { return ctrl.yScale(ctrl.AdjustY(ctrl,d)) })
                        .defined(function (d) {
                            let tx = !isNaN(parseFloat(ctrl.xScale(ctrl.AdjustX(ctrl, d))));
                            let ty = !isNaN(parseFloat(ctrl.yScale(ctrl.AdjustY(ctrl, d))));
                            return tx && ty;
                        })
                );

                if (row.DataMarker && row.DataMarker.length > 0) {
                    let markers = ctrl.paths.append("g")
                    row.DataMarker.forEach(item => {
                        let r = { x: item[0], y: item[1], units: row.XaxisLabel }
                        markers.append("circle").datum(r)
                            .attr("fill", ctrl.getColor(ctrl, row.Color))
                            .attr("r", 5.0)
                            .attr("cx", function (d) {
                                return ctrl.xScale(ctrl.AdjustX(ctrl, d))
                            })
                            .attr("cy", function (d) {
                                return ctrl.yScale(ctrl.AdjustY(ctrl, d))
                            })
                    })
                    
                }


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
            .on("wheel", function () { ctrl.mousewheel(ctrl) })
    }

    AdjustX(ctrl: D3LineChartBase, d: any) {
        return d.x
    }

    AdjustY(ctrl: D3LineChartBase, d: any) {
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

       else if (ctrl.props.unitSettings.Time.current.Short == 'ms since event')
           if (h < 100)
               return TS.format("SSS.S")
           else
               return TS.format("SSS")
        
            
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

    updateZoom(ctrl: D3LineChartBase) {

       // First Update auto Units and Y Limits
       ctrl.updateYLimits(ctrl)
       ctrl.ActiveUnits = ctrl.resolveAutoScale(ctrl)
       ctrl.updateYLimits(ctrl)

       ctrl.xScale.domain([ctrl.props.startTimeVis, ctrl.props.endTimeVis]);

       ctrl.updateTimeAxis(ctrl)

       ctrl.yScale.domain([ctrl.yMin, ctrl.yMax]);

       ctrl.ylabel.text(ctrl.getYAxisLabel(ctrl))

       ctrl.yAxis.transition().duration(1000).call(d3.axisLeft(ctrl.yScale).tickFormat((d, i) => ctrl.formatValueTick(ctrl, d)))

       ctrl.paths.selectAll('path')
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function (d) {
                    return ctrl.xScale(ctrl.AdjustX(ctrl,d))
                })
                .y(function (d) {
                    return ctrl.yScale(ctrl.AdjustY(ctrl, d))
                })
                .defined(function (d) {
                    let tx = !isNaN(parseFloat(ctrl.xScale(ctrl.AdjustX(ctrl, d))));
                    let ty = !isNaN(parseFloat(ctrl.yScale(ctrl.AdjustY(ctrl, d))));
                    return tx && ty;
                })
        )

        ctrl.paths.selectAll("g").selectAll('circle')
            .transition()
            .duration(1000)
            .attr("cx", function (d) {
                return ctrl.xScale(ctrl.AdjustX(ctrl, d))
            })
            .attr("cy", function (d) {
                return ctrl.yScale(ctrl.AdjustY(ctrl, d))
            })




       if (ctrl.cycleStart != null && ctrl.cycleEnd != null) {
           if (ctrl.cycleStart == -1)
               return

            ctrl.cycle.transition()
                .duration(1000)
                .attr("x", this.AdjustTime(ctrl,ctrl.cycleStart)).attr("width", (this.xScale(ctrl.cycleEnd) -this.xScale(ctrl.cycleStart)))
        }
    }

    mousemove(ctrl: D3LineChartBase) {
        
            // recover coordinate we need
        var x0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);
        var y0 = ctrl.yScale.invert(d3.mouse(ctrl.area.node())[1]);

        let selectedData = x0

        if (!ctrl.state.dataSet.Data)
            return

        if (ctrl.state.dataSet.Data.length > 0) {
            let i = d3.bisect(ctrl.state.dataSet.Data[0].DataPoints.map(item => item[0]), x0, 1);
            if (ctrl.state.dataSet.Data[0].DataPoints[i] != undefined)
                selectedData = ctrl.state.dataSet.Data[0].DataPoints[i][0]
            else
                selectedData = x0
        }


        if (ctrl.movingCycle) {

            let leftEdge = Math.min(selectedData, ctrl.props.endTimeVis - this.props.fftWindow*16.6666)
            ctrl.updateCycle(ctrl, leftEdge, this.props.fftWindow)
        }

      
        ctrl.props.stateSetter({ Hover: ctrl.xScale(selectedData) });

        let h = ctrl.mousedownPos.x - ctrl.xScale(selectedData);
        let w = ctrl.mousedownPos.y - ctrl.yScale(y0);

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
                    .attr("y", ctrl.yScale(y0))
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
                    .attr("y", ctrl.yScale(y0))
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

    mousedown(ctrl: D3LineChartBase) {

        // create square as neccesarry
        var x0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);
        var y0 = ctrl.yScale.invert(d3.mouse(ctrl.area.node())[1]);

        //Check if we are clicking in cycle marker
        if (ctrl.cycleStart && ctrl.cycleEnd) {
            if (x0 > ctrl.cycleStart && x0 < ctrl.cycleEnd) {
                ctrl.movingCycle = true;
                return;
            }
        }

        ctrl.mousedownPos.x = ctrl.xScale(x0)
        ctrl.mousedownPos.y = ctrl.yScale(y0)

        ctrl.brush
            .attr("x", ctrl.xScale(x0))
            .attr("width", 0)
            .style("opacity", 0.25)
        

    }

    updateCycle(ctrl: D3LineChartBase, cycleStart?: number, cycleWindow?: number) {
        if (cycleStart && cycleWindow) {
            ctrl.cycleStart = cycleStart;
            
            ctrl.cycleEnd = cycleStart + cycleWindow * 16.6666
        }
        else {
            ctrl.cycleStart = null;
            ctrl.cycleEnd = null;
        }

        if (ctrl.cycleStart != null && ctrl.cycleEnd != null) {
            ctrl.cycle.attr("x", ctrl.xScale(ctrl.cycleStart)).attr("width", (this.xScale(ctrl.cycleEnd) - this.xScale(ctrl.cycleStart)))
                .style("opacity", 0.5);
        }
        else {
            ctrl.cycle.attr("x", 10).attr("width", 0)
                .style("opacity", 0);
        }


    }

    updateHover(ctrl: D3LineChartBase, hover: number) {
        if (hover == null) {
            ctrl.hover.style("opacity", 0);
            return;
        }

        if (ctrl.props.tableSetter && ctrl.state.dataSet) {

            let points = [];
            ctrl.state.dataSet.Data.forEach((row, key, map) => {
                if (row.Display) {
                    let i = d3.bisect( row.DataPoints.map(item => item[0]), ctrl.xScale.invert(hover), 1);
                    if (row.DataPoints[i] != undefined) {
                        points.push({
                            ChannelID: row.ChannelID,
                            ChartLabel: row.ChartLabel,
                            XaxisLabel: row.XaxisLabel,
                            Color: row.Color,
                            LegendKey: ctrl.props.legendKey,

                            LegendClass: row.LegendClass,
                            LegendGroup: row.LegendGroup,
                            SecondaryLegendClass: row.SecondaryLegendClass,
                            Value: row.DataPoints[i][1],
                            Time: row.DataPoints[i][0],
                            Enabled: row.Enabled
                        })
                    }
                }
            });

            ctrl.props.tableSetter(points)
           
        }

        ctrl.hover.attr("x1", hover)
            .attr("x2", hover)

        ctrl.hover.style("opacity", 1);

    }

    mouseout(ctrl: D3LineChartBase) {
        ctrl.setState({ Hover: null });
        ctrl.brush.style("opacity", 0);
        ctrl.mousedownPos = { x: 0, y: 0 };

        if (ctrl.movingCycle) {
            ctrl.props.stateSetter({ fftStartTime: ctrl.cycleStart });
        }
        ctrl.movingCycle = false;
    }

    mouseup(ctrl: D3LineChartBase) {

        if (ctrl.movingCycle) {
            ctrl.movingCycle = false;
            ctrl.props.stateSetter({ fftStartTime: ctrl.cycleStart });
            return
        }

        if (ctrl.mousedownPos.x < 10) {
            ctrl.brush.style("opacity", 0);
            ctrl.mousedownPos.x = 0;
            return;
        }

        let x0 = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);

        let h = ctrl.mousedownPos.x - ctrl.xScale(x0);

        if (ctrl.props.pointTable && h < 3 && ($('#accumulatedpoints').css('display') != "none" || $('#tooltipwithdelta').css('display') != "none") ) {
            let points = ctrl.props.pointTable;
            
            ctrl.state.dataSet.Data.forEach((row, key, map) => {
                let i = d3.bisect(row.DataPoints.map(item => item[0]), x0, 1);
                if (row.Enabled) {
                    points.push({
                        ChannelID: row.ChannelID,
                        ChartLabel: row.ChartLabel,
                        XaxisLabel: row.XaxisLabel,
                        Color: row.Color,
                        LegendKey: ctrl.props.legendKey,

                        LegendClass: row.LegendClass,
                        LegendGroup: row.LegendGroup,
                        SecondaryLegendClass: row.SecondaryLegendClass,
                        Value: row.DataPoints[i][1],
                        Enabled: row.Enabled,
                        Time: row.DataPoints[i][0]
                    })
                }
            })
            ctrl.props.stateSetter({ pointTable: points })

            ctrl.brush.style("opacity", 0);
            ctrl.mousedownPos = { x: 0, y: 0 };
            return
            // Add this point to the PointsTable 
        }

        let xMouse = ctrl.xScale.invert(ctrl.mousedownPos.x)

        if (ctrl.props.zoomMode == "x") {
            // If we have a cycle window adjust left and right to ensure you are outside the cycle window
            if (ctrl.cycleStart && ctrl.cycleEnd && ctrl.cycleStart > 0) {
                xMouse = (h < 0) ? Math.min(xMouse, ctrl.cycleStart) : Math.max(xMouse, ctrl.cycleEnd)
                x0 = (h > 0) ? Math.min(x0, ctrl.cycleStart) : Math.max(x0, ctrl.cycleEnd)

            }


            if (Math.abs(xMouse - x0) > 10) {

                if (h < 0) {
                    ctrl.props.stateSetter({ startTimeVis: xMouse, endTimeVis: x0 });
                }
                else {
                    ctrl.props.stateSetter({ startTimeVis: x0, endTimeVis: xMouse });
                }
            }
        }

        ctrl.brush.style("opacity", 0);
        ctrl.mousedownPos = { x: 0, y: 0 };
    }

    mousewheel(ctrl: D3LineChartBase) {

        // start by figuring out new total
        let diffX = ctrl.props.endTime - ctrl.props.startTime
        let diffNew = diffX - diffX * 0.15 * d3.event.wheelDelta / 120;

        let zoomPoint = ctrl.xScale.invert(d3.mouse(ctrl.area.node())[0]);

        //then figure out left and right proportion
        let pLeft = (zoomPoint - ctrl.props.startTime) / diffX
        let pRight = (ctrl.props.endTime - zoomPoint) / diffX

        if (diffNew < 10) {
            diffNew = 10;
        }

        //ensure we do not go beyond startdate and enddate
        let newStartTime = Math.max((zoomPoint - pLeft * diffNew), ctrl.props.startTime)
        let newEndTime = Math.min((zoomPoint + pRight * diffNew), ctrl.props.endTime)

        ctrl.props.stateSetter({ startTimeVis: newStartTime, endTimeVis: newEndTime });
    }
    
    updateTimeAxis(ctrl: D3LineChartBase) {

        ctrl.xAxis.transition().duration(1000).call(d3.axisBottom(ctrl.xScale).tickFormat((d, i) => ctrl.formatTimeTick(ctrl, d)))

        if (ctrl.props.options.showXLabel) {
            ctrl.xlabel.text(ctrl.getTimeAxisLabel(ctrl))
        }
    }

    getTimeAxisLabel(ctrl: D3LineChartBase) {

        let difference = ctrl.props.endTimeVis - ctrl.props.startTimeVis
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

        return ctrl.state.dataSet.Data.filter(item => item.Enabled).map(item => {
            if (ctrl.ActiveUnits[item.XaxisLabel] === undefined)
                return item.XaxisLabel;
            else
                return ctrl.ActiveUnits[item.XaxisLabel].current.Short
        }).filter(distinct).join("/");

    }

    // Get current Y axis limits needs work
    updateYLimits(ctrl: D3LineChartBase) {

        if (ctrl.state.dataSet.Data == null)
            return
        let data = ctrl.state.dataSet.Data.filter(item => item.Enabled);
        let datapt = data.map(item => item.DataPoints.filter(pt => pt[0] < ctrl.props.endTimeVis && pt[0] > ctrl.props.startTimeVis))
        let resDatapt = data.map(item => item.DataPoints.filter(pt => pt[0] < ctrl.props.endTimeVis && pt[0] > ctrl.props.startTimeVis).map(pt => ctrl.AdjustY(ctrl, { y: pt[1], unit: item.XaxisLabel })))

        
        ctrl.dataMin = Math.min(...datapt.map(series => Math.min(...series.map(pt => pt[1]).filter(ctrl.isNumber))))
        ctrl.dataMax = Math.max(...datapt.map(series => Math.max(...series.map(pt => pt[1]).filter(ctrl.isNumber))))

        ctrl.yMin = Math.min(...resDatapt.map(series => Math.min(...series.filter(ctrl.isNumber))))
        ctrl.yMax = Math.max(...resDatapt.map(series => Math.max(...series.filter(ctrl.isNumber))))
    }

    isNumber(d): boolean {
        if (!isNaN(parseFloat(d)))
            return true
        return false
    }

    resolveAutoScale(ctrl: D3LineChartBase): GraphUnits {

        if (ctrl.state.dataSet.Data == null)
            return ctrl.props.unitSettings

        let result = cloneDeep(ctrl.props.unitSettings);
        for (let property in ctrl.props.unitSettings) {
            //skip Time since that is resolved on the x axis
            if (property == 'Time')
                continue

            if (ctrl.props.unitSettings[property].current.Label == "auto") {

                let tempData = ctrl.state.dataSet.Data.filter(item => item.Enabled && item.XaxisLabel == property)
                if (tempData.length > 0) {

                    let datapt = tempData.map(item => item.DataPoints.filter(pt => pt[0] < ctrl.props.endTimeVis && pt[0] > ctrl.props.startTimeVis))
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

        return result;
    }

   handleSeriesLegendClick(event: React.MouseEvent<HTMLDivElement>, row: iD3DataSeries, key: number, getData?: boolean): void {
        if (row != undefined)
            row.Enabled = !row.Enabled;

        this.setState({ dataSet: this.state.dataSet });    

        this.createDataRows(this.state.dataSet.Data);

       if (getData == true)
            this.getData(this.props);
    }

    getColor(ctrl: D3LineChartBase, color: string) {

        if (ctrl.props.colorSettings[color] !== undefined)
            return ctrl.props.colorSettings[color]
        return ctrl.props.colorSettings.random
    }

    render() {
        return (
            <div>
                <div id={"graphWindow-" + this.props.legendKey + "-" + this.props.eventId} style={{ height: this.props.height, float: 'left', width: 'calc(100% - 220px)' }}></div>
                <D3Legend colors={this.props.colorSettings} data = { this.state.dataSet.Data } callback={this.handleSeriesLegendClick.bind(this)} type={this.props.legendKey} height={this.props.height} />
            </div>
        );
    }




    
    
}