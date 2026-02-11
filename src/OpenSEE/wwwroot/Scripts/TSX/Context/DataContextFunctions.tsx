//******************************************************************************************************
//  DataContextFunctions.tsx - Gbtc
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
//       Seperated out from DataSlice.
//
//******************************************************************************************************

import { OpenSee } from "../global";
import { defaultSettings } from '../defaults';
import _ from "lodash";
import { plotTypes } from "../store/settingSlice";
import { getDetailedData } from "../Data/GraphLogic";
import { AppendRequest } from "../Data/RequestHandler";

namespace DataContextFunctions {
    /* Functions to Update Context objects */
    export function UpdateTimeLimit(context: OpenSee.IDataContextType, start: number, end: number): void {
        if (Math.abs(start - end) < 10)
            return;

        context.StartTime = start;
        context.EndTime = end;
        context.Plots.map(graph => {
            if (graph.key.DataType === "FFT")
                return updateAutoLimits(graph, context.FftLimits[0], context.FftLimits[1]);
            if (graph.key.DataType === "OverlappingWave")
                return updateAutoLimits(graph, context.CycleLimits[0], context.CycleLimits[1]);
            return updateAutoLimits(graph, start, end);
        });
    }

    export function UpdateCycleLimits(context: OpenSee.IDataContextType, start: number, end: number): void {
        if (Math.abs(start - end) < 5)
            return;

        context.StartTime = start;
        context.EndTime = end;
        const plotIndex = context.Plots.findIndex(plot => plot.key.DataType === "OverlappingWave");
        updateAutoLimits(context.Plots[plotIndex], start, end);
    }

    export function UpdateFFTLimits(context: OpenSee.IDataContextType, start: number, end: number): void {
        if (Math.abs(start - end) < 1)
            return;

        context.StartTime = start;
        context.EndTime = end;
        const plotIndex = context.Plots.findIndex(plot => plot.key.DataType === "FFT");
        updateAutoLimits(context.Plots[plotIndex], start, end);
    }

