//******************************************************************************************************
//  queryThunk.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  11/01/2020 - C. Lackner
//       Generated original version of source code.
//
//  01/24/2024 - Preston Crawford
//       Refactored to incorporate more relevant state into queryParams
//
//******************************************************************************************************
import { createAsyncThunk } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import * as queryString from "query-string";
import { AddPlot, SetTimeLimit, SetFFTLimits, SetCycleLimit} from './dataSlice';
import { SelectEnabledPlots, SetSinglePlot } from './settingSlice';
import { SetEventID, SelectEventID } from './eventInfoSlice'
import { SelectAnalytics, UpdateAnalytic } from '../store/analyticSlice';
import { SelectedOverlappingEventIds, SetOverlappingEventList } from '../store/overlappingEventsSlice'

import * as _ from 'lodash'


export const updatedURL = createAsyncThunk('Settings/newURL', (arg: { query: string, initial: boolean }, { getState, dispatch }) => {
    let parsedQuery = queryString.parse(arg.query);

    if (parsedQuery) {
        if (parsedQuery.plots) {
            const plotString = atob(parsedQuery.plots)
            parsedQuery.plots = JSON.parse(plotString)
        }
        if (parsedQuery.overlappingInfo) {
            const overlapppingString = atob(parsedQuery.overlappingInfo)
            parsedQuery.overlappingInfo = JSON.parse(overlapppingString)
        }
    }


    const query: OpenSee.Query = parsedQuery
    const oldState = getState() as OpenSee.IRootState;
    const enabledPlots = SelectEnabledPlots(oldState);
    const oldEventID = SelectEventID(oldState);
    const oldAnalytics = SelectAnalytics(oldState);
    const oldOverlappingList = SelectedOverlappingEventIds(oldState);

    const analyticQuery = {
        Harmonic: ToInt(query.Harmonic),
        Trc: ToInt(query.Trc), 
        LPFOrder: ToInt(query.LPFOrder),
        HPFOrder: ToInt(query.HPFOrder),
        FFTCycles: ToInt(query.FFTCycles),
        FFTStartTime: ToFloat(query.FFTStartTime)
    } as OpenSee.IAnalyticStore

    const isAnalyticsEqual = _.isEqual(oldAnalytics, analyticQuery)
    const isOverlappingListEqual = _.isEqual(oldOverlappingList, parsedQuery.overlappingInfo)
    const isFFTLimitsEqual = _.isEqual([ToInt(query?.FFTLimits?.[0]), ToInt(query?.FFTLimits?.[1])], oldState.Data.fftLimits)
    const isCycleLimitsEqual = _.isEqual([ToInt(query?.CycleLimits?.[0]), ToInt(query?.CycleLimits?.[1])], oldState.Data.cycleLimit)

    const noPlots = (query?.plots?.length === 0 && enabledPlots?.length === 0) || query?.plots === undefined

    //Set SinglePlot
    if (ToBool(query?.singlePlot) && ToBool(query?.singlePlot) !== undefined)
        dispatch(SetSinglePlot(ToBool(query.singlePlot)))

    //Set EventID
    if (ToInt(query?.eventID) && !isNaN(query?.eventID) && query?.eventID !== 0 && ToInt(query?.eventID) !== oldEventID)
        dispatch(SetEventID(ToInt(query.eventID)))

    //Set TimeLimit
    if (ToFloat(query.startTime) != undefined && ToFloat(query.endTime) != undefined && (oldState.Data.startTime != ToFloat(query.startTime) || (oldState.Data.endTime != ToFloat(query.endTime))))
        dispatch(SetTimeLimit({ start: ToFloat(query.startTime), end: ToFloat(query.endTime) }))

    //Set Overlapping EventList
    if (!isOverlappingListEqual && query?.overlappingInfo)
        dispatch(SetOverlappingEventList(query.overlappingInfo))

    //Analytic Query
    if (!isAnalyticsEqual) 
        dispatch(UpdateAnalytic({settings: queryStringToNums(analyticQuery)}))

    // On initial load, add default plots (Voltage and Current) if there is none provided via query
    if (noPlots && arg.initial) {
        dispatch(AddPlot({ key: { EventId: oldState.EventInfo.EventID, DataType: "Voltage" } }));
        dispatch(AddPlot({ key: { EventId: oldState.EventInfo.EventID, DataType: "Current" } }));
    }

    //TODO: come up with a way to handle traces in queryString CHristoph recommended a grid of some a sort, however this would more than likely require us compressing the queryString / reducing number of plots in queryString
    else if (query?.plots?.length > 0) {
        query.plots.forEach(plot => {
            const plotChange = query.plots.length !== enabledPlots.length
            const oldPlot = enabledPlots.find(p => p.key.DataType === plot.key.DataType && p.key.EventId === plot.key.EventId)
            const isYLimitsEqual = _.isEqual(plot?.yLimits, oldPlot?.yLimits)

            if (plotChange && ToBool(query?.singlePlot) && ToBool(query?.singlePlot) !== undefined && plot.key.EventId === -1) {
                const plots = query.plots.filter(p => p.key.EventId !== -1 && p.key.DataType === plot.key.DataType)
                plots.forEach(p => dispatch(AddPlot(
                    {
                        key: p.key,
                        yLimits: !isYLimitsEqual ? plot.yLimits : undefined,
                        isZoomed: plot.isZoomed, fftLimits: !isFFTLimitsEqual ? [ToInt(query?.FFTLimits?.[0]),ToInt(query?.FFTLimits?.[1])] : undefined,
                        cycleLimits: !isCycleLimitsEqual ? [ToInt(query?.CycleLimits?.[0]), ToInt(query?.CycleLimits?.[1])] : undefined
                    })))
                return;
            }

            if (plotChange && plot.key.EventId !== -1) 
                dispatch(AddPlot(
                    {
                    key: plot.key, yLimits: !isYLimitsEqual ? plot.yLimits : undefined,
                    isZoomed: plot.isZoomed, fftLimits: !isFFTLimitsEqual ? [ToInt(query?.FFTLimits?.[0]), ToInt(query?.FFTLimits?.[1])] : undefined,
                    cycleLimits: !isCycleLimitsEqual ? [ToInt(query?.CycleLimits?.[0]), ToInt(query?.CycleLimits?.[1])] : undefined
                }));
        })
    }


})

export function ToInt(arg) {
    if (arg == undefined)
        return undefined;
    let val = parseInt(arg);
    if (isNaN(val))
        return undefined;
    return val;
}

export function ToFloat(arg) {
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

function queryStringToNums(arg: OpenSee.IAnalyticStore ) {
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

    return query as OpenSee.IAnalyticStore;
}
