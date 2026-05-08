import * as d3 from "d3";
import { OpenSee } from "../../../global";
import { IFormatTimeContext } from "../../Utilities";
import { createXAxis } from "./XAxes";
import { createYAxes } from "./YAxes";

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

export const CreatePlot = (
    containerEl: HTMLDivElement | null,
    xScaleRef: { current: d3.ScaleLinear<number, number> },
    yScaleRef: { current: Record<string, d3.ScaleLinear<number, number>> },
    params: IPlotChromeParams,
    handlers: IPlotHandlers
) => {
    if (containerEl == null) return;

    const { height, width, dataKey, yLimits, enabledUnits, yLabels, startTime, endTime, showFFT, plotMarkers, fftWindow, currentFFTWindow, mouseMode, timeCtx, displayLabel, eventInfo } = params;

    d3.select(containerEl).select("svg").select("g.root").remove();

    const svg = d3.select(containerEl).select("svg")
        .append("g").classed("root", true)
        .attr("transform", "translate(10,0)");

    // Initialize scales
    if (yLimits) {
        Object.keys(yLimits).forEach(unit => {
            if ((yLimits as any)[unit])
                yScaleRef.current[unit] = d3.scaleLinear().domain((yLimits as any)[unit]).range([height - 40, 20]);
            else
                yScaleRef.current[unit] = d3.scaleLinear().domain([0, 1]).range([height - 40, 20]);
        });
    }

    xScaleRef.current = d3.scaleLinear().domain([startTime, endTime]).range([60, width - 110]);

    createXAxis(svg, xScaleRef.current, height, width, timeCtx);
    createYAxes(svg, enabledUnits, yScaleRef.current, yLabels, height, width);

    // Plot title
    svg.append("text").classed("plotTitle", true)
        .attr("transform", `translate(${(width - 210) / 2 + 60},20)`)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(displayLabel);

    // Clip path
    const clipId = `clipData-${dataKey.DataType}-${dataKey.EventId}`;
    svg.append("defs").append("svg:clipPath")
        .attr("id", clipId)
        .append("svg:rect").classed("clip", true)
        .attr("width", width - 170)
        .attr("height", height - 60)
        .attr("x", 60)
        .attr("y", 20);

    // Zoom window rect
    svg.append("rect").classed("zoomWindow", true)
        .attr("stroke", "#000")
        .attr("x", 60).attr("width", 0)
        .attr("y", 20).attr("height", height - 60)
        .attr("fill", "black")
        .style("opacity", 0);

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

    // Data container
    svg.append("g").classed("DataContainer", true)
        .attr("clip-path", `url(#${clipId})`)
        .style("transition", "d 0.5s")
        .attr("fill", "none")
        .attr("stroke-width", 0.0);

    // Event overlay
    svg.append<SVGRectElement>("svg:rect").classed("Overlay", true)
        .attr("width", width - 110)
        .attr("height", "100%")
        .attr("x", 20)
        .attr("y", 0)
        .style("opacity", 0)
        .on("mousemove", evt => handlers.onMouseMove(evt))
        .on("mouseout", () => handlers.onMouseOut())
        .on("mousedown", evt => handlers.onMouseDown(evt))
        .on("mouseup", () => handlers.onMouseUp())
        .on("mouseenter", () => handlers.onMouseEnter())
        .call(handlers.wheelZoom)
        .on("wheel", evt => evt.preventDefault());

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