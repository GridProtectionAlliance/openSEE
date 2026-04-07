//******************************************************************************************************
//  DataContext.tsx - Gbtc
//
//  Copyright � 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  02/06/2026 - G. Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import _ from 'lodash';
import * as React from 'react';
import { defaultSettings } from '../defaults';
import { OpenSee } from '../global';
import func from './DataContextFunctions';
import { emptygraph, getData, getOverlappingEvents } from '../Data/GraphLogic';
import { AddRequest, CancelEvent } from '../Data/RequestHandler';
import AnalyticContext from './AnalyticContext';
import { useAppSelector } from '../hooks';
import { SelectDefaultTraces, SelectSinglePlot, SelectVTypeDefault } from '../store/settingSlice';
import { sortGraph } from '../Graphs/Utilities';
import EventContext from './EventContext';

interface IDataFunctions {
    SetTimeLimit: (start: number, end: number) => void,
    SetCycleLimit: (start: number, end: number) => void,
    SetFFTLimits: (start: number, end: number) => void,
    ResetZoom: (start: number, end: number) => void,
    SetZoomedLimits: (limits: [number, number], key: OpenSee.IGraphProps) => void,
    SetUnit: (unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps) => void,
    EnableTrace: (key: OpenSee.IGraphProps, trace: number[], enabled: boolean) => void,
    SetIsManual: (key: OpenSee.IGraphProps, unit: OpenSee.Unit, manual: boolean) => void,
    SetSelectPoint: (time: number) => void,
    ClearSelectPoints: () => void,
    RemoveSelectPoints: (index: number) => void,
    SetManualLimits: (limits: [number, number], key: OpenSee.IGraphProps, axis: OpenSee.Unit, auto: boolean, factor?: number) => void,
    AddPlot: (key: OpenSee.IGraphProps, yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, isZoomed?: boolean, fftLimits?: [number, number], cycleLimits?: [number, number]) => void,
    RemovePlot: (key: OpenSee.IGraphProps) => void,
    UpdateAnalyticPlot: (key: OpenSee.IGraphProps) => void,
    EnableOverlappingEvent: (eventID: number) => void
}

// ToDo: I'm sure we can remove a lot of these, a lot of them are only used in one place...
// If we need to cache results, use memo in the common parent parent or memoize it in the context after its computed...
interface ISelectorFunctions {
    SelectOverlappingEvents: (graphType: OpenSee.graphType) => OpenSee.IGraphProps[],
    SelectDisplayed: () => OpenSee.IDisplayed,
    SelectPlotKeys: () => OpenSee.IGraphProps[],
    SelectListGraphs: () => _.Dictionary<OpenSee.IGraphProps[]>
    SelectAnalytics: () => OpenSee.graphType[],
    SelectData: (key: OpenSee.IGraphProps) => OpenSee.iD3DataSeries[] | null,
    SelectEnabled: (key: OpenSee.IGraphProps) => boolean[],
    SelectRelevantUnits: (key: OpenSee.IGraphProps) => OpenSee.Unit[],
    SelectEnabledUnits: (key: OpenSee.IGraphProps) => OpenSee.Unit[],
    SelectYLimits: (key: OpenSee.IGraphProps) => OpenSee.IUnitCollection<[number, number]>,
    SelectOverlappingYLimits: (key: OpenSee.graphType) => OpenSee.IGraphCollection<[number, number]> | undefined,
    SelectLoading: (key: OpenSee.IGraphProps) => OpenSee.LoadingState | undefined,
    SelectAutoUnits: (key: OpenSee.IGraphProps) => { [key: string]: boolean } | undefined,
    SelectAxisSettings: (key: OpenSee.IGraphProps) => OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
    SelectYLabels: (key: OpenSee.IGraphProps) => OpenSee.IUnitCollection<string>,
    SelectEventIDs: (context: OpenSee.IDataContext) => number[],
    SelectFFTEnabled: () => boolean,
    SelectIsManual: (key: OpenSee.IGraphProps) => OpenSee.IUnitCollection<boolean> | undefined,
    SelectIsOverlappingManual: (type: OpenSee.graphType) => { [key: string]: OpenSee.IUnitCollection<boolean> } | undefined,
    SelectOverlappingAutoUnits: (type: OpenSee.graphType) => { [key: string]: OpenSee.IUnitCollection<boolean> } | undefined,
    SelectIsZoomed: (key: OpenSee.IGraphProps) => boolean | undefined,
    SelectHoverPoints: (point: [number, number]) => OpenSee.IPoint[],
    SelectDeltaHoverPoints: (point: [number, number]) => OpenSee.IPoint[],
    SelectVPhases: (point: [number, number]) => OpenSee.IVector[],
    SelectIPhases: (point: [number, number]) => OpenSee.IVector[],
    SelectSelectedPoints: () => OpenSee.IPointCollection[],
    SelectFFTData: () => OpenSee.IFFTSeries[],
    SelectEnabledPlots: () => OpenSee.PlotQuery[],
    SelectActiveUnit: (key: OpenSee.IGraphProps) => null | { [key: string]: any },
}

interface IDataFunctionContextType {
    Dispatch: React.MutableRefObject<IDataFunctions>
}

interface IDataContextType {
    Selector: React.MutableRefObject<ISelectorFunctions>,
    Context: OpenSee.IDataContext
}

const defaultState: OpenSee.IDataContext = {
    StartTime: 0,
    EndTime: 0,
    Plots: [] as OpenSee.IGraphstate[],
    FftLimits: [0, 0],
    CycleLimits: [0, 1000.0 / 60.0],
    OverlappingLoading: 'Uninitiated',
    OverlappingEventList: []
};

const defaultOption: OpenSee.iUnitOptions = {
    label: '',
    factor: 1,
    short: ''
};

const defaultSelectors: ISelectorFunctions = {
    SelectOverlappingEvents: () => [],
    SelectDisplayed: () => ({ Voltage: false, Current: false, TripCoil: false, Analogs: false, Digitals: false }),
    SelectPlotKeys: () => [],
    SelectListGraphs: () => ({}),
    SelectAnalytics: () => [],
    SelectData: () => [],
    SelectEnabled: () => [],
    SelectRelevantUnits: () => [],
    SelectEnabledUnits: () => [],
    SelectYLimits: () => ({} as OpenSee.IUnitCollection<[number, number]>),
    SelectOverlappingYLimits: () => undefined,
    SelectLoading: () => 'Uninitiated',
    SelectAutoUnits: () => ({}),
    SelectAxisSettings: () => ({ isManual: false, dataLimits: [0, 0], manualLimits: [0, 0], zoomedLimits: [0, 0], isAuto: false, current: 0 } as any),
    SelectYLabels: () => ({} as OpenSee.IUnitCollection<string>),
    SelectEventIDs: () => [],
    SelectFFTEnabled: () => false,
    SelectIsManual: () => undefined,
    SelectIsOverlappingManual: () => undefined,
    SelectOverlappingAutoUnits: () => undefined,
    SelectIsZoomed: () => false,
    SelectHoverPoints: () => [],
    SelectDeltaHoverPoints: () => [],
    SelectVPhases: () => [],
    SelectIPhases: () => [],
    SelectSelectedPoints: () => [],
    SelectFFTData: () => [],
    SelectEnabledPlots: () => [],
    SelectActiveUnit: () => null,
};

