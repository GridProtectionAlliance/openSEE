//******************************************************************************************************
//  dataSlice.tsx - Gbtc
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
import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import * as _ from 'lodash';
import { SetTimeUnit as SetTimeUnitSetting, plotTypes } from './settingSlice';
import { AddRequest, AppendRequest, CancelAnalytics } from './RequestHandler';
import { emptygraph, getData, getDetailedData } from './GraphLogic';
import { RootState } from './store';
import { defaultSettings } from '../defaults';


declare var eventID: number;

// #region [ Thunks ]

//Thunk to Get Detailed Data
/*
const InitiateDetailed = createAsyncThunk('Data/InitiateDetailed', async (arg: OpenSee.IGraphProps, thunkAPI) => {
    AppendRequest(arg, getDetailedData(arg, (thunkAPI.getState() as OpenSee.IRootState).Analytic, (d,t) => { thunkAPI.dispatch(DataReducer.actions.AppendData()) }))
    return Promise.resolve();
});
*/

// Thunk To Add New Plot
export const AddPlot = createAsyncThunk('Data/addPlot', async (arg: { key: OpenSee.IGraphProps, yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, isZoomed?: boolean, fftLimits?: [number, number], cycleLimits?: [number, number] }, thunkAPI) => {
    let plot = (thunkAPI.getState() as RootState).Data.Plots.find(item => item.key.DataType == arg.key.DataType && item.key.EventId == arg.key.EventId)
    const state = (thunkAPI.getState() as OpenSee.IRootState)
    const singlePlot = state.Settings.SinglePlot

    if (plot === null || plot.loading !== 'Loading') {
        return Promise.resolve();
    }

    // Adding Data to the Plot
    let analyticOptions = (thunkAPI.getState() as OpenSee.IRootState).Analytic;

    let handles = getData(arg.key, analyticOptions, async data => {
        await thunkAPI.dispatch(DataReducer.actions.AppendData({ key: arg.key, data, defaultTraces: state.Settings.DefaultTrace, defaultV: state.Settings.DefaultVType, eventID: arg.key.EventId }));

        const updatedState = (thunkAPI.getState() as OpenSee.IRootState);
        const updatedPlot = updatedState.Data.Plots.find(item => item.key.DataType === arg.key.DataType && item.key.EventId === arg.key.EventId);
        const singleOverlappingPlot = updatedState.Data.Plots.find(item => item.key.DataType === arg.key.DataType && item.key.EventId === -1)


        //Only dispatch to the overlapping single plot after the first call to AppendData finishes and if it exists
        if (singlePlot) {
            if (singleOverlappingPlot)
                thunkAPI.dispatch(DataReducer.actions.AppendData({ key: { EventId: -1, DataType: arg.key.DataType }, data: _.cloneDeep(updatedPlot.data), defaultTraces: updatedState.Settings.DefaultTrace, defaultV: updatedState.Settings.DefaultVType, eventID: arg.key.EventId }));
            else
                thunkAPI.dispatch(AddSingleOverlappingPlot(arg.key));
        }

    });

    AddRequest(arg.key, handles);
    return await Promise.all(handles);
})

// Thunk To Remove Plot
export const RemovePlot = createAsyncThunk('Data/removePlot', async (arg: OpenSee.IGraphProps, thunkAPI) => {
    const state = (thunkAPI.getState() as OpenSee.IRootState)
    const singlePlot = state.Settings.SinglePlot
    const plotIndex = state.Data.Plots.findIndex(item => item.key.DataType == arg.DataType && item.key.EventId == arg.EventId)
    const plotData = state.Data.Plots[plotIndex].data

    if (plotIndex > -1) {
        thunkAPI.dispatch(DataReducer.actions.RemovePlot(plotIndex))

        //Remove data from the overlapping single plot if enabled
        if (singlePlot)
            thunkAPI.dispatch(DataReducer.actions.RemoveOverlappingData({ key: arg, data: _.cloneDeep(plotData) }))
    }

    return await Promise.resolve();
})

// Thunk To Add New Single Overlapping Plot
export const AddSingleOverlappingPlot = createAsyncThunk('Data/addOverlappingPlot', async (arg: OpenSee.IGraphProps, thunkAPI) => {
    const state = (thunkAPI.getState() as OpenSee.IRootState)
    const singleOverlappingPlot = state.Data.Plots.find(plot => plot.key.DataType === arg.DataType && plot.key.EventId === -1)
    const currentPlot = state.Data.Plots.find(plot => plot.key.DataType === arg.DataType && plot.key.EventId === arg.EventId)

    if (singleOverlappingPlot === null || singleOverlappingPlot.loading !== 'Loading')
            return Promise.resolve(); 

    // Adding Data with matching datatypes
    thunkAPI.dispatch(DataReducer.actions.AppendData({ key: { EventId: -1, DataType: currentPlot.key.DataType }, data: _.cloneDeep(currentPlot.data), defaultTraces: state.Settings.DefaultTrace, defaultV: state.Settings.DefaultVType, eventID: currentPlot.key.EventId })); //not really sure what requestID and secondary is...

    return await Promise.resolve();
})

// Thunk To Refetch Data for Analytic Plots
export const UpdateAnalyticPlot = createAsyncThunk('Data/updateAnalyticPlot', async (arg: { key: OpenSee.IGraphProps }, thunkAPI) => {
    let plot = (thunkAPI.getState() as RootState).Data.Plots.find(item => item.key.DataType == arg.key.DataType && item.key.EventId == arg.key.EventId)
    const state = (thunkAPI.getState() as OpenSee.IRootState)

    if (plot === null) {
        return Promise.resolve(); 
    }

    thunkAPI.dispatch(DataReducer.actions.RemoveData(arg.key))

    // Adding Data to the Plot
    let analyticOptions = (thunkAPI.getState() as OpenSee.IRootState).Analytic;
    let handles = getData(arg.key, analyticOptions, data => {
        thunkAPI.dispatch(DataReducer.actions.AppendData({ key: arg.key, data, defaultTraces: state.Settings.DefaultTrace, defaultV: state.Settings.DefaultVType, eventID: plot.key.EventId })); //not really sure what requestID and secondary is...
    });

    AddRequest(arg.key, handles);
    return await Promise.all(handles);
})


//Thunk to update Time Limits
export const SetTimeLimit = createAsyncThunk('Data/setTimeLimit', (arg: { start: number, end: number }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateTimeLimit({ ...arg }))
    return Promise.resolve();
})

//Thunk to update Cycle Limits
export const SetCycleLimit = createAsyncThunk('Data/SetCycleLimit', (arg: { start: number, end: number }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateCycleLimits({ ...arg }))
    return Promise.resolve();
})


//Thunk to update FFT Limits
export const SetFFTLimits = createAsyncThunk('Data/SetFFTLimits', (arg: { start: number, end: number }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateFFTLimits({ ...arg }))
    return Promise.resolve();
})


//Thunk to Enable or Disable Trace
export const EnableTrace = createAsyncThunk('Data/EnableTrace', (arg: { key: OpenSee.IGraphProps, trace: number[], enabled: boolean }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateTrace({ ...arg }))
    return Promise.resolve();
});


