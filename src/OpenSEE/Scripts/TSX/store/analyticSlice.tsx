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

// #region [ Thunks ]
// Because this needs to dispatch the GetData from dataSlice all of these are Thunks
export const SetHarmonic = createAsyncThunk('Analytic/SetHarmonic', (arg: number, thunkAPI) => {
    thunkAPI.dispatch(AnalyticReducer.actions.updateHarmonic(arg));
    thunkAPI.dispatch(UpdateAnalyticPlot());
    return Promise.resolve();
})

export const SetHPF = createAsyncThunk('Analytic/SetHPF', (arg: number, thunkAPI) => {
    thunkAPI.dispatch(AnalyticReducer.actions.updateHPF(arg));
    thunkAPI.dispatch(UpdateAnalyticPlot());
    return Promise.resolve();
})
export const SetLPF = createAsyncThunk('Analytic/SetLPF', (arg: number, thunkAPI) => {
    thunkAPI.dispatch(AnalyticReducer.actions.updateLPF(arg));
    thunkAPI.dispatch(UpdateAnalyticPlot());
    return Promise.resolve();
})
export const SetTrc = createAsyncThunk('Analytic/SetTrc', (arg: number, thunkAPI) => {
    thunkAPI.dispatch(AnalyticReducer.actions.updateTrc(arg));
    thunkAPI.dispatch(UpdateAnalyticPlot());
    return Promise.resolve();
})

export const SetFFTWindow = createAsyncThunk('Analytic/SetFFTWindow', (arg: { startTime: number, cycle: number }, thunkAPI) => {
    thunkAPI.dispatch(AnalyticReducer.actions.updateFFTWindow(arg));
    thunkAPI.dispatch(UpdateAnalyticPlot());
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
    } as OpenSee.IAnalyticStore,
    reducers: {
        updateHarmonic: (state, action: PayloadAction<number>) => {
            state.Harmonic = action.payload;
            return state;
        },
        updateLPF: (state, action: PayloadAction<number>) => {
            state.LPFOrder = action.payload;
            return state;
        },
        updateHPF: (state, action: PayloadAction<number>) => {
            state.HPFOrder = action.payload;
            return state;
        },
        updateTrc: (state, action: PayloadAction<number>) => {
            state.Trc = action.payload;
            return state;
        },
        updateFFTWindow: (state, action: PayloadAction<{ startTime: number, cycle: number }>) => {
            state.FFTStartTime = action.payload.startTime;
            state.FFTCycles = action.payload.cycle;
            return state;
        },
    },
    extraReducers: (builder) => {


    }

});

export const { } = AnalyticReducer.actions;
export default AnalyticReducer.reducer;

// #endregion

// #region [ Selectors ]
export const selectHarmonic = (state: OpenSee.IRootState) => state.Analytic.Harmonic;
export const selectTRC = (state: OpenSee.IRootState) => state.Analytic.Trc;
export const selectLPF = (state: OpenSee.IRootState) => state.Analytic.LPFOrder;
export const selectHPF = (state: OpenSee.IRootState) => state.Analytic.HPFOrder;
export const selectCycles = (state: OpenSee.IRootState) => state.Analytic.FFTCycles;
export const selectFFTWindow = createSelector((state: OpenSee.IRootState) => state.Analytic.FFTCycles, (state: OpenSee.IRootState) => state.Analytic.FFTStartTime,
    (cycle, startTime) => {
        return [startTime, startTime + (cycle * 1 / 60.0 * 1000.0)]
    });

export const selectShowFFTWindow = createSelector((state: OpenSee.IRootState) => state.Data.Analytic, (analytic) => analytic == "FFT");

export const selectAnalyticOptions = (key: OpenSee.graphType) => {
    return createSelector(
        (state: OpenSee.IRootState) => state.Analytic.Harmonic,
        (state: OpenSee.IRootState) => state.Analytic.LPFOrder,
        (state: OpenSee.IRootState) => state.Analytic.HPFOrder,
        (state: OpenSee.IRootState) => state.Analytic.Trc,
        (state: OpenSee.IRootState) => state.Analytic.FFTStartTime,
        (state: OpenSee.IRootState) => state.Analytic.FFTCycles,
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
