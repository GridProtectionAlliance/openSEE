// PlotKeys.ts
// Stable string keys for identifying plots and individual series in Record-based maps.
// Used across PlotDataContext and PlotStateContext to avoid object reference lookups.
//
// PlotKey identifies a plot (DataType + EventId).
// SeriesKey identifies a single trace within a plot. It uses explicit fields
// so that neither context needs to depend on iD3DataSeries directly.

import { OpenSee } from '../global';

export type PlotKey = string;

export function toPlotKey(key: OpenSee.IGraphProps): PlotKey {
    return `${key.DataType}|${key.EventId}`;
}

export function fromPlotKey(plotKey: PlotKey): OpenSee.IGraphProps {
    const [DataType, id] = plotKey.split('|');
    return { DataType: DataType as OpenSee.graphType, EventId: parseInt(id, 10) };
}

export type SeriesKey = string;
export type LegendTraceKey = string;

// Builds a stable key from the four legend dimensions plus event ID.
// Callers pull these fields from whatever source they have access to --
// chart components read them from data series, the lifecycle hook reads
// them at ingestion time. PlotStateContext never needs to know where
// the values came from.
export function toSeriesKey(
    legendGroup: string,
    legendHorizontal: string,
    legendVertical: string,
    legendVGroup: string,
    eventId: number
): SeriesKey {
    return `${legendGroup}|${legendHorizontal}|${legendVertical}|${legendVGroup}|${eventId}`;
}

export function toLegendTraceKey(
    legendHorizontal: string,
    legendVertical: string,
    legendVGroup: string
): LegendTraceKey {
    return `${legendHorizontal}|${legendVertical}|${legendVGroup}`;
}

// Convenience overload for callers that already have a series-shaped object.
// Keeps chart components concise without forcing PlotStateContext to import the data type.
export function seriesToKey(series: {
    LegendGroup: string;
    LegendHorizontal: string;
    LegendVertical: string;
    LegendVGroup: string;
    EventID: number;
}): SeriesKey {
    return toSeriesKey(
        series.LegendGroup,
        series.LegendHorizontal,
        series.LegendVertical,
        series.LegendVGroup,
        series.EventID
    );
}

export function seriesToLegendTraceKey(series: {
    LegendHorizontal: string;
    LegendVertical: string;
    LegendVGroup: string;
}): LegendTraceKey {
    return toLegendTraceKey(
        series.LegendHorizontal,
        series.LegendVertical,
        series.LegendVGroup
    );
}
