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
import { toPlotKey, seriesToKey } from '../Context/PlotKeys';
import { PlotDataStateContext, PlotDataActionContext } from '../Context/PlotDataContext';
import { PlotStateStateContext, PlotStateActionContext } from '../Context/PlotStateContext';
import { OverlappingActionContext, OverlappingStateContext } from '../Context/OverlappingContext';
import { getDefaultEnabled } from '../Context/PlotStateUtilities';
import AnalyticContext from '../Context/AnalyticContext';
import { getData, getDetailedData } from '../Data/GraphLogic';
import { AddRequest, CancelEvent, AppendRequest } from '../Data/RequestHandler';
import { useAppSelector } from '../hooks';
import { SelectSinglePlot, SelectDefaultTraces, SelectVTypeDefault } from '../store/settingSlice';

export interface IPlotLifecycleActions {
    AddPlot: (
        key: OpenSee.IGraphProps,
        yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
        isZoomed?: boolean,
        fftLimits?: [number, number],
        cycleLimits?: [number, number]
    ) => void;
    RemovePlot: (key: OpenSee.IGraphProps) => void;
    UpdateAnalyticPlot: (key: OpenSee.IGraphProps) => void;
    EnableOverlappingEvent: (eventId: number) => void;
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

    const AddPlot = React.useCallback((
        key: OpenSee.IGraphProps,
        yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
        isZoomed?: boolean,
        fftLimits?: [number, number],
        cycleLimits?: [number, number]
    ) => {
        // Initialize empty entries in both contexts
        dataActions.InitPlotData(key);
        stateActions.InitPlotMeta(key, yLimits, isZoomed);

        if (singlePlot) {
            const overlayKey: OpenSee.IGraphProps = { DataType: key.DataType, EventId: -1 };
            dataActions.InitPlotData(overlayKey);
            stateActions.InitPlotMeta(overlayKey);
        }

        // Track accumulated data locally so OnDataAppended always gets the full picture
        const accumulated: OpenSee.iD3DataSeries[] = [];
        const overlayAccumulated: OpenSee.iD3DataSeries[] = [];

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

                if (singlePlot) {
                    const overlayKey: OpenSee.IGraphProps = { DataType: key.DataType, EventId: -1 };
                    overlayAccumulated.push(...stamped);
                    const overlayEnabledMap = getDefaultEnabled(key.DataType, defaultTrace, defaultVType, [...overlayAccumulated]);
                    dataActions.AppendPlotData(overlayKey, data, key.EventId);
                    stateActions.OnDataAppended(overlayKey, [...overlayAccumulated], overlayEnabledMap);
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
                if (singlePlot)
                    stateActions.SetPlotLoading({ DataType: key.DataType, EventId: -1 }, 'Idle');

                if (fftLimits != null)
                    stateActions.SetFFTLimits(fftLimits[0], fftLimits[1], plotData);
                if (cycleLimits != null)
                    stateActions.SetCycleLimit(cycleLimits[0], cycleLimits[1], plotData);
            },
            () => {
                stateActions.SetPlotLoading(key, 'Error');
                if (singlePlot)
                    stateActions.SetPlotLoading({ DataType: key.DataType, EventId: -1 }, 'Error');
            }
        );
    }, [analytic, singlePlot, plotData, dataActions, stateActions, defaultTrace, defaultVType]);

    const RemovePlot = React.useCallback((key: OpenSee.IGraphProps) => {
        CancelEvent(key.EventId);
        dataActions.RemovePlotData(key);
        stateActions.RemovePlotMeta(key);

        // Clean up the overlay plot if in singlePlot mode
        if (singlePlot) {
            const overlayKey: OpenSee.IGraphProps = { DataType: key.DataType, EventId: -1 };
            const overlayPk = toPlotKey(overlayKey);
            dataActions.FilterPlotDataByEvent(overlayKey, key.EventId);

            // If no data remains in the overlay, remove it entirely
            const remaining = (plotData[overlayPk] ?? []).filter(d => d.EventID !== key.EventId);
            if (remaining.length === 0) {
                dataActions.RemovePlotData(overlayKey);
                stateActions.RemovePlotMeta(overlayKey);
            } else {
                const remainingEnabled = getDefaultEnabled(key.DataType, defaultTrace, defaultVType, remaining);
                stateActions.OnDataAppended(overlayKey, remaining, remainingEnabled);
            }
        }
    }, [singlePlot, dataActions, stateActions, plotData, defaultTrace, defaultVType]);

    const UpdateAnalyticPlot = React.useCallback((key: OpenSee.IGraphProps) => {
        const pk = toPlotKey(key);
        if (!plotState.meta[pk]) return;

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
            },
            (detailedKey) => {
                initiateDetailed(detailedKey, analytic, dataActions);
            }
        );

        AddRequest(key, handles);

        Promise.all(handles).then(
            () => stateActions.SetPlotLoading(key, 'Idle'),
            () => stateActions.SetPlotLoading(key, 'Error')
        );
    }, [analytic, plotState.meta, dataActions, stateActions, defaultTrace, defaultVType]);

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

    return { AddPlot, RemovePlot, UpdateAnalyticPlot, EnableOverlappingEvent };
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