//******************************************************************************************************
//  Markers.ts - Gbtc
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
import { seriesToKey } from "../../Context/PlotKeys";
import { OpenSee } from "../../global";

export interface ILinearScales {
    x: d3.ScaleLinear<number, number>;
    y: Record<string, d3.ScaleLinear<number, number>>;
}

interface IMarker {
    x: number;
    y: number;
    unit: string;
    base: number;
}

export const drawMarkers = (
    container: HTMLDivElement | null,
    lineData: OpenSee.iD3DataSeries[],
    scales: ILinearScales,
    colors: OpenSee.IColorCollection
) => {
    if (container == null) return;

    const points = d3.select(container).select(".DataContainer")
        .selectAll(".Markers")
        .data(lineData)
        .enter()
        .append("g")
        .attr("fill", d => Object.keys(colors).includes(d.Color) ? colors[d.Color] : colors.random)
        .classed("Markers", true)
        .selectAll("circle")
        .data(d => d.DataMarker.map(v => ({
            x: v[0], y: v[1], unit: d.Unit as string, base: d.BaseValue
        } as IMarker)));

    points.enter()
        .append("circle")
        .classed("Circle", true)
        .attr("cx", (d: IMarker) => isNaN(scales.x((d as any)[0])) ? null : scales.x(d.x))
        .attr("cy", (d: IMarker) => isNaN(scales.y[d.unit]((d as any)[1])) ? null : scales.y[d.unit](d.y))
        .attr("r", 10);

    points.exit().remove();
}

export const updateMarkerGeometry = (
    container: HTMLDivElement | null,
    scales: ILinearScales,
    activeUnit: Partial<OpenSee.IUnitCollection<OpenSee.iUnitOptions>> | null
) => {
    if (container == null) return;

    d3.select(container)
        .select(".DataContainer")
        .selectAll<SVGCircleElement, IMarker>("circle")
        .attr("cx", (d: IMarker) => isNaN(scales.x(d.x)) ? null : scales.x(d.x))
        .attr("cy", (d: IMarker) => {
            let factor = 1.0;
            if (activeUnit?.[d.unit] != undefined)
                factor = activeUnit[d.unit].factor === undefined ? (1.0 / d.base) : activeUnit[d.unit].factor;
            return isNaN(scales.y[d.unit](d.y)) ? null : scales.y[d.unit](d.y * factor);
        });
}

export const updateMarkerColors = (container: HTMLDivElement | null, colors: OpenSee.IColorCollection) => {
    if (container == null) return;

    d3.select(container).select(".DataContainer")
        .selectAll<SVGGElement, OpenSee.iD3DataSeries>(".Markers")
        .attr("fill", d => colors[d.Color as string] ?? colors.random);
}

export const updateMarkerVisibility = (container: HTMLDivElement | null, lineData: OpenSee.iD3DataSeries[], enabledLine: Record<string, boolean>) => {
    if (container == null) return;

    d3.select(container).selectAll(".Markers")
        .data(lineData)
        .classed("active", d => enabledLine[seriesToKey(d)] === true)
        .attr("opacity", d => enabledLine[seriesToKey(d)] === true ? 1.0 : 0);
}