const defaultDispatchers: IDataFunctions = {
    SetTimeLimit: () => { /* noop */ },
    SetCycleLimit: () => { /* noop */ },
    SetFFTLimits: () => { /* noop */ },
    ResetZoom: () => { /* noop */ },
    SetZoomedLimits: () => { /* noop */ },
    SetUnit: () => { /* noop */ },
    EnableTrace: () => { /* noop */ },
    SetIsManual: () => { /* noop */ },
    SetSelectPoint: () => { /* noop */ },
    ClearSelectPoints: () => { /* noop */ },
    RemoveSelectPoints: () => { /* noop */ },
    SetManualLimits: () => { /* noop */ },
    AddPlot: () => { /* noop */ },
    RemovePlot: () => { /* noop */ },
    UpdateAnalyticPlot: () => { /* noop */ },
    EnableOverlappingEvent: () => { /* noop */ },
};

export const DataContext = React.createContext<IDataContextType>({
    Context: defaultState,
    Selector: { current: defaultSelectors } as React.MutableRefObject<ISelectorFunctions>
});

export const DataFunctionContext = React.createContext<IDataFunctionContextType>({
    Dispatch: { current: defaultDispatchers } as React.MutableRefObject<IDataFunctions>
});

// ToDo: A lot of element appear to add/remove plots on a toggle, we might wanna cache data somewhere instead...
export const DataProvider = (props: React.PropsWithChildren<{}>) => {
    const [contextState, setContextState] = React.useState<OpenSee.IDataContext>(defaultState);

    const dataRef = React.useRef<ISelectorFunctions>(defaultSelectors);
    const selector = React.useMemo(() => ({ Selector: dataRef, Context: contextState }), [contextState]);

    const functionRef = React.useRef<IDataFunctions>(defaultDispatchers);
    const dispatch = React.useMemo(() => ({ Dispatch: functionRef }), []);

    const [analytic] = React.useContext(AnalyticContext);
    const oldAnalyticRef = React.useRef<{ [key: string]: number }>({});

    const evt = React.useContext(EventContext);

    const defaultVType = useAppSelector(SelectVTypeDefault);
    const defaultTrace = useAppSelector(SelectDefaultTraces);
    const singlePlot = useAppSelector(SelectSinglePlot);

    // Context Selector Functions

    const SelectEnabledPlots = () => {
        let enabledPlots: OpenSee.PlotQuery[] = [];
        let plotKeys = contextState.Plots.map(plot => plot.key)
        plotKeys = _.uniq(plotKeys)

        if (plotKeys.length > 0)
            plotKeys.forEach(key => {
                const matchingPlot = contextState.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);

                if (matchingPlot) {
                    const relevantUnits = matchingPlot.data.filter(data => data.Enabled)
                    const enabledUnits = _.uniqBy(relevantUnits, "Unit").map(data => data.Unit)
                    let yLimits = {}

                    Object.keys(matchingPlot.yLimits).forEach(key => {
                        if (enabledUnits.includes(key as OpenSee.Unit))
                            yLimits[key] = { ...matchingPlot.yLimits[key], autoUnit: matchingPlot.yLimits[key as OpenSee.Unit].isAuto };
                    })

                    enabledPlots.push({
                        yLimits: yLimits as OpenSee.IUnitCollection<OpenSee.IAxisSettings>,
                        isZoomed: matchingPlot.isZoomed,
                        key: matchingPlot.key
                    });
                }
            });

        return enabledPlots;
    }

    const SelectActiveUnit = (key: OpenSee.IGraphProps): null | { [key: string]: any } => {
        const baseUnits = defaultSettings.Units
        let result = {};
        const plot = contextState.Plots.find(plot => plot.key.EventId === key.EventId && plot.key.DataType === key.DataType);
        if (!plot)
            return null;

        Object.keys(baseUnits).forEach(unit => {
            if (plot.yLimits[unit])
                result[unit] = baseUnits[unit].options[plot.yLimits[unit].current]
        })

        return result;
    }

    const SelectOverlappingEvents = (graphType: OpenSee.graphType) => {
        const filteredPlots = contextState.Plots.filter(plot => plot.key.EventId !== evt.Context.EventID && plot.key.EventId !== -1 && plot.key.DataType === graphType).map(plot => plot.key);
        //order by eventID because we groupBy eventID in openSEE.tsx
        const sortedPlots = _.orderBy(filteredPlots, "EventId", "desc")
        return sortedPlots;
    }

    const SelectDisplayed = () => ({
        Voltage: contextState.Plots.some(p => p.key.DataType == 'Voltage'),
        Current: contextState.Plots.some(p => p.key.DataType == 'Current'),
        TripCoil: contextState.Plots.some(p => p.key.DataType == 'TripCoil'),
        Analogs: contextState.Plots.some(p => p.key.DataType == 'Analogs'),
        Digitals: contextState.Plots.some(p => p.key.DataType == 'Digitals')
    });

    const SelectPlotKeys = () => {
        let keys = contextState.Plots.map(plot => plot.key);
        if (singlePlot)
            keys = keys.filter(key => key.EventId === -1);

        keys = _.uniq(keys);
        keys.sort(sortGraph);

        return keys?.length > 0 ? keys : [];
    }

    // Returns a List of keys for Plots that should be displayed.
    const SelectListGraphs = () => {
        let keys = contextState.Plots.map(p => p.key);
        if (singlePlot)
            return _.groupBy(keys.filter(item => item.EventId === -1), "EventId");
        return _.groupBy(keys.filter(item => item.EventId !== -1), "EventId");
    }

    //Returns the DataType of plots that are Analytics
    const SelectAnalytics = () => {
        const analytics = ['FirstDerivative', 'ClippedWaveforms', 'Frequency', 'HighPassFilter', 'LowPassFilter', 'MissingVoltage', 'OverlappingWave', 'Power', 'Impedance', 'Rectifier', 'RapidVoltage', 'RemoveCurrent', 'Harmonic', 'SymetricComp', 'THD', 'Unbalance', 'FaultDistance', 'Restrike', 'I2T'] as OpenSee.graphType[];
        let plotTypes = contextState.Plots.filter(plot => plot.key.EventId === evt.Context.EventID && analytics.includes(plot.key.DataType)).map(plot => plot.key.DataType)

        plotTypes = _.uniq(plotTypes)

        if (plotTypes)
            return plotTypes
        else
            return []
    }

    const SelectData = (key: OpenSee.IGraphProps) => {
        let plot = contextState.Plots.find(item => item.key.DataType === key.DataType && item.key.EventId === key.EventId);
        let overlappingPlot = contextState.Plots.find(item => item.key.DataType === key.DataType && item.key.EventId === -1);
        if (singlePlot)
            return overlappingPlot ? overlappingPlot.data : null;
        return plot ? plot.data : null;
    }

    const SelectEnabled = (key: OpenSee.IGraphProps) => {
        let plot = contextState.Plots.find(item => item.key.DataType === key.DataType && item.key.EventId === key.EventId);
        if (plot)
            return plot.data.map(item => item.Enabled)
        else
            return []
    }

    const SelectRelevantUnits = (key: OpenSee.IGraphProps) => {
        let units: OpenSee.Unit[] = [];

        // Filter relevant plots and collect units
        contextState.Plots.filter(plot => key.DataType === plot.key.DataType && key.EventId === plot.key.EventId).forEach(plot => {
            plot.data.forEach(data => {
                if (data.Unit) {
                    units.push(data.Unit);
                }
            });
        });

        //Make sure the primaryAxis is at the beginning of the array for plotting purposes..
        if (units.includes(func.getPrimaryAxis(key))) {
            units = units.filter(unit => unit !== func.getPrimaryAxis(key))
            units.unshift(func.getPrimaryAxis(key))
        }
        return _.uniq(units);
    }

    const SelectEnabledUnits = (key: OpenSee.IGraphProps) => {
        let units: OpenSee.Unit[] = [];
        const plot = contextState.Plots.find(plot => key.DataType === plot.key.DataType && key.EventId === plot.key.EventId)
        // Filter relevant plots and collect units
        if (plot) {
            plot.data.forEach(data => {
                if (data.Unit && data.Enabled)
                    units.push(data.Unit);
            });

            //Make sure the primaryAxis is at the beginning of the array
            if (units.includes(func.getPrimaryAxis(key))) {
                units = units.filter(unit => unit !== func.getPrimaryAxis(key));
                units.unshift(func.getPrimaryAxis(key))
            }
            return _.uniq(units);
        }
        else
            return [];
    }

    const SelectYLimits = (key: OpenSee.IGraphProps) => {
        const plot = contextState.Plots.find(plot => plot.key.EventId === key.EventId && plot.key.DataType === key.DataType)
        let result = {}
        if (plot) {
            Object.keys(plot.yLimits).forEach(unit => {
                if (plot.isZoomed)
                    result[unit] = plot.yLimits[unit].zoomedLimits
                else if (plot.yLimits[unit].isManual && plot.yLimits[unit].manualLimits)
                    result[unit] = plot.yLimits[unit].manualLimits
                else
                    result[unit] = plot.yLimits[unit].dataLimits
            })
        }

        return result as OpenSee.IUnitCollection<[number, number]>;
    }

    const SelectOverlappingYLimits = (graphType: OpenSee.graphType) => {
        let overlappingPlots = contextState.Plots.filter(plot => plot.key.EventId !== evt.Context.EventID && plot.key.DataType === graphType);
        let result = {};
        if (overlappingPlots.length > 0) {
            overlappingPlots.forEach(plot => {
                let yLimits = {}
                Object.keys(plot.yLimits).forEach(key => {
                    if (plot.isZoomed)
                        yLimits[key] = plot.yLimits[key].zoomedLimits;
                    else if (plot.yLimits[key].isManual && plot.yLimits[key].manualLimits)
                        yLimits[key] = plot.yLimits[key].manualLimits;
                    else
                        yLimits[key] = plot.yLimits[key].dataLimits;

                })
                result[plot.key.DataType] = yLimits;
            })
            return result as OpenSee.IGraphCollection<[number, number]>;
        }

    }

    const SelectLoading = (key: OpenSee.IGraphProps) => {
        const plot = contextState.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
        if (plot)
            return plot.loading
    }

    const SelectAutoUnits = (key: OpenSee.IGraphProps) => {
        let result = {};
        const plot = contextState.Plots.find(plot => plot.key.EventId === key.EventId && plot.key.DataType === key.DataType)
        if (plot) {
            Object.keys(plot.yLimits).forEach(unit => {
                result[unit] = plot.yLimits[unit].isAuto
            })
            return result;
        }
    }

    const SelectAxisSettings = (key: OpenSee.IGraphProps) => {
        const plot = contextState.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
        if (plot != null)
            return plot.yLimits;

        return {
            isManual: false,
            dataLimits: [0, 0],
            manualLimits: [0, 0],
            zoomedLimits: [0, 0],
            isAuto: false,
            current: 0
        } as unknown as OpenSee.IUnitCollection<OpenSee.IAxisSettings>
    }

    const SelectYLabels = (key: OpenSee.IGraphProps) => {
        let labels = {} as OpenSee.IUnitCollection<string>
        const plot = contextState.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
        if (plot) {
            Object.keys(plot.yLimits).forEach(unit => {
                let short = defaultSettings.Units[unit].options?.[plot.yLimits[unit].current]?.short
                if (short === undefined)
                    short = "N/A"

                labels[unit] = `${unit} [${short}]`
            })
            return labels;
        }
        else {
            Object.keys(defaultSettings.Units).forEach(unit => {
                labels[unit] = ""
            })
            return labels;
        }
    }

    const SelectEventIDs = React.useCallback((context: OpenSee.IDataContext) => {
        let ids = [evt.Context.EventID];
        context.OverlappingEventList.forEach(event => {
            if (event.Selected)
                ids.push(event.EventID)
        })

        const eventIDS = _.uniq(ids)
        return eventIDS
    }, [evt.Context.EventID]);

    const SelectFFTEnabled = () => {
        const keys = contextState.Plots.filter(plot => plot.key.DataType === 'FFT')
        return keys?.length > 0;
    }

    const SelectIsManual = (key: OpenSee.IGraphProps) => {
        let plot = contextState.Plots.find(p => p.key.DataType === key.DataType && p.key.EventId === key.EventId);
        let result = {};
        if (plot) {
            Object.keys(plot.yLimits).forEach(key => {
                result[key] = plot.yLimits[key].isManual;
            });
            return result as OpenSee.IUnitCollection<boolean>;
        }
    }

    const SelectIsOverlappingManual = (graphType: OpenSee.graphType) => {
        let overlappingPlots = contextState.Plots.filter(p => p.key.DataType === graphType && p.key.EventId !== evt.Context.EventID);
        let result = {};
        if (overlappingPlots.length > 0) {
            overlappingPlots.forEach(plot => {
                let units = {}
                Object.keys(plot.yLimits).forEach(key => {
                    units[key] = plot.yLimits[key].isManual;
                })
                result[plot.key.DataType] = units as OpenSee.IUnitCollection<boolean>
            })

            return result;
        }
    }

    const SelectOverlappingAutoUnits = (graphType: OpenSee.graphType) => {
        let overlappingPlots = contextState.Plots.filter(p => p.key.DataType === graphType && p.key.EventId !== evt.Context.EventID);
        let result = {};
        if (overlappingPlots.length > 0) {
            overlappingPlots.forEach(plot => {
                let units = {}
                Object.keys(plot.yLimits).forEach(key => {
                    units[key] = plot.yLimits[key].isAuto;
                })
                result[plot.key.DataType] = units as OpenSee.IUnitCollection<boolean>
            })

            return result;
        }
    }

    const SelectIsZoomed = (key: OpenSee.IGraphProps,) => {
        let plot = contextState.Plots.find(p => p.key.DataType === key.DataType && p.key.EventId === key.EventId);
        return plot?.isZoomed;
    }

    // For tooltip
    const SelectHoverPoints = (hover: [number, number]) => {
        let result: OpenSee.IPoint[] = [];
        let filteredPlots = contextState.Plots.filter(plot => plot.key.EventId === evt.Context.EventID)

        filteredPlots.forEach(plot => {
            if (plot.data.length === 0) return;

            let dataIndex = func.getIndex(hover[0], plot.data[0].DataPoints);
            if (isNaN(dataIndex))
                return;


            result = result.concat(...plot.data.filter(d => d.Enabled).map(d => {
                dataIndex = func.getIndex(hover[0], d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: defaultSettings.Units[d.Unit].options[plot.yLimits[d.Unit].current],
                    Value: (dataIndex > (d.DataPoints.length - 1) ? NaN : d.DataPoints[dataIndex][1]),
                    Name: func.GetDisplayName(d, plot.key.DataType),
                    BaseValue: d.BaseValue,
                    Time: 0,
                }
            }))
        })
        return result;
    }

    const SelectDeltaHoverPoints = (hover: [number, number]) => {
        let result: OpenSee.IPoint[] = [];
        let filteredPlots = contextState.Plots.filter(plot => plot.key.EventId === evt.Context.EventID)

        filteredPlots.forEach(plot => {
            const selectedData = plot.selectedIndixes;
            if (plot.data.length === 0) return;

            let dataIndex = func.getIndex(hover[0], plot.data[0].DataPoints);
            if (isNaN(dataIndex))
                return;

            result = result.concat(...plot.data.filter(d => d.Enabled).map(d => {
                dataIndex = func.getIndex(hover[0], d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: defaultSettings.Units[d.Unit].options[plot.yLimits[d.Unit].current],
                    Value: (dataIndex > (d.DataPoints.length - 1) ? NaN : d.DataPoints[dataIndex][1]),
                    Name: func.GetDisplayName(d, plot.key.DataType),
                    PrevValue: (selectedData.length > 0 ? ((selectedData[selectedData.length] - 1) > d.DataPoints.length ? NaN : d.DataPoints[selectedData[selectedData.length - 1]][1]) : NaN),
                    BaseValue: d.BaseValue,
                    Time: (selectedData.length > 0 ? ((selectedData[selectedData.length] - 1) > d.DataPoints.length ? NaN : d.DataPoints[selectedData[selectedData.length - 1]][0]) : NaN),
                }

            }))
        })
        return result;
    }

    // For vector
    const SelectVPhases = (hover: [number, number]) => {
        let plot = contextState.Plots.find(plot => plot.key.DataType == 'Voltage' && plot.key.EventId == evt.Context.EventID);
        if (!plot || plot.data.length === 0 || !plot.data.some(d => d.LegendHorizontal == 'Ph'))
            return [];

        const activeUnits = plot.yLimits;
        let asset = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendGroup));
        let phase = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendVertical));

        let phaseData = plot.data.find(item => item.LegendHorizontal == 'Ph');
        let pointIndex = phaseData ? func.getIndex(hover[0], phaseData.DataPoints) : -1;

        if (isNaN(pointIndex) || pointIndex < 0)
            return [];

        let result: OpenSee.IVector[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                let phaseChannel = plot.data.find(item => item.LegendGroup == a && item.LegendVertical == p && item.LegendHorizontal == 'Ph');
                let magnitudeChannel = plot.data.find(item => item.LegendGroup == a && item.LegendVertical == p && item.LegendHorizontal == 'Pk');

                if (phaseChannel && magnitudeChannel) {
                    let phaseValue = pointIndex < phaseChannel.DataPoints.length ? phaseChannel.DataPoints[pointIndex][1] : NaN;
                    let magValue = pointIndex < magnitudeChannel.DataPoints.length ? magnitudeChannel.DataPoints[pointIndex][1] : NaN;

                    const unit = defaultSettings.Units.Voltage.options?.[activeUnits["Voltage"].current] ?? defaultOption;
                    const phaseUnit = defaultSettings.Units.Angle.options?.[activeUnits["Angle"].current] ?? defaultOption;

                    result.push({
                        Color: phaseChannel.Color,
                        Unit: unit,
                        PhaseUnit: phaseUnit,
                        Phase: p,
                        Asset: a,
                        Magnitude: magValue,
                        Angle: phaseValue,
                        BaseValue: magnitudeChannel.BaseValue
                    });
                }
            });
        });

        return result;
    }

    const SelectIPhases = (hover: [number, number]) => {
        let plot = contextState.Plots.find(p => p.key.DataType == 'Current' && p.key.EventId == evt.Context.EventID);
        if (!plot || plot.data.length === 0 || !plot.data.some(d => d.LegendHorizontal == 'Ph')) return [];

        const activeUnits = plot.yLimits;
        let asset = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendGroup));
        let phase = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendVertical));

        let pointIndex = func.getIndex(hover[0], plot.data.find(item => item.LegendHorizontal == 'Ph')?.DataPoints ?? []);

        if (isNaN(pointIndex)) return [];

        let result: OpenSee.IVector[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                let phaseChannel = plot.data.find(item => item.LegendGroup == a && item.LegendVertical == p && item.LegendHorizontal == 'Ph');
                let magnitudeChannel = plot.data.find(item => item.LegendGroup == a && item.LegendVertical == p && item.LegendHorizontal == 'Pk');

                if (phaseChannel && magnitudeChannel) {
                    let phaseValue = pointIndex < phaseChannel.DataPoints.length ? phaseChannel.DataPoints[pointIndex][1] : NaN;
                    let magValue = pointIndex < magnitudeChannel.DataPoints.length ? magnitudeChannel.DataPoints[pointIndex][1] : NaN;

                    result.push({
                        Color: phaseChannel.Color,
                        Unit: defaultSettings.Units.Current.options?.[activeUnits["Current"].current] ?? defaultOption,
                        PhaseUnit: defaultSettings.Units.Angle.options?.[activeUnits["Angle"].current] ?? defaultOption,
                        Phase: p,
                        Asset: a,
                        Magnitude: magValue,
                        Angle: phaseValue,
                        BaseValue: magnitudeChannel.BaseValue
                    });
                }
            });
        });

        return result;
    }

    // For Accumulated Point widget
    const SelectSelectedPoints = () => {
        let result: OpenSee.IPointCollection[] = [];

        contextState.Plots.forEach(plot => {
            if (plot.key.EventId != evt.Context.EventID) return;
            if (plot.key.DataType != 'Voltage' && plot.key.DataType != 'Current') return;
            if (plot.data.length == 0) return;

            result = result.concat(...plot.data.filter(d => d.Enabled).map(d => {
                const unitType = d?.Unit;
                const unitOptions = defaultSettings.Units[unitType]?.options ?? {};

                return {
                    Group: d.LegendGroup,
                    Name: (plot.key.DataType == 'Voltage' ? 'V ' : 'I ') + d.LegendVertical + ' ' + d.LegendHorizontal,
                    Unit: unitOptions[plot.yLimits[unitType].current],
                    Value: plot.selectedIndixes.map(j => d.DataPoints[j]),
                    BaseValue: d.BaseValue,
                    Color: d.Color
                }

            }))

        })
        return result;
    }

    // For FFT Table
    const SelectFFTData = () => {
        const fftPlot = contextState.Plots.find(plot => plot.key.DataType === "FFT" && plot.key.EventId === evt.Context.EventID);
        if (fftPlot?.data == null) return [];
        const activeUnits = defaultSettings.Units
        let asset = _.uniq(fftPlot.data.map(item => item.LegendGroup));
        let phase = _.uniq(fftPlot.data.map(item => item.LegendVertical));

        if (fftPlot.data.length == 0) return []

        let result: OpenSee.IFFTSeries[] = [];

        asset.forEach(a => {
            phase.forEach(p => {
                if (!fftPlot.data.some((item, i) => (item.LegendGroup == a && item.LegendVertical == p)))
                    return

                let d = fftPlot.data.filter((item, i) => (item.LegendGroup == a && item.LegendVertical == p));
                let phaseChannel = d.find(item => item.LegendHorizontal == 'Ang');
                let magnitudeChannel = d.find(item => item.LegendHorizontal == 'Mag');

                if (phaseChannel == undefined || magnitudeChannel == undefined)
                    return;

                result.push({
                    Color: phaseChannel.Color,
                    Unit: activeUnits[magnitudeChannel.Unit].options[fftPlot.yLimits[magnitudeChannel.Unit].current],
                    PhaseUnit: activeUnits["Angle"].options?.[fftPlot.yLimits["Angle"].current] ?? defaultOption,
                    Phase: p,
                    Asset: a,
                    Magnitude: magnitudeChannel.DataPoints.map(item => item[1]),
                    Angle: phaseChannel.DataPoints.map(item => item[1]),
                    BaseValue: magnitudeChannel.BaseValue,
                    Frequency: magnitudeChannel.DataPoints.map(item => item[0] * 60.0),
                });

            })
        })

        return result;
    }

    // Context State Functions
    const SetTimeLimit = React.useCallback((start: number, end: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            func.UpdateTimeLimit(updatedContext, start, end);
            return updatedContext;
        })
        , []);

    const SetCycleLimit = React.useCallback((start: number, end: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            func.UpdateCycleLimits(updatedContext, start, end);
            return updatedContext;
        })
        , []);

    const SetFFTLimits = React.useCallback((start: number, end: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            func.UpdateFFTLimits(updatedContext, start, end);
            return updatedContext;
        })
        , []);

    const ResetZoom = React.useCallback((start: number, end: number) =>
        setContextState(c => {
            let updatedContext = _.cloneDeep(c);

            func.UpdateTimeLimit(updatedContext, start, end);

            // FFT Limits get updated base on values not eventTime
            const fftPlotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == 'FFT');
            const wavePlotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == 'OverlappingWave');
            if (fftPlotIndex > -1) {
                const start = Math.min(...updatedContext.Plots[fftPlotIndex].data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]))));
                const end = Math.max(...updatedContext.Plots[fftPlotIndex].data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]))));
                func.UpdateFFTLimits(updatedContext, start, end);
            }
            if (wavePlotIndex > -1) {
                const start = Math.min(...updatedContext.Plots[wavePlotIndex].data.map(item => Math.min(...item.DataPoints.map(pt => pt[0]).filter(val => !isNaN(val)))));
                const end = Math.max(...updatedContext.Plots[wavePlotIndex].data.map(item => Math.max(...item.DataPoints.map(pt => pt[0]).filter(val => !isNaN(val)))));
                func.UpdateCycleLimits(updatedContext, start, end);
            }

            for (let plotIndex = 0; plotIndex < updatedContext.Plots.length; plotIndex++) {
                updatedContext.Plots[plotIndex].isZoomed = false;
                const RelevantAxis = _.uniq(updatedContext.Plots[plotIndex].data.map(s => s.Unit));
                RelevantAxis.forEach(axis => {
                    updatedContext.Plots[plotIndex].yLimits[axis].zoomedLimits = [0, 1];
                });
            }

            return updatedContext;
        })
        , []);

    const SetZoomedLimits = React.useCallback((limits: [number, number], key: OpenSee.IGraphProps) =>
        setContextState(c => {
            const plotIndex = c.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            if (plotIndex <= -1)
                return c;

            const newContext = _.cloneDeep(c);

            const primaryAxis = func.getPrimaryAxis(newContext.Plots[plotIndex].key);
            let oldLimits: [number, number] = [0, 1];

            if (newContext.Plots[plotIndex].yLimits[primaryAxis].isManual)
                oldLimits = newContext.Plots[plotIndex].yLimits[primaryAxis].manualLimits;
            else if (newContext.Plots[plotIndex].isZoomed)
                oldLimits = newContext.Plots[plotIndex].yLimits[primaryAxis].zoomedLimits;
            else
                oldLimits = newContext.Plots[plotIndex].yLimits[primaryAxis].dataLimits;

            const RelevantAxis = _.uniq(newContext.Plots[plotIndex].data.filter(item => item.Enabled).map(s => s.Unit));

            RelevantAxis.forEach(axis => {
                if (axis === func.getPrimaryAxis(key))
                    newContext.Plots[plotIndex].yLimits[axis].zoomedLimits = limits;
                else if (newContext.Plots[plotIndex].yLimits[axis].isManual)
                    newContext.Plots[plotIndex].yLimits[axis].zoomedLimits = func.recomputeNonAutoLimits(oldLimits, limits, newContext.Plots[plotIndex].yLimits[axis].manualLimits);
                else if (newContext.Plots[plotIndex].isZoomed)
                    newContext.Plots[plotIndex].yLimits[axis].zoomedLimits = func.recomputeNonAutoLimits(oldLimits, limits, newContext.Plots[plotIndex].yLimits[axis].zoomedLimits);
                else
                    newContext.Plots[plotIndex].yLimits[axis].zoomedLimits = func.recomputeNonAutoLimits(oldLimits, limits, newContext.Plots[plotIndex].yLimits[axis].dataLimits);
            });
            newContext.Plots[plotIndex].isZoomed = true;
            return newContext;
        })
        , []);

    const SetUnit = React.useCallback((unit: OpenSee.Unit, value: number, auto: boolean, key: OpenSee.IGraphProps) =>
        setContextState(c => {
            const newContext = _.cloneDeep(c);

            for (let plotIndex = 0; plotIndex < newContext.Plots.length; plotIndex++) {
                if (newContext.Plots[plotIndex].key.DataType !== key.DataType)
                    continue;

                const oldUnitIndex = newContext.Plots[plotIndex].yLimits[unit].current
                let newUnitIndex = value

                //Shouldnt need to explicty type this..
                const unitSetting: OpenSee.IUnitSetting = defaultSettings.Units[unit];

                const oldFactor = unitSetting.options?.[oldUnitIndex]?.factor
                const newFactor = unitSetting.options?.[newUnitIndex]?.factor
                
                const isPU = oldFactor === undefined || newFactor === undefined ? true : false

                newContext.Plots[plotIndex].yLimits[unit].isAuto = auto
                newContext.Plots[plotIndex].yLimits[unit].current = value

                const axisSetting: OpenSee.IAxisSettings = newContext.Plots[plotIndex].yLimits[unit];
                const oldLimits = axisSetting.dataLimits
                const filteredData = newContext.Plots[plotIndex].data.filter(item => item.Enabled && item.Unit === unit);

                //handle autoUnit case
                let unitIndex = func.updateActiveUnits(newContext.Plots[plotIndex].yLimits, unit, filteredData, newContext.StartTime, newContext.EndTime, null);
                if (unitIndex >= 0) {
                    newContext.Plots[plotIndex].yLimits[unit].current = unitIndex
                    newUnitIndex = unitIndex
                }

                let limits: [number, number];
                switch (newContext.Plots[plotIndex].key.DataType) {
                    case 'FFT':
                        limits = func.recomputeDataLimits(newContext.FftLimits[0], newContext.FftLimits[1], filteredData, newContext.Plots[plotIndex].yLimits[unit].current);
                        axisSetting.dataLimits = limits;
                        if (isPU) {
                            axisSetting.zoomedLimits = func.scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                            axisSetting.manualLimits = func.scaleLimits(oldLimits, limits, axisSetting.manualLimits)
                        }
                        else {
                            axisSetting.manualLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.manualLimits)
                            axisSetting.zoomedLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.zoomedLimits)
                        }
                        break;
                    case 'OverlappingWave':
                        limits = func.recomputeDataLimits(newContext.CycleLimits[0], newContext.CycleLimits[1], filteredData, newContext.Plots[plotIndex].yLimits[unit].current);
                        axisSetting.dataLimits = limits;
                        if (isPU) {
                            axisSetting.zoomedLimits = func.scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                            axisSetting.manualLimits = func.scaleLimits(oldLimits, limits, axisSetting.manualLimits)
                        }
                        else {
                            axisSetting.manualLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.manualLimits)
                            axisSetting.zoomedLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.zoomedLimits)
                        }
                        break;
                    default:
                        limits = func.recomputeDataLimits(newContext.StartTime, newContext.EndTime, filteredData, newContext.Plots[plotIndex].yLimits[unit].current);
                        axisSetting.dataLimits = limits;
                        if (isPU) {
                            axisSetting.zoomedLimits = func.scaleLimits(oldLimits, limits, axisSetting.zoomedLimits)
                            axisSetting.manualLimits = func.scaleLimits(oldLimits, limits, axisSetting.manualLimits)
                        }
                        else {
                            axisSetting.manualLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.manualLimits)
                            axisSetting.zoomedLimits = func.scaleLimitsByFactor(oldUnitIndex, newUnitIndex, unit, axisSetting.zoomedLimits)
                        }
                        break;
                }
            }
            func.saveSettings(newContext);
            return newContext;
        })
        , []);

    const EnableTrace = React.useCallback((key: OpenSee.IGraphProps, trace: number[], enabled: boolean) =>
        setContextState(c => {
            // Find the index of the plot in the state
            let plotIndex = c.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            if (plotIndex < 0)
                return c;

            const updatedContext = _.cloneDeep(c);

            // Update only the selected plot
            trace.forEach(traceIndex => {
                if (traceIndex < updatedContext.Plots[plotIndex].data.length) {
                    updatedContext.Plots[plotIndex].data[traceIndex].Enabled = enabled;
                }
            });

            // Recompute limits and update units
            const relevantTraces = trace.map(index => updatedContext.Plots[plotIndex].data[index])
            const RelevantAxis = _.uniq(relevantTraces.map(s => s?.Unit));

            if (RelevantAxis.length > 0)
                RelevantAxis.forEach(axis => {
                    if (axis === undefined)
                        return
                    const axisSetting = updatedContext.Plots[plotIndex].yLimits[axis];
                    const relevantData = updatedContext.Plots[plotIndex].data.filter(item => item.Enabled && item.Unit === axis);

                    let recomputedLimits: [number, number];
                    switch (updatedContext.Plots[plotIndex].key.DataType) {
                        case "FFT":
                            recomputedLimits = func.recomputeDataLimits(updatedContext.FftLimits[0], updatedContext.FftLimits[1], relevantData, updatedContext.Plots[plotIndex].yLimits[axis].current);
                            axisSetting.dataLimits = recomputedLimits;
                            axisSetting.zoomedLimits = func.recomputeNonAutoLimits(updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].dataLimits, updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].zoomedLimits, recomputedLimits);
                            break;
                        case "OverlappingWave":
                            recomputedLimits = func.recomputeDataLimits(updatedContext.CycleLimits[0], updatedContext.CycleLimits[1], relevantData, updatedContext.Plots[plotIndex].yLimits[axis].current);
                            axisSetting.dataLimits = recomputedLimits;
                            axisSetting.zoomedLimits = func.recomputeNonAutoLimits(updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].dataLimits, updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].zoomedLimits, recomputedLimits);
                            break;
                        default:
                            recomputedLimits = func.recomputeDataLimits(updatedContext.StartTime, updatedContext.EndTime, relevantData, updatedContext.Plots[plotIndex].yLimits[axis].current);
                            axisSetting.dataLimits = recomputedLimits;
                            axisSetting.zoomedLimits = func.recomputeNonAutoLimits(updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].dataLimits, updatedContext.Plots[plotIndex].yLimits[func.getPrimaryAxis(key)].zoomedLimits, recomputedLimits);
                            break;
                    }
                    // ToDo: Not sure this is doing anything remove if able
                    func.updateActiveUnits(updatedContext.Plots[plotIndex].yLimits, axis, relevantData, updatedContext.StartTime, updatedContext.EndTime, null);
                });
            return updatedContext;
        })
        , []);

    const SetIsManual = React.useCallback((key: OpenSee.IGraphProps, unit: OpenSee.Unit, manual: boolean) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            const plotIndex = updatedContext.Plots.findIndex(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
            updatedContext.Plots[plotIndex].yLimits[unit].isManual = manual;

            const isValidNumber = (value) => !isNaN(value) && isFinite(value);

            const invalidZoomedLimits = (updatedContext.Plots[plotIndex].yLimits[unit].zoomedLimits === null) || !isValidNumber(updatedContext.Plots[plotIndex].yLimits[unit].zoomedLimits[0]) || !isValidNumber(updatedContext.Plots[plotIndex].yLimits[unit].zoomedLimits[1]);
            const invalidDataLimits = (updatedContext.Plots[plotIndex].yLimits[unit].dataLimits === null) || !isValidNumber(updatedContext.Plots[plotIndex].yLimits[unit].dataLimits[0]) || !isValidNumber(updatedContext.Plots[plotIndex].yLimits[unit].dataLimits[1]);

            if (updatedContext.Plots[plotIndex].isZoomed && !invalidZoomedLimits)
                updatedContext.Plots[plotIndex].yLimits[unit].manualLimits = updatedContext.Plots[plotIndex].yLimits[unit].zoomedLimits
            else if (!invalidDataLimits)
                updatedContext.Plots[plotIndex].yLimits[unit].manualLimits = updatedContext.Plots[plotIndex].yLimits[unit].dataLimits

            return updatedContext;
        })
        , []);

    const SetSelectPoint = React.useCallback((time: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            for (let index = 0; index < updatedContext.Plots.length; index++) {
                let shortestDataObject = _.minBy(updatedContext.Plots[index].data, dataObject => dataObject.DataPoints.length);

                if (updatedContext.Plots[index]?.data?.length > 0) {
                    let dataIndex = func.getIndex(time, shortestDataObject?.DataPoints ?? [])
                    updatedContext.Plots[index].selectedIndixes.push(dataIndex);
                }
            }
            return updatedContext;
        })
        , []);

    const ClearSelectPoints = React.useCallback(() =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            for (let index = 0; index < updatedContext.Plots.length; index++) {
                updatedContext.Plots[index].selectedIndixes = []
            }
            return updatedContext;
        })
        , []);

    const RemoveSelectPoints = React.useCallback((selectIndex: number) =>
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);
            for (let index = 0; index < updatedContext.Plots.length; index++) {
                updatedContext.Plots[index].selectedIndixes.splice(selectIndex, 1);
            }
            return updatedContext;
        })
        , []);

    const SetManualLimits = React.useCallback((limits: [number, number], key: OpenSee.IGraphProps, axis: OpenSee.Unit, auto: boolean, factor?: number) =>
        setContextState(c => {
            const plotIndex = c.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            if (plotIndex < 0)
                return c;

            const updatedContext = _.cloneDeep(c);
            updatedContext.Plots[plotIndex].yLimits[axis].isManual = true;

            if (updatedContext.Plots[plotIndex].isZoomed) //cover case of user zooming first then manually editing those..
                updatedContext.Plots[plotIndex].yLimits[axis].zoomedLimits = limits;

            updatedContext.Plots[plotIndex].yLimits[axis].manualLimits = limits;

            factor = factor ?? 1;

            if (auto) {
                let revelantData = updatedContext.Plots[plotIndex].data.filter(data => data.Enabled && data.Unit === axis);
                let index = func.updateActiveUnits(updatedContext.Plots[plotIndex].yLimits, axis, revelantData, updatedContext.StartTime, updatedContext.EndTime, limits);
                if (index >= 0) {
                    updatedContext.Plots[plotIndex].yLimits[axis] = index;
                    let newManualLimits = [limits[0] * factor, limits[1] * factor]
                    updatedContext.Plots[plotIndex].yLimits[axis].manualLimits = newManualLimits;
                }
            }

            return updatedContext;
        })
        , []);

    // Plot Data Functions
    const AddPlot = (key: OpenSee.IGraphProps, yLimits?: OpenSee.IUnitCollection<OpenSee.IAxisSettings>, isZoomed?: boolean, fftLimits?: [number, number], cycleLimits?: [number, number]): void => {
        // Check to see if plot exists

        setContextState(c => {
            // Add plot to context if it does not exist
            const updatedContext = _.cloneDeep(c);
            let plotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == key.DataType && item.key.EventId == key.EventId);
            if (plotIndex < 0) {
                const newPlot = _.cloneDeep(emptygraph);
                plotIndex = updatedContext.Plots.push(newPlot) - 1;
            }

            // Set fields based on arguements
            if (yLimits)
                Object.keys(yLimits).forEach(unit => {
                    updatedContext.Plots[plotIndex].yLimits[unit] = yLimits[unit]
                });
            if (isZoomed !== undefined)
                updatedContext.Plots[plotIndex].isZoomed = isZoomed;
            updatedContext.Plots[plotIndex].key = key;
            updatedContext.Plots[plotIndex].loading = 'Loading';

            // Add/deal with overlapping plot if needed
            let overlappingPlotIndex = -1;
            if (singlePlot)
                overlappingPlotIndex = func.AddSingleOverlappingPlot(updatedContext, key);
            return updatedContext;
        });

        // Adding Data to the Plot
        let handles = getData(
            key,
            analytic,
            data => setContextState(c => {
                const updatedContext = _.cloneDeep(c);
                const plotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == key.DataType && item.key.EventId == key.EventId);
                const overlappingPlotIndex = updatedContext.Plots.findIndex(plot => plot.key.EventId === -1 && plot.key.DataType === key.DataType);
                func.AppendData(updatedContext, key, data, defaultTrace, defaultVType, key.EventId);
                // Append overlapping plot data
                if (overlappingPlotIndex > -1)
                    func.AppendData(updatedContext, { EventId: -1, DataType: key.DataType }, _.cloneDeep(updatedContext[plotIndex].data), defaultTrace, defaultVType, key.EventId);
                return updatedContext;
            }),
            () => setContextState(c => {
                const updatedContext = _.cloneDeep(c);
                func.InitiateDetailed(updatedContext, analytic, key);
                return updatedContext;
            })
        );

        // Register requests to handle store
        AddRequest(key, handles);

        // Register promise to finally set context state
        Promise.all(handles).then(
            () => setContextState(c => {
                const updatedContext = _.cloneDeep(c);
                const plotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == key.DataType && item.key.EventId == key.EventId);
                const overlappingPlotIndex = updatedContext.Plots.findIndex(plot => plot.key.EventId === -1 && plot.key.DataType === key.DataType);
                updatedContext.Plots[plotIndex].loading = 'Idle';

                // Set flag for overlapping plot
                if (overlappingPlotIndex > -1) {
                    const evtIDs = _.uniq(updatedContext.Plots.filter(plot => plot.data.length > 1).map(plot => plot.key.EventId).filter(id => id !== -1));
                    const evtIDsPresent = _.uniq(updatedContext.Plots[overlappingPlotIndex].data.map(data => data.EventID));
                    const allDataPresent = evtIDs.every(id => {
                        return evtIDsPresent.includes(id)
                    })

                    if (allDataPresent)
                        updatedContext.Plots[overlappingPlotIndex].loading = 'Idle';
                }

                if (fftLimits != null)
                    updatedContext.FftLimits = fftLimits;
                if (cycleLimits != null)
                    updatedContext.CycleLimits = cycleLimits;

                return updatedContext;
            }),
            () => setContextState(c => {
                const updatedContext = _.cloneDeep(c);
                const plotIndex = updatedContext.Plots.findIndex(item => item.key.DataType == key.DataType && item.key.EventId == key.EventId);
                const overlappingPlotIndex = updatedContext.Plots.findIndex(plot => plot.key.EventId === -1 && plot.key.DataType === key.DataType);
                if (plotIndex > -1)
                    updatedContext.Plots[plotIndex].loading = 'Error';
                if (overlappingPlotIndex > -1)
                    updatedContext.Plots[overlappingPlotIndex].loading = 'Error';
                return updatedContext;
            })
        );
    }

    const RemovePlot = React.useCallback((key: OpenSee.IGraphProps) =>
        setContextState(c => {
            const plotIndex = c.Plots.findIndex(item => item.key.DataType == key.DataType && item.key.EventId == key.EventId);

            if (plotIndex < 0)
                return c;

            const updatedState = _.cloneDeep(c);
            updatedState.Plots.splice(plotIndex, 1);

            //Remove data from the overlapping single plot if enabled
            if (singlePlot) {
                const overlappingPlotIndex = updatedState.Plots.findIndex(item => item.key.DataType == key.DataType && item.key.EventId == -1)
                if (overlappingPlotIndex >= 0) {
                    updatedState.Plots[overlappingPlotIndex].data = updatedState.Plots[overlappingPlotIndex].data.filter(data => data.EventID !== key.EventId)
                    if (updatedState.Plots[overlappingPlotIndex].data.length !== 0)
                        func.updateAutoLimits(updatedState.Plots[overlappingPlotIndex], updatedState.StartTime, updatedState.EndTime);
                    else
                        updatedState.Plots.splice(overlappingPlotIndex, 1);
                }
            }

            return updatedState;
        }
        ), [singlePlot]);

    // Overlapping Events
    const EnableOverlappingEvent = React.useCallback((eventID: number) => {
        const plotIndex = contextState.OverlappingEventList.findIndex(event => event.EventID === eventID);
        if (plotIndex === -1)
            return;

        // handle request store
        CancelEvent(eventID);

        let plots = _.uniq(contextState.Plots.map(item => item.key.DataType));

        // ToDo: This could be improved, lots of clones and set states will slow this down...
        if (contextState.OverlappingEventList[plotIndex].Selected)
            plots.forEach(item => RemovePlot({ DataType: item, EventId: eventID }));
        else
            plots.forEach(item => AddPlot({ DataType: item, EventId: eventID }));

        setContextState(c => {
            const updatedState = _.cloneDeep(c);
            updatedState.OverlappingEventList[plotIndex].Selected = !updatedState.OverlappingEventList[plotIndex].Selected;
            return updatedState;
        });
    }, [contextState]);

    const UpdateAnalyticPlot = (key: OpenSee.IGraphProps): void => {
        if (contextState.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId) < 0)
            return;

        setContextState(c => {
            // No plot matches
            const plotIndex = c.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
            if (plotIndex < 0)
                return c;

            // Remove old data
            let updatedContext = _.cloneDeep(c);
            updatedContext.Plots[plotIndex].data = [];

            // Set loading flag
            updatedContext.Plots[plotIndex].loading = 'Loading';
            return updatedContext;
        });

        // Adding Data to the Plot
        let handles = getData(
            key,
            analytic,
            data => setContextState(c => {
                const updatedContext = _.cloneDeep(c);
                func.AppendData(updatedContext, key, data, defaultTrace, defaultVType, key.EventId)
                return updatedContext;
            }),
            () => setContextState(c => {
                const updatedContext = _.cloneDeep(c);
                func.InitiateDetailed(updatedContext, analytic, key)
                return updatedContext;
            })
        );

        // Register requests to handle store
        AddRequest(key, handles);

        // Register promise to finally set context state
        Promise.all(handles).then(
            () => setContextState(c => {
                const updatedContext = _.cloneDeep(c);
                const plotIndex = updatedContext.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
                updatedContext.Plots[plotIndex].loading = 'Idle';
                return updatedContext;
            }),
            () => setContextState(c => {
                const updatedContext = _.cloneDeep(c);
                const plotIndex = updatedContext.Plots.findIndex(plot => plot.key.DataType == key.DataType && plot.key.EventId == key.EventId);
                if (plotIndex > -1)
                    updatedContext.Plots[plotIndex].loading = 'Error';
                return updatedContext;
            })
        );
    }

    // If SinglePlot changes, we need to refetch overlapping plots
    React.useEffect(() => {
        setContextState(c => {
            const updatedContext = _.cloneDeep(c);

            if (singlePlot)
                updatedContext.Plots.forEach(plot => func.AddSingleOverlappingPlot(updatedContext, plot.key));
            else
                while (true) {
                    const index = c.Plots.findIndex(plot => plot.key.EventId === -1);
                    if (index >= 0)
                        updatedContext.Plots.splice(index, 1);
                    else
                        break;
                }
            return updatedContext;
        });
    }, [singlePlot]);

    // If analytic changes, we need to refetch
    React.useEffect(() => {
        if (evt.Context.EventID < 0)
            return;

        Object.keys(analytic).forEach((key) => {
            key = key as keyof OpenSee.IAnalyticContext;

            if (analytic[key] != null && oldAnalyticRef.current?.[key] == null || oldAnalyticRef.current[key] != analytic[key]) {
                let keyAnalytic: OpenSee.graphType | undefined;
                //ToDo: This can probably be moved to analytic context...
                switch (key) {
                    case 'FFTCycles':
                    case 'FFTStartTime':
                        keyAnalytic = "FFT";
                        break;
                    case 'LPFOrder':
                        keyAnalytic = "LowPassFilter";
                        break;
                    case 'HPFOrder':
                        keyAnalytic = "HighPassFilter";
                        break;
                    case 'Trc':
                        keyAnalytic = "Rectifier";
                        break;
                    case 'Harmonic':
                        keyAnalytic = "Harmonic";
                        break;
                    default:
                        console.warn(`Unrecognized key ${key} change in datacontext, check to make sure correct analytic is refreshing...`);
                        break;
                }

                if (keyAnalytic != null) {
                    // ToDo: This needs to be reworked, not only does it do a bunch of cloning that WILL be a performance loss, it will also sometimes cause bad behavior because it could use a stale state...
                    const selectedIds = SelectEventIDs(contextState);
                    selectedIds.forEach(id =>
                        UpdateAnalyticPlot({ DataType: keyAnalytic, EventId: id })
                    );
                    oldAnalyticRef.current[key] = analytic[key];
                }
            }
        });
    }, [analytic, evt.Context.EventID]);

    // If eventID changes, we need to reload overlapping events
    React.useEffect(() => {
        if (evt.Context.EventID == null || isNaN(evt.Context.EventID) || evt.Context.EventID <= 0)
            return;

        setContextState(c => {
            const newState = _.cloneDeep(c);
            newState.OverlappingLoading = 'Loading';
            return newState;
        });

        const handle = getOverlappingEvents(evt.Context.EventID, null, null);
        handle.then(
            data => setContextState(c => {
                const newState = _.cloneDeep(c);
                newState.OverlappingLoading = 'Idle';
                data.forEach(event => {
                    const evtIndex = newState.OverlappingEventList.findIndex(overlap => overlap.EventID === event.EventID);
                    if (evtIndex < 0)
                        newState.OverlappingEventList.push(
                            {
                                Selected: false,
                                AssetName: event.AssetName,
                                MeterName: event.MeterName,
                                EventID: event.EventID,
                                StartTime: new Date(event.StartTime + "Z").getTime(),
                                EndTime: new Date(event.EndTime + "Z").getTime(),
                                EventType: event.EventType,
                                Inception: event.Inception,
                                DurationEndTime: event.DurationEndTime
                            });
                    else {
                        //update eventIDs that were pushed from queryString
                        newState.OverlappingEventList[evtIndex].AssetName = event.AssetName;
                        newState.OverlappingEventList[evtIndex].MeterName = event.MeterName;
                        newState.OverlappingEventList[evtIndex].StartTime = new Date(event.StartTime + "Z").getTime();
                        newState.OverlappingEventList[evtIndex].EndTime = new Date(event.EndTime + "Z").getTime();
                        newState.OverlappingEventList[evtIndex].EventType = event.EventType;
                        newState.OverlappingEventList[evtIndex].Inception = event.Inception;
                        newState.OverlappingEventList[evtIndex].DurationEndTime = event.DurationEndTime;
                    }
                });
                return newState;
            }),
            () =>
                setContextState(c => {
                    const newState = _.cloneDeep(c);
                    newState.OverlappingLoading = 'Error';
                    return newState;
                })
        );
    }, [evt.Context.EventID]);

    // Set context
    dataRef.current = {
        SelectOverlappingEvents,
        SelectDisplayed,
        SelectPlotKeys,
        SelectListGraphs,
        SelectAnalytics,
        SelectData,
        SelectEnabled,
        SelectRelevantUnits,
        SelectEnabledUnits,
        SelectYLimits,
        SelectOverlappingYLimits,
        SelectLoading,
        SelectAutoUnits,
        SelectAxisSettings,
        SelectYLabels,
        SelectEventIDs,
        SelectFFTEnabled,
        SelectIsManual,
        SelectIsOverlappingManual,
        SelectOverlappingAutoUnits,
        SelectIsZoomed,
        SelectHoverPoints,
        SelectDeltaHoverPoints,
        SelectVPhases,
        SelectIPhases,
        SelectSelectedPoints,
        SelectFFTData,
        SelectEnabledPlots,
        SelectActiveUnit
    };

    functionRef.current = {
        SetTimeLimit,
        SetCycleLimit,
        SetFFTLimits,
        ResetZoom,
        SetZoomedLimits,
        SetUnit,
        EnableTrace,
        SetIsManual,
        SetSelectPoint,
        ClearSelectPoints,
        RemoveSelectPoints,
        SetManualLimits,
        AddPlot,
        RemovePlot,
        UpdateAnalyticPlot,
        EnableOverlappingEvent
    };

    return (
        <DataFunctionContext.Provider value={dispatch}>
            <DataContext.Provider value={selector}>
                {props.children}
            </DataContext.Provider>
        </DataFunctionContext.Provider>
    );
};

export default DataContext;