//Thunk to Reset Zoom
export const ResetZoom = createAsyncThunk('Data/Reset', (arg: { start: number, end: number }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateTimeLimit({ ...arg }));

    // FFT Limits get updated base on values not eventTime
    let state = (thunkAPI.getState() as OpenSee.IRootState);
    let fftPlot = state.Data.Plots.find(item => item.key.DataType == 'FFT');
    let overlappingWaveform = state.Data.Plots.find(item => item.key.DataType == 'OverlappingWave');

    if (fftPlot) {
        let start = Math.min(...fftPlot.data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]))));
        let end = Math.max(...fftPlot.data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]))));
        thunkAPI.dispatch(SetFFTLimits({ start: start, end: end }));
    }

    if (overlappingWaveform) {
        let start = Math.min(...overlappingWaveform.data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]).filter(val => !isNaN(val)))));
        let end = Math.max(...overlappingWaveform.data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]).filter(val => !isNaN(val)))));
        thunkAPI.dispatch(SetCycleLimit({ start: start, end: end }));
    }


    thunkAPI.dispatch(DataReducer.actions.ResetZoom());

    return Promise.resolve();
})


// Thunk to Set Zoomed YLimits
export const SetZoomedLimits = createAsyncThunk('Data/SetZoomedLimits', (arg: { limits: [number, number], key: OpenSee.IGraphProps}, thunkAPI) => {
    const state = (thunkAPI.getState() as OpenSee.IRootState);
    const plot = state.Data.Plots.find(plot => plot.key.DataType == arg.key.DataType && plot.key.EventId == arg.key.EventId);
    const primaryAxis = getPrimaryAxis(plot.key)
    let oldLimits: [number, number] = [0, 1]

    if (plot.yLimits[primaryAxis].isManual)
        oldLimits = plot.yLimits[primaryAxis].manualLimits
    else if (plot.isZoomed)
        oldLimits = plot.yLimits[primaryAxis].zoomedLimits
    else 
        oldLimits = plot.yLimits[primaryAxis].dataLimits


    thunkAPI.dispatch(DataReducer.actions.SetZoomedLimits({ oldLimits: oldLimits, key: arg.key, newLimits: arg.limits} ));
    return Promise.resolve();
})

export const SetUnit = createAsyncThunk('Data/SetUnit', (arg: { unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps }, thunkAPI) => {
    thunkAPI.dispatch(UpdateActiveUnits({ unit: arg.unit, value: arg.value, auto: arg.auto, key: arg.key }));
})


// #endregion

