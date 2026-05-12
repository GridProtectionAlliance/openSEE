//******************************************************************************************************
//  SettingWindow.tsx - Gbtc
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
//  06/08/2020 - C. Lackner
//       Generated original version of source code.
//
//  01/26/2024 - Preston Crawford
//       Cleaned up layout and introduced manual time&y limits
//******************************************************************************************************
import * as React from 'react';
import moment from 'moment';
import * as _ from 'lodash';
import { OpenSee } from '../../global';
import {
    SelectColor, SetColor, SelectTimeUnit, SelectDefaultTraces, SelectPlotMarkers, SetPlotMarkers,
    SetDefaultTrace, SelectVTypeDefault, SetDefaultVType, SelectSinglePlot, SelectOverlappingWaveTimeUnit,
    SetOverlappingWaveTimeUnit, SetTimeUnit
} from '../../store/settingSlice';
import { GetDisplayLabel } from '../../Graphs/Utils/Utilities';
import { defaultSettings, TimeUnitOptions } from '../../defaults';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { DatePicker, Select, Input, CheckBox, ColorPicker, RadioButtons } from '@gpa-gemstone/react-forms';
import { PlotDataStateContext } from '../../Context/PlotDataContext';
import { PlotStateStateContext, PlotStateActionContext } from '../../Context/PlotStateContext';
import EventContext from '../../Context/EventContext';
import { toPlotKey } from '../../Context/PlotKeys';
import { selectYLimits, selectOverlappingPlotKeys } from '../../PlotSelectors';
import AxisUnitSelector from './AxisUnitSelector';
import TimeUnitSelector from './TimeUnitSelector';

interface ILimits {
    min: number,
    max: number
}

interface IProps extends OpenSee.IGraphProps {
    scrollOffset: number
}

//TODO: switch radio buttons out for gemstone radio buttons
//  In addition to that do a quick search for other places that should be doing the same

