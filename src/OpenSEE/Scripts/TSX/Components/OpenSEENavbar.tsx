//******************************************************************************************************
//  OpenSEENavbar.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  03/14/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import PolarChart from './../jQueryUI Widgets/PolarChart';
import Points from './../jQueryUI Widgets/AccumulatedPoints';
import Tooltip from './../jQueryUI Widgets/Tooltip';
import TooltipWithDelta from './../jQueryUI Widgets/TooltipWithDelta';

import ScalarStats from './../jQueryUI Widgets/ScalarStats';
import HarmonicStats from './../jQueryUI Widgets/HarmonicStats';
import TimeCorrelatedSags from './../jQueryUI Widgets/TimeCorrelatedSags';
import LightningData from './../jQueryUI Widgets/LightningData';
import { iD3DataPoint, ZoomMode } from '../Graphs/D3LineChartBase';
import { iD3DataRow, iD3TableHeader } from './../jQueryUI Widgets/AccumulatedPoints';
import { clone } from 'lodash';
import SettingWindow, { GraphUnits, Colors } from '../jQueryUI Widgets/SettingWindow';

declare var homePath: string;

export default class OpenSEENavbar extends React.Component {
    props: {
        TableData: Array<iD3DataPoint>,
        PointsTable: Array<iD3DataPoint>,
        eventid: number,
        resetZoom: any,
        stateSetter: Function,
        PostedData: any,
        Hover: number,
        nextBackLookup: any,
        selected: string,
        startDate: string,
        endDate: string,
        
        displayVolt: boolean,
        displayCur: boolean,
        displayTCE:boolean,
        breakerdigitals: boolean,
        displayAnalogs: boolean,
        displayAnalytics: string,
        filterOrder: number,
        Trc: number,
        harmonic: number,

        unitData: GraphUnits,
        colorData: Colors,
        zoomMode: ZoomMode,
        yLimits: any,
    }
    state: {
        showComtradeExportButton: boolean,
        pointsData: Array<iD3DataRow>,
        pointsHeader: Array<iD3TableHeader>
    }
    constructor(props, context) {
        super(props, context);

        this.state = {
            showComtradeExportButton: false,
            pointsData: [],
            pointsHeader: [],
        }
    }


    componentWillReceiveProps(nextProps) {

        let headerData: Array<iD3TableHeader> = [];
        let availableTimes = [];
        let tblData: Array<iD3DataRow> = [];
          
        nextProps.PointsTable.forEach((item, i) => {
            let channelIndex = headerData.findIndex(d => (
                d.Asset == item.LegendGroup && d.Channel == item.ChartLabel
            ));

            let timeIndex = availableTimes.findIndex(d => (
                d == item.Time
            ));

            if (channelIndex < 0) {
                headerData.push({ Asset: item.LegendGroup, Channel: item.ChartLabel, Color: item.Color });
                channelIndex = headerData.length - 1;
                if (tblData.length > 0 && tblData[0].Value.length < channelIndex) {
                    tblData.forEach(item => {
                        item.Value.push(NaN);
                        item.DeltaValue.push(NaN);
                    })
                }
            }

            if (timeIndex < 0) {
                let nData = headerData.length;
                let t = item.Time - this.props.PostedData.postedEventMilliseconds
                tblData.push({
                    Time: t,
                    DeltaTime: (tblData.length > 0) ? t - tblData[tblData.length - 1].Time : NaN,
                    Value: Array(nData).fill(NaN),
                    DeltaValue: Array(nData).fill(NaN),
                    Indices: []
                })
                availableTimes.push(item.Time)
                timeIndex = availableTimes.length - 1;
            }

            tblData[timeIndex].Value[channelIndex] = item.Value;
            tblData[timeIndex].DeltaValue[channelIndex] = (timeIndex > 0) ? item.Value - tblData[timeIndex-1].Value[channelIndex] : NaN;
            tblData[timeIndex].Indices.push(i)
        })


        this.setState({ pointsData: tblData, pointsHeader: headerData})
        

    }
 
    componentDidMount() {
        this.getOutputChannelCount();
    }

