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

export const SettingsReducer = createSlice({
    name: 'Settings',
    initialState: {
        Units: {} as OpenSee.IUnitCollection<OpenSee.IUnitSetting>,
        Colors: {} as OpenSee.IColorCollection,
        TimeUnit: {} as OpenSee.IUnitSetting,
        SinglePlot: true as boolean,
        displayVolt: true as boolean,
        displayCur: true as boolean,
        displayTCE: false as boolean,
        displayDigitals: false as boolean,
        displayAnalogs: false as boolean,
        Tab: 'Info' as OpenSee.Tab,
        Navigation: 'system' as OpenSee.EventNavigation,
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
        SetdisplayVolt: (state, action: PayloadAction<boolean>) => {
            state.displayVolt = action.payload;
        },
        SetdisplayCur: (state, action: PayloadAction<boolean>) => {
            state.displayCur = action.payload;
        }, 
        SetdisplayTCE: (state, action: PayloadAction<boolean>) => {
            state.displayTCE = action.payload;
        }, 
        SetdisplayDigitals: (state, action: PayloadAction<boolean>) => {
            state.displayDigitals = action.payload;
        },
        SetdisplayAnalogs: (state, action: PayloadAction<boolean>) => {
            state.displayAnalogs = action.payload;
        },
        SetTab: (state, action: PayloadAction<OpenSee.Tab>) => {
            state.Tab = action.payload;
        },
        SetNavigation: (state, action: PayloadAction<OpenSee.EventNavigation>) => {
            state.Navigation = action.payload;
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

export const { LoadSettings, SetColor, SetUnit, SetTimeUnit, SetSinglePlot,
    SetdisplayAnalogs, SetdisplayCur, SetdisplayDigitals, SetdisplayTCE, SetdisplayVolt,
    SetNavigation, SetTab, SetDefaultTrace, SetDefaultVType
} = SettingsReducer.actions;
export default SettingsReducer.reducer;

// #endregion

// #region [ Selectors ]
export const selectColor = (state: OpenSee.IRootState) => state.Settings.Colors;
export const selectUnit = (state: OpenSee.IRootState) => state.Settings.Units;

export const selectdefaultTraces = (state: OpenSee.IRootState) => state.Settings.DefaultTrace;
export const selectVTypeDefault = (state: OpenSee.IRootState) => state.Settings.DefaultVType;

export const selectActiveUnit = (key: OpenSee.IGraphProps) => createSelector(
    selectUnit,
    (state: OpenSee.IRootState) => state.Data.plotKeys,
    (state: OpenSee.IRootState) => state.Data.activeUnits,
    (state: OpenSee.IRootState) => false,
    (baseUnits, data, activeUnits, singlePlot) => {
        let result = {};
        let index = data.findIndex(item => item.DataType == key.DataType && item.EventId == key.EventId);
        if (index == -1)
            return null;

        if (!singlePlot)
            Object.keys(baseUnits).forEach(u => result[u] = baseUnits[u].options[activeUnits[index][u]]);
        else {
            let actives = activeUnits.filter((v, i) => data[i].DataType == key.DataType);
            Object.keys(baseUnits).forEach(u => result[u] = baseUnits[u].options[CombineUnits(actives.map(i => i[u]), baseUnits[u])]);
        }
           
        return result
    }
);


export const selectTimeUnit = (state: OpenSee.IRootState) => state.Settings.TimeUnit;
export const selectEventOverlay = (state: OpenSee.IRootState) => state.Settings.SinglePlot
export const SelectdisplayVolt = (state: OpenSee.IRootState) => state.Settings.displayVolt
export const SelectdisplayCur = (state: OpenSee.IRootState) => state.Settings.displayCur
export const SelectdisplayTCE = (state: OpenSee.IRootState) => state.Settings.displayTCE
export const SelectdisplayDigitals = (state: OpenSee.IRootState) => state.Settings.displayDigitals
export const SelectdisplayAnalogs = (state: OpenSee.IRootState) => state.Settings.displayAnalogs

export const SelectTab = (state: OpenSee.IRootState) => state.Settings.Tab;
export const SelectNavigation = (state: OpenSee.IRootState) => state.Settings.Navigation;

const SelectSettingQuery = createSelector(SelectdisplayVolt, SelectdisplayCur, SelectdisplayTCE, SelectdisplayDigitals, SelectdisplayAnalogs,
    SelectTab, SelectNavigation,
    (displayVolt, displayCur, displayTCE, displayDigitals, displayAnalogs, tab, navigation) => {
        let obj = {
            displayVolt: displayVolt, displayCur: displayCur, displayTCE: displayTCE, displayDigitals: displayDigitals, displayAnalogs: displayAnalogs,
            Tab: tab, Navigation: navigation
        };
        return queryString.stringify(obj, { encode: false });
    });

const SelectDataQuery = createSelector(
    (state: OpenSee.IRootState) => state.Data.startTime,
    (state: OpenSee.IRootState) => state.Data.endTime,
    (state: OpenSee.IRootState) => state.Data.eventID,
    (state: OpenSee.IRootState) => state.Data.mouseMode,
    (state: OpenSee.IRootState) => state.Data.zoomMode,
    (state: OpenSee.IRootState) => state.Data.Analytic,
    SelectTab,
    (startTime, endTime, eventID, mouseMode, zoomMode, Analytic, tab) => {
        let obj = {
            startTime: startTime, endTime: endTime, eventID: eventID, mouseMode: mouseMode, zoomMode: zoomMode
        };
        if (tab == 'Analytic')
            obj['Analytic'] = Analytic;

        return queryString.stringify(obj, { encode: false });
    });

export const SelectQueryString = createSelector(SelectSettingQuery, SelectDataQuery, (settingsQuery, dataQuery) => {
    return settingsQuery + '&' + dataQuery;
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

// #region [Helper Functions ]
function CombineUnits(units: number[], baseUnit: OpenSee.IUnitSetting): number {
    if (baseUnit.options[baseUnit.current] == undefined || baseUnit.options[baseUnit.current].short != 'auto')
        return units[0];
    // In that case we pick that with the smallest Factor
    let f = Math.min(...units.map(b => baseUnit.options[b]).filter(u => u.short != 'auto' && u.short != 'pu' && u.short != 'pu/s').map(u => u.factor));

    return units.find(b => baseUnit.options[b].factor == f);
}

// #endregion