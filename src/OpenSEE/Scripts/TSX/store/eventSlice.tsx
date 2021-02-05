//******************************************************************************************************
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
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import _, { groupBy, uniq } from 'lodash';
import { createSelector } from 'reselect'
import { AddPlot, RemovePlot } from './dataSlice';
import { CancelCompare, CancelEvent } from './RequestHandler';

// #region [ Thunks ]
export const LoadOverlappingEvents = createAsyncThunk('Event/LoadOverlappingEvents', async (_, thunkAPI) => {

    let eventId = (thunkAPI.getState() as OpenSee.IRootState).Data.eventID

    let handle = getOverlappingEvents(eventId,null,null);

    return await handle;
})

export const EnableOverlappingEvent = createAsyncThunk('Event/EnableOverlappingEvent', (arg: number, thunkAPI) => {

    let state = (thunkAPI.getState() as OpenSee.IRootState)
    let index = state.Event.EventList.find(i => i == arg);
    if (index == -1)
        return;

    CancelEvent(arg);
    let plots = uniq(state.Data.plotKeys.map(item => item.DataType));

    if (state.Event.Selected[index])
        plots.forEach(item => thunkAPI.dispatch(RemovePlot({ DataType: item, EventId: arg })))
    else
        plots.forEach(item => thunkAPI.dispatch(AddPlot({ DataType: item, EventId: arg })))

    thunkAPI.dispatch(EventReducer.actions.updateEnabled(index));

    return;
})

export const ClearOverlappingEvent = createAsyncThunk('Event/ClearOverlappingEvent', (_, thunkAPI) => {

    
    let state = (thunkAPI.getState() as OpenSee.IRootState)
    CancelCompare(state.Data.eventID);
    let plots = uniq(state.Data.plotKeys.map(item => item.DataType));

    if (state.Event.Selected.some(i => i)) {
        state.Event.EventList.forEach((ev, index) => {
            if (!state.Event.Selected[index])
                return;
            plots.forEach(item => thunkAPI.dispatch(RemovePlot({ DataType: item, EventId: ev })))
            thunkAPI.dispatch(EventReducer.actions.updateEnabled(index));
        })

    }

    return;
})
// #endregion

export const EventReducer = createSlice({
    name: 'Event',
    initialState: {
        EventList: [],
        Selected: [],
        Label: [],
        Group: [],
        loadingOverlappingEvents: false,
    } as OpenSee.IEventStore,
    reducers: {
        updateEnabled: (state, action: PayloadAction<number>) => {
            state.Selected[action.payload] = !state.Selected[action.payload];
            return state;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(LoadOverlappingEvents.pending, (state, action) => {
            state.loadingOverlappingEvents = true;
            return state
        });
        builder.addCase(LoadOverlappingEvents.fulfilled, (state, action) => {
            state.loadingOverlappingEvents = false;
            state.EventList = action.payload.map(item => item.EventID);
            state.Group = action.payload.map(item => item.MeterName);
            state.Label = action.payload.map(item => item.AssetName);
            state.Selected = action.payload.map(item => false);
            return state
        });

    }

});

export const { } = EventReducer.actions;
export default EventReducer.reducer;

// #endregion

// #region [ Selectors ]
export const selectEventListLoading = (state: OpenSee.IRootState) => state.Event.loadingOverlappingEvents;

export const selectEventGroup = createSelector((state: OpenSee.IRootState) => state.Event,
    (eventSlice) => {
        let result: OpenSee.iListObject[] =
        eventSlice.EventList.map((item, index) => {
            return {
                group: eventSlice.Group[index],
                label: eventSlice.Label[index],
                value: item,
                selected: eventSlice.Selected[index],
            }
        })
        return groupBy(result, 'group');
    });

export const selecteventList = createSelector((state: OpenSee.IRootState) => state.Event,
    (eventSlice) => {
        let result: OpenSee.iListObject[] =
            eventSlice.EventList.map((item, index) => {
                return {
                    group: eventSlice.Group[index],
                    label: eventSlice.Label[index],
                    value: item,
                    selected: eventSlice.Selected[index],
                }
            })
        return result;
    });

export const selectNumberCompare = createSelector((state: OpenSee.IRootState) => state.Event, (state: OpenSee.IRootState) => state.Settings.SinglePlot, (eventSlice, singlePlot) => {
    if (singlePlot)
        return 0;
    return eventSlice.Selected.filter(i => i).length;
})
// #endregion

// #region [ Async Functions ]
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

// #endregion
