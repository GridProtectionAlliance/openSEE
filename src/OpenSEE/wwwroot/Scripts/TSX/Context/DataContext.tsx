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

interface IProps {
}

interface IDataFunctions {
    SetTimeLimit: (start: number, end: number) => void,
    SetCycleLimit: (start: number, end: number) => void,
    SetFFTLimits: (start: number, end: number) => void,
    ResetZoom: (start: number, end: number) => void
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



    // Plot Array Functions


    // Set context
    contextRef.current = {
        SetTimeLimit,
        SetCycleLimit,
        SetFFTLimits,
        ResetZoom
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

function saveSettings(state: OpenSee.IDataContextType) {
    try {
        //lets type currentSettings to prevent errors in future
        const settings = JSON.parse(localStorage.getItem("openSee.Settings"))
        let unitSettings = settings.Units
        if (unitSettings === null || unitSettings === undefined)
            unitSettings = []

        plotTypes.forEach(plotType => {
            const matchingPlot = state.Plots.find(plot => plot.key.DataType === plotType);

            if (matchingPlot) {
                const relevantUnits = matchingPlot.data.filter(data => data.Enabled)
                const enabledUnits = _.uniqBy(relevantUnits, "Unit").map(data => data.Unit)
                const plot = unitSettings.find(plot => plot.DataType === matchingPlot.key.DataType)

                if (plot === undefined)
                    unitSettings.push({ DataType: matchingPlot.key.DataType, Units: null })

                Object.keys(matchingPlot.yLimits).forEach(key => {
                    if (enabledUnits.includes(key as OpenSee.Unit)) {
                        let plot = unitSettings.find(plot => plot.DataType === matchingPlot.key.DataType)
                        const yLimits = matchingPlot.yLimits[key]
                        if (plot.Units === undefined || plot.Units === null)
                            plot.Units = {}
                        plot.Units[key] = { current: yLimits.current, isAuto: yLimits.isAuto }
                    }
                })

            }
        });

        let currentSettings = JSON.parse(localStorage.getItem("openSee.Settings"))
        if (currentSettings === null || currentSettings === undefined)
            currentSettings = {}
        currentSettings.Units = unitSettings
        const serializedState = JSON.stringify(currentSettings)
        localStorage.setItem('openSee.Settings', serializedState);
    } catch {
        // ignore write errors
    }
}

export default DataContext;
