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

import { SplitDrawer, SplitSection, VerticalSplit } from '@gpa-gemstone/react-interactive';
import createHistory from "history/createBrowserHistory";
import * as _ from "lodash";
import moment from 'moment';
import * as queryString from "query-string";
import * as React from 'react';
import AnalyticOptions from './Components/AnalyticOptions';
import OverlappingEventWindow from './Components/OverlappingEvents';
import AnalyticContext from './Context/AnalyticContext';
import { EventContext } from './Context/EventContext';
import BarChart from './Graphs/BarChartBase';
import LineChart from './Graphs/LineChartBase';
import { sortGraph } from './Graphs/Utilities';
import { OpenSee } from './global';
import { useAppDispatch, useAppSelector } from './hooks';
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
import { SelectMouseMode, SetMouseMode, SetSinglePlot } from './store/settingSlice';
import DataContextFunctions from './Context/DataContextFunctions';
import { DataContext, DataFunctionContext } from './Context/DataContext';

interface IProps {
    HandleDrawerChange: (drawerName: keyof OpenSee.Drawers, isOpen: boolean) => void
    OverlayHandles: React.MutableRefObject<OpenSee.IOverlayHandlers>
}

const OpenSeeHome = React.memo((props: IProps) => {
    const dispatch = useAppDispatch();
    const history = React.useRef<object>(createHistory());

    const evt = React.useContext(EventContext);
    const data = React.useContext(DataContext);
    const dataDispatch = React.useContext(DataFunctionContext);
    const [analytic, setAnalytic] = React.useContext(AnalyticContext);

    function DispatchQuery(argQuery: string, intial: boolean) {
        // Fields for this aren't type checked, do due diligience before using a field
        let parsedQuery: OpenSee.Query = queryString.parse(argQuery);

        let parsedPlots: OpenSee.PlotQuery[];
        if (parsedQuery?.plots != null) {
            const plotString = atob(parsedQuery.plots);
            parsedPlots = JSON.parse(plotString);
        }

        let parsedOverlap: number[]; 
        if (parsedQuery?.overlappingInfo != null) {
            const overlapppingString = atob(parsedQuery.overlappingInfo);
            parsedOverlap = JSON.parse(overlapppingString);
        }

        const enabledPlots = data.Selector.current.SelectEnabledPlots();

        //Set SinglePlot
        const parsedSinglePlot = ToBool(parsedQuery?.singlePlot);
        if (parsedSinglePlot != null)
            dispatch(SetSinglePlot(parsedSinglePlot));

        //Set EventID
        const parsedEventID = ToInt(parsedQuery?.eventID);
        if (parsedEventID != null && !isNaN(parsedEventID) && parsedEventID >= 0 && parsedEventID !== evt.Context.EventID)
            evt.Dispatch.current.SettingsDispatch({ EventID: parsedEventID });

        //Set TimeLimit
        const parsedStart = ToFloat(parsedQuery?.startTime);
        const parsedEnd = ToFloat(parsedQuery?.startTime);
        if (parsedStart != undefined && parsedEnd != undefined && (data.Context.StartTime != parsedStart || (data.Context.EndTime != parsedEnd)))
            dataDispatch.Dispatch.current.SetTimeLimit(parsedStart, parsedEnd);

        //Analytic Query
        const analyticQuery: OpenSee.IAnalyticContext = {
            Harmonic: ToInt(parsedQuery?.Harmonic) ?? analytic.Harmonic,
            Trc: ToInt(parsedQuery?.Trc) ?? analytic.Trc,
            LPFOrder: ToInt(parsedQuery?.LPFOrder) ?? analytic.LPFOrder,
            HPFOrder: ToInt(parsedQuery?.HPFOrder) ?? analytic.HPFOrder,
            FFTCycles: ToInt(parsedQuery?.FFTCycles) ?? analytic.FFTCycles,
            FFTStartTime: ToFloat(parsedQuery.FFTStartTime) ?? analytic.Harmonic
        };
        if (!_.isEqual(analytic, analyticQuery))
            setAnalytic(queryStringToNums(analyticQuery));

            // On initial load, add default plots (Voltage and Current) if there is none provided via query
        if (intial && (parsedPlots == null || (parsedPlots?.length === 0 && enabledPlots?.length === 0))) {
            dataDispatch.Dispatch.current.AddPlot({ EventId: evt.Context.EventID, DataType: "Voltage" });
            dataDispatch.Dispatch.current.AddPlot({ EventId: evt.Context.EventID, DataType: "Current" });
        }
        //TODO: come up with a way to handle traces in queryString CHristoph recommended a grid of some a sort, however this would more than likely require us compressing the queryString / reducing number of plots in queryString
        else if (parsedPlots?.length > 0) {
            parsedPlots.forEach(plot => {
                const plotChange = parsedPlots.length !== enabledPlots.length
                const oldPlot = enabledPlots.find(p => p.key.DataType === plot.key.DataType && p.key.EventId === plot.key.EventId)
                const isYLimitsEqual = _.isEqual(plot?.yLimits, oldPlot?.yLimits)
                const isFFTLimitsEqual = _.isEqual([ToInt(parsedQuery?.FFTLimits?.[0]), ToInt(parsedQuery?.FFTLimits?.[1])], data.Context.FftLimits);
                const isCycleLimitsEqual = _.isEqual([ToInt(parsedQuery?.CycleLimits?.[0]), ToInt(parsedQuery?.CycleLimits?.[1])], data.Context.CycleLimits);

                if (plotChange && plot.key.EventId !== -1) {
                    if (parsedSinglePlot ?? false) {
                        const plots = parsedPlots.filter(p => p.key.EventId !== -1 && p.key.DataType === plot.key.DataType);
                        plots.forEach(p => dataDispatch.Dispatch.current.AddPlot(
                            p.key,
                            !isYLimitsEqual ? plot.yLimits : undefined,
                            plot.isZoomed,
                            !isFFTLimitsEqual ? [ToInt(parsedQuery?.FFTLimits?.[0]), ToInt(parsedQuery?.FFTLimits?.[1])] : undefined,
                            !isCycleLimitsEqual ? [ToInt(parsedQuery?.CycleLimits?.[0]), ToInt(parsedQuery?.CycleLimits?.[1])] : undefined
                        ));
                    }
                    else {
                        dataDispatch.Dispatch.current.AddPlot(
                            plot.key,
                            !isYLimitsEqual ? plot.yLimits : undefined,
                            plot.isZoomed,
                            !isFFTLimitsEqual ? [ToInt(parsedQuery?.FFTLimits?.[0]), ToInt(parsedQuery?.FFTLimits?.[1])] : undefined,
                            !isCycleLimitsEqual ? [ToInt(parsedQuery?.CycleLimits?.[0]), ToInt(parsedQuery?.CycleLimits?.[1])] : undefined
                        );
                    }
                }
            })
        }


    }

    // Effect to handle changes in query params
    React.useEffect(() => {
        const query = queryString.parse(history.current['location'].search);
        // ToDo: Make sure these three are ALWAYS in uri via controller (along with event id) or do a reset after event info fetch
        const evStart = query['eventStartTime'];
        const evEnd = query['eventEndTime'];

        const startTime = (query['startTime'] != undefined ? parseInt(query['startTime']) : new Date(evStart + "Z").getTime());
        const endTime = (query['endTime'] != undefined ? parseInt(query['endTime']) : new Date(evEnd + "Z").getTime());

        dataDispatch.Dispatch.current.SetTimeLimit(startTime, endTime);
        setAnalytic(a => ({ ...a, FFTStartTime: startTime }));


        DispatchQuery(history.current['location'].search, true);

        history.current['listen'](location => {
            // If Query changed then we update states....
            // Note that enabled and selected states that depend on loading state are not dealt with in here
            DispatchQuery(location.search, false);
        });
    }, []);

    /*
       (state: OpenSee.IRootState) => state.Data,
       (state: OpenSee.IRootState) => state.Analytic,
       (state: OpenSee.IRootState) => state.OverlappingEvents,
       (state: OpenSee.IRootState) => state.Settings.SinglePlot,
       (data, analyticInfo, evtID, overLappingEvents, singlePlot) => */
    const d = React.useMemo(() => {
        const overlappingEvts = []
        const plotKeys = data.Plots.map(plot => plot.key)
        const plotQuery: OpenSee.PlotQuery[] = _.uniq(plotKeys);

        if (plotKeys.length > 0)
            plotKeys.forEach(key => {
                const matchingPlot = data.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);

                if (matchingPlot) {
                    const relevantUnits = matchingPlot.data.filter(data => data.Enabled)
                    const enabledUnits = _.uniqBy(relevantUnits, "Unit").map(data => data.Unit)
                    let yLimits = {}

                    Object.keys(matchingPlot.yLimits).forEach(key => {
                        if (enabledUnits.includes(key as OpenSee.Unit))
                            yLimits[key] = { ...matchingPlot.yLimits[key] };
                    })

                    plotQuery.push({
                        yLimits: yLimits as OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
                        isZoomed: matchingPlot.isZoomed,
                        key: matchingPlot.key
                    });

                }
            });

        if (overLappingEvents.EventList.length > 0) {
            overLappingEvents.EventList.forEach(evt => {
                if (evt.Selected)
                    overlappingEvts.push(evt.EventID)
            })
        }
        const plotString = JSON.stringify(plotQuery);
        const overlappingString = JSON.stringify(overlappingEvts);
        const plotBase64 = btoa(plotString);
        const overlappingBase64 = btoa(overlappingString);

        const queryObj = {
            eventID: eventId,
            startTime: data.startTime,
            endTime: data.endTime,
            Trc: analytic.Trc,
            HPFOrder: analytic.HPFOrder,
            LPFOrder: analytic.LPFOrder,
            CycleLimits: data.cycleLimit as [number, number],
            FFTLimits: data.fftLimits as [number, number],
            FFTCycles: analytic.FFTCycles,
            FFTStartTime: analytic.FFTStartTime,
            Harmonic: analytic.Harmonic,
            singlePlot: singlePlot,
            plots: plotBase64,
            overlappingInfo: overlappingBase64
        }

        let query = queryString.stringify(queryObj);

        // Temporary patch to check queryString length and remove plot objects if necessary
        while (query?.length > 3000 && plotQuery?.length > 0) {
            plotQuery.pop();
            const plotString = JSON.stringify(plotQuery)
            const plotBase64 = btoa(plotString);
            queryObj.plots = plotBase64;
            query = queryString.stringify(queryObj);
        }

        return query
    }, [eventId]);

    //Effect to push updatedQueryParams
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            history.current['push'](`?${query}`);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <VerticalSplit style={{ height: '100%' }}>
            <SplitDrawer Open={false} Width={25} Title={"Info"} MinWidth={15} MaxWidth={30} OnChange={(item) => props.HandleDrawerChange("Info", item)}>
                <EventInfo />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Compare"} MinWidth={15} MaxWidth={30} OnChange={(item) => props.HandleDrawerChange("Compare", item)}>
                <OverlappingEventWindow />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Analytics"} MinWidth={15} MaxWidth={30} OnChange={(item) => props.HandleDrawerChange("Analytics", item)}>
                <AnalyticOptions />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Tooltip"} MinWidth={15} MaxWidth={30} OnChange={(item) => props.HandleDrawerChange("ToolTip", item)}>
                <ToolTipWidget />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Tooltip w/ Delta"} MinWidth={15} MaxWidth={30} OnChange={(item) => props.HandleDrawerChange("ToolTipDelta", item)}  >
                <ToolTipDeltaWidget />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Settings"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { props.OverlayHandles.current.Settings = func; }} ShowClosed={false}
                OnChange={(item) => props.HandleDrawerChange("Settings", item)} >
                <SettingsWidget />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Accumulated Points"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { props.OverlayHandles.current.AccumulatedPoints = func; }} ShowClosed={false}
                OnChange={(item) => props.HandleDrawerChange("AccumulatedPoints", item)}>
                <PointWidget />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Scalar Stats"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { props.OverlayHandles.current.ScalarStats = func; }} ShowClosed={false}
                OnChange={(item) => props.HandleDrawerChange("ScalarStats", item)}>
                <ScalarStatsWidget EventID={eventId} />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Correlated Sags"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { props.OverlayHandles.current.CorrelatedSags = func; }} ShowClosed={false}
                OnChange={(item) => props.HandleDrawerChange("CorrelatedSags", item)}>
                <TimeCorrelatedSagsWidget EventID={eventId} />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Lightning"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { props.OverlayHandles.current.Lightning = func; }} ShowClosed={false}
                OnChange={(item) => props.HandleDrawerChange("Lightning", item)}>
                <LightningDataWidget />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"FFT Table"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { props.OverlayHandles.current.FFTTable = func; }} ShowClosed={false}
                OnChange={(item) => props.HandleDrawerChange("FFTTable", item)}>
                <FFTTable />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Phasor Chart"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { props.OverlayHandles.current.PolarChart = func; }} ShowClosed={false}
                OnChange={(item) => props.HandleDrawerChange("PolarChart", item)}>
                <PhasorChartWidget />
            </SplitDrawer>

            <SplitDrawer Open={false} Width={25} Title={"Harmonic Stats"} MinWidth={15} MaxWidth={30} GetOverride={(func) => { props.OverlayHandles.current.HarmonicStats = func; }} ShowClosed={false}
                OnChange={(item) => props.HandleDrawerChange("HarmonicStats", item)}>
                <HarmonicStatsWidget EventID={eventId} />
            </SplitDrawer>

            <SplitSection MinWidth={70} MaxWidth={100} Width={100}>
                <div ref={plotRef} style={{ overflowY: 'auto', width: '100%', height: '100%' }}>
                    {groupedKeys[eventId] != undefined ? (
                        <>
                            {groupedKeys[eventId].filter(item => item.DataType !== 'FFT').sort(sortGraph).map(item => (
                                <LineChart
                                    key={item.DataType + item.EventId}
                                    width={plotWidth}
                                    height={plotHeight}
                                    showToolTip={openDrawers.ToolTipDelta}
                                    dataKey={{ DataType: item.DataType, EventId: item.EventId }}
                                />
                            ))}

                            {groupedKeys[eventId].filter(item => item.DataType === 'FFT').sort(sortGraph).map(item => (
                                <BarChart
                                    key={item.DataType + item.EventId}
                                    width={plotWidth}
                                    height={plotHeight}
                                    dataKey={{ DataType: item.DataType, EventId: item.EventId }}
                                />
                            ))}
                        </>
                    ) : null}

                    {Object.keys(groupedKeys).filter(item => parseInt(item) !== eventId).map(key =>
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
    );
}));

export default OpenSeeHome;

function ToInt(arg) {
    if (arg == undefined)
        return undefined;
    let val = parseInt(arg);
    if (isNaN(val))
        return undefined;
    return val;
}

function ToFloat(arg) {
    if (arg == undefined)
        return undefined;
    let val = parseFloat(arg);
    if (isNaN(val))
        return undefined;
    return val;
}

function ToBool(arg) {
    if (arg == undefined)
        return undefined;
    if (arg == "True" || arg == "true" || arg == "1")
        return true;
    if (arg == "False" || arg == "false" || arg == "0")
        return false;
    return undefined;
}

function queryStringToNums(arg: OpenSee.IAnalyticContext) {
    if (arg == undefined)
        return undefined;

    let query = {};
    Object.keys(arg).forEach(key => {
        const num = parseFloat(arg[key]);
        if (!isNaN(num))
            query[key] = num;
        else
            query[key] = arg[key];
    });

    return query as OpenSee.IAnalyticContext;
}
