//******************************************************************************************************
//  GraphLogic.tsx - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  05/24/2023 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import _ from "lodash";
import { OpenSee } from "../global";

const defaultLimits = {
    activeUnit: 0,
    dataLimits: [0, 1],
    label: '',
    manuallimits: [0, 1],
    zoomedLimits: [0, 1],
} as OpenSee.IAxisSettings;

export const emptygraph: OpenSee.IGraphstate = {
    key: null,
    data: [],
    loading: 'Idle',
    isZoomed: false,
    yLimits: {
        Voltage: defaultLimits,
        Current: defaultLimits,
        Angle: defaultLimits,
        VoltageperSecond: defaultLimits,
        CurrentperSecond: defaultLimits,
        Freq: defaultLimits,
        Impedance: defaultLimits,
        PowerP: defaultLimits,
        PowerQ: defaultLimits,
        PowerS: defaultLimits,
        PowerPf: defaultLimits,
        TCE: defaultLimits,
        Distance: defaultLimits,
        Unbalance: defaultLimits,
        THD: defaultLimits
    },
    selectedIndixes: [],
    activeRequest: ''
}

// #region [ Utility Functions ]

// Zoom Y Axis;
export function zoomYAxis(graph: OpenSee.IGraphstate, unit: OpenSee.Unit, limits: [number, number]): OpenSee.IGraphstate {
    graph.yLimits[unit].zoomedLimits = limits;
    graph.isZoomed = true;

    return graph;
}
// Add Data



// Zoom X Axis
export function zoomXAxis(graph: OpenSee.IGraphstate, limits: [number, number], baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>): OpenSee.IGraphstate {

    recomputeDataLimits(limits[0], limits[1], graph);
    Object.keys(graph.yLimits).forEach(unit => {
        graph = updateActiveUnits(baseUnits, graph, unit as OpenSee.Unit);
    });
    return graph;
}

// Reset Limits
export function resetLimits(graph: OpenSee.IGraphstate, baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>, tLimit: [number, number]): OpenSee.IGraphstate {

    graph.isZoomed = false;
    
    recomputeDataLimits(tLimit[0],tLimit[1],graph)
    Object.keys(graph.yLimits).forEach((unit: OpenSee.Unit) => {
        
        if ((baseUnits[unit] as OpenSee.IUnitSetting).useAutoLimits)
            (graph.yLimits[unit] as OpenSee.IAxisSettings).zoomedLimits = (graph.yLimits[unit] as OpenSee.IAxisSettings).dataLimits;
        else
            (graph.yLimits[unit] as OpenSee.IAxisSettings).zoomedLimits = (graph.yLimits[unit] as OpenSee.IAxisSettings).manuallimits;
        updateActiveUnits(baseUnits, graph, unit);
    });

    return graph;
}

// Enable Trace
export function toggleTrace(graph: OpenSee.IGraphstate, index: number, tLimits: [number, number], baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>): OpenSee.IGraphstate {

    graph.enabled[index] = !graph.enabled[index];
    graph = zoomXAxis(graph, tLimits, baseUnits);
    return graph
};

// Replace Data

// Change Unit


// #region [ Internal Functions ]

// Update Units if Auto
function updateActiveUnits(baseUnits: OpenSee.IUnitCollection<OpenSee.IUnitSetting>,
    graph: OpenSee.IGraphstate, unit: OpenSee.Unit) {

    let currentUnits = getCurrentUnits(baseUnits);

    if (currentUnits[unit].short != 'auto')
        return;

    let min = graph.yLimits[unit].dataLimits[0];
    let max = graph.yLimits[unit].dataLimits[1];

    let autoFactor = 0.000001
    if (Math.max(max, min) < 1)
        autoFactor = 1000
    else if (Math.max(max, min) < 1000)
        autoFactor = 1
    else if (Math.max(max, min) < 1000000)
        autoFactor = 0.001

    //Logic to move on to next if We can not find that Factor
    if (baseUnits[unit].options.findIndex(item => item.factor == autoFactor) >= 0)
        graph.yLimits[unit].activeUnit = baseUnits[unit].options.findIndex(item => item.factor == autoFactor)
    else {
        //Unable to find Factor try moving one down/up
        if (autoFactor < 1)
            autoFactor = autoFactor * 1000
        else
            autoFactor = 1

        if (baseUnits[unit].options.findIndex(item => item.factor == autoFactor) >= 0)
            graph.yLimits[unit].activeUnit = baseUnits[unit].options.findIndex(item => item.factor == autoFactor)
        else
            graph.yLimits[unit].activeUnit = baseUnits[unit].options.findIndex(item => item.factor != 0)
    }

    return graph;
}

