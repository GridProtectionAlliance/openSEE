//******************************************************************************************************
//  D3BarChartBase.ts - Gbtc
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
//  02/13/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React  from 'react';
import { clone, isEqual, each, findLast, range } from "lodash";
import * as d3 from '../../D3/d3';

import { utc } from "moment";
import D3Legend from './D3Legend';
import FFTTable from '../jQueryUI Widgets/FFTTable';

import { StandardAnalyticServiceFunction } from '../../TS/Services/OpenSEE';
import * as moment from 'moment';
import { LegendClickCallback, D3PlotOptions, iD3DataSet, iD3DataSeries  } from './D3LineChartBase'
import { Colors } from '../jQueryUI Widgets/SettingWindow';

export type GetDataFunction = (props: D3BarChartBaseProps, ctrl: D3BarChartBase) => void;

export interface D3BarChartBaseProps {
    eventId: number, pixels: number, stateSetter: Function, height: number, options: D3PlotOptions, startTime: number, fftWindow: number,
    colorSettings: Colors
};

interface D3BarChartBaseClassProps extends D3BarChartBaseProps{
    legendKey: string, openSEEServiceFunction: StandardAnalyticServiceFunction
    getData?: GetDataFunction,
   
}


export default class D3BarChartBase extends React.Component<D3BarChartBaseClassProps, any>{

    yAxis: any;
    xAxis: any;
    yScale: any;
    xScale: any;
    paths: any;
    brush: any;
    area: any;
    xlabel: any;

    mousedownX: number;

    xmin: number;
    xmax: number;
    xminVis: number;
    xmaxVis: number;


    state: { dataSet: iD3DataSet, dataHandle: JQuery.jqXHR }
    constructor(props, context) {
        super(props, context);
        var ctrl = this;

        ctrl.state = {
            dataSet: {
                Data: null
            } , 
            dataHandle: undefined,
        };
        
        if (ctrl.props.getData != undefined) ctrl.getData = (props) => ctrl.props.getData(props, ctrl);

        ctrl.xmin = NaN;
        ctrl.xmax = NaN;
        ctrl.xminVis = NaN;
        ctrl.xmaxVis = NaN;


        ctrl.mousedownX = 0;
    }

    componentDidMount() {
        this.getData(this.props);
        let ctrl = this;
        this.props.stateSetter({ barChartReset: ctrl.ResetZoom.bind(ctrl) })

    }

    componentWillUnmount() {
        if (this.state.dataHandle !== undefined && this.state.dataHandle.abort !== undefined) {
            this.state.dataHandle.abort();
            this.setState({ dataHandle: undefined });
        }
    }

    

