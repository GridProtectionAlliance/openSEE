// PlotUtilities.ts
// Pure utility functions for computing axis limits, defaults, display names, etc.
// These operate on data arrays and meta objects independently rather than
// the old monolithic IGraphstate.

import _ from 'lodash';
import { OpenSee } from '../global';
import { defaultSettings } from '../defaults';
import { PlotKey, SeriesKey, LegendTraceKey, seriesToKey, seriesToLegendTraceKey } from './PlotKeys';

// Lightweight per-plot metadata that lives in PlotStateContext.
// The heavy iD3DataSeries arrays live separately in PlotDataContext.
export interface IPlotMeta {
    key: OpenSee.IGraphProps;
    loading: OpenSee.LoadingState;
    enabled: Record<SeriesKey, boolean>;
    selectedAssets: string[];
    selectedTraces: LegendTraceKey[];
    legendSelectionsUserSet: boolean;
    selectedIndices: number[];
    selectedTimes: number[];
    isZoomed: boolean;
    yLimits: OpenSee.IUnitCollection<OpenSee.IAxisSettings>;
}

export const defaultAxisSettings: OpenSee.IAxisSettings = {
    isManual: false,
    dataLimits: [0, 1],
    manualLimits: [0, 1],
    zoomedLimits: [0, 1],
    isAuto: false,
    current: 0
};

function createDefaultAxisSettings(unit: keyof OpenSee.IUnitCollection<number>): OpenSee.IAxisSettings {
    const setting = defaultSettings.Units[unit];
    return { ...defaultAxisSettings, current: setting.current, isAuto: setting.autoUnit };
}

export function createDefaultYLimits(): OpenSee.IUnitCollection<OpenSee.IAxisSettings> {
    return {
        Voltage: createDefaultAxisSettings('Voltage'),
        Current: createDefaultAxisSettings('Current'),
        Angle: createDefaultAxisSettings('Angle'),
        VoltageperSecond: createDefaultAxisSettings('VoltageperSecond'),
        CurrentperSecond: createDefaultAxisSettings('CurrentperSecond'),
        FFTFrequency: createDefaultAxisSettings('FFTFrequency'),
        Freq: createDefaultAxisSettings('Freq'),
        Impedance: createDefaultAxisSettings('Impedance'),
        PowerP: createDefaultAxisSettings('PowerP'),
        PowerQ: createDefaultAxisSettings('PowerQ'),
        PowerS: createDefaultAxisSettings('PowerS'),
        PowerPf: createDefaultAxisSettings('PowerPf'),
        TCE: createDefaultAxisSettings('TCE'),
        Distance: createDefaultAxisSettings('Distance'),
        Unbalance: createDefaultAxisSettings('Unbalance'),
        THD: createDefaultAxisSettings('THD'),
        [""]: createDefaultAxisSettings('')
    };
}

export function createEmptyMeta(key: OpenSee.IGraphProps): IPlotMeta {
    return {
        key,
        loading: 'Idle',
        enabled: {},
        selectedAssets: [],
        selectedTraces: [],
        legendSelectionsUserSet: false,
        selectedIndices: [],
        selectedTimes: [],
        isZoomed: false,
        yLimits: createDefaultYLimits()
    };
}

export function getLegendSelectionsFromEnabled(
    data: OpenSee.iD3DataSeries[],
    enabled: Record<SeriesKey, boolean>
): { selectedAssets: string[], selectedTraces: LegendTraceKey[] } {
    const selectedAssets: string[] = [];
    const selectedTraces: LegendTraceKey[] = [];

    data.forEach(item => {
        if (enabled[seriesToKey(item)] !== true) return;

        const traceKey = seriesToLegendTraceKey(item);
        if (!selectedAssets.includes(item.LegendGroup)) selectedAssets.push(item.LegendGroup);
        if (!selectedTraces.includes(traceKey)) selectedTraces.push(traceKey);
    });

    return { selectedAssets, selectedTraces };
}