// Get current Unit
function getCurrentUnits(units: OpenSee.IUnitCollection<OpenSee.IUnitSetting>): OpenSee.IUnitCollection<OpenSee.iUnitOptions> {
    let result = {};
    Object.keys(units).forEach(key => { result[key] = units[key].options[units[key].current] });
    return result as OpenSee.IUnitCollection<OpenSee.iUnitOptions>;
}

// Update data limits
function recomputeDataLimits(start: number, end: number, plot: OpenSee.IGraphstate): OpenSee.IGraphstate {

    Object.entries(_.groupBy(plot.data, d => d.Unit)).forEach(([unit, data]) => {

        let limitedData = plot.data.map((item, index) => {
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
        plot.yLimits[unit].dataLimits = [yMin - pad, yMax + pad];
    });
    return plot;
}

// Find a closest Index in a ID3DataSeries for a given T
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
// #region [ Async Functions ]

//This Function Grabs the Data for this Graph - Note that cases with multiple Event ID's need to be treated seperatly at the end
export function getData(key: OpenSee.IGraphProps, options: OpenSee.IAnalyticStore, callback: (data: OpenSee.iD3DataSeries[], type: 'time'|'frequency') => void): Array<JQuery.jqXHR<any>> {
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

            handlePOW.then((data) => callback(data.Data, 'time'));
            handleFreq.then((data) => callback(data.Data, 'frequency'));
          
            result.push(handlePOW);
            result.push(handleFreq);
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

            breakerAnalogsDataHandle.then((data) => callback(data.Data, 'time'));
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

            breakerDigitalsDataHandle.then((data) => callback(data.Data, 'time'));
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

            waveformTCEDataHandle.then((data) => callback(data.Data, 'time'));
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
            derivativeDataHandle.then((data) => callback(data.Data, 'time'));
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
            clippedWaveformDataHandle.then((data) => callback(data.Data, 'time'));
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
            freqencyAnalyticDataHandle.then((data) => callback(data.Data, 'time'));
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
            highPassFilterDataHandle.then((data) => callback(data.Data, 'time'));
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
            lowPassFilterDataHandle.then((data) => callback(data.Data, 'time'));
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

            impedanceDataHandle.then((data) => callback(data.Data, 'time'));
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
            powerDataHandle.then((data) => callback(data.Data, 'time'));
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
            missingVoltageDataHandle.then((data) => callback(data.Data, 'time'));
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

            overlappingWaveformDataHandle.then((data) => callback(data.Data, 'time'));
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
            rectifierDataHandle.then((data) => callback(data.Data, 'time'));
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
            rapidVoltageChangeDataHandle.then((data) => callback(data.Data, 'time'));
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
            removeCurrentDataHandle.then((data) => callback(data.Data, 'time'));
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
            specifiedHarmonicDataHandle.then((data) => callback(data.Data, 'time'));
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
            symmetricalComponentsDataHandle.then((data) => callback(data.Data, 'time'));
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
            thdDataHandle.then((data) => callback(data.Data, 'time'));
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
            unbalanceDataHandle.then((data) => callback(data.Data, 'time'));
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
            faultDistanceDataHandle.then((data) => callback(data.Data, 'time'));
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
            breakerRestrikeDataHandle.then((data) => callback(data.Data, 'time'));
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
            fftAnalyticDataHandle.then((data) => callback(data.Data, 'time'));
            result.push(fftAnalyticDataHandle);
            break
        default:
            return []
            break;
    }


    return result;
}

export function getDetailedData(key: OpenSee.IGraphProps, options: OpenSee.IAnalyticStore, callback: (data: OpenSee.iD3DataSeries[], type: 'time' | 'frequency') => void): Array<JQuery.jqXHR<any>> {
    let result = [];

    switch (key.DataType) {
        case ('Current'):
        case ('Voltage'):
            let handlePOW = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}&fullRes=1` +
                    `&type=${key.DataType}` +
                    `&dataType=Time` +
                    (key.NoCompress ? `&dbgNocompress=1` : ``),
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            let handleFreq = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}&fullRes=1` +
                    `&type=${key.DataType}` +
                    `&dataType=Freq` +
                    (key.NoCompress ? `&dbgNocompress=1` : ``),
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            handlePOW.then((data) => callback(data.Data, 'time'));
            handleFreq.then((data) => callback(data.Data, 'frequency'));

            result.push(handlePOW);
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
            thdDataHandle.then((data) => callback(data.Data, 'time'));
            result.push(thdDataHandle);
            break;

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
            specifiedHarmonicDataHandle.then((data) => callback(data.Data, 'time'));
            result.push(specifiedHarmonicDataHandle);
            break;

        default:
            return [];
    }

    return result;
}

// #endregion
