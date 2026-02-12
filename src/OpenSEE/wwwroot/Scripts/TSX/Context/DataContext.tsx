//******************************************************************************************************
//  DataContext.tsx - Gbtc
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
//  02/06/2026 - G. Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import _ from 'lodash';
import * as React from 'react';
import { defaultSettings } from '../defaults';
import { OpenSee } from '../global';
import func from './DataContextFunctions';
import { emptygraph, getData } from '../Data/GraphLogic';
import { AddRequest } from '../Data/RequestHandler';
import AnalyticContext from './AnalyticContext';
import { useAppSelector } from '../hooks';
import { SelectDefaultTraces, SelectSinglePlot, SelectVTypeDefault } from '../store/settingSlice';

interface IProps {
}

interface IDataFunctions {
    SetTimeLimit: (start: number, end: number) => void,
    SetCycleLimit: (start: number, end: number) => void,
    SetFFTLimits: (start: number, end: number) => void,
    ResetZoom: (start: number, end: number) => void,
    SetZoomedLimits: (limits: [number, number], key: OpenSee.IGraphProps) => void,
    SetUnit: (unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps) => void,
    EnableTrace: (key: OpenSee.IGraphProps, trace: number[], enabled: boolean) => void,
    SetIsManual: (key: OpenSee.IGraphProps, unit: OpenSee.Unit, manual: boolean) => void,
    SetSelectPoint: (time: number) => void,
    ClearSelectPoints: () => void,
    RemoveSelectPoints: (index: number) => void,
    SetManualLimits: (limits: [number, number], key: OpenSee.IGraphProps, axis: OpenSee.Unit, auto: boolean, factor?: number) => void,
    AddPlot: (key: OpenSee.IGraphProps, yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, isZoomed?: boolean, fftLimits?: [number, number], cycleLimits?: [number, number]) => void,
    UpdateAnalyticPlot: (key: OpenSee.IGraphProps) => void,
}

interface IDataFunctionContextType {
    Dispatch: React.MutableRefObject<IDataFunctions | undefined>
}

const defaultState: OpenSee.IDataContextType = {
    StartTime: 0 as number,
    EndTime: 0 as number,
    Plots: [] as OpenSee.IGraphstate[],
    FftLimits: [0, 0],
    CycleLimits: [0, 1000.0 / 60.0]
};

export const DataContext = React.createContext<OpenSee.IDataContextType>(defaultState);
export const DataFunctionContext = React.createContext<IDataFunctionContextType>({ Dispatch: undefined });

