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

// To-DO:
// # Add Analytic Parameters and Selected Events to Query
// # Fix Pop up windows
// # Fix Dowload.ash to include Analytics
//

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store/store';

import { OpenSee } from './global';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import { isEqual, groupBy } from "lodash";
import { connect } from 'react-redux';

import About from './Components/About';
import OpenSEENoteModal from './Components/OpenSEENoteModal';
import AnalyticOptions from './Components/AnalyticOptions';
import LineChart from './Graphs/LineChartBase';
import OpenSeeNavBar from './Components/OpenSEENavbar';
import {
    LoadSettings, SelectdisplayAnalogs, SelectdisplayCur, SelectdisplayDigitals, SelectdisplayTCE, SelectdisplayVolt,
    SelectNavigation,
    SelectQueryString, SelectTab, SetdisplayAnalogs, SetdisplayCur, SetdisplayDigitals, SetdisplayTCE, SetdisplayVolt, SetTab
} from './store/settingSlice';
import { AddPlot, SetTimeLimit, RemovePlot, selectListGraphs, selectLoadVoltages, selectLoadCurrents, selectLoadAnalogs, selectLoadDigitals, selectLoadTCE, SetAnalytic, selectAnalytic } from './store/dataSlice';
import { LoadOverlappingEvents, selectNumberCompare, ClearOverlappingEvent, selecteventList } from './store/eventSlice';
import { setEventInfo } from "./store/infoSlice"
import OverlappingEventWindow from './Components/MultiselectWindow';
import BarChart from './Graphs/BarChartBase';
import { SetFFTWindow } from './store/analyticSlice';
import { updatedURL } from './store/queryThunk';
import { SmallLoadingIcon } from './Graphs/ChartIcons';
import styled from "styled-components";
import { Application, Page, SplitDrawer, SplitSection, VerticalSplit } from '@gpa-gemstone/react-interactive';


declare var homePath: string;
declare var userIsAdmin: boolean;
declare var userID: boolean;
declare var eventID: number;
declare var eventStartTime: string;
declare var eventEndTime: string;
declare var version: string;

declare const MOMENT_DATETIME_FORMAT = 'MM/DD/YYYYTHH:mm:ss.SSSSSSSS';
const Plotorder: OpenSee.graphType[] = ['Voltage', 'Current', 'Analogs', 'Digitals', 'TripCoil'];

const MainDiv = styled.div`
& {
    top: 70px;
    position: relative;
    width: calc(100% - ${0}px);
    height: calc(100% - 48px);
    overflow: hidden;
    left: ${props => 0}px;
}
& svg {
    user-select: none;
 }`;


class OpenSEEHome extends React.Component<OpenSee.IOpenSeeProps, OpenSee.iOpenSeeState>{
    history: object;
    historyHandle: any;
    resizeHandle: any;

    overlappingEventHandle: JQuery.jqXHR;
    eventDataHandle: JQuery.jqXHR;
    navigationDataHandle: JQuery.jqXHR;


