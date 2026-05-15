// PlotSelectors.ts
// Pure functions that derive display-ready data from the plot state and data maps.
// No React, no hooks, no context -- just inputs and outputs.
// Consumers call these in useMemo or inline with data from their context subscriptions.

import _ from 'lodash';
import { OpenSee } from './global';
import { defaultSettings } from './defaults';
import { PlotKey, toPlotKey, seriesToKey } from './Context/PlotKeys';
import { IPlotMeta, getIndex, getDisplayName, getPrimaryAxis } from './Context/PlotStateUtilities';
import { PlotDataMap } from './Context/PlotStateContext';

const defaultOption: OpenSee.iUnitOptions = { label: '', factor: 1, short: '' };

// Resolve the active y-limits for a plot based on zoom/manual/data state
export function selectYLimits(meta: IPlotMeta): OpenSee.IUnitCollection<[number, number]> {
    const result = {} as OpenSee.IUnitCollection<[number, number]>;
    Object.keys(meta.yLimits).forEach(unit => {
        const s = meta.yLimits[unit];
        if (meta.isZoomed)
            result[unit] = s.zoomedLimits;
        else if (s.isManual && s.manualLimits)
            result[unit] = s.manualLimits;
        else
            result[unit] = s.dataLimits;
    });
    return result;
}

// Build axis label strings like "Voltage [kV]"
export function selectYLabels(meta: IPlotMeta): OpenSee.IUnitCollection<string> {
    const labels = {} as OpenSee.IUnitCollection<string>;
    Object.keys(meta.yLimits).forEach(unit => {
        const short = defaultSettings.Units[unit]?.options?.[meta.yLimits[unit].current]?.short ?? 'N/A';
        labels[unit] = `${unit} [${short}]`;
    });
    return labels;
}

// Get the active unit option object for each axis on a plot
export function selectActiveUnit(meta: IPlotMeta): Record<string, OpenSee.iUnitOptions> {
    const result: Record<string, OpenSee.iUnitOptions> = {};
    const baseUnits = defaultSettings.Units;
    Object.keys(baseUnits).forEach(unit => {
        if (meta.yLimits[unit])
            result[unit] = baseUnits[unit].options[meta.yLimits[unit].current];
    });
    return result;
}

// Get unique units present in a plot's data, with the primary axis first
export function selectRelevantUnits(
    key: OpenSee.IGraphProps,
    data: OpenSee.iD3DataSeries[]
): OpenSee.Unit[] {
    let units: OpenSee.Unit[] = data.map(d => d.Unit);
    const primary = getPrimaryAxis(key);
    if (units.includes(primary)) {
        units = units.filter(u => u !== primary);
        units.unshift(primary);
    }
    return _.uniq(units);
}

// Same as above but only for enabled traces
export function selectEnabledUnits(
    key: OpenSee.IGraphProps,
    data: OpenSee.iD3DataSeries[],
    enabled: Record<string, boolean>
): OpenSee.Unit[] {
    let units: OpenSee.Unit[] = [];
    data.forEach(d => {
        if (d.Unit && enabled[seriesToKey(d)]) units.push(d.Unit);
    });
    const primary = getPrimaryAxis(key);
    if (units.includes(primary)) {
        units = units.filter(u => u !== primary);
        units.unshift(primary);
    }
    return _.uniq(units);
}

// Which base plot types (Voltage, Current, etc.) are currently displayed
export function selectDisplayed(meta: Record<PlotKey, IPlotMeta>): OpenSee.IDisplayed {
    const types = Object.values(meta).map(m => m.key.DataType);
    return {
        Voltage: types.includes('Voltage'),
        Current: types.includes('Current'),
        TripCoil: types.includes('TripCoil'),
        Analogs: types.includes('Analogs'),
        Digitals: types.includes('Digitals')
    };
}

// Sorted, unique plot keys for rendering
export function selectPlotKeys(
    meta: Record<PlotKey, IPlotMeta>,
    singlePlot: boolean,
    sortFn: (a: OpenSee.IGraphProps, b: OpenSee.IGraphProps) => number
): OpenSee.IGraphProps[] {
    let keys = Object.values(meta).map(m => m.key);
    if (singlePlot)
        keys = keys.filter(k => k.EventId === -1);
    keys = _.uniqWith(keys, _.isEqual);
    keys.sort(sortFn);
    return keys;
}

