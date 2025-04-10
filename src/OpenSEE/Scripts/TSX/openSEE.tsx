﻿//******************************************************************************************************
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
// # Fix Dowload.ash to include Analytics
//

import { Application, SplitDrawer, SplitSection, VerticalSplit } from '@gpa-gemstone/react-interactive';
import moment from 'moment'
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import createHistory from "history/createBrowserHistory"

import * as queryString from "query-string";
import * as _ from "lodash";

import AnalyticOptions from './Components/AnalyticOptions';
import LineChart from './Graphs/LineChartBase';
import OpenSeeNavBar from './Components/OpenSEENavbar';

import store from './store/store';
import { sortGraph } from './Graphs/Utilities'
import { OpenSee } from './global';

import { LoadSettings, SelectQueryString, SelectMouseMode, SetMouseMode, SelectSinglePlot } from './store/settingSlice';
import { SelectCycles, UpdateAnalytic, SelectAnalytics } from './store/analyticSlice';
import { SetTimeLimit, SelectDisplayed, SelectFFTLimits, SelectListGraphs, SelectPlotKeys } from './store/dataSlice';
import { LoadEventInfo, SetEventID, SelectEventInfo, LoadLookupInfo } from './store/eventInfoSlice'
import { LoadOverlappingEvents, SelectEventList } from './store/overlappingEventsSlice';

import OverlappingEventWindow from './Components/OverlappingEvents';
import BarChart from './Graphs/BarChartBase';
import { updatedURL } from './store/queryThunk';
import { useAppDispatch, useAppSelector } from './hooks';

import SettingsWidget from './jQueryUI Widgets/SettingWindow';
import PointWidget from './jQueryUI Widgets/AccumulatedPoints';
import PhasorChartWidget from './jQueryUI Widgets/PhasorChart';
import ToolTipWidget from './jQueryUI Widgets/Tooltip';
import ToolTipDeltaWidget from './jQueryUI Widgets/TooltipWithDelta';
import ScalarStatsWidget from './jQueryUI Widgets/ScalarStats';
import TimeCorrelatedSagsWidget from './jQueryUI Widgets/TimeCorrelatedSags';
import LightningDataWidget from './jQueryUI Widgets/LightningData';
import FFTTable from './jQueryUI Widgets/FFTTable';
import EventInfo from './jQueryUI Widgets/EventInfo';
import HarmonicStatsWidget from './jQueryUI Widgets/HarmonicStats'

import HoverProvider from './Context/HoverProvider'

declare var homePath: string;
declare var version: string;
declare var eventID: number;

