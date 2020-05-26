 //******************************************************************************************************
//  openSEE.tsx - Gbtc
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//  08/22/2019 - Christoph Lackner
//       Added TCE Plot.
//
//******************************************************************************************************

/// <reference path="openSee.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import OpenSEEService from '../TS/Services/OpenSEE';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import { clone, isEqual} from "lodash";

import Current from './Graphs/Current';
import TripCoilCurrent from './Graphs/TCE';
import Digital from './Graphs/Digital';
import Voltage from './Graphs/Voltage';

import OpenSEENoteModal from './Components/OpenSEENoteModal';
import MultiselectWindow from './Components/MultiselectWindow';
import RadioselectWindow from './Components/RadioselectWindow';

import AnalyticLine from './Graphs/AnalyticLine';
import AnalyticBar from './Graphs/AnalyticBar';

import OpenSEENavbar from './Components/OpenSEENavbar';
import About from './Components/About';

import { D3LineChartBaseProps, iD3DataPoint } from './Graphs/D3LineChartBase';
import Analog from './Graphs/Analog';

export class OpenSEE extends React.Component<{}, OpenSEEState>{
    history: object;
    historyHandle: any;
    openSEEService: OpenSEEService;
    resizeId: any;
    TableData: Array<iD3DataPoint>;

    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);
        this.resizeId;
        this.state = {
            eventid: (query['eventid'] != undefined ? query['eventid'] : eventID),
            StartDate: (query['StartDate'] != undefined ? query['StartDate'] : eventStartTime),
            startTime: (query['StartDate'] != undefined ? new Date(query['StartDate'] + "Z").getTime() : new Date(eventStartTime + "Z").getTime()),
            endTime: (query['EndDate'] != undefined ? new Date(query['EndDate'] + "Z").getTime() : new Date(eventEndTime + "Z").getTime()),
            startTimeVis: (query['StartDate'] != undefined ? new Date(query['StartDate'] + "Z").getTime() : new Date(eventStartTime + "Z").getTime()),
            endTimeVis: (query['EndDate'] != undefined ? new Date(query['EndDate'] + "Z").getTime() : new Date(eventEndTime + "Z").getTime()),

            EndDate: (query['EndDate'] != undefined ? query['EndDate'] : eventEndTime),
            displayVolt: (query['displayVolt'] != undefined ? query['displayVolt'] == '1' || query['displayVolt'] == 'true' : true),
            displayCur: (query['displayCur'] != undefined ? query['displayCur'] == '1' || query['displayCur'] == 'true' : true),
            displayTCE: query['displayTCE'] == '1' || query['displayTCE'] == 'true',
            breakerdigitals: query['breakerdigitals'] == '1' || query['breakerdigitals'] == 'true',
            displayAnalogs: query['displayAnalogs'] == 'true' || query['displayAnalogs'] == 'true',

            Width: window.innerWidth - 300,
            Hover: null,
            PointsTable: new Array<iD3DataPoint>(),
            TableData: new Array<iD3DataPoint>(),
            PostedData: {},
            nextBackLookup:{
                Meter: {},
                System: {},
                Station: {},
                Line: {}
            },
            navigation: query["navigation"] != undefined ? query["navigation"] : "system",
            tab: query["tab"] != undefined ? query["tab"] : "Info",
            comparedEvents: (query["comparedEvents"] != undefined ? (Array.isArray(query["comparedEvents"]) ? query["comparedEvents"].map(a => parseInt(a)) : [parseInt(query["comparedEvents"])]) : []),
            overlappingEvents: [],
            analytic: query["analytic"] != undefined ? query["analytic"] : "FaultDistance",
            AnalyticSettings: { harmonic: 5, order: 1, Trc: 100, fftWindow: 1 },
            fftStartTime: query['fftStartTime'] != undefined ? parseInt(query['fftStartTime']) : null,
            barChartReset: null
           
        }

        this.TableData = [];

        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            this.setState({
                eventid: (query['eventid'] != undefined ? query['eventid'] : 0),
                StartDate: (query['StartDate'] != undefined ? query['StartDate'] : eventStartTime),
                EndDate: (query['EndDate'] != undefined ? query['EndDate'] : eventEndTime),
                breakerdigitals: query['breakerdigitals'] == '1' || query['breakerdigitals'] == 'true',
                displayAnalogs: query['displayAnalogs'] == '1' || query['displayAnalogs'] == 'true',
                displayTCE: query['displayTCE'] == '1' || query['displayTCE'] == 'true',
                displayVolt: (query['displayVolt'] != undefined ? query['displayVolt'] == '1' || query['displayVolt'] == 'true' : true),
                displayCur: (query['displayCur'] != undefined ? query['displayCur'] == '1' || query['displayCur'] == 'true' : true),
                fftStartTime: query['fftStartTime'] != undefined ? parseInt(query['fftStartTime']) : null
            });


        });
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));

        this.openSEEService.getHeaderData(this.state).done(data => {
            this.setState({
                PostedData: data,
                nextBackLookup: data.nextBackLookup
            });
        });

        this.openSEEService.getOverlappingEvents(this.state.eventid, this.state.StartDate, this.state.EndDate).done(data => {           
            this.setState({
                overlappingEvents: data.map(d => new Object({ group: d.MeterName, label: d.AssetName, value: d.EventID, selected: this.state.comparedEvents.indexOf(d.EventID) >= 0 }))
            });
        });

    }

    componentWillUnmount() {
        $(window).off('resize');
    }

    componentDidCatch(error, info) {
        console.log(error);
        console.log(info);
    }

    handleScreenSizeChange() {
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
            this.setState({
                Width: window.innerWidth - 300,
                Height: this.calculateHeights(this.state)
            });
        }, 500);
    }

    render() {
        var height = this.calculateHeights(this.state);
        var windowHeight = window.innerHeight;

        return (
            <div style={{ position: 'absolute', width: '100%', height: windowHeight, overflow: 'hidden' }}>
                {/* the navigation side bar*/}
                <div style={{ width: 300, height: windowHeight, backgroundColor: '#eeeeee', position: 'relative', float: 'left', overflow: 'hidden' }}>
                    <a href="https://www.gridprotectionalliance.org"><img style={{ width: 280, margin: 10 }} src={`${homePath}Images/2-Line - 500.png`}/></a>
                    <fieldset className="border" style={{ padding: '10px' }}>
                        <legend className="w-auto" style={{ fontSize: 'large' }}>Waveform Views:</legend>
                        <form>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayVolt: !this.state.displayVolt})} checked={this.state.displayVolt} />Voltage</label>
                            <label style={{ marginLeft: '15px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayCur: !this.state.displayCur })} checked={this.state.displayCur} />Current</label>
                            <label style={{ marginLeft: '15px' }}><input type="checkbox" onChange={() => this.stateSetter({ breakerdigitals: !this.state.breakerdigitals })} checked={this.state.breakerdigitals} />Digitals</label>
                            <label style={{ marginLeft: '10px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayAnalogs: !this.state.displayAnalogs })} checked={this.state.displayAnalogs} />Analogs</label>
                            <label style={{ marginLeft: '15px' }}><input type="checkbox" onChange={() => this.stateSetter({ displayTCE: !this.state.displayTCE })} checked={this.state.displayTCE} />TCE</label>
                        </form>
                    </fieldset>

                    <br />

                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Info" ?  " active" : '') } id="home-tab" data-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected="true" onClick={(obj: any) => this.stateSetter({ tab: obj.target.text })} >Info</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Compare" ? " active" : '')} id="profile-tab" data-toggle="tab" href="#compare" role="tab" aria-controls="compare" aria-selected="false" onClick={(obj: any) => this.stateSetter({ tab: obj.target.text })} >Compare</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Analytics" ? " active" : '')} id="contact-tab" data-toggle="tab" href="#analysis" role="tab" aria-controls="analysis" aria-selected="false" onClick={(obj: any) => this.stateSetter({ tab: obj.target.text })} >Analytics</a>
                        </li>
                    </ul>
                    <div className="tab-content" id="myTabContent" style={{ maxHeight: windowHeight - 325, display: 'block', overflowY: 'auto' }}>
                        <div className={"tab-pane fade" + (this.state.tab == "Info" ? " show active" : '') } id="info" role="tabpanel" aria-labelledby="home-tab">
                            <table className="table">
                                <tbody style={{ display: 'block'}}>
                                    <tr><td>Meter:</td><td>{this.state.PostedData.postedMeterName}</td></tr>
                                    <tr><td>Station:</td><td>{this.state.PostedData.postedStationName}</td></tr>
                                    <tr><td>Asset:</td><td>{this.state.PostedData.postedAssetName}</td></tr>
                                    <tr><td>Event Type:</td><td>{(this.state.PostedData.postedEventName != 'Fault' ? this.state.PostedData.postedEventName : <a href="#" title="Click for fault details" onClick={() => window.open(homePath + "FaultSpecifics.aspx?eventid=" + this.state.PostedData.postedEventId, this.state.PostedData.postedEventId + "FaultLocation", "left=0,top=0,width=350,height=300,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no")}>Fault</a>)}</td></tr>
                                    <tr><td>Event Date:</td><td>{this.state.PostedData.postedEventDate}</td></tr>
                                    {(this.state.PostedData.postedStartTime != undefined ? <tr><td>Start Time:</td><td>{this.state.PostedData.postedStartTime}</td></tr> : null)}
                                    {(this.state.PostedData.postedPhase != undefined ? <tr><td>Phase:</td><td>{this.state.PostedData.postedPhase}</td></tr> : null)}
                                    {(this.state.PostedData.postedDurationPeriod != undefined ? <tr><td>Duration:</td><td>{this.state.PostedData.postedDurationPeriod}</td></tr> : null)}
                                    {(this.state.PostedData.postedMagnitude != undefined ? <tr><td>Magnitude:</td><td>{this.state.PostedData.postedMagnitude}</td></tr> : null)}
                                    {(this.state.PostedData.postedSagDepth != undefined ? <tr><td>Sag Depth:</td><td>{this.state.PostedData.postedSagDepth}</td></tr> : null)}
                                    {(this.state.PostedData.postedBreakerNumber != undefined ? <tr><td>Breaker:</td><td>{this.state.PostedData.postedBreakerNumber}</td></tr> : null)}
                                    {(this.state.PostedData.postedBreakerTiming != undefined ? <tr><td>Timing:</td><td>{this.state.PostedData.postedBreakerTiming}</td></tr> : null)}
                                    {(this.state.PostedData.postedBreakerSpeed != undefined ? <tr><td>Speed:</td><td>{this.state.PostedData.postedBreakerSpeed}</td></tr> : null)}
                                    {(this.state.PostedData.postedBreakerOperation != undefined ? <tr><td>Operation:</td><td>{this.state.PostedData.postedBreakerOperation}</td></tr> : null)}
                                    <tr><td><button className="btn btn-link" onClick={(e) => { window.open(this.state.PostedData.xdaInstance + '/Workbench/Event.cshtml?EventID=' + this.state.eventid) }}>Edit</button></td><td>{(userIsAdmin ? <OpenSEENoteModal eventId={this.state.eventid} /> : null)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={"tab-pane fade" + (this.state.tab == "Compare" ? " show active" : '')} id="compare" role="tabpanel" aria-labelledby="profile-tab">

                            <MultiselectWindow comparedEvents={this.state.comparedEvents} stateSetter={this.stateSetter.bind(this)} data={this.state.overlappingEvents} />
                        </div>
                        <div className={"tab-pane fade" + (this.state.tab == "Analytics" ? " show active" : '')} id="analysis" role="tabpanel" aria-labelledby="contact-tab">
                            <RadioselectWindow
                                stateSetter={this.stateSetter.bind(this)}
                                analytic={this.state.analytic}
                                analyticSettings={this.state.AnalyticSettings}
                                eventID={this.state.eventid}
                                fftStartDate={this.state.fftStartTime}
                            />
                        </div>
                    </div>
                    <div style={{width: '100%', textAlign: 'center', position: 'absolute', bottom: 20}}>
                        <span>Version 3.0</span>
                        <br/>
                        <span><About/></span>
                    </div>
                </div> 
                <div id="chartpanel" style={{ width: 'calc(100% - 300px)', height: 'inherit', position: 'relative', float: 'right', overflow: 'hidden' }}>
                    <OpenSEENavbar
                        eventid={this.state.eventid}
                        endDate={this.state.EndDate}
                        Hover={this.state.Hover}
                        key="navbar"
                        nextBackLookup={this.state.nextBackLookup}
                        PointsTable={this.state.PointsTable}
                        PostedData={this.state.PostedData}
                        ref="navbar"
                        resetZoom={this.resetZoom.bind(this)}
                        selected={this.state.navigation}
                        startDate={this.state.StartDate}
                        stateSetter={this.stateSetter.bind(this)}
                        TableData={this.state.TableData}
                        displayVolt={this.state.displayVolt}
                        displayCur={this.state.displayCur}
                        displayTCE={this.state.displayTCE}
                        breakerdigitals={this.state.breakerdigitals}
                        displayAnalogs={this.state.displayAnalogs}
                        displayAnalytics={this.state.tab == "Analytics" ? this.state.analytic : ""}
                        filterOrder={this.state.AnalyticSettings.order}
                        Trc={this.state.AnalyticSettings.Trc}
                        harmonic={this.state.AnalyticSettings.harmonic}
                    />
                    <div style={{ padding: '0', height: "calc(100% - 62px)", overflowY: 'auto' }}>
                        <ViewerWindow pointTable={this.state.PointsTable} tableReset = {() => this.ResetTable()} tableSetter={(obj) => this.tableUpdater(obj)} key={this.state.eventid} eventId={this.state.eventid} startTimeVis={this.state.startTimeVis} endTimeVis={this.state.endTimeVis} startTime={this.state.startTime} endTime={this.state.endTime} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} displayVolt={this.state.displayVolt} displayCur={this.state.displayCur} displayTCE={this.state.displayTCE} displayDigitals={this.state.breakerdigitals} displayAnalogs={this.state.displayAnalogs} isCompare={(this.state.tab == "Compare")} label={this.state.PostedData.postedAssetName} fftStartTime={this.state.fftStartTime} fftWindow={this.state.AnalyticSettings.fftWindow} />
                        {(this.state.tab == "Compare" && this.state.overlappingEvents.length > 0 ? this.state.comparedEvents.map(a => <ViewerWindow key={a} eventId={a} startTimeVis={this.state.startTimeVis} endTimeVis={this.state.endTimeVis} startTime={this.state.startTime} endTime={this.state.endTime} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} displayVolt={this.state.displayVolt} displayCur={this.state.displayCur} displayTCE={this.state.displayTCE} displayAnalogs={this.state.displayAnalogs} displayDigitals={this.state.breakerdigitals} fftStartTime={this.state.fftStartTime} fftWindow={this.state.AnalyticSettings.fftWindow} isCompare={true} label={<a target="_blank" href={homePath + 'Main/OpenSEE?eventid=' + a}>{this.state.overlappingEvents.find(x => x.value == a).label}</a>} />) : null)}
                        {(this.state.tab == "Analytics" && (this.state.analytic == "FFT" || this.state.analytic == "HarmonicSpectrum") ?
                            <AnalyticBar analytic={this.state.analytic} analyticParameter={this.state.AnalyticSettings} eventId={this.state.eventid} startTime={this.state.fftStartTime} fftWindow={this.state.AnalyticSettings.fftWindow} pixels={this.state.Width} stateSetter={this.stateSetter.bind(this)} height={height} options={{ showXLabel: true }} /> : null)}
                        {(this.state.tab == "Analytics" && (this.state.analytic != "FFT" && this.state.analytic != "HarmonicSpectrum") ?
                            <AnalyticLine pointTable={this.state.PointsTable} analytic={this.state.analytic} analyticParameter={this.state.AnalyticSettings} eventId={this.state.eventid} fftStartTime={this.state.fftStartTime} fftWindow={this.state.AnalyticSettings.fftWindow} startTimeVis={this.state.startTimeVis} endTimeVis={this.state.endTimeVis} startTime={this.state.startTime} endTime={this.state.endTime} stateSetter={this.stateSetter.bind(this)} height={height} hover={this.state.Hover} options={{ showXLabel: true }} /> : null)}

                    </div>
                </div>
            </div>
        );
    }

    stateSetter(obj) {
        

        if (obj.fftStartTime != undefined && obj.fftStartTime == 0) {
            obj.fftStartTime = this.state.startTime;
        }
        var oldQueryString = this.toQueryString(this.state);
        var oldQuery = queryString.parse(oldQueryString);

        this.setState(obj, () => {
            var newQueryString = this.toQueryString(this.state);
            var newQuery = queryString.parse(newQueryString);
            if (!isEqual(oldQuery, newQuery)) {
                clearTimeout(this.historyHandle);
                this.historyHandle = setTimeout(() => this.history['push'](this.history['location'].pathname + '?' + newQueryString), 500);
            }
        });
    }

    ResetTable() {
        this.TableData = [];
        this.setState({ PointsTable: [] })
    }

    tableUpdater(obj: Array<iD3DataPoint>) {

        
        obj.forEach(item => {
            let i = this.TableData.findIndex(d => {
                return (
                    d.ChannelID == item.ChannelID &&
                    d.ChartLabel == item.ChartLabel &&
                    d.XaxisLabel == item.XaxisLabel &&
                    d.LegendClass == item.LegendClass &&
                    d.LegendGroup == item.LegendGroup &&
                    d.SecondaryLegendClass == item.SecondaryLegendClass &&
                    d.LegendKey == item.LegendKey
                )
            });
            if (i > -1) {
                this.TableData[i] = item
            }
            else
                this.TableData.push(item)
        });

        this.setState({ TableData: this.TableData });
    }

    resetZoom() {
        
        clearTimeout(this.historyHandle);
        this.history['push'](this.history['location'].pathname + '?' + this.toQueryString(this.state))

        if (this.state.barChartReset != null)
            this.state.barChartReset()

        this.setState({ startTimeVis: this.state.startTime, endTimeVis: this.state.endTime })
    }

    calculateHeights(obj: any) {
        if (obj.tab == "Compare") return 300;
        return (window.innerHeight - 100 - 30) / (Number(obj.displayVolt) + Number(obj.displayCur) + Number(obj.breakerdigitals) + Number(obj.displayTCE) + Number(obj.displayAnalogs) + Number(obj.tab == "Analytics"))
    }

    toQueryString(state) {
        var prop = clone(state);
        delete prop.Hover;
        delete prop.Width;
        delete prop.TableData;
        delete prop.phasorButtonText;
        delete prop.pointsButtonText;
        delete prop.tooltipButtonText;
        delete prop.harmonicButtonText;
        delete prop.statButtonText;
        delete prop.correlatedSagsButtonText;
        delete prop.PointsTable;
        delete prop.PostedData;
        delete prop.nextBackLookup;
        delete prop.overlappingEvents;
        delete prop.TooltipWithDeltaTable;
        delete prop.barChartReset;

        return queryString.stringify(prop, { encode: false });
}





}

