//******************************************************************************************************
//  YAxes.ts - Gbtc
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
import { OpenSee } from "../../global";
import { formatValueTick } from "../Utils/Utilities";

export const createYAxes = (
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    enabledUnits: OpenSee.Unit[],
    yScaleCollection: Record<string, d3.ScaleLinear<number, number>>,
    yLabels: Partial<OpenSee.IUnitCollection<string>>,
    height: number,
    width: number
) => {
    let isAxisLeft = true;

    enabledUnits.forEach(unit => {
        const axisTransform = isAxisLeft ? "translate(60,0)" : `translate(${width - 110},0)`;

        svg.append("g")
            .classed("yAxis", true)
            .attr("type", `${unit}`)
            .attr("transform", axisTransform)
            .call(
                isAxisLeft
                    ? d3.axisLeft(yScaleCollection[unit]).tickFormat(d => formatValueTick(d as number, unit, yScaleCollection))
                    : d3.axisRight(yScaleCollection[unit]).tickFormat(d => formatValueTick(d as number, unit, yScaleCollection))
            )
            .style("opacity", 1);

        const labelYPos = isAxisLeft ? 2 : width - 70;

        svg.append("text")
            .classed(isAxisLeft ? "yAxisLabelLeft" : "yAxisLabelRight", true)
            .attr("type", `${unit}`)
            .attr("x", -(height / 2 - 20))
            .attr("y", labelYPos)
            .attr("dy", "1em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .style("opacity", 1)
            .text(yLabels[unit] ?? "");

        isAxisLeft = !isAxisLeft;
    });
}

export const updateYAxes = (
    container: HTMLDivElement | null,
    enabledUnits: OpenSee.Unit[],
    yScaleCollection: Record<string, d3.ScaleLinear<number, number>>,
    width: number,
    dataType: string,
    eventId: number
) => {
    if (container == null) return;

    const sel = d3.select(container);
    let isAxisLeft = true;
    let currentAxis = 0;

    enabledUnits?.forEach(unit => {
        const axisType = `[type='${unit}']`;
        const firstLeftAxisType = `[type='${enabledUnits[0]}']`;
        const firstRightAxisType = `[type='${enabledUnits[1]}']`;
        const yScale = yScaleCollection[unit];
        if (yScale == null) return;

        if (isAxisLeft) {
            if (currentAxis > 1) {
                sel.selectAll(`.yAxis${firstLeftAxisType}`).attr("transform", "translate(120, 0)");
                sel.selectAll(`.yAxisLabelLeft${firstLeftAxisType}`).attr("y", "62");
            }
            sel.selectAll(`.yAxis${axisType}`)
                .transition()
                .call(d3.axisLeft(yScale).tickFormat(d => formatValueTick(d as number, unit, yScaleCollection)) as any);
        } else {
            if (currentAxis > 2) {
                sel.selectAll(`.yAxis${firstRightAxisType}`).attr("transform", `translate(${width - 170},0)`);
                sel.selectAll(`.yAxisLabelRight${firstRightAxisType}`).attr("y", width - 135);
            }
            sel.selectAll(".yAxis")
                .selectAll(`[type='${unit}']`)
                .transition()
                .call(d3.axisRight(yScale).tickFormat(d => formatValueTick(d as number, unit, yScaleCollection)) as any);
        }

        isAxisLeft = !isAxisLeft;
        currentAxis++;
    });

    const clipPath = sel.select(`#clipData-${dataType}-${eventId} > rect`);
    const evtOverlay = sel.select("rect.Overlay");

    if (enabledUnits.length < 3) {
        clipPath.attr("x", 60).attr("width", width - 170);
        evtOverlay.attr("x", 20).attr("width", width - 110);
        return;
    }

    if (enabledUnits.length === 3) {
        clipPath.attr("x", 120).attr("width", width - 270);
        evtOverlay.attr("x", 120).attr("width", width - 270);
    } else if (enabledUnits.length === 4) {
        clipPath.attr("x", 120).attr("width", width - 210 - 120);
        evtOverlay.attr("x", 120).attr("width", width - 210 - 120);
    }
}

export const updateYAxisLabels = (
    container: HTMLDivElement | null,
    relevantUnits: OpenSee.Unit[],
    yLabels: Partial<OpenSee.IUnitCollection<string>>,
    fontSize: number
) => {
    if (container == null) return;

    const sel = d3.select(container);
    const fs = `${fontSize}rem`;

    relevantUnits.forEach(unit => {
        sel.select(`.yAxisLabelLeft[type='${unit}']`).style("font-size", fs).text(yLabels[unit] ?? "");
        sel.select(`.yAxisLabelRight[type='${unit}']`).style("font-size", fs).text(yLabels[unit] ?? "");
    });
}

export const updateYAxisVisibility = (
    container: HTMLDivElement | null,
    relevantUnits: OpenSee.Unit[],
    enabledUnits: OpenSee.Unit[]
) => {
    if (container == null) return;

    const sel = d3.select(container);

    relevantUnits.forEach(unit => {
        const axisType = `[type='${unit}']`;
        if (enabledUnits?.includes(unit)) {
            sel.selectAll(`.yAxis${axisType}`).style("opacity", 1);
            sel.selectAll(`.yAxisLabelLeft${axisType}`).style("opacity", 1);
            sel.selectAll(`.yAxisLabelRight${axisType}`).style("opacity", 1);
        } else {
            sel.selectAll(`.yAxis${axisType}`).style("opacity", 0);
            sel.selectAll(`.yAxisLabelLeft${axisType}`).style("opacity", 0);
            sel.selectAll(`.yAxisLabelRight${axisType}`).style("opacity", 0);
        }
    });
}

export const updateYAxisPositionsOnResize = (
    container: HTMLDivElement | null,
    relevantUnits: OpenSee.Unit[],
    yScaleCollection: Record<string, d3.ScaleLinear<number, number>>,
    height: number,
    width: number
) => {
    if (container == null) return;

    const sel = d3.select(container);
    sel.select(".yAxisLabelLeft").attr("x", -(height / 2 - 20));
    sel.select(".yAxisLabelRight").attr("y", width - 120).attr("x", -(height / 2 - 20));

    let isAxisLeft = true;
    relevantUnits.forEach(unit => {
        if (yScaleCollection[unit] == null) return;

        yScaleCollection[unit].range([height - 40, 20]);

        const axisType = `[type='${unit}']`;
        const axisTransform = isAxisLeft ? "translate(60,0)" : `translate(${width - 110},0)`;
        sel.selectAll(`.yAxis${axisType}`).attr("transform", axisTransform);

        isAxisLeft = !isAxisLeft;
    });
}
