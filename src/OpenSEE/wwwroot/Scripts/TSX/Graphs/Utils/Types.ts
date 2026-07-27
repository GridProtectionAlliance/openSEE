//******************************************************************************************************
//  Types.ts - Gbtc
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
//******************************************************************************************************

import React from 'react';
import { OpenSee } from "../../global"
import { PlotDataMap } from '../../Context/PlotStateContext';
import * as d3 from 'd3';

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

export interface IChartScales<TX extends d3.AxisScale<any>> {
    xScaleRef: React.MutableRefObject<TX>;
    yScaleRef: React.MutableRefObject<OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}>;
}

export interface ITooltipLocations {
    toolTipLocation: number;
    selectedPointLocation: number | null;
    inceptionLocation: number;
    durationLocation: number;
}

export interface IPanZoomInteractionInputs {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
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
    xDomainStart: number;
    xDomainEnd: number;
    yLimits: Partial<OpenSee.IUnitCollection<[number, number]>>;
    pxToDomainX: (px: number) => number;
    pxAtDomainX: (d: number) => number;
    setXLimits: (lo: number, hi: number, plotData: PlotDataMap) => void;
    setYLimits: (limits: [number, number], key: OpenSee.IGraphProps, plotData: PlotDataMap) => void;
}

export interface IPanZoomInteractionResult {
    handlers: {
        onMouseMove: (evt: any) => void;
        onMouseDown: (evt: any) => void;
        onMouseUp: () => void;
        onMouseOut: () => void;
        onMouseEnter: () => void;
    };
    mouseDown: boolean;
    pointMouse: [number, number];
}