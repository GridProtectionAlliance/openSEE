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
import { OpenSee } from '../global';
import {
    SelectColor, SetColor, SelectTimeUnit, SelectDefaultTraces, SelectPlotMarkers, SetPlotMarkers,
    SetDefaultTrace, SelectVTypeDefault, SetDefaultVType, SelectSinglePlot, SelectOverlappingWaveTimeUnit,
    SetOverlappingWaveTimeUnit, SetTimeUnit
} from '../store/settingSlice';
import { GetDisplayLabel } from '../Graphs/Utilities';
import { defaultSettings, TimeUnitOptions } from '../defaults';
import { useAppDispatch, useAppSelector } from '../hooks';
import { DatePicker, Select, Input, CheckBox, ColorPicker, RadioButtons } from '@gpa-gemstone/react-forms';
import { DataContext, DataFunctionContext } from '../Context/DataContext';
import EventContext from '../Context/EventContext';

interface TimeLimit {
    start: string,
    end: string
}

const SettingsWidget = (props) => {
    const dispatch = useAppDispatch();

    const defaultTraces = useAppSelector(SelectDefaultTraces);
    const defaultVtype = useAppSelector(SelectVTypeDefault);
    const plotMarkers = useAppSelector(SelectPlotMarkers);

    const timeUnit = useAppSelector(SelectTimeUnit);

    const data = React.useContext(DataContext);
    const dataDispatch = React.useContext(DataFunctionContext);
    const evt = React.useContext(EventContext);

    const plotKeys = data.Selector.current.SelectPlotKeys();
    const originalStartTime = new Date(evt.Context.EventInfo?.EventDate + "Z").getTime();
    const inceptionOffset = ((evt.Context.EventInfo?.Inception ?? 0) - originalStartTime); //not sure what default should be if Inception is null/undefined..

    const [startMS, setStartMS] = React.useState<number>(data.Context.StartTime - originalStartTime);
    const [endMS, setEndMS] = React.useState<number>(data.Context.EndTime - originalStartTime);

    const [scrollOffset, setScrollOffset] = React.useState<number>(0);
    const [formattedTime, setFormattedTime] = React.useState<TimeLimit>({ start: '', end: '' });
    const [currentDate, setCurrentDate] = React.useState<{ start: Date, end: Date }>({ start: new Date(), end: new Date() });

    const [valid, setValid] = React.useState<boolean>(true)
    const [timeSinceChanged, setTimeSinceChanged] = React.useState<boolean>(false)

    const handleTimeChange = (time: number, start: boolean) => {
        if (start)
            setStartMS(time)
        else
            setEndMS(time)
        if (!timeSinceChanged)
            setTimeSinceChanged(true)
    }

    const handleTimeUnitChange = (index: number) => {
        dispatch(SetTimeUnit({ index: index }))
    }

    const handleDateChange = (time, start: boolean) => {
        let newDate: Date;
        if (start)
            newDate = new Date(data.Context.StartTime);
        else
            newDate = new Date(data.Context.EndTime);

        if (time && time !== 'Invalid date') {
            const timeString = time.split(':');
            const [hours, minutes] = [timeString[0], timeString[1]];
            let seconds = timeString[2];
            let milliseconds = '';
            [seconds, milliseconds] = seconds.split('.')
            newDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), parseInt(milliseconds))

            if (start) {
                if (newDate.getTime() < data.Context.EndTime) {
                    setValid(true)
                    setFormattedTime({ start: moment(newDate).format('HH:mm:ss.SSS'), end: moment(new Date(data.Context.EndTime)).format('HH:mm:ss.SSS') })
                    setCurrentDate({ start: newDate, end: new Date(data.Context.EndTime) })
                }
                else
                    setValid(false)
            }
            else {
                if (newDate.getTime() > data.Context.StartTime) {
                    setFormattedTime({ start: moment(new Date(data.Context.StartTime)).format('HH:mm:ss.SSS'), end: moment(newDate).format('HH:mm:ss.SSS') })
                    setCurrentDate({ start: new Date(data.Context.StartTime), end: newDate })
                    setValid(true)
                }
                else
                    setValid(false)
            }

        }

    };

    React.useEffect(() => {
        const startDate = new Date(data.Context.StartTime)
        const endDate = new Date(data.Context.EndTime)
        setFormattedTime({ start: moment(startDate).format('HH:mm:ss.SSS'), end: moment(new Date(endDate)).format('HH:mm:ss.SSS') })
        setCurrentDate({ start: startDate, end: endDate })
    }, [])

    //Effect to update start and end time whenever formattedTime changes
    React.useEffect(() => {
        const timeOutId = setTimeout(() => {

            if (TimeUnitOptions[timeUnit.current].short.includes('since')) {
                const isCycles = TimeUnitOptions[timeUnit.current].short.includes('cycles')
                const isSinceInception = TimeUnitOptions[timeUnit.current].short.includes('inception')
                const curStartMS = isCycles ? startMS / (60.0 / 1000.0) : startMS
                const curEndMS = isCycles ? endMS / (60.0 / 1000.0) : endMS
                const newStartTime = isSinceInception ? originalStartTime + curStartMS + inceptionOffset : originalStartTime + curStartMS
                const endOffset = curEndMS - (data.Context.EndTime - originalStartTime)
                const newEndTime = isSinceInception ? data.Context.EndTime + endOffset + inceptionOffset : data.Context.EndTime + endOffset


                if (newStartTime !== data.Context.StartTime && timeSinceChanged)
                    dataDispatch.Dispatch.current.SetTimeLimit(newStartTime, data.Context.EndTime);

                if (newEndTime !== data.Context.EndTime && timeSinceChanged)
                    dataDispatch.Dispatch.current.SetTimeLimit(data.Context.StartTime, newEndTime);
            }
        }, 1000);
        return () => clearTimeout(timeOutId);

    }, [startMS, endMS]);


    //Effect to update 
    React.useEffect(() => {
        const timeOutId = setTimeout(() => {
            if (TimeUnitOptions[timeUnit.current].short.includes('since')) {
                const isCycles = TimeUnitOptions[timeUnit.current].short.includes('cycles')
                const isSinceInception = TimeUnitOptions[timeUnit.current].short.includes('inception')
                const newStartMS = isSinceInception ? data.Context.StartTime - originalStartTime - inceptionOffset : data.Context.StartTime - originalStartTime
                const newEndMS = isSinceInception ? data.Context.EndTime - originalStartTime - inceptionOffset : data.Context.EndTime - originalStartTime

                if (isCycles) {
                    const newStartCycles = newStartMS * 60.0 / 1000.0
                    const newEndCycles = newEndMS * 60.0 / 1000.0

                    if (Math.abs(newStartCycles - startMS) > 0.1)
                        setStartMS(newStartCycles)
                    if (Math.abs(newEndCycles - endMS) > 0.1)
                        setEndMS(newEndCycles)
                }

                else {
                    setStartMS(newStartMS)
                    setEndMS(newEndMS)

                }

            }

        }, 1000);
        return () => clearTimeout(timeOutId);
    }, [data.Context.StartTime, data.Context.EndTime, timeUnit]);


    //Effect to update start and end time whenever formattedTime changes
    React.useEffect(() => {
        const newStart = currentDate.start.getTime();
        const newEnd = currentDate.end.getTime();

        if (newEnd - newStart !== data.Context.EndTime - data.Context.StartTime && valid && !TimeUnitOptions[timeUnit.current].short.includes("since")) {
            const timeOutId = setTimeout(() => {
                dataDispatch.Dispatch.current.SetTimeLimit(newStart, newEnd);
            }, 1000);

            return () => clearTimeout(timeOutId);
        }
    }, [formattedTime]);


    React.useEffect(() => {
        const handleScroll = () => {
            const offset = document.getElementById("settingScrollContainer")?.scrollTop;
            if (offset != null)
                setScrollOffset(offset);
        }

        const container = document.getElementById("settingScrollContainer");

        if (container != null) {
            container.addEventListener("scroll", handleScroll, { passive: true });
        }

        return () => {
            if (container != null)
                container.removeEventListener("scroll", handleScroll);
        }
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
                        <div className="card-body" style={{ overflowY: 'auto', height: '100%' }}>
                            <fieldset className="border p-2">
                                <legend style={{ fontSize: '1.2em' }}>Default Traces (on Loading):</legend>
                                <div className="form-row" style={{ marginBottom: '10px' }}>
                                    <div className="col-6 mr-0">
                                        <CheckBox
                                            Record={defaultTraces}
                                            Field={'W'}
                                            Setter={(item) => dispatch(SetDefaultTrace(item))}
                                            Label={"WaveForm"}
                                        />
                                    </div>
                                    <div className="col-6 mr-0">
                                        <CheckBox
                                            Record={defaultTraces}
                                            Field={'Pk'}
                                            Setter={(item) => dispatch(SetDefaultTrace(item))}
                                            Label={"Peak"}
                                        />
                                    </div>
                                </div>
                                <div className="form-row" style={{ marginBottom: '10px' }}>
                                    <div className="col-6 mr-0">
                                        <CheckBox
                                            Record={defaultTraces}
                                            Field={'RMS'}
                                            Setter={(item) => dispatch(SetDefaultTrace(item))}
                                            Label={"RMS"}
                                        />
                                    </div>
                                    <div className="col-6 mr-0">
                                        <CheckBox
                                            Record={defaultTraces}
                                            Field={'Ph'}
                                            Setter={(item) => dispatch(SetDefaultTrace(item))}
                                            Label={"Phase"}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <RadioButtons
                                        Record={{ defaultVtype }}
                                        Setter={(item) => dispatch(SetDefaultVType(item.defaultVtype))}
                                        Field="defaultVtype"
                                        Label=""
                                        Position="horizontal"
                                        Options={[
                                            {
                                                Label: "Line to Line",
                                                Value: 'L-L'
                                            },
                                            {
                                                Label: "Line to Neutral",
                                                Value: 'L-N'
                                            }
                                        ]}
                                    />
                                </div>
                            </fieldset>
                            <fieldset className="border p-2">
                                <legend style={{ fontSize: '1.2em' }}>Time:</legend>
                                <div className="form-row">
                                    <div className="col-12">
                                        {props.DataType != 'FFT' ? <TimeUnitSelector label={"Time"} timeUnitIndex={timeUnit.current} setter={index => handleTimeUnitChange(index)} /> : null}
                                    </div>
                                </div>
                                {TimeUnitOptions[timeUnit.current].short.includes("since") ?
                                    <div className="form-row" style={{ marginTop: '10px' }}>
                                        <div className="col-6">
                                            <Input
                                                Record={{ startMS }}
                                                Setter={start => handleTimeChange(start.startMS, true)}
                                                Field={"startMS"}
                                                Valid={() => true}
                                                Label={"Start"}
                                                Type={"number"}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <Input
                                                Record={{ endMS }}
                                                Setter={end => handleTimeChange(end.endMS, false)}
                                                Field={"endMS"}
                                                Valid={() => true}
                                                Label={"End"}
                                                Type={"number"}
                                            />
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
                                }
                            </fieldset>
                            <fieldset className="border p-2">
                                <legend style={{ fontSize: '1.2em' }}>Plot Markers:</legend>
                                <div className="form-row">
                                    <div className="col-auto">
                                        <CheckBox
                                            Record={{ plotMarkers }}
                                            Field={'plotMarkers'}
                                            Setter={(item) => dispatch(SetPlotMarkers(item.plotMarkers))}
                                            Label={"Inception and Duration"}
                                            Help={"For events without this information record start and end time will be used."}
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    {
                        plotKeys
                            .filter(key => key.EventId === evt.Context.EventID || key.EventId === -1)
                            .map((item, index) =>
                                <PlotCard
                                    key={index + item.DataType}
                                    scrollOffset={scrollOffset}
                                    {...item}
                                />
                            )
                    }
                </div>
            </div>
        </div>
    );
}

