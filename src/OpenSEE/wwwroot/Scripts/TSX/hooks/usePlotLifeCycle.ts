// hooks/usePlotLifecycle.ts
// Orchestrates plot add/remove/refresh operations that need to coordinate
// writes to both PlotDataContext and PlotStateContext.
// Returns action functions only -- no effects. Cross-context effects
// (eventID -> overlapping reload, analytic -> refresh, singlePlot toggle)
// belong in OpenSeeApplication as plain useEffect calls.
//
// This hook should be consumed once in OpenSeeApplication, not in leaf components.

import * as React from 'react';
import _ from 'lodash';
import { OpenSee } from '../global';
import { toPlotKey } from '../Context/PlotKeys';
import { PlotDataStateContext, PlotDataActionContext } from '../Context/PlotDataContext';
import { PlotStateStateContext, PlotStateActionContext } from '../Context/PlotStateContext';
import { OverlappingActionContext, OverlappingStateContext } from '../Context/OverlappingContext';
import { getDefaultEnabled } from '../Context/PlotStateUtilities';
import AnalyticContext from '../Context/AnalyticContext';
import { getData, getDetailedData } from '../Data/GraphLogic';
import { AddRequest, CancelEvent, AppendRequest } from '../Data/RequestHandler';
import { useAppSelector } from '../hooks';
import { SelectSinglePlot, SelectDefaultTraces, SelectVTypeDefault } from '../Store/settingSlice';

export interface IPlotLifecycleActions {
    AddPlot: (
        key: OpenSee.IGraphProps,
        yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
        isZoomed?: boolean,
        fftLimits?: [number, number],
        cycleLimits?: [number, number],
        forceSinglePlot?: boolean
    ) => void;
    RemovePlot: (key: OpenSee.IGraphProps) => void;
    UpdateAnalyticPlot: (key: OpenSee.IGraphProps) => void;
    EnableOverlappingEvent: (eventId: number) => void;
    ReplaceBaseEvent: (oldEventId: number, newEventId: number) => void;
    RebuildSinglePlots: () => void;
    RemoveSinglePlots: () => void;
}