export function getEnabledFromLegendSelections(
    data: OpenSee.iD3DataSeries[],
    selectedAssets: string[],
    selectedTraces: LegendTraceKey[]
): Record<SeriesKey, boolean> {
    const enabled: Record<SeriesKey, boolean> = {};

    data.forEach(item => {
        enabled[seriesToKey(item)] =
            selectedAssets.includes(item.LegendGroup) &&
            selectedTraces.includes(seriesToLegendTraceKey(item));
    });

    return enabled;
}

// Binary-ish search for the index closest to time t in a sorted array.
// Assumes uniform spacing between data points.
export function getIndex(t: number, data: Array<[number, number]>): number {
    if (data == null || data.length < 2)
        return NaN;

    if (t < data[0][0])
        return 0;
    if (t > data[data.length - 1][0])
        return data.length - 1;

    const dP = data[1][0] - data[0][0];
    const deltaT = t - data[0][0];
    return Math.floor(deltaT / dP);
}

// Compute y-axis [min, max] for a set of enabled series within a given x range.
// Applies the active unit factor to scale values appropriately.
export function recomputeDataLimits(
    start: number,
    end: number,
    data: OpenSee.iD3DataSeries[],
    activeUnit: number
): [number, number] {
    if (data.length === 0)
        return [0, 1];

    let yMin = Number.POSITIVE_INFINITY;
    let yMax = Number.NEGATIVE_INFINITY;

    data.forEach(item => {
        let dataPoints = item.DataPoints;
        if (item.SmoothDataPoints.length > 0)
            dataPoints = item.SmoothDataPoints;

        const indexStart = getIndex(start, dataPoints);
        const indexEnd = getIndex(end, dataPoints);

        if (isNaN(indexStart) || isNaN(indexEnd))
            return;

        let factor = 1;
        const unit: OpenSee.IUnitSetting | undefined = defaultSettings.Units[item.Unit];
        const option = unit?.options?.[activeUnit];
        if (option != null)
            factor = option.factor === undefined ? 1.0 / item.BaseValue : option.factor;

        const startIndex = Math.max(0, Math.min(indexStart, dataPoints.length));
        const endIndex = Math.max(startIndex, Math.min(indexEnd, dataPoints.length));
        let itemMin = Number.POSITIVE_INFINITY;
        let itemMax = Number.NEGATIVE_INFINITY;

        for (let i = startIndex; i < endIndex; i++) {
            const value = dataPoints[i][1];
            if (isNaN(value) || !isFinite(value))
                continue;

            if (value < itemMin)
                itemMin = value;
            if (value > itemMax)
                itemMax = value;
        }

        if (!isFinite(itemMin) || !isFinite(itemMax))
            return;

        yMin = Math.min(yMin, itemMin * factor);
        yMax = Math.max(yMax, itemMax * factor);
    });

    if (!isFinite(yMin) || !isFinite(yMax))
        return [0, 1];

    if (yMin === yMax) {
        if (data.some(item => item.Unit === "" && (yMin === 0 || yMin === 1)))
            return [-0.05, 1.05];

        const flatPad = Math.max(Math.abs(yMin) / 20, 1);
        return [yMin - flatPad, yMax + flatPad];
    }

    const pad = (yMax - yMin) / 20;
    return [yMin - pad, yMax + pad];
}

// Recompute auto limits for all relevant axes on a single plot.
// Reads from the data array but only writes to the meta's yLimits.
export function updateAutoLimits(
    meta: IPlotMeta,
    data: OpenSee.iD3DataSeries[],
    startTime: number,
    endTime: number
): OpenSee.IUnitCollection<OpenSee.IAxisSettings> {
    if (data.length === 0)
        return meta.yLimits;

    const newLimits = { ...meta.yLimits };
    const relevantAxes = _.uniq(data.map(s => s.Unit));

    relevantAxes.forEach(axis => {
        const isAuto = !meta.isZoomed && !meta.yLimits[axis].isManual;
        if (!isAuto) return;

        const enabled = data.filter((item) =>
            item.Unit === axis && meta.enabled[seriesToKey(item)] !== false
        );
        const computed = recomputeDataLimits(startTime, endTime, enabled, meta.yLimits[axis].current);
        if (computed)
            newLimits[axis] = { ...newLimits[axis], dataLimits: computed };
    });

    return newLimits;
}