// Group plot keys by EventId for rendering sections
export function selectListGraphs(
    meta: Record<PlotKey, IPlotMeta>,
    singlePlot: boolean
): _.Dictionary<OpenSee.IGraphProps[]> {
    const keys = Object.values(meta).map(m => m.key);
    if (singlePlot)
        return _.groupBy(keys.filter(k => k.EventId === -1), 'EventId');
    return _.groupBy(keys.filter(k => k.EventId !== -1), 'EventId');
}

// Which plot types are analytics (not base waveforms)
export function selectAnalytics(
    meta: Record<PlotKey, IPlotMeta>,
    eventId: number
): OpenSee.graphType[] {
    const analyticTypes: OpenSee.graphType[] = [
        'FirstDerivative', 'ClippedWaveforms', 'Frequency', 'HighPassFilter',
        'LowPassFilter', 'MissingVoltage', 'OverlappingWave', 'Power',
        'Impedance', 'Rectifier', 'RapidVoltage', 'RemoveCurrent', 'Harmonic',
        'SymetricComp', 'THD', 'Unbalance', 'FaultDistance', 'Restrike', 'I2T'
    ];
    return _.uniq(
        Object.values(meta)
            .filter(m => m.key.EventId === eventId && analyticTypes.includes(m.key.DataType))
            .map(m => m.key.DataType)
    );
}

// Get all event IDs that are currently active (main + selected overlapping)
export function selectEventIDs(
    eventId: number,
    overlappingEvents: OpenSee.OverlappingEvents[]
): number[] {
    const ids = [eventId];
    overlappingEvents.forEach(e => {
        if (e.Selected) ids.push(e.EventID);
    });
    return _.uniq(ids);
}

// Tooltip: get values at hover point for all enabled traces on the main event
export function selectHoverPoints(
    hover: [number, number],
    eventId: number,
    plotData: PlotDataMap,
    meta: Record<PlotKey, IPlotMeta>
): OpenSee.IPoint[] {
    const result: OpenSee.IPoint[] = [];

    Object.keys(meta).forEach(pk => {
        const m = meta[pk];
        if (m.key.EventId !== eventId) return;
        const d = plotData[pk] ?? [];
        if (d.length === 0) return;

        const firstIndex = getIndex(hover[0], d[0].DataPoints);
        if (isNaN(firstIndex)) return;

        d.forEach((series) => {
            if (!m.enabled[seriesToKey(series)]) return;
            const idx = getIndex(hover[0], series.DataPoints);
            const unitOpt = defaultSettings.Units[series.Unit]?.options?.[m.yLimits[series.Unit]?.current] ?? defaultOption;
            result.push({
                Color: series.Color,
                Unit: unitOpt,
                Value: idx > series.DataPoints.length - 1 ? NaN : series.DataPoints[idx][1],
                Name: getDisplayName(series, m.key.DataType),
                BaseValue: series.BaseValue,
                Time: 0
            });
        });
    });

    return result;
}

