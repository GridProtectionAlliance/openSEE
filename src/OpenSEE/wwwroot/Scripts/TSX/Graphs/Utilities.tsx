//******************************************************************************************************
//  Utilities.tsx - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  02/23/2021 - C. Lackner
//       Generated original version of source code
//
//******************************************************************************************************

import { OpenSee } from "../global"
import { defaultSettings } from "../defaults"
import moment from "moment";

export function GetDisplayLabel(type: OpenSee.graphType): string {
    switch (type) {
        case ('FirstDerivative'):
            return "First Derivative"
        case ('HighPassFilter'):
            return "High Pass Filter"
        case ('LowPassFilter'):
            return "Low Pass Filter"
        case ('ClippedWaveforms'):
            return "Fixed Waveforms"
        case ('OverlappingWave'):
            return "Overlapping Waveform"
        case ('MissingVoltage'):
            return "Missing Voltage"
        case ('Rectifier'):
            return 'Rectifier Output';
        case ('RapidVoltage'):
            return "Rapid Voltage Change"
        case ('RemoveCurrent'):
            return "Remove Current"
        case ('Harmonic'):
            return "Specified Harmonic"
        case ('SymetricComp'):
            return "Symmetrical Components"
        case ('FaultDistance'):
            return "Fault Distance"
        case ('Restrike'):
            return "Breaker Restrike"
        default:
            return (type as string)
    }
}

export function sortGraph(item1: OpenSee.IGraphProps, item2: OpenSee.IGraphProps): number {
    if (item1.DataType == item2.DataType)
        return 0

    const index1 = defaultSettings.PlotOrder.findIndex((v) => v == item1.DataType);
    const index2 = defaultSettings.PlotOrder.findIndex((v) => v == item2.DataType);

    if (index1 != -1 && index2 != -1)
        return (index1 > index2 ? 1 : -1);
    if (index1 != -1)
        return -1;
    if (index2 != -1)
        return 1;

    return (item1 > item2 ? 1 : -1);
}

export function formatValueTick(d: number, unit: OpenSee.Unit, yScaleCollection: OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}): string {
    let h = 1;

    if (yScaleCollection)
        h = yScaleCollection[unit].domain()[1] - yScaleCollection[unit].domain()[0]

    if (Math.abs(d) >= 100000) {
        return d.toString().slice(0, 4) + '...';
    }

    if (h > 100)
        return d.toFixed(0)

    if (h > 10)
        return d.toFixed(1)
    else
        return d.toFixed(2)
}

export interface IFormatTimeContext {
    xDomainWidth: number;
    isOverlappingWaveform: boolean;
    overlappingWaveTimeUnit: number;
    timeUnit: OpenSee.IUnitSetting;
    originalStartTime: number;
    useRelevantTime: boolean;
    isOriginalEvt: boolean;
    overlappingEvents: OpenSee.OverlappingEvents[];
    dataKeyEventId: number;
    inceptionTime: number;
    startTime: number;
}

export function formatTimeTick(d: number, ctx: IFormatTimeContext): string {
    const TS = moment(d);
    let h = ctx.xDomainWidth;

    if (ctx.isOverlappingWaveform) {
        if (defaultSettings.OverlappingWaveTimeUnit.options?.[ctx.overlappingWaveTimeUnit]?.short === "ms") {
            if (h < 2)
                return d.toFixed(3)
            if (h < 5)
                return d.toFixed(2)
            else
                return d.toFixed(1)
        } else if (defaultSettings.OverlappingWaveTimeUnit.options?.[ctx.overlappingWaveTimeUnit]?.short === "cycles") {
            const cyc = d * 60.0 / 1000.0;
            h = h * 60.0 / 1000.0;
            if (h < 2)
                return cyc.toFixed(3)
            if (h < 5)
                return cyc.toFixed(2)
            else
                return cyc.toFixed(1)
        }

    }
    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'auto') {
        if (h < 100)
            return TS.format("SSS.S")
        else if (h < 1000)
            return TS.format("ss.SS")
        else
            return TS.format("ss.S")
    }
    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 's') {
        if (h < 100)
            return TS.format("ss.SSS")
        else if (h < 1000)
            return TS.format("ss.SS")
        else
            return TS.format("ss.S")
    }
    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'ms')
        if (h < 100)
            return TS.format("SSS.S")
        else
            return TS.format("SSS")

    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'min')
        return TS.format("mm:ss")

    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'ms since record') {
        let ms = d - ctx.originalStartTime;

        if (ctx.useRelevantTime && !ctx.isOriginalEvt) {
            const evt = ctx.overlappingEvents.find(evt => evt.EventID === ctx.dataKeyEventId);
            if (evt != null)
                ms = d - evt?.StartTime
        }

        if (h < 2)
            return ms.toFixed(3)
        if (h < 5)
            return ms.toFixed(2)
        else
            return ms.toFixed(1)
    }

    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'ms since inception') {
        let ms = d - ctx.inceptionTime;

        if (ctx.useRelevantTime && !ctx.isOriginalEvt) {
            const evt = ctx.overlappingEvents.find(evt => evt.EventID === ctx.dataKeyEventId);
            if (evt != null)
                ms = d - evt?.Inception
        }

        if (h < 2)
            return ms.toFixed(3)
        if (h < 5)
            return ms.toFixed(2)
        else
            return ms.toFixed(1)
    }

    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'cycles since record') {
        const cyc = (d - ctx.startTime) * 60.0 / 1000.0;

        h = h * 60.0 / 1000.0;
        if (h < 2)
            return cyc.toFixed(3)
        if (h < 5)
            return cyc.toFixed(2)
        else
            return cyc.toFixed(1)
    }
    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'cycles since inception') {
        const cyc = (d - ctx.startTime) * 60.0 / 1000.0;

        h = h * 60.0 / 1000.0;
        if (h < 2)
            return cyc.toFixed(3)
        if (h < 5)
            return cyc.toFixed(2)
        else
            return cyc.toFixed(1)
    }

    return d.toFixed(1);
}