// ToDo: A lot of element appear to add/remove plots on a toggle, we might wanna cache data somewhere instead...
export const DataProvider = (props: React.PropsWithChildren<IProps>) => {
    const [contextState, setContextState] = React.useState<OpenSee.IDataContextType>(defaultState);
    const contextRef = React.useRef<IDataFunctions>();
    const dispatch = React.useMemo(() => ({ Dispatch: contextRef }), []);

    const [analytic] = React.useContext(AnalyticContext);
    const oldAnalyticRef = React.useRef<{ [key: string]: number }>({});

    const defaultVType = useAppSelector(SelectVTypeDefault);
    const defaultTrace = useAppSelector(SelectDefaultTraces);
    const singlePlot = useAppSelector(SelectSinglePlot);

    // Context State Functions
    const SetTimeLimit = React.useCallback((start: number, end: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            func.UpdateTimeLimit(updatedContext, start, end);
            return updatedContext;
        })
    , []);

    const SetCycleLimit = React.useCallback((start: number, end: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            func.UpdateCycleLimits(updatedContext, start, end);
            return updatedContext;
        })
    , []);

    const SetFFTLimits = React.useCallback((start: number, end: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            func.UpdateFFTLimits(updatedContext, start, end);
            return updatedContext;
        })
    , []);

    const ResetZoom = React.useCallback((start: number, end: number) =>
        setContextState(c => {
            let updatedContext = _.cloneDeep(c);

            func.UpdateTimeLimit(updatedContext, start, end);

            // FFT Limits get updated base on values not eventTime
            const fftPlotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == 'FFT');
            const wavePlotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == 'OverlappingWave');
            if (fftPlotIndex > -1) {
                const start = Math.min(...updatedContext.Plots[fftPlotIndex].data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]))));
                const end = Math.max(...updatedContext.Plots[fftPlotIndex].data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]))));
                func.UpdateFFTLimits(updatedContext, start, end);
            }
            if (wavePlotIndex > -1) {
                const start = Math.min(...updatedContext.Plots[wavePlotIndex].data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]).filter(val => !isNaN(val)))));
                const end = Math.max(...updatedContext.Plots[wavePlotIndex].data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]).filter(val => !isNaN(val)))));
                func.UpdateCycleLimits(updatedContext, start, end);
            }

            for (let plotIndex = 0; plotIndex < updatedContext.Plots.length; plotIndex++) {
                updatedContext.Plots[plotIndex].isZoomed = false;
                const RelevantAxis = _.uniq(updatedContext.Plots[plotIndex].data.map(s => s.Unit));
                RelevantAxis.forEach(axis => {
                    updatedContext.Plots[plotIndex].yLimits[axis].zoomedLimits = [0, 1];
                });
            }

            return updatedContext;
        })
    , []);

    const SetZoomedLimits = React.useCallback((limits: [number, number], key: OpenSee.IGraphProps) =>
        setContextState(c => {
            const plotIndex = c.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            if (plotIndex <= -1)
                return c;

            const newContext = _.cloneDeep(c);

            const primaryAxis = func.getPrimaryAxis(newContext.Plots[plotIndex].key);
            let oldLimits: [number, number] = [0, 1];

            if (newContext.Plots[plotIndex].yLimits[primaryAxis].isManual)
                oldLimits = newContext.Plots[plotIndex].yLimits[primaryAxis].manualLimits;
            else if (newContext.Plots[plotIndex].isZoomed)
                oldLimits = newContext.Plots[plotIndex].yLimits[primaryAxis].zoomedLimits;
            else
                oldLimits = newContext.Plots[plotIndex].yLimits[primaryAxis].dataLimits;

            const RelevantAxis = _.uniq(newContext.Plots[plotIndex].data.filter(item => item.Enabled).map(s => s.Unit));

            RelevantAxis.forEach(axis => {
                if (axis === func.getPrimaryAxis(key))
                    newContext.Plots[plotIndex].yLimits[axis].zoomedLimits = limits;
                else if (newContext.Plots[plotIndex].yLimits[axis].isManual)
                    newContext.Plots[plotIndex].yLimits[axis].zoomedLimits = func.recomputeNonAutoLimits(oldLimits, limits, newContext.Plots[plotIndex].yLimits[axis].manualLimits);
                else if (newContext.Plots[plotIndex].isZoomed)
                    newContext.Plots[plotIndex].yLimits[axis].zoomedLimits = func.recomputeNonAutoLimits(oldLimits, limits, newContext.Plots[plotIndex].yLimits[axis].zoomedLimits);
                else
                    newContext.Plots[plotIndex].yLimits[axis].zoomedLimits = func.recomputeNonAutoLimits(oldLimits, limits, newContext.Plots[plotIndex].yLimits[axis].dataLimits);
            });
            newContext.Plots[plotIndex].isZoomed = true;
            return newContext;
        })
    , []);

    const SetUnit = React.useCallback((unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps) =>
        setContextState(c => {
            const newContext = _.cloneDeep(c);

            for (let plotIndex = 0; plotIndex < newContext.Plots.length; plotIndex++) {
                if (newContext.Plots[plotIndex].key.DataType !== key.DataType)
                    continue;

                const oldUnitIndex = newContext.Plots[plotIndex].yLimits[unit].current
                let newUnitIndex = value
                const oldFactor = defaultSettings.Units[unit].options[oldUnitIndex].factor
                const newFactor = defaultSettings.Units[unit].options[newUnitIndex].factor
                const isPU = oldFactor === undefined || newFactor === undefined ? true : false

                newContext.Plots[plotIndex].yLimits[unit].isAuto = auto
                newContext.Plots[plotIndex].yLimits[unit].current = value

                const axisSetting: OpenSee.IAxisSettings = newContext.Plots[plotIndex].yLimits[unit];
                const oldLimits = axisSetting.dataLimits
                const filteredData = newContext.Plots[plotIndex].data.filter(item => item.Enabled && item.Unit === unit);

                //handle autoUnit case
                let unitIndex = func.updateActiveUnits(newContext.Plots[plotIndex].yLimits, unit, filteredData, newContext.StartTime, newContext.EndTime, null);
                if (unitIndex >= 0) {
                    newContext.Plots[plotIndex].yLimits[unit].current = unitIndex
                    newUnitIndex = unitIndex
                }

                let limits: [number, number];
                switch (newContext.Plots[plotIndex].key.DataType) {
                    case 'FFT':
                        limits = func.recomputeDataLimits(newContext.FftLimits[0], newContext.FftLimits[1], filteredData, newContext.Plots[plotIndex].yLimits[unit].current);
                        axisSetting.dataLimits = limits;
                        if (isPU) {
                            axisSetting.zoomedLimits = func.scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                            axisSetting.manualLimits = func.scaleLimits(oldLimits, limits, axisSetting.manualLimits)
                        }
                        else {
                            axisSetting.manualLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.manualLimits)
                            axisSetting.zoomedLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.zoomedLimits)
                        }
                        break;
                    case 'OverlappingWave':
                        limits = func.recomputeDataLimits(newContext.CycleLimits[0], newContext.CycleLimits[1], filteredData, newContext.Plots[plotIndex].yLimits[unit].current);
                        axisSetting.dataLimits = limits;
                        if (isPU) {
                            axisSetting.zoomedLimits = func.scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                            axisSetting.manualLimits = func.scaleLimits(oldLimits, limits, axisSetting.manualLimits)
                        }
                        else {
                            axisSetting.manualLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.manualLimits)
                            axisSetting.zoomedLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.zoomedLimits)
                        }
                        break;
                    default:
                        limits = func.recomputeDataLimits(newContext.StartTime, newContext.EndTime, filteredData, newContext.Plots[plotIndex].yLimits[unit].current);
                        axisSetting.dataLimits = limits;
                        if (isPU) {
                            axisSetting.zoomedLimits = func.scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                            axisSetting.manualLimits = func.scaleLimits(oldLimits, limits, axisSetting.manualLimits)
                        }
                        else {
                            axisSetting.manualLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.manualLimits)
                            axisSetting.zoomedLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.zoomedLimits)
                        }
                        break;
                }
            }
            func.saveSettings(newContext);
            return newContext;
        })
    , []);

    const EnableTrace = React.useCallback((key: OpenSee.IGraphProps, trace: number[], enabled: boolean) => 
        setContextState(c => {
            // Find the index of the plot in the state
            let plotIndex = c.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            if (plotIndex < 0)
                return;

            const updatedContext = _.cloneDeep(c);

            // Update only the selected plot
            trace.forEach(traceIndex => {
                if (traceIndex < updatedContext.Plots[plotIndex].data.length) {
                    updatedContext.Plots[plotIndex].data[traceIndex].Enabled = enabled;
                }
            });

            // Recompute limits and update units
            const relevantTraces = trace.map(index => updatedContext.Plots[plotIndex].data[index])
            const RelevantAxis = _.uniq(relevantTraces.map(s => s?.Unit));

            if (RelevantAxis.length > 0)
                RelevantAxis.forEach(axis => {
                    if (axis === undefined)
                        return
                    const axisSetting = updatedContext.Plots[plotIndex].yLimits[axis];
                    const relevantData = updatedContext.Plots[plotIndex].data.filter(item => item.Enabled && item.Unit === axis);

                    let recomputedLimits: [number, number];
                    switch (updatedContext.Plots[plotIndex].key.DataType) {
                        case "FFT":
                            recomputedLimits = func.recomputeDataLimits(updatedContext.FftLimits[0], updatedContext.FftLimits[1], relevantData, updatedContext.Plots[plotIndex].yLimits[axis].current);
                            axisSetting.dataLimits = recomputedLimits;
                            axisSetting.zoomedLimits = func.recomputeNonAutoLimits(updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].dataLimits, updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].zoomedLimits, recomputedLimits);
                            break;
                        case "OverlappingWave":
                            recomputedLimits = func.recomputeDataLimits(updatedContext.CycleLimits[0], updatedContext.CycleLimits[1], relevantData, updatedContext.Plots[plotIndex].yLimits[axis].current);
                            axisSetting.dataLimits = recomputedLimits;
                            axisSetting.zoomedLimits = func.recomputeNonAutoLimits(updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].dataLimits, updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].zoomedLimits, recomputedLimits);
                            break;
                        default:
                            recomputedLimits = func.recomputeDataLimits(updatedContext.StartTime, updatedContext.EndTime, relevantData, updatedContext.Plots[plotIndex].yLimits[axis].current);
                            axisSetting.dataLimits = recomputedLimits;
                            axisSetting.zoomedLimits = func.recomputeNonAutoLimits(updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].dataLimits, updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].zoomedLimits, recomputedLimits);
                            break;
                    }
                    // ToDo: Not sure this is doing anything remove if able
                    func.updateActiveUnits(updatedContext.Plots[plotIndex].yLimits, axis, relevantData, updatedContext.StartTime, updatedContext.EndTime, null);
                });
            return updatedContext;
        })
    , []);

    const SetIsManual = React.useCallback((key: OpenSee.IGraphProps, unit: OpenSee.Unit, manual: boolean) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            const plotIndex = updatedContext.Plots.findIndex(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
            updatedContext.Plots[plotIndex].yLimits[unit].isManual = manual;

            const isValidNumber = (value) => !isNaN(value) && isFinite(value);

            const invalidZoomedLimits = (updatedContext.Plots[plotIndex].yLimits[unit].zoomedLimits === null) || !isValidNumber(updatedContext.Plots[plotIndex].yLimits[unit].zoomedLimits[0]) || !isValidNumber(updatedContext.Plots[plotIndex].yLimits[unit].zoomedLimits[1]);
            const invalidDataLimits = (updatedContext.Plots[plotIndex].yLimits[unit].dataLimits === null) || !isValidNumber(updatedContext.Plots[plotIndex].yLimits[unit].dataLimits[0]) || !isValidNumber(updatedContext.Plots[plotIndex].yLimits[unit].dataLimits[1]);

            if (updatedContext.Plots[plotIndex].isZoomed && !invalidZoomedLimits)
                updatedContext.Plots[plotIndex].yLimits[unit].manualLimits = updatedContext.Plots[plotIndex].yLimits[unit].zoomedLimits
            else if (!invalidDataLimits)
                updatedContext.Plots[plotIndex].yLimits[unit].manualLimits = updatedContext.Plots[plotIndex].yLimits[unit].dataLimits

            return updatedContext;
        })
    , []);

    const SetSelectPoint = React.useCallback((time: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            for (let index = 0; index < updatedContext.Plots.length; index++) {
                let shortestDataObject = _.minBy(updatedContext.Plots[index].data, dataObject => dataObject.DataPoints.length);

                if (updatedContext.Plots[index]?.data?.length > 0) {
                    let dataIndex = func.getIndex(time, shortestDataObject.DataPoints)
                    updatedContext.Plots[index].selectedIndixes.push(dataIndex);
                }
            }
            return updatedContext;
        })
    , []);

    const ClearSelectPoints = React.useCallback(() => 
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            for (let index = 0; index < updatedContext.Plots.length; index++) {
                updatedContext.Plots[index].selectedIndixes = []
            }
            return updatedContext;
        })
    , []);

    const RemoveSelectPoints = React.useCallback((selectIndex: number) => 
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            for (let index = 0; index < updatedContext.Plots.length; index++) {
                updatedContext.Plots[index].selectedIndixes.splice(selectIndex, 1);
            }
            return updatedContext;
        })
    , []);

    const SetManualLimits = React.useCallback((limits: [number, number], key: OpenSee.IGraphProps, axis: OpenSee.Unit, auto: boolean, factor?: number) =>
        setContextState(c => {
            const plotIndex = c.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            if (plotIndex < 0)
                return c;

            const updatedContext = _.cloneDeep(c);
            updatedContext.Plots[plotIndex].yLimits[axis].isManual = true;

            if (updatedContext.Plots[plotIndex].isZoomed) //cover case of user zooming first then manually editing those..
                updatedContext.Plots[plotIndex].yLimits[axis].zoomedLimits = limits;

            updatedContext.Plots[plotIndex].yLimits[axis].manualLimits = limits;

            if (auto) {
                let revelantData = updatedContext.Plots[plotIndex].data.filter(data => data.Enabled && data.Unit === axis);
                let index = func.updateActiveUnits(updatedContext.Plots[plotIndex].yLimits, axis, revelantData, updatedContext.StartTime, updatedContext.EndTime, limits);
                if (index >= 0) {
                    updatedContext.Plots[plotIndex].yLimits[axis] = index;
                    let newManualLimits = [limits[0] * factor, limits[1] * factor]
                    updatedContext.Plots[plotIndex].yLimits[axis].manualLimits = newManualLimits;
                }
            }

            return updatedContext;
        })
    , []);

    // Plot Data Functions
    const AddPlot = (key: OpenSee.IGraphProps, yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, isZoomed?: boolean, fftLimits?: [number, number], cycleLimits?: [number, number]): void => {
        // Check to see if plot exists
        let plotIndex = contextState.Plots.findIndex(item => item.key.DataType == key.DataType && item.key.EventId == key.EventId);

        // Add plot to context if it does not exist
        let updatedContext = _.cloneDeep(contextState);
        if (plotIndex < 0) {
            const newPlot = _.cloneDeep(emptygraph);
            plotIndex = updatedContext.Plots.push(newPlot) - 1;
        }

        // Set fields based on arguements
        if (yLimits)
            Object.keys(yLimits).forEach(unit => {
                updatedContext[plotIndex].yLimits[unit] = yLimits[unit]
            });
        if (isZoomed !== undefined)
            updatedContext[plotIndex].isZoomed = isZoomed;
        updatedContext[plotIndex].key = key;
        updatedContext[plotIndex].loading = 'Loading';

        // Add/deal with overlapping plot if needed
        let overlappingPlotIndex = -1;
        if (singlePlot) {
            overlappingPlotIndex = updatedContext.Plots.findIndex(plot => plot.key.EventId === -1 && plot.key.DataType === key.DataType);
            if (overlappingPlotIndex < 0) {
                const newPlot = _.cloneDeep(emptygraph);
                overlappingPlotIndex = updatedContext.Plots.push(newPlot) - 1;
            }
            updatedContext.Plots[overlappingPlotIndex].key = { EventId: -1, DataType: key.DataType };
            updatedContext.Plots[overlappingPlotIndex].loading = 'Loading';

        }

        // Adding Data to the Plot
        let handles = getData(
            key,
            analytic,
            data => {
                func.AppendData(updatedContext, key, data, defaultTrace, defaultVType, key.EventId);
                // Append overlapping plot data
                if (overlappingPlotIndex > -1)
                    func.AppendData(updatedContext, { EventId: -1, DataType: key.DataType }, _.cloneDeep(updatedContext[plotIndex].data), defaultTrace, defaultVType, key.EventId);
            },
            () => func.InitiateDetailed(updatedContext, analytic, key)
        );

        // Register requests to handle store
        AddRequest(key, handles);

        // Register promise to finally set context state
        Promise.all(handles).then(() => {
            updatedContext.Plots[plotIndex].loading = 'Idle';

            // Set flag for overlapping plot
            if (overlappingPlotIndex > -1) {
                const evtIDs = _.uniq(updatedContext.Plots.filter(plot => plot.data.length > 1).map(plot => plot.key.EventId).filter(id => id !== -1));
                const evtIDsPresent = _.uniq(updatedContext.Plots[overlappingPlotIndex].data.map(data => data.EventID));
                const allDataPresent = evtIDs.every(id => {
                    return evtIDsPresent.includes(id)
                })

                if (allDataPresent)
                    updatedContext.Plots[overlappingPlotIndex].loading = 'Idle';
            }

            if (fftLimits != null)
                updatedContext.FftLimits = fftLimits;
            if (cycleLimits != null)
                updatedContext.CycleLimits = cycleLimits;

            setContextState(updatedContext);
        }, () => {
            updatedContext.Plots[plotIndex].loading = 'Error';
            if (overlappingPlotIndex > -1)
                updatedContext.Plots[overlappingPlotIndex].loading = 'Error';

            setContextState(updatedContext);
        });
    }

    const UpdateAnalyticPlot = (key: OpenSee.IGraphProps): void => {
        // No plot matches
        const plotIndex = contextState.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
        if (plotIndex < 0)
            return;

        // Remove old data
        let updatedContext = _.cloneDeep(contextState);
        updatedContext.Plots[plotIndex].data = [];

        // Set loading flag
        updatedContext.Plots[plotIndex].loading = 'Loading';
        setContextState(updatedContext);

        // Adding Data to the Plot
        let handles = getData(
            key,
            analytic,
            data => func.AppendData(updatedContext, key, data, defaultTrace, defaultVType, key.EventId ),
            () => func.InitiateDetailed(updatedContext, analytic, key)
        );

        // Register requests to handle store
        AddRequest(key, handles);

        // Register promise to finally set context state
        Promise.all(handles).then(() => {
            updatedContext.Plots[plotIndex].loading = 'Idle';
            setContextState(updatedContext);
        }, () => {
            updatedContext.Plots[plotIndex].loading = 'Error';
            setContextState(updatedContext);
        });
    }

    // If analytic changes, we need to refetch
    React.useEffect(() => {
        Object.keys(analytic).forEach((key: keyof OpenSee.IAnalyticContext) => {
            if (oldAnalyticRef.current?.[key] == null || oldAnalyticRef.current[key] != analytic[key]) {
                let keyAnalytic: OpenSee.graphType;
                //ToDo: This can probably be moved to analytic context...
                switch (key) {
                    case 'FFTCycles':
                    case 'FFTStartTime':
                        keyAnalytic = "FFT";
                        break;
                    case 'LPFOrder':
                        keyAnalytic = "LowPassFilter";
                        break;
                    case 'HPFOrder':
                        keyAnalytic = "HighPassFilter";
                        break;
                    case 'Trc':
                        keyAnalytic = "Rectifier";
                        break;
                    case 'Harmonic':
                        keyAnalytic = "Harmonic";
                        break;
                    default:
                        console.warn(`Unrecognized key ${key} change in datacontext, check to make sure correct analytic is refreshing...`);
                        break;
                }
                if (keyAnalytic != null) {
                    // ToDo: this should be current event + all overlapping events
                    UpdateAnalyticPlot({ DataType: keyAnalytic, EventId: id });
                }
            } 
        });
    }, [analytic]);

    // Set context
    contextRef.current = {
        SetTimeLimit,
        SetCycleLimit,
        SetFFTLimits,
        ResetZoom,
        SetZoomedLimits,
        SetUnit,
        EnableTrace,
        SetIsManual,
        SetSelectPoint,
        ClearSelectPoints,
        RemoveSelectPoints,
        SetManualLimits,
        AddPlot,
        UpdateAnalyticPlot
    };

    return (
        <DataFunctionContext.Provider value={dispatch}>
            <DataContext.Provider value={contextState}>
                {props.children}
            </DataContext.Provider>
        </DataFunctionContext.Provider>
    );
};

export default DataContext;