export default SettingsWidget;

export const AxisUnitSelector = (props: { label: string, setter: (index: number) => void, unitType: OpenSee.Unit, axisSetting: OpenSee.IAxisSettings }) => {
    const buttonLabel = props.axisSetting.isAuto ?
        props.label + " [auto]" :
        props.label + " [" + defaultSettings.Units[props.unitType].options?.[props.axisSetting.current]?.short + "]";

    return (
        <Select
            Label={''}
            Record={{ buttonLabel }}
            Field='buttonLabel'
            Setter={(_, option) => props.setter(option.Value as number)}
            Options={defaultSettings.Units[props.unitType].options.map((option, index) =>
            ({
                Label: option.label,
                Value: index
            })
            )}
        />
    );
}

export const TimeUnitSelector = (props: { label: string, setter: (index: number) => void, timeUnitIndex: number, overlappingWave?: boolean }) => {
    let options: OpenSee.iUnitOptions[];
    let buttonLabel: string;

    if (props.overlappingWave) {
        options = defaultSettings.OverlappingWaveTimeUnit.options ?? [];
        buttonLabel = props.label + " [" + (defaultSettings.OverlappingWaveTimeUnit.options?.[props.timeUnitIndex]?.short ?? '') + "]";
    } else {
        options = defaultSettings.TimeUnit.options ?? [];
        buttonLabel = props.label + " [" + TimeUnitOptions[props.timeUnitIndex].short + "]";
    }

    return (
        <Select
            Label={''}
            Record={{ buttonLabel }}
            Field='buttonLabel'
            Setter={(_, option) => props.setter(option.Value as number)}
            Options={options.map((option, index) => ({ Label: option.label, Value: index }))}
        />
    );
}

