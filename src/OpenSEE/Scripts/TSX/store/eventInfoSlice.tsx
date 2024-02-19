//******************************************************************************************************
//  settingSlice.tsx - Gbtc
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
//  1/23/2024 - Preston Crawford
//       Refactored event info slice
//
//******************************************************************************************************


import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { OpenSee } from '../global';
declare var homePath: string;


export const LoadEventInfo = createAsyncThunk("EventInfo/setEventInfo", async (arg: { breakeroperation: string }, thunkAPI) => {
    let state = (thunkAPI.getState() as OpenSee.IRootState);
    const eventID = state.EventInfo.EventID;
    if (eventID && !isNaN(eventID) && eventID !== 0) {
        const data = await $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHeaderData?eventId=${eventID}${arg.breakeroperation != undefined ? "&breakeroperation=" + arg.breakeroperation : ""}`,
            dataType: 'json',
            cache: true,
            async: true
        })
        return data
    }

})

export const LoadLookupInfo = createAsyncThunk("EventInfo/setLookupInfo", async (_, thunkAPI) => {
    let state = (thunkAPI.getState() as OpenSee.IRootState);
    const eventID = state.EventInfo.EventID;
    if (eventID && !isNaN(eventID) && eventID !== 0) {

        const data = await $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetNavData?eventId=${eventID}`,
            dataType: 'json',
            cache: true,
            async: true
        })
        return data
    }
})

const EventInfoReducer = createSlice({
    name: "EventInfo",
    initialState: {
        EventInfo: null,
        LookupInfo: null,
        State: 'Idle',
        EventID: 1,
    } as OpenSee.IEventStore,
    reducers: {
        SetEventID: (state, action: PayloadAction<number>) => {
            state.EventID = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(LoadEventInfo.pending, (state, action) => {
            state.State = 'Loading'
        });
        builder.addCase(LoadEventInfo.rejected, (state, action) => {
            state.State = 'Error'
        });
        builder.addCase(LoadEventInfo.fulfilled, (state, action) => {
            state.EventInfo = action.payload
            state.State = 'Idle'
        })
        builder.addCase(LoadLookupInfo.fulfilled, (state, action) => {
            state.LookupInfo = action.payload
        })
    }
})

export const SelectEventInfo = (state: OpenSee.IRootState) => state.EventInfo.EventInfo
export const SelectLookupInfo = (state: OpenSee.IRootState) => state.EventInfo.LookupInfo
export const SelectEventID = (state: OpenSee.IRootState) => state.EventInfo.EventID

export const { SetEventID } = EventInfoReducer.actions;

export default EventInfoReducer.reducer