// Proportionally rescale one axis's limits based on how another axis was zoomed
export function recomputeNonAutoLimits(
    oldLimits: [number, number],
    newLimits: [number, number],
    currentLimits: [number, number]
): [number, number] {
    const oldRange = oldLimits[1] - oldLimits[0];
    const lowerProportion = (newLimits[0] - oldLimits[0]) / oldRange;
    const upperProportion = (newLimits[1] - oldLimits[0]) / oldRange;

    const currentRange = currentLimits[1] - currentLimits[0];
    return [
        currentLimits[0] + lowerProportion * currentRange,
        currentLimits[0] + upperProportion * currentRange
    ];
}

// Scale limits when switching between unit options that have fixed factors
export function scaleLimitsByFactor(
    oldIndex: number,
    newIndex: number,
    unit: OpenSee.Unit,
    limits: [number, number]
): [number, number] {
    const oldFactor = defaultSettings.Units[unit].options[oldIndex].factor;
    const newFactor = defaultSettings.Units[unit].options[newIndex].factor;
    const change = newFactor / oldFactor;
    return [limits[0] * change, limits[1] * change];
}

// Scale limits proportionally when the data range itself changes (e.g. per-unit toggle)
export function scaleLimits(
    oldDataLimits: [number, number],
    newDataLimits: [number, number],
    zoomedLimits: [number, number]
): [number, number] {
    const oldRange = oldDataLimits[1] - oldDataLimits[0];
    const newRange = newDataLimits[1] - newDataLimits[0];
    const scale = newRange / oldRange;
    return [zoomedLimits[0] * scale, zoomedLimits[1] * scale];
}

// Determines which auto unit factor to use based on the magnitude of the data
export function updateActiveUnits(
    units: OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
    unit: OpenSee.Unit,
    data: OpenSee.iD3DataSeries[],
    startTime: number,
    endTime: number,
    manualLimits: [number, number] | null
): number {
    if (!units[unit].isAuto)
        return -1;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    data.filter(d => d.Unit === unit).forEach(d => {
        const startIndex = getIndex(startTime, d.DataPoints);
        const endIndex = getIndex(endTime, d.DataPoints);

        if (isNaN(startIndex) || isNaN(endIndex))
            return;

        const firstIndex = Math.max(0, Math.min(startIndex, d.DataPoints.length));
        const lastIndex = Math.max(firstIndex, Math.min(endIndex, d.DataPoints.length));

        for (let i = firstIndex; i < lastIndex; i++) {
            const value = d.DataPoints[i][1];
            if (isNaN(value) || !isFinite(value))
                continue;

            if (value < min)
                min = value;
            if (value > max)
                max = value;
        }
    });

    if (manualLimits) {
        min = manualLimits[0];
        max = manualLimits[1];
    }

    if (!isFinite(min) || !isFinite(max))
        return -1;

    const magnitude = Math.max(Math.abs(min), Math.abs(max));

    let autoFactor = 0.000001;
    if (magnitude < 1)
        autoFactor = 1000;
    else if (magnitude < 1000)
        autoFactor = 1;
    else if (magnitude < 1000000)
        autoFactor = 0.001;

    const options = defaultSettings.Units[unit].options;
    let idx = options.findIndex(item => item.factor === autoFactor);
    if (idx >= 0) return idx;

    // fallback: try adjacent factor
    autoFactor = autoFactor < 1 ? autoFactor * 1000 : 1;
    idx = options.findIndex(item => item.factor === autoFactor);
    if (idx >= 0) return idx;

    return options.findIndex(item => item.factor !== 0);
}

// Map from graphType to its primary y-axis unit
export function getPrimaryAxis(key: OpenSee.IGraphProps): OpenSee.Unit {
    switch (key.DataType) {
        case 'Voltage': return 'Voltage';
        case 'Current': return 'Current';
        case 'Analogs':
        case 'Digitals':
            return '';
        case 'FirstDerivative': return 'VoltageperSecond';
        case 'Unbalance': return 'Unbalance';
        case 'THD': return 'THD';
        case 'RemoveCurrent': return 'Current';
        case 'Power': return 'PowerP';
        case 'Impedance': return 'Impedance';
        case 'Frequency': return 'Freq';
        case 'FaultDistance': return 'Distance';
        case 'I2T': return 'Current';
        default: return 'Voltage';
    }
}

