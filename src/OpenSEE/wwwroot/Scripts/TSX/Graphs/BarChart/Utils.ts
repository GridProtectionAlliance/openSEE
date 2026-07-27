//******************************************************************************************************
//  Utils.ts - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  05/08/2026 - Preston Crawford
//       Generated original version of source code
//
//******************************************************************************************************

import * as d3 from "d3";
import React from "react";
import { PlotDataMap, PlotStateActionContext } from "../../Context/PlotStateContext";
import { OpenSee } from "../../global";
import { usePanZoomInteractions } from "../Utils/Utilities";
import { seriesToKey } from "../../Context/PlotKeys";

export const getXbucket = (pixel: number, xScale: d3.ScaleBand<number>): number => {
    const domain = xScale.domain();
    if (domain.length === 0)
        return NaN;

    const range = xScale.range();
    const step = xScale.step();
    if (!Number.isFinite(step) || step <= 0)
        return domain[0];

    const p = pixel - range[0];
    let index = Math.floor(p / step);

    if (index < 0)
        index = 0;
    if (index >= domain.length)
        index = domain.length - 1;

    return domain[index];
}

interface IInputs {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    xScaleRef: React.MutableRefObject<d3.ScaleBand<number>>;
    yScaleRef: React.MutableRefObject<OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}>;
    primaryAxis: string;
    hover: [number, number];
    setHover: (h: [number, number]) => void;
    mouseMode: OpenSee.MouseMode;
    zoomMode: OpenSee.ZoomMode;
    plotData: PlotDataMap;
    dataKey: OpenSee.IGraphProps;
    height: number;
    width: number;
    fftLimits: [number, number];
    yLimits: Partial<OpenSee.IUnitCollection<[number, number]>>;
}

export const useBarMouseInteractions = (inputs: IInputs) => {
    const stateActions = React.useContext(PlotStateActionContext);
    const {
        containerRef, xScaleRef, yScaleRef, primaryAxis,
        hover, setHover, mouseMode, zoomMode, plotData,
        dataKey, height, width, fftLimits, yLimits
    } = inputs;

    return usePanZoomInteractions({
        containerRef,
        yScaleRef,
        primaryAxis,
        hover,
        setHover,
        mouseMode,
        zoomMode,
        plotData,
        dataKey,
        height,
        width,
        xDomainStart: fftLimits[0],
        xDomainEnd: fftLimits[1],
        yLimits,
        pxToDomainX: px => getXbucket(px, xScaleRef.current),
        pxAtDomainX: d => (xScaleRef.current(d) ?? 0) + xScaleRef.current.bandwidth() / 2,
        setXLimits: stateActions.SetFFTLimits,
        setYLimits: stateActions.SetZoomedLimits
    });
}

export interface IBarScales {
    x: d3.ScaleBand<number>;
    y: Record<string, d3.ScaleLinear<number, number>>;
}

export const getFactor = (activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null, unit: OpenSee.Unit, base: number): number => {
    const factor = activeUnit?.[unit]?.factor;
    if (factor === undefined && activeUnit?.[unit] != null)
        return 1.0 / base;
    return factor ?? 1.0;
}

export const toBarSeries = (d: OpenSee.iD3DataSeries, enabledBar: Record<string, boolean>): OpenSee.BarSeries[] => {
    const seriesKey = seriesToKey(d);
    return d.DataPoints.map(pt => ({
        unit: d.Unit,
        data: pt,
        color: d.Color,
        base: d.BaseValue,
        enabled: enabledBar[seriesKey] === true,
        seriesKey
    }));
}