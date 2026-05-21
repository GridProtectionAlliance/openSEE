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
import { defaultSettings, TimeUnitOptions } from '../defaults';
import { OpenSee } from '../global';
import { RootState } from './store';

export const plotTypes = [
    "Voltage", 
    "Current", 
    "TripCoil", 
    "Digitals", 
    "Analogs", 
    'FirstDerivative', 
    'ClippedWaveforms', 
    'Frequency',
    'HighPassFilter', 
    'LowPassFilter', 
    'MissingVoltage', 
    'OverlappingWave', 
    'Power', 
    'Impedance', 
    'Rectifier', 
    'RapidVoltage', 
    'RemoveCurrent',
    'Harmonic', 
    'SymetricComp', 
    'THD', 
    'Unbalance', 
    'FaultDistance', 
    'Restrike', 
    'FFT', 
    'I2T'
];

export const SettingsReducer = createSlice({
    name: 'Settings',
    initialState: {
        Colors: {} as OpenSee.IColorCollection,
        TimeUnit: {} as OpenSee.IUnitSetting,
        DefaultTrace: { RMS: true, Ph: false, W: false, Pk: false },
        DefaultVType: "L-L",
        SinglePlot: true,
        UseOverlappingTime: false, //flag to indicate whether to use the overlapping event's startTime or the original eventStartTime for overlapping plots
        Navigation: 'system',
        MouseMode: 'zoom' as OpenSee.MouseMode,
        ZoomMode: 'x' as OpenSee.ZoomMode,
        PlotMarkers: false, // field to indicate if user has inception and duration markers on
        OverlappingWaveTimeUnit: 0
    } as OpenSee.ISettingsState,
    reducers: {
        LoadSettings: (state) => {
            const preserved = getSettings();

            if (preserved) {
                state.Colors = preserved.Colors === undefined ? defaultSettings.Colors : preserved.Colors
                state.TimeUnit = preserved.TimeUnit === undefined ? defaultSettings.TimeUnit : preserved.TimeUnit;
                state.DefaultTrace = preserved.DefaultTrace === undefined ? defaultSettings.DefaultTrace : preserved.DefaultTrace;
                state.DefaultVType = preserved.DefaultVType === undefined ? defaultSettings.DefaultVType : preserved.DefaultVType;
                state.Navigation = preserved.Navigation === undefined ? defaultSettings.Navigation : preserved.Navigation;
                state.SinglePlot = preserved.SinglePlot === undefined ? defaultSettings.SinglePlot : preserved.SinglePlot;
                state.UseOverlappingTime = preserved.UseOverlappingTime === undefined ? defaultSettings.UseOverlappingTime : preserved.UseOverlappingTime;
                state.PlotMarkers = preserved.PlotMarkers === undefined ? defaultSettings.PlotMarkers : preserved.PlotMarkers;
                state.OverlappingWaveTimeUnit = preserved.OverlappingWaveTimeUnit === undefined ? defaultSettings.OverlappingWaveTimeUnit.current : preserved.OverlappingWaveTimeUnit
                state.MouseMode = preserved.MouseMode === undefined ? defaultSettings.MouseMode : preserved.MouseMode
                state.ZoomMode = preserved.ZoomMode === undefined ? defaultSettings.ZoomMode : preserved.ZoomMode
            }
            else {
                state.Colors = defaultSettings.Colors;
                state.TimeUnit = defaultSettings.TimeUnit;
                state.SinglePlot = defaultSettings.SinglePlot;
                state.DefaultTrace = defaultSettings.DefaultTrace;
                state.DefaultVType = defaultSettings.DefaultVType;
                state.Navigation = defaultSettings.Navigation;
                state.UseOverlappingTime = defaultSettings.UseOverlappingTime
                state.PlotMarkers = defaultSettings.PlotMarkers
                state.OverlappingWaveTimeUnit = defaultSettings.OverlappingWaveTimeUnit.current
                state.MouseMode = defaultSettings.MouseMode
                state.ZoomMode = defaultSettings.ZoomMode
            }

            return state
        },
        SetOverlappingWaveTimeUnit: (state, action: PayloadAction<number>) => {
            state.OverlappingWaveTimeUnit = action.payload
        },
        SetColor: (state, action: PayloadAction<{ color: OpenSee.Color, value: string }>) => {
            state.Colors[action.payload.color] = action.payload.value
            saveSettings(state);
        },
        SetTimeUnit: (state, action: PayloadAction<{ index: number }>) => {
            state.TimeUnit.current = action.payload.index

            if (TimeUnitOptions[action.payload.index].factor === undefined)
                state.TimeUnit.autoUnit = true
            else
                state.TimeUnit.autoUnit = false

            if (!TimeUnitOptions[action.payload.index].short.includes('since'))
                state.UseOverlappingTime = false

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
        SetDefaultVType: (state, action: PayloadAction<"L-L" | "L-N">) => {
            state.DefaultVType = action.payload;
            saveSettings(state);
        },
        SetNavigation: (state, action: PayloadAction<OpenSee.EventNavigation>) => {
            state.Navigation = action.payload;
            saveSettings(state);
        },
        SetPlotMarkers: (state, action: PayloadAction<boolean>) => {
            state.PlotMarkers = action.payload
            saveSettings(state);
        },
        SetUseOverlappingTime: (state, action: PayloadAction<boolean>) => {
            state.UseOverlappingTime = action.payload;
            saveSettings(state);
        },
        SetMouseMode: (state, action: PayloadAction<OpenSee.MouseMode>) => {
            state.MouseMode = action.payload
            saveSettings(state);
        },
        SetZoomMode: (state, action: PayloadAction<OpenSee.ZoomMode>) => {
            state.ZoomMode = action.payload
            if (state.MouseMode !== "zoom")
                state.MouseMode = "zoom"
            saveSettings(state);
        },
    }

});

export const { LoadSettings, SetColor, SetTimeUnit, SetDefaultTrace, SetDefaultVType, SetSinglePlot, SetNavigation, SetPlotMarkers, SetUseOverlappingTime, SetOverlappingWaveTimeUnit, SetMouseMode, SetZoomMode } = SettingsReducer.actions;
export default SettingsReducer.reducer;

// #endregion

// #region [ Selectors ]
export const SelectColor = (state: RootState) => state.Settings.Colors;
export const SelectDefaultTraces = (state: RootState) => state.Settings.DefaultTrace;
export const SelectVTypeDefault = (state: RootState) => state.Settings.DefaultVType;
export const SelectTimeUnit = (state: RootState) => state.Settings.TimeUnit;
export const SelectSinglePlot = (state: RootState) => state.Settings.SinglePlot;
export const SelectNavigation = (state: RootState) => state.Settings.Navigation;
export const SelectPlotMarkers = (state: RootState) => state.Settings.PlotMarkers;
export const SelectUseOverlappingTime = (state: RootState) => state.Settings.UseOverlappingTime;
export const SelectOverlappingWaveTimeUnit = (state: RootState) => state.Settings.OverlappingWaveTimeUnit;
export const SelectMouseMode = (state: OpenSee.IRootState) => state.Settings.MouseMode
export const SelectZoomMode = (state: OpenSee.IRootState) => state.Settings.ZoomMode
// #endregion

// #region [ Async Functions ]
function saveSettings(state: OpenSee.ISettingsState) {
    const settings = localStorage.getItem("openSee.Settings");
    const currentSettings = JSON.parse(settings ?? '{}');

    const units = currentSettings?.Units;

    try {
        const saveState = {
            Units: units,
            Colors: state.Colors,
            TimeUnit: state.TimeUnit,
            DefaultTrace: state.DefaultTrace,
            DefaultVType: state.DefaultVType,
            Navigation: state.Navigation,
            SinglePlot: state.SinglePlot,
            UseOverlappingTime: state.UseOverlappingTime,
            PlotMarkers: state.PlotMarkers,
            OverlappingWaveTimeUnit: state.OverlappingWaveTimeUnit,
            MouseMode: state.MouseMode,
            ZoomMode: state.ZoomMode
        }
        const serializedState = JSON.stringify(saveState);
        localStorage.setItem('openSee.Settings', serializedState);
    } catch {
        // ignore write errors
    }
}

function getSettings(): OpenSee.ISettingsState | undefined {
    try {
        const serializedState = localStorage.getItem('openSee.Settings');
        if (serializedState === null) 
            return undefined;
        
        // overwrite options if new options are available
        const storageState: OpenSee.ISettingsState = JSON.parse(serializedState);
        storageState.Colors = storageState.Colors ?? defaultSettings.Colors;

        const colorMigrations: Partial<Record<string, OpenSee.Color>> = {
            freqAll: 'All',
            VS0: 'VZero',
            VS1: 'VPos',
            VS2: 'VNeg',
            IS0: 'IZero',
            IS1: 'IPos',
            IS2: 'INeg',
            Pfa: 'PFa',
            Pfb: 'PFb',
            Pfc: 'PFc',
            Pft: 'PFt',
            faultDistSimple: 'Simple',
            faultDistReact: 'Reactance',
            faultDistTakagi: 'Takagi',
            faultDistModTakagi: 'ModifiedTakagi',
            faultDistNovosel: 'Novosel',
            faultDistDoubleEnd: 'DoubleEnded'
        };

        Object.keys(colorMigrations).forEach((oldKey) => {
            const newKey = colorMigrations[oldKey];
            if (newKey != null && storageState.Colors[newKey] === undefined && storageState.Colors[oldKey] !== undefined)
                storageState.Colors[newKey] = storageState.Colors[oldKey];
        });

        const timeUnitValid = storageState.TimeUnit !== undefined && storageState.TimeUnit.current >= 0 && storageState.TimeUnit.current < TimeUnitOptions.length;

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

        if (storageState.UseOverlappingTime === undefined)
            storageState.UseOverlappingTime === defaultSettings.UseOverlappingTime

        if (storageState.PlotMarkers === undefined)
            storageState.PlotMarkers === defaultSettings.PlotMarkers

        if (storageState.OverlappingWaveTimeUnit === undefined)
            storageState.OverlappingWaveTimeUnit === defaultSettings.OverlappingWaveTimeUnit.current

        if (storageState.MouseMode === undefined)
            storageState.MouseMode === defaultSettings.MouseMode

        if (storageState.ZoomMode === undefined)
            storageState.ZoomMode === defaultSettings.ZoomMode

        return storageState;
    } catch (err) {
        return undefined;
    }
}
// #endregion

