//******************************************************************************************************
//  SettingWindow.tsx - Gbtc
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
//  06/08/2020 - C. Lackner
//       Generated original version of source code.
//
//  01/26/2024 - Preston Crawford
//       Cleaned up layout and introduced manual time&y limits
//******************************************************************************************************

import * as React from 'react';
import moment from 'moment'
import * as _ from 'lodash';
import { BlockPicker } from 'react-color';
import { OpenSee } from '../global';
import {
    SelectData, SelectPlotKeys, SetUnit, SelectIsManual, SetIsManual, SelectOverlappingEvents,
    SelectYLimits, SetManualLimits, SelectStartTime, SelectEndTime, 
    SetTimeLimit, SelectAutoUnits, SelectIsOverlappingManual,
    SelectOverlappingYLimits, SelectAxisSettings, SelectOverlappingAutoUnits, 
} from '../store/dataSlice';

import {
    SelectColor, SetColor, SelectTimeUnit, SelectDefaultTraces, SelectPlotMarkers, SetPlotMarkers,
    SetDefaultTrace, SelectVTypeDefault, SetDefaultVType, SelectSinglePlot, SelectOverlappingWaveTimeUnit,
    SetOverlappingWaveTimeUnit, SetTimeUnit
} from '../store/settingSlice';

import { SelectEventInfo, SelectEventID } from '../store/eventInfoSlice'

import { GetDisplayLabel } from '../Graphs/Utilities';
import { defaultSettings } from '../defaults';
import { useAppDispatch, useAppSelector } from '../hooks';

import { DatePicker, Input, CheckBox } from '@gpa-gemstone/react-forms'


interface TimeLimit {
    start: string,
    end: string
}

