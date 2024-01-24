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
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import * as _ from 'lodash';
import { createSelector } from 'reselect'
import { RootState } from './store';
import { UpdateAnalyticPlot } from './dataSlice'

// #region [ Thunks ]

export const UpdateAnalytic = createAsyncThunk('Analytic/updateAnalytic', async (arg: { settings: OpenSee.IAnalyticStore, key?: OpenSee.IGraphProps }, thunkAPI) => {
    if(arg.key)
        thunkAPI.dispatch(UpdateAnalyticPlot({ key: arg.key }));
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
        FFTStartTime: 0
    } as OpenSee.IAnalyticStore,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(UpdateAnalytic.pending, (state, action) => {
            if (action.meta.arg.settings.Harmonic !== undefined)
                state.Harmonic = action.meta.arg.settings.Harmonic;
            if (action.meta.arg.settings.HPFOrder !== undefined)
                state.HPFOrder = action.meta.arg.settings.HPFOrder;
            if (action.meta.arg.settings.LPFOrder !== undefined)
                state.LPFOrder = action.meta.arg.settings.LPFOrder;
            if (action.meta.arg.settings.Trc !== undefined)
                state.Trc = action.meta.arg.settings.Trc;
            if (action.meta.arg.settings.FFTCycles !== undefined)
                state.FFTCycles = action.meta.arg.settings.FFTCycles;
            if (action.meta.arg.settings.FFTStartTime !== undefined)
                state.FFTStartTime = action.meta.arg.settings.FFTStartTime;
        });
    }
});

export const {} = AnalyticReducer.actions;
export default AnalyticReducer.reducer;

// #endregion

// #region [ Selectors ]
export const SelectHarmonic = (state: RootState) => state.Analytic.Harmonic;
export const SelectTRC = (state: RootState) => state.Analytic.Trc;
export const SelectLPF = (state: RootState) => state.Analytic.LPFOrder;
export const SelectHPF = (state: RootState) => state.Analytic.HPFOrder;
export const SelectCycles = (state: RootState) => state.Analytic.FFTCycles;
export const SelectAnalytics = (state: RootState) => state.Analytic;


export const SelectFFTWindow = createSelector(
    (state: RootState) => state.Analytic.FFTCycles,
    (state: RootState) => state.Analytic.FFTStartTime,
    (cycle, startTime) => ([startTime, startTime + (cycle * 1 / 60.0 * 1000.0)] as [number, number])
);

export const SelectAnalyticOptions = (key: OpenSee.graphType) => {
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

