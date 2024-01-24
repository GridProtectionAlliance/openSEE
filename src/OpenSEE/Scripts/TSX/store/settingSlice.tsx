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
//  11/01/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import * as _ from 'lodash';
import { defaultSettings } from '../defaults';
import { createSelector } from 'reselect';
import * as queryString from "query-string";
import { RootState } from './store';
import { AddSingleOverlappingPlot, RemovePlot, SelectAllPlotKeys } from './dataSlice'

export const plotTypes = ["Voltage", "Current", "TripCoil", "Digitals", "Analogs", 'FirstDerivative', 'ClippedWaveforms', 'Frequency',
    'HighPassFilter', 'LowPassFilter', 'MissingVoltage', 'OverlappingWave', 'Power', 'Impedance', 'Rectifier', 'RapidVoltage', 'RemoveCurrent',
    'Harmonic', 'SymetricComp', 'THD', 'Unbalance', 'FaultDistance', 'Restrike', 'FFT'];

// Thunk To Enable All Overlapping events on a single plot
export const EnableSinglePlot = createAsyncThunk('Settings/enableSinglePlot', (arg: boolean, thunkAPI) => {
    const state = (thunkAPI.getState() as OpenSee.IRootState)
    thunkAPI.dispatch(SettingsReducer.actions.SetSinglePlot(arg))
    const singleOverlappingPlots = state.Data.Plots.filter(plot => plot.key.EventId === -1)

    if (arg) 
        state.Data.Plots.forEach(plot => thunkAPI.dispatch(AddSingleOverlappingPlot( plot.key))); 
    else 
        singleOverlappingPlots.forEach(plot =>  thunkAPI.dispatch(RemovePlot(plot.key)) )
    
    return Promise.resolve();
})

export const SettingsReducer = createSlice({
    name: 'Settings',
    initialState: {
        Units: {} as OpenSee.IUnitCollection<OpenSee.IUnitSetting>,
        Colors: {} as OpenSee.IColorCollection,
        TimeUnit: {} as OpenSee.IUnitSetting,
        DefaultTrace: { RMS: true, Ph: false, W: false, Pk: false },
        DefaultVType: "L-L",
        SinglePlot: true as boolean,
        Navigation: 'system'
    } as OpenSee.ISettingsState,
    reducers: {
        LoadSettings: (state) => {
            let preserved = getSettings();

            if (preserved) {
                state.Colors = preserved.Colors === undefined ? defaultSettings.Colors : preserved.Colors
                state.TimeUnit = preserved.TimeUnit === undefined ? defaultSettings.TimeUnit : preserved.TimeUnit;
                state.DefaultTrace = preserved.DefaultTrace === undefined ? defaultSettings.DefaultTrace : preserved.DefaultTrace;
                state.DefaultVType = preserved.DefaultVType === undefined ? defaultSettings.DefaultVType : preserved.DefaultVType;
                state.Navigation = preserved.Navigation === undefined ? defaultSettings.Navigation: preserved.Navigation;
                state.SinglePlot = preserved.SinglePlot === undefined ? defaultSettings.SinglePlot : preserved.SinglePlot;
            }
            else {
                state.Colors = defaultSettings.Colors;
                state.TimeUnit = defaultSettings.TimeUnit;
                state.SinglePlot = false;
                state.DefaultTrace = defaultSettings.DefaultTrace;
                state.DefaultVType = defaultSettings.DefaultVType;
                state.Navigation = "system";
            }

            return state
        },
        SetColor: (state, action: PayloadAction<{ color: OpenSee.Color, value: string }>) => {
            state.Colors[action.payload.color] = action.payload.value
            saveSettings(state);
        },
        SetTimeUnit: (state, action: PayloadAction<{ index: number, auto: boolean }>) => {
            state.TimeUnit.current = action.payload.index
            state.TimeUnit.autoUnit = action.payload.auto
            saveSettings(state);
        },
        SetSinglePlot: (state, action: PayloadAction<boolean>) => {
            state.SinglePlot = action.payload;
            saveSettings(state);
        },
        SetDefaultTrace: (state, action: PayloadAction<OpenSee.IDefaultTrace>) => {
            state.DefaultTrace = action.payload;
            saveSettings(state);
        },
        SetDefaultVType: (state, action: PayloadAction<'L-L' | 'L-N'>) => {
            state.DefaultVType = action.payload;
            SaveSettings(state);
        }
    },
        SetNavigation: (state, action: PayloadAction<OpenSee.EventNavigation>) => {
            state.Navigation = action.payload;
            saveSettings(state);
        },
    },
    extraReducers: (builder) => {
    }

});

export const { LoadSettings, SetColor, SetTimeUnit, SetDefaultTrace, SetDefaultVType, SetSinglePlot, SetNavigation } = SettingsReducer.actions;
export default SettingsReducer.reducer;

// #endregion

// #region [ Selectors ]
export const selectColor = (state: RootState) => state.Settings.Colors;
export const selectUnit = (state: RootState) => state.Settings.Units;

export const selectDefaultTraces = (state: RootState) => state.Settings.DefaultTrace;
export const selectVTypeDefault = (state: RootState) => state.Settings.DefaultVType;

