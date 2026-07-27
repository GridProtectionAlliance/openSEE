//******************************************************************************************************
//  AnglePoints.ts - Gbtc
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

export const createBarLineGen = (
    scales: IBarScales,
    activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null,
    unit: OpenSee.Unit | null,
    base: number | null
) => {
    const yScale = scales.y[unit ?? ""];
    const factor = unit != null && base != null ? getFactor(activeUnit, unit, base) : 1.0;

    return d3.line<[number, number]>()
        .x(d => {
            const x = scales.x(d[0]);
            return x == null ? 0 : x + scales.x.bandwidth() / 2;
        })
        .y(d => yScale != null ? yScale(d[1] * factor) : 0)
        .defined(d => {
            const x = scales.x(d[0]);
            const y = yScale != null ? yScale(d[1] * factor) : NaN;
            return x != null && Number.isFinite(x) && Number.isFinite(y);
        });
}

export const drawAnglePoints = (
    container: HTMLDivElement | null,
    barData: OpenSee.iD3DataSeries[],
    scales: IBarScales,
    colors: OpenSee.IColorCollection,
    enabledBar: Record<string, boolean>,
    activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null
) => {
    if (container == null) return;

    const pointData = barData.filter(d => d.LegendHorizontal === "Ang");
    const dataContainer = d3.select(container).select(".DataContainer");

    const points = dataContainer.selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Point").data(pointData);
    const pointEnter = points.enter()
        .append("g")
        .classed("Point", true)
        .attr("fill", d => colors[d.Color] ?? colors.random);

    pointEnter.selectAll("circle")
        .data(d => toBarSeries(d, enabledBar))
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("stroke", "none");

    points.exit().remove();

    const lines = dataContainer.selectAll<SVGPathElement, OpenSee.iD3DataSeries>(".Line").data(pointData);
    lines.enter()
        .append("path")
        .classed("Line", true)
        .attr("type", d => `axis-${d.Unit}`)
        .attr("fill", "none")
        .attr("stroke", d => colors[d.Color] ?? colors.random)
        .attr("stroke-dasharray", d => d.LineType == null || d.LineType === "-" ? 0 : 5);

    lines.exit().remove();
    updateAnglePointGeometry(container, scales, activeUnit);
}

export const updateAnglePointGeometry = (
    container: HTMLDivElement | null,
    scales: IBarScales,
    activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null
) => {
    if (container == null) return;

    const dataContainer = d3.select(container).select(".DataContainer");

    dataContainer
        .selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Point")
        .selectAll<SVGCircleElement, OpenSee.BarSeries>("circle")
        .attr("cx", d => {
            const x = scales.x(d.data[0]);
            return x == null || isNaN(x) ? 0 : x + scales.x.bandwidth() / 2;
        })
        .style("opacity", d => {
            const x = scales.x(d.data[0]);
            return x == null || isNaN(x) ? 0.0 : 1.0;
        })
        .attr("cy", d => {
            const yScale = scales.y[d.unit];
            const y = yScale == null ? NaN : yScale(d.data[1] * getFactor(activeUnit, d.unit, d.base));
            return isNaN(y) ? -1 : y;
        })
        .attr("r", d => {
            const x = scales.x(d.data[0]);
            return x == null || isNaN(x) ? 0.0 : 5;
        });

    dataContainer
        .selectAll<SVGPathElement, OpenSee.iD3DataSeries>(".Line")
        .attr("d", d => {
            const lineGen = createBarLineGen(scales, activeUnit, d.Unit, d.BaseValue);
            if (d.SmoothDataPoints.length > 0)
                return lineGen.curve(d3.curveNatural)(d.SmoothDataPoints);
            return lineGen(d.DataPoints);
        });
}

export const updateAnglePointColors = (container: HTMLDivElement | null, colors: OpenSee.IColorCollection) => {
    if (container == null) return;

    const dataContainer = d3.select(container).select(".DataContainer");
    dataContainer.selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Point")
        .attr("fill", d => colors[d.Color] ?? colors.random);
    dataContainer.selectAll<SVGPathElement, OpenSee.iD3DataSeries>(".Line")
        .attr("stroke", d => colors[d.Color] ?? colors.random);
}

export const updateAnglePointVisibility = (
    container: HTMLDivElement | null,
    barData: OpenSee.iD3DataSeries[],
    enabledBar: Record<string, boolean>
) => {
    if (container == null) return;

    const pointData = barData.filter(d => d.LegendHorizontal === "Ang");
    const dataContainer = d3.select(container).select(".DataContainer");

    dataContainer.selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Point")
        .data(pointData)
        .classed("active", d => enabledBar[seriesToKey(d)] === true)
        .style("opacity", d => enabledBar[seriesToKey(d)] === true ? 1.0 : 0);

    dataContainer.selectAll<SVGPathElement, OpenSee.iD3DataSeries>(".Line")
        .data(pointData)
        .classed("active", d => enabledBar[seriesToKey(d)] === true)
        .style("opacity", d => enabledBar[seriesToKey(d)] === true ? 1.0 : 0);
}