// Build a display name for tooltip entries
export function getDisplayName(d: OpenSee.iD3DataSeries, type: OpenSee.graphType, harmonic?: number): string {
    const harmonicLabel = harmonic == null ? '' : ` ${harmonic}`;

    switch (type) {
        case 'Voltage':
        case 'Current':
            return d.LegendGroup + (type === 'Voltage' ? ' V ' : ' I ') + d.LegendVertical + ' ' + d.LegendHorizontal;
        case 'FirstDerivative':
            return `${d.LegendGroup} Derivative`;
        case 'ClippedWaveforms':
            return `${d.LegendGroup} Fixed Clipped Waveform`;
        case 'Frequency':
            return `${d.LegendGroup} Frequency${d.LegendVertical === 'Avg' ? ' Avg' : ''}`;
        case 'HighPassFilter':
            return `${d.LegendGroup} HPF`;
        case 'LowPassFilter':
            return `${d.LegendGroup} LPF`;
        case 'FaultDistance':
            return d.LegendVertical;
        case 'FFT':
            return `FFT ${d.LegendGroup} ${d.LegendHorizontal}`;
        case 'Impedance':
        case 'Power':
        case 'SymetricComp':
            return `${d.LegendHorizontal} ${d.LegendVertical}`;
        case 'MissingVoltage':
            return `${d.LegendGroup} Missing Voltage (${d.LegendHorizontal}-Fault)`;
        case 'OverlappingWave':
            return `${d.LegendGroup} Overlapping Waveform`;
        case 'RapidVoltage':
            return `${d.LegendGroup} Rapid Voltage Change`;
        case 'Rectifier':
            return `Rectifier ${d.LegendHorizontal === 'I' ? 'Current' : 'Voltage'}`;
        case 'RemoveCurrent':
            return `${d.LegendGroup} Removed Current (${d.LegendHorizontal}-Fault)`;
        case 'Harmonic':
            return `${d.LegendGroup} Harmonic${harmonicLabel} ${d.LegendHorizontal}`;
        case 'THD':
            return `${d.LegendGroup} THD`;
        case 'Unbalance':
            return `${d.LegendHorizontal}${d.LegendVertical} Unbalance`;
        case 'I2T':
            return `${d.LegendGroup} I2T`;
        default:
            return type;
    }
}