export const SelectEnabledPlots = createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (state: OpenSee.IRootState) => SelectAllPlotKeys(state),
    (Plots, plotKeys) => {
        let enabledPlots: OpenSee.PlotQuery[] = [];

        if (plotKeys.length > 0)
            plotKeys.forEach(key => {
                const matchingPlot = Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId); 

                if (matchingPlot) {
                    const relevantUnits = matchingPlot.data.filter(data => data.Enabled)
                    const enabledUnits = _.uniqBy(relevantUnits, "Unit").map(data => data.Unit)
                    let yLimits = {}

                    Object.keys(matchingPlot.yLimits).forEach(key => {
                        if (enabledUnits.includes(key as OpenSee.Unit))
                            yLimits[key] = { ...matchingPlot.yLimits[key], autoUnit: matchingPlot.yLimits[key as OpenSee.Unit].isAuto };
                    })

                    enabledPlots.push({
                        yLimits: yLimits as OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
                        isZoomed: matchingPlot.isZoomed,
                        key: matchingPlot.key
    });
                }
            });

        return enabledPlots;
    }
);
      

export const SelectQueryString = createSelector(
    (state: OpenSee.IRootState) => state.Data,
    (state: OpenSee.IRootState) => state.Analytic,
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.OverlappingEvents,
    (state: OpenSee.IRootState) => SelectAllPlotKeys(state),
    (state: OpenSee.IRootState) => state.Settings.SinglePlot,
    (data, analyticInfo, evtID, overLappingEvents, plotKeys, singlePlot) => {
        let plotQuery: OpenSee.PlotQuery[] = [];
        if(plotKeys.length > 0)
            plotKeys.forEach(key => {
                const matchingPlot = data.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId); 

                if (matchingPlot) {
                    const relevantUnits = matchingPlot.data.filter(data => data.Enabled)
                    const enabledUnits = _.uniqBy(relevantUnits, "Unit").map(data => data.Unit)
                    let yLimits = {}

                    Object.keys(matchingPlot.yLimits).forEach(key => {
                        if (enabledUnits.includes(key as OpenSee.Unit))
                            yLimits[key] = { ...matchingPlot.yLimits[key], autoUnit: matchingPlot.yLimits[key as OpenSee.Unit].isAuto };
                    })

                    plotQuery.push({
                        yLimits: yLimits as OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
                        isZoomed: matchingPlot.isZoomed,
                        key: matchingPlot.key
    });
                }
            });

        const queryObj = {
            eventID: evtID,
            startTime: data.startTime,
            endTime: data.endTime,
            Trc: analyticInfo.Trc,
            HPFOrder: analyticInfo.HPFOrder,
            LPFOrder: analyticInfo.LPFOrder,
            FFTCycles: analyticInfo.FFTCycles,
            FFTStartTime: analyticInfo.FFTStartTime,
            Harmonic: analyticInfo.Harmonic,
            plots: JSON.stringify(plotQuery),
            overlappingInfo: JSON.stringify(overLappingEvents.EventList),
            singlePlot: singlePlot
        }

        const query = queryString.stringify(queryObj)

        return query
        }
);

        return queryString.stringify(obj, { encode: false });
    });

export const selectQueryString = createSelector(
    selectSettingQuery, selectDataQuery, selectEventQuery,
    selectAnalyticQuery,
    (settingsQuery, dataQuery, eventQuery, analyticQuery) => {
        return settingsQuery + '&' + dataQuery + '&' + eventQuery + '&' + analyticQuery;
})

// #endregion

// #region [ Async Functions ]
function saveSettings(state: OpenSee.ISettingsState) {
    const currentSettings = JSON.parse(localStorage.getItem("openSee.Settings"))
    const units = currentSettings?.Units
    try {
        let saveState = {
            Units: units,
            Colors: state.Colors,
            TimeUnit: state.TimeUnit,
            DefaultTrace: state.DefaultTrace,
            DefaultVType: state.DefaultVType,
            Navigation: state.Navigation,
            SinglePlot: state.SinglePlot
        }
        const serializedState = JSON.stringify(saveState);
        localStorage.setItem('openSee.Settings', serializedState);
    } catch {
        // ignore write errors
    }
}

function getSettings(): OpenSee.ISettingsState {
    try {
        const serializedState = localStorage.getItem('openSee.Settings');
        if (serializedState === null) {
            return undefined;
        }

        // overwrite options if new options are available
        let storageState: OpenSee.ISettingsState = JSON.parse(serializedState);

        const timeUnitValid =
            storageState.TimeUnit !== undefined &&
            storageState.TimeUnit.current >= 0 &&
            storageState.TimeUnit.current < defaultSettings.TimeUnit.options.length;

        storageState.TimeUnit = { ...defaultSettings.TimeUnit, current: timeUnitValid ? storageState.TimeUnit.current : defaultSettings.TimeUnit.current };

        Object.keys(defaultSettings.Colors).forEach((key) => {
            if (storageState.Colors[key] === undefined)
                storageState.Colors[key] = defaultSettings.Colors[key];
        });

        if (storageState.DefaultTrace === undefined)
            storageState.DefaultTrace = defaultSettings.DefaultTrace

        if (storageState.DefaultVType === undefined)
            storageState.DefaultVType = defaultSettings.DefaultVType;

        if (storageState.SinglePlot === undefined)
            storageState.SinglePlot = defaultSettings.SinglePlot

        if (storageState.Navigation === undefined)
            storageState.Navigation = defaultSettings.Navigation;
        return storageState;
    } catch (err) {
        return undefined;
    }
}
// #endregion

