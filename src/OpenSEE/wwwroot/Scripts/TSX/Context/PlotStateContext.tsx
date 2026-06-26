// PlotStateContext.tsx
// Holds all lightweight, frequently-changing plot state: per-plot metadata
// (enabled flags, axis limits, zoom state, loading state) and time boundaries.
//
// This context has ZERO knowledge of PlotDataContext. Any action that needs
// DataPoints for limit recomputation receives the data as a parameter from
// the caller, who has access to both contexts.

import * as React from 'react';
import _ from 'lodash';
import { OpenSee } from '../global';
import { defaultSettings } from '../defaults';
import { PlotKey, SeriesKey, LegendTraceKey, toPlotKey, seriesToKey } from './PlotKeys';
import {
    IPlotMeta,
    createEmptyMeta,
    recomputeDataLimits,
    recomputeNonAutoLimits,
    scaleLimits,
    scaleLimitsByFactor,
    updateAutoLimits,
    updateActiveUnits,
    getPrimaryAxis,
    getLocalUnitSettings,
    saveUnitSettings,
    getIndex,
    getLegendSelectionsFromEnabled,
    getEnabledFromLegendSelections
} from './PlotStateUtilities';

export type PlotDataMap = Record<PlotKey, OpenSee.iD3DataSeries[]>;

export interface IPlotStateState {
    startTime: number;
    endTime: number;
    fftLimits: [number, number];
    cycleLimits: [number, number];
    meta: Record<PlotKey, IPlotMeta>;
}

// Actions that need DataPoints for recomputation take a data param.
export interface IPlotStateActions {
    SetTimeLimit: (start: number, end: number, plotData: PlotDataMap) => void;
    SetCycleLimit: (start: number, end: number, plotData: PlotDataMap) => void;
    SetFFTLimits: (start: number, end: number, plotData: PlotDataMap) => void;
    ResetZoom: (start: number, end: number, plotData: PlotDataMap) => void;
    SetZoomedLimits: (limits: [number, number], key: OpenSee.IGraphProps, plotData: PlotDataMap) => void;
    SetUnit: (unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps, plotData: PlotDataMap) => void;
    EnableTrace: (key: OpenSee.IGraphProps, traces: SeriesKey[], enabled: boolean, data: OpenSee.iD3DataSeries[]) => void;
    SetLegendSelections: (key: OpenSee.IGraphProps, data: OpenSee.iD3DataSeries[], selectedAssets: string[], selectedTraces: LegendTraceKey[]) => void;
    SetIsManual: (key: OpenSee.IGraphProps, unit: OpenSee.Unit, manual: boolean) => void;
    SetManualLimits: (limits: [number, number], key: OpenSee.IGraphProps, axis: OpenSee.Unit, auto: boolean, data: OpenSee.iD3DataSeries[], factor?: number) => void;
    SetSelectPoint: (time: number, plotData: PlotDataMap) => void;
    ClearSelectPoints: () => void;
    RemoveSelectPoints: (index: number) => void;
    InitPlotMeta: (key: OpenSee.IGraphProps, yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, isZoomed?: boolean) => void;
    RemovePlotMeta: (key: OpenSee.IGraphProps) => void;
    SetPlotLoading: (key: OpenSee.IGraphProps, loading: OpenSee.LoadingState) => void;
    OnDataAppended: (key: OpenSee.IGraphProps, data: OpenSee.iD3DataSeries[], enabled: Record<SeriesKey, boolean>) => void;
}

// Defaults
const defaultState: IPlotStateState = {
    startTime: 0,
    endTime: 0,
    fftLimits: [0, 0],
    cycleLimits: [0, 1000.0 / 60.0],
    meta: {}
};

const defaultActions: IPlotStateActions = {
    SetTimeLimit: () => { /* noop */ },
    SetCycleLimit: () => { /* noop */ },
    SetFFTLimits: () => { /* noop */ },
    ResetZoom: () => { /* noop */ },
    SetZoomedLimits: () => { /* noop */ },
    SetUnit: () => { /* noop */ },
    EnableTrace: () => { /* noop */ },
    SetLegendSelections: () => { /* noop */ },
    SetIsManual: () => { /* noop */ },
    SetManualLimits: () => { /* noop */ },
    SetSelectPoint: () => { /* noop */ },
    ClearSelectPoints: () => { /* noop */ },
    RemoveSelectPoints: () => { /* noop */ },
    InitPlotMeta: () => { /* noop */ },
    RemovePlotMeta: () => { /* noop */ },
    SetPlotLoading: () => { /* noop */ },
    OnDataAppended: () => { /* noop */ },
};

