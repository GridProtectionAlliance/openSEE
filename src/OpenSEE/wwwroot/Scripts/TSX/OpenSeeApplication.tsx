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
// # Fix Dowload.ash to include Analytics
//

import { Application, SplitDrawer, SplitSection, VerticalSplit, IApplicationRefs } from '@gpa-gemstone/react-interactive';
import createHistory from "history/createBrowserHistory";
import * as _ from "lodash";
import moment from 'moment';
import * as React from 'react';
import AnalyticOptions from './Components/AnalyticOptions';
import OverlappingEventWindow from './Components/OverlappingEvents';
import AnalyticContext from './Context/AnalyticContext';
import queryString from 'query-string';
import { EventContext } from './Context/EventContext';
import { PlotDataStateContext } from './Context/PlotDataContext';
import { PlotStateStateContext, PlotStateActionContext } from './Context/PlotStateContext';
import { OverlappingStateContext, OverlappingActionContext } from './Context/OverlappingContext';
import BarChart from './Graphs/BarChartBase';
import LineChart from './Graphs/LineChartBase';
import { sortGraph } from './Graphs/Utilities';
import OpenSeeNavBar from './Navbar/OpenSEENavbar';
import { OpenSee } from './global';
import { useAppDispatch, useAppSelector } from './hooks';
import { usePlotLifecycle } from './hooks/usePlotLifeCycle';
import { selectListGraphs, selectPlotKeys, selectDisplayed, selectEnabledPlots, selectFFTEnabled } from './PlotSelectors';
import PointWidget from './jQueryUI Widgets/AccumulatedPoints';
import EventInfo from './jQueryUI Widgets/EventInfo';
import FFTTable from './jQueryUI Widgets/FFTTable';
import HarmonicStatsWidget from './jQueryUI Widgets/HarmonicStats';
import LightningDataWidget from './jQueryUI Widgets/LightningData';
import PhasorChartWidget from './jQueryUI Widgets/PhasorChart';
import ScalarStatsWidget from './jQueryUI Widgets/ScalarStats';
import SettingsWidget from './jQueryUI Widgets/SettingWindow';
import TimeCorrelatedSagsWidget from './jQueryUI Widgets/TimeCorrelatedSags';
import ToolTipWidget from './jQueryUI Widgets/Tooltip';
import ToolTipDeltaWidget from './jQueryUI Widgets/TooltipWithDelta';
import { SelectMouseMode, SetMouseMode, SetSinglePlot, SelectSinglePlot } from './store/settingSlice';