const SettingsWidget = (props) => {
    const dispatch = useAppDispatch();
    const plotKeys = useAppSelector(SelectPlotKeys);
    const defaultTraces = useAppSelector(SelectDefaultTraces);
    const defaultVtype = useAppSelector(SelectVTypeDefault);
    const plotMarkers = useAppSelector(SelectPlotMarkers);

    const startTime = useAppSelector(SelectStartTime);
    const endTime = useAppSelector(SelectEndTime);

    const timeUnit = useAppSelector(SelectTimeUnit);
    const eventInfo = useAppSelector(SelectEventInfo);
    const evtID = useAppSelector(SelectEventID);
    const originalStartTime = new Date(eventInfo?.EventDate + "Z").getTime()
    const inceptionOffset = (eventInfo?.Inception - originalStartTime)

    const [scrollOffset, setScrollOffset] = React.useState<number>(0);
    const [formattedTime, setFormattedTime] = React.useState<TimeLimit>({ start: '', end: '' });
    const [currentDate, setCurrentDate] = React.useState<{ start: Date, end: Date }>({ start: new Date(), end: new Date() });
    const [valid, setValid] = React.useState<boolean>(true)
    
    const handleTimeUnitChange = (index: number) => {
        let auto = defaultSettings.TimeUnit.options[index].factor === undefined ? true : false;
        dispatch(SetTimeUnit({ index: index, auto: auto }))
    }

    const handleDateChange = (time, start: boolean) => {
        let newDate: Date;
        if (start)
            newDate = new Date(startTime);
        else
            newDate = new Date(endTime);

        if (time && time !== 'Invalid date') { 
            let [hours, minutes, seconds] = time.split(':');
            let milliseconds = '';
            [seconds, milliseconds] = seconds.split('.')
            newDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), parseInt(milliseconds))

            if (start) {
                if (newDate.getTime() < endTime) {
                    setValid(true)
                    setFormattedTime({ start: moment(newDate).format('HH:mm:ss.SSS'), end: moment(new Date(endTime)).format('HH:mm:ss.SSS') })
                    setCurrentDate({ start: newDate, end: new Date(endTime) })
                }
                else
                    setValid(false)
            }
            else {
                if (newDate.getTime() > startTime) {
                    setFormattedTime({ start: moment(new Date(startTime)).format('HH:mm:ss.SSS'), end: moment(newDate).format('HH:mm:ss.SSS') })
                    setCurrentDate({ start: new Date(startTime), end: newDate })
                    setValid(true)
                }
                else 
                    setValid(false)
            }

        }

    };

   React.useEffect(() => {
        const newStart = currentDate.start.getTime();
        const newEnd = currentDate.end.getTime();

        if (newStart !== startTime || newEnd !== endTime && valid ) {
            const timeOutId = setTimeout(() => {
                dispatch(SetTimeLimit({ start: newStart, end: newEnd }));
            }, 1500);

            return () => clearTimeout(timeOutId);
        }
    }, [formattedTime, currentDate, dispatch]);

    React.useEffect(() => {
        const newFormattedTime = {
            start: moment(new Date(startTime)).format('HH:mm:ss.SSS'),
            end: moment(new Date(endTime)).format('HH:mm:ss.SSS')
        };

        setFormattedTime(newFormattedTime);

    }, [startTime, endTime]);

    React.useEffect(() => {
        const handleScroll = () => {
            let offset = document.getElementById("settingScrollContainer").scrollTop;
                setScrollOffset(offset);
        }
        document.getElementById("settingScrollContainer").addEventListener("scroll", handleScroll, { passive: true });
        return () => { if (document.getElementById("settingScrollContainer") != null) document.getElementById("settingScrollContainer").removeEventListener("scroll", handleScroll); }
    }, [props])

    return (
        <div className="d-flex flex-column" style={{ marginTop: '10px', width: '100%', height: '100%', padding: '10px' }}>
            <div id="settingScrollContainer" className=" overflow-auto" style={{ height: '100%', zIndex: 1001 }}>
                <div className="accordion" id="panelSettings">
                    <div className="card" style={{ overflowY: 'auto', height: '100%' }}>
                        <div className="card-header" id="header-general">
                            <h2 className="mb-0">
                                <button className="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collaps-general" aria-expanded="true" aria-controls="collaps-general">
                                    General Settings
                                </button>
                            </h2>
                        </div>
                        <div id="collaps-general" className="collapse show" aria-labelledby="header-general" data-parent="#panelSettings" style={{ overflowY: 'auto', height: '100%' }}>
                            <div className="card-body" style={{ overflowY: 'auto', height: '100%' }}>
                                <fieldset className="border p-2">
                                    <legend>Default Traces (on Loading):</legend>
                                    <div className="form-row" style={{marginBottom: '10px'}}>
                                        <div className="col-auto form-check form-check-inline mr-0">
                                            <CheckBox
                                                Record={defaultTraces}
                                                Field={'W'}
                                                Setter={(item) => dispatch(SetDefaultTrace({ ...defaultTraces, W: item.W }))}
                                                Label={"WaveForm"}
                                            />
                                        </div>
                                        <div className="col-auto form-check form-check-inline mr-0">
                                            <CheckBox
                                                Record={defaultTraces}
                                                Field={'Pk'}
                                                Setter={(item) => dispatch(SetDefaultTrace({ ...defaultTraces, Pk: item.Pk }))}
                                                Label={"Peak"}
                                            />
                                    </div>
                                        <div className="col-auto form-check form-check-inline mr-0">
                                            <CheckBox
                                                Record={defaultTraces}
                                                Field={'RMS'}
                                                Setter={(item) => dispatch(SetDefaultTrace({ ...defaultTraces, RMS: item.RMS }))}
                                                Label={"RMS"}
                                            />
                                </div>
                                        <div className="col-auto form-check form-check-inline mr-0">
                                            <CheckBox
                                                Record={defaultTraces}
                                                Field={'Ph'}
                                                Setter={(item) => dispatch(SetDefaultTrace({ ...defaultTraces, Ph: item.Ph }))}
                                                Label={"Phase"}
                                            />
                                                </div>
                                            </div>
                                    <div className="form-row">
                                        <div className="col-auto form-check form-check-inline mr-0">
                                            <div className="form-check">
                                            <input type="radio" checked={defaultVtype === 'L-L'} onChange={() => {
                                                if (defaultVtype == 'L-N')
                                                    dispatch(SetDefaultVType('L-L'))
                                            }} />
                                                <label className="form-check-label" >Line to Line</label>
                                                </div>
                                            </div>
                                        <div className="col-auto form-check form-check-inline mr-0">
                                            <div className="form-check">

                                            <input type="radio" checked={defaultVtype === 'L-N'} onChange={() => {
                                                if (defaultVtype == 'L-L')
                                                    dispatch(SetDefaultVType('L-N'))
                                            }} />
                                                <label className="form-check-label" >Line to Neutral</label>
                                                </div>
                                        </div>
                                    </div>
                                </fieldset>
                                <fieldset className="border p-2">
                                    <legend>Time:</legend>
                                    <div className="form-row">
                                        <div className="col-12">
                                            {props.DataType != 'FFT' ? <TimeUnitSelector label={"Time"} timeUnitIndex={timeUnit.current} setter={index => handleTimeUnitChange(index)} /> : null}
                                        </div>
                                    </div>
                                            </div>
                                        </div> :
                                        <div className="form-row" style={{ marginTop: '10px' }}>
                                            <div className="col-6">
                                            <DatePicker<TimeLimit> Record={formattedTime} Format={"HH:mm:ss.SSS"} Field={'start'}
                                                Setter={(e) => {
                                                    handleDateChange(e.start, true)
                                                }}
                                                Label={"Start Time"}
                                                Accuracy={'millisecond'}
                                                Valid={() => valid}
                                                Type={'time'}
                                                Feedback={"Start Time can not be greater than End Time"}
                                            />
                                            </div>

                                            <div className="col-6">
                                            <DatePicker<TimeLimit> Record={formattedTime} Format={"HH:mm:ss.SSS"} Field={'end'}
                                                Setter={(e) => {
                                                    handleDateChange(e.end, false)
                                                }}
                                                Label={"End Time"}
                                                Valid={() => valid}
                                                Type={'time'}
                                                Accuracy={'millisecond'}
                                                Feedback={"Start Time can not be greater than End Time"}
                                            />
                                                    </div>
                                                    </div>

                                    </fieldset>

                                    </div>

                                </div>
                            </div>

                    {list.map((item, index) => <PlotCard key={index + item.DataType} scrollOffset={scrollOffset} {...item} />)}
                   
                </div>
            </div>
       </div>
    );
}

