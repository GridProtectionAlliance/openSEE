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

import * as React from 'react';
import { OpenSee } from '../global';
import { Application } from '@gpa-gemstone/application-typings';
import { useAppSelector } from '../hooks';
import { SelectSinglePlot, plotTypes } from '../store/settingSlice';
import _ from 'lodash';
import func from './DataContextFunctions';
import { defaultSettings } from '../defaults';

interface IProps {
}

interface IDataFunctions {
    SetTimeLimit: (start: number, end: number) => void,
    SetCycleLimit: (start: number, end: number) => void,
    SetFFTLimits: (start: number, end: number) => void,
    ResetZoom: (start: number, end: number) => void,
    SetZoomedLimits: (limits: [number, number], key: OpenSee.IGraphProps) => void,
    SetUnit: (unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps) => void
}

interface IExtendedContextType extends OpenSee.IDataContextType {
    Dispatch: React.MutableRefObject<IDataFunctions | undefined>
}

const defaultState: OpenSee.IDataContextType = {
    StartTime: 0 as number,
    EndTime: 0 as number,
    Plots: [] as OpenSee.IGraphstate[],
    FftLimits: [0, 0],
    CycleLimits: [0, 1000.0 / 60.0]
};

export const DataContext = React.createContext<IExtendedContextType>({ ...defaultState, Dispatch: { current: null } });

export const DataProvider = (props: React.PropsWithChildren<IProps>) => {
    const [contextState, setContextState] = React.useState<OpenSee.IDataContextType>(defaultState);
    const contextRef = React.useRef<IDataFunctions>();

    // Context State Functions
    const SetTimeLimit = React.useCallback((start: number, end: number) =>
        setContextState(c => func.UpdateTimeLimit(c, start, end))
    , []);

    const SetCycleLimit = React.useCallback((start: number, end: number) => 
        setContextState(c => func.UpdateCycleLimits(c, start, end))
    , []);

    const SetFFTLimits = React.useCallback((start: number, end: number) => 
        setContextState(c => func.UpdateFFTLimits(c, start, end))
    , []);

    const ResetZoom = React.useCallback((start: number, end: number) => {
        setContextState(c => {
            let updatedContext = func.UpdateTimeLimit(c, start, end);

            // FFT Limits get updated base on values not eventTime
            const fftPlotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == 'FFT');
            const wavePlotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == 'OverlappingWave');
            if (fftPlotIndex > -1) {
                const start = Math.min(...updatedContext.Plots[fftPlotIndex].data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]))));
                const end = Math.max(...updatedContext.Plots[fftPlotIndex].data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]))));
                updatedContext = func.UpdateFFTLimits(updatedContext, start, end);
            }
            if (wavePlotIndex > -1) {
                const start = Math.min(...updatedContext.Plots[wavePlotIndex].data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]).filter(val => !isNaN(val)))));
                const end = Math.max(...updatedContext.Plots[wavePlotIndex].data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]).filter(val => !isNaN(val)))));
                updatedContext = func.UpdateCycleLimits(updatedContext, start, end);
            }

            for (let plotIndex = 0; plotIndex < updatedContext.Plots.length; plotIndex++) {
                updatedContext.Plots[plotIndex].isZoomed = false;
                const RelevantAxis = _.uniq(updatedContext.Plots[plotIndex].data.map(s => s.Unit));
                RelevantAxis.forEach(axis => {
                    updatedContext.Plots[plotIndex].yLimits[axis].zoomedLimits = [0, 1];
                });
            }

            return updatedContext;
        });
    }, []);

    const SetZoomedLimits = React.useCallback((limits: [number, number], key: OpenSee.IGraphProps) => {
        setContextState(c => {
            const plot = c.Plots.find(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            const primaryAxis = func.getPrimaryAxis(plot.key);
            let oldLimits: [number, number] = [0, 1];

            if (plot.yLimits[primaryAxis].isManual)
                oldLimits = plot.yLimits[primaryAxis].manualLimits;
            else if (plot.isZoomed)
                oldLimits = plot.yLimits[primaryAxis].zoomedLimits;
            else
                oldLimits = plot.yLimits[primaryAxis].dataLimits;


            const plotIndex = c.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            if (plotIndex <= -1)
                return c;

            const RelevantAxis = _.uniq(c.Plots[plotIndex].data.filter(item => item.Enabled).map(s => s.Unit));
            const newContext = _.cloneDeep(c);

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
        });
    }, []);

    const SetUnit = React.useCallback((unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps) => {
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
                if (unitIndex) {
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
        });
    }, []);




    // Set context
    contextRef.current = {
        SetTimeLimit,
        SetCycleLimit,
        SetFFTLimits,
        ResetZoom,
        SetZoomedLimits,
        SetUnit
    };
    const contextStateWithRef = React.useMemo(() => ({ ...contextState, Dispatch: contextRef }), [contextState]);

    return (
        <DataContext.Provider value={contextStateWithRef}>
            {props.children}
        </DataContext.Provider>
    );
};

function applyLocalSettings(plot: OpenSee.IGraphstate) {

    try {
        let settings: OpenSee.ISettingsState = JSON.parse(localStorage.getItem('openSee.Settings'));
        const unitSettings = settings.Units

        if (unitSettings && Array.isArray(unitSettings)) {
            const matchingPlot = unitSettings.find(setting => setting.DataType === plot.key.DataType)

            Object.keys(matchingPlot.Units).forEach(key => {
                plot.yLimits[key].current = matchingPlot.Units[key].current
                plot.yLimits[key].isAuto = matchingPlot.Units[key].isAuto
            })
        }
        else if (!Array.isArray(unitSettings)) { //reset unit localstorage settings for old structure
            settings.Units = []
            const serializedState = JSON.stringify(settings);
            localStorage.setItem('openSee.Settings', serializedState);
        }
    } catch { }
}

export default DataContext;
