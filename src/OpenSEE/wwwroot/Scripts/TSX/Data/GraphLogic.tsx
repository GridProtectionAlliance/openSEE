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

import { OpenSee } from "../global";
import $ from 'jquery';

const defaultLimits = {
    isManual: false,
    dataLimits: [0, 1],
    manualLimits: [0, 1],
    zoomedLimits: [0, 1],
    isAuto: true,
    current: 0
} as OpenSee.IAxisSettings;

export const emptygraph: OpenSee.IGraphstate = {
    key: {
        EventId: -1,
        DataType: 'Voltage',
    },
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
        THD: defaultLimits,
        [""]: defaultLimits
    },
    selectedIndixes: [],
}


// #region [ Async Functions ]

//This Function Grabs the Data for this Graph - Note that cases with multiple Event ID's need to be treated seperatly at the end
export function getData(key: OpenSee.IGraphProps, options: OpenSee.IAnalyticContext, appendCallBack: (data: OpenSee.iD3DataSeries[], type: 'time'|'frequency') => void, detailedCallBack: (key: OpenSee.IGraphProps) => void): Array<JQuery.jqXHR<any>> {
    const result: Array<JQuery.jqXHR<any>> = [];

    switch (key.DataType) {

        case ('Current'):
        case ('Voltage'):
            const handlePOW = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}` +
                    `&type=${key.DataType}` +
                    `&dataType=Time`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            const handleFreq = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}` +
                    `&type=${key.DataType}` +
                    `&dataType=Freq`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            handlePOW.then(data => {
                appendCallBack(data.Data, 'time')
                detailedCallBack(key);
            });
            handleFreq.then((data) => {
                appendCallBack(data.Data, 'frequency');
                detailedCallBack(key);
            });

            result.push(handlePOW);
            result.push(handleFreq);
            break;
        case ('Analogs'):
            const breakerAnalogsDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetAnalogsData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            breakerAnalogsDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(breakerAnalogsDataHandle);
            break;
        case ('Digitals'):
            const breakerDigitalsDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetBreakerData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            breakerDigitalsDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(breakerDigitalsDataHandle);
            break;
        case ('TripCoil'):
            const waveformTCEDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/OpenSEE/GetData?eventId=${key.EventId}` +
                    `&type=TripCoilCurrent` +
                    `&dataType=Time`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            waveformTCEDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(waveformTCEDataHandle);
            break;
        case ('FirstDerivative'):
            const derivativeDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetFirstDerivativeData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            derivativeDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(derivativeDataHandle);
            break
        case ('ClippedWaveforms'):
            const clippedWaveformDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetClippedWaveformsData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            clippedWaveformDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(clippedWaveformDataHandle);
            break
        case ('Frequency'):
            const freqencyAnalyticDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetFrequencyData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            freqencyAnalyticDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(freqencyAnalyticDataHandle);
            break
        case ('HighPassFilter'):
            const highPassFilterDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetHighPassFilterData?eventId=${key.EventId}` +
                    `&filter=${options.HPFOrder}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            highPassFilterDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(highPassFilterDataHandle);
            break
        case ('LowPassFilter'):
            const lowPassFilterDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetLowPassFilterData?eventId=${key.EventId}` +
                    `&filter=${options.LPFOrder}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            lowPassFilterDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(lowPassFilterDataHandle);
            break

        case ('Impedance'):
            const impedanceDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetImpedanceData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            impedanceDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(impedanceDataHandle);
            break
        case ('Power'):
            const powerDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetPowerData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            powerDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(powerDataHandle);
            break
        case ('MissingVoltage'):
            const missingVoltageDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetMissingVoltageData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            missingVoltageDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(missingVoltageDataHandle);
            break
        case ('OverlappingWave'):
            const overlappingWaveformDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetOverlappingWaveformData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

            overlappingWaveformDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(overlappingWaveformDataHandle);
            break
        case ('Rectifier'):
            const rectifierDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetRectifierData?eventId=${key.EventId}` +
                    `&Trc=${options.Trc}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            rectifierDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(rectifierDataHandle);
            break
        case ('RapidVoltage'):
            const rapidVoltageChangeDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetRapidVoltageChangeData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            rapidVoltageChangeDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(rapidVoltageChangeDataHandle);
            break
        case ('RemoveCurrent'):
            const removeCurrentDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetRemoveCurrentData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            removeCurrentDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(removeCurrentDataHandle);
            break
        case ('Harmonic'):
            const specifiedHarmonicDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetSpecifiedHarmonicData?eventId=${key.EventId}` +
                    `&specifiedHarmonic=${options.Harmonic}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            specifiedHarmonicDataHandle.then((data) => {
                appendCallBack(data.Data, 'time');
                detailedCallBack(key);
            });
            result.push(specifiedHarmonicDataHandle);
            break
        case ('SymetricComp'):
            const symmetricalComponentsDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetSymmetricalComponentsData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            symmetricalComponentsDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(symmetricalComponentsDataHandle);
            break
        case ('THD'):
            const thdDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetTHDData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            thdDataHandle.then((data) => {
                appendCallBack(data.Data, 'time')
                detailedCallBack(key);
            });
            result.push(thdDataHandle);
            break
        case ('Unbalance'):
            const unbalanceDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetUnbalanceData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            unbalanceDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(unbalanceDataHandle);
            break
        case ('FaultDistance'):
            const faultDistanceDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetFaultDistanceData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            faultDistanceDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(faultDistanceDataHandle);
            break
        case ('Restrike'):
            const breakerRestrikeDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetBreakerRestrikeData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            breakerRestrikeDataHandle.then((data) => appendCallBack(data.Data, 'time'));
            result.push(breakerRestrikeDataHandle);
            break
        case ('FFT'):
            const fftAnalyticDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetFFTData?eventId=${key.EventId}&cycles=${options.FFTCycles}&startDate=${options.FFTStartTime}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            fftAnalyticDataHandle.then((data) => {
                appendCallBack(data.Data, 'time')
                detailedCallBack(key);
            });
            result.push(fftAnalyticDataHandle);
            break
        case ('I2T'):
            const i2tDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetI2tData?eventId=${key.EventId}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            i2tDataHandle.then((data) => {
                appendCallBack(data.Data, 'time')
                detailedCallBack(key);
            });
            result.push(i2tDataHandle);
            break
        default:
            break;
    }
    return result;
}

export function getDetailedData(key: OpenSee.IGraphProps, options: OpenSee.IAnalyticContext, callBack: (key: OpenSee.IGraphProps, data: OpenSee.iD3DataSeries[]) => void): Array<JQuery.jqXHR<any>> {
    const result: Array<JQuery.jqXHR<any>> = [];

    switch (key.DataType) {
        case ('Current'):
        case ('Voltage'):
            const handlePOW = $.ajax({
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
            const handleFreq = $.ajax({
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

            handlePOW.then(data => callBack(key, data.Data));
            handleFreq.then(data => callBack(key, data.Data))

            result.push(handlePOW);
            result.push(handleFreq);
            break;

        case ('THD'):
            const thdDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetTHDData?eventId=${key.EventId}&fullRes=1`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            thdDataHandle.then(data => callBack(key, data.Data));
            result.push(thdDataHandle);
            break;

        case ('Harmonic'):
            const specifiedHarmonicDataHandle = $.ajax({
                type: "GET",
                url: `${homePath}api/Analytic/GetSpecifiedHarmonicData?eventId=${key.EventId}&fullRes=1` +
                    `&specifiedHarmonic=${options.Harmonic}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            specifiedHarmonicDataHandle.then(data => callBack(key, data.Data));
            result.push(specifiedHarmonicDataHandle);
            break;
        default:
            return [];
    }

    return result;
}

// This function is to get data for overlapping events
export function getOverlappingEvents(eventID: number, eventStartTime: string | null, eventEndTime: string | null): JQuery.jqXHR<any> {

    const overlappingEventHandle = $.ajax({
        type: "GET",
        url: `${homePath}api/OpenSEE/GetOverlappingEvents?eventId=${eventID}` +
            `${eventStartTime != undefined ? `&startDate=${eventStartTime}` : ``}` +
            `${eventEndTime != undefined ? `&endDate=${eventEndTime}` : ``}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });

    return overlappingEventHandle;
}

// #endregion