export default SettingsWidget;

export const ColorButton = (props: { label: string, statesetter: (col: string) => void, color: string, scrollOffset: number }) => {
    const [displayColorPicker, setDisplayColorPicker] = React.useState<boolean>(false);

    const popover: React.CSSProperties =
    {
        position: "absolute",
        zIndex: 1010,
    }

    function updateColor(color, event) {
        props.statesetter(color.hex);
        setDisplayColorPicker(false)
    };

        return (
            <div style={{ margin: ' 5px 10px 5px 10px' }}>
                <button className="btn btn-primary" onClick={() => setDisplayColorPicker(!displayColorPicker)} style={{ backgroundColor: props.color }}>{props.label}</button>
                {displayColorPicker ? <div style={popover}>
                    <div style={{ position: 'fixed', transform: `translate(0px,-${props.scrollOffset}px)` }}>
                        <BlockPicker onChangeComplete={updateColor} color={props.color} triangle={"hide"} colors={defaultSettings.ColorSelection} />
                    </div>
                </div> : null}
            </div>
        )
    
}

export const AxisUnitSelector = (props: { label: string, setter: (index: number) => void, unitType: OpenSee.Unit, axisSetting: OpenSee.IAxisSettings }) => {
    let entries;
    let buttonLabel;

    entries = defaultSettings.Units[props.unitType].options.map((option, index) =>
        <a key={"option-" + index} className="dropdown-item" style={{cursor: 'default'}} onClick={() => { props.setter(index) }}> {option.label} </a>
    )
    if (props.axisSetting.isAuto)
        buttonLabel = props.label + " [auto]"
    else
        buttonLabel = props.label + " [" + defaultSettings.Units[props.unitType].options[props.axisSetting.current].short + "]"

    

    return (
        <div className="btn-group dropright" >
            <button type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {buttonLabel}
            </button>
            <div className="dropdown-menu">
                {entries}
            </div>
        </div>
    );
        }

