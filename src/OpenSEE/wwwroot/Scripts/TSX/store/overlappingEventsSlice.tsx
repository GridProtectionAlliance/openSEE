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
import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import * as _ from 'lodash';
import { AddPlot, RemovePlot } from './dataSlice';
import { CancelEvent } from './RequestHandler';


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



export const OverlappingEventReducer = ({
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
});
