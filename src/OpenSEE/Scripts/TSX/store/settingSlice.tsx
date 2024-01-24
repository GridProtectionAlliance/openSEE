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
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import _ from 'lodash';
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
    } as OpenSee.ISettingsState,
    reducers: {
        LoadSettings: (state) => {
            let preserved = GetSettings();
            if (preserved != undefined)
            {
                state.Units = preserved.Units;
                state.Colors = preserved.Colors;
                state.TimeUnit = preserved.TimeUnit;
                state.SinglePlot = false;
                state.DefaultTrace = preserved.DefaultTrace;
                state.DefaultVType = preserved.DefaultVType;
            }
            else {
                state.Units = defaultSettings.Units;
                state.Colors = defaultSettings.Colors;
                state.TimeUnit = defaultSettings.TimeUnit;
                state.SinglePlot = false;
                state.DefaultTrace = defaultSettings.DefaultTrace;
                state.DefaultVType = defaultSettings.DefaultVType;
            }
            return state
        },
        SetColor: (state, action: PayloadAction<{ color: OpenSee.Color, value: string }>) => {
            state.Colors[action.payload.color] = action.payload.value
            SaveSettings(state);
        },
        SetUnit: (state, action: PayloadAction<{ unit: OpenSee.Unit, value: number }>) => {
            state.Units[action.payload.unit].current = action.payload.value
            SaveSettings(state);
        },
        SetTimeUnit: (state, action: PayloadAction<number>) => {
            state.TimeUnit.current = action.payload
            SaveSettings(state);
        },
        SetSinglePlot: (state, action: PayloadAction<boolean>) => {
            state.SinglePlot = false;
            SaveSettings(state);
        },
        SetTab: (state, action: PayloadAction<OpenSee.Tab>) => {
            state.Tab = action.payload;
        },
        SetDefaultTrace: (state, action: PayloadAction<OpenSee.IDefaultTrace>) => {
            state.DefaultTrace = action.payload;
            SaveSettings(state);
        },
        SetDefaultVType: (state, action: PayloadAction<'L-L' | 'L-N'>) => {
            state.DefaultVType = action.payload;
            SaveSettings(state);
        }
    },
    extraReducers: (builder) => {
    }

});

export const {
    LoadSettings, SetColor, SetUnit,
    SetTimeUnit, SetSinglePlot,
    SetTab, SetDefaultTrace, SetDefaultVType
} = SettingsReducer.actions;
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
function SaveSettings(state: OpenSee.ISettingsState) {
    try {
        let saveState = {
            Units: state.Units,
            Colors: state.Colors,
            TimeUnit: {
                current: state.TimeUnit.current
            },
            SinglePlot: false,
            DefaultTrace: state.DefaultTrace,
            DefaultVType: state.DefaultVType
        }
        const serializedState = JSON.stringify(saveState);
        localStorage.setItem('openSee.Settings', serializedState);
    } catch {
        // ignore write errors
    }
}
function GetSettings(): OpenSee.ISettingsState {
    try {
        const serializedState = localStorage.getItem('openSee.Settings');
        if (serializedState === null) {
            return undefined;
        }
        // overwrite options if new options are available
        let state: OpenSee.ISettingsState = JSON.parse(serializedState);

        // For Unit (Time and regular) only grab current Unit
        Object.keys(defaultSettings.Units).forEach((key) => {
            const unitValid =
                state.Units[key] != undefined &&
                state.Units[key].current >= 0 &&
                state.Units[key].current < defaultSettings.Units[key].options.length;

            state.Units[key] = { ...defaultSettings.Units[key], current: unitValid ? state.Units[key].current : defaultSettings.Units[key].current };
        });

        const timeUnitValid =
            state.TimeUnit != undefined &&
            state.TimeUnit.current >= 0 &&
            state.TimeUnit.current < defaultSettings.TimeUnit.options.length;

        state.TimeUnit = { ...defaultSettings.TimeUnit, current: timeUnitValid ? state.TimeUnit.current : defaultSettings.TimeUnit.current };

        Object.keys(defaultSettings.Colors).forEach((key) => {
            if (state.Colors[key] == undefined)
                state.Colors[key] = defaultSettings.Colors[key];
        });

        if (state.DefaultTrace == undefined)
            state.DefaultTrace = defaultSettings.DefaultTrace
        if (state.DefaultVType == undefined)
            state.DefaultVType = defaultSettings.DefaultVType as "L-L" | 'L-N';
        return state;
    } catch (err) {
        return undefined;
    }
}
// #endregion

