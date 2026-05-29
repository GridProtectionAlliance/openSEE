//******************************************************************************************************
//  ChromeBuilder.ts - Gbtc
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

export interface IChromeBuilderParams {
    height: number;
    width: number;
    dataKey: OpenSee.IGraphProps;
    yLimits: Partial<OpenSee.IUnitCollection<[number, number]>>;
    displayLabel: string;
}

export interface IChromeHandlers {
    onMouseMove: (evt: any) => void;
    onMouseOut: () => void;
    onMouseDown: (evt: any) => void;
    onMouseUp: () => void;
    onMouseEnter?: () => void;
    wheelZoom?: d3.ZoomBehavior<SVGRectElement, unknown>;
}

export const CreatePlotSVG = (
    containerEl: HTMLDivElement | null,
    yScaleRef: { current: Record<string, d3.ScaleLinear<number, number>> },
    params: IChromeBuilderParams,
    handlers: IChromeHandlers
) => {
    if (containerEl == null) return null;

    const { height, width, dataKey, yLimits, displayLabel } = params;
    d3.select(containerEl).select("svg.root").select("g.root").remove();

    const svg = d3.select(containerEl).select("svg.root")
        .append("g").classed("root", true)
        .attr("transform", "translate(10,0)");

    if (yLimits) {
        Object.keys(yLimits).forEach(unit => {
            if ((yLimits as any)[unit])
                yScaleRef.current[unit] = d3.scaleLinear().domain((yLimits as any)[unit]).range([height - 40, 20]);
            else
                yScaleRef.current[unit] = d3.scaleLinear().domain([0, 1]).range([height - 40, 20]);
        });
    }

    svg.append("text").classed("plotTitle", true)
        .attr("transform", `translate(${(width - 210) / 2 + 60},20)`)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(displayLabel);

    const clipId = `clipData-${dataKey.DataType}-${dataKey.EventId}`;
    svg.append("defs").append("svg:clipPath")
        .attr("id", clipId)
        .append("svg:rect").classed("clip", true)
        .attr("width", width - 170)
        .attr("height", height - 60)
        .attr("x", 60)
        .attr("y", 20);

    svg.append("rect").classed("zoomWindow", true)
        .attr("stroke", "#000")
        .attr("x", 60).attr("width", 0)
        .attr("y", 20).attr("height", height - 60)
        .attr("fill", "black")
        .style("opacity", 0);

    svg.append("g").classed("DataContainer", true)
        .attr("clip-path", `url(#${clipId})`)
        .style("transition", "d 0.5s")
        .attr("fill", "none")
        .attr("stroke-width", 0.0);

    const overlay = svg.append<SVGRectElement>("svg:rect").classed("Overlay", true)
        .attr("width", width - 110)
        .attr("height", "100%")
        .attr("x", 20)
        .attr("y", 0)
        .style("opacity", 0)
        .on("mousemove", evt => {
            evt.stopPropagation();
            handlers.onMouseMove(evt);
        })
        .on("mouseout", evt => {
            evt.stopPropagation();
            handlers.onMouseOut();
        })
        .on("mousedown", evt => {
            evt.stopPropagation();
            handlers.onMouseDown(evt);
        })
        .on("mouseup", evt => {
            evt.stopPropagation();
            handlers.onMouseUp();
        });

    if (handlers.onMouseEnter != null)
        overlay.on("mouseenter", evt => {
            evt.stopPropagation();
            handlers.onMouseEnter?.();
        });

    if (handlers.wheelZoom != null)
        overlay.call(handlers.wheelZoom).on("wheel.overlayBlock", evt => {
            evt.preventDefault();
            evt.stopPropagation();
        });

    return svg;
}