    export function AppendData(context: OpenSee.IDataContextType, key: OpenSee.IGraphProps, data: Array<OpenSee.iD3DataSeries>, defaultTraces: OpenSee.IDefaultTrace, defaultV: "L-L" | "L-N", eventID: number): void {
        let plotIndex = context.Plots.findIndex(item => item.key.DataType == key.DataType && item.key.EventId == key.EventId)
        if (plotIndex < 0)
            return;

        const orignalLength = context.Plots[plotIndex].data.length;

        //update plot with unit settings from local storage
        applyLocalSettings(context.Plots[plotIndex]);

        context.Plots[plotIndex].data.push(...data);
        const newLength = context.Plots[plotIndex].data.length

        let extendEnabled = GetDefaults(key.DataType, defaultTraces, defaultV, context.Plots[plotIndex].data);

        for (let i = orignalLength; i < newLength; i++) {
            context.Plots[plotIndex].data[i].EventID = eventID
        }

        for (let i = 0; i < newLength; i++) {
            context.Plots[plotIndex].data[i].Enabled = extendEnabled[i];
        }

        const RelevantAxises = _.uniq(context.Plots[plotIndex].data.map(s => s.Unit));

        RelevantAxises.forEach(axis => {
            let filteredData = context.Plots[plotIndex].data.filter(item => item.Unit === axis && item.Enabled);
            let index = updateActiveUnits(context.Plots[plotIndex].yLimits, axis, filteredData, context.StartTime, context.EndTime, null);
            if (index)
                context.Plots[plotIndex].yLimits[axis].current = index;
        })

        switch (context.Plots[plotIndex].key.DataType) {
            case "FFT":
                context.FftLimits = [Math.min(...context.Plots[plotIndex].data.map(item => Math.min(...item.DataPoints.map(pt => pt[0])))), Math.max(...context.Plots[plotIndex].data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]))))];
                updateAutoLimits(context.Plots[plotIndex], context.FftLimits[0], context.FftLimits[1]);
                break;
            case "OverlappingWave":
                updateAutoLimits(context.Plots[plotIndex], context.CycleLimits[0], context.CycleLimits[1]);
                break;
            default:
                updateAutoLimits(context.Plots[plotIndex], context.StartTime, context.EndTime);
                break;
        }
    }

    export function applyLocalSettings(plot: OpenSee.IGraphstate) {
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

    export function saveSettings(state: OpenSee.IDataContextType): void {
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

    /* Functions that deal with individual plots */
    export function updateAutoLimits(plot: OpenSee.IGraphstate, startTime: number, endTime: number): void {
        //only update limits once there is data loaded
        if (plot?.data?.length <= 0)
            return;

        const RelevantAxis = _.uniq(plot.data.map(s => s.Unit));
        RelevantAxis.forEach(axis => {
            const autoLimits = !plot.isZoomed && !plot.yLimits[axis].isManual;
            if (!autoLimits)
                return;

            let filteredData = plot.data.filter(item => item.Unit === axis && item.Enabled);
            const newLimits = recomputeDataLimits(startTime, endTime, filteredData, plot.yLimits[axis].current);
            if (newLimits)
                plot.yLimits[axis].dataLimits = newLimits;
        });
    }

    //This Function Recomputes y Limits based on X limits for all states
    export function recomputeDataLimits(start: number, end: number, data: OpenSee.iD3DataSeries[], activeUnit: number): [number, number] {

        let limitedData = data.map(item => {
            let dataPoints = item.DataPoints;
            if (item.SmoothDataPoints.length > 0)
                dataPoints = item.SmoothDataPoints;

            let indexStart = getIndex(start, dataPoints);
            let indexEnd = getIndex(end, dataPoints);

            let factor = defaultSettings.Units[item.Unit].options[activeUnit].factor;

            if (factor === undefined) { //p.u case
                factor = 1.0 / item.BaseValue;
            }

            let sliced = dataPoints.slice(indexStart, indexEnd)
            let dt = sliced.map(p => p[1]).filter(p => !isNaN(p) && isFinite(p));

            return [Math.min(...dt) * factor, Math.max(...dt) * factor];
        });

        let yMin = Math.min(...limitedData.map(item => item[0]));
        let yMax = Math.max(...limitedData.map(item => item[1]));

        const pad = (yMax - yMin) / 20;
        return [yMin - pad, yMax + pad];

    }

    /* Functions that existed in slice */
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
        else if (key.DataType === "FaultDistance")
            return "Distance"
        else if (key.DataType === "I2T")
            return "Current"
        else
            return "Voltage" as OpenSee.Unit

    }

    export function recomputeNonAutoLimits(oldLimits: [number, number], newLimits: [number, number], currentLimits: [number, number]): [number, number] {
        // Calculate the old range
        const oldRange = oldLimits[1] - oldLimits[0];

        // Calculate the proportional change
        const lowerProportion = (newLimits[0] - oldLimits[0]) / oldRange;
        const upperProportion = (newLimits[1] - oldLimits[0]) / oldRange;


        // Apply the proportional change to the current range
        const currentRange = currentLimits[1] - currentLimits[0];
        const updatedLowerLimit = currentLimits[0] + lowerProportion * currentRange;
        const updatedUpperLimit = currentLimits[0] + upperProportion * currentRange;
        return [updatedLowerLimit, updatedUpperLimit];
    }

    export function scaleLimitsByFactor(oldIndex, newIndex, unit: OpenSee.Unit, limits: [number, number]): [number, number] {
        const oldFactor = defaultSettings.Units[unit].options[oldIndex].factor
        const newFactor = defaultSettings.Units[unit].options[newIndex].factor
        const change = newFactor / oldFactor

        //need to handle pu factor somehow..

        return [limits[0] * change, limits[1] * change]
    }

    export function scaleLimits(oldDataLimits, newDataLimits, zoomedLimits): [number, number] {
        // Calculate the range of old and new data limits
        const oldRange = oldDataLimits[1] - oldDataLimits[0];
        const newRange = newDataLimits[1] - newDataLimits[0];

        // Calculate the proportional change
        const scale = newRange / oldRange;

        // Apply the proportional change to zoomed limits
        const scaledZoomedLowerLimit = zoomedLimits[0] * scale;
        const scaledZoomedUpperLimit = zoomedLimits[1] * scale;

        return [scaledZoomedLowerLimit, scaledZoomedUpperLimit];
    }

    // function that Updates the Current Units if they are on auto 
    export function updateActiveUnits(units: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, unit: OpenSee.Unit, data: OpenSee.iD3DataSeries[], startTime: number, endTime: number, manualLimits: [number, number]): number {
        if (!units[unit].isAuto)
            return -1;

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

    // Function that gets a Tooltip Display Name
    export function GetDisplayName(d: OpenSee.iD3DataSeries, type: OpenSee.graphType) {
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
        return type;
    }

    // Function to get Default Enabled Traces
    export function GetDefaults(type: OpenSee.graphType, defaultTraces: OpenSee.IDefaultTrace, defaultVoltage: "L-L" | "L-N", data: OpenSee.iD3DataSeries[]): boolean[] {

        if (type == 'Voltage')
            return data.map(item => item.LegendVGroup == defaultVoltage &&
                ((item.LegendHorizontal == 'Ph' && defaultTraces.Ph) ||
                    (item.LegendHorizontal == 'RMS' && defaultTraces.RMS) ||
                    (item.LegendHorizontal == 'Pk' && defaultTraces.Pk) ||
                    (item.LegendHorizontal == 'W' && defaultTraces.W)
                ))

        if (type == 'Current')
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

        if (type == 'I2T')
            return data.map(item => item.LegendVertical == 'AN' || item.LegendVertical == 'BN' || item.LegendVertical == 'CN')

        return data.map(_item => false);
    }

    export function getIndex(t: number, data: Array<[number, number]>): number {
        if (data) {
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
    }
}

export default DataContextFunctions;