    getData(props: D3BarChartBaseProps) {
        var handle = this.props.openSEEServiceFunction(props.eventId).then((data: iD3DataSet) => {
            if (data == null) {
                return;
            }


            var dataSet = this.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

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

    componentWillReceiveProps(nextProps: D3BarChartBaseClassProps) {
        var props = clone(this.props) as any;
        var nextPropsClone = clone(nextProps);

        delete props.stateSetter;
        delete nextPropsClone.stateSetter;
        //delete props.tableSetter;
        //delete nextPropsClone.tableSetter;


        //delete props.legendDisplay;
        //delete nextPropsClone.legendDisplay;
        delete props.openSEEServiceFunction;
        delete nextPropsClone.openSEEServiceFunction;
        //delete props.legendEnable;
        //delete nextPropsClone.legendEnable;

        delete props.getData;
        delete nextPropsClone.getData;

        delete props.legendKey;
        delete nextPropsClone.legendKey;

        delete nextPropsClone.colorSettings;
        delete props.colorSettings;
       

        if (nextProps.legendKey != this.props.legendKey) {
            this.setState({
                dataSet: {
                    Data: null,
                    startDate: null,
                    endDate: null
                } })
            this.getData(nextProps);
        }

        if (!(isEqual(props, nextPropsClone))) {
            this.getData(nextProps);
            

        }
        
    }

   
    // create Plot
    createDataRows(data) {
        // if start and end date are not provided calculate them from the data set
        var ctrl = this;

        // remove the previous SVG object
        d3.select("#graphWindow-" + this.props.legendKey + ">svg").remove()

        //add new Plot
        var container = d3.select("#graphWindow-" + this.props.legendKey);
        
        var svg = container.append("svg")
            .attr("width", '100%')
            .attr("height", this.props.height).append("g")
            .attr("transform", "translate(40,10)");

        var lines = [];
        data.forEach((row, key, map) => {
            if (row.Enabled) {
                lines.push(row);

            }
        });

        

        let yLim = this.getYLimits(this, Number.NaN, Number.NaN, lines);
        let xLim = this.getXLimits(this, lines);

        if (Number.isNaN(xLim[0]) || Number.isNaN(xLim[1])) {
            this.xmax = 10
            this.xmin = 0
            this.xmaxVis = 10
            this.xminVis = 0
        }
        else {
            this.xmax = xLim[1]
            this.xmin = xLim[0]
        }
           

        ctrl.yScale = d3.scaleLinear()
            .domain(yLim)
            .range([this.props.height - 60, 0]);

        if (Number.isNaN(this.xminVis))
            this.xminVis = this.xmin

        if (Number.isNaN(this.xmaxVis))
            this.xmaxVis = this.xmax

        if (this.xmax < this.xmaxVis)
            this.xmaxVis = this.xmax
        if (this.xmin > this.xminVis)
            this.xminVis = this.xmin

        ctrl.xScale = d3.scaleBand()
            .domain(range(this.xminVis, this.xmaxVis + 1))
            .range([20, container.node().getBoundingClientRect().width - 100])
            .padding(0.1)
            ;
        
       

        ctrl.yAxis = svg.append("g").attr("transform", "translate(20,0)").call(d3.axisLeft(ctrl.yScale).tickFormat((d, i) => ctrl.formatValueTick(ctrl, d)));
        ctrl.xAxis = svg.append("g").attr("transform", "translate(0," + (this.props.height - 60) + ")").call(d3.axisBottom(ctrl.xScale));


        let timeLabel = "Harmonic";    

        if (ctrl.props.options.showXLabel) {
            this.xlabel = svg.append("text")
                .attr("transform", "translate(" + ((container.node().getBoundingClientRect().width - 100) / 2) + " ," + (this.props.height - 20) + ")")
                .style("text-anchor", "middle")
                .text(timeLabel);
        }

        const distinct = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        let yLabel = lines.map(item => item.XaxisLabel).filter(distinct).join("/");
       
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y",-30)
            .attr("x", -(this.props.height / 2 - 30))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yLabel);

        
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

        ctrl.paths = svg.append("g").attr("id","path-" + this.props.legendKey).attr("clip-path", "url(#clip-" + this.props.legendKey + ")");

        
        lines.forEach((row, key, map) => {
            ctrl.paths.append("g").attr("fill", row.Color).selectAll('rect')
                .data(row.DataPoints.map(item => { return { x: item[0], y: item[1] } }))
                .join("rect")
                .attr("x", d => ctrl.xScale(d.x))
                .attr("y", d => { return ctrl.yScale(d.y) })
                .attr("width", ctrl.xScale.bandwidth() - 1)
                .attr("height", d => { return ((this.props.height - 60) - ctrl.yScale(d.y)) })
            
        });      

        this.area = svg.append("g").append("svg:rect")
            .attr("width", 'calc(100% - 120px)')
            .attr("height", '100%')
            .attr("x", 20)
            .attr("y", 0)
            .style("opacity", 0)
            .on('mouseout', function () { ctrl.mouseout(ctrl) })
            .on('mousemove', function () { ctrl.mousemove(ctrl) })
            .on('mousedown', function () { ctrl.mousedown(ctrl) })
            .on('mouseup', function () { ctrl.mouseup(ctrl) })
            .on("wheel", function () { ctrl.mousewheel(ctrl) })
    }

    
    updateZoom(ctrl: D3BarChartBase) {

        if (this.xminVis > this.xmaxVis) {
            let tmp = this.xminVis;
            this.xminVis = this.xmaxVis
            this.xmaxVis = tmp
        }

        if ((this.xmaxVis - this.xminVis) < 2) {
            this.xminVis = this.xmaxVis - 2
        }
            
        if (this.xmaxVis > this.xmax)
            this.xmaxVis = this.xmax

        if (this.xminVis < this.xmin)
            this.xminVis = this.xmin

        ctrl.xScale.domain(range(this.xminVis, this.xmaxVis + 1))


        ctrl.xAxis.transition().duration(1000).call(d3.axisBottom(ctrl.xScale));

        ctrl.yScale.domain(ctrl.getYLimits(ctrl, this.xminVis, this.xmaxVis, undefined));
        ctrl.yAxis.transition().duration(1000).call(d3.axisLeft(ctrl.yScale).tickFormat((d, i) => ctrl.formatValueTick(ctrl, d)))



        ctrl.paths.selectAll('rect')
            .transition()
            .duration(1000)
            .attr("x", d => {
                if (ctrl.xScale(d.x) == undefined) {
                    let dir = (d.x < ctrl.xScale.domain()[0]) ? -2 : (2 + ctrl.xScale.domain().length)
                    return (dir * ctrl.xScale.step())
                }

                return ctrl.xScale(d.x)
            })
            .attr("y", d => { return ctrl.yScale(d.y) })
            .attr("width", ctrl.xScale.bandwidth() - 1)
            .attr("height", d => {
                let val = (ctrl.props.height - 60) - ctrl.yScale(d.y)
                return (val < 0) ? 0 : val;
            })
    }

    ResetZoom(ctrl: D3BarChartBase) {
        this.xminVis = this.xmin;
        this.xmaxVis = this.xmax;
        this.updateZoom(this);
    }

    mousemove(ctrl: D3BarChartBase) {
        
        // recover coordinate we need
        var x0 = d3.mouse(ctrl.area.node())[0];

        let h = ctrl.mousedownX - x0;


        if (h < 0) {
            ctrl.brush.attr("width", -h)
                .attr("x", ctrl.mousedownX)
        }
        else {
            ctrl.brush.attr("width", h)
                .attr("x", x0)
        }

    }

    mousedown(ctrl: D3BarChartBase) {
        // create square as neccesarry
        var x0 = d3.mouse(ctrl.area.node())[0];
        
        ctrl.mousedownX = x0

        ctrl.brush
            .attr("x", x0)
            .attr("width", 0)
            .style("opacity", 0.25)
        

    }

    mouseout(ctrl: D3BarChartBase) {
        ctrl.brush.style("opacity", 0);
        ctrl.mousedownX = 0;
    }
   
    mouseup(ctrl: D3BarChartBase) {

      

        if (ctrl.mousedownX < 10) {
            ctrl.brush.style("opacity", 0);
            ctrl.mousedownX = 0;
            return;
        }

        let x0 = d3.mouse(ctrl.area.node())[0];


        let h = ctrl.mousedownX - x0;

 
        if (Math.abs(h) > 10) {

            if (h < 0) {
                ctrl.xminVis = ctrl.getXbucket(ctrl, ctrl.mousedownX)
                ctrl.xmaxVis = ctrl.getXbucket(ctrl, x0)
                ctrl.updateZoom(ctrl)
            }
            else {
                ctrl.xmaxVis = ctrl.getXbucket(ctrl, ctrl.mousedownX)
                ctrl.xminVis = ctrl.getXbucket(ctrl, x0)
                ctrl.updateZoom(ctrl)
            }
        }

        ctrl.brush.style("opacity", 0);
        ctrl.mousedownX = 0;
    }

    getXbucket(ctrl: D3BarChartBase, pixel: number) {

        let eachBand = ctrl.xScale.step();

        
        let index = Math.floor((pixel / eachBand));

        if (index == ctrl.xScale.domain().length)
            index = index - 1

        return ctrl.xScale.domain()[index];
    }

    mousewheel(ctrl: D3BarChartBase) {

        // start by figuring out new total
        let minX = ctrl.xScale.domain()[0]
        let maxX = ctrl.xScale.domain()[ctrl.xScale.domain().length -1 ]
        let diffX = maxX - minX
        let diffNew = diffX - diffX * 0.15 * d3.event.wheelDelta / 120;

        let zoomPoint = ctrl.getXbucket(ctrl,d3.mouse(ctrl.area.node())[0]);

        //then figure out left and right proportion
        let pLeft = (zoomPoint - minX) / diffX
        let pRight = (maxX - zoomPoint) / diffX

        let newMinX = Math.floor(zoomPoint - pLeft * diffNew)
        let newMaxX = Math.ceil(zoomPoint + pRight * diffNew)

        ctrl.xminVis = newMinX
        ctrl.xmaxVis = newMaxX
        ctrl.updateZoom(ctrl);
    }

    formatValueTick(ctrl: D3BarChartBase, d: number) {

        let h = ctrl.yScale.domain()[1] - ctrl.yScale.domain()[0]
        let val = d;
        if (h > 10000000) {
            val = val / 1000000.0
            return val.toFixed(1) + "M"
        }
        if (h > 1000000) {
            val = val / 1000000.0
            return val.toFixed(2) + "M"
        }
        if (h > 10000) {
            val = val / 1000.0;
            return val.toFixed(1) + "k"
        }
        if (h > 1000) {
            val = val / 1000.0;
            return val.toFixed(2) + "k"
        }
        if (h > 10)
            return val.toFixed(1)
        else
            return d.toFixed(2)
    }

    // Get current Y axis limits
    getYLimits(ctrl: D3BarChartBase, xMin: number, xMax: number, lines: any[]) {

        if (lines == undefined) {
            lines = [];
            ctrl.state.dataSet.Data.forEach((row, key, map) => {
                if (row.Enabled) {
                    lines.push(row);
                }
            });
        }


        let ymax = Math.min.apply(null, lines.map(item => Math.min.apply(null, item.DataPoints.map(item => item[1]).map(ctrl.isNumberMax))));
        let ymin = Math.max.apply(null, lines.map(item => Math.max.apply(null, item.DataPoints.map(item => item[1]).map(ctrl.isNumberMin))));


        if (!Number.isNaN(xMin) && !Number.isNaN(xMax)) {
            let xmin = xMin - 1;
            let xmax = xMax + 1;

            lines.forEach((row, index, map) => {
                row.DataPoints.forEach((pt, i, points) => {
                    if (pt[0] < xmax && pt[0] > xmin) {
                        if (this.isNumberMax(pt[1]) > ymax) {
                            ymax = this.isNumberMin(pt[1]);
                        }
                        if (this.isNumberMin(pt[1]) < ymin) {
                            ymin = this.isNumberMax(pt[1]);
                        }
                    }
                })
            })
        }
        else {
            let tmp = ymax;
            ymax = ymin;
            ymin = tmp;
        }

        if (ymin == Number.MAX_VALUE || !Number.isFinite(ymin)) { ymin = NaN; }
        if (ymax == Number.MIN_VALUE || !Number.isFinite(ymax)) { ymax = NaN; }

        return [ymin, ymax];
    }

    // Get current X axis limits
    getXLimits(ctrl: D3BarChartBase, lines: any[]) {

        if (lines == undefined) {
            lines = [];
            ctrl.state.dataSet.Data.forEach((row, key, map) => {
                if (row.Enabled) {
                    lines.push(row);
                }
            });
        }


        let xmin = Math.min.apply(null, lines.map(item => Math.min.apply(null, item.DataPoints.map(item => item[0]).map(ctrl.isNumberMin))));
        let xmax = Math.max.apply(null, lines.map(item => Math.max.apply(null, item.DataPoints.map(item => item[0]).map(ctrl.isNumberMax))));
            
      
        if (xmin == Number.MAX_VALUE || !Number.isFinite(xmin)) { xmin = NaN; }
        if (xmax == Number.MIN_VALUE || !Number.isFinite(xmax)) { xmax = NaN; }


        return [xmin, xmax];
    }

    isNumberMax(d) {
        if (!isNaN(parseFloat(d)))
            return d

        else
            return Number.MAX_VALUE

    }

    isNumberMin(d) {
        if (!isNaN(parseFloat(d)))
            return d

        else
            return Number.MIN_VALUE

    }




    // round to nearby lower multiple of base
    floorInBase(n, base) {
        return base * Math.floor(n / base);
    }

    handleSeriesLegendClick(event: React.MouseEvent<HTMLDivElement>, row: iD3DataSeries, key: number, getData?: boolean): void {
        if (row != undefined)
            row.Enabled = !row.Enabled;

        this.setState({ dataSet: this.state.dataSet });    

        this.createDataRows(this.state.dataSet.Data);

       if (getData == true)
            this.getData(this.props);
    }


    render() {
        return (
            <div>
                <FFTTable dataSet={this.state.dataSet} />
                <div id={"graphWindow-" + this.props.legendKey} style={{ height: this.props.height, float: 'left', width: 'calc(100% - 220px)'}}></div>
                <D3Legend colors={this.props.colorSettings} data={this.state.dataSet.Data} callback={this.handleSeriesLegendClick.bind(this)} type={this.props.legendKey} height={this.props.height}/>
            </div>
        );
    }




    
    
}