interface ICardProps extends OpenSee.IGraphProps { scrollOffset: number }
interface ILimits {
    min: number,
    max: number
}

const PlotCard = (props: ICardProps) => {
    const dispatch = useAppDispatch();

    const singlePlot = useAppSelector(SelectSinglePlot);
    const colors = useAppSelector(SelectColor);

    const overlapWaveTimeUnit = useAppSelector(SelectOverlappingWaveTimeUnit);

    const data = React.useContext(DataContext);
    const dataDispatch = React.useContext(DataFunctionContext);

    const isManual = data.Selector.current.SelectIsManual(props);
    const isOverlappingManual = data.Selector.current.SelectIsOverlappingManual(props.DataType);
    const isOverlappingAuto = data.Selector.current.SelectOverlappingAutoUnits(props.DataType);
    const axisSettings = data.Selector.current.SelectAxisSettings(props);
    const lineData = React.useMemo(() => data.Selector.current.SelectData(props) ?? [], []);
    const overlappingKeys = data.Selector.current.SelectOverlappingEvents(props.DataType);
    const yLimits = React.useMemo(() => data.Selector.current.SelectYLimits(props), [props]);
    const overlappingYLimits = React.useMemo(() => data.Selector.current.SelectOverlappingYLimits(props.DataType), [props]);

    const [curLimits, setCurLimits] = React.useState<OpenSee.IUnitCollection<ILimits> | null>(null);
    const [overlappingLimits, setOverlappingLimits] = React.useState<OpenSee.IGraphCollection<ILimits> | null>(null)

    const [limitsPayload, setLimitsPayload] = React.useState<{ axis: OpenSee.Unit, limits: [number, number], key: OpenSee.IGraphProps, auto: boolean, factor: number } | null>(null);

    const [valid, setValid] = React.useState<boolean>(true)

    const autoUnits = data.Selector.current.SelectAutoUnits(props);

    let colorSettings: OpenSee.Color[] = _.uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Color as OpenSee.Color));
    let unitSettings: OpenSee.Unit[] = _.uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Unit));

    React.useEffect(() => {
        if (limitsPayload?.limits) {
            const timeOutId = setTimeout(() => {

                if (limitsPayload.limits[0] < limitsPayload.limits[1]) {
                    setValid(true);
                    dataDispatch.Dispatch.current.SetManualLimits(limitsPayload.limits, limitsPayload.key, limitsPayload.axis, limitsPayload.auto, limitsPayload.factor);
                }
                else
                    setValid(false)
            }, 1500)
            setLimitsPayload(null);
            return () => clearTimeout(timeOutId)
        }
    }, [curLimits])


    const handleLimitChange = (axis: OpenSee.Unit, limits: [number, number], key: OpenSee.IGraphProps, auto: boolean) => {
        let factor = 1
        if (defaultSettings.Units[axis].options[axisSettings[axis].current].factor !== 1)
            factor = defaultSettings.Units[axis].options[axisSettings[axis].current].factor

        const limit = {
            min: limits[0],
            max: limits[1]
        };

        setCurLimits(prevLimits => ({ ...(prevLimits ?? {} as OpenSee.IUnitCollection<ILimits>), [axis]: limit }));
        setLimitsPayload({ axis, limits, key, auto, factor })
    }

    const handleUnitChange = (unit: OpenSee.Unit, index: number, key: OpenSee.IGraphProps) => {
        let auto: boolean;
        if (defaultSettings.Units[unit].options[index].factor === 0)
            auto = true
        else
            auto = false
        dataDispatch.Dispatch.current.SetUnit(unit, index, auto, key);
    }

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

        else if (isManual?.[unit] && autoUnits?.[unit]) {
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
                const yLimits = overlappingYLimits[graphType as OpenSee.graphType];
                const limits = getYlimits(yLimits, graphType);
                overlappingLimits[graphType] = limits
            });

            setOverlappingLimits(overlappingLimits as OpenSee.IGraphCollection<ILimits>)
        }

    }, [yLimits, overlappingYLimits])

    function getYlimits(yLimits, graphType?) {
        let limits = {}
        Object.keys(yLimits).forEach(unit => {
            limits[unit] = {};
            let factor = 1
            let autoUnit = autoUnits?.[unit]
            const overLappingManual = isOverlappingManual?.[graphType]?.[unit] === undefined ? false : isOverlappingManual[graphType][unit]

            if (overLappingManual || isManual?.[unit]) {
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

    const handleTimeUnitChange = (index: number) => {
        dispatch(SetOverlappingWaveTimeUnit(index))
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
                                <input className="form-check-input" type="radio" checked={!isManual?.[item]} onChange={(e) => dataDispatch.Dispatch.current.SetIsManual(props, item, !e.target.checked)} />
                                <label className="form-check-label" style={{ fontSize: '0.8rem' }}>Auto Limits</label>
                            </div>
                            <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                <input className="form-check-input" type="radio" checked={isManual?.[item]} onChange={(e) => dataDispatch.Dispatch.current.SetIsManual(props, item, e.target.checked)} />
                                <label className="form-check-label" style={{ fontSize: '0.8rem' }}>Manual Limits</label>
                            </div>
                        </div>

                        {isManual?.[item] && (
                            <>
                                <div className="form-row" style={{ marginTop: '10px', marginLeft: 0 }}>
                                    <div className="col-6" style={{}}>
                                        <Input<ILimits>
                                            Record={curLimits?.[item] ? curLimits?.[item] : { min: 0, max: 1 }}
                                            Field={'min'}
                                            Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], props, autoUnits?.[item] ?? false)}
                                            Valid={() => valid}
                                            Label={`${item} ` + `Min [${getLabel(item)}]`}
                                            Type={'number'}
                                            Help={autoUnits?.[item] ?? false ? 'When Auto Unit is selected manual limits are in the base unit (e.g., volts)' : undefined}
                                            Feedback={"Minimum limit can not be greater than Maximum limit"}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <Input<ILimits>
                                            Record={curLimits?.[item] ? curLimits?.[item] : { min: 0, max: 1 }}
                                            Field={'max'}
                                            Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], props, autoUnits?.[item] ?? false)}
                                            Valid={() => valid}
                                            Label={`${item} ` + `Max [${getLabel(item)}]`}
                                            Type={'number'}
                                            Help={autoUnits?.[item] ?? false ? 'When Auto Unit is selected manual limits are in the base unit (e.g., volts)' : undefined}
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
                                        <input className="form-check-input" type="radio" checked={!isOverlappingManual?.[key.DataType]?.[item]} onChange={(e) => dataDispatch.Dispatch.current.SetIsManual(key, item, !e.target.checked)} />
                                        <label className="form-check-label" style={{ fontSize: '0.8rem', }}>Auto Limits</label>
                                    </div>
                                    <div className="col-3 form-check form-check-inline" style={{ margin: 0 }}>
                                        <input className="form-check-input" type="radio" checked={isOverlappingManual?.[key.DataType]?.[item]} onChange={(e) => dataDispatch.Dispatch.current.SetIsManual(key, item, e.target.checked)} />
                                        <label className="form-check-label" style={{ fontSize: '0.8rem' }}>Manual Limits</label>
                                    </div>

                                    {isOverlappingManual?.[key.DataType]?.[item] && (
                                        <>
                                            <div className="form-row" style={{ marginLeft: '5px' }}>
                                                <div className="col-6">
                                                    <Input<ILimits>
                                                        Record={overlappingLimits?.[key.DataType]?.[item] ? overlappingLimits?.[key.DataType]?.[item] : { min: 0, max: 1 }}
                                                        Field={'min'}
                                                        Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], key, autoUnits?.[item] ?? false)}
                                                        Valid={() => valid}
                                                        Label={`${item} ` + `Min [${getLabel(item, key)}]`}
                                                        Type={'number'}
                                                        Help={autoUnits?.[item] ?? false ? 'When Auto Unit is selected limits will be factored to the base unit' : undefined}
                                                        Feedback={"Minimum limit can not be greater than Maximum limit"}
                                                    />
                                                </div>
                                                <div className="col-6">
                                                    <Input<ILimits> 
                                                        Record={overlappingLimits?.[key.DataType]?.[item] ? overlappingLimits?.[key.DataType]?.[item] : { min: 0, max: 1 }}
                                                        Field={'max'}
                                                        Setter={(limits) => handleLimitChange(item, [limits.min, limits.max], key, autoUnits?.[item] ?? false)}
                                                        Valid={() => valid}
                                                        Label={`${item} ` + `Max [${getLabel(item, key)}]`}
                                                        Type={'number'}
                                                        Help={autoUnits?.[item] ?? false ? 'When Auto Unit is selected limits will be factored to the base unit' : undefined}
                                                        Feedback={"Minimum limit can not be greater than Maximum limit"}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )) : null}
                    </fieldset>
                ))}

                {colorSettings.length > 0 ?
                    <fieldset className="border p-2" style={{ padding: '10px', height: '100%', width: '100%' }}>
                        <legend className="w-auto" style={{ fontSize: 'large' }}>Colors:</legend>
                        <div className="row">
                            {colorSettings.map((c: OpenSee.Color, i: number) =>
                                <div className="col-3">
                                    <ColorPicker<OpenSee.IColorCollection>
                                        Record={colors}
                                        Field={c}
                                        key={i}
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
                                <TimeUnitSelector label={"Time"} timeUnitIndex={overlapWaveTimeUnit} setter={index => handleTimeUnitChange(index)} overlappingWave={true} />
                            </div>
                        </div>
                    </fieldset>
                    : null}
            </div>
        </div>
    </div>);

}