export const DataReducer = createSlice({
    name: 'Data',
    initialState: {
        startTime: 0 as number,
        endTime: 0 as number,
        Plots: [] as OpenSee.IGraphstate[],
        fftLimits: [0, 0],
        cycleLimit: [0, 1000.0 / 60.0],
    } as OpenSee.IDataState,
    reducers: {        
        RemovePlot: (state: OpenSee.IDataState, action: PayloadAction<number>) => {
            state.Plots.splice(action.payload, 1);
        },
        RemoveData: (state: OpenSee.IDataState, action: PayloadAction<OpenSee.IGraphProps>) => {
            const plot = state.Plots.find(item => item.key.DataType == action.payload.DataType && item.key.EventId == action.payload.EventId)
            if (plot)
                plot.data = [];
        },
        RemoveOverlappingData: (state: OpenSee.IDataState, action: PayloadAction<{ key: OpenSee.IGraphProps, data: OpenSee.iD3DataSeries[] }>) => {
            const plot = state.Plots.find(item => item.key.DataType == action.payload.key.DataType && item.key.EventId == -1)
            if (plot) {
                plot.data = plot.data.filter(data => data.EventID !== action.payload.key.EventId)
                if (plot.data.length !== 0)
                    updateAutoLimits(plot, state.startTime, state.endTime);
                else {
                    const plotIndex = state.Plots.findIndex(item => item.key.DataType == action.payload.key.DataType && item.key.EventId == -1)
                    state.Plots.splice(plotIndex, 1);
            }
            }
        },
        UpdateActiveUnits: (state: OpenSee.IDataState, action: PayloadAction<{ unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps }>) => {

            state.Plots.filter(plot => plot.key.DataType === action.payload.key.DataType).forEach(curPlot => {

                const oldUnitIndex = curPlot.yLimits[action.payload.unit].current
                let newUnitIndex = action.payload.value
                const oldFactor = defaultSettings.Units[action.payload.unit].options[oldUnitIndex].factor
                const newFactor = defaultSettings.Units[action.payload.unit].options[newUnitIndex].factor
                const isPU = oldFactor === undefined || newFactor === undefined ? true : false

            curPlot.yLimits[action.payload.unit].isAuto = action.payload.auto
            curPlot.yLimits[action.payload.unit].current = action.payload.value

            const axisSetting: OpenSee.IAxisSettings = curPlot.yLimits[action.payload.unit];
                const oldLimits = axisSetting.dataLimits
            const filteredData = curPlot.data.filter(item => item.Enabled && item.Unit === action.payload.unit);

                //handle autoUnit case
            let unitIndex = updateActiveUnits(curPlot.yLimits, action.payload.unit, filteredData, state.startTime, state.endTime, null);
                if (unitIndex) {
                curPlot.yLimits[action.payload.unit].current = unitIndex
                    newUnitIndex = unitIndex
                }

            if (curPlot.key.DataType != 'FFT' && curPlot.key.DataType != 'OverlappingWave') {
                const limits = recomputeDataLimits(state.startTime, state.endTime, filteredData, curPlot.yLimits[action.payload.unit].current);
                axisSetting.dataLimits = limits;
                    if (isPU) {
                        axisSetting.zoomedLimits = scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                        axisSetting.manualLimits = scaleLimits(oldLimits, limits, axisSetting.manualLimits)
            }
                    else {
                        axisSetting.manualLimits = scaleLimitsByFactor(oldUnitIndex, newUnitIndex, action.payload.unit, axisSetting.manualLimits)
                        axisSetting.zoomedLimits = scaleLimitsByFactor(oldUnitIndex, newUnitIndex, action.payload.unit, axisSetting.zoomedLimits)
                    }
                }
            else if (curPlot.key.DataType == 'FFT') {
                const limits = recomputeDataLimits(state.fftLimits[0], state.fftLimits[1], filteredData, curPlot.yLimits[action.payload.unit].current)
                axisSetting.dataLimits = limits;
                    if (isPU) {
                        axisSetting.zoomedLimits = scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                        axisSetting.manualLimits = scaleLimits(oldLimits, limits, axisSetting.manualLimits)
            }
                    else {
                        axisSetting.manualLimits = scaleLimitsByFactor(oldUnitIndex, newUnitIndex, action.payload.unit, axisSetting.manualLimits)
                        axisSetting.zoomedLimits = scaleLimitsByFactor(oldUnitIndex, newUnitIndex, action.payload.unit, axisSetting.zoomedLimits)
                    }
                }
            else if (curPlot.key.DataType == 'OverlappingWave') {
                const limits = recomputeDataLimits(state.cycleLimit[0], state.cycleLimit[1], filteredData, curPlot.yLimits[action.payload.unit].current);
                axisSetting.dataLimits = limits;
                    if (isPU) {
                        axisSetting.zoomedLimits = scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                        axisSetting.manualLimits = scaleLimits(oldLimits, limits, axisSetting.manualLimits)
            }
                    else {
                        axisSetting.manualLimits = scaleLimitsByFactor(oldUnitIndex, newUnitIndex, action.payload.unit, axisSetting.manualLimits)
                        axisSetting.zoomedLimits = scaleLimitsByFactor(oldUnitIndex, newUnitIndex, action.payload.unit, axisSetting.zoomedLimits)
                    }
                }

            })
            saveSettings(state);

            return state;
        },
        SetIsManual: (state: OpenSee.IDataState, action: PayloadAction<{ key: OpenSee.IGraphProps, unit: OpenSee.Unit, manual: boolean }>) => {
            let plot = state.Plots.find(plot => plot.key.DataType === action.payload.key.DataType && plot.key.EventId === action.payload.key.EventId);
            plot.yLimits[action.payload.unit].isManual = action.payload.manual

            const isValidNumber = (value) => !isNaN(value) && isFinite(value);

            const invalidZoomedLimits = (plot.yLimits[action.payload.unit].zoomedLimits === null) || !isValidNumber(plot.yLimits[action.payload.unit].zoomedLimits[0]) || !isValidNumber(plot.yLimits[action.payload.unit].zoomedLimits[1]);
            const invalidDataLimits = (plot.yLimits[action.payload.unit].dataLimits === null) || !isValidNumber(plot.yLimits[action.payload.unit].dataLimits[0]) || !isValidNumber(plot.yLimits[action.payload.unit].dataLimits[1]);

            if (plot.isZoomed && !invalidZoomedLimits)
                plot.yLimits[action.payload.unit].manualLimits = plot.yLimits[action.payload.unit].zoomedLimits
            else if (!invalidDataLimits)
                plot.yLimits[action.payload.unit].manualLimits = plot.yLimits[action.payload.unit].dataLimits

            return state;
        },

        UpdateTimeLimit: (state: OpenSee.IDataState, action: PayloadAction<{ start: number, end: number }>) => {
            if (Math.abs(action.payload.start - action.payload.end) < 10)
                return state;

            state.startTime = action.payload.start;
            state.endTime = action.payload.end;

            state.Plots.forEach(graph => {
                if (graph.key.DataType === "FFT")
                    updateAutoLimits(graph, state.fftLimits[0], state.fftLimits[1]);
                else if (graph.key.DataType === "OverlappingWave")
                    updateAutoLimits(graph, state.cycleLimit[0], state.cycleLimit[1]);
                else
                    updateAutoLimits(graph, state.startTime, state.endTime);

            });

            return state;
        },
        AppendData: (state: OpenSee.IDataState, action: PayloadAction<{
            key: OpenSee.IGraphProps, data: Array<OpenSee.iD3DataSeries>,
            defaultTraces: OpenSee.IDefaultTrace, defaultV: "L-L" | "L-N",
            eventID: number
        }>) => {
            let currentPlot = state.Plots.find(item => item.key.DataType == action.payload.key.DataType && item.key.EventId == action.payload.key.EventId)

            if (currentPlot) {
                const orignalLength = currentPlot.data.length
                //update plot with unit settings from local storage
                applyLocalSettings(currentPlot)

                currentPlot.data.push(...action.payload.data);
                const newLength = currentPlot.data.length
            
                let extendEnabled = GetDefaults(action.payload.key.DataType, action.payload.defaultTraces, action.payload.defaultV, currentPlot.data);

                for (let i = orignalLength; i < newLength; i++) {
                    currentPlot.data[i].Enabled = extendEnabled[i];
                    currentPlot.data[i].EventID = action.payload.eventID
                }

                const RelevantAxises = _.uniq(currentPlot.data.map(s => s.Unit));

                RelevantAxises.forEach(axis => {
                    let filteredData = currentPlot.data.filter(item => item.Unit === axis && item.Enabled);
                    let index = updateActiveUnits(currentPlot.yLimits, axis, filteredData, state.startTime, state.endTime, null);
                    if (index)
                        currentPlot.yLimits[axis].current = index;
                })

                if (currentPlot.key.DataType === 'FFT') {
                    state.fftLimits = [Math.min(...currentPlot.data.map(item => Math.min(...item.DataPoints.map(pt => pt[0])))), Math.max(...currentPlot.data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]))))]
                    updateAutoLimits(currentPlot, state.fftLimits[0], state.fftLimits[1]);
                } else if (currentPlot.key.DataType === 'OverlappingWave')
                    updateAutoLimits(currentPlot, state.cycleLimit[0], state.cycleLimit[1]);
                else
                    updateAutoLimits(currentPlot, state.startTime, state.endTime);
            }

            return state

        },
        ReplaceData: (state: OpenSee.IDataState, action: PayloadAction<{ key: OpenSee.IGraphProps, data: Array<OpenSee.iD3DataSeries> }>) => {
            let plot = state.Plots.findIndex(item => item.key.DataType == action.payload.key.DataType && item.key.EventId == action.payload.key.EventId)
            if (plot == null)
                return state;
            let updated = [];

            action.payload.data.forEach(d => {
                let dIndex = plot.data.findIndex((od,di) => od.LegendGroup == d.LegendGroup && od.LegendHorizontal == d.LegendHorizontal && od.LegendVertical == d.LegendVertical && od.LegendVGroup == d.LegendVGroup && updated.indexOf(di) == -1);
                if (dIndex == -1)
                    return
                updated.push(dIndex);
                state.data[index][dIndex] = d;
            });
            return state;
        },
        UpdateTimeLimit: (state: OpenSee.IDataState, action: PayloadAction<{ start: number, end: number, baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting> }> ) => {
            if (Math.abs(action.payload.start - action.payload.end) < 10)
                return state;

            state.startTime = action.payload.start;
            state.endTime = action.payload.end;

            state.Plots 
                .forEach((graph, index) => {
                    updateAutoLimits(graph, state.startTime, state.endTime, action.payload.baseUnits);
                });
            return state;

        },
        UpdateFFTLimits: (state: OpenSee.IDataState, action: PayloadAction<{ start: number, end: number, baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting> }>) => {
            if (Math.abs(action.payload.start - action.payload.end) < 1)
                return state;

            state.fftLimits = [action.payload.start, action.payload.end];

            //Update All Y Units and limits
            state.Plots
                .forEach((graph, index) => {
                    updateFFTAutoLimits(graph, state.fftLimits[0], state.fftLimits[1], action.payload.baseUnits);
                });
            return state;

        },
        updatecycleLimit: (state: OpenSee.IDataState, action: PayloadAction<{ start: number, end: number, baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting> }>) => {
            if (Math.abs(action.payload.start - action.payload.end) < 5)
                return state;

            state.cycleLimit = [action.payload.start, action.payload.end];

            //Update All Y Units and limits
            state.Plots
                .forEach((graph, index) => {
                    updatedCycleAutoLimits(graph, state.cycleLimit[0], state.cycleLimit[1], action.payload.baseUnits);
                });
            return state;

        },
        UpdateTrace: (state: OpenSee.IDataState, action: PayloadAction<{ key: OpenSee.IGraphProps, trace: number[], enabled: boolean }>) => {
            // Find the index of the plot in the state
            let curPlot = state.Plots.find(plot => plot.key.DataType == action.payload.key.DataType && plot.key.EventId == action.payload.key.EventId);
            if (!curPlot)
                return;

            // Update only the selected plot
            action.payload.trace.forEach(traceIndex => {
                if (traceIndex < curPlot.data.length) {
                    curPlot.data[traceIndex].Enabled = action.payload.enabled;
            }
            });

            // Recompute limits and update units
            const relevantTraces = action.payload.trace.map(index => curPlot.data[index])

            const RelevantAxis = _.uniq(relevantTraces.map(s => s?.Unit));

            if (RelevantAxis.length > 0)
                RelevantAxis.forEach(axis => {
                    if (axis === undefined)
                        return
                    const axisSetting = curPlot.yLimits[axis];
                    const relevantData = curPlot.data.filter(item => item.Enabled && item.Unit === axis);

                    if (curPlot.key.DataType !== 'FFT' && curPlot.key.DataType !== 'OverlappingWave') {
                        let recomputedLimits = recomputeDataLimits(state.startTime, state.endTime, relevantData, curPlot.yLimits[axis].current)
                        axisSetting.dataLimits = recomputedLimits;
                        axisSetting.zoomedLimits = recomputeNonAutoLimits(curPlot.yLimits[getPrimaryAxis(action.payload.key)].dataLimits, curPlot.yLimits[getPrimaryAxis(action.payload.key)].zoomedLimits, recomputedLimits)
                    } else if (curPlot.key.DataType === 'FFT') {
                        const recomputedLimits = recomputeDataLimits(state.fftLimits[0], state.fftLimits[1], relevantData, curPlot.yLimits[axis].current);
                        axisSetting.dataLimits = recomputedLimits;
                        axisSetting.zoomedLimits = recomputeNonAutoLimits(curPlot.yLimits[getPrimaryAxis(action.payload.key)].dataLimits, curPlot.yLimits[getPrimaryAxis(action.payload.key)].zoomedLimits, recomputedLimits)
                    } else if (curPlot.key.DataType === 'OverlappingWave') {
                        const recomputedLimits = recomputeDataLimits(state.cycleLimit[0], state.cycleLimit[1], relevantData, curPlot.yLimits[axis].current);
                        axisSetting.dataLimits = recomputedLimits;
                        axisSetting.zoomedLimits = recomputeNonAutoLimits(curPlot.yLimits[getPrimaryAxis(action.payload.key)].dataLimits, curPlot.yLimits[getPrimaryAxis(action.payload.key)].zoomedLimits, recomputedLimits)

                    }
                    updateActiveUnits(curPlot.yLimits, axis, relevantData, state.startTime, state.endTime, null);
                });

        },
        SelectPoint: (state: OpenSee.IDataState, action: PayloadAction<[number, number]>) => {
            if (state.mouseMode == 'none')
                return state;
            if (state.mouseMode == 'zoom')
                // This case is handled locally in plot to avoid any confusion
                return state
            if (state.mouseMode == 'select') {
                // Only work those with main eventId for now
                state.selectedIndixes.forEach((item, index) => {
                    if (state.plotKeys[index].EventId != state.eventID)
                        return;
                    if (state.data[index].length == 0)
                        return;
                    let dataIndex = getIndex(action.payload[0], state.data[index][0].DataPoints)
                    state.selectedIndixes[index].push(dataIndex);
                })
            }
        },
        ClearSelectPoints: (state: OpenSee.IDataState) => {
            state.Plots.forEach(plot => plot.selectedIndixes = []);
        },
        RemoveSelectPoints: (state: OpenSee.IDataState, action: PayloadAction<number>) => {
            state.Plots.forEach(plot => plot.selectedIndixes.splice(action.payload, 1));
        },
        SetZoomedLimits: (state: OpenSee.IDataState, action: PayloadAction<{ oldLimits: [number, number], key: OpenSee.IGraphProps, newLimits: [number, number]}>) => {
            const curPlot = state.Plots.find(plot => plot.key.DataType == action.payload.key.DataType && plot.key.EventId == action.payload.key.EventId);
            if (curPlot) {
                const RelevantAxis = _.uniq(curPlot.data.filter(item => item.Enabled).map(s => s.Unit));
                RelevantAxis.forEach(axis => {
                    if (axis === getPrimaryAxis(action.payload.key))
                        curPlot.yLimits[axis].zoomedLimits = action.payload.newLimits
                    else if (curPlot.yLimits[axis].isManual) 
                        curPlot.yLimits[axis].zoomedLimits = recomputeZoomedLimits(action.payload.oldLimits, action.payload.newLimits, curPlot.yLimits[axis].manualLimits);
                     else if (curPlot.isZoomed) 
                        curPlot.yLimits[axis].zoomedLimits = recomputeZoomedLimits(action.payload.oldLimits, action.payload.newLimits, curPlot.yLimits[axis].zoomedLimits);
                     else 
                        curPlot.yLimits[axis].zoomedLimits = recomputeZoomedLimits(action.payload.oldLimits, action.payload.newLimits, curPlot.yLimits[axis].dataLimits);
                })


                curPlot.isZoomed = true;
            }
        },
        SetManualLimits: (state: OpenSee.IDataState, action: PayloadAction<{
            limits: [number, number],
            key: OpenSee.IGraphProps,
            axis: OpenSee.Unit,
            auto: boolean 
            factor?: number
        }>) => {
            const curPlot = state.Plots.find(plot => plot.key.DataType == action.payload.key.DataType && plot.key.EventId == action.payload.key.EventId);
            if (curPlot) {
                curPlot.yLimits[action.payload.axis].isManual = true;

                if (curPlot.isZoomed) //cover case of user zooming first then manually editing those..
                    curPlot.yLimits[action.payload.axis].zoomedLimits = action.payload.limits;

                curPlot.yLimits[action.payload.axis].manualLimits = action.payload.limits;

                if (action.payload.auto) {
                    let revelantData = curPlot.data.filter(data => data.Enabled && data.Unit === action.payload.axis)

                    let index = updateActiveUnits(curPlot.yLimits, action.payload.axis, revelantData, state.startTime, state.endTime, action.payload.limits);
                    if (index) {
                        curPlot.yLimits[action.payload.axis] = index;
                        let newManualLimits = [action.payload.limits[0] * action.payload.factor, action.payload.limits[1] * action.payload.factor]
                        curPlot.yLimits[action.payload.axis].manualLimits = newManualLimits;

                    }
                }

                }
        },
        ResetZoom: (state: OpenSee.IDataState) => {
            state.Plots.forEach(plot => {
                plot.isZoomed = false;
                const RelevantAxis = _.uniq(plot.data.map(s => s.Unit));
                RelevantAxis.forEach(axis => {
                    plot.yLimits[axis].zoomedLimits = [0, 1];
                })

            })
        },
    },
    extraReducers: (builder) => {
        builder.addCase(AddPlot.pending, (state, action) => {
            let plot = state.Plots.find(item => item.key.DataType == action.meta.arg.key.DataType && item.key.EventId == action.meta.arg.key.EventId);

            if (plot == null) {
                plot = _.cloneDeep(emptygraph);
                state.Plots.push(plot)
            }

            plot.key = action.meta.arg.key;
            plot.loading = 'Loading';

            if (action.meta.arg.yLimits)
                Object.keys(action.meta.arg.yLimits).forEach(unit => {
                    plot.yLimits[unit] = action.meta.arg.yLimits[unit]
                })
            if (action.meta.arg.isZoomed !== undefined)
                plot.isZoomed = action.meta.arg.isZoomed

            return state
        });
        builder.addCase(AddPlot.fulfilled, (state, action) => {
            let plot = state.Plots.find(item => item.key.DataType == action.meta.arg.key.DataType && item.key.EventId == action.meta.arg.key.EventId);
            if (plot) {
            plot.loading = 'Idle'

                if (action.meta.arg.fftLimits)
                    state.fftLimits = action.meta.arg.fftLimits
                if (action.meta.arg.fftLimits)
                    state.cycleLimit = action.meta.arg.cycleLimits
            }

            return state
        });
        builder.addCase(UpdateAnalyticPlot.pending, (state, action) => {
            let plot = state.Plots.find(item => item.key.DataType == action.meta.arg.key.DataType && item.key.EventId == action.meta.arg.key.EventId);
            if (plot)
                plot.loading = 'Loading';
            return state
        });
        builder.addCase(UpdateAnalyticPlot.fulfilled, (state, action) => {
            let plot = state.Plots.find(item => item.key.DataType == action.meta.arg.key.DataType && item.key.EventId == action.meta.arg.key.EventId);
            if (plot)
                plot.loading = 'Idle';
            return state
        });
        builder.addCase(AddSingleOverlappingPlot.pending, (state, action) => {
            let plot = state.Plots.find(item => item.key.DataType == action.meta.arg.DataType && item.key.EventId == -1);

            if (plot == null) {
                plot = _.cloneDeep(emptygraph);
                state.Plots.push(plot)
            }

            plot.key = { EventId: -1, DataType: action.meta.arg.DataType };
            plot.loading = 'Loading';


            return state
        });
        builder.addCase(AddSingleOverlappingPlot.fulfilled, (state, action) => {
            let plot = state.Plots.find(item => item.key.DataType == action.meta.arg.DataType && item.key.EventId == -1);
            if (plot)
                plot.loading = 'Idle';

            return state
        });
    }

});


