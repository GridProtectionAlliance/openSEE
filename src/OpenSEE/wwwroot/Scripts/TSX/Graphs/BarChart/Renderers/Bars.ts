//******************************************************************************************************
//  Bars.ts - Gbtc
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
import { seriesToKey } from "../../../Context/PlotKeys";
import { OpenSee } from "../../../global";
import { getFactor, IBarScales, toBarSeries } from "../Utils";

export const drawBars = (
    container: HTMLDivElement | null,
    barData: OpenSee.iD3DataSeries[],
    scales: IBarScales,
    colors: OpenSee.IColorCollection,
    enabledBar: Record<string, boolean>,
    activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null,
    plotHeight: number
) => {
    if (container == null) return;

    const rectData = barData.filter(d => d.LegendHorizontal === "Mag");
    const bars = d3.select(container).select(".DataContainer").selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Bar").data(rectData);

    const enter = bars.enter()
        .append("g")
        .classed("Bar", true)
        .attr("stroke", d => colors[d.Color] ?? colors.random);

    enter.selectAll("rect")
        .data(d => toBarSeries(d, enabledBar))
        .enter()
        .append("rect")
        .attr("fill", "none")
        .attr("stroke-width", 2);

    bars.exit().remove();
    updateBarGeometry(container, scales, activeUnit, plotHeight);
}

export const updateBarGeometry = (
    container: HTMLDivElement | null,
    scales: IBarScales,
    activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null,
    plotHeight: number
) => {
    if (container == null) return;

    d3.select(container)
        .select(".DataContainer")
        .selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Bar")
        .selectAll<SVGRectElement, OpenSee.BarSeries>("rect")
        .attr("x", d => {
            const x = scales.x(d.data[0]);
            return x == null || isNaN(x) ? 0 : x;
        })
        .style("opacity", d => {
            const x = scales.x(d.data[0]);
            return x == null || isNaN(x) ? 0.0 : 1.0;
        })
        .attr("y", d => {
            const yScale = scales.y[d.unit];
            const y = yScale == null ? NaN : yScale(d.data[1] * getFactor(activeUnit, d.unit, d.base));
            return isNaN(y) ? 0 : y;
        })
        .attr("width", Math.max(scales.x.bandwidth(), 0))
        .attr("height", d => {
            const yScale = scales.y[d.unit];
            const y = yScale == null ? NaN : yScale(d.data[1] * getFactor(activeUnit, d.unit, d.base));
            return isNaN(y) ? 0 : Math.max(plotHeight - y, 0);
        });
}

export const updateBarColors = (container: HTMLDivElement | null, colors: OpenSee.IColorCollection) => {
    if (container == null) return;

    d3.select(container)
        .select(".DataContainer")
        .selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Bar")
        .attr("stroke", d => colors[d.Color] ?? colors.random);
}

export const updateBarVisibility = (
    container: HTMLDivElement | null,
    barData: OpenSee.iD3DataSeries[],
    enabledBar: Record<string, boolean>
) => {
    if (container == null) return;

    const rectData = barData.filter(d => d.LegendHorizontal === "Mag");
    d3.select(container)
        .select(".DataContainer")
        .selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Bar")
        .data(rectData)
        .classed("active", d => enabledBar[seriesToKey(d)] === true)
        .style("opacity", d => enabledBar[seriesToKey(d)] === true ? 1.0 : 0);
}
