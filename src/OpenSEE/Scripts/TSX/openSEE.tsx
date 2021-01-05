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
import { LoadSettings, SelectdisplayAnalogs, SelectdisplayCur, SelectdisplayDigitals, SelectdisplayTCE, SelectdisplayVolt, SetdisplayAnalogs, SetdisplayCur, SetdisplayDigitals, SetdisplayTCE, SetdisplayVolt } from './store/settingSlice';
import { AddPlot, SetTimeLimit, RemovePlot, selectListGraphs, selectLoadVoltages, selectLoadCurrents, selectLoadAnalogs, selectLoadDigitals, selectLoadTCE, SetAnalytic } from './store/dataSlice';
import { LoadOverlappingEvents, selectNumberCompare, ClearOverlappingEvent, selecteventList } from './store/eventSlice';
import OverlappingEventWindow from './Components/MultiselectWindow';
import BarChart from './Graphs/BarChartBase';
import { SetFFTWindow } from './store/analyticSlice';


declare var homePath: string;
declare var userIsAdmin: boolean;
declare var userID: boolean;
declare var eventID: number;
declare var eventStartTime: string;
declare var eventEndTime: string;

declare const MOMENT_DATETIME_FORMAT = 'MM/DD/YYYYTHH:mm:ss.SSSSSSSS';

const queryStates = [
    'eventId',
    'displayVolt',
    'displayCur',
    'displayDigitals',
    'displayAnalogs',
    'eventEndTime',
    'eventStartTime',
    'tab',
    'startTime',
    'endTime',
    'zoomMode',
    'mouseMode',
    'navigation',

]

class OpenSEEHome extends React.Component<OpenSee.IOpenSeeProps, OpenSee.iOpenSeeState>{
    history: object;
    historyHandle: any;
    resizeHandle: any;

    overlappingEventHandle: JQuery.jqXHR;
    eventDataHandle: JQuery.jqXHR;


