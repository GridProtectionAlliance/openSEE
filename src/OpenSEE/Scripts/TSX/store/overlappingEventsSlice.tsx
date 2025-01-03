﻿//******************************************************************************************************
//  eventSlice.tsx - Gbtc
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
//  11/23/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import * as _ from 'lodash';
import { AddPlot, RemovePlot } from './dataSlice';
import { CancelEvent } from './RequestHandler';


export const LoadOverlappingEvents = createAsyncThunk('Event/LoadOverlappingEvents', async (_, thunkAPI) => {
    const state = (thunkAPI.getState() as OpenSee.IRootState)
    const evtID = state.EventInfo.EventID
    
    if (evtID && !isNaN(evtID) && evtID !== 0) {
        let handle = getOverlappingEvents(evtID, null, null);
        return await handle;
    }
    
})


export const EnableOverlappingEvent = createAsyncThunk('Event/EnableOverlappingEvent', (arg: number, thunkAPI) => {
    const state = (thunkAPI.getState() as OpenSee.IRootState);

    const plotIndex = state.OverlappingEvents.EventList.findIndex(event => event.EventID === arg);

    if (plotIndex === -1)
        return;

    CancelEvent(arg);

    let plots = _.uniq(state.Data.Plots.map(item => item.key.DataType));

    if (state.OverlappingEvents.EventList[plotIndex].Selected)
        plots.forEach(item => thunkAPI.dispatch(RemovePlot({ DataType: item, EventId: arg })))
    else
        plots.forEach(item => thunkAPI.dispatch(AddPlot({ key: {DataType: item, EventId: arg}})))


    thunkAPI.dispatch(OverlappingEventReducer.actions.UpdateEnabled(plotIndex));

    return;
});



export const OverlappingEventReducer = createSlice({
    name: 'Event',
    initialState: {
        EventList:[ ],
        Loading: false
    } as OpenSee.IOverlappingEventsStore,
    reducers: {
        UpdateEnabled: (state, action: PayloadAction<number>) => {
            state.EventList[action.payload].Selected = !state.EventList[action.payload].Selected
        },
        SetOverlappingEventList: (state, action: PayloadAction<[number]>) => {
            action.payload.forEach(id => {
                const evt = state.EventList.find(evt => evt.EventID === id)
                if(evt === undefined)
                    state.EventList.push({ Selected: true, AssetName: "", MeterName: "", EventID: id, StartTime: 0, EventType: "", Inception: 0, DurationEndTime: 0, EndTime: 0 })
            })
        },
    },
    extraReducers: (builder) => {
        builder.addCase(LoadOverlappingEvents.pending, (state, action) => {
            state.Loading = true;
            return state
        });
        builder.addCase(LoadOverlappingEvents.fulfilled, (state, action) => {
            state.Loading = false;
            action.payload.forEach(event => {
                let evt = state.EventList.find(evt => evt.EventID === event.EventID)
                if (evt === undefined)
                    state.EventList.push({ Selected: false, AssetName: event.AssetName, MeterName: event.MeterName, EventID: event.EventID, StartTime: new Date(event.StartTime + "Z").getTime(), EndTime: new Date(event.EndTime + "Z").getTime(), EventType: event.EventType, Inception: event.Inception, DurationEndTime: event.DurationEndTime })
                else {
                    //update eventIDs that were pushed from queryString
                    evt.AssetName = event.AssetName;
                    evt.MeterName = event.MeterName;
                    evt.StartTime = new Date(event.StartTime + "Z").getTime();
                    evt.EndTime = new Date(event.EndTime + "Z").getTime();
                    evt.EventType = event.EventType;
                    evt.Inception = event.Inception;
                    evt.DurationEndTime = event.DurationEndTime;
                }
            })
            return state
        });

    }
});

export const { SetOverlappingEventList } = OverlappingEventReducer.actions;
export default OverlappingEventReducer.reducer;

export const SelectEventList = (state: OpenSee.IRootState) => state.OverlappingEvents.EventList;
export const SelectEventListLoading = (state: OpenSee.IRootState) => state.OverlappingEvents.Loading;

export const SelectedOverlappingEventIds = createSelector(
    (state: OpenSee.IRootState) => state.OverlappingEvents.EventList,
    (eventList) => {
        if (eventList.length > 0) {
            let evtList = []
            eventList.forEach(evt => {
                if (evt.Selected)
                    evtList.push({ EventID: evt.EventID })
            })
            return evtList
        } else
            return []

    }
)


function getOverlappingEvents(eventID: number, eventStartTime: string, eventEndTime: string): JQuery.jqXHR<any> {

    let overlappingEventHandle = $.ajax({
        type: "GET",
        url: `${homePath}api/OpenSEE/GetOverlappingEvents?eventId=${eventID}` +
            `${eventStartTime != undefined ? `&startDate=${eventStartTime}` : ``}` +
            `${eventEndTime != undefined ? `&endDate=${eventEndTime}` : ``}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });

    return overlappingEventHandle;

}