const OpenSeeHome = () => {
    const applicationRef = React.useRef(null);
    const plotRef = React.useRef<HTMLDivElement>(null);
    const history = React.useRef<object>(createHistory());
    const dispatch = useAppDispatch();
    const overlayHandles = React.useRef<OpenSee.IOverlayHandlers>({
        Settings: () => { },
        AccumulatedPoints: () => { },
        PolarChart: () => { },
        ScalarStats: () => { },
        CorrelatedSags: () => { },
        Lightning: () => { },
        FFTTable: () => { },
        HarmonicStats: () => { },
    });

    const [openDrawers, setOpenDrawers] = React.useState<OpenSee.Drawers>({
        Settings: false,
        AccumulatedPoints: false,
        PolarChart: false,
        ScalarStats: false,
        CorrelatedSags: false,
        Lightning: false,
        FFTTable: false,
        Info: false,
        Compare: false,
        Analytics: false,
        ToolTip: false,
        ToolTipDelta: false,
        HarmonicStats: false
    })

    const [resizeCount, setResizeCount] = React.useState<number>(0);
    const [plotWidth, setPlotWidth] = React.useState<number>(window.innerWidth - 300);

    const mouseMode = useAppSelector(SelectMouseMode);

    const eventInfo = useAppSelector(SelectEventInfo);

    const groupedKeys = useAppSelector(SelectListGraphs);
    const plotKeys = useAppSelector(SelectPlotKeys);
    const singlePlot = useAppSelector(SelectSinglePlot);

    const eventList = useAppSelector(SelectEventList);

    const showPlots = useAppSelector(SelectDisplayed);
    const cycles = useAppSelector(SelectCycles);
    const analytics = useAppSelector(SelectAnalytics);

    const fftTime = useAppSelector(SelectFFTLimits);
    const query = useAppSelector(SelectQueryString);

    const [plotHeight, setPlotHeight] = React.useState<number>(250);
    const [navWidth, setNavWidth] = React.useState<number>(100);

    React.useLayoutEffect(() => {
        const timeoutId = setTimeout(() => {
            if (applicationRef.current) {
                const newHeight = ((window.innerHeight - applicationRef.current?.navBarDiv?.offsetHeight) / Math.min(plotKeys.length, 3))
                const newWidth = plotRef.current ? plotRef.current.offsetWidth : 0
                const newNavBarWidth = applicationRef.current?.navBarDiv?.offsetWidth
                if (newHeight !== plotHeight && !isNaN(newHeight) && isFinite(newHeight))
                    setPlotHeight(newHeight)

                if (newWidth !== plotWidth && !isNaN(newWidth) && isFinite(newWidth))
                    setPlotWidth(newWidth);

                if (navWidth !== newNavBarWidth && !isNaN(newNavBarWidth) && isFinite(newNavBarWidth))
                    setNavWidth(newNavBarWidth)
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [plotKeys, openDrawers, resizeCount])


    //Effect to handle queryParams
    React.useEffect(() => {
        const query = queryString.parse(history.current['location'].search);

        const evStart = query['eventStartTime'] != undefined ? query['eventStartTime'] : eventStartTime;
        const evEnd = query['eventEndTime'] != undefined ? query['eventEndTime'] : eventEndTime;

        const startTime = (query['startTime'] != undefined ? parseInt(query['startTime']) : new Date(evStart + "Z").getTime());
        const endTime = (query['endTime'] != undefined ? parseInt(query['endTime']) : new Date(evEnd + "Z").getTime());

        dispatch(LoadEventInfo({ breakeroperation: ""/*not really sure what breakeroperation is..*/ }))
        dispatch(SetEventID(eventID))
        dispatch(SetTimeLimit({ start: startTime, end: endTime }));
        dispatch(UpdateAnalytic({ settings: { ...analytics, FFTStartTime: startTime } }));

        dispatch(updatedURL({ query: history.current['location'].search, initial: true }));

        history.current['listen'](location => {
            // If Query changed then we update states....
            // Note that enabled and selected states that depend on loading state are not dealt with in here
            dispatch(updatedURL({ query: location.search, initial: false }));
        });

    }, []);

    //Effect to push updatedQueryParams
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            history.current['push'](`?${query}`);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [query]);

    React.useEffect(() => {
        window.addEventListener("resize", () => {
            setResizeCount(x => x + 1)
        });
        return () => { $(window).off('resize'); }
    }, [])

    //Effect to update EventID
    React.useEffect(() => {
        if (eventID && !isNaN(eventID) && eventID !== 0) {
            dispatch(SetEventID(eventID))
            dispatch(LoadEventInfo({ breakeroperation: "" }))
            dispatch(LoadLookupInfo())
            dispatch(LoadOverlappingEvents())
        }
    }, [eventID]);

    React.useEffect(() => {
        if (openDrawers.ToolTipDelta) {
            let oldMode = _.clone(mouseMode);
            dispatch(SetMouseMode('select'))
            return () => { dispatch(SetMouseMode(oldMode)) }
        }
    }, [openDrawers.ToolTipDelta])

    const ToggleDrawer = (drawer: OpenSee.OverlayDrawers, open: boolean) => {
        overlayHandles.current[drawer](open);
    };

    const handleDrawerChange = (drawerName: keyof OpenSee.Drawers, isOpen: boolean) => {
        setOpenDrawers(prevStates => ({ ...prevStates, [drawerName]: isOpen }));
    };

    function exportData(type) {
        window.open(homePath + `CSVDownload.ashx?type=${type}&eventID=${eventID}` +
            `${showPlots.Voltage != undefined ? `&displayVolt=${showPlots.Voltage}` : ``}` +
            `${showPlots.Current != undefined ? `&displayCur=${showPlots.Current}` : ``}` +
            `${showPlots.TripCoil != undefined ? `&displayTCE=${showPlots.TripCoil}` : ``}` +
            `${showPlots.Digitals != undefined ? `&breakerdigitals=${showPlots.Digitals}` : ``}` +
            `${showPlots.Analogs != undefined ? `&displayAnalogs=${showPlots.Analogs}` : ``}` +
            `${type == 'fft' ? `&startDate=${fftTime[0]}` : ``}` +
            `${type == 'fft' ? `&cycles=${cycles}` : ``}` +
            `&Meter=${eventInfo.MeterName}` +
            `&EventType=${eventInfo.MeterName}`
        );
    }

    return (
        <Application
            HomePath={""}
            DefaultPath={""}
            HideSideBar={true}
            Version={version}
            Logo={`${homePath}Images/openSEE.jpg`}
            NavBarContent={<OpenSeeNavBar ToggleDrawer={ToggleDrawer} OpenDrawers={openDrawers} Width={navWidth} />}
            UseLegacyNavigation={true}
            ref={applicationRef}
        > <HoverProvider>
                <VerticalSplit style={{ height: '100%' }}>
                    <SplitDrawer Open={false} Width={25} Title={"Info"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("Info", item)}>
                        <EventInfo />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Compare"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("Compare", item)}>
                        <OverlappingEventWindow />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Analytics"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("Analytics", item)}>
                        <AnalyticOptions />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Tooltip"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("ToolTip", item)}>
                        <ToolTipWidget />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Tooltip w/ Delta"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("ToolTipDelta", item)}  >
                        <ToolTipDeltaWidget />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Settings"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.Settings = func; }} ShowClosed={false}
                        OnChange={(item) => handleDrawerChange("Settings", item)} >
                        <SettingsWidget />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Accumulated Points"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.AccumulatedPoints = func; }} ShowClosed={false}
                        OnChange={(item) => handleDrawerChange("AccumulatedPoints", item)}>
                        <PointWidget />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Scalar Stats"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.ScalarStats = func; }} ShowClosed={false}
                        OnChange={(item) => handleDrawerChange("ScalarStats", item)}>
                        <ScalarStatsWidget exportCallback={() => exportData('stats')} />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Correlated Sags"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.CorrelatedSags = func; }} ShowClosed={false}
                        OnChange={(item) => handleDrawerChange("CorrelatedSags", item)}>
                        <TimeCorrelatedSagsWidget exportCallback={() => exportData('correlatedsags')} />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Lightning"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.Lightning = func; }} ShowClosed={false}
                        OnChange={(item) => handleDrawerChange("Lightning", item)}>
                        <LightningDataWidget />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"FFT Table"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.FFTTable = func; }} ShowClosed={false}
                        OnChange={(item) => handleDrawerChange("FFTTable", item)}>
                        <FFTTable />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Phasor Chart"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.PolarChart = func; }} ShowClosed={false}
                        OnChange={(item) => handleDrawerChange("PolarChart", item)}>
                        <PhasorChartWidget />
                    </SplitDrawer>

                    <SplitDrawer Open={false} Width={25} Title={"Harmonic Stats"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.HarmonicStats = func; }} ShowClosed={false}
                        OnChange={(item) => handleDrawerChange("HarmonicStats", item)}>
                        <HarmonicStatsWidget exportCallback={() => exportData('harmonics')} />
                    </SplitDrawer>

                    <SplitSection MinWidth={70} MaxWidth={100} Width={100}>
                        <div ref={plotRef} style={{ overflowY: 'auto', width: '100%', height: '100%' }}>
                            {groupedKeys[eventID] != undefined ? (
                                <>
                                    {groupedKeys[eventID].filter(item => item.DataType !== 'FFT').sort(sortGraph).map(item => (
                                        <LineChart
                                            key={item.DataType + item.EventId}
                                            width={plotWidth}
                                            height={plotHeight}
                                            showToolTip={openDrawers.ToolTipDelta}
                                            dataKey={{ DataType: item.DataType, EventId: item.EventId }}
                                        />
                                    ))}

                                    {groupedKeys[eventID].filter(item => item.DataType === 'FFT').sort(sortGraph).map(item => (
                                        <BarChart
                                            key={item.DataType + item.EventId}
                                            width={plotWidth}
                                            height={plotHeight}
                                            dataKey={{ DataType: item.DataType, EventId: item.EventId }}
                                        />
                                    ))}
                                </>
                            ) : null}

                            {Object.keys(groupedKeys).filter(item => parseInt(item) !== eventID).map(key =>
                                <div className="card" key={key}>
                                    {eventList.find(item => item.EventID === parseInt(key)) ? (
                                        <div className="card-header">
                                            <div className="row">
                                                <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                    <span style={{ textAlign: 'center' }}>Meter:</span><br />
                                                    {eventList.find(item => item.EventID === parseInt(key)).MeterName}
                                                </div>
                                                <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                    <span style={{ textAlign: 'center' }}>Asset:</span><br />
                                                    {eventList.find(item => item.EventID === parseInt(key)).AssetName}
                                                </div>
                                                <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                    <span style={{ textAlign: 'center' }}>Type:</span><br />
                                                    {eventList.find(item => item.EventID === parseInt(key)).EventType}
                                                </div>
                                                <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                    <span style={{ textAlign: 'center' }}>Inception:</span><br />
                                                    {moment(eventList.find(item => item.EventID === parseInt(key)).Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                    <div className="card-body" style={{ padding: 0 }}>
                                        {groupedKeys[key].filter(item => item.DataType !== 'FFT').sort(sortGraph).map(item => (
                                            <LineChart
                                                key={item.DataType + item.EventId}
                                                width={plotWidth}
                                                height={plotHeight}
                                                showToolTip={openDrawers.ToolTipDelta}
                                                dataKey={{ DataType: item.DataType, EventId: item.EventId }}
                                            />
                                        ))}

                                        {groupedKeys[key].filter(item => item.DataType === 'FFT').sort(sortGraph).map(item => (
                                            <BarChart
                                                key={item.DataType + item.EventId}
                                                width={plotWidth}
                                                height={plotHeight}
                                                dataKey={{ DataType: item.DataType, EventId: item.EventId }}
                                            />
                                        ))}

                                    </div>
                                </div>
                            )}

                        </div>
                    </SplitSection>
                </VerticalSplit>
            </HoverProvider>
        </Application>);
}

//Load Settings for settings Slice
store.dispatch(LoadSettings());

// After
const container = document.getElementById('DockCharts');
const root = ReactDOM.createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<Provider store={store}><OpenSeeHome /></Provider>);

