//******************************************************************************************************
//  PolarChart.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  05/10/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { style } from "typestyle"
import { iD3DataPoint } from '../Graphs/D3LineChartBase';

// styles
const outerDiv: React.CSSProperties = {
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    top: '0',
    left: 0,
    display: 'none',
    backgroundColor: 'white',
    width: 530,
    height: 340
};

const handle = style({
    width: '100%',
    height: '20px',
    backgroundColor: '#808080',
    cursor: 'move',
    padding: '0em'
});

const closeButton = style({
    background: 'firebrick',
    color: 'white',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20px',
    height: '20px',
    textAlign: 'center',
    verticalAlign: 'middle',
    padding: 0,
    border: 0,
    $nest: {
        "&:hover": {
            background: 'orangered'
        }
    }
});

export interface PolarChartProps {
    data: Array<iD3DataPoint>,
    callback: Function
}

export default class PolarChart extends React.Component<any, any>{
    props: PolarChartProps;
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        ($("#phasor") as any).draggable({ scroll: false, handle: '#phasorhandle', containment: 'document' });
    }


    drawVectorSVG(mag: number, scale: number, angle: number): string {
        if (mag == undefined || scale == undefined || angle == undefined) return '';
        var x = mag*scale * Math.cos(angle * Math.PI / 180);
        var y = mag * scale * Math.sin(angle * Math.PI / 180);
        return `M 150 150 L ${150 + x} ${150 - y} Z`
    }

    render() {
    
        var dataV = [];

        var dataI = [];

        
        //replace with foreach
        this.props.data.forEach(item => {
            if (item.LegendKey == 'Voltage' && item.ChartLabel == "VAN RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "VAN Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Voltage'));
                if (i) {
                    dataV.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "VAN", group: item.LegendGroup })
                }
            }
            if (item.LegendKey == 'Voltage' && item.ChartLabel == "VBN RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "VBN Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Voltage'));
                if (i) {
                    dataV.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "VBN", group: item.LegendGroup })
                }
            }
            if (item.LegendKey == 'Voltage' && item.ChartLabel == "VCN RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "VCN Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Voltage'));
                if (i) {
                    dataV.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "VCN", group: item.LegendGroup })
                }
            }
            if (item.LegendKey == 'Voltage' && item.ChartLabel == "VAB RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "VAB Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Voltage'));
                if (i) {
                    dataV.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "VAB", group: item.LegendGroup })
                }
            }
            if (item.LegendKey == 'Voltage' && item.ChartLabel == "VBC RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "VBC Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Voltage'));
                if (i) {
                    dataV.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "VBC", group: item.LegendGroup })
                }
            }
            if (item.LegendKey == 'Voltage' && item.ChartLabel == "VCA RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "VCA Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Voltage'));
                if (i) {
                    dataV.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "VCA", group: item.LegendGroup })
                }
            }

            if (item.LegendKey == 'Current' && item.ChartLabel == "IAN RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "IAN Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Current'));
                if (i) {
                    dataI.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "IAN", group: item.LegendGroup })
                }
            }
            if (item.LegendKey == 'Current' && item.ChartLabel == "IBN RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "IBN Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Current'));
                if (i) {
                    dataI.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "IBN", group: item.LegendGroup })
                }
            }
            if (item.LegendKey == 'Current' && item.ChartLabel == "ICN RMS") {
                let i = this.props.data.findIndex(d => (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == "ICN Phase" &&
                    d.LegendGroup == item.LegendGroup &&
                    d.LegendKey == 'Current'));
                if (i) {
                    dataI.push({ mag: item.Value, ang: this.props.data[i].Value, color: item.Color, label: "ICN", group: item.LegendGroup })
                }
            }


        })

      
        var vMax = 0;
        $.each(dataV, function (key, series) {
            if (series.mag > vMax)
                vMax = series.mag;
        });
        var scaleV = 0.9 * 150 / vMax;

        var iMax = 0;
        $.each(dataI, function (key, series) {
            if (series.mag > iMax)
                iMax = series.mag;
        });
        var scaleI = 0.9 * 150 / iMax;


        let tblData = {};

        dataV.forEach(item => {
            if (!(tblData[item.group])) 
                tblData[item.group] = {}
            
            tblData[item.group][item.label] = { Mag: item.mag, Ang: item.ang }
            
        })

        var vanRMS = this.props.data[0]//this.props.data.get('VAN RMS');
        var vbnRMS = this.props.data[0]//this.props.data.get('VBN RMS');
        var vcnRMS = this.props.data[0]//this.props.data.get('VCN RMS');
        var ianRMS = this.props.data[0]//this.props.data.get('IAN RMS');
        var ibnRMS = this.props.data[0]//this.props.data.get('IBN RMS');
        var icnRMS = this.props.data[0]//this.props.data.get('ICN RMS');

        var vanPhase = this.props.data[0]//this.props.data.get('VAN Phase');
        var vbnPhase = this.props.data[0]//this.props.data.get('VBN Phase');
        var vcnPhase = this.props.data[0]//this.props.data.get('VCN Phase');
        var ianPhase = this.props.data[0]//this.props.data.get('IAN Phase');
        var ibnPhase = this.props.data[0]//this.props.data.get('IBN Phase');
        var icnPhase = this.props.data[0]//this.props.data.get('ICN Phase');


        return (
            <div id="phasor" className="ui-widget-content" style={outerDiv}>
                <div id="phasorhandle" className={handle}></div>
                <div id="phasorchart" style={{ width: '520px', height: '300px', zIndex: 1001 }}>
                    <svg width="300" height="300">
                        <circle cx="150" cy="150" r={60} stroke="lightgrey" strokeWidth="1" fill='white' fillOpacity="0"/>
                        <circle cx="150" cy="150" r={130} stroke="lightgrey" strokeWidth="1" fill='white' fillOpacity="0" />
                        <line x1="150" y1="0" x2="150" y2="300" style={{ stroke: 'lightgrey' , strokeWidth: 2}} />
                        <line x1="0" y1="150" x2="300" y2="150" style={{ stroke: 'lightgrey', strokeWidth: 2 }} />
                        { dataV.map((value, index) => <path key={index} d={this.drawVectorSVG(value.mag, scaleV, value.ang)} style={{ stroke: value.color, strokeWidth: 3 }} />)}
                        { dataI.map((value, index) => <path key={index} d={this.drawVectorSVG(value.mag, scaleI, value.ang)} strokeDasharray="10,10" style={{ stroke: value.color, strokeWidth: 3 }} />)}
                    </svg>
                    <table className="table" style={{ width: 180, height: 300, float: 'right' }}>
                        <thead>
                            <tr>
                                <th style={{width: 180}}>Asset A</th>
                            </tr>
                            <tr>
                                <th style={{ width: 20 }}>Phase</th>
                                <th style={{ width: 80 }}>Mag</th>
                                <th style={{ width: 80 }}>Angle</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ width: 20}}>VAN</td>
                                <td style={{ width: 80 }}>{(vanRMS != undefined ? vanRMS.Value.toFixed(2) : null)}</td>
                                <td style={{ width: 80 }} >{(vanPhase != undefined ? vanPhase.Value.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td style={{ width: 20 }}>VAN</td>
                                <td style={{ width: 80 }}>{(vanRMS != undefined ? vanRMS.Value.toFixed(2) : null)}</td>
                                <td style={{ width: 80 }} >{(vanPhase != undefined ? vanPhase.Value.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td style={{ width: 20 }}>VAN</td>
                                <td style={{ width: 80 }}>{(vanRMS != undefined ? vanRMS.Value.toFixed(2) : null)}</td>
                                <td style={{ width: 80 }} >{(vanPhase != undefined ? vanPhase.Value.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td style={{ width: 20 }}>VAN</td>
                                <td style={{ width: 80 }}>{(vanRMS != undefined ? vanRMS.Value.toFixed(2) : null)}</td>
                                <td style={{ width: 80 }} >{(vanPhase != undefined ? vanPhase.Value.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td style={{ width: 20 }}>VAN</td>
                                <td style={{ width: 80 }}>{(vanRMS != undefined ? vanRMS.Value.toFixed(2) : null)}</td>
                                <td style={{ width: 80 }} >{(vanPhase != undefined ? vanPhase.Value.toFixed(2) : null)}</td>
                            </tr>
                            <tr>
                                <td style={{ width: 20 }}>VAN</td>
                                <td style={{ width: 80 }}>{(vanRMS != undefined ? vanRMS.Value.toFixed(2) : null)}</td>
                                <td style={{ width: 80 }} >{(vanPhase != undefined ? vanPhase.Value.toFixed(2) : null)}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>
                <button className={closeButton} onClick={() => {
                    this.props.callback({ phasorButtonText: "Show Phasor" });
                    $('#phasor').hide();
                }}>X</button>

            </div>
        );
    }
}
