//******************************************************************************************************
//  XAxisFreq.ts - Gbtc
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

export const formatFrequencyTick = (d: number, xScaleLbl: d3.ScaleLinear<number, number>): string => {
    let h = 1;
    if (xScaleLbl != null)
        h = xScaleLbl.domain()[1] - xScaleLbl.domain()[0];

    if (h > 100)
        return d.toFixed(0);
    if (h > 10)
        return d.toFixed(1);
    if (h > 1)
        return d.toFixed(2);
    return d.toFixed(3);
}

export const computeBandOffsets = (xScaleBand: d3.ScaleBand<number>) => {
    const step = xScaleBand.step();
    const bandwidth = xScaleBand.bandwidth();

    const offsetLeft = Number.isFinite(step) && Number.isFinite(bandwidth)
        ? step * xScaleBand.paddingOuter() * xScaleBand.align() * 2 + 0.5 * bandwidth
        : 0;

    const offsetRight = Number.isFinite(step) && Number.isFinite(bandwidth)
        ? step * xScaleBand.paddingOuter() * (1 - xScaleBand.align()) * 2 + 0.5 * bandwidth
        : 0;

    return { 
        offsetLeft, 
        offsetRight 
    };
}

export const syncFrequencyScaleRange = (
    xScaleBand: d3.ScaleBand<number>,
    xScaleLbl: d3.ScaleLinear<number, number>,
    width: number
) => {
    const { offsetLeft, offsetRight } = computeBandOffsets(xScaleBand);
    xScaleLbl.range([60 + offsetLeft, width - 110 - offsetRight]);
    return { 
        offsetLeft, 
        offsetRight 
    };
}

export const setFrequencyDomainFromBands = (xScaleBand: d3.ScaleBand<number>, xScaleLbl: d3.ScaleLinear<number, number>) => {
    const domain = xScaleBand.domain();
    if (domain.length === 0) {
        xScaleLbl.domain([0, 1]);
        return;
    }
    xScaleLbl.domain([60.0 * domain[0], 60.0 * domain[domain.length - 1]]);
}

export const createFrequencyXAxis = (
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScaleBand: d3.ScaleBand<number>,
    xScaleLbl: d3.ScaleLinear<number, number>,
    height: number,
    width: number
) => {
    syncFrequencyScaleRange(xScaleBand, xScaleLbl, width);

    svg.append("g")
        .classed("xAxis", true)
        .attr("transform", `translate(0,${height - 40})`)
        .call(d3.axisBottom(xScaleLbl).tickFormat(d => formatFrequencyTick(d as number, xScaleLbl)).tickSizeOuter(0));

    svg.append("text").classed("xAxisLabel", true)
        .attr("transform", `translate(${(width - 210) / 2 + 60},${height - 10})`)
        .style("text-anchor", "middle")
        .text("Harmonic (Hz)");

    updateFrequencyAxisExtents(svg, xScaleBand, xScaleLbl, height, width);
}

export const updateFrequencyXAxisTicks = (container: HTMLDivElement | null, xScaleLbl: d3.ScaleLinear<number, number>) => {
    if (container == null) return;

    d3.select(container)
        .selectAll(".xAxis")
        .transition()
        .call(d3.axisBottom(xScaleLbl).tickFormat(d => formatFrequencyTick(d as number, xScaleLbl)).tickSizeOuter(0) as any);
}

export const updateFrequencyXAxisOnResize = (
    container: HTMLDivElement | null,
    xScaleBand: d3.ScaleBand<number>,
    xScaleLbl: d3.ScaleLinear<number, number>,
    height: number,
    width: number
) => {
    if (container == null) return;

    const sel = d3.select(container);
    syncFrequencyScaleRange(xScaleBand, xScaleLbl, width);

    sel.select(".xAxis").attr("transform", `translate(0,${height - 40})`);
    sel.select(".xAxisLabel").attr("transform", `translate(${(width - 210) / 2 + 60},${height - 10})`);
    sel.select(".plotTitle").attr("transform", `translate(${(width - 210) / 2 + 60},20)`).style("font-weight", "bold");

    updateFrequencyAxisExtents(sel.select("g.root") as any, xScaleBand, xScaleLbl, height, width);
    updateFrequencyXAxisTicks(container, xScaleLbl);
}

const updateFrequencyAxisExtents = (
    svg: d3.Selection<any, unknown, any, any>,
    xScaleBand: d3.ScaleBand<number>,
    xScaleLbl: d3.ScaleLinear<number, number>,
    height: number,
    width: number
) => {
    const { offsetLeft, offsetRight } = syncFrequencyScaleRange(xScaleBand, xScaleLbl, width);
    const left = svg.selectAll<SVGLineElement, unknown>(".xAxisExtLeft").data([null]);
    left.enter()
        .append("line")
        .classed("xAxisExtLeft", true)
        .attr("stroke", "currentColor")
        .merge(left)
        .attr("x1", 60)
        .attr("x2", 60 + offsetLeft)
        .attr("y1", height - 40)
        .attr("y2", height - 40);

    const right = svg.selectAll<SVGLineElement, unknown>(".xAxisExtRight").data([null]);
    right.enter()
        .append("line")
        .classed("xAxisExtRight", true)
        .attr("stroke", "currentColor")
        .merge(right)
        .attr("x1", width - 110)
        .attr("x2", width - 110 - offsetRight)
        .attr("y1", height - 40)
        .attr("y2", height - 40);
}