    getOutputChannelCount(): void {
        $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetOutputChannelCount/${this.props.eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => this.setState({ showComtradeExportButton: data > 0 }));
        
    }

    render() {
                //fa fa-arrows
                //fa fa-arrows-h
                //fa fa-arrows-V

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item dropdown" style={{width: '150px'}}>
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Data Tools</a>
                            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <a className="dropdown-item" onClick={this.showhidePoints.bind(this)}>Show Points</a>
                                <a className="dropdown-item" onClick={this.showhideTooltip.bind(this)}>Show Tooltip</a>
                                <a className="dropdown-item" onClick={this.showhideTooltipWithDelta.bind(this)}>Show Tooltip w/ Delta</a>
                                <a className="dropdown-item" onClick={this.showhidePhasor.bind(this)}>Show Phasor</a>
                                <a className="dropdown-item" onClick={this.showhideStats.bind(this)}>Show Stats</a>
                                <a className="dropdown-item" onClick={this.showhideCorrelatedSags.bind(this)}>Show Correlated Sags</a>

                                {(this.props.PostedData.enableLightningData ? <a className="dropdown-item" onClick={this.showhideLightningData.bind(this)}>Show Lightning Data</a> : null)}
                                {(this.props.PostedData.postedEventName == "Snapshot" ? <a className="dropdown-item" onClick={this.showhideHarmonics.bind(this)}>Show Harmonics</a> : null)}

                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" onClick={this.exportData.bind(this, "csv")}>Export CSV</a>
                                <a className="dropdown-item" onClick={this.exportData.bind(this, "pqds")}>Export PQDS</a>
                                
                            </div>
                        </li>
                        <li className="nav-item" style={{ width: 'calc(100% - 618px)', textAlign: 'center' }}>
                            <img src={`${homePath}Images/openSEE - Waveform Viewer Header.png`}/>
                        </li>
                        <li className="nav-item" style={{ width: '156px' }}>
                            <button className="btn btn-primary" onClick={this.props.resetZoom}>Reset Zoom</button>

                        </li>
                        <li className="nav-item" style={{ width: '84px' }}>
                            <div className="btn-group dropright">
                                <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ borderRadius: "0.25rem" }}>
                                    {this.props.zoomMode == "x" ? < i className="fa fa-arrows-h" ></i> : null}
                                    {this.props.zoomMode == "y" ? < i className="fa fa-arrows-v" ></i> : null}
                                    {this.props.zoomMode == "xy" ? < i className="fa fa-arrows" ></i> : null}
                                </button>
                                <div className="dropdown-menu">
                                    <a key={"option-x"} className="dropdown-item" onClick={() => { this.props.stateSetter({ zoomMode: "x" })}}>
                                        <i className="fa fa-arrows-h" ></i> Time
                                    </a>
                                    <a key={"option-y"} className="dropdown-item" onClick={() => { this.props.stateSetter({ zoomMode: "y" })}}>
                                        <i className="fa fa-arrows-v" ></i> Value
                                    </a>
                                    <a key={"option-xy"} className="dropdown-item" onClick={() => { this.props.stateSetter({ zoomMode: "xy" })}}>
                                        <i className="fa fa-arrows" ></i> Rectangle
                                    </a>
                                </div>
                            </div>
                        </li>
                        <li className="nav-item" style={{ width: '84px' }}>
                            <button className="btn btn-primary" onClick={this.showhideSetting.bind(this)}>
                                <i className="fa fa-cog" ></i>
                            </button>
                        </li>
                        <li className="nav-item" style={{ width: '193px' }}>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    {(this.props.selected == "system" ? <a href={(this.props.nextBackLookup.System.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.System.m_Item1.ID + "&navigation=system" : '#')} id="system-back" key="system-back" className={'btn btn-primary' + (this.props.nextBackLookup.System.m_Item1 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.System.m_Item1 != null ? this.props.nextBackLookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px'}}>&lt;</a> : null)}
                                    {(this.props.selected == "station" ? <a href={(this.props.nextBackLookup.Station.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Station.m_Item1.ID + "&navigation=station" : '#')} id="station-back" key="station-back" className={'btn btn-primary' + (this.props.nextBackLookup.Station.m_Item1 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Station.m_Item1 != null ? this.props.nextBackLookup.Station.m_Item1.StartTime : '')} style={{ padding: '4px 20px'}}>&lt;</a> : null)}
                                    {(this.props.selected == "meter" ? <a href={(this.props.nextBackLookup.Meter.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Meter.m_Item1.ID + "&navigation=meter" : '#')} id="meter-back" key="meter-back" className={'btn btn-primary' + (this.props.nextBackLookup.Meter.m_Item1 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Meter.m_Item1 != null ? this.props.nextBackLookup.Meter.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                    {(this.props.selected == "line" ? <a href={(this.props.nextBackLookup.Line.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Line.m_Item1.ID + "&navigation=line" : '#')} id="line-back" key="line-back" className={'btn btn-primary' + (this.props.nextBackLookup.Line.m_Item1 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.System.m_Item1 != null ? this.props.nextBackLookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px'}}>&lt;</a> : null)}
                                </div>
                                <select id="next-back-selection" value={this.props.selected} onChange={(e) => this.props.stateSetter({ navigation: e.target.value })}>
                                    <option value="system">System</option>
                                    <option value="station">Station</option>
                                    <option value="meter">Meter</option>
                                    <option value="line">Line</option>
                                    </select>
                                <div className="input-group-append">

                                    {(this.props.selected == "system" ? <a href={(this.props.nextBackLookup.System.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.System.m_Item2.ID + "&navigation=system" : '#')} id="system-next" key="system-next" className={'btn btn-primary' + (this.props.nextBackLookup.System.m_Item2 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.System.m_Item2 != null ? this.props.nextBackLookup.System.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                    {(this.props.selected == "station" ? <a href={(this.props.nextBackLookup.Station.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Station.m_Item2.ID + "&navigation=station" : '#')} id="station-next" key="station-next" className={'btn btn-primary' + (this.props.nextBackLookup.Station.m_Item2 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Station.m_Item2 != null ? this.props.nextBackLookup.Station.m_Item2.StartTime : '')} style={{ padding: '4px 20px'}}>&gt;</a> : null)}
                                    {(this.props.selected == "meter" ? <a href={(this.props.nextBackLookup.Meter.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Meter.m_Item2.ID + "&navigation=meter" : '#')} id="meter-next" key="meter-next" className={'btn btn-primary' + (this.props.nextBackLookup.Meter.m_Item2 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Meter.m_Item2 != null ? this.props.nextBackLookup.Meter.m_Item2.StartTime : '')} style={{ padding: '4px 20px'}}>&gt;</a> : null)}
                                    {(this.props.selected == "line" ? <a href={(this.props.nextBackLookup.Line.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Line.m_Item2.ID + "&navigation=line" : '#')} id="line-next" key="line-next" className={'btn btn-primary' + (this.props.nextBackLookup.Line.m_Item2 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Line.m_Item2 != null ? this.props.nextBackLookup.Line.m_Item2.StartTime : '')} style={{ padding: '4px 20px'}}>&gt;</a> : null)}
                                </div>
                            </div>
                        </li>
                        
                    </ul>
                </div>
                <PolarChart data={this.props.TableData} callback={this.props.stateSetter} showV={this.props.displayVolt} showI={this.props.displayCur} />
                <Points pointsData={this.state.pointsData} pointsHeader={this.state.pointsHeader} pointsTable = { this.props.PointsTable } callback={this.props.stateSetter} postedData={this.props.PostedData} />
                <Tooltip data={this.props.TableData} hover={this.props.Hover} callback={this.props.stateSetter} />
                <TooltipWithDelta pointdata={this.state.pointsData} pointheader={this.state.pointsHeader} PostedData={this.props.PostedData} callback={this.props.stateSetter} />
                <ScalarStats eventId={this.props.eventid} callback={this.props.stateSetter} exportCallback={(type) => this.exportData(type)} />
                <HarmonicStats eventId={this.props.eventid} callback={this.props.stateSetter} exportCallback={(type) => this.exportData(type)} />
                <TimeCorrelatedSags eventId={this.props.eventid} callback={this.props.stateSetter} exportCallback={(type) => this.exportData(type)} />
                <LightningData eventId={this.props.eventid} callback={this.props.stateSetter} />
                <SettingWindow
                    showI={this.props.displayCur}
                    showV={this.props.displayVolt}
                    stateSetter={this.props.stateSetter}
                    unitSetting={this.props.unitData}
                    colorSetting={this.props.colorData}
                    showAnalogs={this.props.displayAnalogs}
                    showdigitals={this.props.breakerdigitals}
                    showTCE={this.props.displayTCE}
                    showAnalytics={this.props.displayAnalytics}
                    yLimits={this.props.yLimits}
                />
            </nav>
        );
 
        //   {this.state.showComtradeExportButton ? <a className="dropdown-item" onClick={this.exportComtrade.bind(this)}>Export COMTRADE</a> : null}   

    }

    showhidePoints(evt) {
        this.props.stateSetter({ PointsTable: [] });
        $('#accumulatedpoints').show();
    }

    showhideTooltip(evt) {
        $('#unifiedtooltip').show();
        //$('.legendCheckbox').show();
    }

    showhideTooltipWithDelta(evt) {
        this.props.stateSetter({ PointsTable: [] });
        $('#tooltipwithdelta').show();
        //$('.legendCheckbox').show();
    }

    showhidePhasor(evt) {
        $('#phasor').show();
    }

    showhideStats(evt) {
        $('#scalarstats').show();
    }

    showhideCorrelatedSags(evt) {
        $('#correlatedsags').show();
    }

    showhideHarmonics(evt) {
        $('#harmonicstats').show();
    }

    showhideLightningData() {
        $('#lightningquery').show();
    }

    showhideSetting() {
        $('#settings').show();
    }


    exportData(type) {
        window.open(homePath + `CSVDownload.ashx?type=${type}&eventID=${this.props.eventid}` + 
            `${this.props.displayVolt != undefined ? `&displayVolt=${this.props.displayVolt}` : ``}` + 
            `${this.props.displayCur != undefined ? `&displayCur=${this.props.displayCur}` : ``}` + 
            `${this.props.displayTCE != undefined ? `&displayTCE=${this.props.displayTCE}` : ``}` + 
            `${this.props.breakerdigitals != undefined ? `&breakerdigitals=${this.props.breakerdigitals}` : ``}` + 
            `${this.props.displayAnalogs != undefined ? `&displayAnalogs=${this.props.displayAnalogs}` : ``}` +
            `${this.props.displayAnalytics != undefined ? `&displayAnalytics=${this.props.displayAnalytics}` : ``}` +
            `${this.props.filterOrder != undefined ? `&filterOrder=${this.props.filterOrder}` : ``}` + 
            `${this.props.Trc != undefined ? `&Trc=${this.props.Trc}` : ``}` +
            `${this.props.harmonic != undefined ? `&harmonic=${this.props.harmonic}` : ``}` +
            `&Meter=${this.props.PostedData.postedMeterName}` +
            `&EventType=${this.props.PostedData.postedEventName}`
            );
            /*+
            `${this.props.startDate != undefined ? `&startDate=${this.props.startDate}` : ``}` +
            `${this.props.endDate != undefined ? `&endDate=${this.props.endDate}` : ``}` +
            `&Meter=${this.props.PostedData.postedMeterName}` +
            `&EventType=${this.props.PostedData.postedEventName}`); */
        
    }

    exportComtrade(evt) {
        window.open(homePath + `OpenSEEComtradeDownload.ashx?eventID=${this.props.eventid}` +
            `${this.props.startDate != undefined ? `&startDate=${this.props.startDate}` : ``}` +
            `${this.props.endDate != undefined ? `&endDate=${this.props.endDate}` : ``}` +
            `&Meter=${this.props.PostedData.postedMeterName}` +
            `&EventType=${this.props.PostedData.postedEventName}`);
    }

}