    constructor(props) {
        super(props);
        
        this.history = createHistory();

        let query = queryString.parse(this.history['location'].search);
       
        this.state = {
            
            eventStartTime: (query['eventStartTime'] != undefined ? query['eventStartTime'] : eventStartTime),
            eventEndTime: (query['eventEndTime'] != undefined ? query['eventEndTime'] : eventEndTime),
            comparedEvents: [],
            overlappingEvents: [],
           

            graphWidth: window.innerWidth - 300,
            eventData: null,
            lookup: null,
            breakeroperation: undefined,
        }

        let startTime = (query['startTime'] != undefined ? parseInt(query['startTime']) : new Date(this.state.eventStartTime + "Z").getTime());
        let endTime = (query['endTime'] != undefined ? parseInt(query['endTime']) : new Date(this.state.eventEndTime + "Z").getTime());

        store.dispatch(SetTimeLimit({ start: startTime, end: endTime}));
       
        store.dispatch(updatedURL({ query: this.history['location'].search, initial: true }));

        this.history['listen']((location, action) => {
            // If Query changed then we update states....
            // Note that enabled and selected states that depend on loading state are not dealt with in here
            store.dispatch(updatedURL({ query: location.search, initial: false }));
            });
       
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));

        store.dispatch(LoadOverlappingEvents())
        this.getEventData();
    }

    getEventData() {
        if (this.eventDataHandle !== undefined)
            this.eventDataHandle.abort();

        if (this.navigationDataHandle !== undefined)
            this.navigationDataHandle.abort();

        const url = `${homePath}api/OpenSEE/GetHeaderData?eventId=${this.props.eventID}` + `${this.state.breakeroperation != undefined ? `&breakeroperation=${this.state.breakeroperation}` : ``}`

        this.eventDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHeaderData?eventId=${this.props.eventID}` +
                `${this.state.breakeroperation != undefined ? `&breakeroperation=${this.state.breakeroperation}` : ``}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        
        store.dispatch(setEventInfo({eventID: this.props.eventID, breakeroperation: this.state.breakeroperation }))
        this.eventDataHandle.then(data => {
            this.setState({
                eventData: data
            });

        store.dispatch(SetFFTWindow({ cycle: 1, startTime: new Date(eventStartTime + "Z").getTime() }))

        });

        this.navigationDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetNavData?eventId=${this.props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        this.navigationDataHandle.then(data => {
            this.setState({
                lookup: data
            });
        });
    }

    componentDidUpdate(prevProps: OpenSee.IOpenSeeProps, oldstate: OpenSee.iOpenSeeState) {
        if (prevProps.eventID != this.props.eventID)
            this.getEventData();
        if (prevProps.Tab != this.props.Tab && prevProps.Tab == 'Analytic')
            store.dispatch(SetAnalytic('none'));
        if (prevProps.Tab != this.props.Tab && this.props.Tab == 'Analytic' && this.props.analytic == 'none')
            store.dispatch(SetAnalytic('FirstDerivative'));
        if (prevProps.Tab != this.props.Tab && prevProps.Tab == 'Compare')
            store.dispatch(ClearOverlappingEvent());
        if (prevProps.querystring != this.props.querystring) {
            clearTimeout(this.historyHandle);
            this.historyHandle = setTimeout(() => this.history['push'](this.history['location'].pathname + '?' + this.props.querystring), 1000);
        }
    }

    componentWillUnmount() {
        $(window).off('resize');
    }

    componentDidCatch(error, info) {
        console.log(error);
        console.log(info);
    }
 
    handleScreenSizeChange() {
        clearTimeout(this.resizeHandle);
        this.resizeHandle = setTimeout(() => {
            this.setState({
                graphWidth: window.innerWidth - 300,
            });
        }, 500);
    }

    sortGraph(item1: OpenSee.IGraphProps, item2: OpenSee.IGraphProps): number {
        if (item1.DataType == item2.DataType)
            return 0

        let index1 = Plotorder.findIndex((v) => v == item1.DataType);
        let index2 = Plotorder.findIndex((v) => v == item2.DataType);

        if (index1 != -1 && index2 != -1)
            return (index1 > index2 ? 1 : -1);
        if (index1 != -1)
            return -1;
        if (index2 != -1)
            return 1;

        return (item1 > item2 ? 1 : -1);
    }   

    render() {
        var height = this.calculateHeights();
        var windowHeight = window.innerHeight;

        let plotData = groupBy(this.props.graphList,"EventId");

        return (
            <Application HomePath={"/"}
                DefaultPath=""
                HideSideBar={true}
                Version={version}
                Logo={`${homePath}Images/openSEE.jpg`}
                NavBarContent={<OpenSeeNavBar
                    EventData={this.state.eventData}
                    Lookup={this.state.lookup}
                    stateSetter={this.setState}
                />}>
                <Page Name= "">
                {/* the navigation side bar
                <div style={{ width: 300, height: windowHeight, backgroundColor: '#eeeeee', position: 'relative', float: 'left', overflow: 'hidden' }}>
                    <a href="https://www.gridprotectionalliance.org"><img style={{ width: 280, margin: 10 }} src={`${homePath}Images/2-Line - 500.png`}/></a>
                    <fieldset className="border" style={{ padding: '10px' }}>
                        <legend className="w-auto" style={{ fontSize: 'large' }}>Waveform Views:</legend>
                        <div className="form-check form-check-inline">
                            {this.props.loadVolt ? <SmallLoadingIcon /> : <input className="form-check-input" type="checkbox" onChange={() => this.toggleVoltage()} checked={this.props.displayVolt} />}
                            <label className="form-check-label">Voltage</label>
                        </div>
                        <div className="form-check form-check-inline">
                            {this.props.loadCurr ? <SmallLoadingIcon /> : <input className="form-check-input" type="checkbox" onChange={() => this.toggleCurrent()} checked={this.props.displayCur} />}
                            <label className="form-check-label">Current</label>
                        </div>
                        <div className="form-check form-check-inline">
                            {this.props.loadAnalog ? <SmallLoadingIcon /> : <input className="form-check-input" type="checkbox" onChange={() => this.toggleAnalogs()} checked={this.props.displayAnalogs} />}
                            <label className="form-check-label">Analogs</label>
                        </div>
                        <div className="form-check form-check-inline">
                            {this.props.loadDigital ? <SmallLoadingIcon /> : <input className="form-check-input" type="checkbox" onChange={() => this.toggleDigitals()} checked={this.props.displayDigitals} />}
                            <label className="form-check-label">Digitals</label>
                        </div>
                        <div className="form-check form-check-inline">
                            {this.props.loadTCE ? <SmallLoadingIcon /> : < input className="form-check-input" type="checkbox" onChange={() => this.toggleTCE()} checked={this.props.displayTCE} />}
                            <label className="form-check-label">Trip Coil E.</label>
                        </div>
                    </fieldset>

                    <br />

                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className={"nav-link" + (this.props.Tab == "Info" ? " active" : '')} id="home-tab" data-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected="true" onClick={(obj: any) => store.dispatch(SetTab("Info"))} >Info</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (this.props.Tab == "Compare" ? " active" : '')} id="profile-tab" data-toggle="tab" href="#compare" role="tab" aria-controls="compare" aria-selected="false" onClick={(obj: any) => store.dispatch(SetTab("Compare"))} >Compare</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (this.props.Tab == "Analytic" ? " active" : '')} id="contact-tab" data-toggle="tab" href="#analysis" role="tab" aria-controls="analysis" aria-selected="false" onClick={(obj: any) => store.dispatch(SetTab("Analytic"))} >Analytics</a>
                        </li>
                    </ul>
                    <div className="tab-content" id="myTabContent" style={{ maxHeight: windowHeight - 325, display: 'block', overflowY: 'auto' }}>
                        <div className={"tab-pane fade" + (this.props.Tab == "Info" ? " show active" : '')} id="info" role="tabpanel" aria-labelledby="home-tab">
                            {this.state.eventData != undefined ?
                                <table className="table">
                                    <tbody style={{ display: 'block' }}>
                                        <tr><td>Meter:</td><td>{this.state.eventData.MeterName}</td></tr>
                                        <tr><td>Station:</td><td>{this.state.eventData.StationName}</td></tr>
                                        <tr><td>Asset:</td><td>{this.state.eventData.AssetName}</td></tr>
                                        <tr><td>Event Type:</td><td>{(this.state.eventData.EventName != 'Fault' ? this.state.eventData.EventName : <a href="#" title="Click for fault details" onClick={() => window.open("./FaultSpecifics.aspx?eventid=" + this.props.eventID, this.props.eventID + "FaultLocation", "left=0,top=0,width=350,height=300,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no")}>Fault</a>)}</td></tr>
                                        <tr><td>Event Date:</td><td>{this.state.eventData.EventDate}</td></tr>
                                        {(this.state.eventData.StartTime != undefined ? <tr><td>Event Start:</td><td>{this.state.eventData.StartTime}</td></tr> : null)}
                                        {(this.state.eventData.Phase != undefined ? <tr><td>Phase:</td><td>{this.state.eventData.Phase}</td></tr> : null)}
                                        {(this.state.eventData.DurationPeriod != undefined ? <tr><td>Duration:</td><td>{this.state.eventData.DurationPeriod}</td></tr> : null)}
                                        {(this.state.eventData.Magnitude != undefined ? <tr><td>Magnitude:</td><td>{this.state.eventData.Magnitude}</td></tr> : null)}
                                        {(this.state.eventData.SagDepth != undefined ? <tr><td>Sag Depth:</td><td>{this.state.eventData.SagDepth}</td></tr> : null)}
                                        {(this.state.eventData.BreakerNumber != undefined ? <tr><td>Breaker:</td><td>{this.state.eventData.BreakerNumber}</td></tr> : null)}
                                        {(this.state.eventData.BreakerTiming != undefined ? <tr><td>Timing:</td><td>{this.state.eventData.BreakerTiming}</td></tr> : null)}
                                        {(this.state.eventData.BreakerSpeed != undefined ? <tr><td>Speed:</td><td>{this.state.eventData.BreakerSpeed}</td></tr> : null)}
                                        {(this.state.eventData.BreakerOperation != undefined ? <tr><td>Operation:</td><td>{this.state.eventData.BreakerOperation}</td></tr> : null)}
                                        <tr><td><button className="btn btn-link" onClick={(e) => { window.open(this.state.eventData.xdaInstance + '/Workbench/Event.cshtml?EventID=' + this.props.eventID) }}>Edit</button></td><td>{(userIsAdmin ? <OpenSEENoteModal eventId={this.props.eventID} /> : null)}</td></tr>
                                    </tbody>
                                </table> :
                            null}
                        </div>
                        <div className={"tab-pane fade" + (this.props.Tab == "Compare" ? " show active" : '')} id="compare" role="tabpanel" aria-labelledby="profile-tab">
                            <OverlappingEventWindow />
                        </div>
                        <div className={"tab-pane fade" + (this.props.Tab == "Analytic" ? " show active" : '')} id="analysis" role="tabpanel" aria-labelledby="contact-tab">
                            <AnalyticOptions />
                        </div>
                    </div>
                    <div style={{width: '100%', textAlign: 'center', position: 'absolute', bottom: 20}}>
                        <span>Version {version}</span>
                        <br/>
                        <span><About/></span>
                    </div>
                </div> 
                */}

                    <VerticalSplit>
                        <SplitDrawer Open={false} Width={25} Title={"Info"} MinWidth={20} MaxWidth={30}>
                                {this.state.eventData != undefined ?
                                    <table className="table">
                                        <tbody style={{ display: 'block' }}>
                                            <tr><td>Meter:</td><td>{this.state.eventData.MeterName}</td></tr>
                                            <tr><td>Station:</td><td>{this.state.eventData.StationName}</td></tr>
                                            <tr><td>Asset:</td><td>{this.state.eventData.AssetName}</td></tr>
                                            <tr><td>Event Type:</td><td>{(this.state.eventData.EventName != 'Fault' ? this.state.eventData.EventName : <a href="#" title="Click for fault details" onClick={() => window.open("./FaultSpecifics.aspx?eventid=" + this.props.eventID, this.props.eventID + "FaultLocation", "left=0,top=0,width=350,height=300,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no")}>Fault</a>)}</td></tr>
                                            <tr><td>Event Date:</td><td>{this.state.eventData.EventDate}</td></tr>
                                            {(this.state.eventData.StartTime != undefined ? <tr><td>Event Start:</td><td>{this.state.eventData.StartTime}</td></tr> : null)}
                                            {(this.state.eventData.Phase != undefined ? <tr><td>Phase:</td><td>{this.state.eventData.Phase}</td></tr> : null)}
                                            {(this.state.eventData.DurationPeriod != undefined ? <tr><td>Duration:</td><td>{this.state.eventData.DurationPeriod}</td></tr> : null)}
                                            {(this.state.eventData.Magnitude != undefined ? <tr><td>Magnitude:</td><td>{this.state.eventData.Magnitude}</td></tr> : null)}
                                            {(this.state.eventData.SagDepth != undefined ? <tr><td>Sag Depth:</td><td>{this.state.eventData.SagDepth}</td></tr> : null)}
                                            {(this.state.eventData.BreakerNumber != undefined ? <tr><td>Breaker:</td><td>{this.state.eventData.BreakerNumber}</td></tr> : null)}
                                            {(this.state.eventData.BreakerTiming != undefined ? <tr><td>Timing:</td><td>{this.state.eventData.BreakerTiming}</td></tr> : null)}
                                            {(this.state.eventData.BreakerSpeed != undefined ? <tr><td>Speed:</td><td>{this.state.eventData.BreakerSpeed}</td></tr> : null)}
                                            {(this.state.eventData.BreakerOperation != undefined ? <tr><td>Operation:</td><td>{this.state.eventData.BreakerOperation}</td></tr> : null)}
                                            <tr><td><button className="btn btn-link" onClick={(e) => { window.open(this.state.eventData.xdaInstance + '/Workbench/Event.cshtml?EventID=' + this.props.eventID) }}>Edit</button></td><td>{(userIsAdmin ? <OpenSEENoteModal eventId={this.props.eventID} /> : null)}</td></tr>
                                        </tbody>
                                    </table> :
                                null}
                        </SplitDrawer>
                        <SplitDrawer Open={false} Width={25} Title={"Compare"} MinWidth={20} MaxWidth={30}>
                            <OverlappingEventWindow />
                        </SplitDrawer>
                        <SplitDrawer Open={false} Width={25} Title={"Analytics"} MinWidth={20} MaxWidth={30}>
                            <AnalyticOptions />
                        </SplitDrawer>
                        <SplitDrawer Open={false} Width={25} Title={"Tooltip"} MinWidth={20} MaxWidth={30}>
                            <p>Hello Tooltip</p>
                        </SplitDrawer>
                        <SplitDrawer Open={false} Width={25} Title={"Tooltip w/ Delta"} MinWidth={20} MaxWidth={30}>
                            <p>Hello Tooltip w/ Delta</p>
                        </SplitDrawer>
                        <SplitSection MinWidth={100} MaxWidth={100} Width={100 }>
                        {plotData[this.props.eventID] != undefined ?
                        <div className="card" style={{ borderLeft: 0, borderRight: 0 }}>
                            <div className="card-body" style={{ padding: '25px' }}>
                                    {plotData[this.props.eventID].sort(this.sortGraph).map((item, idx) => (item.DataType == 'FFT' ?
                                        <BarChart
                                            eventId={item.EventId}
                                            width={this.state.graphWidth}
                                            eventStartTime={new Date(this.state.eventStartTime + "Z").getTime()}
                                            height={this.calculateHeights()}
                                            timeLabel={"Harmonic"}
                                            type={item.DataType}
                                        /> : <LineChart
                                            key={idx}
                                        eventId={item.EventId}
                                        width={this.state.graphWidth}
                                        eventStartTime={new Date(this.state.eventStartTime + "Z").getTime()}
                                        height={this.calculateHeights()}
                                        timeLabel={"Time"}
                                        type={item.DataType}
                                    />))}
                                </div>
                            </div> : null }

                        {Object.keys(plotData).filter(item => parseInt(item) != this.props.eventID).map(key => <div className="card" style={{ borderLeft: 0, borderRight: 0 }}>
                                <div className="card-header">{
                                    (this.props.eventGroup.find(item => item.value == parseInt(key)) != undefined ? this.props.eventGroup.find(item => item.value == parseInt(key)).label : '')
                                }</div>
                                <div className="card-body" style={{ padding: 0 }}>
                                {plotData[key].sort(this.sortGraph).map(item => < LineChart
                                        eventId={item.EventId}
                                        width={this.state.graphWidth}
                                        eventStartTime={new Date(this.state.eventStartTime + "Z").getTime()}
                                        height={this.calculateHeights()}
                                        timeLabel={"Time"}
                                        type={item.DataType}
                                    />) }
                                </div>
                                </div>)
                                    }
                        </SplitSection>
                    </VerticalSplit>
            </Page>
        </Application>
        );
    }

    calculateHeights() {
        // Fit up to 3 onto the page after that we will add scrollBars
        let nPlots = Number(this.props.displayVolt) + Number(this.props.displayCur) + Number(this.props.displayDigitals) + Number(this.props.displayTCE) + Number(this.props.displayAnalogs);

        if (this.props.Tab == "Analytic")
            nPlots = nPlots + 1;
        else if (this.props.Tab == "Compare")
            nPlots = nPlots * (this.props.numberCompareGraphs + 1);

        return (window.innerHeight - 100 - 30) / Math.min(nPlots, 3);
    }

    toggleVoltage() {
        if (this.props.displayVolt)
            store.dispatch(RemovePlot({ DataType: "Voltage", EventId: this.props.eventID }))
        else
            store.dispatch(AddPlot({ DataType: "Voltage", EventId: this.props.eventID }))
        store.dispatch(SetdisplayVolt( !this.props.displayVolt));
    }

    toggleCurrent() {
        if (this.props.displayCur)
            store.dispatch(RemovePlot({ DataType: "Current", EventId: this.props.eventID }))
        else
            store.dispatch(AddPlot({ DataType: "Current", EventId: this.props.eventID }))
        store.dispatch(SetdisplayCur( !this.props.displayCur ));
    }

    toggleAnalogs() {
        if (this.props.displayAnalogs)
            store.dispatch(RemovePlot({ DataType: 'Analogs', EventId: this.props.eventID}))
        else
            store.dispatch(AddPlot({ DataType: "Analogs", EventId: this.props.eventID }))
        store.dispatch(SetdisplayAnalogs( !this.props.displayAnalogs ));
    }

    toggleDigitals() {
        if (this.props.displayDigitals)
            store.dispatch(RemovePlot({ DataType: 'Digitals', EventId: this.props.eventID }))
        else
            store.dispatch(AddPlot({ DataType: "Digitals", EventId: this.props.eventID }))
        store.dispatch(SetdisplayDigitals( !this.props.displayDigitals))
    }

    toggleTCE() {
        if (this.props.displayTCE)
            store.dispatch(RemovePlot({ DataType: 'TripCoil', EventId: this.props.eventID }))
        else
            store.dispatch(AddPlot({ DataType: "TripCoil", EventId: this.props.eventID }))
        store.dispatch(SetdisplayTCE( !this.props.displayTCE ));
    }
    

}


const mapStatesToProps = function (state: OpenSee.IRootState) {
    return {
        eventID: state.Data.eventID,
        url: "",
        graphList: selectListGraphs(state),
        loadVolt: selectLoadVoltages(state),
        loadCurr: selectLoadCurrents(state),
        loadAnalog: selectLoadAnalogs(state),
        loadDigital: selectLoadDigitals(state),
        loadTCE: selectLoadTCE(state),
        numberCompareGraphs: selectNumberCompare(state),
        eventGroup: selecteventList(state),
        displayVolt: SelectdisplayVolt(state),
        displayCur: SelectdisplayCur(state),
        displayTCE: SelectdisplayTCE(state),
        displayDigitals: SelectdisplayDigitals(state),
        displayAnalogs: SelectdisplayAnalogs(state),
        querystring: SelectQueryString(state),
        Tab: SelectTab(state),
        Navigation: SelectNavigation(state),
        analytic: selectAnalytic(state)
    }
}

export const OpenSEE = connect(mapStatesToProps)(OpenSEEHome)


store.dispatch(LoadSettings());
ReactDOM.render(<Provider store={store}><OpenSEE /></Provider>, document.getElementById('DockCharts'));

