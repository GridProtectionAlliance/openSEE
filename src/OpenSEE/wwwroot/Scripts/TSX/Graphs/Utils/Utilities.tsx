//******************************************************************************************************
//  Utilities.tsx - Gbtc
//
//  Copyright � 2021, Grid Protection Alliance.  All Rights Reserved.
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

import React from 'react';
import { OpenSee } from "../../global"
import { defaultSettings } from "../../defaults"
import moment from "moment";
import { GetTextWidth } from '@gpa-gemstone/helper-functions';
import * as d3 from 'd3';
import { IChartScales, IFormatTimeContext, IPanZoomInteractionInputs, IPanZoomInteractionResult, ITooltipLocations } from './Types';

export const GetDisplayLabel = (type: OpenSee.graphType, harmonic?: number): string => {
    switch (type) {
        case ('FirstDerivative'):
            return "First Derivative"
        case ('HighPassFilter'):
            return "High Pass Filter"
        case ('LowPassFilter'):
            return "Low Pass Filter"
        case ('ClippedWaveforms'):
            return "Fixed Clipped Waveforms"
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
            return harmonic == null ? "Specified Harmonic" : `Specified Harmonic (${harmonic})`
        case ('SymetricComp'):
            return "Symmetrical Components"
        case ('FaultDistance'):
            return "Fault Distance"
        case ('Restrike'):
            return "Breaker Restrike"
        case ('I2T'):
            return "I2T"
        default:
            return (type as string)
    }
};

export const formatValueTick = (d: number, unit: OpenSee.Unit, yScaleCollection: OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}): string => {
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
};

export const formatTimeTick = (d: number, ctx: IFormatTimeContext, extraPrecision = false): string => {
    const TS = moment(d);
    let h = ctx.xDomainWidth;
    // moment/JS Date only resolve to whole milliseconds, so when extra precision is requested the
    // sub-second portion is taken from the raw value (which keeps sub-ms detail) instead of moment.
    const extra = extraPrecision ? 1 : 0;
    const subSecondMs = d - Math.floor(d / 1000) * 1000;

    if (ctx.isOverlappingWaveform) {
        if (defaultSettings.OverlappingWaveTimeUnit.options?.[ctx.overlappingWaveTimeUnit]?.short === "ms") {
            if (h < 2)
                return d.toFixed(3 + extra)
            if (h < 5)
                return d.toFixed(2 + extra)
            else
                return d.toFixed(1 + extra)
        } else if (defaultSettings.OverlappingWaveTimeUnit.options?.[ctx.overlappingWaveTimeUnit]?.short === "cycles") {
            const cyc = d * 60.0 / 1000.0;
            h = h * 60.0 / 1000.0;
            if (h < 2)
                return cyc.toFixed(3 + extra)
            if (h < 5)
                return cyc.toFixed(2 + extra)
            else
                return cyc.toFixed(1 + extra)
        }

    }
    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'auto') {
        if (h < 100)
            return extraPrecision ? subSecondMs.toFixed(3) : TS.format("SSS.S")
        else if (h < 1000)
            return TS.format("ss.SS")
        else
            return TS.format("ss.S")
    }
    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 's') {
        if (h < 100)
            return extraPrecision ? ((d % 60000) / 1000).toFixed(5) : TS.format("ss.SSS")
        else if (h < 1000)
            return TS.format("ss.SS")
        else
            return TS.format("ss.S")
    }
    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'ms')
        if (extraPrecision)
            return subSecondMs.toFixed(3)
        else if (h < 100)
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
            return ms.toFixed(3 + extra)
        if (h < 5)
            return ms.toFixed(2 + extra)
        else
            return ms.toFixed(1 + extra)
    }

    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'ms since inception') {
        let ms = d - ctx.inceptionTime;

        if (ctx.useRelevantTime && !ctx.isOriginalEvt) {
            const evt = ctx.overlappingEvents.find(evt => evt.EventID === ctx.dataKeyEventId);
            if (evt != null)
                ms = d - evt?.Inception
        }

        if (h < 2)
            return ms.toFixed(3 + extra)
        if (h < 5)
            return ms.toFixed(2 + extra)
        else
            return ms.toFixed(1 + extra)
    }

    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'cycles since record') {
        const cyc = (d - ctx.startTime) * 60.0 / 1000.0;

        h = h * 60.0 / 1000.0;
        if (h < 2)
            return cyc.toFixed(3 + extra)
        if (h < 5)
            return cyc.toFixed(2 + extra)
        else
            return cyc.toFixed(1 + extra)
    }
    else if (ctx.timeUnit.options?.[ctx.timeUnit.current]?.short == 'cycles since inception') {
        const cyc = (d - ctx.inceptionTime) * 60.0 / 1000.0;

        h = h * 60.0 / 1000.0;
        if (h < 2)
            return cyc.toFixed(3 + extra)
        if (h < 5)
            return cyc.toFixed(2 + extra)
        else
            return cyc.toFixed(1 + extra)
    }

    return d.toFixed(1);
};