export const usePlotLifecycle = (): IPlotLifecycleActions => {
    const { plots: plotData } = React.useContext(PlotDataStateContext);
    const dataActions = React.useContext(PlotDataActionContext);
    const plotState = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);
    const overlapping = React.useContext(OverlappingStateContext);
    const overlappingActions = React.useContext(OverlappingActionContext);
    const [analytic] = React.useContext(AnalyticContext);
    const singlePlot = useAppSelector(SelectSinglePlot);
    const defaultTrace = useAppSelector(SelectDefaultTraces);
    const defaultVType = useAppSelector(SelectVTypeDefault);
    const singlePlotRef = React.useRef(singlePlot);
    const overlayDataRef = React.useRef<Record<string, OpenSee.iD3DataSeries[]>>({});
    singlePlotRef.current = singlePlot;

    const AddPlot = React.useCallback((
        key: OpenSee.IGraphProps,
        yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
        isZoomed?: boolean,
        fftLimits?: [number, number],
        cycleLimits?: [number, number],
        forceSinglePlot?: boolean
    ) => {
        const useSinglePlot = forceSinglePlot ?? singlePlotRef.current;

        // Initialize empty entries in both contexts
        dataActions.InitPlotData(key);
        stateActions.InitPlotMeta(key, yLimits, isZoomed);

        if (useSinglePlot) {
            const overlayKey: OpenSee.IGraphProps = { DataType: key.DataType, EventId: -1 };
            dataActions.InitPlotData(overlayKey);
            stateActions.InitPlotMeta(overlayKey);
        }

        // Track accumulated data locally so OnDataAppended always gets the full picture
        const accumulated: OpenSee.iD3DataSeries[] = [];

        const handles = getData(
            key,
            analytic,
            (data) => {
                // Stamp EventID and accumulate
                const stamped = data.map(d => ({ ...d, EventID: key.EventId }));
                accumulated.push(...stamped);

                const enabledMap = getDefaultEnabled(key.DataType, defaultTrace, defaultVType, [...accumulated]);

                dataActions.AppendPlotData(key, data, key.EventId);
                stateActions.OnDataAppended(key, [...accumulated], enabledMap);

                if (useSinglePlot) {
                    const overlayKey: OpenSee.IGraphProps = { DataType: key.DataType, EventId: -1 };
                    const overlayPk = toPlotKey(overlayKey);
                    const previousOverlayData = overlayDataRef.current[overlayPk] ?? plotData[overlayPk] ?? [];
                    const nextOverlayData = [...previousOverlayData, ...stamped];
                    overlayDataRef.current[overlayPk] = nextOverlayData;

                    const overlayEnabledMap = getDefaultEnabled(key.DataType, defaultTrace, defaultVType, nextOverlayData);
                    dataActions.AppendPlotData(overlayKey, data, key.EventId);
                    stateActions.OnDataAppended(overlayKey, nextOverlayData, overlayEnabledMap);
                }
            },
            (detailedKey) => {
                initiateDetailed(detailedKey, analytic, dataActions);
            }
        );

        AddRequest(key, handles);

        Promise.all(handles).then(
            () => {
                stateActions.SetPlotLoading(key, 'Idle');
                if (useSinglePlot)
                    stateActions.SetPlotLoading({ DataType: key.DataType, EventId: -1 }, 'Idle');

                if (fftLimits != null)
                    stateActions.SetFFTLimits(fftLimits[0], fftLimits[1], plotData);
                if (cycleLimits != null)
                    stateActions.SetCycleLimit(cycleLimits[0], cycleLimits[1], plotData);
            },
            () => {
                stateActions.SetPlotLoading(key, 'Error');
                if (useSinglePlot)
                    stateActions.SetPlotLoading({ DataType: key.DataType, EventId: -1 }, 'Error');
            }
        );
    }, [analytic, plotData, dataActions, stateActions, defaultTrace, defaultVType]);

    const RemovePlot = React.useCallback((key: OpenSee.IGraphProps) => {
        CancelEvent(key.EventId);
        dataActions.RemovePlotData(key);
        stateActions.RemovePlotMeta(key);

        // Clean up the overlay plot if in singlePlot mode
        if (singlePlotRef.current) {
            const overlayKey: OpenSee.IGraphProps = { DataType: key.DataType, EventId: -1 };
            const overlayPk = toPlotKey(overlayKey);
            dataActions.FilterPlotDataByEvent(overlayKey, key.EventId);

            const remaining = (overlayDataRef.current[overlayPk] ?? plotData[overlayPk] ?? []).filter(d => d.EventID !== key.EventId);
            overlayDataRef.current[overlayPk] = remaining;
            if (remaining.length === 0) {
                delete overlayDataRef.current[overlayPk];
                dataActions.RemovePlotData(overlayKey);
                stateActions.RemovePlotMeta(overlayKey);
            } else {
                const remainingEnabled = getDefaultEnabled(key.DataType, defaultTrace, defaultVType, remaining);
                stateActions.OnDataAppended(overlayKey, remaining, remainingEnabled);
            }
        }
    }, [dataActions, stateActions, plotData, defaultTrace, defaultVType]);

    const UpdateAnalyticPlot = React.useCallback((key: OpenSee.IGraphProps) => {
        const pk = toPlotKey(key);
        if (!plotState.meta[pk]) return;

        const overlayKey: OpenSee.IGraphProps = { DataType: key.DataType, EventId: -1 };
        const overlayPk = toPlotKey(overlayKey);
        const updateOverlay = singlePlotRef.current && plotState.meta[overlayPk] != null;
        if (updateOverlay) {
            const remainingOverlayData = (overlayDataRef.current[overlayPk] ?? plotData[overlayPk] ?? [])
                .filter(d => d.EventID !== key.EventId);
            overlayDataRef.current[overlayPk] = remainingOverlayData;
            dataActions.FilterPlotDataByEvent(overlayKey, key.EventId);
            stateActions.SetPlotLoading(overlayKey, 'Loading');
        }

        dataActions.ClearPlotData(key);
        stateActions.SetPlotLoading(key, 'Loading');

        const accumulated: OpenSee.iD3DataSeries[] = [];

        const handles = getData(
            key,
            analytic,
            (data) => {
                const stamped = data.map(d => ({ ...d, EventID: key.EventId }));
                accumulated.push(...stamped);
                const enabledMap = getDefaultEnabled(key.DataType, defaultTrace, defaultVType, [...accumulated]);
                dataActions.AppendPlotData(key, data, key.EventId);
                stateActions.OnDataAppended(key, [...accumulated], enabledMap);

                if (updateOverlay) {
                    const nextOverlayData = [...(overlayDataRef.current[overlayPk] ?? []), ...stamped];
                    overlayDataRef.current[overlayPk] = nextOverlayData;
                    const overlayEnabledMap = getDefaultEnabled(key.DataType, defaultTrace, defaultVType, nextOverlayData);
                    dataActions.AppendPlotData(overlayKey, data, key.EventId);
                    stateActions.OnDataAppended(overlayKey, nextOverlayData, overlayEnabledMap);
                }
            },
            (detailedKey) => {
                initiateDetailed(detailedKey, analytic, dataActions);
            }
        );

        AddRequest(key, handles);

        Promise.all(handles).then(
            () => {
                stateActions.SetPlotLoading(key, 'Idle');
                if (updateOverlay)
                    stateActions.SetPlotLoading(overlayKey, 'Idle');
            },
            () => {
                stateActions.SetPlotLoading(key, 'Error');
                if (updateOverlay)
                    stateActions.SetPlotLoading(overlayKey, 'Error');
            }
        );
    }, [analytic, plotState.meta, plotData, dataActions, stateActions, defaultTrace, defaultVType]);

    const EnableOverlappingEvent = React.useCallback((eventId: number) => {
        const evtIdx = overlapping.events.findIndex(e => e.EventID === eventId);
        if (evtIdx < 0) return;

        CancelEvent(eventId);

        // Get all currently displayed data types
        const plotTypes = _.uniq(
            Object.values(plotState.meta).map(m => m.key.DataType)
        );

        const wasSelected = overlapping.events[evtIdx].Selected;

        if (wasSelected) {
            plotTypes.forEach(dt => RemovePlot({ DataType: dt, EventId: eventId }));
        } else {
            plotTypes.forEach(dt => AddPlot({ DataType: dt, EventId: eventId }));
        }

        overlappingActions.ToggleEventSelection(eventId);
    }, [overlapping.events, plotState.meta, AddPlot, RemovePlot, overlappingActions]);

    // tears down the current base-event plots (and any
    // overlapping-event plots) and recreates the same plot types for the new event.
    // Falls back to Voltage + Current when nothing was displayed.
    const ReplaceBaseEvent = React.useCallback((oldEventId: number, newEventId: number) => {
        const basePlotTypes = _.uniq(
            Object.values(plotState.meta)
                .filter(m => m.key.EventId === oldEventId)
                .map(m => m.key.DataType)
        );

        // Remove every plot and any overlapping-event plots
        Object.values(plotState.meta)
            .filter(m => m.key.EventId !== -1) // EventID of -1 indicates overlap plot
            .forEach(m => RemovePlot(m.key));

        const typesToAdd: OpenSee.graphType[] = basePlotTypes.length > 0 ? basePlotTypes : ['Voltage', 'Current'];

        // Reset overlay ref.
        if (singlePlotRef.current)
            typesToAdd.forEach(dt => { overlayDataRef.current[toPlotKey({ DataType: dt, EventId: -1 })] = []; });

        typesToAdd.forEach(dt => AddPlot({ DataType: dt, EventId: newEventId }));
    }, [plotState.meta, AddPlot, RemovePlot]);

    const RebuildSinglePlots = React.useCallback(() => {
        const sourceMeta = Object.values(plotState.meta).filter(m => m.key.EventId !== -1);
        const dataTypes = _.uniq(sourceMeta.map(m => m.key.DataType));

        Object.values(plotState.meta)
            .filter(m => m.key.EventId === -1 && !dataTypes.includes(m.key.DataType))
            .forEach(m => {
                delete overlayDataRef.current[toPlotKey(m.key)];
                dataActions.RemovePlotData(m.key);
                stateActions.RemovePlotMeta(m.key);
            });

        dataTypes.forEach(dataType => {
            const overlayKey: OpenSee.IGraphProps = { DataType: dataType, EventId: -1 };
            const overlayPk = toPlotKey(overlayKey);
            const matchingMeta = sourceMeta.filter(m => m.key.DataType === dataType);
            const overlayData: OpenSee.iD3DataSeries[] = [];

            dataActions.ClearPlotData(overlayKey);
            stateActions.InitPlotMeta(overlayKey);

            matchingMeta.forEach(m => {
                const data = plotData[toPlotKey(m.key)] ?? [];
                if (data.length === 0) return;

                overlayData.push(...data.map(d => ({ ...d, EventID: m.key.EventId })));
                dataActions.AppendPlotData(overlayKey, data, m.key.EventId);
            });

            overlayDataRef.current[overlayPk] = overlayData;

            if (overlayData.length > 0) {
                const enabledMap = getDefaultEnabled(dataType, defaultTrace, defaultVType, overlayData);
                stateActions.OnDataAppended(overlayKey, overlayData, enabledMap);
            }

            const loading = matchingMeta.some(m => m.loading === 'Error') ? 'Error' :
                matchingMeta.some(m => m.loading === 'Loading') ? 'Loading' : 'Idle';
            stateActions.SetPlotLoading(overlayKey, loading);
        });
    }, [plotState.meta, plotData, dataActions, stateActions, defaultTrace, defaultVType]);

    const RemoveSinglePlots = React.useCallback(() => {
        Object.values(plotState.meta)
            .filter(m => m.key.EventId === -1)
            .forEach(m => {
                delete overlayDataRef.current[toPlotKey(m.key)];
                dataActions.RemovePlotData(m.key);
                stateActions.RemovePlotMeta(m.key);
            });
    }, [plotState.meta, dataActions, stateActions]);

    return { AddPlot, RemovePlot, UpdateAnalyticPlot, EnableOverlappingEvent, ReplaceBaseEvent, RebuildSinglePlots, RemoveSinglePlots };
}

// Starts the high-resolution data fetch that replaces compressed series with full-resolution versions. Runs in the background after initial load.
// Does not trigger OnDataAppended since enabled flags are preserved from the original series and limits don't need recomputation.
const initiateDetailed = (
    key: OpenSee.IGraphProps,
    analytic: OpenSee.IAnalyticContext,
    dataActions: { ReplaceDetailedData: (key: OpenSee.IGraphProps, data: OpenSee.iD3DataSeries[]) => void }
): void => {
    const handles = getDetailedData(key, analytic, (detailedKey, data) => {
        if (data == null || data.length === 0) return;
        dataActions.ReplaceDetailedData(detailedKey, data);
    });

    AppendRequest(key, handles);
}
