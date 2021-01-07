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
//******************************************************************************************************
import { createAsyncThunk} from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import _ from 'lodash';
import * as queryString from "query-string";
import { AddPlot, RemovePlot } from './dataSlice';
import { SetdisplayAnalogs, SetdisplayCur, SetdisplayDigitals, SetdisplayTCE, SetdisplayVolt, SetNavigation, SetTab } from './settingSlice';


// #region [ Thunks ]

export const updatedURL = createAsyncThunk('Settings/newURL', (arg: { query: string, initial: boolean }, { getState, dispatch }) => {

    let query = queryString.parse(arg.query);
    let oldState = getState() as OpenSee.IRootState;

    
    // Start with Settings Query

    //set Defaults
    query.displayVolt = (query.displayVolt == undefined ? 'true' : query.displayVolt);
    query.displayCur = (query.displayCur == undefined ? 'true' : query.displayCur);
    query.displayTCE = (query.displayTCE == undefined ? 'false' : query.displayTCE);
    query.displayDigitals = (query.displayDigitals == undefined ? 'false' : query.displayDigitals);
    query.displayAnalogs = (query.displayAnalogs == undefined ? 'false' : query.displayAnalogs);
    query.Tab = (query.Tab == undefined ? 'Info' : query.Tab);
    query.Navigation = (query.Navigation == undefined ? 'system' : query.Navigation);

    if (ToBool(query.displayVolt) != oldState.Settings.displayVolt || arg.initial) {
        if (!ToBool(query.displayVolt))
            dispatch(RemovePlot({ DataType: "Voltage", EventId: oldState.Data.eventID }))
        else
            dispatch(AddPlot({ DataType: "Voltage", EventId: oldState.Data.eventID }))
        dispatch(SetdisplayVolt(ToBool(query.displayVolt)));
    }

    if (ToBool(query.displayCur) != oldState.Settings.displayCur || arg.initial) {
        if (!ToBool(query.displayCur))
            dispatch(RemovePlot({ DataType: "Current", EventId: oldState.Data.eventID }))
        else
            dispatch(AddPlot({ DataType: "Current", EventId: oldState.Data.eventID }))
        dispatch(SetdisplayCur(ToBool(query.displayCur)));
    }
    if (ToBool(query.displayAnalogs) != oldState.Settings.displayAnalogs || arg.initial) {
        if (!ToBool(query.displayAnalogs))
            dispatch(RemovePlot({ DataType: 'Analogs', EventId: oldState.Data.eventID }))
        else
            dispatch(AddPlot({ DataType: "Analogs", EventId: oldState.Data.eventID }))
        dispatch(SetdisplayAnalogs(ToBool(query.displayAnalogs)));
    }
    if (ToBool(query.displayDigitals) != oldState.Settings.displayDigitals || arg.initial) {
        if (!ToBool(query.displayDigitals))
            dispatch(RemovePlot({ DataType: 'Digitals', EventId: oldState.Data.eventID }))
        else
            dispatch(AddPlot({ DataType: "Digitals", EventId: oldState.Data.eventID }))
        dispatch(SetdisplayDigitals(ToBool(query.displayDigitals)))
    }
    if (ToBool(query.displayTCE) != oldState.Settings.displayTCE || arg.initial) {
        if (!ToBool(query.displayTCE))
            dispatch(RemovePlot({ DataType: 'TripCoil', EventId: oldState.Data.eventID }))
        else
            dispatch(AddPlot({ DataType: "TripCoil", EventId: oldState.Data.eventID }))
        dispatch(SetdisplayTCE(ToBool(query.displayTCE)));
    }
    if (query.Navigation != oldState.Settings.Navigation)
        dispatch(SetNavigation(query.Navigation as OpenSee.EventNavigation))
    if (query.Tab != oldState.Settings.Tab)
        dispatch(SetTab(query.Tab as OpenSee.Tab))
   
    // Data Query

    // Compare Query - special case sicne the selected events depend on loading everything
   
})

function ToBool(arg) {
    if (arg == undefined)
        return undefined;
    if (arg == "True" || arg == "true" || arg == "1")
        return true;
    if (arg == "False" || arg == "false" || arg == "0")
        return false;
    return undefined;
}