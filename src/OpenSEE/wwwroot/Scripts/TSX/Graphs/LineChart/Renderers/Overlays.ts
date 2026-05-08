//******************************************************************************************************
//  Overlays.tsx - Gbtc
//
//  Copyright © 2025, Grid Protection Alliance.  All Rights Reserved.
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
//  05/08/2025 - Preston Crawford
//       Generated original version of source code
//
//******************************************************************************************************

import * as d3 from "d3";

export const updateFFTWindow = (
    container: HTMLDivElement | null,
    dataType: string,
    currentFFTWindow: [number, number],
    showFFT: boolean,
    mouseMode: string
) => {
    if (container == null || (dataType !== 'Voltage' && dataType !== 'Current'))
        return;

    d3.select(container)
        .select(".fftWindow")
        .attr("x", currentFFTWindow[0])
        .attr("width", currentFFTWindow[1] - currentFFTWindow[0])
        .style("opacity", showFFT ? 0.5 : 0)
        .style("cursor", mouseMode === "fftMove" && showFFT ? "grab" : "default");
}

export const updateDurationWindowRect = (container: HTMLDivElement | null, xScale: d3.ScaleLinear<number, number>, inception: number, durationEndTime: number, plotMarkers: boolean) => {
    if (container == null) return;

    d3.select(container)
        .select(".DurationWindow")
        .attr("x", xScale(inception))
        .attr("width", xScale(durationEndTime) - xScale(inception))
        .style("opacity", plotMarkers ? 0.25 : 0);
}

export function updateZoomWindow(
    container: HTMLDivElement | null,
    xScale: d3.ScaleLinear<number, number>,
    primaryYScale: d3.ScaleLinear<number, number>,
    hover: [number, number],
    pointMouse: [number, number],
    mouseMode: string,
    zoomMode: string, // needs to be typed.. 
    mouseDown: boolean,
    startTime: number,
    endTime: number,
    height: number
): void {
    if (container == null || mouseMode !== "zoom" || !mouseDown) return;

    const zoomWindow = d3.select(container).select(".zoomWindow");

    if (zoomMode === "x")
        zoomWindow.style("opacity", 0.5)
            .attr("x", xScale(Math.min(hover[0], pointMouse[0])))
            .attr("width", Math.abs(xScale(hover[0]) - xScale(pointMouse[0])))
            .attr("height", height - 60)
            .attr("y", 20);
    else if (zoomMode === "y")
        zoomWindow.style("opacity", 0.5)
            .attr("x", xScale(startTime))
            .attr("width", xScale(endTime) - xScale(startTime))
            .attr("height", Math.abs(primaryYScale(pointMouse[1]) - primaryYScale(hover[1])))
            .attr("y", Math.min(primaryYScale(pointMouse[1]), primaryYScale(hover[1])));
    else if (zoomMode === "xy")
        zoomWindow.style("opacity", 0.5)
            .attr("x", xScale(Math.min(hover[0], pointMouse[0])))
            .attr("width", Math.abs(xScale(hover[0]) - xScale(pointMouse[0])))
            .attr("height", Math.abs(primaryYScale(pointMouse[1]) - primaryYScale(hover[1])))
            .attr("y", Math.min(primaryYScale(pointMouse[1]), primaryYScale(hover[1])));
}
