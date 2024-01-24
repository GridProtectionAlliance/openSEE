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
import { groupBy } from "lodash";
import OpenSEENoteModal from './Components/OpenSEENoteModal';
import AnalyticOptions from './Components/AnalyticOptions';
import LineChart from './Graphs/LineChartBase';
import OpenSeeNavBar from './Components/OpenSEENavbar';
import {
    LoadSettings, SelectdisplayAnalogs, SelectdisplayCur,
    SelectdisplayDigitals, SelectdisplayTCE, SelectdisplayVolt,
        SelectTab
} from './store/settingSlice';
import {
    SetTimeLimit, selectListGraphs,
    SetAnalytic, selectAnalytic
} from './store/dataSlice';
import { LoadOverlappingEvents, selectNumberCompare, ClearOverlappingEvent, selecteventList } from './store/eventSlice';
import { setEventInfo } from "./store/infoSlice"
import OverlappingEventWindow from './Components/MultiselectWindow';
import BarChart from './Graphs/BarChartBase';
import { SetFFTWindow } from './store/analyticSlice';
import { updatedURL } from './store/queryThunk';
import { Application, SplitDrawer, SplitSection, VerticalSplit } from '@gpa-gemstone/react-interactive';
import SettingsWidget from  './jQueryUI Widgets/SettingWindow';
import { useAppDispatch, useAppSelector } from './hooks';


declare var homePath: string;
declare var userIsAdmin: boolean;
declare var version: string;

const Plotorder: OpenSee.graphType[] = ['Voltage', 'Current', 'Analogs', 'Digitals', 'TripCoil'];
 
const OpenSeeHome = () => {
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
                            <SplitDrawer Open={false} Width={25} Title={"Info"} MinWidth={20} MaxWidth={30} OnChange={(item) => handleDrawerChange("Info", item)}>
                                <EventInfo />
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
                        <SplitDrawer Open={false} Width={25} Title={"Settings"} MinWidth={20} MaxWidth={30}
                            GetOverride={(func) => { overlayHandles.current.Settings = func; }}
                            ShowClosed={false}
                        >
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
                                                <div className="card-header">
                                                    <div className="row">
                                                        <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                            <span style={{ textAlign: 'center' }}>Meter:</span><br />
                                                            {eventList.find(item => item.EventID == parseInt(key)).MeterName}
                                                        </div>
                                                        <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                            <span style={{ textAlign: 'center' }}>Asset:</span><br />
                                                            {eventList.find(item => item.EventID == parseInt(key)).AssetName}
                                                        </div>
                                                        <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                            <span style={{ textAlign: 'center' }}>Type:</span><br />
                                                            {eventList.find(item => item.EventID == parseInt(key)).EventType}
                                                        </div>
                                                        <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                            <span style={{ textAlign: 'center' }}>Inception:</span><br />
                                                            {moment(eventList.find(item => item.EventID == parseInt(key)).StartTime).format('YYYY-MM-DD HH:mm:ss')}
                                                        </div>

                                                    </div>
                                    </div>
                                </div> : null}

                            {Object.keys(plotData).filter(item => parseInt(item) != eventID).map(key => <div className="card" style={{ borderLeft: 0, borderRight: 0 }}>
                                <div className="card-header">{
                                    (eventGroup.find(item => item.value == parseInt(key)) != undefined ? eventGroup.find(item => item.value == parseInt(key)).label : '')
                                }</div>
                                <div className="card-body" style={{ padding: 0 }}>
                                                {graphList[key].sort(sortGraph).map(item => (
                                                    item.DataType !== 'FFT' ?
                                                        <LineChart
                                                            key={item.DataType + item.EventId}
                                        eventId={item.EventId}
                                                            width={plotWidth}
                                        eventStartTime={evtStartTime.getTime()}
                                        height={GraphHeight}
                                        timeLabel={"Time"}
                                        type={item.DataType}
                                                            showToolTip={openDrawers.ToolTipDelta}
                                                        /> :
                                                        <BarChart
                                                            key={item.DataType + item.EventId}
                                                            eventId={item.EventId}
                                                            width={plotWidth}
                                                            eventStartTime={evtStartTime.getTime()}
                                                            height={GraphHeight}
                                                            timeLabel={"Harmonic"}
                                                            type={item.DataType}
                                                        />
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
ReactDOM.render(<Provider store={store}><OpenSeeHome /></Provider>, document.getElementById('DockCharts'));