// Contexts
export const PlotStateStateContext = React.createContext<IPlotStateState>(defaultState);
export const PlotStateActionContext = React.createContext<IPlotStateActions>(defaultActions);

// Provider

export const PlotStateProvider = (props: React.PropsWithChildren<{}>) => {
    const [state, setState] = React.useState<IPlotStateState>(defaultState);

    const actions = React.useMemo<IPlotStateActions>(() => ({
        SetTimeLimit: (start, end, plotData) => {
            if (Math.abs(start - end) < 10) return;
            setState(prev => {
                const newMeta = { ...prev.meta };
                Object.keys(newMeta).forEach(pk => {
                    const m = newMeta[pk];
                    const d = plotData[pk] ?? [];
                    const [s, e] = m.key.DataType === 'FFT'
                        ? prev.fftLimits
                        : m.key.DataType === 'OverlappingWave'
                            ? prev.cycleLimits
                            : [start, end];
                    newMeta[pk] = { ...m, yLimits: updateAutoLimits(m, d, s, e) };
                });
                return { ...prev, startTime: start, endTime: end, meta: newMeta };
            });
        },

        SetCycleLimit: (start, end, plotData) => {
            if (Math.abs(start - end) < 5) return;
            setState(prev => {
                const newMeta = { ...prev.meta };
                Object.keys(newMeta).forEach(pk => {
                    const m = newMeta[pk];
                    if (m.key.DataType !== 'OverlappingWave') return;
                    const d = plotData[pk] ?? [];
                    newMeta[pk] = { ...m, yLimits: updateAutoLimits(m, d, start, end) };
                });
                return { ...prev, cycleLimits: [start, end], meta: newMeta };
            });
        },

        SetFFTLimits: (start, end, plotData) => {
            if (Math.abs(start - end) < 1) return;
            setState(prev => {
                const newMeta = { ...prev.meta };
                Object.keys(newMeta).forEach(pk => {
                    const m = newMeta[pk];
                    if (m.key.DataType !== 'FFT') return;
                    const d = plotData[pk] ?? [];
                    newMeta[pk] = { ...m, yLimits: updateAutoLimits(m, d, start, end) };
                });
                return { ...prev, fftLimits: [start, end], meta: newMeta };
            });
        },

        ResetZoom: (start, end, plotData) => {
            setState(prev => {
                if (Math.abs(start - end) < 10) return prev;
                const newMeta = { ...prev.meta };
                let newFftLimits = prev.fftLimits;
                let newCycleLimits = prev.cycleLimits;

                Object.keys(newMeta).forEach(pk => {
                    const m = newMeta[pk];
                    const d = plotData[pk] ?? [];

                    if (m.key.DataType === 'FFT' && d.length > 0) {
                        const xMin = Math.min(...d.map(s => Math.min(...s.DataPoints.map(pt => pt[0]))));
                        const xMax = Math.max(...d.map(s => Math.max(...s.DataPoints.map(pt => pt[0]))));
                        newFftLimits = [xMin, xMax];
                    }

                    if (m.key.DataType === 'OverlappingWave' && d.length > 0) {
                        const xMin = Math.min(...d.map(s => Math.min(...s.DataPoints.map(pt => pt[0]).filter(v => !isNaN(v)))));
                        const xMax = Math.max(...d.map(s => Math.max(...s.DataPoints.map(pt => pt[0]).filter(v => !isNaN(v)))));
                        newCycleLimits = [xMin, xMax];
                    }

                    const newLimits = { ...m.yLimits };
                    const axes = _.uniq(d.map(s => s.Unit));
                    axes.forEach(axis => {
                        newLimits[axis] = { ...newLimits[axis], zoomedLimits: [0, 1] as [number, number] };
                    });
                    newMeta[pk] = { ...m, isZoomed: false, yLimits: newLimits };
                });

                Object.keys(newMeta).forEach(pk => {
                    const m = newMeta[pk];
                    const d = plotData[pk] ?? [];
                    const [s, e] = m.key.DataType === 'FFT'
                        ? newFftLimits
                        : m.key.DataType === 'OverlappingWave'
                            ? newCycleLimits
                            : [start, end];
                    newMeta[pk] = { ...m, yLimits: updateAutoLimits(m, d, s, e) };
                });

                return {
                    ...prev,
                    startTime: start,
                    endTime: end,
                    fftLimits: newFftLimits,
                    cycleLimits: newCycleLimits,
                    meta: newMeta
                };
            });
        },

        SetZoomedLimits: (limits, key, plotData) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const meta = prev.meta[pk];
                if (meta == null) return prev;

                const getActiveLimits = (meta: IPlotMeta, axis: OpenSee.Unit): [number, number] => {
                    if (meta.yLimits[axis].isManual)
                        return meta.yLimits[axis].manualLimits;
                    if (meta.isZoomed)
                        return meta.yLimits[axis].zoomedLimits;
                    return meta.yLimits[axis].dataLimits;
                };

                const primaryAxis = getPrimaryAxis(meta.key);
                const oldLimits = getActiveLimits(meta, primaryAxis);
                const newLimits = { ...meta.yLimits };
                const data = plotData[pk] ?? [];
                const enabledAxes = _.uniq(
                    data.filter(s => meta.enabled[seriesToKey(s)]).map(s => s.Unit)
                );

                enabledAxes.forEach(axis => {
                    if (axis === primaryAxis) {
                        newLimits[axis] = { ...newLimits[axis], zoomedLimits: limits };
                    } else {
                        const current = getActiveLimits(meta, axis);
                        newLimits[axis] = {
                            ...newLimits[axis],
                            zoomedLimits: recomputeNonAutoLimits(oldLimits, limits, current)
                        };
                    }
                });

                return {
                    ...prev,
                    meta: {
                        ...prev.meta,
                        [pk]: { ...meta, isZoomed: true, yLimits: newLimits }
                    }
                };
            });
        },

        SetUnit: (unit, value, auto, key, plotData) => {
            setState(prev => {
                const newMeta = { ...prev.meta };

                Object.keys(newMeta).forEach(pk => {
                    const m = newMeta[pk];
                    if (m.key.DataType !== key.DataType) return;
                    const d = plotData[pk] ?? [];

                    const oldUnitIndex = m.yLimits[unit].current;
                    const unitSetting: OpenSee.IUnitSetting = defaultSettings.Units[unit];
                    const oldFactor = unitSetting.options?.[oldUnitIndex]?.factor;
                    const newFactor = unitSetting.options?.[value]?.factor;
                    const isPU = oldFactor === undefined || newFactor === undefined;

                    const newLimits = { ...m.yLimits };
                    newLimits[unit] = { ...newLimits[unit], isAuto: auto, current: value };

                    const filteredData = d.filter(s => m.enabled[seriesToKey(s)] && s.Unit === unit);
                    const autoIdx = updateActiveUnits(newLimits, unit, filteredData, prev.startTime, prev.endTime, null);
                    let newUnitIndex = value;
                    if (autoIdx >= 0) {
                        newLimits[unit] = { ...newLimits[unit], current: autoIdx };
                        newUnitIndex = autoIdx;
                    }

                    const [s, e] = m.key.DataType === 'FFT'
                        ? prev.fftLimits
                        : m.key.DataType === 'OverlappingWave'
                            ? prev.cycleLimits
                            : [prev.startTime, prev.endTime];

                    const oldDataLimits = newLimits[unit].dataLimits;
                    const computed = recomputeDataLimits(s, e, filteredData, newLimits[unit].current);
                    newLimits[unit] = { ...newLimits[unit], dataLimits: computed };

                    if (isPU) {
                        newLimits[unit] = {
                            ...newLimits[unit],
                            zoomedLimits: scaleLimits(oldDataLimits, computed, newLimits[unit].zoomedLimits),
                            manualLimits: scaleLimits(oldDataLimits, computed, newLimits[unit].manualLimits)
                        };
                    } else {
                        newLimits[unit] = {
                            ...newLimits[unit],
                            manualLimits: scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, newLimits[unit].manualLimits),
                            zoomedLimits: scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, newLimits[unit].zoomedLimits)
                        };
                    }

                    newMeta[pk] = { ...m, yLimits: newLimits };
                });

                saveUnitSettings(newMeta, plotData);
                return { ...prev, meta: newMeta };
            });
        },

        EnableTrace: (key, traces, enabled, data) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const meta = prev.meta[pk];
                if (!meta) return prev;

                const newEnabled = { ...meta.enabled };
                traces.forEach(sk => { newEnabled[sk] = enabled; });
                const selections = getLegendSelectionsFromEnabled(data, newEnabled);

                // Figure out which axes were affected by looking up the toggled series
                const affectedAxes = _.uniq(
                    data.filter(s => traces.includes(seriesToKey(s))).map(s => s.Unit).filter(unit => unit != null)
                );
                const newLimits = { ...meta.yLimits };
                const primaryAxis = getPrimaryAxis(key);
                const [s, e] = meta.key.DataType === 'FFT'
                    ? prev.fftLimits
                    : meta.key.DataType === 'OverlappingWave'
                        ? prev.cycleLimits
                        : [prev.startTime, prev.endTime];

                affectedAxes.forEach(axis => {
                    const relevantData = data.filter(item => newEnabled[seriesToKey(item)] && item.Unit === axis);
                    const recomputed = recomputeDataLimits(s, e, relevantData, meta.yLimits[axis].current);
                    newLimits[axis] = { ...newLimits[axis], dataLimits: recomputed };
                    newLimits[axis] = {
                        ...newLimits[axis],
                        zoomedLimits: recomputeNonAutoLimits(
                            meta.yLimits[primaryAxis].dataLimits,
                            meta.yLimits[primaryAxis].zoomedLimits,
                            recomputed
                        )
                    };
                    updateActiveUnits(newLimits, axis, relevantData, prev.startTime, prev.endTime, null);
                });

                return {
                    ...prev,
                    meta: {
                        ...prev.meta,
                        [pk]: {
                            ...meta,
                            enabled: newEnabled,
                            selectedAssets: selections.selectedAssets,
                            selectedTraces: selections.selectedTraces,
                            legendSelectionsUserSet: true,
                            yLimits: newLimits
                        }
                    }
                };
            });
        },

        SetLegendSelections: (key, data, selectedAssets, selectedTraces) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const meta = prev.meta[pk];
                if (!meta) return prev;

                const newEnabled = getEnabledFromLegendSelections(data, selectedAssets, selectedTraces);
                const affectedAxes = _.uniq(
                    data.filter(s => meta.enabled[seriesToKey(s)] !== newEnabled[seriesToKey(s)])
                        .map(s => s.Unit)
                        .filter(unit => unit != null)
                );
                const newLimits = { ...meta.yLimits };
                const primaryAxis = getPrimaryAxis(key);
                const [start, end] = meta.key.DataType === 'FFT'
                    ? prev.fftLimits
                    : meta.key.DataType === 'OverlappingWave'
                        ? prev.cycleLimits
                        : [prev.startTime, prev.endTime];

                affectedAxes.forEach(axis => {
                    const relevantData = data.filter(item => newEnabled[seriesToKey(item)] && item.Unit === axis);
                    const recomputed = recomputeDataLimits(start, end, relevantData, meta.yLimits[axis].current);
                    newLimits[axis] = { ...newLimits[axis], dataLimits: recomputed };
                    newLimits[axis] = {
                        ...newLimits[axis],
                        zoomedLimits: recomputeNonAutoLimits(
                            meta.yLimits[primaryAxis].dataLimits,
                            meta.yLimits[primaryAxis].zoomedLimits,
                            recomputed
                        )
                    };
                    updateActiveUnits(newLimits, axis, relevantData, prev.startTime, prev.endTime, null);
                });

                return {
                    ...prev,
                    meta: {
                        ...prev.meta,
                        [pk]: {
                            ...meta,
                            enabled: newEnabled,
                            selectedAssets: [...selectedAssets],
                            selectedTraces: [...selectedTraces],
                            legendSelectionsUserSet: true,
                            yLimits: newLimits
                        }
                    }
                };
            });
        },

        SetIsManual: (key, unit, manual) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const meta = prev.meta[pk];
                if (!meta) return prev;

                const newLimits = { ...meta.yLimits };
                newLimits[unit] = { ...newLimits[unit], isManual: manual };

                const isValidNumber = (v: number) => !isNaN(v) && isFinite(v);
                const invalidZoomed = !newLimits[unit].zoomedLimits ||
                    !isValidNumber(newLimits[unit].zoomedLimits[0]) ||
                    !isValidNumber(newLimits[unit].zoomedLimits[1]);
                const invalidData = !newLimits[unit].dataLimits ||
                    !isValidNumber(newLimits[unit].dataLimits[0]) ||
                    !isValidNumber(newLimits[unit].dataLimits[1]);

                if (meta.isZoomed && !invalidZoomed)
                    newLimits[unit] = { ...newLimits[unit], manualLimits: newLimits[unit].zoomedLimits };
                else if (!invalidData)
                    newLimits[unit] = { ...newLimits[unit], manualLimits: newLimits[unit].dataLimits };

                return {
                    ...prev,
                    meta: {
                        ...prev.meta,
                        [pk]: { ...meta, yLimits: newLimits }
                    }
                };
            });
        },

        SetManualLimits: (limits, key, axis, auto, data, factor) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const meta = prev.meta[pk];
                if (!meta) return prev;

                const newLimits = { ...meta.yLimits };
                newLimits[axis] = { ...newLimits[axis], isManual: true, manualLimits: limits };

                if (meta.isZoomed)
                    newLimits[axis] = { ...newLimits[axis], zoomedLimits: limits };

                if (auto) {
                    const relevantData = data.filter(item => meta.enabled[seriesToKey(item)] && item.Unit === axis);
                    const idx = updateActiveUnits(newLimits, axis, relevantData, prev.startTime, prev.endTime, limits);
                    if (idx >= 0) {
                        const f = factor ?? 1;
                        newLimits[axis] = {
                            ...newLimits[axis],
                            current: idx,
                            manualLimits: [limits[0] * f, limits[1] * f]
                        };
                    }
                }

                return {
                    ...prev,
                    meta: {
                        ...prev.meta,
                        [pk]: { ...meta, yLimits: newLimits }
                    }
                };
            });
        },

        SetSelectPoint: (time, plotData) => {
            setState(prev => {
                const newMeta = { ...prev.meta };
                Object.keys(newMeta).forEach(pk => {
                    const m = newMeta[pk];
                    const d = plotData[pk] ?? [];
                    if (d.length === 0) return;

                    const shortest = _.minBy(d, s => s.DataPoints.length);
                    const idx = getIndex(time, shortest?.DataPoints ?? []);
                    if (isNaN(idx)) return;

                    newMeta[pk] = {
                        ...m,
                        selectedIndices: [...m.selectedIndices, idx],
                        selectedTimes: [...(m.selectedTimes ?? []), time]
                    };
                });
                return { ...prev, meta: newMeta };
            });
        },

        ClearSelectPoints: () => {
            setState(prev => {
                const newMeta = { ...prev.meta };
                Object.keys(newMeta).forEach(pk => {
                    newMeta[pk] = { ...newMeta[pk], selectedIndices: [], selectedTimes: [] };
                });
                return { ...prev, meta: newMeta };
            });
        },

        RemoveSelectPoints: (index) => {
            setState(prev => {
                const newMeta = { ...prev.meta };
                Object.keys(newMeta).forEach(pk => {
                    const indices = [...newMeta[pk].selectedIndices];
                    const times = [...(newMeta[pk].selectedTimes ?? [])];
                    indices.splice(index, 1);
                    times.splice(index, 1);
                    newMeta[pk] = { ...newMeta[pk], selectedIndices: indices, selectedTimes: times };
                });
                return { ...prev, meta: newMeta };
            });
        },

        InitPlotMeta: (key, yLimits, isZoomed) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const existing = prev.meta[pk];
                const meta = existing ?? createEmptyMeta(key);

                const localUnits = getLocalUnitSettings(key.DataType);
                const newLimits = { ...meta.yLimits };
                if (localUnits) {
                    Object.keys(localUnits).forEach(u => {
                        if (newLimits[u]) {
                            newLimits[u] = {
                                ...newLimits[u],
                                current: localUnits[u].current,
                                isAuto: localUnits[u].isAuto
                            };
                        }
                    });
                }

                if (yLimits) {
                    Object.keys(yLimits).forEach(u => {
                        newLimits[u] = yLimits[u];
                    });
                }

                return {
                    ...prev,
                    meta: {
                        ...prev.meta,
                        [pk]: {
                            ...meta,
                            key,
                            loading: 'Loading',
                            yLimits: newLimits,
                            isZoomed: isZoomed ?? meta.isZoomed
                        }
                    }
                };
            });
        },

        RemovePlotMeta: (key) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const newMeta = { ...prev.meta };
                delete newMeta[pk];
                return { ...prev, meta: newMeta };
            });
        },

        SetPlotLoading: (key, loading) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const meta = prev.meta[pk];
                if (!meta) return prev;
                return {
                    ...prev,
                    meta: { ...prev.meta, [pk]: { ...meta, loading } }
                };
            });
        },

        OnDataAppended: (key, data, defaultEnabled) => {
            const pk = toPlotKey(key);
            setState(prev => {
                const meta = prev.meta[pk];
                if (!meta || data.length === 0) return prev;

                const selections = meta.legendSelectionsUserSet ?
                    { selectedAssets: meta.selectedAssets, selectedTraces: meta.selectedTraces } :
                    getLegendSelectionsFromEnabled(data, defaultEnabled);
                const newEnabled = getEnabledFromLegendSelections(data, selections.selectedAssets, selections.selectedTraces);
                const isEnabled = (s: OpenSee.iD3DataSeries) => newEnabled[seriesToKey(s)] === true;

                // Correct time range FIRST if data doesn't overlap
                let newStart = prev.startTime;
                let newEnd = prev.endTime;
                let newFft = prev.fftLimits;
                let newCycleLimits = prev.cycleLimits;

                if (key.DataType === 'FFT') {
                    const enabledData = data.filter(isEnabled);
                    let fftMin = Infinity, fftMax = -Infinity;
                    for (const series of enabledData) {
                        for (const p of series.DataPoints) {
                            const x = p[0];
                            if (Number.isFinite(x)) {
                                if (x < fftMin) fftMin = x;
                                if (x > fftMax) fftMax = x;
                            }
                        }
                    }
                    if (fftMin <= fftMax) //guards against sentinel values
                        newFft = [fftMin, fftMax];
                } else if (key.DataType !== 'OverlappingWave') {
                    const enabledData = data.filter(s => isEnabled(s) && s.DataPoints.length > 0);
                    if (enabledData.length > 0) {
                        const dataMin = Math.min(...enabledData.map(s => s.DataPoints[0][0]));
                        const dataMax = Math.max(...enabledData.map(s => s.DataPoints[s.DataPoints.length - 1][0]));
                        if (prev.endTime < dataMin || prev.startTime > dataMax) {
                            newStart = dataMin;
                            newEnd = dataMax;
                        }
                    }
                } else {
                    const enabledData = data.filter(s => isEnabled(s) && s.DataPoints.length > 0);
                    let xMin = Infinity, xMax = -Infinity;
                    for (const series of enabledData) {
                        for (const p of series.DataPoints) {
                            const x = p[0];
                            if (Number.isFinite(x)) {
                                if (x < xMin) xMin = x;
                                if (x > xMax) xMax = x;
                            }
                        }
                    }
                    if (xMin <= xMax) //guards against sentinel values
                        newCycleLimits = [xMin, xMax];
                }

                // NOW compute limits with the corrected time range
                const newLimits = { ...meta.yLimits };
                const [s, e] = key.DataType === 'FFT'
                    ? newFft
                    : key.DataType === 'OverlappingWave'
                        ? newCycleLimits
                        : [newStart, newEnd];

                const axes = _.uniq(data.map(s => s.Unit));
                axes.forEach(axis => {
                    const filtered = data.filter(s => isEnabled(s) && s.Unit === axis);
                    const autoIdx = updateActiveUnits(newLimits, axis, filtered, s, e, null);
                    if (autoIdx >= 0)
                        newLimits[axis] = { ...newLimits[axis], current: autoIdx };
                });

                const updatedMeta: IPlotMeta = {
                    ...meta,
                    enabled: newEnabled,
                    selectedAssets: selections.selectedAssets,
                    selectedTraces: selections.selectedTraces,
                    yLimits: updateAutoLimits({ ...meta, enabled: newEnabled, yLimits: newLimits }, data, s, e)
                };

                return {
                    ...prev,
                    startTime: newStart,
                    endTime: newEnd,
                    fftLimits: newFft,
                    cycleLimits: newCycleLimits,
                    meta: { ...prev.meta, [pk]: updatedMeta }
                };
            });
        },
    }), []);

    return (
        <PlotStateActionContext.Provider value={actions}>
            <PlotStateStateContext.Provider value={state}>
                {props.children}
            </PlotStateStateContext.Provider>
        </PlotStateActionContext.Provider>
    );
};