// Convenience wrapper over formatTimeTick for an absolute time on the main (original,
// non-overlapping) event. Fills in the context fields that are constant in that case so callers
// only supply the values that vary; output matches the x-axis ticks.
export const formatMainEventTimeTick = (
    d: number,
    opts: { timeUnit: OpenSee.IUnitSetting; domainWidth: number; startTime: number; originalStartTime: number; inceptionTime: number }
): string =>
    formatTimeTick(d, {
        xDomainWidth: opts.domainWidth,
        isOverlappingWaveform: false,
        overlappingWaveTimeUnit: 0,
        timeUnit: opts.timeUnit,
        originalStartTime: opts.originalStartTime,
        useRelevantTime: false,
        isOriginalEvt: true,
        overlappingEvents: [],
        dataKeyEventId: 0,
        inceptionTime: opts.inceptionTime,
        startTime: opts.startTime
    }, true);

// Formats a time DELTA (a duration in ms) using the same unit convention as the x-axis ticks.
// Unlike formatTimeTick (which formats absolute clock times), a delta is a duration, so every
// unit collapses to a converted numeric value + label. The 'since record/inception' references
// cancel out in a difference, so they reduce to plain ms/cycles.
export const formatTimeDelta = (deltaMs: number, timeUnit: OpenSee.IUnitSetting, domainWidthMS: number): string => {
    if (isNaN(deltaMs))
        return '';

    let short = timeUnit.options?.[timeUnit.current]?.short ?? 'auto';
    if (short === 'auto')
        short = domainWidthMS < 100 ? 'ms' : 's';

    if (short === 's')
        return (deltaMs / 1000).toFixed(7) + ' (s)';
    if (short === 'min')
        return (deltaMs / 60000).toFixed(5) + ' (min)';
    if (short.startsWith('cycles'))
        return (deltaMs * 60.0 / 1000.0).toFixed(6) + ' (cycles)';

    return deltaMs.toFixed(3) + ' (ms)';
};

export const useChartScales = <TX extends d3.AxisScale<any>,>(initial: TX): IChartScales<TX> => {
    const xScaleRef = React.useRef<TX>(initial);
    const yScaleRef = React.useRef<OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}>({});
    return { xScaleRef, yScaleRef };
};

export const useTooltipLocations = (
    xScaleRef: React.MutableRefObject<d3.ScaleLinear<number, number>>,
    hover: [number, number],
    points: OpenSee.IPoint[],
    evtInfo: OpenSee.IEventInfo | null,
    startTime: number,
    endTime: number,
    xRange: [number, number]
): ITooltipLocations => {
    const [toolTipLocation, setTooltipLocation] = React.useState<number>(10);
    const [selectedPointLocation, setSelectedPointLocation] = React.useState<number | null>(null);
    const [inceptionLocation, setInceptionLocation] = React.useState<number>(10);
    const [durationLocation, setDurationLocation] = React.useState<number>(10);

    React.useEffect(() => {
        if (xScaleRef.current)
            setTooltipLocation(xScaleRef.current(hover?.[0]));
    }, [hover]);

    React.useEffect(() => {
        if (!xScaleRef.current) return;
        const newTime = points.length > 0 ? points[0].Time : null;
        if (newTime != null && !isNaN(newTime))
            setSelectedPointLocation(xScaleRef.current(newTime));
        else
            setSelectedPointLocation(null);
    }, [points, startTime, endTime, xRange[0], xRange[1]]);

    React.useEffect(() => {
        if (!xScaleRef.current || evtInfo == null) return;
        setInceptionLocation(xScaleRef.current(evtInfo.Inception));
        setDurationLocation(xScaleRef.current(evtInfo.DurationEndTime));
    }, [startTime, endTime, evtInfo, xRange[0], xRange[1]]);

    return { toolTipLocation, selectedPointLocation, inceptionLocation, durationLocation };
};

export const useYLabelFontSize = (
    yLabels: Partial<OpenSee.IUnitCollection<string>>,
    primaryAxis: string,
    height: number
): number => {
    const [fontSize, setFontSize] = React.useState<number>(1);

    React.useEffect(() => {
        let fs = 1;
        let l = GetTextWidth('', '1rem', yLabels?.[primaryAxis]);
        let r = GetTextWidth('', '1rem', yLabels?.[primaryAxis] ?? "");

        while (((l > height - 60) || (r > height - 60)) && fs > 0.2) {
            fs -= 0.05;
            l = GetTextWidth('', `${fs}rem`, yLabels?.[primaryAxis]);
            r = GetTextWidth('', `${fs}rem`, yLabels?.[primaryAxis] ?? "");
        }
        if (fs !== fontSize)
            setFontSize(fs);
    }, [height, yLabels]);

    return fontSize;
};