// Compute default enabled flags for each series based on graph type and user prefs
export function getDefaultEnabled(
    type: OpenSee.graphType,
    defaultTraces: OpenSee.IDefaultTrace,
    defaultVoltage: 'L-L' | 'L-N',
    data: OpenSee.iD3DataSeries[]
): Record<SeriesKey, boolean> {
    // Helper: applies a predicate per series and builds a keyed record
    function buildMap(predicate: (item: OpenSee.iD3DataSeries) => boolean): Record<SeriesKey, boolean> {
        const result: Record<SeriesKey, boolean> = {};
        data.forEach(item => { result[seriesToKey(item)] = predicate(item); });
        return result;
    }

    switch (type) {
        case 'Voltage':
            return buildMap(item =>
                item.LegendVGroup === defaultVoltage &&
                ((item.LegendHorizontal === 'Ph' && defaultTraces.Ph) ||
                 (item.LegendHorizontal === 'RMS' && defaultTraces.RMS) ||
                 (item.LegendHorizontal === 'Pk' && defaultTraces.Pk) ||
                 (item.LegendHorizontal === 'W' && defaultTraces.W))
            );
        case 'Current':
            return buildMap(item =>
                (item.LegendHorizontal === 'Ph' && defaultTraces.Ph) ||
                (item.LegendHorizontal === 'RMS' && defaultTraces.RMS) ||
                (item.LegendHorizontal === 'Pk' && defaultTraces.Pk) ||
                (item.LegendHorizontal === 'W' && defaultTraces.W)
            );
        case 'FaultDistance':
            return buildMap(item =>
                item.LegendVertical === 'Simple' ||
                item.LegendVertical === 'Reactance' ||
                item.LegendVertical === 'Takagi' ||
                item.LegendVertical === 'ModifiedTakagi' ||
                item.LegendVertical === 'Novosel'
            );
        case 'FirstDerivative':
            return buildMap(item =>
                ((item.LegendHorizontal === 'W' && defaultTraces.W) ||
                 (item.LegendHorizontal === 'RMS' && defaultTraces.RMS)) &&
                item.LegendVertical !== 'NG' && item.LegendVertical !== 'RES'
            );
        case 'ClippedWaveforms':
        case 'Frequency':
        case 'HighPassFilter':
        case 'LowPassFilter':
        case 'MissingVoltage':
        case 'OverlappingWave':
        case 'RapidVoltage':
        case 'THD':
        case 'I2T':
            return buildMap(item =>
                item.LegendVertical === 'AN' || item.LegendVertical === 'BN' || item.LegendVertical === 'CN'
            );
        case 'Power':
            return buildMap(item =>
                (item.LegendVertical === 'AN' || item.LegendVertical === 'BN' || item.LegendVertical === 'CN') &&
                item.LegendHorizontal === 'P'
            );
        case 'Impedance':
            return buildMap(item =>
                (item.LegendVertical === 'AN' || item.LegendVertical === 'BN' || item.LegendVertical === 'CN') &&
                item.LegendHorizontal === 'R'
            );
        case 'Rectifier':
            return buildMap(item => item.LegendHorizontal === 'V');
        case 'SymetricComp':
            return buildMap(item => item.LegendVertical === 'Pos');
        case 'Unbalance':
            return buildMap(item => item.LegendVertical === 'Neg/Pos');
        case 'FFT':
            return buildMap(item => item.LegendHorizontal === 'Mag' && item.LegendVGroup === 'Volt.');
        case 'Harmonic':
            return buildMap(item => item.LegendHorizontal === 'Mag');
        case 'RemoveCurrent':
            return buildMap(item => item.LegendHorizontal === 'Pre');
        default:
            return buildMap(() => false);
    }
}

// Read unit overrides from localStorage for a given plot type
export function getLocalUnitSettings(dataType: OpenSee.graphType): Record<string, { current: number; isAuto: boolean }> | null {
    try {
        const raw = localStorage.getItem('openSee.Settings');
        const settings = JSON.parse(raw ?? '{}');
        const unitSettings = settings.Units;
        if (!Array.isArray(unitSettings)) return null;

        const match = unitSettings.find((s: any) => s.DataType === dataType);
        return match?.Units ?? null;
    } catch {
        return null;
    }
}

// Persist current unit selections to localStorage
export function saveUnitSettings(
    meta: Record<PlotKey, IPlotMeta>,
    data: Record<PlotKey, OpenSee.iD3DataSeries[]>
): void {
    try {
        const raw = localStorage.getItem('openSee.Settings');
        const settings = JSON.parse(raw ?? '{}');
        if (!Array.isArray(settings.Units))
            settings.Units = [];

        Object.keys(meta).forEach(plotKey => {
            const m = meta[plotKey];
            const d = data[plotKey];
            if (!m || !d) return;

            const enabledUnits = _.uniq(
                d.filter((series) => m.enabled[seriesToKey(series)]).map(s => s.Unit)
            );

            let entry = settings.Units.find((u: any) => u.DataType === m.key.DataType);
            if (!entry) {
                entry = { DataType: m.key.DataType, Units: {} };
                settings.Units.push(entry);
            }
            if (!entry.Units) entry.Units = {};

            Object.keys(m.yLimits).forEach(unit => {
                if (enabledUnits.includes(unit as OpenSee.Unit)) {
                    entry.Units[unit] = {
                        current: m.yLimits[unit].current,
                        isAuto: m.yLimits[unit].isAuto
                    };
                }
            });
        });

        localStorage.setItem('openSee.Settings', JSON.stringify(settings));
    } catch {
        // ignore write errors
    }
}