export const TimeUnitSelector = (props: { label: string, setter: (index: number) => void, timeUnit: OpenSee.IUnitSetting }) => {
    let entries;
    let buttonLabel;


    entries = defaultSettings.TimeUnit.options.map((option, index) =>
            <a key={"option-" + index} className="dropdown-item" style={{ cursor: 'default' }} onClick={() => { props.setter(index) }}> {option.label} </a>
    )
    buttonLabel = props.label + " [" + defaultSettings.TimeUnit.options[props.timeUnit.current].short + "]"

        return (
        <div className="btn-group dropright" >
                <button type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {buttonLabel}
                </button>
                <div className="dropdown-menu">
                    {entries}
                </div>
            </div>
        );    
}

interface ICardProps extends OpenSee.IGraphProps { scrollOffset: number }
interface ILimits {
    min: number,
    max: number
}

const PlotCard = (props: ICardProps) => {
    const dispatch = useAppDispatch();

    const SelectData = React.useMemo(() => selectData(props), [props]);
    const SelectYlimits = React.useMemo(() => SelectYLimits(props), [props]);
    const SelectOverLappingYLimits = React.useMemo(() => selectOverlappingYLimits(props.DataType), [props]);
    const singlePlot = useAppSelector(SelectSinglePlot);

    const yLimits = useAppSelector(SelectYlimits);
    const overlappingYLimits = useAppSelector(SelectOverLappingYLimits);
    const axisSettings = useAppSelector(SelectAxisSettings(props));

    const lineData = useAppSelector(SelectData);

    const colors = useAppSelector(SelectColor);
    const overlappingKeys = useAppSelector(SelectOverlappingEvents(props.DataType));


    const isManual = useAppSelector(selectIsManual(props));
    const isOverlappingManual = useAppSelector(selectIsOverlappingManual(props.DataType));
    const isOverlappingAuto = useAppSelector(selectOverlappingAutoUnits(props.DataType));

    const [curLimits, setCurLimits] = React.useState<OpenSee.IUnitCollection<ILimits>>(null);
    const [overlappingLimits, setOverlappingLimits] = React.useState<any>(null)

    const [limitsPayload, setLimitsPayload] = React.useState<{ axis: OpenSee.Unit, limits: [number, number], key: OpenSee.IGraphProps, auto: boolean, factor: number }>(null);

    const [valid, setValid] = React.useState<boolean>(true)

    const autoUnits = useAppSelector(selectAutoUnits(props));

    let colorSettings: OpenSee.Color[] = _.uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Color as OpenSee.Color));
    let unitSettings: OpenSee.Unit[] = _.uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Unit));

    React.useEffect(() => {
        if (limitsPayload?.limits) {
            const timeOutId = setTimeout(() => {

                if (limitsPayload.limits[0] < limitsPayload.limits[1]) {
                    setValid(true)
                    dispatch(SetManualLimits(limitsPayload))
                }
                else
                    setValid(false)
            }, 1500)
            setLimitsPayload(null);
            return () => clearTimeout(timeOutId)
        }
    }, [curLimits])


    const handleLimitChange = (axis: OpenSee.Unit, limits: [number, number], key: OpenSee.IGraphProps, auto: boolean) => {
        let limit = { min: null, max: null }
        let factor = 1
        if (defaultSettings.Units[axis].options[axisSettings[axis].current].factor !== 1)
            factor = defaultSettings.Units[axis].options[axisSettings[axis].current].factor

        limit.min = limits[0]
        limit.max = limits[1]
        setCurLimits(prevLimits => ({ ...prevLimits, [axis]: limit }));
        setLimitsPayload({ axis, limits, key, auto, factor })
    }

    const handleUnitChange = (unit: OpenSee.Unit, index: number, key: OpenSee.IGraphProps) => {
        let auto: boolean;
        if (defaultSettings.Units[unit].options[index].factor === 0)
            auto = true
        else
            auto = false
        dispatch(SetUnit({ unit: unit, value: index, auto: auto, key: key }))
    }


    let colCol1: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 0);
    let colCol2: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 1);
    let colCol3: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 2);
    let colCol4: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 3);

    const getLabel = (unit: OpenSee.Unit, key?: OpenSee.IGraphProps) => {

        if (key) {
            if (isOverlappingAuto?.[key.DataType]?.[unit] && isOverlappingManual?.[key.DataType]?.[unit]) {
                let settingOptions: OpenSee.iUnitOptions[] = defaultSettings.Units[unit].options
                let index = settingOptions.findIndex(item => item.factor === 1)
                return settingOptions[index].short
            }
            else 
                return defaultSettings.Units[unit].options[axisSettings[unit].current].short
        }

        else if (isManual[unit] && autoUnits[unit]) {
            let settingOptions: OpenSee.iUnitOptions[] = defaultSettings.Units[unit].options
            let index = settingOptions.findIndex(item => item.factor === 1)
            return settingOptions[index].short
        }
        else 
            return defaultSettings.Units[unit].options[axisSettings[unit].current].short
    }

    React.useEffect(() => {
        const limits = getYlimits(yLimits)
        setCurLimits(limits as OpenSee.IUnitCollection<ILimits>)

        if (overlappingYLimits) {
            let overlappingLimits = {}

            Object.keys(overlappingYLimits).forEach(graphType => {
                const yLimits = overlappingYLimits[graphType];
                const limits = getYlimits(yLimits, graphType);
                overlappingLimits[graphType] = limits
            });

            setOverlappingLimits(overlappingLimits)
        }


    }, [yLimits, overlappingYLimits])

    function getYlimits(yLimits, graphType?) {
        let limits = {}
        Object.keys(yLimits).forEach(unit => {
            limits[unit] = {};
            let factor = 1
            let autoUnit = autoUnits[unit]
            const overLappingManual = isOverlappingManual?.[graphType]?.[unit] === undefined ? false : isOverlappingManual[graphType][unit]

            if (overLappingManual || isManual[unit]) {
                if (defaultSettings.Units[unit].options[axisSettings[unit].current].factor !== 1)
                    factor = defaultSettings.Units[unit].options[axisSettings[unit].current].factor

                limits[unit].min = yLimits?.[unit][0]
                limits[unit].max = yLimits?.[unit][1]

                if (autoUnit) {
                    limits[unit].min = limits[unit].min / factor
                    limits[unit].max = limits[unit].max / factor
                }
            }

        })
        return limits
    }

    return (<div className="card">
        <div className="card-header" id={"header-" + props.DataType}>
            <h2 className="mb-0">
                <button className="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target={"#collaps-" + props.DataType} aria-expanded="true" aria-controls={"#collaps-" + props.DataType}>
                    {GetDisplayLabel(props.DataType)} Settings
                    </button>
            </h2>
        </div>

        <div id={"collaps-" + props.DataType} className="collapse" aria-labelledby={"header-" + props.DataType} data-parent="#panelSettings">
            <div className="card-body">
                {unitSettings.map(item => (
                            <fieldset className="border" style={{ padding: '10px', height: '100%', width: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>{item}</legend>
                                <div className="form-row" key={item}>
                                    <div className="col-6">
                                        <AxisUnitSelector label={item as string} setter={(index) => handleUnitChange(item, index, props)} unitType={item} axisSetting={axisSettings[item]} />
                                    </div>
                                    <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                        <input className="form-check-input" type="radio" checked={!isManual[item]} onChange={(e) => dispatch(SetIsManual({ key: props, unit: item, manual: !e.target.checked }))} />
                                        <label className="form-check-label" style={{ fontSize: '0.8rem' }}>Auto Limits</label>
                                    </div>
                                    <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                        <input className="form-check-input" type="radio" checked={isManual[item]} onChange={(e) => dispatch(SetIsManual({ key: props, unit: item, manual: e.target.checked }))} />
                                        <label className="form-check-label" style={{ fontSize: '0.8rem' }}>Manual Limits</label>
                                    </div>
                                </div>

                                {isManual[item] && (
                                    <>
                                        <div className="form-row" style={{ marginTop: '10px', marginLeft: 0 }}>
                                            <div className="col-6" style={{}}>
                                                <Input<ILimits> Record={curLimits?.[item] ? curLimits?.[item] : { min: 0, max: 1 }} Field={'min'} Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], props, autoUnits[item])}
                                                    Valid={() => valid}
                                                    Label={`${item} ` + `Min [${getLabel(item)}]`}
                                                    Type={'number'}
                                                    Help={autoUnits[item] ? 'When Auto Unit is selected manual limits are in the base unit (e.g., volts)' : undefined}
                                                    Feedback={"Minimum limit can not be greater than Maximum limit"}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <Input<ILimits> Record={curLimits?.[item] ? curLimits?.[item] : { min: 0, max: 1 }} Field={'max'} Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], props, autoUnits[item])}
                                                    Valid={() => valid}
                                                    Label={`${item} ` + `Max [${getLabel(item)}]`}
                                                    Type={'number'}
                                            Help={autoUnits[item] ? 'When Auto Unit is selected manual limits are in the base unit (e.g., volts)' : undefined}
                                                    Feedback={"Minimum limit can not be greater than Maximum limit"}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {overlappingKeys.length > 0 && !singlePlot ?
                                    overlappingKeys.map((key, idx) => (
                                        <div className="form-row" style={{ marginTop: '10px', marginLeft: 0 }}>
                                            <div className="col-6">
                                                <p style={{ marginTop: '10px' }}>Overlapping Event {idx + 1}</p>
                                            </div>
                                            <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                                <input className="form-check-input" type="radio" checked={!isOverlappingManual?.[key.DataType]?.[item]} onChange={(e) => dispatch(SetIsManual({ key: key, unit: item, manual: !e.target.checked }))} />
                                                <label className="form-check-label" style={{ fontSize: '0.8rem', }}>Auto Limits</label>
                                            </div>
                                            <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                                <input className="form-check-input" type="radio" checked={isOverlappingManual?.[key.DataType]?.[item]} onChange={(e) => dispatch(SetIsManual({ key: key, unit: item, manual: e.target.checked }))} />
                                                <label className="form-check-label" style={{ fontSize: '0.8rem' }}>Manual Limits</label>
                                            </div>

                                            {isOverlappingManual?.[key.DataType]?.[item] && (
                                                <>
                                                    <div className="form-row" style={{ marginLeft: '5px' }}>
                                                        <div className="col-6">
                                                            <Input<ILimits> Record={overlappingLimits?.[key.DataType]?.[item] ? overlappingLimits?.[key.DataType]?.[item] : { min: 0, max: 1 }} Field={'min'} Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], key, autoUnits[item])}
                                                                Valid={() => valid}
                                                                Label={`${item} ` + `Min [${getLabel(item, key)}]`}
                                                                Type={'number'}
                                                                Help={autoUnits[item] ? 'When Auto Unit is selected limits will be factored to the base unit' : undefined}
                                                                Feedback={"Minimum limit can not be greater than Maximum limit"}
                                                            />
                                                        </div>
                                                        <div className="col-6">
                                                            <Input<ILimits> Record={overlappingLimits?.[key.DataType]?.[item] ? overlappingLimits?.[key.DataType]?.[item] : { min: 0, max: 1 }} Field={'max'} Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], key, autoUnits[item])}
                                                                Valid={() => valid}
                                                                Label={`${item} ` + `Max [${getLabel(item, key)}]`}
                                                                Type={'number'}
                                                                Help={autoUnits[item] ? 'When Auto Unit is selected limits will be factored to the base unit' : undefined}
                                                                Feedback={"Minimum limit can not be greater than Maximum limit"}
                                                            />
                                </div>
                                </div>
                                                </>
                                            )}
                            </div>
                                    )) : null}

                        </fieldset>
                    </div>
                </div>
                ))}

                {colorSettings.length > 0 ?
                    <fieldset className="border p-2" style={{ padding: '10px', height: '100%', width: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Colors:</legend>
                            <div className="row">
                            <div className="col-3">
                                    {colCol1.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={c as string}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                            />)}
                                </div>
                            <div className="col-3">
                                    {colCol2.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={c as string}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>
                            <div className="col-3">
                                    {colCol3.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={c as string}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>
                            <div className="col-3">
                                    {colCol4.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={c as string}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>
                        </div>
                    </fieldset> : null}


                            </div>
                        </fieldset>
                    </div> 
                </div> : null}
            </div>
        </div>
    </div>);

}