interface ViewerWindowProps extends D3LineChartBaseProps {
    isCompare: boolean, displayVolt: boolean, displayCur: boolean, displayTCE: boolean, displayDigitals: boolean, displayAnalogs: boolean, label: string | JSX.Element,
   
}

const ViewerWindow = (props: ViewerWindowProps) => {
    return ( props.isCompare ? 
        <div className="card" style={{ height: (props.isCompare ? null : '100%') }}>
            <div className="card-header">{props.label}</div>
            <div className="card-body" style={{ padding: 0 }}>
                {(props.displayVolt ? <Voltage pointTable={props.pointTable} tableReset={props.tableReset} tableSetter={props.tableSetter} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: !(props.displayCur || props.displayDigitals || props.displayTCE || props.displayAnalogs) }} /> : null)}
                {(props.displayCur ? <Current pointTable={props.pointTable} tableReset={props.tableReset} tableSetter={props.tableSetter} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: !(props.displayDigitals || props.displayTCE || props.displayAnalogs) }} /> : null)}
                {(props.displayDigitals ? <Digital pointTable={props.pointTable} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: !(props.displayTCE || props.displayAnalogs) }} /> : null)}
                {(props.displayAnalogs ? <Analog pointTable={props.pointTable} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: !(props.displayTCE) }} /> : null)}
                {(props.displayTCE ? <TripCoilCurrent pointTable={props.pointTable} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: true }} /> : null)}
            </div>
        </div>
        :
        <div>
            {(props.displayVolt ? <Voltage pointTable={props.pointTable} tableSetter={props.tableSetter} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: !(props.displayCur || props.displayDigitals || props.displayTCE || props.displayAnalogs) }} /> : null)}
            {(props.displayCur ? <Current pointTable={props.pointTable} tableReset={props.tableReset} tableSetter={props.tableSetter} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: !(props.displayDigitals || props.displayTCE || props.displayAnalogs) }} /> : null)}
            {(props.displayDigitals ? <Digital pointTable={props.pointTable} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: !(props.displayTCE || props.displayAnalogs) }} /> : null)}
            {(props.displayAnalogs ? <Analog pointTable={props.pointTable} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: !(props.displayTCE) }} /> : null)}
            {(props.displayTCE ? <TripCoilCurrent pointTable={props.pointTable} fftStartTime={props.fftStartTime} fftWindow={props.fftWindow} eventId={props.eventId} startTimeVis={props.startTimeVis} endTimeVis={props.endTimeVis} startTime={props.startTime} endTime={props.endTime} stateSetter={props.stateSetter} height={props.height} hover={props.hover} options={{ showXLabel: true }} /> : null)}
        </div>
            
        );
}

ReactDOM.render(<OpenSEE />, document.getElementById('DockCharts'));

