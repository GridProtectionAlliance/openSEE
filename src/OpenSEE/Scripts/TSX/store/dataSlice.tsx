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
import { emptygraph, getData, getDetailedData } from './GraphLogic';
import { dispatch } from 'd3';
import { RootState } from './store';
import { plot } from 'jquery';
declare var eventID: number;


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
export const AddPlot = createAsyncThunk('Data/addPlot', async (arg: { key: OpenSee.IGraphProps, yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, isZoomed?: boolean }, thunkAPI) => {
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

/*
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
    let plot = state.Data.Plots.find(item => item.key.DataType == 'FFT');

    if (plot != null) {
        let start = Math.min(...plot.data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]))));
        let end = Math.max(...plot.data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]))));

        thunkAPI.dispatch(DataReducer.actions.UpdateFFTLimits({ start: start, end: end, baseUnits: state.Settings.Units }));
    }

    state.Data.Plots
        .forEach((graph, index) => {
            const RelevantAxis = _.uniq(graph.data.map((s) => s.Unit));

            RelevantAxis.forEach((axis) => {

                const axisSetting: OpenSee.IAxisSettings = graph.yLimits[axis];
                if (state.Settings.Units[axis].useAutoLimits)
                    thunkAPI.dispatch(DataReducer.actions.SetCurrentYLimits({ axis: axis, limits: axisSetting.dataLimits, Plotindex: index }));
                else
                    thunkAPI.dispatch(DataReducer.actions.SetCurrentYLimits({ axis: axis, limits: axisSetting.manuallimits, Plotindex: index }));
            })
        })
    return Promise.resolve();
})


// Thunk to Set Zoomed YLimits
export const SetZoomedLimits = createAsyncThunk('Data/SetZoomedLimits', (arg: {
    limits: [number, number],
    key: OpenSee.IGraphProps,
    axis?: OpenSee.Unit
}, thunkAPI) => {
    let state = (thunkAPI.getState() as OpenSee.IRootState);
    let plot = state.Data.Plots.find(plot => plot.key.DataType == arg.key.DataType && plot.key.EventId == arg.key.EventId);
    const primaryAxis = getPrimaryAxis(arg.key)
    let primaryLimits = [0,1]

    if (plot.isZoomed)
        primaryLimits = plot.yLimits[primaryAxis].zoomedLimits
    else if (plot.yLimits[primaryAxis].isManual)
        primaryLimits = plot.yLimits[primaryAxis].manualLimits
    else 
        primaryLimits = plot.yLimits[primaryAxis].dataLimits

    let range = primaryLimits[1] - primaryLimits[0];
    let lowerLimit = (arg.limits[0] - primaryLimits[0]) / range
    let upperLimit = (arg.limits[1] - primaryLimits[1]) / range


    thunkAPI.dispatch(DataReducer.actions.SetZoomedLimits({ limits: arg.limits, key: arg.key, proportionalChange: [lowerLimit, upperLimit], axis: arg.axis }));
    return Promise.resolve();
})

//Thunk to set EventID
export const SetEventID = createAsyncThunk('Data/setEventID', (arg: number, thunkAPI) => {

    let oldData = (thunkAPI.getState() as OpenSee.IRootState).Data.Plots.map(p => p.key);
    let oldTypes = oldData.map(item => item.DataType);
    oldData.forEach(item => thunkAPI.dispatch(DataReducer.actions.RemovePlot(item)));
    thunkAPI.dispatch(DataReducer.actions.UpdateEventId(arg))
    oldTypes.forEach(item => thunkAPI.dispatch(AddPlot({ DataType: item, EventId: arg })))

    thunkAPI.dispatch(LoadOverlappingEvents())

    return Promise.resolve();
})*/

/*
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



//Thunk to Update Plot
export const UpdateAnalyticPlot = createAsyncThunk('Data/updatePlot', async (_, thunkAPI) => {

   
    let plot = (thunkAPI.getState() as OpenSee.IRootState).Data.Plots.find(item => item.key.DataType != 'Voltage' &&
        item.key.DataType != 'Current' && item.key.DataType != 'Analogs' && item.key.DataType != 'Digitals' && item.key.DataType != 'TripCoil');
    if (plot == null)
        return;
    //Remove existing Data
    thunkAPI.dispatch(DataReducer.actions.AddKey({ ...plot.key, key: thunkAPI.requestId }));

    thunkAPI.dispatch(DataReducer.actions.SetLoading({ key: plot.key, state: 'Loading' }));

    CancelAnalytics();
    let handles = getData(plot.key, thunkAPI.dispatch, (thunkAPI.getState() as OpenSee.IRootState).Analytic, thunkAPI.requestId);
    AddRequest(plot.key, handles)

    return await Promise.all(handles);
})
// #endregion

*/


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
        Plots: [] as OpenSee.IGraphstate[],
        fftLimits: [0, 0],
        cycleLimit: [0, 1000.0/60.0]
    } as OpenSee.IDataState,
    reducers: {        
        RemovePlot: (state: OpenSee.IDataState, action: PayloadAction<OpenSee.IGraphProps>) => {
            Cancel
            const index = state.Plots.findIndex(item => item.key.DataType == action.payload.DataType
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
        /*
        AppendData: (state: OpenSee.IDataState, action: PayloadAction<{
            key: OpenSee.IGraphProps, data: Array<OpenSee.iD3DataSeries>,
            defaultTraces: OpenSee.IDefaultTrace, defaultV: OpenSee.IDefaultVType,
            eventID: number
        }>) => {
            let currentPlot = state.Plots.find(item => item.key.DataType == action.payload.key.DataType && item.key.EventId == action.payload.key.EventId)

            if (currentPlot) {
                const isDuplicate = currentPlot.data.some(data => data.EventID === action.payload.eventID)
                if (isDuplicate)
                    return state

                const orignalLength = currentPlot.data.length
                //update plot with settings from local storage
                loadSettings(currentPlot)

                currentPlot.data.push(...action.payload.data);
                const newLength = currentPlot.data.length
            
                let extendEnabled = GetDefaults(action.payload.key.DataType, action.payload.defaultTraces, action.payload.defaultV, currentPlot.data);

                for (let i = orignalLength; i < newLength; i++) {
                    currentPlot.data[i].Enabled = extendEnabled[i];
                    currentPlot.data[i].EventID = action.payload.eventID
                }


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
        UpdateTrace: (state: OpenSee.IDataState, action: PayloadAction<{ key: OpenSee.IGraphProps, trace: number[], enabled: boolean, baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>, singlePlot: boolean }>) => {
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

            const RelevantAxis = _.uniq(state.data[index].map((s) => s.Unit));
            RelevantAxis.forEach((axis) => {
                const axisSetting: OpenSee.IAxisSettings = state.yLimits[index][axis];
                const autoLimits = !state.isZoomed[index] && action.payload.baseUnits[axis].useAutoLimits;
                if (autoLimits && state.plotKeys[index].DataType != 'FFT' && state.plotKeys[index].DataType != 'OverlappingWave')
                    axisSetting.dataLimits = recomputeDataLimits(state.startTime, state.endTime,
                        state.data[index].filter((item, i) => state.enabled[index][i]));
                else if (index && state.plotKeys[index].DataType == 'FFT')
                    axisSetting.dataLimits = recomputeDataLimits(state.fftLimits[0], state.fftLimits[1], state.data[index].filter((item, i) => state.enabled[index][i]));
                else if (autoLimits && state.plotKeys[index].DataType == 'OverlappingWave')
                    axisSetting.dataLimits = recomputeDataLimits(state.cycleLimit[0], state.cycleLimit[1], state.data[index].filter((item, i) => state.enabled[index][i]));

                updateActiveUnits(action.payload.baseUnits, axisSetting, axis);
            })
            return state
        },
        SetHover: (state: OpenSee.IDataState, action: PayloadAction<{ t: number, y: number }>) => {
            state.hover = [action.payload.t, action.payload.y];
            return state;
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
        SetMouseMode: (state: OpenSee.IDataState, action: PayloadAction<OpenSee.MouseMode>) => {
            state.mouseMode = action.payload
        },
        SetZoomMode: (state: OpenSee.IDataState, action: PayloadAction<OpenSee.ZoomMode>) => {
            state.zoomMode = action.payload
        },
        ClearSelectPoints: (state: OpenSee.IDataState) => {
            state.selectedIndixes.forEach((_, i) => state.selectedIndixes[i] = []);
        },
        RemoveSelectPoints: (state: OpenSee.IDataState, action: PayloadAction<number>) => {
            state.selectedIndixes.forEach((_, i) => state.selectedIndixes[i].splice(action.payload, 1));
        },
        SetZoomedLimits: (state: OpenSee.IDataState, action: PayloadAction<{
            limits: [number, number],
            key: OpenSee.IGraphProps,
            proportionalChange: [number, number],
            axis?: OpenSee.Unit //used for setting zoomedLimits from query
        }>) => {
            const curPlot = state.Plots.find(plot => plot.key.DataType == action.payload.key.DataType && plot.key.EventId == action.payload.key.EventId);

            if (action.payload.axis) {
                curPlot.yLimits[action.payload.axis].zoomedLimits = action.payload.limits
                return
            }


            const primaryAxis = getPrimaryAxis(action.payload.key)
            if (curPlot) {
                const RelevantAxis = _.uniq(curPlot.data.map(s => s.Unit));

                RelevantAxis.forEach(axis => {
                    let dataLimits = curPlot.yLimits[axis].dataLimits;
                    let manualLimits = curPlot.yLimits[axis].manualLimits;
                    let zoomedLimits = curPlot.yLimits[axis].zoomedLimits;
                    let range;

                    if (axis === primaryAxis) //dont need to scale the axis we calculated the factor from..
                        curPlot.yLimits[axis].zoomedLimits = action.payload.limits

                    else if (curPlot.yLimits[axis].isManual) {
                        range = manualLimits[1] - manualLimits[0];
                        curPlot.yLimits[axis].zoomedLimits = [manualLimits[0] + action.payload.proportionalChange[0] * range, manualLimits[1] + action.payload.proportionalChange[1] * range];
                    } else if (curPlot.isZoomed) {
                        range = zoomedLimits[1] - zoomedLimits[0];
                        curPlot.yLimits[axis].zoomedLimits = [zoomedLimits[0] + action.payload.proportionalChange[0] * range, zoomedLimits[1] + action.payload.proportionalChange[1] * range];
                    } else {
                        range = dataLimits[1] - dataLimits[0];
                        curPlot.yLimits[axis].zoomedLimits = [dataLimits[0] + action.payload.proportionalChange[0] * range, dataLimits[1] + action.payload.proportionalChange[1] * range];
                    }

                })

                curPlot.isZoomed = true;
            }
        },
        UpdateActiveUnits: (state: OpenSee.IDataState, action: PayloadAction<OpenSee.IUnitCollection<OpenSee.IUnitSetting>>) => {
            //Update All Units and limits
            state.plotKeys
                .forEach((graph, index) => {
                    const RelevantAxis = _.uniq(state.data[index].map((s) => s.Unit));
                    RelevantAxis.forEach((axis) => {
                        const axisSetting: OpenSee.IAxisSettings = state.yLimits[index][axis];
                        const isPU = (getCurrentUnits(action.payload)[axis] as OpenSee.iUnitOptions).short == 'pu';
                        if (isPU && state.plotKeys[index].DataType != 'FFT' && state.plotKeys[index].DataType != 'OverlappingWave')
                            axisSetting.dataLimits = recomputeDataLimits(state.startTime, state.endTime,
                                state.data[index].filter((item, i) => state.enabled[index][i]));
                        else if (isPU && state.plotKeys[index].DataType == 'FFT')
                            axisSetting.dataLimits = recomputeDataLimits(state.fftLimits[0], state.fftLimits[1], state.data[index].filter((item, i) => state.enabled[index][i]));
                        else if (isPU && state.plotKeys[index].DataType == 'OverlappingWave')
                            axisSetting.dataLimits = recomputeDataLimits(state.cycleLimit[0], state.cycleLimit[1], state.data[index].filter((item, i) => state.enabled[index][i]));

                        updateActiveUnits(action.payload, axisSetting, axis);
                    });
                 });
            return state;
        }, */
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
            let plot = state.Plots.find(item => item.key.DataType == action.meta.arg.DataType && item.key.EventId == action.meta.arg.EventId);
            plot.loading = 'Idle'
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
    (state: RootState) => state.Settings.SinglePlot,
    (plots, eventId, singlePlot) => {
        if (singlePlot)
            return plots.filter(item => item.key.EventId == eventId).map(p => p.key);
        return plots.map(p => p.key);
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
        (state: OpenSee.IRootState) => state.Settings.Tab,
        (data: OpenSee.IUnitCollection<OpenSee.IAxisSettings>[], plotKeys: OpenSee.IGraphProps[], single: boolean, tab: OpenSee.Tab) => {
            let index = plotKeys.findIndex((item => item.DataType == key.DataType && item.EventId == key.EventId));
            if (single && tab == 'Compare')
                return CombineLimits(data.filter((item, i) => plotKeys[i].DataType == key.DataType).map((item) => item.Voltage.dataLimits))

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



//For SettingsWindow
export const selectGraphTypes = createSelector((state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.eventID, (keys, eventId) => {
    let graphs = uniq(keys.map(item => item.DataType));
    return graphs.map(item => { return { DataType: item, EventId: eventId} as OpenSee.IGraphProps })
});

// For tooltip
export const selectHoverPoints = createSelector(selectUnit, selectEventID, selectHover, (state: OpenSee.IRootState) => state.Data.data, (state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.enabled,
    (baseUnit, eventID, hover, data, keys, enabled) => {
        let result: OpenSee.IPoint[] = [];

        data.forEach((item, index) => {
            if (keys[index].EventId != eventID)
                return;
            if (item.length == 0)
                return;
            let dataIndex = getIndex(hover[0], item[0].DataPoints);
            if (isNaN(dataIndex))
                return;

            const activeUnits = getCurrentUnits(baseUnit);
            result = result.concat(...item.filter((d, i) => enabled[index][i]).map(d => {
                dataIndex = getIndex(hover[0],d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: baseUnit[d.Unit].options[activeUnits[d.Unit]],
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
    (state: OpenSee.IRootState) => state.Data.selectedIndixes,
    (baseUnit, eventID, hover, data, keys, enabled, selectedData) => {
        let result: OpenSee.IPoint[] = [];
        const activeUnits = getCurrentUnits(baseUnit);
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
    (baseUnit, eventID, hover, data, keys, enabled) => {
        let index = keys.findIndex(item => item.DataType == 'Voltage' && item.EventId == eventID);
        const activeUnits = getCurrentUnits(baseUnit);
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
    (baseUnit, eventID, hover, data, keys, enabled) => {
        let index = keys.findIndex(item => item.DataType == 'Current' && item.EventId == eventID);
        const activeUnits = getCurrentUnits(baseUnit);
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
                    Unit: baseUnit.Current.options[activeUnits.Current],
                    PhaseUnit: baseUnit.Angle.options[activeUnits.Angle],
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
    (state: OpenSee.IRootState) => state.Data.plotKeys, (state: OpenSee.IRootState) => state.Data.enabled,
    (baseUnit, eventID, data, selectedData, keys, enabled) => {
        let result: OpenSee.IPointCollection[] = [];
        const activeUnits = getCurrentUnits(baseUnit);
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




//function that Updates the Current Units if they are on auto
function updateActiveUnits(baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>,
    axis: OpenSee.IAxisSettings, unit: OpenSee.Unit) {
    let currentUnits = getCurrentUnits(baseUnits);
   
    if (baseUnits[unit].options[currentUnits[unit]].short != 'auto')
        return;

    let min = axis.dataLimits[0];
    let max = axis.dataLimits[1];

    let autoFactor = 0.000001
    if (Math.max(max, min) < 1)
        autoFactor = 1000
    else if (Math.max(max, min) < 1000)
        autoFactor = 1
    else if (Math.max(max, min) < 1000000)
        autoFactor = 0.001

    //Logic to move on to next if We can not find that Factor
    if (baseUnits[unit].options.findIndex(item => item.factor == autoFactor) >= 0)
        axis.activeUnit = baseUnits[unit].options.findIndex(item => item.factor == autoFactor)
    else {
        //Unable to find Factor try moving one down/up
        if (autoFactor < 1)
            autoFactor = autoFactor * 1000
        else
            autoFactor = 1

        if (baseUnits[unit].options.findIndex(item => item.factor == autoFactor) >= 0)
            axis.activeUnit = baseUnits[unit].options.findIndex(item => item.factor == autoFactor)
        else
            axis.activeUnit = baseUnits[unit].options.findIndex(item => item.factor != 0)
    }
}

// function returns current units as IActiveUnits
function getCurrentUnits(units: OpenSee.IUnitCollection<OpenSee.IUnitSetting>): OpenSee.IActiveUnits {
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