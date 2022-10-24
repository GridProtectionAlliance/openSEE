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
import _, { add, uniq } from 'lodash';
import {  selectActiveUnit, selectUnit } from './settingSlice';
import { LoadOverlappingEvents } from './eventSlice';
import { SetTimeUnit as SetTimeUnitSetting, SetUnit as SetUnitSetting } from './settingSlice';
import { AddRequest, AppendRequest, CancelAnalytics } from './RequestHandler';
declare var eventID: number;


interface IExtendedKey extends OpenSee.IGraphProps { key?: string }
// #region [ Thunks ]

//Thunk to Create Plot
export const InitiateDetailed = createAsyncThunk('Data/InitiateDetailed', async (arg: OpenSee.IGraphProps, thunkAPI) => {
    AppendRequest(arg, getDetailedData(arg, thunkAPI.dispatch, (thunkAPI.getState() as OpenSee.IRootState).Analytic))
    return Promise.resolve();
});

export const AddPlot = createAsyncThunk('Data/addPlot', async (arg: OpenSee.IGraphProps, thunkAPI) => {

    thunkAPI.dispatch(DataReducer.actions.AddKey({ ...arg, key: thunkAPI.requestId }));

    let index = (thunkAPI.getState() as OpenSee.IRootState).Data.plotKeys.findIndex(item => item.DataType == arg.DataType && item.EventId == arg.EventId)

    if ((thunkAPI.getState() as OpenSee.IRootState).Data.loading[index] != 'Idle')
        return;

    thunkAPI.dispatch(DataReducer.actions.SetLoading({ key: arg, state: 'Loading' }));

    let handles = getData(arg, thunkAPI.dispatch, (thunkAPI.getState() as OpenSee.IRootState).Analytic, thunkAPI.requestId);
    AddRequest(arg, handles);
    return await Promise.all(handles);
})

//Thunk to Add Data
const AddData = createAsyncThunk('Data/addData', (arg: { key: OpenSee.IGraphProps, data: OpenSee.iD3DataSeries[], requestID: string, secondary: boolean }, thunkAPI) => {

    thunkAPI.dispatch(DataReducer.actions.AppendData({ ...arg, defaultTraces: (thunkAPI.getState() as OpenSee.IRootState).Settings.DefaultTrace, defaultV: (thunkAPI.getState() as OpenSee.IRootState).Settings.DefaultVType, baseUnits: (thunkAPI.getState() as OpenSee.IRootState).Settings.Units, requestID: arg.requestID }))

    return Promise.resolve();
})

//Thunk to update Time Limits
export const SetTimeLimit = createAsyncThunk('Data/setTimeLimit', (arg: { start: number, end: number }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateTimeLimit({ ...arg, baseUnits: (thunkAPI.getState() as OpenSee.IRootState).Settings.Units }))
    return Promise.resolve();
})

//Thunk to update Cycle Limits
export const SetCycleLimit = createAsyncThunk('Data/SetCycleLimit', (arg: { start: number, end: number }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.updatecycleLimit({ ...arg, baseUnits: (thunkAPI.getState() as OpenSee.IRootState).Settings.Units }))
    return Promise.resolve();
})


//Thunk to update FFT Limits
export const SetFFTLimits = createAsyncThunk('Data/SetFFTLimits', (arg: { start: number, end: number }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateFFTLimits({ ...arg, baseUnits: (thunkAPI.getState() as OpenSee.IRootState).Settings.Units }))
    return Promise.resolve();
})


//Thunk to Enable or Disable Trace
export const EnableTrace = createAsyncThunk('Data/EnableTrace', (arg: { key: OpenSee.IGraphProps, trace: number[], enabled: boolean }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateTrace({ ...arg, baseUnits: (thunkAPI.getState() as OpenSee.IRootState).Settings.Units, singlePlot: (thunkAPI.getState() as OpenSee.IRootState).Settings.SinglePlot }))
    return Promise.resolve();
});

//Thunk to Reset Zoom
export const ResetZoom = createAsyncThunk('Data/Reset', (arg: { start: number, end: number }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateTimeLimit({ ...arg, baseUnits: (thunkAPI.getState() as OpenSee.IRootState).Settings.Units }));

    // FFT Limits get updated base on values not eventTime
    let state = (thunkAPI.getState() as OpenSee.IRootState);
    let fftIndex = state.Data.plotKeys.findIndex(item => item.DataType == 'FFT');
    if (fftIndex > -1) {
        let start = Math.min(...state.Data.data[fftIndex].map(item => Math.min(...item.DataPoints.map(pt => pt[0]))));
        let end = Math.max(...state.Data.data[fftIndex].map(item => Math.max(...item.DataPoints.map(pt => pt[0]))));

        thunkAPI.dispatch(DataReducer.actions.UpdateFFTLimits({ start: start, end: end, baseUnits: state.Settings.Units }));
    }

    state.Data.plotKeys
        .forEach((graph) => {
            thunkAPI.dispatch(DataReducer.actions.UpdateYLimit({ key: { DataType: graph.DataType, EventId: graph.EventId }, baseUnits: state.Settings.Units }));
        });
    return Promise.resolve();
})

// Thunk to Set YLimits
export const SetYLimits = createAsyncThunk('Data/SetYLimits', (arg: { min: number, max: number, key: any }, thunkAPI) => {
    thunkAPI.dispatch(DataReducer.actions.UpdateYLimit({ ...arg, baseUnits: (thunkAPI.getState() as OpenSee.IRootState).Settings.Units }));

    return Promise.resolve();
})

//Thunk to set EventID
export const SetEventID = createAsyncThunk('Data/setEventID', (arg: number, thunkAPI) => {

    let oldData = (thunkAPI.getState() as OpenSee.IRootState).Data.plotKeys
    let oldTypes = oldData.map(item => item.DataType);
    oldData.forEach(item => thunkAPI.dispatch(DataReducer.actions.RemovePlot(item)));
    thunkAPI.dispatch(DataReducer.actions.UpdateEventId(arg))
    oldTypes.forEach(item => thunkAPI.dispatch(AddPlot({ DataType: item, EventId: arg })))

    thunkAPI.dispatch(LoadOverlappingEvents())

    return Promise.resolve();
})