// export const { SetHover, SetMouseMode, SelectPoint, SetZoomMode, RemoveSelectPoints, ClearSelectPoints, RemovePlot, UpdateActiveUnits } = DataReducer.actions;
export default DataReducer.reducer;

// #endregion

// #region [ Individual Selectors ]

// Returns a List of keys for Plots that should be displayed.
export const selectListGraphs = createSelector(
    (state: RootState) => state.Data.Plots,
    (state: RootState) => state.Settings.SinglePlot,
    (plots, singlePlot) => {

        if (singlePlot) {
            const keys = plots.filter(item => item.key.EventId == -1).map(p => p.key);
            return _.groupBy(keys, "EventId");
        }

        const keys = plots.map(p => p.key)
        return _.groupBy(keys, "EventId");
    })

export const SelectOverlappingEvents = (graphType: OpenSee.graphType) => createSelector(
    (state: RootState) => state.Data.Plots,
    (state: RootState) => state.EventInfo.EventID,
    (plots, evtID) => {
        const filteredPlots = plots.filter(plot => plot.key.EventId !== evtID && plot.key.EventId !== -1 && plot.key.DataType === graphType).map(plot => plot.key)
        //order by eventID because we groupBy eventID in openSEE.tsx
        const sortedPlots = _.orderBy(filteredPlots, "EventId", "desc")
        return sortedPlots;
    })

