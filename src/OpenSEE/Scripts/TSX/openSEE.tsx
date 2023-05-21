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
import SettingsWidget from  './jQueryUI Widgets/SettingWindow';
import { useAppDispatch, useAppSelector } from './hooks';


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

 
const OpenSee = () => {
    const history = React.useRef<object>(createHistory());
    const dispatch = useAppDispatch();
    const overlayHandles = React.useRef<OpenSee.IOverlayHandlers>({
        Settings: () => { }
    });

    const [eventStartTime, setEventStartTime] = React.useState<string>("");  
    const [eventEndTime, setEventEndTime] = React.useState<string>("");
    const [resizeCount, setResizeCount] = React.useState<number>(0);
    const [graphWidth, setGraphWidth] = React.useState<number>(window.innerWidth - 300);
    const [eventData, setEventData] = React.useState<OpenSee.iPostedData>(null);
    const [lookup, setLookup] = React.useState<OpenSee.iNextBackLookup>(null);

    // not sure what this is used for
    const [breakeroperation, setBreakeroperation] = React.useState<string>("");

    const eventID = useAppSelector(state => state.Data.eventID);
    const graphList = useAppSelector(selectListGraphs);
    const numberCompareGraphs = useAppSelector(selectNumberCompare);
    const eventGroup = useAppSelector(selecteventList);
    const displayVolt = useAppSelector(SelectdisplayVolt);
    const displayCur = useAppSelector(SelectdisplayCur);
    const displayTCE = useAppSelector(SelectdisplayTCE);
    const displayDigitals = useAppSelector(SelectdisplayDigitals);
    const displayAnalogs = useAppSelector(SelectdisplayAnalogs);
    const Tab = useAppSelector(SelectTab);
    const analytic = useAppSelector(selectAnalytic);

    React.useEffect(() => {

        const query = queryString.parse(history.current['location'].search);
        const evStart = query['eventStartTime'] != undefined ? query['eventStartTime'] : eventStartTime;
        const evEnd = query['eventEndTime'] != undefined ? query['eventEndTime'] : eventEndTime;
        setEventStartTime(evStart);
        setEventEndTime(evEnd);

        const startTime = (query['startTime'] != undefined ? parseInt(query['startTime']) : new Date(evStart + "Z").getTime());
        const endTime = (query['endTime'] != undefined ? parseInt(query['endTime']) : new Date(evEnd + "Z").getTime());

        dispatch(SetTimeLimit({ start: startTime, end: endTime }));

        dispatch(updatedURL({ query: history.current['location'].search, initial: true }));

        history.current['listen']((location, action) => {
            // If Query changed then we update states....
            // Note that enabled and selected states that depend on loading state are not dealt with in here
            dispatch(updatedURL({ query: location.search, initial: false }));
        });
    }, []);


    React.useEffect(() => {
        window.addEventListener("resize", () => { setResizeCount(x => x + 1) });

        dispatch(LoadOverlappingEvents())
        getEventData();

        return () => { $(window).off('resize'); }
    }, [])

    React.useEffect(() => {
        if (resizeCount == 0)
            return;

        const handle = setTimeout(() => {
            setGraphWidth(window.innerWidth - 300);
        }, 500);
        return () => { clearTimeout(handle); }
     }, [resizeCount]);

    React.useEffect(() => {
        const [handle1, handle2] = getEventData();

        return () => {
            if (handle1 != null && handle1.abort != null) handle1.abort();
            if (handle2 != null && handle2.abort != null) handle2.abort();
        }
    }, [eventID])

    React.useEffect(() => {
        if (Tab == 'Analytic' && analytic == 'none')
            dispatch(SetAnalytic('FirstDerivative'));

        if (Tab == 'Analytic')
            return () => { dispatch(SetAnalytic('none')); };

        if (Tab == 'Compare')
            return () => { dispatch(ClearOverlappingEvent()); };
    }, [Tab]);

    function getEventData() {

      const eventDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHeaderData?eventId=${eventID}` +
                `${breakeroperation != undefined ? `&breakeroperation=${breakeroperation}` : ``}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        dispatch(setEventInfo({ eventID: eventID, breakeroperation: breakeroperation }))

        eventDataHandle.then(data => {
            setEventData(data);
            dispatch(SetFFTWindow({ cycle: 1, startTime: new Date(eventStartTime + "Z").getTime() }))
        });

         const navigationDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetNavData?eventId=${eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        navigationDataHandle.then(data => {
            setLookup(data);
        });

        return [eventDataHandle, navigationDataHandle];
    }

    function sortGraph(item1: OpenSee.IGraphProps, item2: OpenSee.IGraphProps): number {
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

    function ToogleDrawer(drawer: OpenSee.OverlayDrawers, open: boolean) {
        if (drawer == 'Settings')
            overlayHandles.current.Settings(open);
    }


    const NPlots = React.useMemo(() => {
        let n = Number(displayVolt) + Number(displayCur) + Number(displayDigitals) + Number(displayTCE) + Number(displayAnalogs);
        if (Tab == "Analytic")
            n = n + 1;
        else if (Tab == "Compare")
            n = n * (numberCompareGraphs + 1);
        return n;
    }, [displayVolt, displayCur, displayDigitals, displayTCE, displayAnalogs, Tab, numberCompareGraphs ]);

    const GraphHeight = (window.innerHeight - 100 - 30) / Math.min(NPlots, 3);

    const plotData = React.useMemo(() => groupBy(graphList, "EventId"), [graphList]);

    const evtStartTime = new Date(eventStartTime + 'Z');

    return (
        <Application HomePath={"/"}
            DefaultPath=""
            HideSideBar={true}
            Version={version}
            Logo={`${homePath}Images/openSEE.jpg`}
            NavBarContent={<OpenSeeNavBar
                EventData={eventData}
                Lookup={lookup}
                ToggleDrawer={ToogleDrawer}
            />}
            UseLegacyNavigation={true}
        ><div style={{ position: 'relative', height: 'calc(100% - 40px)', width: '100%' }}>
                <div style={{ position: 'relative', top: '31px' }}>
                    <VerticalSplit>
                        <SplitDrawer Open={false} Width={25} Title={"Info"} MinWidth={20} MaxWidth={30}>
                            {eventData != undefined ?
                                <table className="table" style={{ width: '100%', tableLayout: 'fixed', fontSize: `calc(${(window.innerWidth / 100) * 1}px)` }}>
                                    <tbody style={{ display: 'block' }}>
                                        <tr><td style={{ width: '100%' }}>Meter:</td><td>{eventData.MeterName}</td></tr>
                                        <tr><td>Station:</td><td>{eventData.StationName}</td></tr>
                                        <tr><td>Asset:</td><td>{eventData.AssetName}</td></tr>
                                        <tr><td>Event Type:</td><td>{(eventData.EventName != 'Fault' ? eventData.EventName : <a href="#"
                                            title="Click for fault details" onClick={() => window.open("./FaultSpecifics.aspx?eventid=" + eventID, eventID +
                                                "FaultLocation", "left=0,top=0,width=350,height=300,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no")}
                                        >Fault</a>)}</td></tr>
                                        <tr><td>Event Date:</td><td>{eventData.EventDate}</td></tr>
                                        {(eventData.StartTime != undefined ? <tr><td>Event Start:</td><td>{eventData.StartTime}</td></tr> : null)}
                                        {(eventData.Phase != undefined ? <tr><td>Phase:</td><td>{eventData.Phase}</td></tr> : null)}
                                        {(eventData.DurationPeriod != undefined ? <tr><td>Duration:</td><td>{eventData.DurationPeriod}</td></tr> : null)}
                                        {(eventData.Magnitude != undefined ? <tr><td>Magnitude:</td><td>{eventData.Magnitude}</td></tr> : null)}
                                        {(eventData.SagDepth != undefined ? <tr><td>Sag Depth:</td><td>{eventData.SagDepth}</td></tr> : null)}
                                        {(eventData.BreakerNumber != undefined ? <tr><td>Breaker:</td><td>{eventData.BreakerNumber}</td></tr> : null)}
                                        {(eventData.BreakerTiming != undefined ? <tr><td>Timing:</td><td>{eventData.BreakerTiming}</td></tr> : null)}
                                        {(eventData.BreakerSpeed != undefined ? <tr><td>Speed:</td><td>{eventData.BreakerSpeed}</td></tr> : null)}
                                        {(eventData.BreakerOperation != undefined ? <tr><td>Operation:</td><td>{eventData.BreakerOperation}</td></tr> : null)}
                                        <tr><td><button className="btn btn-link" onClick={(e) => { window.open(eventData.xdaInstance + '/Workbench/Event.cshtml?EventID='
                                        + eventID) }}>Edit</button></td>
                                            <td>{(userIsAdmin ? <OpenSEENoteModal eventId={eventID} /> : null)}</td></tr>
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
                        <SplitDrawer Open={false} Width={25} Title={"Settings"} MinWidth={20} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.Settings = func; }}>
                            <SettingsWidget />
                        </SplitDrawer>
                        <SplitSection MinWidth={100} MaxWidth={100} Width={100}>
                            {plotData[eventID] != undefined ?
                                <div className="card" style={{ borderLeft: 0, borderRight: 0 }}>
                                    <div className="card-body" style={{ padding: '25px' }}>
                                        {plotData[eventID].sort(sortGraph).map((item, idx) => (item.DataType == 'FFT' ?
                                            <BarChart
                                                eventId={item.EventId}
                                                width={graphWidth}
                                                eventStartTime={evtStartTime.getTime()}
                                                height={GraphHeight}
                                                timeLabel={"Harmonic"}
                                                type={item.DataType}
                                            /> : <LineChart
                                                key={idx}
                                                eventId={item.EventId}
                                                width={graphWidth}
                                                eventStartTime={evtStartTime.getTime()}
                                                height={GraphHeight}
                                                timeLabel={"Time"}
                                                type={item.DataType}
                                            />))}
                                    </div>
                                </div> : null}

                            {Object.keys(plotData).filter(item => parseInt(item) != eventID).map(key => <div className="card" style={{ borderLeft: 0, borderRight: 0 }}>
                                <div className="card-header">{
                                    (eventGroup.find(item => item.value == parseInt(key)) != undefined ? eventGroup.find(item => item.value == parseInt(key)).label : '')
                                }</div>
                                <div className="card-body" style={{ padding: 0 }}>
                                    {plotData[key].sort(sortGraph).map(item => < LineChart
                                        eventId={item.EventId}
                                        width={graphWidth}
                                        eventStartTime={evtStartTime.getTime()}
                                        height={GraphHeight}
                                        timeLabel={"Time"}
                                        type={item.DataType}
                                    />)}
                                </div>
                            </div>)
                            }
                        </SplitSection>
                    </VerticalSplit>
                </div>
            </div>
        </Application>);

}



store.dispatch(LoadSettings());
ReactDOM.render(<Provider store={store}><OpenSee /></Provider>, document.getElementById('DockCharts'));

