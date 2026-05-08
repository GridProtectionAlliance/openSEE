//******************************************************************************************************
//  XAxes.tsx - Gbtc
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
import { OpenSee } from "../../../global";
import { formatTimeTick, IFormatTimeContext } from "../../Utilities";

export function createXAxis(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleLinear<number, number>,
    height: number,
    width: number,
    timeCtx: IFormatTimeContext
): void {
    svg.append("g").classed("xAxis", true)
        .attr("transform", `translate(0,${height - 40})`)
        .call(d3.axisBottom(xScale).tickFormat(d => formatTimeTick(d as number, timeCtx)));

    svg.append("text").classed("xAxisLabel", true)
        .attr("transform", `translate(${(width - 210) / 2 + 60},${height - 5})`)
        .style("text-anchor", "middle")
        .text("Time");
}

export function updateXAxisTicks(
    container: HTMLDivElement | null,
    xScale: d3.ScaleLinear<number, number>,
    timeCtx: IFormatTimeContext
): void {
    if (!container) return;

    d3.select(container).selectAll(".xAxis")
        .transition()
        .call(d3.axisBottom(xScale).tickFormat(d => formatTimeTick(d as number, timeCtx)) as any);
}

export const updateXAxisLabel = (
    container: HTMLDivElement | null,
    xScale: d3.ScaleLinear<number, number>,
    isOverlappingWaveform: boolean,
    timeUnit: OpenSee.IUnitSetting
) => {
    if (container == null) return;

    const h = xScale != null ? xScale.domain()[1] - xScale.domain()[0] : 100;

    let label: string;
    if ((timeUnit as OpenSee.IUnitSetting).options?.[timeUnit.current]?.short !== "auto" && !isOverlappingWaveform) {
        label = (timeUnit as OpenSee.IUnitSetting).options?.[timeUnit.current]?.short ?? "";
    } else if (isOverlappingWaveform) {
        label = h < 100 ? "ms" : "s";
    } else if ((timeUnit as OpenSee.IUnitSetting).options?.[timeUnit.current]?.short === "ms since event") {
        label = "ms";
    } else if ((timeUnit as OpenSee.IUnitSetting).options?.[timeUnit.current]?.short === "cycles") {
        label = "cycle";
    } else {
        label = h < 100 ? "ms" : "s";
    }

    d3.select(container)
        .select(".xAxisLabel")
        .text(`Time (${label})`);
}

export const updateXAxisPositionOnResize = (container: HTMLDivElement | null, height: number, width: number) => {
    if (container == null) return;

    d3.select(container).select(".xAxis").attr("transform", `translate(0,${height - 40})`);
    d3.select(container).select(".xAxisLabel")
        .attr("transform", `translate(${(width - 210) / 2 + 60},${height - 5})`);
    d3.select(container).select(".plotTitle")
        .attr("transform", `translate(${(width - 210) / 2 + 60},20)`)
        .style("font-weight", "bold");
}