export const selectDisplayed = createSelector(
    (state: RootState) => state.Data.Plots,
    (plots) => ({
        Voltage: plots.some(p => p.key.DataType == 'Voltage'),
        Current: plots.some(p => p.key.DataType == 'Current'),
        TripCoil: plots.some(p => p.key.DataType == 'TripCoil'),
        Analogs: plots.some(p => p.key.DataType == 'Analogs'),
        Digitals: plots.some(p => p.key.DataType == 'Digitals')
    })
)

/*
export const selectData = () =>
    createSelector(
        (state: OpenSee.IRootState) => state.Data.data,
        (state: OpenSee.IRootState) => state.Data.plotKeys,
export const selectData = (key: OpenSee.IGraphProps) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
        (state: OpenSee.IRootState) => state.Settings.SinglePlot,
    (plots, singlePlot) => {
        let plot = plots.find(item => item.key.DataType === key.DataType && item.key.EventId === key.EventId);
        let overlappingPlot = plots.find(item => item.key.DataType === key.DataType && item.key.EventId === -1)
        if (singlePlot)
            return overlappingPlot ? overlappingPlot.data : null
        return plot ? plot.data : null;
    }
    );

const FilterData = (data: OpenSee.iD3DataSeries[][], plotKeys: OpenSee.IGraphProps[], single: boolean, tab: OpenSee.Tab, type: OpenSee.IGraphProps) => {
    let index = plotKeys.findIndex((item => item.DataType == type.DataType && item.EventId == type.EventId));
    if (index == -1)
        return null;

    if (single && tab == 'Compare') {
        let d = data.filter((item, i) => plotKeys[i].DataType == type.DataType && type.EventId != plotKeys[i].EventId);
        d = d.map(lst => lst.map(item => { return { ...item, LineType: ':' } }));
        return data[index].concat(...d);
    }

    return data[index];
}

export const selectEnabled = () =>
    createSelector(
    (state: OpenSee.IRootState) => state.Data.enabled,
    (state: OpenSee.IRootState) => state.Data.plotKeys,
    (state: OpenSee.IRootState) => state.Settings.SinglePlot,
    (state: OpenSee.IRootState) => state.Settings.Tab,
    (_, key: OpenSee.IGraphProps) => key,
    FilterEnabled
);

export const SelectYLimits = (key: OpenSee.IGraphProps) => {
    return createSelector(
        (state: OpenSee.IRootState) => state.Data,
        (data: OpenSee.IDataState) => {
            const plot = data.Plots.find(plot => plot.key.EventId === key.EventId && plot.key.DataType === key.DataType)
            let result = {}
            if (plot) {
                Object.keys(plot.yLimits).forEach(unit => {
                    if (plot.isZoomed)
                        result[unit] = plot.yLimits[unit].zoomedLimits
                    else if (plot.yLimits[unit].isManual && plot.yLimits[unit].manualLimits)
                        result[unit] = plot.yLimits[unit].manualLimits
                    else
                        result[unit] = plot.yLimits[unit].dataLimits
                })
            }

            return result as OpenSee.IUnitCollection<[number, number]>;
        });
}

export const selectOverlappingYLimits = (graphType: OpenSee.graphType) => {
    return createSelector(
        (state: OpenSee.IRootState) => state.Data.Plots,
        (state: OpenSee.IRootState) => state.EventInfo.EventID,
        (plots, evtID) => {
            let overlappingPlots = plots.filter(plot => plot.key.EventId !== evtID && plot.key.DataType === graphType)

            let result = {};
            if (overlappingPlots.length > 0) {
                overlappingPlots.forEach(plot => {
                    let yLimits = {}
                    Object.keys(plot.yLimits).forEach(key => {
                        if (plot.isZoomed)
                            yLimits[key] = plot.yLimits[key].zoomedLimits;
                        else if (plot.yLimits[key].isManual && plot.yLimits[key].manualLimits)
                            yLimits[key] = plot.yLimits[key].manualLimits
                        else
                            yLimits[key] = plot.yLimits[key].dataLimits

                    })
                    result[plot.key.DataType] = yLimits
                })

                return result;
            }

        });
}

export const selectLoading = (key: OpenSee.IGraphProps) => {
    return (state: OpenSee.IRootState) => {
        const plot = state.Data.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
        if (plot)
            return plot.loading
    };
};

export const selectZoomed = (key: OpenSee.IGraphProps) => {
    return (state: OpenSee.IRootState) => {
        const plot = state.Data.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
        if (plot)
            return plot.isZoomed;
    };
};

}

export const selectLoading = (key: OpenSee.IGraphProps) => { return (state: OpenSee.IRootState) => state.Data.loading.find((item, index) => state.Data.plotKeys[index].DataType == key.DataType && state.Data.plotKeys[index].EventId == key.EventId); }

export const selectFFTLimits = (state: OpenSee.IRootState) => state.Data.fftLimits;


export const selectStartTime = (state: OpenSee.IRootState) => state.Data.startTime;
export const selectEndTime = (state: OpenSee.IRootState) => state.Data.endTime;
export const selectHover = (state: OpenSee.IRootState) => state.Data.hover
export const selectMouseMode = (state: OpenSee.IRootState) => state.Data.mouseMode
export const selectZoomMode = (state: OpenSee.IRootState) => state.Data.zoomMode
export const selectCycleStart = (state: OpenSee.IRootState) => state.Data.cycleLimit[0]
export const selectCycleEnd = (state: OpenSee.IRootState) => state.Data.cycleLimit[1]

export const selectEventID = (state: OpenSee.IRootState) => state.Data.eventID
export const selectAnalytic = (state: OpenSee.IRootState) => state.Data.Analytic;
export const selectIsManual = (key: OpenSee.IGraphProps) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (plots) => {
        let plot = plots.find(p => p.key.DataType === key.DataType && p.key.EventId === key.EventId);
        let result = {};
        if (plot) {
            Object.keys(plot.yLimits).forEach(key => {
                result[key] = plot.yLimits[key].isManual;
            })
            return result as OpenSee.IUnitCollection<boolean>;
        }

    }
);

export const selectIsOverlappingManual = (graphType: OpenSee.graphType) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (plots, evtID) => {
        let overlappingPlots = plots.filter(p => p.key.DataType === graphType && p.key.EventId !== evtID);
        let result = {};
        if (overlappingPlots.length > 0) {
            overlappingPlots.forEach(plot => {
                let units = {}
                Object.keys(plot.yLimits).forEach(key => {
                    units[key] = plot.yLimits[key].isManual;
                })
                result[plot.key.DataType] = units as OpenSee.IUnitCollection<boolean>
            })

            return result;
        }

    }
);


//For SettingsWindow
export const selectGraphTypes = createSelector((state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.eventID, (keys, eventId) => {
    let graphs = uniq(keys.map(item => item.DataType));
    return graphs.map(item => { return { DataType: item, EventId: eventId} as OpenSee.IGraphProps })
});

// For tooltip
export const selectHoverPoints = (hover: [number, number]) => createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {
        let result: OpenSee.IPoint[] = [];

        let filteredPlots = state.Plots.filter(plot => plot.key.EventId === eventID)

        filteredPlots.forEach(plot => {
            if (plot.data.length === 0) return;

            let dataIndex = getIndex(hover[0], plot.data[0].DataPoints);
            if (isNaN(dataIndex))
                return;


            result = result.concat(...plot.data.filter(d => d.Enabled).map(d => {
                dataIndex = getIndex(hover[0], d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: defaultSettings.Units[d.Unit].options[plot.yLimits[d.Unit].current],
                    Value: (dataIndex > (d.DataPoints.length - 1) ? NaN : d.DataPoints[dataIndex][1]),
                    Name: GetDisplayName(d, plot.key.DataType),
                    BaseValue: d.BaseValue,
                    Time: 0,
                }
            }))
    })
    return result;
});


export const selectDeltaHoverPoints = (hover: [number, number]) => createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {
        let result: OpenSee.IPoint[] = [];

        let filteredPlots = state.Plots.filter(plot => plot.key.EventId === eventID)

        filteredPlots.forEach(plot => {
            const selectedData = plot.selectedIndixes;
            if (plot.data.length === 0) return;

            let dataIndex = getIndex(hover[0], plot.data[0].DataPoints);
            if (isNaN(dataIndex))
                return;

            result = result.concat(...plot.data.filter(d => d.Enabled).map(d => {
                dataIndex = getIndex(hover[0], d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: defaultSettings.Units[d.Unit].options[plot.yLimits[d.Unit].current],
                    Value: (dataIndex > (d.DataPoints.length - 1) ? NaN : d.DataPoints[dataIndex][1]),
                    Name: GetDisplayName(d, plot.key.DataType),
                    PrevValue: (selectedData.length > 0 ? ((selectedData[selectedData.length] - 1) > d.DataPoints.length ? NaN : d.DataPoints[selectedData[selectedData.length - 1]][1]) : NaN),
                    BaseValue: d.BaseValue,
                    Time: (selectedData.length > 0 ? ((selectedData[selectedData.length] - 1) > d.DataPoints.length ? NaN : d.DataPoints[selectedData[selectedData.length - 1]][0]) : NaN),
                }

            }))
        })
    return result;
});



// For vector
export const selectVPhases = (hover: [number, number]) => createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {

        let plot = state.Plots.find(plot => plot.key.DataType == 'Voltage' && plot.key.EventId == eventID);
        if (!plot || plot.data.length === 0 || !plot.data.some(d => d.LegendHorizontal == 'Ph')) return [];

        const activeUnits = plot.yLimits;

        let asset = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendGroup));
        let phase = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendVertical));

        let phaseData = plot.data.find(item => item.LegendHorizontal == 'Ph');
        let pointIndex = phaseData ? getIndex(hover[0], phaseData.DataPoints) : -1;

        if (isNaN(pointIndex) || pointIndex < 0)
            return [];

        let result: OpenSee.IVector[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                let phaseChannel = plot.data.find(item => item.LegendGroup == a && item.LegendVertical == p && item.LegendHorizontal == 'Ph');
                let magnitudeChannel = plot.data.find(item => item.LegendGroup == a && item.LegendVertical == p && item.LegendHorizontal == 'Pk');

                if (phaseChannel && magnitudeChannel) {
                    let phaseValue = pointIndex < phaseChannel.DataPoints.length ? phaseChannel.DataPoints[pointIndex][1] : NaN;
                    let magValue = pointIndex < magnitudeChannel.DataPoints.length ? magnitudeChannel.DataPoints[pointIndex][1] : NaN;

                result.push({
                    Color: phaseChannel.Color,
                        Unit: defaultSettings.Units.Voltage.options[activeUnits["Voltage"].current],
                        PhaseUnit: defaultSettings.Units.Angle.options[activeUnits["Angle"].current],
                    Phase: p,
                    Asset: a,
                        Magnitude: magValue,
                        Angle: phaseValue,
                    BaseValue: magnitudeChannel.BaseValue
                });
                }
            });
        });

        return result;
    }
);


export const selectIPhases = (hover: [number, number]) => createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {
        let plot = state.Plots.find(p => p.key.DataType == 'Current' && p.key.EventId == eventID);
        if (!plot || plot.data.length === 0 || !plot.data.some(d => d.LegendHorizontal == 'Ph')) return [];

        const activeUnits = plot.yLimits;
        let asset = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendGroup));
        let phase = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendVertical));


        let pointIndex = getIndex(hover[0], plot.data.find(item => item.LegendHorizontal == 'Ph').DataPoints);
        if (isNaN(pointIndex)) return [];

        let result: OpenSee.IVector[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                let phaseChannel = plot.data.find(item => item.LegendGroup == a && item.LegendVertical == p && item.LegendHorizontal == 'Ph');
                let magnitudeChannel = plot.data.find(item => item.LegendGroup == a && item.LegendVertical == p && item.LegendHorizontal == 'Pk');

                if (phaseChannel && magnitudeChannel) {
                    let phaseValue = pointIndex < phaseChannel.DataPoints.length ? phaseChannel.DataPoints[pointIndex][1] : NaN;
                    let magValue = pointIndex < magnitudeChannel.DataPoints.length ? magnitudeChannel.DataPoints[pointIndex][1] : NaN;

                result.push({
                    Color: phaseChannel.Color,
                        Unit: defaultSettings.Units.Current.options[activeUnits["Current"].current],
                        PhaseUnit: defaultSettings.Units.Angle.options[activeUnits["Angle"].current],
                    Phase: p,
                    Asset: a,
                        Magnitude: magValue,
                        Angle: phaseValue,
                    BaseValue: magnitudeChannel.BaseValue
                });
                }
            });
        });

        return result;
    }
);

// For Accumulated Point widget
export const selectSelectedPoints = createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {
        let result: OpenSee.IPointCollection[] = [];

        state.Plots.forEach(plot => {
            if (plot.key.EventId != eventID) return;
            if (plot.key.DataType != 'Voltage' && plot.key.DataType != 'Current') return;
            if (plot.data.length == 0) return;

            result = result.concat(...plot.data.filter(d => d.Enabled).map(d => {
                const unitType = d?.Unit;
                const unitOptions = defaultSettings.Units[unitType]?.options ?? {};

                return {
                    Group: d.LegendGroup,
                    Name: (plot.key.DataType == 'Voltage' ? 'V ' : 'I ') + d.LegendVertical + ' ' + d.LegendHorizontal,
                    Unit: unitOptions[plot.yLimits[unitType].current],
                    Value: plot.selectedIndixes.map(j => d.DataPoints[j]),
                    BaseValue: d.BaseValue,
                    Color: d.Color
                }

            }))

        })
        return result;
})


// For FFT Table
export const selectFFTData = createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots.find(plot => plot.key.DataType === "FFT" && plot.key.EventId === state.EventInfo.EventID),
    (fftPlot) => {
        if (fftPlot?.data == null) return [];
        const activeUnits = defaultSettings.Units
        let asset = _.uniq(fftPlot.data.map(item => item.LegendGroup));
        let phase = _.uniq(fftPlot.data.map(item => item.LegendVertical));
        
        if (fftPlot.data.length == 0) return []

        let result: OpenSee.IFFTSeries[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                if (!fftPlot.data.some((item, i) => (item.LegendGroup == a && item.LegendVertical == p)))
                    return

                let d = fftPlot.data.filter((item, i) => (item.LegendGroup == a && item.LegendVertical == p));
                let phaseChannel = d.find(item => item.LegendHorizontal == 'Ang');
                let magnitudeChannel = d.find(item => item.LegendHorizontal == 'Mag');

                if (phaseChannel == undefined || magnitudeChannel == undefined)
                    return;

                result.push({
                    Color: phaseChannel.Color,
                    Unit: activeUnits[magnitudeChannel.Unit].options[fftPlot.yLimits[magnitudeChannel.Unit].current],
                    PhaseUnit: activeUnits["Angle"].options[fftPlot.yLimits["Angle"].current],
                    Phase: p,
                    Asset: a,
                    Magnitude: magnitudeChannel.DataPoints.map(item => item[1]),
                    Angle: phaseChannel.DataPoints.map(item => item[1]),
                    BaseValue: magnitudeChannel.BaseValue,
                    Frequency: magnitudeChannel.DataPoints.map(item => item[0] * 60.0),
                });

            })
        })

        return result;

    })


//Export Loading States:
export const selectLoadVoltages = createSelector((state: OpenSee.IRootState) => state.Data.loading, (state: OpenSee.IRootState) => state.Data.plotKeys, (loading, plotKeys) => {
    return (loading.filter((item, index) => plotKeys[index].DataType == 'Voltage' && item != 'Idle').length > 0)
})

export const selectLoadCurrents = createSelector((state: OpenSee.IRootState) => state.Data.loading, (state: OpenSee.IRootState) => state.Data.plotKeys, (loading, plotKeys) => {
    return (loading.filter((item, index) => plotKeys[index].DataType == 'Current' && item != 'Idle').length > 0)
})

export const selectLoadAnalogs = createSelector((state: OpenSee.IRootState) => state.Data.loading, (state: OpenSee.IRootState) => state.Data.plotKeys, (loading, plotKeys) => {
    return (loading.filter((item, index) => plotKeys[index].DataType == 'Analogs' && item != 'Idle').length > 0)
})

export const selectLoadDigitals = createSelector((state: OpenSee.IRootState) => state.Data.loading, (state: OpenSee.IRootState) => state.Data.plotKeys, (loading, plotKeys) => {
    return (loading.filter((item, index) => plotKeys[index].DataType == 'Digitals' && item != 'Idle').length > 0)
})

export const selectLoadTCE = createSelector((state: OpenSee.IRootState) => state.Data.loading, (state: OpenSee.IRootState) => state.Data.plotKeys, (loading, plotKeys) => {
    return (loading.filter((item, index) => plotKeys[index].DataType == 'TripCoil' && item != 'Idle').length > 0)
})


// #endregion

// #region [ Async Functions ]

function updateAutoLimits(plot: OpenSee.IGraphstate, startTime: number, endTime: number, baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>) {

    const RelevantAxis = _.uniq(plot.data.map((s) => s.Unit));

    RelevantAxis.forEach((axis) => {
        const autoLimits = !plot.isZoomed && baseUnits[axis].useAutoLimits;
        if (!autoLimits || plot.key.DataType == 'FFT' || plot.key.DataType == 'OverlappingWave')
            return;
        plot.yLimits[axis].dataLimits = recomputeDataLimits(startTime, endTime,
            plot.data.filter((item, i) => plot.enabled[i]));
        updateActiveUnits(baseUnits, plot.yLimits[axis], axis);
    });

export function getPrimaryAxis(key: OpenSee.IGraphProps) {
    if (key.DataType === "Voltage")
        return "Voltage" as OpenSee.Unit
    else if (key.DataType === "Current")
        return "Current" as OpenSee.Unit
    else if (key.DataType === "FirstDerivative")
        return "VoltageperSecond" //make sure this is correct 
    else if (key.DataType === "Unbalance")
        return "Unbalance"
    else if (key.DataType === "THD")
        return "THD"
    else if (key.DataType === "RemoveCurrent")
        return "Current"
    else if (key.DataType === "Power")
        return "PowerP"
    else if (key.DataType === "Impedance")
        return "Impedance"
    else if (key.DataType === "Frequency")
        return "Freq"
    else
        return "Voltage" as OpenSee.Unit

}

function updateFFTAutoLimits(plot: OpenSee.IGraphstate, start: number, end: number, baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>) {
    const RelevantAxis = _.uniq(plot.data.map((s) => s.Unit));

    RelevantAxis.forEach((axis) => {
        const autoLimits = !plot.isZoomed && baseUnits[axis].useAutoLimits;
        if (!autoLimits || plot.key.DataType != 'FFT')
            return;
        plot.yLimits[axis].dataLimits = recomputeDataLimits(start, end,
            plot.data.filter((item, i) => plot.enabled[i]));
        updateActiveUnits(baseUnits, plot.yLimits[axis], axis);
    });
}

function updatedCycleAutoLimits(plot: OpenSee.IGraphstate, start: number, end: number, baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>) {
    const RelevantAxis = _.uniq(plot.data.map((s) => s.Unit));

    RelevantAxis.forEach((axis) => {
        const autoLimits = !plot.isZoomed && baseUnits[axis].useAutoLimits;
        if (!autoLimits || plot.key.DataType != 'OverlappingWave')
            return;
        plot.yLimits[axis].dataLimits = recomputeDataLimits(start, end,
            plot.data.filter((item, i) => plot.enabled[i]));
        updateActiveUnits(baseUnits, plot.yLimits[axis], axis);
    });
}
// #endregion

// #region [ Helper Functions ]

//This Function Recomputes y Limits based on X limits for all states
function recomputeDataLimits(start: number, end: number, data: OpenSee.iD3DataSeries[]): [number, number] {

    let limitedData = data.map((item, index) => {
        let dataPoints = item.DataPoints;
        if (item.SmoothDataPoints.length > 0)
            dataPoints = item.SmoothDataPoints;

        let indexStart = getIndex(start, dataPoints);
        let indexEnd = getIndex(end, dataPoints);

        let dt = dataPoints.slice(indexStart, indexEnd).map(p => p[1]).filter(p => !isNaN(p) && isFinite(p));
        return [Math.min(...dt), Math.max(...dt)];
        
    });

    let yMin = Math.min(...limitedData.map(item => item[0]));
    let yMax = Math.max(...limitedData.map(item => item[1]));

    const pad = (yMax - yMin) / 20;
    return [yMin - pad, yMax + pad];
    
}

function recomputeNonAutoLimits(oldLimits: [number, number], newLimits: [number, number], currentLimits: [number, number]): [number, number] {
    // Calculate the proportion of the current limits relative to the old range

    const oldRange = oldLimits[1] - oldLimits[0]; 
    const lowerLimit = (currentLimits[0] - oldLimits[0]) / oldRange;
    const upperLimit = (currentLimits[1] - oldLimits[0]) / oldRange;

    // Apply the proportional change to the new range
    const newRange = newLimits[1] - newLimits[0];
    const updatedLowerLimit = newLimits[0] + lowerLimit * newRange;
    const updatedUpperLimit = newLimits[0] + upperLimit * newRange;

    return [updatedLowerLimit, updatedUpperLimit];
}

function recomputeZoomedLimits(oldLimits: [number, number], newLimits: [number, number], currentLimits: [number, number]): [number, number] {
    // Calculate the proportion of the current limits relative to the old range
    const oldRange = oldLimits[1] - oldLimits[0];
    const lowerLimit = (newLimits[0] - oldLimits[0]) / oldRange;
    const upperLimit = (newLimits[1] - oldLimits[0]) / oldRange;

    // Apply the proportional change to the new range
    const currentRange = currentLimits[1] - currentLimits[0];
    const updatedLowerLimit = currentLimits[0] + lowerLimit * currentRange;
    const updatedUpperLimit = currentLimits[0] + upperLimit * currentRange;

    return [updatedLowerLimit, updatedUpperLimit];
}



//function that Updates the Current Units if they are on auto 
function updateActiveUnits(units: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, unit: OpenSee.Unit, data: OpenSee.iD3DataSeries[], startTime: number, endTime: number, manualLimits: [number, number]) {
    if (!units[unit].isAuto)
        return;

    let relevantData = data.filter(d => d.Unit == unit).map(d => {
        let startIndex = getIndex(startTime, d.DataPoints);
        let endIndex = getIndex(endTime, d.DataPoints);
        return d.DataPoints.slice(startIndex, endIndex);
    })


    let min = Math.min(...relevantData.map(d => Math.min(...d.map(p => p[1]))));
    let max = Math.max(...relevantData.map(d => Math.max(...d.map(p => p[1]))));
   
    let autoFactor = 0.000001

    if (manualLimits) { // for the case of auto unit being selected with manualLimits applied
        min = manualLimits[0]
        max = manualLimits[1]
    }

    if (Math.max(max, min) < 1)
        autoFactor = 1000
    else if (Math.max(max, min) < 1000)
        autoFactor = 1
    else if (Math.max(max, min) < 1000000)
        autoFactor = 0.001


    //Logic to move on to next if We can not find that Factor
    if (defaultSettings.Units[unit].options.findIndex(item => item.factor == autoFactor) >= 0)
        return defaultSettings.Units[unit].options.findIndex(item => item.factor == autoFactor)
    else {
        //Unable to find Factor try moving one down/up
        if (autoFactor < 1)
            autoFactor = autoFactor * 1000
        else
            autoFactor = 1

        if (defaultSettings.Units[unit].options.findIndex(item => item.factor == autoFactor) >= 0)
            return defaultSettings.Units[unit].options.findIndex(item => item.factor == autoFactor)
        else
            return defaultSettings.Units[unit].options.findIndex(item => item.factor != 0)
    }
}


// Functioon that gets a Tooltip Display Name
function GetDisplayName(d: OpenSee.iD3DataSeries, type: OpenSee.graphType) {
    if (type == 'Voltage' || type == 'Current')
        return d.LegendGroup + (type == 'Voltage' ? ' V ' : ' I ') + d.LegendVertical + ' ' + d.LegendHorizontal;
    if (type == 'FirstDerivative')
        return d.LegendGroup + ' ' + d.LegendVGroup + ' derrivative ' + d.LegendHorizontal + ' ' + d.LegendVertical;
    if (type == 'ClippedWaveforms')
        return d.LegendGroup + ' ' + ' clipped WaveForm ' + d.LegendVertical;
    if (type == 'Frequency')
        return d.LegendGroup + ' Frequency ' + d.LegendVertical;
    if (type == 'HighPassFilter')
        return d.LegendGroup + ' ' + d.LegendHorizontal + ' HPF ' + d.LegendVertical;
    if (type == 'LowPassFilter')
        return d.LegendGroup + ' ' + d.LegendHorizontal + ' LPF ' + d.LegendVertical;

    else
        return type;

}


// Function to get Default Enabled Traces
function GetDefaults(type: OpenSee.graphType, defaultTraces: OpenSee.IDefaultTrace, defaultVoltage: 'L-L'|'L-N', data: OpenSee.iD3DataSeries[]): boolean[] {

    if (type == 'Voltage') 
        return data.map(item => item.LegendVGroup == defaultVoltage &&
            ((item.LegendHorizontal == 'Ph' && defaultTraces.Ph) ||
                (item.LegendHorizontal == 'RMS' && defaultTraces.RMS) ||
                (item.LegendHorizontal == 'Pk' && defaultTraces.Pk) ||
                (item.LegendHorizontal == 'W' && defaultTraces.W)
            ))
    
    if ( type == 'Current') 
        return data.map(item => ((item.LegendHorizontal == 'Ph' && defaultTraces.Ph) ||
            (item.LegendHorizontal == 'RMS' && defaultTraces.RMS) ||
            (item.LegendHorizontal == 'Pk' && defaultTraces.Pk) ||
            (item.LegendHorizontal == 'W' && defaultTraces.W)
        ))

    if (type == 'FaultDistance')
        return data.map(item =>
            item.LegendVertical == 'Simple' ||
            item.LegendVertical == 'Reactance' ||
            item.LegendVertical == 'Takagi' ||
            item.LegendVertical == 'ModifiedTakagi' ||
            item.LegendVertical == 'Novosel')
    
    if (type == 'FirstDerivative') 
        return data.map(item => ((item.LegendHorizontal == 'W' && defaultTraces.W) ||
            (item.LegendHorizontal == 'RMS' && defaultTraces.RMS))
            && item.LegendVertical != 'NG' && item.LegendVertical != 'RES')
    
    if (type == 'ClippedWaveforms') 
        return data.map(item => item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN')
    
    if (type == 'Frequency') 
        return data.map(item => item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN')
    
    if (type == 'HighPassFilter' || type == 'LowPassFilter') 
        return data.map(item => item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN')
    
    if (type == 'MissingVoltage' || type == 'OverlappingWave') 
        return data.map(item => item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN')
    
    if (type == 'Power') 
        return data.map(item => (item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN') && item.LegendHorizontal == 'P')
    
    if (type == 'Impedance') 
        return data.map(item => (item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN') && item.LegendHorizontal == 'R')
    
    if (type == 'RapidVoltage') 
        return data.map(item => (item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN'))
    
    if (type == 'Rectifier')
        return data.map(item => item.LegendHorizontal === 'V')

    if (type == 'SymetricComp') 
        return data.map(item => (item.LegendVertical == 'Pos'))
    
    if (type == 'THD')
        return data.map(item => (item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN'))

    if (type == 'Unbalance') 
        return data.map(item => (item.LegendVertical == 'S2/S1'))
    
    if (type == 'FFT') 
        return data.map(item => (item.LegendHorizontal == 'Mag' && item.LegendVGroup == 'Volt.'))

    if (type == 'Harmonic')
        return data.map(item => (item.LegendHorizontal == 'Mag'))

    if (type == 'RemoveCurrent')
        return data.map(item => (item.LegendHorizontal == 'Pre'))

    return data.map(item => false);
}

// #endregion` */