// Thunk to Update time Units
export const SetTimeUnit = createAsyncThunk('Data/SetTimeUnit', (arg: number, thunkAPI) => {

    thunkAPI.dispatch(SetTimeUnitSetting(arg));
    let unit = (thunkAPI.getState() as OpenSee.IRootState).Settings.Units;
    thunkAPI.dispatch(UpdateActiveUnits(unit));
})

export const SetUnit = createAsyncThunk('Data/SetUnit', (arg: { unit: OpenSee.Unit, value: number }, thunkAPI) => {

    thunkAPI.dispatch(SetUnitSetting(arg));
    let unit = (thunkAPI.getState() as OpenSee.IRootState).Settings.Units;
    thunkAPI.dispatch(UpdateActiveUnits(unit));
})

// Thunk to set Analytic
export const SetAnalytic = createAsyncThunk<Promise<any>, OpenSee.Analytic, {}>('Data/setAnalytic', (arg: OpenSee.Analytic, thunkAPI) => {

    
    // Remove any old Analytic
    let eventId = (thunkAPI.getState() as OpenSee.IRootState).Data.eventID
    let oldData = (thunkAPI.getState() as OpenSee.IRootState).Data.plotKeys.filter(item => item.DataType != 'Voltage' && item.DataType != 'Current' && item.DataType != 'Analogs' && item.DataType != 'Digitals' && item.DataType != 'TripCoil');
    oldData.forEach(item => thunkAPI.dispatch(DataReducer.actions.RemovePlot(item)));

    thunkAPI.dispatch(DataReducer.actions.UpdateAnalytic(arg));
    CancelAnalytics();
    if (arg == 'none')
        return Promise.resolve();

    //Add current Analytic
    thunkAPI.dispatch(DataReducer.actions.AddKey({ DataType: arg as OpenSee.graphType, EventId: eventId, key: thunkAPI.requestId }));
    thunkAPI.dispatch(DataReducer.actions.SetLoading({ key: { DataType: arg as OpenSee.graphType, EventId: eventId }, state: 'Loading' }));

    
    let handles = getData({ DataType: arg as OpenSee.graphType, EventId: eventId }, thunkAPI.dispatch, (thunkAPI.getState() as OpenSee.IRootState).Analytic, thunkAPI.requestId);
    AddRequest({ DataType: arg as OpenSee.graphType, EventId: eventId },handles)

    return Promise.all(handles);
})

//Thunk to Update Plot
export const UpdateAnalyticPlot = createAsyncThunk('Data/updatePlot', async (_, thunkAPI) => {

   
    let index = (thunkAPI.getState() as OpenSee.IRootState).Data.plotKeys.findIndex(item => item.DataType != 'Voltage' && item.DataType != 'Current' && item.DataType != 'Analogs' && item.DataType != 'Digitals' && item.DataType != 'TripCoil');
    if (index == -1)
        return;
    let key = (thunkAPI.getState() as OpenSee.IRootState).Data.plotKeys[index];

    //Remove existing Data
    thunkAPI.dispatch(DataReducer.actions.AddKey({ ...key, key: thunkAPI.requestId }));

    thunkAPI.dispatch(DataReducer.actions.SetLoading({ key: key, state: 'Loading' }));

    CancelAnalytics();
    let handles = getData(key, thunkAPI.dispatch, (thunkAPI.getState() as OpenSee.IRootState).Analytic, thunkAPI.requestId );
    AddRequest(key, handles)

    return await Promise.all(handles);
})
// #endregion