    constructor(props) {
        super(props);
        
        this.history = createHistory();

        let query = queryString.parse(this.history['location'].search);
        /* 
         *  //displayVolt: (query['displayVolt'] != undefined ? query['displayVolt'] == '1' || query['displayVolt'] == 'true' : true),
            //displayCur: (query['displayCur'] != undefined ? query['displayCur'] == '1' || query['displayCur'] == 'true' : true),
            //displayTCE: query['displayTCE'] == '1' || query['displayTCE'] == 'true',
            //displayDigitals: query['displayDigitals'] == '1' || query['displayDigitals'] == 'true',
            //displayAnalogs: query['displayAnalogs'] == '1' || query['displayAnalogs'] == 'true',
            */
        this.state = {
            
            eventStartTime: (query['eventStartTime'] != undefined ? query['eventStartTime'] : eventStartTime),
            eventEndTime: (query['eventEndTime'] != undefined ? query['eventEndTime'] : eventEndTime),
           
           
            tab: (query['tab'] != undefined ? query['tab'] : "Info"),


            comparedEvents: [],
            overlappingEvents: [],
           

            graphWidth: window.innerWidth - 300,
            eventData: null,
            lookup: null,
            navigation: (query['navigation'] != undefined ? query['navigation'] : "system"),
            breakeroperation: undefined,
        }


        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            let newState = {};
            queryStates.forEach(state => {
                if (query.hasOwnProperty(state) && !isEqual(this.state[state],query[state]))
                    newState[state] = query[state];
            })

            if (Object.keys(newState).length > 0)
                this.setState(newState);

            });
       
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));

        if (this.props.displayVolt)
            store.dispatch(AddPlot({ DataType: "Voltage", EventId: this.props.eventID }))
        if (this.props.displayCur)
            store.dispatch(AddPlot({ DataType: "Current", EventId: this.props.eventID }))
        if (this.props.displayAnalogs)
            store.dispatch(AddPlot({ DataType: "Analogs", EventId: this.props.eventID }))
        if (this.props.displayDigitals)
            store.dispatch(AddPlot({ DataType: "Digitals", EventId: this.props.eventID }))
        if (this.props.displayTCE)
            store.dispatch(AddPlot({ DataType: "TripCoil", EventId: this.props.eventID }))
        
        store.dispatch(SetTimeLimit({ start: new Date(this.state.eventStartTime + "Z").getTime(), end: new Date(this.state.eventEndTime + "Z").getTime() }));

        store.dispatch(LoadOverlappingEvents())
        this.getEventData();
    }

    getEventData() {
        if (this.eventDataHandle !== undefined)
            this.eventDataHandle.abort();

        this.eventDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHeaderData?eventId=${this.props.eventID}` +
                `${this.state.breakeroperation != undefined ? `&breakeroperation=${this.state.breakeroperation}` : ``}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        this.eventDataHandle.then(data => {
            this.setState({
                eventData: data,
                lookup: data.nextBackLookup
            });
            store.dispatch(SetFFTWindow({ cycle: 1, startTime: new Date(eventStartTime + "Z").getTime() }))

        });
    }

    componentDidUpdate(prevProps: OpenSee.IOpenSeeProps, oldstate: OpenSee.iOpenSeeState) {
        if (prevProps.eventID != this.props.eventID)
            this.getEventData();
        if (oldstate.tab != this.state.tab && oldstate.tab == 'Analytic')
            store.dispatch(SetAnalytic('none'));
        if (oldstate.tab != this.state.tab && this.state.tab == 'Analytic')
            store.dispatch(SetAnalytic('FirstDerivative'));
        if (oldstate.tab != this.state.tab && oldstate.tab == 'Compare')
            store.dispatch(ClearOverlappingEvent());
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

    render() {
        var height = this.calculateHeights();
        var windowHeight = window.innerHeight;

        let plotData = groupBy(this.props.graphList,"EventId");

        return (
            <div style={{ position: 'absolute', width: '100%', height: windowHeight, overflow: 'hidden' }}>
                {/* the navigation side bar*/}
                <div style={{ width: 300, height: windowHeight, backgroundColor: '#eeeeee', position: 'relative', float: 'left', overflow: 'hidden' }}>
                    <a href="https://www.gridprotectionalliance.org"><img style={{ width: 280, margin: 10 }} src={`${homePath}Images/2-Line - 500.png`}/></a>
                    <fieldset className="border" style={{ padding: '10px' }}>
                        <legend className="w-auto" style={{ fontSize: 'large' }}>Waveform Views:</legend>
                        <div className="form-check form-check-inline">
                            {this.props.loadVolt ? <span> <i className="fa fa-spinner"></i> </span> : <input className="form-check-input" type="checkbox" onChange={() => this.toggleVoltage()} checked={this.props.displayVolt} />}
                            <label className="form-check-label">Voltage</label>
                        </div>
                        <div className="form-check form-check-inline">
                            {this.props.loadCurr ? <span> <i className="fa fa-spinner"></i> </span> : <input className="form-check-input" type="checkbox" onChange={() => this.toggleCurrent()} checked={this.props.displayCur} />}
                            <label className="form-check-label">Current</label>
                        </div>
                        <div className="form-check form-check-inline">
                            {this.props.loadAnalog ? <span> <i className="fa fa-spinner"></i> </span> : <input className="form-check-input" type="checkbox" onChange={() => this.toggleAnalogs()} checked={this.props.displayAnalogs} />}
                            <label className="form-check-label">Analogs</label>
                        </div>
                        <div className="form-check form-check-inline">
                            {this.props.loadDigital ? <span> <i className="fa fa-spinner"></i> </span> : <input className="form-check-input" type="checkbox" onChange={() => this.toggleDigitals()} checked={this.props.displayDigitals} />}
                            <label className="form-check-label">Digitals</label>
                        </div>
                        <div className="form-check form-check-inline">
                            {this.props.loadTCE ? <span> <i className="fa fa-spinner"></i> </span> : < input className="form-check-input" type="checkbox" onChange={() => this.toggleTCE()} checked={this.props.displayTCE} />}
                            <label className="form-check-label">Trip Coil E.</label>
                        </div>
                    </fieldset>

                    <br />

                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Info" ?  " active" : '') } id="home-tab" data-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected="true" onClick={(obj: any) => this.stateSetter({ tab: "Info" })} >Info</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Compare" ? " active" : '')} id="profile-tab" data-toggle="tab" href="#compare" role="tab" aria-controls="compare" aria-selected="false" onClick={(obj: any) => this.stateSetter({ tab: "Compare" })} >Compare</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (this.state.tab == "Analytic" ? " active" : '')} id="contact-tab" data-toggle="tab" href="#analysis" role="tab" aria-controls="analysis" aria-selected="false" onClick={(obj: any) => this.stateSetter({ tab: "Analytic" })} >Analytics</a>
                        </li>
                    </ul>
                    <div className="tab-content" id="myTabContent" style={{ maxHeight: windowHeight - 325, display: 'block', overflowY: 'auto' }}>
                        <div className={"tab-pane fade" + (this.state.tab == "Info" ? " show active" : '')} id="info" role="tabpanel" aria-labelledby="home-tab">
                            {this.state.eventData != undefined ?
                                <table className="table">
                                    <tbody style={{ display: 'block' }}>
                                        <tr><td>Meter:</td><td>{this.state.eventData.MeterName}</td></tr>
                                        <tr><td>Station:</td><td>{this.state.eventData.StationName}</td></tr>
                                        <tr><td>Asset:</td><td>{this.state.eventData.AssetName}</td></tr>
                                        <tr><td>Event Type:</td><td>{(this.state.eventData.EventName != 'Fault' ? this.state.eventData.EventName : <a href="#" title="Click for fault details" onClick={() => window.open(homePath + "FaultSpecifics.aspx?eventid=" + this.props.eventID, this.props.eventID + "FaultLocation", "left=0,top=0,width=350,height=300,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no")}>Fault</a>)}</td></tr>
                                        <tr><td>Event Date:</td><td>{this.state.eventData.EventDate}</td></tr>
                                        {(this.state.eventData.StartTime != undefined ? <tr><td>Start Time:</td><td>{this.state.eventData.StartTime}</td></tr> : null)}
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
                        <div className={"tab-pane fade" + (this.state.tab == "Compare" ? " show active" : '')} id="compare" role="tabpanel" aria-labelledby="profile-tab">
                            <OverlappingEventWindow />
                        </div>
                        <div className={"tab-pane fade" + (this.state.tab == "Analytic" ? " show active" : '')} id="analysis" role="tabpanel" aria-labelledby="contact-tab">
                            <AnalyticOptions />
                        </div>
                    </div>
                    <div style={{width: '100%', textAlign: 'center', position: 'absolute', bottom: 20}}>
                        <span>Version 3.0</span>
                        <br/>
                        <span><About/></span>
                    </div>
                </div> 
                <div id="chartpanel" style={{ width: 'calc(100% - 300px)', height: 'inherit', position: 'relative', float: 'right', overflow: 'hidden' }}>
                    <OpenSeeNavBar
                        EventData={this.state.eventData} Lookup={this.state.lookup} 
                        navigation={this.state.navigation}
                        stateSetter={this.setState}
                        displayAnalogs={this.props.displayAnalogs}
                        displayCur={this.props.displayCur} displayDigitals={this.props.displayDigitals} displayTCE={this.props.displayTCE}
                        displayVolt={this.props.displayVolt} />

                    
                    <div style={{ padding: '0', height: "calc(100% - 62px)", overflowY: 'auto' }}>
                        {plotData[this.props.eventID] != undefined ?
                            <div className="card">
                                <div className="card-body" style={{ padding: 0 }}>
                                    {plotData[this.props.eventID].map(item => (item.DataType == 'FFT' ?
                                        <BarChart
                                            eventId={item.EventId}
                                            width={this.state.graphWidth}
                                            eventStartTime={new Date(this.state.eventStartTime + "Z").getTime()}
                                            height={this.calculateHeights()}
                                            timeLabel={"Harmonic"}
                                            type={item.DataType}
                                        />:<LineChart
                                        eventId={item.EventId}
                                        width={this.state.graphWidth}
                                        eventStartTime={new Date(this.state.eventStartTime + "Z").getTime()}
                                        height={this.calculateHeights()}
                                        timeLabel={"Time"}
                                        type={item.DataType}
                                    />))}
                                </div>
                            </div> : null }

                        {Object.keys(plotData).filter(item => parseInt(item) != this.props.eventID).map(key => <div className="card">
                                <div className="card-header">{
                                    (this.props.eventGroup.find(item => item.value == parseInt(key)) != undefined ? this.props.eventGroup.find(item => item.value == parseInt(key)).label : '')
                                }</div>
                                <div className="card-body" style={{ padding: 0 }}>
                                    {plotData[key].map(item => < LineChart
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
                        {/* FFT Analytic */}
                    </div>
                </div>
            </div>
        );
    }

    stateSetter(obj) {

        this.setState(obj, () => {
            let newQuery = {};

            let updateQuery = queryStates.some(state => obj.hasOwnProperty(state) && !isEqual(obj[state], this.state[state]))

            if (!updateQuery)
                return;

            queryStates.forEach(state => {
                newQuery[state] = this.state[state];
            });

            let newQueryString = queryString.stringify(newQuery, { encode: false });

            clearTimeout(this.historyHandle);
            this.historyHandle = setTimeout(() => this.history['push'](this.history['location'].pathname + '?' + newQueryString), 500);
            
        });
    }

    calculateHeights() {
        // Fit up to 3 onto the page after that we will add scrollBars
        let nPlots = Number(this.props.displayVolt) + Number(this.props.displayCur) + Number(this.props.displayDigitals) + Number(this.props.displayTCE) + Number(this.props.displayAnalogs);

        if (this.state.tab == "Analytic")
            nPlots = nPlots + 1;
        else if (this.state.tab == "Compare")
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
    }
}

export const OpenSEE = connect(mapStatesToProps)(OpenSEEHome)


store.dispatch(LoadSettings());
ReactDOM.render(<Provider store={store}><OpenSEE /></Provider>, document.getElementById('DockCharts'));

