//******************************************************************************************************
//  dataSlice.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  11/01/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { OpenSee } from '../global';
import * as _ from 'lodash';
import { AddRequest, AppendRequest } from '../Data/RequestHandler';
import { emptygraph, getData, getDetailedData } from '../Data/GraphLogic';
import { RootState } from './store';
import { defaultSettings } from '../defaults';
import { sortGraph } from '../Graphs/Utilities'

/*



export const { RemoveSelectPoints, ClearSelectPoints, SetManualLimits } = DataReducer.actions;

// #endregion

export const SelectOverlappingEvents = (graphType: OpenSee.graphType) => createSelector(
    (state: RootState) => state.Data.Plots,
    (state: RootState) => state.EventInfo.EventID,
    (plots, evtID) => {
        const filteredPlots = plots.filter(plot => plot.key.EventId !== evtID && plot.key.EventId !== -1 && plot.key.DataType === graphType).map(plot => plot.key)
        //order by eventID because we groupBy eventID in openSEE.tsx
        const sortedPlots = _.orderBy(filteredPlots, "EventId", "desc")
        return sortedPlots;
    })

export const SelectDisplayed = createSelector(
    (state: RootState) => state.Data.Plots,
    (plots) => ({
        Voltage: plots.some(p => p.key.DataType == 'Voltage'),
        Current: plots.some(p => p.key.DataType == 'Current'),
        TripCoil: plots.some(p => p.key.DataType == 'TripCoil'),
        Analogs: plots.some(p => p.key.DataType == 'Analogs'),
        Digitals: plots.some(p => p.key.DataType == 'Digitals')
    })
)

export const SelectPlotKeys = createSelector(
    (state: RootState) => state.Data.Plots,
    (state: RootState) => state.Settings.SinglePlot,
    (plots, singlePlot) => {
        let keys = plots.map(plot => plot.key)
        if (singlePlot)
            keys = keys.filter(key => key.EventId === -1)

        keys = _.uniq(keys)
        keys.sort(sortGraph)

        return keys?.length > 0 ? keys : []
    }
)

// Returns a List of keys for Plots that should be displayed.
export const SelectListGraphs = createSelector(
    (state: RootState) => state.Data.Plots,
    (state: RootState) => state.Settings.SinglePlot,
    (plots, singlePlot) => {
        let keys = plots.map(p => p.key)

        if (singlePlot) 
            return _.groupBy(keys.filter(item => item.EventId === -1), "EventId");
        
        return _.groupBy(keys.filter(item => item.EventId !== -1), "EventId");
    }
)

//Returns the DataType of plots that are Analytics
export const SelectAnalytics = createSelector(
    (state: RootState) => state.Data.Plots,
    (state: RootState) => state.EventInfo.EventID,
    (plots, evtID) => {
        const analytics = ['FirstDerivative', 'ClippedWaveforms', 'Frequency', 'HighPassFilter', 'LowPassFilter', 'MissingVoltage', 'OverlappingWave', 'Power', 'Impedance', 'Rectifier', 'RapidVoltage', 'RemoveCurrent', 'Harmonic', 'SymetricComp', 'THD', 'Unbalance', 'FaultDistance', 'Restrike', 'I2T'] as OpenSee.graphType[];
        let plotTypes = plots.filter(plot => plot.key.EventId === evtID && analytics.includes(plot.key.DataType)).map(plot => plot.key.DataType)

        plotTypes = _.uniq(plotTypes)

        if (plotTypes)
            return plotTypes
        else
            return []
    }
)

export const SelectData = (key: OpenSee.IGraphProps) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (state: OpenSee.IRootState) => state.Settings.SinglePlot,
    (plots, singlePlot) => {
        let plot = plots.find(item => item.key.DataType === key.DataType && item.key.EventId === key.EventId);
        let overlappingPlot = plots.find(item => item.key.DataType === key.DataType && item.key.EventId === -1)
        if (singlePlot)
            return overlappingPlot ? overlappingPlot.data : null
        return plot ? plot.data : null;
    }
);


export const SelectEnabled = (key: OpenSee.IGraphProps) =>
    createSelector(
        (state: OpenSee.IRootState) => state.Data.Plots,
        (plots) => {
            let plot = plots.find(item => item.key.DataType === key.DataType && item.key.EventId === key.EventId);

            if (plot)
                return plot.data.map(item => item.Enabled)
            else
                return []
        }
    );


export const SelectRelevantUnits = (key: OpenSee.IGraphProps) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (Plots) => {
        let units: OpenSee.Unit[] = [];

        // Filter relevant plots and collect units
        Plots.filter(plot => key.DataType === plot.key.DataType && key.EventId === plot.key.EventId).forEach(plot => {
            plot.data.forEach(data => {
                if (data.Unit) {
                    units.push(data.Unit);
                }
            });
        });

        //Make sure the primaryAxis is at the beginning of the array for plotting purposes..
        if (units.includes(getPrimaryAxis(key))) {
            units = units.filter(unit => unit !== getPrimaryAxis(key))
            units.unshift(getPrimaryAxis(key))
        }
        return _.uniq(units);
    }
);


export const SelectEnabledUnits = (key: OpenSee.IGraphProps) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (Plots) => {
        let units: OpenSee.Unit[] = [];
        const plot = Plots.find(plot => key.DataType === plot.key.DataType && key.EventId === plot.key.EventId)
        // Filter relevant plots and collect units
        if (plot) {
            plot.data.forEach(data => {
                if (data.Unit && data.Enabled) {
                    units.push(data.Unit);
                }
            });

            //Make sure the primaryAxis is at the beginning of the array
            if (units.includes(getPrimaryAxis(key))) {
                units = units.filter(unit => unit !== getPrimaryAxis(key))
                units.unshift(getPrimaryAxis(key))
            }
            return _.uniq(units);
        }
        else {
            return []
        }

    }
);


export const SelectYLimits = (key: OpenSee.IGraphProps) => {
    return createSelector(
        (state: OpenSee.IRootState) => state.Data,
        (data: OpenSee.IDataState) => {
            const plot = data.Plots.find(plot => plot.key.EventId === key.EventId && plot.key.DataType === key.DataType)
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
        });
}

export const SelectOverlappingYLimits = (graphType: OpenSee.graphType) => {
    return createSelector(
        (state: OpenSee.IRootState) => state.Data.Plots,
        (state: OpenSee.IRootState) => state.EventInfo.EventID,
        (plots, evtID) => {
            let overlappingPlots = plots.filter(plot => plot.key.EventId !== evtID && plot.key.DataType === graphType)

            let result = {};
            if (overlappingPlots.length > 0) {
                overlappingPlots.forEach(plot => {
                    let yLimits = {}
                    Object.keys(plot.yLimits).forEach(key => {
                        if (plot.isZoomed)
                            yLimits[key] = plot.yLimits[key].zoomedLimits;
                        else if (plot.yLimits[key].isManual && plot.yLimits[key].manualLimits)
                            yLimits[key] = plot.yLimits[key].manualLimits
                        else
                            yLimits[key] = plot.yLimits[key].dataLimits

                    })
                    result[plot.key.DataType] = yLimits
                })

                return result as OpenSee.IGraphCollection<[number, number]>;
            }

        });
}

export const SelectLoading = (key: OpenSee.IGraphProps) => {
    return (state: OpenSee.IRootState) => {
        const plot = state.Data.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
        if (plot)
            return plot.loading
    };
};


export const SelectAutoUnits = (key: OpenSee.IGraphProps) => {
    return (state: OpenSee.IRootState) => {
        let result = {};
        const plot = state.Data.Plots.find(plot => plot.key.EventId === key.EventId && plot.key.DataType === key.DataType)
        if (plot) {
            Object.keys(plot.yLimits).forEach(unit => {
                result[unit] = plot.yLimits[unit].isAuto
            })
            return result;
        }

    };
};

export const SelectAxisSettings = (key: OpenSee.IGraphProps) => {
    return (state: OpenSee.IRootState) => {
        const plot = state.Data.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
        return plot.yLimits;
    };
};


export const SelectYLabels = (key: OpenSee.IGraphProps) => {
    return (state: OpenSee.IRootState) => {
        let labels = {} as OpenSee.IUnitCollection<string>
        const plot = state.Data.Plots.find(plot => plot.key.DataType === key.DataType && plot.key.EventId === key.EventId);
        if (plot) {
            Object.keys(plot.yLimits).forEach(unit => {
                let short = defaultSettings.Units[unit].options[plot.yLimits[unit].current].short
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
    };
};


export const SelectEventIDs = (state: RootState) => {
    let ids = []
    ids.push(state.EventInfo.EventID)
    state.OverlappingEvents.EventList.forEach(evt => {
        if (evt.Selected)
            ids.push(evt.EventID)
    })

    const eventIDS = _.uniq(ids)
    return eventIDS
}

export const SelectFFTEnabled = (state: RootState) => {
    const keys = state.Data.Plots.filter(plot => plot.key.DataType === 'FFT')
    if (keys?.length > 0)
        return true
    else
        return false
}

export const SelectIsManual = (key: OpenSee.IGraphProps) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (plots) => {
        let plot = plots.find(p => p.key.DataType === key.DataType && p.key.EventId === key.EventId);
        let result = {};
        if (plot) {
            Object.keys(plot.yLimits).forEach(key => {
                result[key] = plot.yLimits[key].isManual;
            })
            return result as OpenSee.IUnitCollection<boolean>;
        }

    }
);

export const SelectIsOverlappingManual = (graphType: OpenSee.graphType) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (plots, evtID) => {
        let overlappingPlots = plots.filter(p => p.key.DataType === graphType && p.key.EventId !== evtID);
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
);


export const SelectOverlappingAutoUnits = (graphType: OpenSee.graphType) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (plots, evtID) => {
        let overlappingPlots = plots.filter(p => p.key.DataType === graphType && p.key.EventId !== evtID);
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
);

export const SelectIsZoomed = (key: OpenSee.IGraphProps,) => createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots,
    (plots) => {
        let plot = plots.find(p => p.key.DataType === key.DataType && p.key.EventId === key.EventId);
        return plot?.isZoomed;
    }
);


// For tooltip
export const SelectHoverPoints = (hover: [number, number]) => createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {
        let result: OpenSee.IPoint[] = [];

        let filteredPlots = state.Plots.filter(plot => plot.key.EventId === eventID)

        filteredPlots.forEach(plot => {
            if (plot.data.length === 0) return;

            let dataIndex = getIndex(hover[0], plot.data[0].DataPoints);
            if (isNaN(dataIndex))
                return;


            result = result.concat(...plot.data.filter(d => d.Enabled).map(d => {
                dataIndex = getIndex(hover[0], d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: defaultSettings.Units[d.Unit].options[plot.yLimits[d.Unit].current],
                    Value: (dataIndex > (d.DataPoints.length - 1) ? NaN : d.DataPoints[dataIndex][1]),
                    Name: GetDisplayName(d, plot.key.DataType),
                    BaseValue: d.BaseValue,
                    Time: 0,
                }
            }))
        })
        return result;
    });


export const SelectDeltaHoverPoints = (hover: [number, number]) => createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {
        let result: OpenSee.IPoint[] = [];

        let filteredPlots = state.Plots.filter(plot => plot.key.EventId === eventID)

        filteredPlots.forEach(plot => {
            const selectedData = plot.selectedIndixes;
            if (plot.data.length === 0) return;

            let dataIndex = getIndex(hover[0], plot.data[0].DataPoints);
            if (isNaN(dataIndex))
                return;

            result = result.concat(...plot.data.filter(d => d.Enabled).map(d => {
                dataIndex = getIndex(hover[0], d.DataPoints);
                return {
                    Color: d.Color,
                    Unit: defaultSettings.Units[d.Unit].options[plot.yLimits[d.Unit].current],
                    Value: (dataIndex > (d.DataPoints.length - 1) ? NaN : d.DataPoints[dataIndex][1]),
                    Name: GetDisplayName(d, plot.key.DataType),
                    PrevValue: (selectedData.length > 0 ? ((selectedData[selectedData.length] - 1) > d.DataPoints.length ? NaN : d.DataPoints[selectedData[selectedData.length - 1]][1]) : NaN),
                    BaseValue: d.BaseValue,
                    Time: (selectedData.length > 0 ? ((selectedData[selectedData.length] - 1) > d.DataPoints.length ? NaN : d.DataPoints[selectedData[selectedData.length - 1]][0]) : NaN),
                }

            }))
        })
        return result;
    });



// For vector
export const SelectVPhases = (hover: [number, number]) => createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {

        let plot = state.Plots.find(plot => plot.key.DataType == 'Voltage' && plot.key.EventId == eventID);
        if (!plot || plot.data.length === 0 || !plot.data.some(d => d.LegendHorizontal == 'Ph')) return [];

        const activeUnits = plot.yLimits;

        let asset = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendGroup));
        let phase = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendVertical));

        let phaseData = plot.data.find(item => item.LegendHorizontal == 'Ph');
        let pointIndex = phaseData ? getIndex(hover[0], phaseData.DataPoints) : -1;

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

                    result.push({
                        Color: phaseChannel.Color,
                        Unit: defaultSettings.Units.Voltage.options[activeUnits["Voltage"].current],
                        PhaseUnit: defaultSettings.Units.Angle.options[activeUnits["Angle"].current],
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
);


export const SelectIPhases = (hover: [number, number]) => createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {
        let plot = state.Plots.find(p => p.key.DataType == 'Current' && p.key.EventId == eventID);
        if (!plot || plot.data.length === 0 || !plot.data.some(d => d.LegendHorizontal == 'Ph')) return [];

        const activeUnits = plot.yLimits;
        let asset = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendGroup));
        let phase = _.uniq(plot.data.filter(item => item.Enabled).map(item => item.LegendVertical));


        let pointIndex = getIndex(hover[0], plot.data.find(item => item.LegendHorizontal == 'Ph').DataPoints);
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
                        Unit: defaultSettings.Units.Current.options[activeUnits["Current"].current],
                        PhaseUnit: defaultSettings.Units.Angle.options[activeUnits["Angle"].current],
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
);

// For Accumulated Point widget
export const SelectSelectedPoints = createSelector(
    (state: OpenSee.IRootState) => state.EventInfo.EventID,
    (state: OpenSee.IRootState) => state.Data,
    (eventID, state) => {
        let result: OpenSee.IPointCollection[] = [];

        state.Plots.forEach(plot => {
            if (plot.key.EventId != eventID) return;
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
    })


// For FFT Table
export const SelectFFTData = createSelector(
    (state: OpenSee.IRootState) => state.Data.Plots.find(plot => plot.key.DataType === "FFT" && plot.key.EventId === state.EventInfo.EventID),
    (fftPlot) => {
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
                    PhaseUnit: activeUnits["Angle"].options[fftPlot.yLimits["Angle"].current],
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
    })
    */