const PlotCard = (props: IProps) => {
    const dispatch = useAppDispatch();
    const singlePlot = useAppSelector(SelectSinglePlot);
    const colors = useAppSelector(SelectColor);
    const overlapWaveTimeUnit = useAppSelector(SelectOverlappingWaveTimeUnit);

    const { plots: plotData } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);
    const evt = React.useContext(EventContext);

    const pk = toPlotKey(props);
    const meta = plotState.meta[pk];
    const data = plotData[pk] ?? [];

    // Derived values from meta
    const axisSettings = meta?.yLimits;
    const yLimits = React.useMemo(() => meta ? selectYLimits(meta) : {} as OpenSee.IUnitCollection<[number, number]>, [meta]);

    const overlappingKeys = React.useMemo(
        () => selectOverlappingPlotKeys(plotState.meta, evt.Context.EventID, props.DataType),
        [plotState.meta, evt.Context.EventID, props.DataType]
    );

    const [curLimits, setCurLimits] = React.useState<OpenSee.IUnitCollection<ILimits> | null>(null);
    const [overlappingLimits, setOverlappingLimits] = React.useState<Record<string, Record<string, ILimits>> | null>(null);
    const [limitsPayload, setLimitsPayload] = React.useState<{ axis: OpenSee.Unit, limits: [number, number], key: OpenSee.IGraphProps, auto: boolean, factor: number } | null>(null);
    const [valid, setValid] = React.useState<boolean>(true);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const colorSettings: OpenSee.Color[] = _.uniq(data.map(item => item.Color as OpenSee.Color));
    const unitSettings: OpenSee.Unit[] = _.uniq(data.map(item => item.Unit));

    React.useEffect(() => {
        if (limitsPayload?.limits) {
            const timeOutId = setTimeout(() => {
                if (limitsPayload.limits[0] < limitsPayload.limits[1]) {
                    setValid(true);
                    const d = plotData[toPlotKey(limitsPayload.key)] ?? [];
                    stateActions.SetManualLimits(limitsPayload.limits, limitsPayload.key, limitsPayload.axis, limitsPayload.auto, d, limitsPayload.factor);
                } else {
                    setValid(false);
                }
            }, 1500);
            setLimitsPayload(null);
            return () => clearTimeout(timeOutId);
        }
    }, [curLimits]);

    const handleLimitChange = (axis: OpenSee.Unit, limits: [number, number], key: OpenSee.IGraphProps, auto: boolean) => {
        let factor = 1;
        if (axisSettings && defaultSettings.Units[axis].options[axisSettings[axis].current].factor !== 1)
            factor = defaultSettings.Units[axis].options[axisSettings[axis].current].factor;

        setCurLimits(prevLimits => ({ ...(prevLimits ?? {} as OpenSee.IUnitCollection<ILimits>), [axis]: { min: limits[0], max: limits[1] } }));
        setLimitsPayload({ axis, limits, key, auto, factor });
    };

    const handleSetOverlapTimeUnit = React.useCallback((index: number) => dispatch(SetOverlappingWaveTimeUnit(index)), [dispatch]);

    const handleUnitChange = React.useCallback((unit: OpenSee.Unit, index: number, key: OpenSee.IGraphProps) => {
        const auto = defaultSettings.Units[unit].options[index].factor === 0;
        stateActions.SetUnit(unit, index, auto, key, plotData);
    }, [stateActions, plotData]);

    const getLabel = (unit: OpenSee.Unit, key?: OpenSee.IGraphProps) => {
        if (!axisSettings) return '';

        if (key) {
            const overMeta = plotState.meta[toPlotKey(key)];
            if (overMeta?.yLimits[unit]?.isAuto && overMeta?.yLimits[unit]?.isManual) {
                const opts = defaultSettings.Units[unit].options;
                const idx = opts.findIndex(item => item.factor === 1);
                return opts[idx].short;
            }
            return defaultSettings.Units[unit].options[axisSettings[unit].current].short;
        }

        if (axisSettings[unit]?.isManual && axisSettings[unit]?.isAuto) {
            const opts = defaultSettings.Units[unit].options;
            const idx = opts.findIndex(item => item.factor === 1);
            return opts[idx].short;
        }
        return defaultSettings.Units[unit].options[axisSettings[unit].current].short;
    };

    // Sync local limits state when context limits change
    React.useEffect(() => {
        if (!axisSettings) return;
        const limits = {};
        Object.keys(yLimits).forEach(unit => {
            if (axisSettings[unit]?.isManual || false) {
                let factor = 1;
                if (defaultSettings.Units[unit].options[axisSettings[unit].current].factor !== 1)
                    factor = defaultSettings.Units[unit].options[axisSettings[unit].current].factor;
                limits[unit] = {
                    min: yLimits[unit]?.[0],
                    max: yLimits[unit]?.[1]
                };
                if (axisSettings[unit]?.isAuto) {
                    limits[unit].min = limits[unit].min / factor;
                    limits[unit].max = limits[unit].max / factor;
                }
            }
        });
        setCurLimits(limits as OpenSee.IUnitCollection<ILimits>);

        // Overlapping limits
        if (overlappingKeys.length > 0) {
            const overLimits: Record<string, Record<string, ILimits>> = {};
            overlappingKeys.forEach(oKey => {
                const oPk = toPlotKey(oKey);
                const oMeta = plotState.meta[oPk];
                if (!oMeta) return;
                const oYLimits = selectYLimits(oMeta);
                const l: Record<string, ILimits> = {};
                Object.keys(oYLimits).forEach(unit => {
                    if (oMeta.yLimits[unit]?.isManual) {
                        l[unit] = { min: oYLimits[unit]?.[0], max: oYLimits[unit]?.[1] };
                    }
                });
                overLimits[oKey.DataType] = l;
            });
            setOverlappingLimits(overLimits);
        }
    }, [yLimits, overlappingKeys, axisSettings]);

    if (!meta || !axisSettings) 
        return null;

    return (
        <div className="card">
            <div className="card-header" id={"header-" + props.DataType} onClick={() => setIsOpen(prev => !prev)}>
                <h2 className="mb-0">
                    <button className="btn btn-link btn-block text-left" type="button">
                        {GetDisplayLabel(props.DataType)} Settings
                    </button>
                </h2>
            </div>
            <div className={`collapse ${isOpen ? 'show' : ''}`}>
                <div className="card-body">
                    {unitSettings.map(item => (
                        <fieldset key={item} className="border" style={{ padding: '10px', height: '100%', width: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>{item}</legend>
                            <div className="form-row">
                                <div className="col-6">
                                    <AxisUnitSelector
                                        label={item as string}
                                        setter={(index) => handleUnitChange(item, index, props)} unitType={item}
                                        axisSetting={axisSettings[item]}
                                    />
                                </div>
                                <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                    <input className="form-check-input" type="radio" checked={!axisSettings[item]?.isManual} onChange={(e) => stateActions.SetIsManual(props, item, !e.target.checked)} />
                                    <label className="form-check-label" style={{ fontSize: '0.8rem' }}>Auto Limits</label>
                                </div>
                                <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                    <input className="form-check-input" type="radio" checked={axisSettings[item]?.isManual} onChange={(e) => stateActions.SetIsManual(props, item, e.target.checked)} />
                                    <label className="form-check-label" style={{ fontSize: '0.8rem' }}>Manual Limits</label>
                                </div>
                            </div>

                            {axisSettings[item]?.isManual && (
                                <div className="form-row" style={{ marginTop: '10px', marginLeft: 0 }}>
                                    <div className="col-6">
                                        <Input<ILimits>
                                            Record={curLimits?.[item] ?? { min: 0, max: 1 }}
                                            Field={'min'}
                                            Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], props, axisSettings[item]?.isAuto ?? false)}
                                            Valid={() => valid}
                                            Label={`${item} Min [${getLabel(item)}]`} Type={'number'}
                                            Help={axisSettings[item]?.isAuto ? 'When Auto Unit is selected manual limits are in the base unit (e.g., volts)' : undefined}
                                            Feedback={"Minimum limit can not be greater than Maximum limit"}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <Input<ILimits>
                                            Record={curLimits?.[item] ?? { min: 0, max: 1 }}
                                            Field={'max'}
                                            Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], props, axisSettings[item]?.isAuto ?? false)}
                                            Valid={() => valid} Label={`${item} Max [${getLabel(item)}]`}
                                            Type={'number'}
                                            Help={axisSettings[item]?.isAuto ? 'When Auto Unit is selected manual limits are in the base unit (e.g., volts)' : undefined}
                                            Feedback={"Minimum limit can not be greater than Maximum limit"}
                                        />
                                    </div>
                                </div>
                            )}

                            {overlappingKeys.length > 0 && !singlePlot ?
                                overlappingKeys.map((key, idx) => {
                                    const oMeta = plotState.meta[toPlotKey(key)];
                                    return (
                                        <div key={idx} className="form-row" style={{ marginTop: '10px', marginLeft: 0 }}>
                                            <div className="col-6">
                                                <p style={{ marginTop: '10px' }}>Overlapping Event {idx + 1}</p>
                                            </div>
                                            <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                                <input className="form-check-input" type="radio" checked={!oMeta?.yLimits[item]?.isManual} onChange={(e) => stateActions.SetIsManual(key, item, !e.target.checked)} />
                                                <label className="form-check-label" style={{ fontSize: '0.8rem' }}>
                                                    Auto Limits
                                                </label>
                                            </div>
                                            <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                                <input className="form-check-input" type="radio" checked={oMeta?.yLimits[item]?.isManual} onChange={(e) => stateActions.SetIsManual(key, item, e.target.checked)} />
                                                <label className="form-check-label" style={{ fontSize: '0.8rem' }}>
                                                    Manual Limits
                                                </label>
                                            </div>
                                            {oMeta?.yLimits[item]?.isManual && (
                                                <div className="form-row" style={{ marginLeft: '5px' }}>
                                                    <div className="col-6">
                                                        <Input<ILimits>
                                                            Record={overlappingLimits?.[key.DataType]?.[item] ?? { min: 0, max: 1 }}
                                                            Field={'min'}
                                                            Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], key, oMeta?.yLimits[item]?.isAuto ?? false)}
                                                            Valid={() => valid}
                                                            Label={`${item} Min [${getLabel(item, key)}]`}
                                                            Type={'number'}
                                                            Feedback={"Minimum limit can not be greater than Maximum limit"}
                                                        />
                                                    </div>
                                                    <div className="col-6">
                                                        <Input<ILimits>
                                                            Record={overlappingLimits?.[key.DataType]?.[item] ?? { min: 0, max: 1 }}
                                                            Field={'max'}
                                                            Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], key, oMeta?.yLimits[item]?.isAuto ?? false)}
                                                            Valid={() => valid}
                                                            Label={`${item} Max [${getLabel(item, key)}]`}
                                                            Type={'number'}
                                                            Feedback={"Minimum limit can not be greater than Maximum limit"}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : null}
                        </fieldset>
                    ))}

                    {colorSettings.length > 0 ?
                        <fieldset className="border p-2" style={{ padding: '10px', height: '100%', width: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Colors:</legend>
                            <div className="row">
                                {colorSettings.map((c, i) =>
                                    <div className="col-3" key={i}>
                                        <ColorPicker<OpenSee.IColorCollection>
                                            Record={colors}
                                            Field={c}
                                            Label={c as string}
                                            Setter={(col) => dispatch(SetColor({ color: c, value: col[c] }))}
                                            Style={{ background: colors[c], marginBottom: 5 }}
                                        />
                                    </div>)}
                            </div>
                        </fieldset> : null}

                    {props.DataType === "OverlappingWave" ?
                        <fieldset className="border" style={{ padding: '10px', height: '100%', width: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Time:</legend>
                            <div className="row">
                                <div className="col-12">
                                    <TimeUnitSelector
                                        label={"Time"}
                                        timeUnitIndex={overlapWaveTimeUnit}
                                        setter={handleSetOverlapTimeUnit}
                                        overlappingWave={true}
                                    />
                                </div>
                            </div>
                        </fieldset>
                        : null}
                </div>
            </div>
        </div>
    );
};

export default PlotCard;