// Tooltip with delta: same as hover points but includes previous selected point value
export function selectDeltaHoverPoints(
    hover: [number, number],
    eventId: number,
    plotData: PlotDataMap,
    meta: Record<PlotKey, IPlotMeta>,
    dataKey?: OpenSee.IGraphProps
): OpenSee.IPoint[] {
    const result: OpenSee.IPoint[] = [];

    Object.keys(meta).forEach(pk => {
        const m = meta[pk];
        if (m.key.EventId !== eventId) return;
        if (dataKey != null && (m.key.DataType !== dataKey.DataType || m.key.EventId !== dataKey.EventId)) return;

        const d = plotData[pk] ?? [];
        if (d.length === 0) return;

        const firstIndex = getIndex(hover[0], d[0].DataPoints);
        if (isNaN(firstIndex)) return;

        const selIdx = m.selectedIndices;

        d.forEach((series) => {
            if (!m.enabled[seriesToKey(series)]) return;
            const idx = getIndex(hover[0], series.DataPoints);
            const unitOpt = defaultSettings.Units[series.Unit]?.options?.[m.yLimits[series.Unit]?.current] ?? defaultOption;
            const lastSel = selIdx.length > 0 ? selIdx[selIdx.length - 1] : -1;
            const selectedTime = m.selectedTimes?.length > 0 ? m.selectedTimes[m.selectedTimes.length - 1] : null;
            result.push({
                Color: series.Color,
                Unit: unitOpt,
                Value: idx > series.DataPoints.length - 1 ? NaN : series.DataPoints[idx][1],
                Name: getDisplayName(series, m.key.DataType),
                PrevValue: lastSel >= 0 && lastSel < series.DataPoints.length ? series.DataPoints[lastSel][1] : NaN,
                BaseValue: series.BaseValue,
                Time: selectedTime ?? (lastSel >= 0 && lastSel < series.DataPoints.length ? series.DataPoints[lastSel][0] : NaN)
            });
        });
    });

    return result;
}

// Phasor chart: extract voltage or current phase vectors at hover point
export function selectPhaseVectors(
    hover: [number, number],
    eventId: number,
    dataType: 'Voltage' | 'Current',
    plotData: PlotDataMap,
    meta: Record<PlotKey, IPlotMeta>
): OpenSee.IVector[] {
    const pk = toPlotKey({ DataType: dataType, EventId: eventId });
    const m = meta[pk];
    const d = plotData[pk] ?? [];

    if (!m || d.length === 0 || !d.some(s => s.LegendHorizontal === 'Ph'))
        return [];

    const activeUnits = m.yLimits;
    const assets = _.uniq(d.filter(s => m.enabled[seriesToKey(s)]).map(s => s.LegendGroup));
    const phases = _.uniq(d.filter(s => m.enabled[seriesToKey(s)]).map(s => s.LegendVertical));

    const phaseData = d.find(s => s.LegendHorizontal === 'Ph');
    const pointIndex = phaseData ? getIndex(hover[0], phaseData.DataPoints) : -1;
    if (isNaN(pointIndex) || pointIndex < 0) return [];

    const unitKey = dataType as OpenSee.Unit;
    const unit = defaultSettings.Units[unitKey]?.options?.[activeUnits[unitKey]?.current] ?? defaultOption;
    const phaseUnit = defaultSettings.Units.Angle?.options?.[activeUnits['Angle']?.current] ?? defaultOption;

    const result: OpenSee.IVector[] = [];

    assets.forEach(a => {
        phases.forEach(p => {
            const phCh = d.find(s => s.LegendGroup === a && s.LegendVertical === p && s.LegendHorizontal === 'Ph');
            const magCh = d.find(s => s.LegendGroup === a && s.LegendVertical === p && s.LegendHorizontal === 'Pk');
            if (!phCh || !magCh) return;

            result.push({
                Color: phCh.Color,
                Unit: unit,
                PhaseUnit: phaseUnit,
                Phase: p,
                Asset: a,
                Magnitude: pointIndex < magCh.DataPoints.length ? magCh.DataPoints[pointIndex][1] : NaN,
                Angle: pointIndex < phCh.DataPoints.length ? phCh.DataPoints[pointIndex][1] : NaN,
                BaseValue: magCh.BaseValue
            });
        });
    });

    return result;
}

// Accumulated points widget: get selected point values for V/I traces
export function selectSelectedPoints(
    eventId: number,
    plotData: PlotDataMap,
    meta: Record<PlotKey, IPlotMeta>
): OpenSee.IPointCollection[] {
    const result: OpenSee.IPointCollection[] = [];

    Object.keys(meta).forEach(pk => {
        const m = meta[pk];
        if (m.key.EventId !== eventId) return;
        if (m.key.DataType !== 'Voltage' && m.key.DataType !== 'Current') return;
        const d = plotData[pk] ?? [];
        if (d.length === 0) return;

        d.forEach((series) => {
            if (!m.enabled[seriesToKey(series)]) return;
            const unitType = series.Unit;
            const unitOpt = defaultSettings.Units[unitType]?.options?.[m.yLimits[unitType]?.current] ?? defaultOption;

            result.push({
                Group: series.LegendGroup,
                Name: (m.key.DataType === 'Voltage' ? 'V ' : 'I ') + series.LegendVertical + ' ' + series.LegendHorizontal,
                Unit: unitOpt,
                Value: m.selectedIndices.map(j => series.DataPoints[j]),
                BaseValue: series.BaseValue,
                Color: series.Color
            });
        });
    });

    return result;
}