const OpenSeeApplication = React.memo(() => {
    const dispatch = useAppDispatch();

    const history = React.useRef<object>(createHistory());
    const plotRef = React.useRef<HTMLDivElement>(null);
    const applicationRef = React.useRef<IApplicationRefs>(null);
    const overlayHandles = React.useRef<OpenSee.IOverlayHandlers>({
        Settings: () => { /* noop */ },
        AccumulatedPoints: () => { /* noop */ },
        PolarChart: () => { /* noop */ },
        ScalarStats: () => { /* noop */ },
        CorrelatedSags: () => { /* noop */ },
        Lightning: () => { /* noop */ },
        FFTTable: () => { /* noop */ },
        HarmonicStats: () => { /* noop */ },
    });

    const evt = React.useContext(EventContext);
    const { plots: plotData } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);
    const overlapping = React.useContext(OverlappingStateContext);
    const overlappingActions = React.useContext(OverlappingActionContext);
    const [analytic, setAnalytic] = React.useContext(AnalyticContext);

    const lifecycle = usePlotLifecycle();

    const mouseMode = useAppSelector(SelectMouseMode);
    const singlePlot = useAppSelector(SelectSinglePlot);

    // Refs for values read inside the history listener callback.
    // The listener is set up once on mount, so it would otherwise capture stale closures.
    const plotStateRef = React.useRef(plotState);
    const plotDataRef = React.useRef(plotData);
    const lifecycleRef = React.useRef(lifecycle);
    const stateActionsRef = React.useRef(stateActions);
    const analyticRef = React.useRef(analytic);
    plotStateRef.current = plotState;
    plotDataRef.current = plotData;
    lifecycleRef.current = lifecycle;
    stateActionsRef.current = stateActions;
    analyticRef.current = analytic;

    const groupedKeys = React.useMemo(() => selectListGraphs(plotState.meta, singlePlot), [plotState.meta, singlePlot]);
    const plotKeys = React.useMemo(() => selectPlotKeys(plotState.meta, singlePlot, sortGraph), [plotState.meta, singlePlot]);

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
    });
    const [resizeCount, setResizeCount] = React.useState<number>(0);
    const [plotWidth, setPlotWidth] = React.useState<number>(window.innerWidth - 300);
    const [plotHeight, setPlotHeight] = React.useState<number>(250);
    const [navWidth, setNavWidth] = React.useState<number>(100);

    // -- Coordination effects --

    // Analytic change tracking ref
    const oldAnalyticRef = React.useRef<{ [key: string]: number }>({});

    // Load overlapping events when eventID changes
    React.useEffect(() => {
        if (evt.Context.EventID > 0)
            overlappingActions.LoadOverlappingEvents(evt.Context.EventID);
    }, [evt.Context.EventID]);

    // Refresh analytic plots when analytic settings change
    React.useEffect(() => {
        if (evt.Context.EventID < 0) return;

        Object.keys(analytic).forEach(key => {
            if (oldAnalyticRef.current[key] != null && oldAnalyticRef.current[key] !== analytic[key]) {
                let graphType: OpenSee.graphType | undefined;
                switch (key) {
                    case 'FFTCycles':
                    case 'FFTStartTime': graphType = 'FFT'; break;
                    case 'LPFOrder': graphType = 'LowPassFilter'; break;
                    case 'HPFOrder': graphType = 'HighPassFilter'; break;
                    case 'Trc': graphType = 'Rectifier'; break;
                    case 'Harmonic': graphType = 'Harmonic'; break;
                    default:
                        console.warn(`Unrecognized analytic key: ${key}`);
                        break;
                }
                if (graphType != null) {
                    const eventIds = [evt.Context.EventID];
                    overlapping.events.forEach(e => { if (e.Selected) eventIds.push(e.EventID); });
                    eventIds.forEach(id => lifecycle.UpdateAnalyticPlot({ DataType: graphType!, EventId: id }));
                }
            }
            oldAnalyticRef.current[key] = analytic[key];
        });
    }, [analytic, evt.Context.EventID]);

    // Handle singlePlot toggle
    React.useEffect(() => {
        if (singlePlot) {
            Object.values(plotState.meta).forEach(m => {
                if (m.key.EventId === -1) return;
                const overlayKey: OpenSee.IGraphProps = { DataType: m.key.DataType, EventId: -1 };
                // TODO: wire up singlePlot overlay init through lifecycle
            });
        } else {
            Object.values(plotState.meta).forEach(m => {
                if (m.key.EventId !== -1) return;
                stateActions.RemovePlotMeta(m.key);
            });
        }
    }, [singlePlot]);

    const queryStr = React.useMemo(() => {
        const overlappingEvts: number[] = [];
        const enabledPlots = selectEnabledPlots(plotState.meta, plotData);

        if (overlapping.events.length > 0) {
            overlapping.events.forEach(e => {
                if (e.Selected) overlappingEvts.push(e.EventID);
            });
        }

        const plotBase64 = btoa(JSON.stringify(enabledPlots));
        const overlappingBase64 = btoa(JSON.stringify(overlappingEvts));

        const queryObj = {
            eventID: evt.Context.EventID,
            startTime: plotState.startTime,
            endTime: plotState.endTime,
            Trc: analytic.Trc,
            HPFOrder: analytic.HPFOrder,
            LPFOrder: analytic.LPFOrder,
            CycleLimits: plotState.cycleLimits,
            FFTLimits: plotState.fftLimits,
            FFTCycles: analytic.FFTCycles,
            FFTStartTime: analytic.FFTStartTime,
            Harmonic: analytic.Harmonic,
            singlePlot: singlePlot,
            plots: plotBase64,
            overlappingInfo: overlappingBase64
        };

        let query = queryString.stringify(queryObj);
        // Trim query string if too long
        const plotQuery = [...enabledPlots];
        while (query?.length > 3000 && plotQuery?.length > 0) {
            plotQuery.pop();
            queryObj.plots = btoa(JSON.stringify(plotQuery));
            query = queryString.stringify(queryObj);
        }
        return query;
    }, [evt.Context.EventID, plotState, plotData, analytic, singlePlot, overlapping.events]);

    const ToggleDrawer = (drawer: OpenSee.OverlayDrawers, open: boolean) => {
        overlayHandles.current[drawer](open);
    };

    const handleDrawerChange = (drawerName: keyof OpenSee.Drawers, isOpen: boolean) => {
        setOpenDrawers(prevStates => ({ ...prevStates, [drawerName]: isOpen }));
    };

    function exportData(type: string) {
        const showPlots = selectDisplayed(plotState.meta);
        const uri = homePath + `api/CSV/Download?type=${type}&eventID=${evt.Context.EventID}` +
            `${showPlots.Voltage != undefined ? `&displayVolt=${showPlots.Voltage}` : ``}` +
            `${showPlots.Current != undefined ? `&displayCur=${showPlots.Current}` : ``}` +
            `${showPlots.TripCoil != undefined ? `&displayTCE=${showPlots.TripCoil}` : ``}` +
            `${showPlots.Digitals != undefined ? `&breakerdigitals=${showPlots.Digitals}` : ``}` +
            `${showPlots.Analogs != undefined ? `&displayAnalogs=${showPlots.Analogs}` : ``}` +
            `${type == 'fft' ? `&startDate=${plotState.fftLimits[0]}` : ``}` +
            `${type == 'fft' ? `&cycles=${analytic.FFTCycles}` : ``}` +
            `&Meter=${evt.Context.EventInfo?.MeterName}` +
            `&EventType=${evt.Context.EventInfo?.MeterName}`;
        window.open(uri, "_blank");
    }

    function DispatchQuery(argQuery: string, initial: boolean) {
        // Read current values from refs to avoid stale closures in the history listener
        const curPlotState = plotStateRef.current;
        const curPlotData = plotDataRef.current;
        const curLifecycle = lifecycleRef.current;
        const curStateActions = stateActionsRef.current;
        const curAnalytic = analyticRef.current;

        const parsedQuery: OpenSee.Query = queryString.parse(argQuery.substring(1)) as unknown as OpenSee.Query;

        let parsedPlots: OpenSee.PlotQuery[] = [];
        if (parsedQuery?.plots != null) {
            parsedPlots = JSON.parse(atob(parsedQuery.plots));
        }

        const enabledPlots = selectEnabledPlots(curPlotState.meta, curPlotData);

        const parsedSinglePlot = ToBool(parsedQuery?.singlePlot);
        if (parsedSinglePlot != null)
            dispatch(SetSinglePlot(parsedSinglePlot));

        const parsedEventID = ToInt(parsedQuery?.eventID);
        let usedEventID: number = defaultEventID;
        if (parsedEventID != null && !isNaN(parsedEventID) && parsedEventID >= 0 && parsedEventID !== evt.Context.EventID) {
            evt.Dispatch.current.SettingsDispatch({ EventID: parsedEventID });
            usedEventID = parsedEventID;
        } else if (initial) {
            evt.Dispatch.current.SettingsDispatch({ EventID: defaultEventID });
            usedEventID = defaultEventID;
        }

        const parsedStart = ToFloat(parsedQuery?.startTime);
        const parsedEnd = ToFloat(parsedQuery?.endTime);
        if (parsedStart != undefined && parsedEnd != undefined && (curPlotState.startTime != parsedStart || curPlotState.endTime != parsedEnd))
            curStateActions.SetTimeLimit(parsedStart, parsedEnd, curPlotData);

        const analyticQuery: OpenSee.IAnalyticContext = {
            Harmonic: ToInt(parsedQuery?.Harmonic) ?? curAnalytic.Harmonic,
            Trc: ToInt(parsedQuery?.Trc) ?? curAnalytic.Trc,
            LPFOrder: ToInt(parsedQuery?.LPFOrder) ?? curAnalytic.LPFOrder,
            HPFOrder: ToInt(parsedQuery?.HPFOrder) ?? curAnalytic.HPFOrder,
            FFTCycles: ToInt(parsedQuery?.FFTCycles) ?? curAnalytic.FFTCycles,
            FFTStartTime: ToFloat(parsedQuery.FFTStartTime) ?? curAnalytic.FFTStartTime
        };

        const analyticData = queryStringToNums(analyticQuery);
        if (!_.isEqual(curAnalytic, analyticQuery) && analyticData != null)
            setAnalytic(analyticData);

        if (initial && (parsedPlots == null || (parsedPlots?.length === 0 && enabledPlots?.length === 0))) {
            curLifecycle.AddPlot({ EventId: usedEventID, DataType: "Voltage" });
            curLifecycle.AddPlot({ EventId: usedEventID, DataType: "Current" });
        } else if (parsedPlots?.length > 0) {
            parsedPlots.forEach(plot => {
                const plotChange = parsedPlots.length !== enabledPlots.length;
                const oldPlot = enabledPlots.find(p => p.key.DataType === plot.key.DataType && p.key.EventId === plot.key.EventId);
                const isYLimitsEqual = _.isEqual(plot?.yLimits, oldPlot?.yLimits);
                const isFFTLimitsEqual = _.isEqual([ToInt(parsedQuery?.FFTLimits?.[0]), ToInt(parsedQuery?.FFTLimits?.[1])], curPlotState.fftLimits);
                const isCycleLimitsEqual = _.isEqual([ToInt(parsedQuery?.CycleLimits?.[0]), ToInt(parsedQuery?.CycleLimits?.[1])], curPlotState.cycleLimits);

                const fftStart = ToInt(parsedQuery?.FFTLimits?.[0]);
                const fftEnd = ToInt(parsedQuery?.FFTLimits?.[1]);
                const fftLimits: [number, number] | undefined =
                    fftStart != null && fftEnd != null && !isFFTLimitsEqual ? [fftStart, fftEnd] : undefined;

                const cycleStart = ToInt(parsedQuery?.CycleLimits?.[0]);
                const cycleEnd = ToInt(parsedQuery?.CycleLimits?.[1]);
                const cycleLimits: [number, number] | undefined =
                    cycleStart != null && cycleEnd != null && !isCycleLimitsEqual ? [cycleStart, cycleEnd] : undefined;

                if (plotChange && plot.key.EventId !== -1) {
                    if (parsedSinglePlot ?? false) {
                        parsedPlots.filter(p => p.key.EventId !== -1 && p.key.DataType === plot.key.DataType)
                            .forEach(p => curLifecycle.AddPlot(
                                p.key,
                                !isYLimitsEqual ? plot.yLimits : undefined,
                                plot.isZoomed,
                                fftLimits,
                                cycleLimits
                            ));
                    } else {
                        curLifecycle.AddPlot(
                            plot.key,
                            !isYLimitsEqual ? plot.yLimits : undefined,
                            plot.isZoomed,
                            fftLimits,
                            cycleLimits
                        );
                    }
                }
            });
        }
    }

    // Resize effects
    React.useLayoutEffect(() => {
        const timeoutId = setTimeout(() => {
            if (applicationRef.current == null || applicationRef.current.navBarDiv == null) return;
            const newHeight = ((window.innerHeight - applicationRef.current?.navBarDiv?.offsetHeight) / Math.min(plotKeys.length, 3));
            const newWidth = plotRef.current ? plotRef.current.offsetWidth : 0;
            const newNavBarWidth = applicationRef.current?.navBarDiv?.offsetWidth;
            if (newHeight !== plotHeight && !isNaN(newHeight) && isFinite(newHeight))
                setPlotHeight(newHeight);
            if (newWidth !== plotWidth && !isNaN(newWidth) && isFinite(newWidth))
                setPlotWidth(newWidth);
            if (navWidth !== newNavBarWidth && !isNaN(newNavBarWidth) && isFinite(newNavBarWidth))
                setNavWidth(newNavBarWidth);
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [plotState, openDrawers, resizeCount]);

    React.useEffect(() => {
        window.addEventListener("resize", () => setResizeCount(x => x + 1));
        return () => { $(window).off('resize'); };
    }, []);

    // Reset time limits when a new event finishes loading
    React.useEffect(() => {
        if (evt.Context.Status !== 'idle' || evt.Context.EventInfo == null) return;

        const startTime = new Date(evt.Context.EventInfo.EventDate + "Z").getTime();
        const endTime = new Date(evt.Context.EventInfo.EventEnd + "Z").getTime();

        if (!isNaN(startTime) && !isNaN(endTime))
            stateActions.SetTimeLimit(startTime, endTime, plotData);
    }, [evt.Context.EventID, evt.Context.Status]);

    // Query string effect
    React.useEffect(() => {
        const query = queryString.parse(history.current['location'].search);
        const parsedStartTime = query['startTime'] != undefined ? parseInt(query['startTime'] as string) : undefined;
        const parsedEndTime = query['endTime'] != undefined ? parseInt(query['endTime'] as string) : undefined;

        if (parsedStartTime != undefined && parsedEndTime != undefined) {
            stateActionsRef.current.SetTimeLimit(parsedStartTime, parsedEndTime, plotDataRef.current);
            setAnalytic(a => ({ ...a, FFTStartTime: parsedStartTime }));
        } else {
            //fallback
            const evStart = new Date(defaultEventStartTime + "Z").getTime();
            const evEnd = new Date(defaultEventEndTime + "Z").getTime();
            stateActionsRef.current.SetTimeLimit(evStart, evEnd, plotDataRef.current);
            setAnalytic(a => ({ ...a, FFTStartTime: evStart }));
        }

        DispatchQuery(history.current['location'].search, true);

        history.current['listen'](location => {
            DispatchQuery(location.search, false);
        });
    }, []);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            history.current['push'](`?${queryStr}`);
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [queryStr]);

    // Tooltip select mode effect
    React.useEffect(() => {
        if (openDrawers.ToolTipDelta) {
            const oldMode = _.clone(mouseMode);
            dispatch(SetMouseMode('select'));
            return () => { dispatch(SetMouseMode(oldMode)); };
        }
    }, [openDrawers.ToolTipDelta]);

    return (
        <Application
            HomePath={homePath}
            DefaultPath={""}
            HideSideBar={true}
            Version={version}
            Logo={`${homePath}Images/openSEE.png`}
            NavBarContent={<OpenSeeNavBar ToggleDrawer={ToggleDrawer} OpenDrawers={openDrawers} Width={navWidth} lifecycle={lifecycle} />}
            UseLegacyNavigation={true}
            ref={applicationRef}
        >
            <VerticalSplit style={{ height: '100%' }}>
                <SplitDrawer Open={false} Width={25} Title={"Info"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("Info", item)}>
                    <EventInfo />
                </SplitDrawer>

                <SplitDrawer Open={false} Width={25} Title={"Compare"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("Compare", item)}>
                    <OverlappingEventWindow EnableOverlappingEvent={lifecycle.EnableOverlappingEvent} />
                </SplitDrawer>

                <SplitDrawer Open={false} Width={25} Title={"Analytics"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("Analytics", item)}>
                    <AnalyticOptions lifecycle={lifecycle} />
                </SplitDrawer>

                <SplitDrawer Open={false} Width={25} Title={"Tooltip"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("ToolTip", item)}>
                    <ToolTipWidget />
                </SplitDrawer>

                <SplitDrawer Open={false} Width={25} Title={"Tooltip w/ Delta"} MinWidth={15} MaxWidth={30} OnChange={(item) => handleDrawerChange("ToolTipDelta", item)}>
                    <ToolTipDeltaWidget />
                </SplitDrawer>

                <SplitDrawer Open={false} Width={25} Title={"Settings"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.Settings = func; }} ShowClosed={false}
                    OnChange={(item) => handleDrawerChange("Settings", item)}>
                    <SettingsWidget />
                </SplitDrawer>

                <SplitDrawer Open={false} Width={25} Title={"Accumulated Points"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.AccumulatedPoints = func; }} ShowClosed={false}
                    OnChange={(item) => handleDrawerChange("AccumulatedPoints", item)}>
                    <PointWidget />
                </SplitDrawer>

                <SplitDrawer Open={false} Width={25} Title={"Scalar Stats"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.ScalarStats = func; }} ShowClosed={false}
                    OnChange={(item) => handleDrawerChange("ScalarStats", item)}>
                    <ScalarStatsWidget EventID={evt.Context.EventID} ExportCallback={exportData} />
                </SplitDrawer>

                <SplitDrawer Open={false} Width={25} Title={"Correlated Sags"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { overlayHandles.current.CorrelatedSags = func; }} ShowClosed={false}
                    OnChange={(item) => handleDrawerChange("CorrelatedSags", item)}>
                    <TimeCorrelatedSagsWidget EventID={evt.Context.EventID} ExportCallback={exportData} />
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
                    <HarmonicStatsWidget EventID={evt.Context.EventID} ExportCallback={exportData} />
                </SplitDrawer>

                <SplitSection MinWidth={70} MaxWidth={100} Width={100}>
                    <div ref={plotRef} style={{ overflowY: 'auto', width: '100%', height: '100%' }}>
                        {groupedKeys[evt.Context.EventID] != undefined ? (
                            <>
                                {groupedKeys[evt.Context.EventID].filter(item => item.DataType !== 'FFT').sort(sortGraph).map(item => (
                                    <LineChart
                                        key={item.DataType + item.EventId}
                                        width={plotWidth}
                                        height={plotHeight}
                                        showToolTip={openDrawers.ToolTipDelta}
                                        dataKey={{ DataType: item.DataType, EventId: item.EventId }}
                                    />
                                ))}

                                {groupedKeys[evt.Context.EventID].filter(item => item.DataType === 'FFT').sort(sortGraph).map(item => (
                                    <BarChart
                                        key={item.DataType + item.EventId}
                                        width={plotWidth}
                                        height={plotHeight}
                                        dataKey={{ DataType: item.DataType, EventId: item.EventId }}
                                    />
                                ))}
                            </>
                        ) : null}

                        {Object.keys(groupedKeys).filter(item => parseInt(item) !== evt.Context.EventID).map(key =>
                            <div className="card" key={key}>
                                {overlapping.events.find(item => item.EventID === parseInt(key)) ? (
                                    <div className="card-header">
                                        <div className="row">
                                            <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                <span style={{ textAlign: 'center' }}>Meter:</span><br />
                                                {overlapping.events.find(item => item.EventID === parseInt(key))?.MeterName ?? 'n/a'}
                                            </div>
                                            <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                <span style={{ textAlign: 'center' }}>Asset:</span><br />
                                                {overlapping.events.find(item => item.EventID === parseInt(key))?.AssetName ?? 'n/a'}
                                            </div>
                                            <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                <span style={{ textAlign: 'center' }}>Type:</span><br />
                                                {overlapping.events.find(item => item.EventID === parseInt(key))?.EventType ?? 'n/a'}
                                            </div>
                                            <div className="col-3" style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px', textAlign: 'center' }}>
                                                <span style={{ textAlign: 'center' }}>Inception:</span><br />
                                                {moment(overlapping.events.find(item => item.EventID === parseInt(key))?.Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}
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
        </Application>
    );
});

export default OpenSeeApplication;

function ToInt(arg: any) {
    if (arg == undefined) return undefined;
    const val = parseInt(arg);
    return isNaN(val) ? undefined : val;
}

function ToFloat(arg: any) {
    if (arg == undefined) return undefined;
    const val = parseFloat(arg);
    return isNaN(val) ? undefined : val;
}

function ToBool(arg: any) {
    if (arg == undefined) return undefined;
    if (arg == "True" || arg == "true" || arg == "1") return true;
    if (arg == "False" || arg == "false" || arg == "0") return false;
    return undefined;
}

function queryStringToNums(arg: OpenSee.IAnalyticContext) {
    if (arg == undefined) return undefined;
    const query = {};
    Object.keys(arg).forEach(key => {
        const num = parseFloat(arg[key]);
        query[key] = isNaN(num) ? arg[key] : num;
    });
    return query as OpenSee.IAnalyticContext;
}