export const DataReducer = createSlice({
    name: 'Data',
    initialState: {
        startTime: 0 as number,
        endTime: 0 as number,
        hover: [0, 0] as number[],
        mouseMode: 'zoom' as OpenSee.MouseMode,
        zoomMode: 'x' as OpenSee.ZoomMode,
        eventID: eventID as number,
        Analytic: 'none' as OpenSee.Analytic,
        selectedIndixes: [] as number[][],
        plotKeys: [] as OpenSee.IGraphProps[],
        data: [] as Array<OpenSee.iD3DataSeries>[],
        activeRequest: [] as string[],
        enabled: [] as Array<boolean>[],
        loading: [] as OpenSee.LoadingState[],
        activeUnits: [] as OpenSee.IActiveUnits[],
        yLimits: [] as [number, number][],
        autoLimits: [] as boolean[],
        fftLimits: [0, 0],
        cycleLimit: [0, 1000.0/60.0]
    } as OpenSee.IDataState,
    reducers: {
        RemovePlot: (state, action: PayloadAction<OpenSee.IGraphProps>) => {
            let index = state.plotKeys.findIndex(item => item.DataType == action.payload.DataType && item.EventId == action.payload.EventId)
            if (index > -1) {
                state.plotKeys.splice(index, 1);
                state.data.splice(index, 1);
                state.enabled.splice(index, 1);
                state.loading.splice(index, 1);
                state.activeUnits.splice(index, 1);
                state.yLimits.splice(index, 1);
                state.autoLimits.splice(index, 1);
                state.selectedIndixes.splice(index, 1);
                state.activeRequest.splice(index, 1);
            }
        },
        UpdateEventId: (state, action: PayloadAction<number>) => {
            state.eventID = action.payload;
        },
        SetLoading: (state, action: PayloadAction<{ key: OpenSee.IGraphProps, state: OpenSee.LoadingState }>) => {
            let index = state.plotKeys.findIndex(item => item.DataType == action.payload.key.DataType && item.EventId == action.payload.key.EventId);

            state.loading[index] = action.payload.state;
            return state;
        },
        UpdateAnalytic: (state, action: PayloadAction<OpenSee.Analytic>) => {
            state.Analytic = action.payload;
            return state;
        },
        AddKey: (state, action: PayloadAction<IExtendedKey>) => {

            let index = state.plotKeys.findIndex(item => item.DataType == action.payload.DataType && item.EventId == action.payload.EventId)
            if (index > -1) {
                state.data[index] = [];
                state.selectedIndixes[index] = [];
                state.activeRequest[index] = (action.payload.key == null ? '' : action.payload.key);
                return state;
            }

            state.plotKeys.push(action.payload);
            state.data.push([]);
            state.enabled.push([]);
            state.loading.push('Idle');
            state.activeUnits.push({
                Voltage: 0, Current: 0, Angle: 0, VoltageperSecond: 0, CurrentperSecond: 0, Freq: 0, Impedance: 0,
                PowerP: 0, PowerQ: 0, PowerS: 0, PowerPf: 0, TCE: 0, Distance: 0, Unbalance: 0, THD: 0, });
            state.yLimits.push([0, 1]);
            state.autoLimits.push(true);
            state.selectedIndixes.push([]);
            state.activeRequest.push((action.payload.key == null ? '' : action.payload.key));
            return state;
        },
        AppendData: (state, action: PayloadAction<{ key: OpenSee.IGraphProps, data: Array<OpenSee.iD3DataSeries>, baseUnits: OpenSee.IUnitCollection, requestID: string, defaultTraces: OpenSee.IDefaultTrace, defaultV: 'L-L'|'L-N' }>) => {
            let index = state.plotKeys.findIndex(item => item.DataType == action.payload.key.DataType && item.EventId == action.payload.key.EventId)

            if (state.activeRequest[index] != action.payload.requestID)
                return state;

            state.data[index] = [...state.data[index], ...action.payload.data]

            let extendEnabled = GetDefaults(action.payload.key.DataType, action.payload.defaultTraces, action.payload.defaultV,action.payload.data);
            
            state.enabled[index] = [...state.enabled[index], ...extendEnabled]

            state.activeUnits[index] = updateUnits(action.payload.baseUnits, state.data[index], state.startTime, state.endTime);

            if (state.plotKeys[index].DataType == 'FFT')
                state.fftLimits = [Math.min(...state.data[index].map(item => Math.min(...item.DataPoints.map(pt => pt[0])))), Math.max(...state.data[index].map(item => Math.max(...item.DataPoints.map(pt => pt[0]))))]

            if (state.autoLimits[index] && state.plotKeys[index].DataType != 'FFT' && state.plotKeys[index].DataType != 'OverlappingWave')
                state.yLimits[index] = recomputeYLimits(state.startTime, state.endTime, state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
            else if (state.autoLimits[index] && state.plotKeys[index].DataType == 'FFT')
                state.yLimits[index] = recomputeYLimits(state.fftLimits[0], state.fftLimits[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
            else if (state.autoLimits[index] && state.plotKeys[index].DataType == 'OverlappingWave')
                state.yLimits[index] = recomputeYLimits(state.cycleLimit[0], state.cycleLimit[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);

           
            return state
        },
        ReplaceData: (state, action: PayloadAction<{ key: OpenSee.IGraphProps, data: Array<OpenSee.iD3DataSeries> }>) => {
            let index = state.plotKeys.findIndex(item => item.DataType == action.payload.key.DataType && item.EventId == action.payload.key.EventId)
            if (index == -1)
                return state;
            let updated = [];

            action.payload.data.forEach(d => {
                let dIndex = state.data[index].findIndex((od,di) => od.LegendGroup == d.LegendGroup && od.LegendHorizontal == d.LegendHorizontal && od.LegendVertical == d.LegendVertical && od.LegendVGroup == d.LegendVGroup && updated.indexOf(di) == -1);
                if (dIndex == -1)
                    return
                updated.push(dIndex);
                state.data[index][dIndex] = d;
            });
            return state;
        },
        UpdateTimeLimit: (state, action: PayloadAction<{ start: number, end: number, baseUnits: OpenSee.IUnitCollection }> ) => {
            if (Math.abs(action.payload.start - action.payload.end) < 10)
                return state;

            state.startTime = action.payload.start;
            state.endTime = action.payload.end;

            //Update All Units and limits
            state.plotKeys 
                .forEach((graph, index) => {
                    state.activeUnits[index] = updateUnits(action.payload.baseUnits, state.data[index], state.startTime, state.endTime);
                    if (state.autoLimits[index] && state.plotKeys[index].DataType != 'FFT')
                        state.yLimits[index] = recomputeYLimits(state.startTime, state.endTime, state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
                });
            return state;

        },
        UpdateFFTLimits: (state, action: PayloadAction<{ start: number, end: number, baseUnits: OpenSee.IUnitCollection }>) => {
            if (Math.abs(action.payload.start - action.payload.end) < 1)
                return state;

            state.fftLimits = [action.payload.start, action.payload.end];

            //Update All Units and limits
            state.plotKeys
                .forEach((graph, index) => {
                    if (state.autoLimits[index] && state.plotKeys[index].DataType == 'FFT') {
                        state.activeUnits[index] = updateUnits(action.payload.baseUnits, state.data[index], state.fftLimits[0], state.fftLimits[1]);
                        state.yLimits[index] = recomputeYLimits(state.fftLimits[0], state.fftLimits[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
                    }
                });
            return state;

        },
        updatecycleLimit: (state, action: PayloadAction<{ start: number, end: number, baseUnits: OpenSee.IUnitCollection }>) => {
            if (Math.abs(action.payload.start - action.payload.end) < 5)
                return state;

            state.cycleLimit = [action.payload.start, action.payload.end];

            //Update All Units and limits
            state.plotKeys
                .forEach((graph, index) => {
                    if (state.autoLimits[index] && state.plotKeys[index].DataType == 'OverlappingWave') {
                        state.activeUnits[index] = updateUnits(action.payload.baseUnits, state.data[index], state.cycleLimit[0], state.cycleLimit[1]);
                        state.yLimits[index] = recomputeYLimits(state.cycleLimit[0], state.cycleLimit[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
                    }
                });
            return state;

        },
        UpdateTrace: (state, action: PayloadAction<{ key: OpenSee.IGraphProps, trace: number[], enabled: boolean, baseUnits: OpenSee.IUnitCollection, singlePlot: boolean }>) => {
            let index = state.plotKeys.findIndex(item => item.DataType == action.payload.key.DataType && item.EventId == action.payload.key.EventId)

            let dat = state.enabled[index];

            if (action.payload.singlePlot) {
                dat = dat.concat(...state.enabled.filter((item, i) => state.plotKeys[i].DataType == action.payload.key.DataType && action.payload.key.EventId != state.plotKeys[i].EventId))
            }


            action.payload.trace.forEach(i => dat[i] = action.payload.enabled);

            if (action.payload.singlePlot) {
                // Split the enabled array back up into seperate arrays
                //First set is the active Plot (main eventID)
                state.enabled[index] = dat.slice(0, state.enabled[index].length);
                let ns = state.enabled[index].length;
                state.enabled.map((d, i) => i).filter(i => state.plotKeys[i].DataType == action.payload.key.DataType && action.payload.key.EventId != state.plotKeys[i].EventId).forEach(i => {
                    state.enabled[i] = dat.slice(ns, ns + state.enabled[i].length);
                    ns = ns + state.enabled[i].length;
                });
            }
            else
                state.enabled[index] = dat;

            let yLimits: [number, number] = [0, 0];
            let adjustLimits = true;

            // If we enabled some trace we only need to update if it's actually exceeding current Limits....
            if (state.autoLimits[index] && action.payload.enabled && state.plotKeys[index].DataType != 'FFT') {
                adjustLimits = false;
                let start = state.startTime;
                let end = state.endTime;
                if (state.plotKeys[index].DataType == 'OverlappingWave') {
                    start = state.cycleLimit[0];
                    end = state.cycleLimit[1];
                }
                let dLim = recomputeYLimits(start, end, action.payload.trace.filter(i => i < state.data[index].length).map(i => state.data[index][i]), action.payload.baseUnits, state.activeUnits[index]);

                if (dLim[0] < state.yLimits[index][0])
                    state.yLimits[index][0] = dLim[0];
                if (dLim[1] > state.yLimits[index][1])
                    state.yLimits[index][1] = dLim[1];
            }
            // If we disabled some traces and they are just inside the limits we don't have to recompute limits
            else if (state.autoLimits[index] && state.plotKeys[index].DataType != 'FFT') {
                let start = state.startTime;
                let end = state.endTime;
                if (state.plotKeys[index].DataType == 'OverlappingWave') {
                    start = state.cycleLimit[0];
                    end = state.cycleLimit[1];
                }

                let dLim = recomputeYLimits(start, end, action.payload.trace.filter(i => i < state.data[index].length).map(i => state.data[index][i]), action.payload.baseUnits, state.activeUnits[index]);
                if (dLim[0] > state.yLimits[index][0] && dLim[1] < state.yLimits[index][1])
                    adjustLimits = false;
            }

            if (state.autoLimits[index] && adjustLimits) {

                if (state.plotKeys[index].DataType != 'FFT' && state.plotKeys[index].DataType != 'OverlappingWave')
                    yLimits = recomputeYLimits(state.startTime, state.endTime, state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
                else if (state.plotKeys[index].DataType == 'OverlappingWave')
                    yLimits = recomputeYLimits(state.cycleLimit[0], state.cycleLimit[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
                else
                    yLimits = recomputeYLimits(state.fftLimits[0], state.fftLimits[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);

                if (yLimits[0] != state.yLimits[index][0] || yLimits[1] != state.yLimits[index][1])
                    state.yLimits[index] = yLimits;
            }
            return state
        },
        SetHover: (state, action: PayloadAction<{ t: number, y: number, snap: boolean }>) => {
            if (!action.payload.snap)
                state.hover = [action.payload.t, action.payload.y];
            else {
                let d = state.data.find((item,i) => !state.loading[i] && item.length > 0)[0];
                state.hover[1] = d.DataPoints[getIndex(action.payload.t, d.DataPoints)][0];
                state.hover[0] = action.payload.t;
            }
            return state;
        },
        SelectPoint: (state, action: PayloadAction<[number, number]>) => {
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
        SetMouseMode: (state, action: PayloadAction<OpenSee.MouseMode>) => {
            state.mouseMode = action.payload
        },
        SetZoomMode: (state, action: PayloadAction<OpenSee.ZoomMode>) => {
            state.zoomMode = action.payload
        },
        UpdateYLimit: (state, action: PayloadAction<{ key: OpenSee.IGraphProps, min?: number, max?: number, baseUnits: OpenSee.IUnitCollection }>) => {
            let index = state.plotKeys.findIndex(item => item.DataType == action.payload.key.DataType && item.EventId == action.payload.key.EventId)

            if (action.payload.min != undefined)
                state.autoLimits[index] = false;
            else
                state.autoLimits[index] = true;

            if (!state.autoLimits[index])
                state.yLimits[index] = [action.payload.min, action.payload.max];

            state.activeUnits[index] = updateUnits(action.payload.baseUnits, state.data[index], state.startTime, state.endTime);

            if (state.autoLimits[index] && state.plotKeys[index].DataType != 'FFT' && state.plotKeys[index].DataType != 'OverlappingWave')
                state.yLimits[index] = recomputeYLimits(state.startTime, state.endTime, state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
            else if (state.autoLimits[index] && state.plotKeys[index].DataType == 'FFT')
                state.yLimits[index] = recomputeYLimits(state.fftLimits[0], state.fftLimits[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
            else if (state.autoLimits[index] && state.plotKeys[index].DataType == 'OverlappingWave')
                state.yLimits[index] = recomputeYLimits(state.cycleLimit[0], state.cycleLimit[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload.baseUnits, state.activeUnits[index]);
        },
        ClearSelectPoints: (state) => {
            state.selectedIndixes.forEach((_, i) => state.selectedIndixes[i] = []);
        },
        RemoveSelectPoints: (state, action: PayloadAction<number>) => {
            state.selectedIndixes.forEach((_, i) => state.selectedIndixes[i].splice(action.payload, 1));
        },
        UpdateActiveUnits: (state, action: PayloadAction<OpenSee.IUnitCollection>) => {
            //Update All Units and limits
            state.plotKeys
                .forEach((graph, index) => {
                    state.activeUnits[index] = updateUnits(action.payload, state.data[index], state.startTime, state.endTime);
                    if (state.autoLimits[index] && state.plotKeys[index].DataType != 'FFT')
                        state.yLimits[index] = recomputeYLimits(state.startTime, state.endTime, state.data[index].filter((item, i) => state.enabled[index][i]), action.payload, state.activeUnits[index]);
                    else if (state.autoLimits[index])
                        state.yLimits[index] = recomputeYLimits(state.fftLimits[0], state.fftLimits[1], state.data[index].filter((item, i) => state.enabled[index][i]), action.payload, state.activeUnits[index]);
                });
            return state;
        },
    },
    extraReducers: (builder) => {

        builder.addCase(AddPlot.pending, (state, action) => {
            let index = state.plotKeys.findIndex(item => item.DataType == action.meta.arg.DataType && item.EventId == action.meta.arg.EventId)
            if (index > -1)
                state.loading[index] = 'Loading'
            return state
        });
        builder.addCase(AddPlot.fulfilled, (state, action) => {
            let index = state.plotKeys.findIndex(item => item.DataType == action.meta.arg.DataType && item.EventId == action.meta.arg.EventId)
            state.loading[index] = 'Idle'
            return state
        });
        builder.addCase(SetAnalytic.fulfilled, (state, action) => {
            let index = state.plotKeys.findIndex(item => item.DataType == (action.meta.arg as OpenSee.graphType))
            state.loading[index] = 'Idle';

            return state
        });

        builder.addCase(AddData.fulfilled, (state, action) => {
            let index = state.plotKeys.findIndex(item => item.DataType == (action.meta.arg.key.DataType as OpenSee.graphType) && item.EventId == action.meta.arg.key.EventId)
            state.loading[index] = 'Partial';

            return state
        });

        builder.addCase(UpdateAnalyticPlot.fulfilled, (state, action) => {
            let index = state.plotKeys.findIndex(item => item.DataType != 'Voltage' && item.DataType != 'Current' && item.DataType != 'Analogs' && item.DataType != 'Digitals' && item.DataType != 'TripCoil');

            state.loading[index] = 'Idle';

            return state
        });

    }

});


export const { SetHover, SetMouseMode, SelectPoint, SetZoomMode, RemoveSelectPoints, ClearSelectPoints, RemovePlot, UpdateActiveUnits } = DataReducer.actions;
export default DataReducer.reducer;

// #endregion

// #region [ Individual Selectors ]
export const selectData = () =>
    createSelector(
        (state: OpenSee.IRootState) => state.Data.data,
        (state: OpenSee.IRootState) => state.Data.plotKeys,
        (state: OpenSee.IRootState) => state.Settings.SinglePlot,
        (state: OpenSee.IRootState) => state.Settings.Tab,
        (_, type: OpenSee.IGraphProps) => type,
        FilterData
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

const FilterEnabled = (data: boolean[][], plotKeys: OpenSee.IGraphProps[], single: boolean, tab: OpenSee.Tab, key: OpenSee.IGraphProps) => {
    let index = plotKeys.findIndex((item => item.DataType == key.DataType && item.EventId == key.EventId));
    if (single && tab == 'Compare')
        return data[index].concat(...data.filter((item, i) => plotKeys[i].DataType == key.DataType && key.EventId != plotKeys[i].EventId))
    return data[index];
};

export const selectYLimits = (key: OpenSee.IGraphProps) => {
    return createSelector(
        (state: OpenSee.IRootState) => state.Data.yLimits,
        (state: OpenSee.IRootState) => state.Data.plotKeys,
        (state: OpenSee.IRootState) => state.Settings.SinglePlot,
        (state: OpenSee.IRootState) => state.Data.autoLimits,
        (state: OpenSee.IRootState) => state.Settings.Tab,
        (data, plotKeys, single, autoLimits, tab) => {
            let index = plotKeys.findIndex((item => item.DataType == key.DataType && item.EventId == key.EventId));
            if (single && autoLimits[index] && tab == 'Compare')
                return CombineLimits(data.filter((item, i) => plotKeys[i].DataType == key.DataType))
            
            return data[index];
        });

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


export const selectListGraphs = createSelector(
    (state: OpenSee.IRootState) => state.Data.plotKeys,
    (state: OpenSee.IRootState) => state.Data.eventID,
    (state: OpenSee.IRootState) => state.Settings.SinglePlot,
    (state: OpenSee.IRootState) => state.Settings.Tab,
    (keys, eventId, singlePlot, tab) => {
        if (singlePlot || tab != 'Compare')
        return keys.filter(item => item.EventId == eventId);
    return keys;
})

//For SettingsWindow
export const selectGraphTypes = createSelector((state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.eventID, (keys, eventId) => {
    let graphs = uniq(keys.map(item => item.DataType));
    return graphs.map(item => { return { DataType: item, EventId: eventId} as OpenSee.IGraphProps })
});

// For tooltip
export const selectHoverPoints = createSelector(selectUnit, selectEventID, selectHover, (state: OpenSee.IRootState) => state.Data.data, (state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.enabled,
    (state: OpenSee.IRootState) => state.Data.activeUnits,
    (baseUnit, eventID, hover, data, keys, enabled, activeUnits) => {
        let result: OpenSee.IPoint[] = [];

        data.forEach((item, index) => {
            if (keys[index].EventId != eventID)
                return;
            if (item.length == 0)
                return;
            let dataIndex = getIndex(hover[0], item[0].DataPoints);
            if (isNaN(dataIndex))
                return;
            result = result.concat(...item.filter((d, i) => enabled[index][i]).map(d => {
                dataIndex = getIndex(hover[0],d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: baseUnit[d.Unit].options[activeUnits[index][d.Unit]],
                    Value: (dataIndex > (d.DataPoints.length - 1) ? NaN : d.DataPoints[dataIndex][1]),
                    Name: GetDisplayName(d, keys[index].DataType),
                    BaseValue: d.BaseValue,
                    Time: 0,
                }
            }))
    })
    return result;
});

// for Tooltip with Delta
export const selectDeltaHoverPoints = createSelector(selectUnit, selectEventID, selectHover, (state: OpenSee.IRootState) => state.Data.data, (state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.enabled,
    (state: OpenSee.IRootState) => state.Data.selectedIndixes, (state: OpenSee.IRootState) => state.Data.activeUnits,
    (baseUnit, eventID, hover, data, keys, enabled, selectedData, activeUnits) => {
        let result: OpenSee.IPoint[] = [];
        data.forEach((item, index) => {
            if (keys[index].EventId != eventID)
                return;
            if (item.length == 0)
                return;
            let dataIndex = getIndex(hover[0], item[0].DataPoints);
            if (isNaN(dataIndex))
                return;
            result = result.concat(...item.filter((d, i) => enabled[index][i]).map(d => {
                dataIndex = getIndex(hover[0], d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: baseUnit[d.Unit].options[activeUnits[index][d.Unit]],
                    Value: (dataIndex > (d.DataPoints.length -1 ) ? NaN : d.DataPoints[dataIndex][1]),
                    Name: GetDisplayName(d, keys[index].DataType),
                    PrevValue: (selectedData[index].length > 0 ? ((selectedData[index][selectedData[index].length] - 1) > d.DataPoints.length ? NaN : d.DataPoints[selectedData[index][selectedData[index].length - 1]][1]) : NaN),
                    BaseValue: d.BaseValue,
                    Time: (selectedData[index].length > 0 ? ((selectedData[index][selectedData[index].length] - 1) > d.DataPoints.length ? NaN : d.DataPoints[selectedData[index][selectedData[index].length - 1]][0]) : NaN),
                }

            }))
        })
    return result;
});

// For vector
export const selectVPhases = createSelector(selectUnit, selectEventID, selectHover, (state: OpenSee.IRootState) => state.Data.data, (state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.enabled,
    (state: OpenSee.IRootState) => state.Data.activeUnits,
    (baseUnit, eventID, hover, data, keys, enabled, activeUnits) => {
        let index = keys.findIndex(item => item.DataType == 'Voltage' && item.EventId == eventID);

        if (index == -1)
            return [];
        let asset = uniq(data[index].filter((item, i) => enabled[index][i]).map(item => item.LegendGroup));
        let phase = uniq(data[index].filter((item, i) => enabled[index][i]).map(item => item.LegendVertical));

        if (data[index].length == 0)
            return []


        if (data[index].find(item => item.LegendHorizontal == 'Ph') == undefined)
            return [];

        let pointIndex = getIndex(hover[0], data[index].find(item => item.LegendHorizontal == 'Ph').DataPoints);
        if (isNaN(pointIndex))
            return [];

        let result: OpenSee.IVector[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                if (!data[index].some((item, i) => (item.LegendGroup == a && item.LegendVertical == p && enabled[index][i])))
                    return

                let d = data[index].filter((item, i) => (item.LegendGroup == a && item.LegendVertical == p));
                let phaseChannel = d.find(item => item.LegendHorizontal == 'Ph');
                let magnitudeChannel = d.find(item => item.LegendHorizontal == 'Pk');

                if (phaseChannel == undefined || magnitudeChannel == undefined)
                    return;

                let phase = (pointIndex > (phaseChannel.DataPoints.length - 1) ? NaN : phaseChannel.DataPoints[pointIndex][1]);
                let mag = (pointIndex > (magnitudeChannel.DataPoints.length -1)? NaN : magnitudeChannel.DataPoints[pointIndex][1]);
                result.push({
                    Color: phaseChannel.Color,
                    Unit: baseUnit.Voltage.options[activeUnits[index].Voltage],
                    PhaseUnit: baseUnit.Angle.options[activeUnits[index].Angle],
                    Phase: p,
                    Asset: a,
                    Magnitude: mag,
                    Angle: phase,
                    BaseValue: magnitudeChannel.BaseValue
                });

            })
        })

        return result;

})
export const selectIPhases = createSelector(selectUnit, selectEventID, selectHover, (state: OpenSee.IRootState) => state.Data.data, (state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.enabled,
    (state: OpenSee.IRootState) => state.Data.activeUnits,
    (baseUnit, eventID, hover, data, keys, enabled, activeUnits) => {
        let index = keys.findIndex(item => item.DataType == 'Current' && item.EventId == eventID);

        if (index == -1)
            return [];
        let asset = uniq(data[index].filter((item, i) => enabled[index][i]).map(item => item.LegendGroup));
        let phase = uniq(data[index].filter((item, i) => enabled[index][i]).map(item => item.LegendVertical));

        if (data[index].length == 0)
            return []

        if (data[index].find(item => item.LegendHorizontal == 'Ph') == undefined)
            return [];

        let pointIndex = getIndex(hover[0], data[index].find(item => item.LegendHorizontal == 'Ph').DataPoints);
        if (isNaN(pointIndex))
            return [];

        let result: OpenSee.IVector[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                if (!data[index].some((item, i) => (item.LegendGroup == a && item.LegendVertical == p && enabled[index][i])))
                    return

                let d = data[index].filter((item, i) => (item.LegendGroup == a && item.LegendVertical == p));
                let phaseChannel = d.find(item => item.LegendHorizontal == 'Ph');
                let magnitudeChannel = d.find(item => item.LegendHorizontal == 'Pk');

                if (phaseChannel == undefined || magnitudeChannel == undefined)
                    return;

                let phase = (pointIndex > (phaseChannel.DataPoints.length - 1) ? NaN : phaseChannel.DataPoints[pointIndex][1]);
                let mag = (pointIndex > (magnitudeChannel.DataPoints.length - 1) ? NaN : magnitudeChannel.DataPoints[pointIndex][1]);
                result.push({
                    Color: phaseChannel.Color,
                    Unit: baseUnit.Current.options[activeUnits[index].Current],
                    PhaseUnit: baseUnit.Angle.options[activeUnits[index].Angle],
                    Phase: p,
                    Asset: a,
                    Magnitude: mag,
                    Angle: phase,
                    BaseValue: magnitudeChannel.BaseValue
                });

            })
        })

        return result;

    })

// For Accumulated Point widget
export const selectSelectedPoints = createSelector(selectUnit, selectEventID, (state: OpenSee.IRootState) => state.Data.data, (state: OpenSee.IRootState) => state.Data.selectedIndixes,
    (state: OpenSee.IRootState) => state.Data.activeUnits, (state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.enabled,
    (baseUnit, eventID, data, selectedData, activeUnits, keys, enabled) => {
        let result: OpenSee.IPointCollection[] = [];
        
        data.forEach((item, index) => {
            if (keys[index].EventId != eventID)
                return;
            if (keys[index].DataType != 'Voltage' && keys[index].DataType != 'Current')
                return;
            if (item.length == 0)
                return;
            result = result.concat(...item.filter((d, i) => enabled[index][i]).map(d => {
                return {
                    Group: d.LegendGroup,
                    Name: (keys[index].DataType == 'Voltage' ? 'V ' : 'I ') + d.LegendVertical +' ' + d.LegendHorizontal,
                    Unit: baseUnit[d.Unit].options[activeUnits[index][d.Unit]],
                    Value: selectedData[index].map(j => d.DataPoints[j]),
                    BaseValue: d.BaseValue
                }

            }))

        })
        return result;
})


// For FFT Table
export const selectFFTData = createSelector((state: OpenSee.IRootState) => FilterData(state.Data.data, state.Data.plotKeys, state.Settings.SinglePlot, state.Settings.Tab, { DataType: 'FFT', EventId: state.Data.eventID }),
    (state: OpenSee.IRootState) => selectActiveUnit({ DataType: 'FFT', EventId: state.Data.eventID })(state),
    (data, activeUnits) => {
        
        if (data == null)
            return [];

        let asset = uniq(data.map(item => item.LegendGroup));
        let phase = uniq(data.map(item => item.LegendVertical));

        if (data.length == 0)
            return []


        let result: OpenSee.IFFTSeries[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                if (!data.some((item, i) => (item.LegendGroup == a && item.LegendVertical == p)))
                    return

                let d = data.filter((item, i) => (item.LegendGroup == a && item.LegendVertical == p));
                let phaseChannel = d.find(item => item.LegendHorizontal == 'Ang');
                let magnitudeChannel = d.find(item => item.LegendHorizontal == 'Mag');

                if (phaseChannel == undefined || magnitudeChannel == undefined)
                    return;

                result.push({
                    Color: phaseChannel.Color,
                    Unit: activeUnits[magnitudeChannel.Unit],
                    PhaseUnit: activeUnits['Angle'],
                    Phase: p,
                    Asset: a,
                    Magnitude: magnitudeChannel.DataPoints.map(item => item[1]),
                    Angle: phaseChannel.DataPoints.map(item => item[1]),
                    BaseValue: magnitudeChannel.BaseValue,
                    Frequency: magnitudeChannel.DataPoints.map(item => item[0]*60.0),
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

//This Function Grabs the Data for this Graph - Note that cases with multiple Event ID's need to be treated seperatly at the end
function getData(key: OpenSee.IGraphProps, dispatch: any, options: OpenSee.IAnalyticStore, requestID: string): Array<JQuery.jqXHR<any>> {
    let result = [];
    switch (key.DataType) {

        case ('Current'):
        case ('Voltage'):
            let handlePOW = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}` +
                    `&type=${key.DataType}` +
                    `&dataType=Time`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            let handleFreq = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}` +
                    `&type=${key.DataType}` +
                    `&dataType=Freq`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            handleFreq.then((data) => {
                dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: true }));
                dispatch(InitiateDetailed(key));
            })
            handlePOW.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })

            result.push(handleFreq);
            result.push(handlePOW);
            break;
        case ('Analogs'):
            let breakerAnalogsDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetAnalogsData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            breakerAnalogsDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(breakerAnalogsDataHandle);
            break;
        case ('Digitals'):
            let breakerDigitalsDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetBreakerData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            breakerDigitalsDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(breakerDigitalsDataHandle);
            break;
        case ('TripCoil'):
            let waveformTCEDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}` +
                    `&type=TripCoilCurrent` +
                    `&dataType=Time`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            waveformTCEDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false})) })
            result.push(waveformTCEDataHandle);
            break;
        case ('FirstDerivative'):
            let derivativeDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetFirstDerivativeData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            derivativeDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(derivativeDataHandle);
            break
        case ('ClippedWaveforms'):
            let clippedWaveformDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetClippedWaveformsData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            clippedWaveformDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(clippedWaveformDataHandle);
            break
        case ('Frequency'):
            let freqencyAnalyticDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetFrequencyData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            freqencyAnalyticDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(freqencyAnalyticDataHandle);
            break
        case ('HighPassFilter'):
            let highPassFilterDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetHighPassFilterData?eventId=${key.EventId}` +
                    `&filter=${options.HPFOrder}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            highPassFilterDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(highPassFilterDataHandle);
            break
        case ('LowPassFilter'):
            let lowPassFilterDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetLowPassFilterData?eventId=${key.EventId}` +
                    `&filter=${options.LPFOrder}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            lowPassFilterDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(lowPassFilterDataHandle);
            break

        case ('Impedance'):
            let impedanceDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetImpedanceData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            impedanceDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(impedanceDataHandle);
            break
        case ('Power'):
            let powerDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetPowerData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            powerDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(powerDataHandle);
            break
        case ('MissingVoltage'):
            let missingVoltageDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetMissingVoltageData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            missingVoltageDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(missingVoltageDataHandle);
            break
        case ('OverlappingWave'):
            let overlappingWaveformDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetOverlappingWaveformData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            overlappingWaveformDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(overlappingWaveformDataHandle);
            break
        case ('Rectifier'):
            let rectifierDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetRectifierData?eventId=${key.EventId}` +
                    `&Trc=${options.Trc}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            rectifierDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(rectifierDataHandle);
            break
        case ('RapidVoltage'):
            let rapidVoltageChangeDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetRapidVoltageChangeData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            rapidVoltageChangeDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(rapidVoltageChangeDataHandle);
            break
        case ('RemoveCurrent'):
            let removeCurrentDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetRemoveCurrentData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            removeCurrentDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(removeCurrentDataHandle);
            break
        case ('Harmonic'):
            let specifiedHarmonicDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetSpecifiedHarmonicData?eventId=${key.EventId}` +
                    `&specifiedHarmonic=${options.Harmonic}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            specifiedHarmonicDataHandle.then((data) => {
                dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false }));
                dispatch(InitiateDetailed(key));
            })
            result.push(specifiedHarmonicDataHandle);
            break
        case ('SymetricComp'):
            let symmetricalComponentsDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetSymmetricalComponentsData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            symmetricalComponentsDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(symmetricalComponentsDataHandle);
            break
        case ('THD'):
            let thdDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetTHDData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            thdDataHandle.then((data) => {
                dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false }));
                dispatch(InitiateDetailed(key));
            })
            result.push(thdDataHandle);
            break
        case ('Unbalance'):
            let unbalanceDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetUnbalanceData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            unbalanceDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(unbalanceDataHandle);
            break
        case ('FaultDistance'):
            let faultDistanceDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetFaultDistanceData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            faultDistanceDataHandle.then((data) => { dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false })) })
            result.push(faultDistanceDataHandle);
            break
        case ('Restrike'):
            let breakerRestrikeDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetBreakerRestrikeData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            breakerRestrikeDataHandle.then((data) => {
                dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false }));
                dispatch(InitiateDetailed(key));
            })
            result.push(breakerRestrikeDataHandle);
            break
        case ('FFT'):
            let fftAnalyticDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetFFTData?eventId=${key.EventId}&cycles=${options.FFTCycles}&startDate=${options.FFTStartTime}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            fftAnalyticDataHandle.then((data) => {
                dispatch(AddData({ key: key, data: data.Data, requestID: requestID, secondary: false }));
                dispatch(InitiateDetailed(key))
            })
            result.push(fftAnalyticDataHandle);
            break
        default:
            return []
            break;
    }


    return result;
}

function getDetailedData(key: OpenSee.IGraphProps, dispatch: any, options: OpenSee.IAnalyticStore): Array<JQuery.jqXHR<any>> {
    let result = [];
    switch (key.DataType) {

        case ('Current'):
        case ('Voltage'):
           
            let handleFreq = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}&fullRes=1` +
                    `&type=${key.DataType}` +
                    `&dataType=Freq`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            handleFreq.then((data) => {
                dispatch(DataReducer.actions.ReplaceData({ key: key, data: data.Data}));
            })

            result.push(handleFreq);
            break;
        case ('THD'):
            let thdDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetTHDData?eventId=${key.EventId}&fullRes=1`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            thdDataHandle.then((data) => {
                dispatch(DataReducer.actions.ReplaceData({ key: key, data: data.Data }));
            })
            result.push(thdDataHandle);
            break
        case ('Harmonic'):
            let specifiedHarmonicDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetSpecifiedHarmonicData?eventId=${key.EventId}&fullRes=1` +
                    `&specifiedHarmonic=${options.Harmonic}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            specifiedHarmonicDataHandle.then((data) => {
                dispatch(DataReducer.actions.ReplaceData({ key: key, data: data.Data }));
            })
            result.push(specifiedHarmonicDataHandle);
            break
        default:
            return [];
    }
    return result;
}
// #endregion

// #region [ Helper Functions ]

//This Function Recomputes y Limits based on X limits for all states
function recomputeYLimits(start: number, end: number, data: Array<OpenSee.iD3DataSeries>, baseUnit: OpenSee.IUnitCollection, activeUnits: OpenSee.IActiveUnits): [number, number] {

    let limitedData = data.map((item, index) => {
        let dataPoints = item.DataPoints;
        if (item.SmoothDataPoints.length > 0)
            dataPoints = item.SmoothDataPoints;

        let indexStart = getIndex(start, dataPoints);
        let indexEnd = getIndex(end, dataPoints);

        let factor = baseUnit[item.Unit].options[activeUnits[item.Unit]].factor;

        factor = (baseUnit[item.Unit].options[activeUnits[item.Unit]].short == 'pu' ? 1.0 / item.BaseValue : factor);
        let dt = dataPoints.slice(indexStart, indexEnd).map(p => p[1]).filter(p => !isNaN(p) && isFinite(p));
        return [Math.min(...dt) * factor, Math.max(...dt) * factor];
        
    });

    let yMin = Math.min(...limitedData.map(item => item[0]));
    let yMax = Math.max(...limitedData.map(item => item[1]));
    const pad = (yMax - yMin) / 20;
    return [yMin - pad, yMax + pad];
    
}


//function that finds the index of a corrsponding t
function getIndex(t: number, data: Array<[number, number]>): number {
    if (data.length < 2)
        return NaN;
    let dP = data[1][0] - data[0][0];

    if (t < data[0][0])
        return 0;

    if (t > data[data.length - 1][0])
        return (data.length - 1);
    let deltaT = t - data[0][0];

    return Math.floor(deltaT / dP);

}

//function that Updates the Current Units if they are on auto
function updateUnits(baseUnits: OpenSee.IUnitCollection, data: Array<OpenSee.iD3DataSeries>, startTime: number, endTime: number): OpenSee.IActiveUnits  {
    let result = mapUnits(baseUnits);
    let relevantUnits = _.uniq(data.map(item => item.Unit));

    relevantUnits.forEach(unit => {
        if (baseUnits[unit].options[result[unit]].short != 'auto')
            return;

        let relevantData = data.filter(d => d.Unit == unit).map(d => {
            let startIndex = getIndex(startTime, d.DataPoints);
            let endIndex = getIndex(endTime, d.DataPoints);
            return d.DataPoints.slice(startIndex, endIndex);
        })
        let min = Math.min(...relevantData.map(d => Math.min(...d.map(p => p[1]))));
        let max = Math.max(...relevantData.map(d => Math.max(...d.map(p => p[1]))));

        let autoFactor = 0.000001
        if (Math.max(max, min) < 1)
            autoFactor = 1000
        else if (Math.max(max, min) < 1000)
            autoFactor = 1
        else if (Math.max(max, min) < 1000000)
            autoFactor = 0.001

        //Logic to move on to next if We can not find that Factor
        if (baseUnits[unit].options.findIndex(item => item.factor == autoFactor) >= 0)
            result[unit] = baseUnits[unit].options.findIndex(item => item.factor == autoFactor)
        else {
            //Unable to find Factor try moving one down/up
            if (autoFactor < 1)
                autoFactor = autoFactor * 1000
            else
                autoFactor = 1

            if (baseUnits[unit].options.findIndex(item => item.factor == autoFactor) >= 0)
                result[unit] = baseUnits[unit].options.findIndex(item => item.factor == autoFactor)
            else
                result[unit] = baseUnits[unit].options.findIndex(item => item.factor != 0)
        }

    })

    return result;
}

// function returns current units as IActiveUnits
function mapUnits(units: OpenSee.IUnitCollection): OpenSee.IActiveUnits {
    let result = {};
    Object.keys(units).forEach(key => { result[key] = units[key].current });
    return result as OpenSee.IActiveUnits; 
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

// Function to Combine and resolve issues with Limits if single Plot is selected
function CombineLimits(limits: [number, number][]): [number,number] {
    let ymin = limits[0][0];
    let ymax = limits[0][1];

    ymin = Math.min(...limits.map(item => item[0]).filter(pt => isFinite(pt) && !isNaN(pt)));
    ymax = Math.max(...limits.map(item => item[1]).filter(pt => isFinite(pt) && !isNaN(pt)));
    

    return [ymin, ymax];
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
    
    if (type == 'SymetricComp') 
        return data.map(item => (item.LegendVertical == 'Pos'))
    
    if (type == 'Unbalance') 
        return data.map(item => (item.LegendVertical == 'S1/S2'))
    
    if (type == 'FFT') 
        return data.map(item => (item.LegendHorizontal == 'Mag' && item.LegendVGroup == 'Volt.'))

    return data.map(item => false);
}

// #endregion`