// FFT table: extract magnitude/angle/frequency series grouped by asset+phase
export function selectFFTData(
    eventId: number,
    plotData: PlotDataMap,
    meta: Record<PlotKey, IPlotMeta>
): OpenSee.IFFTSeries[] {
    const pk = toPlotKey({ DataType: 'FFT', EventId: eventId });
    const m = meta[pk];
    const d = plotData[pk] ?? [];

    if (!m || d.length === 0) return [];

    const assets = _.uniq(d.map(s => s.LegendGroup));
    const phases = _.uniq(d.map(s => s.LegendVertical));
    const result: OpenSee.IFFTSeries[] = [];

    assets.forEach(a => {
        phases.forEach(p => {
            const subset = d.filter(s => s.LegendGroup === a && s.LegendVertical === p);
            if (subset.length === 0) return;

            const angCh = subset.find(s => s.LegendHorizontal === 'Ang');
            const magCh = subset.find(s => s.LegendHorizontal === 'Mag');
            if (!angCh || !magCh) return;

            const magUnit = defaultSettings.Units[magCh.Unit]?.options?.[m.yLimits[magCh.Unit]?.current] ?? defaultOption;
            const angUnit = defaultSettings.Units.Angle?.options?.[m.yLimits['Angle']?.current] ?? defaultOption;

            result.push({
                Color: angCh.Color,
                Unit: magUnit,
                PhaseUnit: angUnit,
                Phase: p,
                Asset: a,
                Magnitude: magCh.DataPoints.map(pt => pt[1]),
                Angle: angCh.DataPoints.map(pt => pt[1]),
                BaseValue: magCh.BaseValue,
                Frequency: magCh.DataPoints.map(pt => pt[0] * 60.0)
            });
        });
    });

    return result;
}

// Whether any FFT plot is currently active
export function selectFFTEnabled(meta: Record<PlotKey, IPlotMeta>): boolean {
    return Object.values(meta).some(m => m.key.DataType === 'FFT');
}

// Get overlapping event plot keys (plots not belonging to the main event)
export function selectOverlappingPlotKeys(
    meta: Record<PlotKey, IPlotMeta>,
    eventId: number,
    graphType: OpenSee.graphType
): OpenSee.IGraphProps[] {
    return _.orderBy(
        Object.values(meta)
            .filter(m => m.key.EventId !== eventId && m.key.EventId !== -1 && m.key.DataType === graphType)
            .map(m => m.key),
        'EventId',
        'desc'
    );
}

// Build plot query objects for query string serialization
export function selectEnabledPlots(
    meta: Record<PlotKey, IPlotMeta>,
    plotData: PlotDataMap
): OpenSee.PlotQuery[] {
    const result: OpenSee.PlotQuery[] = [];

    Object.keys(meta).forEach(pk => {
        const m = meta[pk];
        const d = plotData[pk] ?? [];

        const enabledUnits = _.uniq(
            d.filter(s => m.enabled[seriesToKey(s)]).map(s => s.Unit)
        );

        const yLimits = {} as OpenSee.IUnitCollection<OpenSee.IAxisSettings>;
        Object.keys(m.yLimits).forEach(unit => {
            if (enabledUnits.includes(unit as OpenSee.Unit))
                yLimits[unit] = { ...m.yLimits[unit], autoUnit: m.yLimits[unit].isAuto };
        });

        result.push({
            key: m.key,
            yLimits,
            isZoomed: m.isZoomed
        });
    });

    return result;
}
