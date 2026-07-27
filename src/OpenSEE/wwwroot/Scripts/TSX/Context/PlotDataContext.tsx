// PlotDataContext.tsx
// Stores the heavy iD3DataSeries arrays keyed by plot.
// This context only updates on data fetch, plot removal, and analytic refresh.
// Interactive actions (zoom, enable trace, etc.) never touch this context.

import * as React from 'react';
import { OpenSee } from '../global';
import { PlotKey, toPlotKey } from './PlotKeys';

interface IPlotDataState {
    plots: Record<PlotKey, OpenSee.iD3DataSeries[]>;
}

interface IPlotDataActions {
    // Append new series to an existing plot (used during initial fetch)
    AppendPlotData: (key: OpenSee.IGraphProps, data: OpenSee.iD3DataSeries[], eventId: number) => void;
    // Remove a plot entirely
    RemovePlotData: (key: OpenSee.IGraphProps) => void;
    // Remove only series belonging to a specific event (for overlapping removal)
    FilterPlotDataByEvent: (key: OpenSee.IGraphProps, eventId: number) => void;
    // Clear series but keep the key present (for analytic refresh)
    ClearPlotData: (key: OpenSee.IGraphProps) => void;
    // Initialize an empty entry so meta can be created in parallel
    InitPlotData: (key: OpenSee.IGraphProps) => void;
    // Replace individual series with high-res versions, matched by legend fields.
    // Preserves EventID from the original series.
    ReplaceDetailedData: (key: OpenSee.IGraphProps, detailed: OpenSee.iD3DataSeries[]) => void;
}

const defaultState: IPlotDataState = { plots: {} };

const defaultActions: IPlotDataActions = {
    AppendPlotData: () => { /* noop */ },
    RemovePlotData: () => { /* noop */ },
    FilterPlotDataByEvent: () => { /* noop */ },
    ClearPlotData: () => { /* noop */ },
    InitPlotData: () => { /* noop */ },
    ReplaceDetailedData: () => { /* noop */ },
};

export const PlotDataStateContext = React.createContext<IPlotDataState>(defaultState);
export const PlotDataActionContext = React.createContext<IPlotDataActions>(defaultActions);

export const PlotDataProvider = (props: React.PropsWithChildren<{}>) => {
    const [state, setState] = React.useState<IPlotDataState>(defaultState);

    const actions = React.useMemo<IPlotDataActions>(() => ({
        InitPlotData: (key) => {
            const pk = toPlotKey(key);
            setState(prev => {
                if (prev.plots[pk] != null)
                    return prev;
                return { plots: { ...prev.plots, [pk]: [] } };
            });
        },

        AppendPlotData: (key, data, eventId) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const existing = prev.plots[pk] ?? [];
                // Stamp each incoming series with the source event ID
                const stamped = data.map(d => ({ ...d, EventID: eventId }));
                return {
                    plots: { ...prev.plots, [pk]: [...existing, ...stamped] }
                };
            });
        },

        RemovePlotData: (key) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const next = { ...prev.plots };
                delete next[pk];
                return { plots: next };
            });
        },

        FilterPlotDataByEvent: (key, eventId) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const existing = prev.plots[pk];
                if (!existing) return prev;
                return {
                    plots: {
                        ...prev.plots,
                        [pk]: existing.filter(d => d.EventID !== eventId)
                    }
                };
            });
        },

        ClearPlotData: (key) => {
            const pk = toPlotKey(key);
            setState(prev => ({
                plots: { ...prev.plots, [pk]: [] }
            }));
        },

        ReplaceDetailedData: (key, detailed) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const existing = prev.plots[pk];
                if (!existing || detailed.length === 0) return prev;

                const updated = [...existing];
                const matched: number[] = [];

                detailed.forEach(d => {
                    const idx = updated.findIndex((od, i) =>
                        od.LegendGroup === d.LegendGroup &&
                        od.LegendHorizontal === d.LegendHorizontal &&
                        od.LegendVertical === d.LegendVertical &&
                        od.LegendVGroup === d.LegendVGroup &&
                        !matched.includes(i)
                    );
                    if (idx >= 0) {
                        // Preserve EventID from the original series
                        updated[idx] = { ...d, EventID: existing[idx].EventID };
                        matched.push(idx);
                    }
                });

                return { plots: { ...prev.plots, [pk]: updated } };
            });
        },
    }), []);

    return (
        <PlotDataActionContext.Provider value={actions}>
            <PlotDataStateContext.Provider value={state}>
                {props.children}
            </PlotDataStateContext.Provider>
        </PlotDataActionContext.Provider>
    );
};