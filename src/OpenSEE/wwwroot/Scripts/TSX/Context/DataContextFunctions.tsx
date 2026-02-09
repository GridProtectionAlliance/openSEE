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

namespace DataContextFunctions {
    /* Functions to Update Context objects */
    export function UpdateTimeLimit(context: OpenSee.IDataContextType, start: number, end: number) {
        const newContext = { ...context };

        if (Math.abs(start - end) < 10)
            return newContext;

        newContext.StartTime = start;
        newContext.EndTime = end;
        newContext.Plots.map(graph => {
            if (graph.key.DataType === "FFT")
                return updateAutoLimits(graph, newContext.FftLimits[0], newContext.FftLimits[1]);
            if (graph.key.DataType === "OverlappingWave")
                return updateAutoLimits(graph, newContext.CycleLimits[0], newContext.CycleLimits[1]);
            return updateAutoLimits(graph, start, end);
        });

        return newContext;
    }

    export function UpdateCycleLimits(context: OpenSee.IDataContextType, start: number, end: number) {
        const newContext = { ...context };

        if (Math.abs(start - end) < 5)
            return newContext;

        newContext.StartTime = start;
        newContext.EndTime = end;
        const plotIndex = context.Plots.findIndex(plot => plot.key.DataType === "OverlappingWave");
        newContext.Plots[plotIndex] = updateAutoLimits(newContext.Plots[plotIndex], start, end);

        return newContext;
    }

    export function UpdateFFTLimits(context: OpenSee.IDataContextType, start: number, end: number) {
        const newContext = _.cloneDeep(context);

        if (Math.abs(start - end) < 1)
            return newContext;

        newContext.StartTime = start;
        newContext.EndTime = end;
        const plotIndex = context.Plots.findIndex(plot => plot.key.DataType === "FFT");
        newContext.Plots[plotIndex] = updateAutoLimits(newContext.Plots[plotIndex], start, end);

        return newContext;
    }

    /* Functions that deal with individual plots */
    export function updateAutoLimits(plot: OpenSee.IGraphstate, startTime: number, endTime: number): OpenSee.IGraphstate {
        const newPlot = { ...plot };

        //only update limits once there is data loaded
        if (newPlot?.data?.length <= 0)
            return newPlot;

        const RelevantAxis = _.uniq(newPlot.data.map(s => s.Unit));
        RelevantAxis.forEach(axis => {
            const autoLimits = !newPlot.isZoomed && !newPlot.yLimits[axis].isManual;
            if (!autoLimits)
                return;

            let filteredData = newPlot.data.filter(item => item.Unit === axis && item.Enabled);
            const newLimits = recomputeDataLimits(startTime, endTime, filteredData, newPlot.yLimits[axis].current);
            if (newLimits)
                newPlot.yLimits[axis].dataLimits = newLimits;
        });
        return newPlot;
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
    export function updateActiveUnits(units: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, unit: OpenSee.Unit, data: OpenSee.iD3DataSeries[], startTime: number, endTime: number, manualLimits: [number, number]) {
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

        return data.map(item => false);
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