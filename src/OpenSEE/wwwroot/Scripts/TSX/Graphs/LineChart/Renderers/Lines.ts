//******************************************************************************************************
//  Lines.tsx - Gbtc
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
import { seriesToKey } from "../../../Context/PlotKeys";
import { OpenSee } from "../../../global";

export interface IScales {
    x: d3.ScaleLinear<number, number>;
    y: Record<string, d3.ScaleLinear<number, number>>;
}

export const createLineGen = (
    scales: IScales,
    activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null,
    unit: OpenSee.Unit | null,
    base: number | null
) => {
    let factor = 1.0;

    if (unit && base && activeUnit?.[unit]) {
        const f = activeUnit[unit]?.factor;
        factor = f === undefined ? 1.0 / base : f;
    }

    const xScale = scales.x;
    const yScale = scales.y[unit ?? ""];

    return d3.line<[number, number]>()
        .x(d => xScale ? xScale(d[0]) : 0)
        .y(d => yScale != null ? yScale(d[1] * factor) : 0)
        .defined(d => Number.isFinite(d[0]) && Number.isFinite(d[1]));
}

export const drawLines = (
    container: HTMLDivElement | null,
    lineData: OpenSee.iD3DataSeries[],
    scales: IScales,
    activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null,
    colors: OpenSee.IColorCollection,
    singlePlot: boolean,
    currentEventId: number | null
) => {
    if (container == null) return;

    const lines = d3.select(container)
        .select(".DataContainer")
        .selectAll(".Line")
        .data(lineData);

    lines.enter()
        .append("path")
        .classed("Line", true)
        .attr("type", d => `${d.Unit}`)
        .attr("stroke", d => Object.keys(colors).includes(d.Color) ? colors[d.Color] : colors.random)
        .attr("stroke-dasharray", d => singlePlot && currentEventId !== d.EventID ? 5 : 0)
        .attr("d", d => {
            if (d.SmoothDataPoints.length > 0)
                return createLineGen(scales, activeUnit, d.Unit, null).curve(d3.curveNatural)(d.SmoothDataPoints);
            return createLineGen(scales, activeUnit, d.Unit, null)(d.DataPoints);
        });

    lines.exit().remove();
}

export const updateLineGeometry = (container: HTMLDivElement | null, scales: IScales, activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null) => {
    if (container == null) return;

    d3.select(container)
        .select(".DataContainer")
        .selectAll<SVGPathElement, OpenSee.iD3DataSeries>(".Line")
        .attr("d", d => {
            if (d.SmoothDataPoints.length > 0)
                return createLineGen(scales, activeUnit, d.Unit, d.BaseValue).curve(d3.curveNatural)(d.SmoothDataPoints);
            return createLineGen(scales, activeUnit, d.Unit, d.BaseValue)(d.DataPoints);
        });
}

export const updateLineColors = (container: HTMLDivElement | null, colors: OpenSee.IColorCollection) => {
    if (container == null) return;

    d3.select(container)
        .select(".DataContainer")
        .selectAll<SVGPathElement, OpenSee.iD3DataSeries>(".Line")
        .attr("stroke", d => colors[d.Color as string] ?? colors.random);
}

export const updateLineVisibility = (container: HTMLDivElement | null, lineData: OpenSee.iD3DataSeries[], enabledLine: Record<string, boolean>) => {
    if (container == null) return;

    d3.select(container)
        .selectAll(".Line")
        .data(lineData)
        .classed("active", d => enabledLine[seriesToKey(d)] === true)
        .attr("stroke-width", d => enabledLine[seriesToKey(d)] === true ? 2.5 : 0);
}