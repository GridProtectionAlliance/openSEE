//******************************************************************************************************
//  analyticSlice.tsx - Gbtc
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
import _ from 'lodash';
import { createSelector } from 'reselect'
import { UpdateAnalyticPlot } from './dataSlice';
import { RootState } from './store';

interface IAnalyticSettings {
    Harmonic?: number,
    LPFOrder?: number,
    HPFOrder?: number,
    Trc?: number,
    FFTCycles?: number,
}
// #region [ Thunks ]

export const SetAnalytic = createAsyncThunk('Analytic/SetAnalytic',
    async (arg: OpenSee.Analytic, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    return thunkAPI.dispatch(UpdateAnalyticPlot(
        {
            eventID: state.EventInfo.EventID,
            analyticStore: state.Analytic
        }));
})

export const SetAnalyticSettings = createAsyncThunk('Analytic/SetAnalyticSettings',
    async (arg: IAnalyticSettings, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        return thunkAPI.dispatch(UpdateAnalyticPlot(
            {
                eventID: state.EventInfo.EventID,
                analyticStore: state.Analytic
            }));
})

export const SetFFTWindow = createAsyncThunk('Analytic/SetFFTWindow',
    async (arg: { startTime: number, cycle: number }, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        if (state.Analytic.Analytic === 'FFT')
            return thunkAPI.dispatch(UpdateAnalyticPlot(
                {
                    eventID: state.EventInfo.EventID,
                  analyticStore: state.Analytic
                }));
        return Promise.resolve();
})

// #endregion

export const AnalyticReducer = createSlice({
    name: 'Analytic',
    initialState: {
        Harmonic: 1,
        LPFOrder: 2,
        HPFOrder: 2,
        Trc: 500,
        FFTCycles: 1,
        FFTStartTime: 0,
        Analytic: 'none'
    } as OpenSee.IAnalyticStore,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(SetAnalytic.pending, (state, action) => {
            state.Analytic = action.meta.arg;
        });
        builder.addCase(SetAnalyticSettings.pending, (state, action) => {
            if (action.meta.arg.Harmonic !== undefined)
                state.Harmonic = action.meta.arg.Harmonic;
            if (action.meta.arg.HPFOrder !== undefined)
                state.HPFOrder = action.meta.arg.HPFOrder;
            if (action.meta.arg.LPFOrder !== undefined)
                state.LPFOrder = action.meta.arg.LPFOrder;
            if (action.meta.arg.Trc !== undefined)
                state.Trc = action.meta.arg.Trc;
            if (action.meta.arg.FFTCycles !== undefined)
                state.FFTCycles = action.meta.arg.FFTCycles;
        }); 
        builder.addCase(SetFFTWindow.pending, (state, action) => {
            state.FFTCycles = action.meta.arg.cycle;
            state.FFTStartTime = action.meta.arg.startTime;
        });
    }
});

export const { } = AnalyticReducer.actions;
export default AnalyticReducer.reducer;

// #endregion

// #region [ Selectors ]
export const selectHarmonic = (state: RootState) => state.Analytic.Harmonic;
export const selectTRC = (state: RootState) => state.Analytic.Trc;
export const selectLPF = (state: RootState) => state.Analytic.LPFOrder;
export const selectHPF = (state: RootState) => state.Analytic.HPFOrder;
export const selectCycles = (state: RootState) => state.Analytic.FFTCycles;

export const selectFFTWindow = createSelector(
    (state: RootState) => state.Analytic.FFTCycles,
    (state: RootState) => state.Analytic.FFTStartTime,
    (cycle, startTime) => ([startTime, startTime + (cycle * 1 / 60.0 * 1000.0)] as [number, number])
    );

export const selectAnalyticOptions = (key: OpenSee.graphType) => {
    return createSelector(
        (state: RootState) => state.Analytic.Harmonic,
        (state: RootState) => state.Analytic.LPFOrder,
        (state: RootState) => state.Analytic.HPFOrder,
        (state: RootState) => state.Analytic.Trc,
        (state: RootState) => state.Analytic.FFTStartTime,
        (state: RootState) => state.Analytic.FFTCycles,
        (harmonic, lpf, hpf, Trc, fftStart, fftCycle) => {
            if (key == 'LowPassFilter')
                return [lpf];
            if (key == 'HighPassFilter')
                return [hpf];
            if (key == 'Harmonic')
                return [harmonic];
            if (key == 'Rectifier')
                return [Trc];
            if (key == 'FFT')
                return [fftCycle, fftStart];
            return [];
        });
}

// #endregion

// #region [ Async Functions ]

// #endregion
