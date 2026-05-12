//******************************************************************************************************
//  CreatePlot.tsx - Gbtc
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
import { OpenSee } from "../../../global";
import { IFormatTimeContext } from "../../Utils/Types";
import { CreatePlotSVG } from "../../Renderers/CreatePlotSVG";
import { createYAxes } from "../../Renderers/YAxes";
import { createXAxis } from "./XAxes";

export interface IPlotChromeParams {
    height: number;
    width: number;
    dataKey: OpenSee.IGraphProps;
    yLimits: Partial<OpenSee.IUnitCollection<[number, number]>>;
    enabledUnits: OpenSee.Unit[];
    yLabels: Partial<OpenSee.IUnitCollection<string>>;
    startTime: number;
    endTime: number;
    showFFT: boolean;
    plotMarkers: boolean;
    fftWindow: [number, number];
    currentFFTWindow: [number, number];
    mouseMode: OpenSee.MouseMode;
    timeCtx: IFormatTimeContext;
    displayLabel: string;
    eventInfo: OpenSee.IEventInfo | null;
}

export interface IPlotHandlers {
    onMouseMove: (evt: any) => void;
    onMouseOut: () => void;
    onMouseDown: (evt: any) => void;
    onMouseUp: () => void;
    onMouseEnter: () => void;
    onFFTMouseDown: (evt: any) => void;
    onFFTMouseUp: () => void;
    wheelZoom: d3.ZoomBehavior<SVGRectElement, unknown>;
}

export const CreateLinePlot = (
    containerEl: HTMLDivElement | null,
    xScaleRef: { current: d3.ScaleLinear<number, number> },
    yScaleRef: { current: Record<string, d3.ScaleLinear<number, number>> },
    params: IPlotChromeParams,
    handlers: IPlotHandlers
) => {
    if (containerEl == null) return;

    const { height, width, dataKey, yLimits, enabledUnits, yLabels, startTime, endTime, showFFT, plotMarkers, fftWindow, currentFFTWindow, mouseMode, timeCtx, displayLabel, eventInfo } = params;

    const svg = CreatePlotSVG(
        containerEl,
        yScaleRef,
        { height, width, dataKey, yLimits, displayLabel },
        { ...handlers, wheelZoom: handlers.wheelZoom }
    );

    if (svg == null) return;

    xScaleRef.current = d3.scaleLinear().domain([startTime, endTime]).range([60, width - 110]);

    createXAxis(svg, xScaleRef.current, height, width, timeCtx);
    createYAxes(svg, enabledUnits, yScaleRef.current, yLabels, height, width);
    const clipId = `clipData-${dataKey.DataType}-${dataKey.EventId}`;

    // Duration window rect
    if (eventInfo != null)
        svg.append("rect").classed("DurationWindow", true)
            .attr("clip-path", `url(#${clipId})`)
            .attr("stroke", "#d3d3d3")
            .attr("x", xScaleRef.current(eventInfo.Inception))
            .attr("width", eventInfo.DurationEndTime - eventInfo.Inception)
            .style("opacity", plotMarkers ? 0.25 : 0)
            .attr("y", 20).attr("height", height - 60)
            .attr("fill", "black");

    // FFT window rect (only for Voltage/Current)
    if (dataKey.DataType === "Voltage" || dataKey.DataType === "Current")
        svg.append("rect").classed("fftWindow", true)
            .attr("clip-path", `url(#${clipId})`)
            .attr("stroke", "#000")
            .style("z-index", 9999)
            .attr("x", xScaleRef.current(fftWindow[0]))
            .attr("width", currentFFTWindow[1] - currentFFTWindow[0])
            .style("opacity", showFFT ? 0.5 : 0)
            .style("cursor", mouseMode === "fftMove" && showFFT ? "grab" : "default")
            .attr("y", 20).attr("height", height - 60)
            .attr("fill", "black")
            .on("mousemove", evt => handlers.onMouseMove(evt))
            .on("mousedown", evt => handlers.onFFTMouseDown(evt))
            .on("mouseup", () => handlers.onFFTMouseUp());
}