export const usePanZoomInteractions = (inputs: IPanZoomInteractionInputs): IPanZoomInteractionResult => {
    const {
        containerRef, yScaleRef, primaryAxis, hover, setHover,
        mouseMode, zoomMode, plotData, dataKey,
        width, height, xDomainStart, xDomainEnd, yLimits,
        pxToDomainX, setXLimits, setYLimits
    } = inputs;

    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    const [mouseDownInit, setMouseDownInit] = React.useState<boolean>(false);
    const [pointMouse, setPointMouse] = React.useState<[number, number]>([0, 0]);
    const [leftSelectCounter, setLeftSelectCounter] = React.useState<number>(0);
    const pendingHoverRef = React.useRef<[number, number] | null>(null);
    const hoverRafRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (hoverRafRef.current != null)
                cancelAnimationFrame(hoverRafRef.current);
        };
    }, []);

    React.useEffect(() => {
        if (leftSelectCounter === 0 || leftSelectCounter === 1) return;
        const handle = setTimeout(() => { MouseLeft(); }, 500);
        return () => { clearTimeout(handle); };
    }, [leftSelectCounter]);

    React.useEffect(() => {
        if (!mouseDownInit) {
            setMouseDownInit(true);
            return;
        }

        if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'x')
            setXLimits(Math.min(pointMouse[0], hover[0]), Math.max(pointMouse[0], hover[0]), plotData);
        else if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'y')
            setYLimits([Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], dataKey, plotData);
        else if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'xy') {
            setXLimits(Math.min(pointMouse[0], hover[0]), Math.max(pointMouse[0], hover[0]), plotData);
            setYLimits([Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], dataKey, plotData);
        }
    }, [mouseDown]);

    React.useEffect(() => {
        const deltaX = hover[0] - pointMouse[0];
        const deltaData = hover[1] - pointMouse[1];

        if (mouseMode === 'pan' && mouseDown && (zoomMode === 'x' || zoomMode === 'xy') && Math.abs(deltaX) > 0)
            setXLimits(xDomainStart - deltaX, xDomainEnd - deltaX, plotData);

        if (mouseMode === 'pan' && mouseDown && (zoomMode === 'y' || zoomMode === 'xy'))
            setYLimits(
                [(yLimits as any)[primaryAxis]?.[0] - deltaData, (yLimits as any)[primaryAxis]?.[1] - deltaData],
                dataKey,
                plotData
            );
    }, [hover]);

    const queueHover = (value: [number, number]): void => {
        pendingHoverRef.current = value;
        if (hoverRafRef.current == null) {
            hoverRafRef.current = requestAnimationFrame(() => {
                hoverRafRef.current = null;
                if (pendingHoverRef.current != null) {
                    setHover(pendingHoverRef.current);
                    pendingHoverRef.current = null;
                }
            });
        }
    };

    const getPointerDomain = (evt: any): [number, number] => {
        let x0 = d3.pointer(evt, evt.currentTarget)[0];
        let y0 = d3.pointer(evt, evt.currentTarget)[1];

        if (x0 < 60) x0 = 60;
        if (x0 > (width - 140)) x0 = width - 140;
        if (y0 < 20) y0 = 20;
        if (y0 > (height - 40)) y0 = height - 40;

        const x = pxToDomainX(x0);
        const y = (yScaleRef.current as any)[primaryAxis].invert(y0);
        return [x, y];
    };

    const MouseMove = (evt: any): void => {
        queueHover(getPointerDomain(evt));
    };

    const MouseDown = (evt: any): void => {
        setMouseDown(true);
        setPointMouse(getPointerDomain(evt));
    };

    const flushPendingHover = (): void => {
        if (hoverRafRef.current != null) {
            cancelAnimationFrame(hoverRafRef.current);
            hoverRafRef.current = null;
        }
        if (pendingHoverRef.current != null) {
            setHover(pendingHoverRef.current);
            pendingHoverRef.current = null;
        }
    };

    const MouseUp = (): void => {
        flushPendingHover();
        setMouseDown(false);
    };

    const MouseOut = (): void => {
        setLeftSelectCounter(() => -1);
    };

    const MouseLeft = (): void => {
        setMouseDown(false);
    };

    return {
        handlers: {
            onMouseMove: MouseMove,
            onMouseDown: MouseDown,
            onMouseUp: MouseUp,
            onMouseOut: MouseOut,
            onMouseEnter: () => setLeftSelectCounter(1),
        },
        mouseDown,
        pointMouse,
    };
};
