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
//******************************************************************************************************

import * as React from 'react';
import { uniq } from 'lodash';
import { BlockPicker } from 'react-color';
import { OpenSee } from '../global';
import { selectData, selectGraphTypes, SetTimeUnit, SetUnit } from '../store/dataSlice';
import { selectColor, SetColor, selectUnit, selectTimeUnit, selectEventOverlay, SetSinglePlot, selectdefaultTraces, SetDefaultTrace, selectVTypeDefault, SetDefaultVType } from '../store/settingSlice';
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
    const list = useAppSelector(selectGraphTypes);
    const defaultTraces = useAppSelector(SelectDefaultTraces);
    const defaultVtype = useAppSelector(SelectVTypeDefault);

    const selectStartTimeInstance = React.useMemo(() => (selectStartTime), [])
    const selectEndTimeInstance = React.useMemo(() => (selectEndTime), [])

    const startTime = useAppSelector(selectStartTimeInstance);
    const endTime = useAppSelector(selectEndTimeInstance);

    const timeUnit = useAppSelector(SelectTimeUnit);

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
                                    <div className="form-row">
                                        <div className="col-auto form-check form-check-inline">
                                            <CheckBox
                                                Record={defaultTraces}
                                                Field={'W'}
                                                Setter={(item) => dispatch(SetDefaultTrace({ ...defaultTraces, W: item.W }))}
                                                Label={"WaveForm"}
                                            />
                                        </div>
                                        <div className="col-auto form-check form-check-inline">
                                            <CheckBox
                                                Record={defaultTraces}
                                                Field={'Pk'}
                                                Setter={(item) => dispatch(SetDefaultTrace({ ...defaultTraces, Pk: item.Pk }))}
                                                Label={"Peak"}
                                            />
                                    </div>
                                        <div className="col-auto form-check form-check-inline">
                                            <CheckBox
                                                Record={defaultTraces}
                                                Field={'RMS'}
                                                Setter={(item) => dispatch(SetDefaultTrace({ ...defaultTraces, RMS: item.RMS }))}
                                                Label={"RMS"}
                                            />
                                </div>
                                        <div className="col-auto form-check form-check-inline">
                                            <CheckBox
                                                Record={defaultTraces}
                                                Field={'Ph'}
                                                Setter={(item) => dispatch(SetDefaultTrace({ ...defaultTraces, Ph: item.Ph }))}
                                                Label={"Phase"}
                                            />
                                                </div>
                                            </div>
                                    <div className="form-row">
                                        <div className="col-auto form-check form-check-inline">
                                            <CheckBox
                                                Record={defaultVtype}
                                                Field={'LL'}
                                                Setter={(item) => dispatch(SetDefaultVType({ ...defaultVtype, LL: item.LL }))}
                                                Label={"Line to Line"}
                                            />
                                                </div>
                                        <div className="col-auto form-check form-check-inline">
                                            <CheckBox
                                                Record={defaultVtype}
                                                Field={'LN'}
                                                Setter={(item) => dispatch(SetDefaultVType({ ...defaultVtype, LN: item.LN }))}
                                                Label={"Line to Neutral"}
                                            />
                                            </div>
                                                </div>
                                </fieldset>
                                <fieldset className="border p-2">
                                    <legend>Time:</legend>
                                    <div className="form-row">
                                        <div className="col-4" style={{ paddingTop: '1.875rem' }}>
                                            {props.DataType != 'FFT' ? <TimeUnitSelector label={"Time"} timeUnit={timeUnit} setter={index => handleTimeUnitChange(index)} /> : null}
                                            </div>
                                                
                                        <div className="col-4">
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
                                        <div className="col-4">
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
    const cover: React.CSSProperties =
    {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    }


    function updateColor (color, event)  {
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
                    {/*<div style={cover} onClick={() => setDisplayColorPicker(false)} />*/}
                </div> : null}
            </div>
        )
    
}

export const AxisUnitSelector = (props: { label: string, setter: (index: number) => void, unitType: OpenSee.Unit, axisSetting: OpenSee.IAxisSettings }) => {
    let entries;
    let buttonLabel;

    entries = defaultSettings.Units[props.unitType].options.map((option, index) =>
        <a key={"option-" + index} className="dropdown-item" onClick={() => { props.setter(index) }}> {option.label} </a>
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
        <a key={"option-" + index} className="dropdown-item" onClick={() => { props.setter(index) }}> {option.label} </a>
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

const PlotCard = (props: ICardProps) => {

    const SelectData = React.useMemo(selectData, []);
    const lineData = useAppSelector((state) => SelectData(state, props));

    const colors = useAppSelector(selectColor);
    const units = useAppSelector(selectUnit);
    const timeUnit = useAppSelector(selectTimeUnit);

    const dispatch = useAppDispatch();

    let colorSettings: OpenSee.Color[] = uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Color as OpenSee.Color));
    let unitSettings: OpenSee.Unit[] = uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Unit));


    function GetColorName(c: OpenSee.Color) {
        return c as string;
    }

    function GetUnitName(c: OpenSee.Unit) {
        return c as string;
    }

    let unitCol1: OpenSee.Unit[] = unitSettings.filter((item, index) => index % 2 == 0);
    let unitCol2: OpenSee.Unit[] = unitSettings.filter((item, index) => index % 2 == 1);

    let colCol1: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 0);
    let colCol2: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 1);
    let colCol3: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 2);
    let colCol4: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 3);

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
                <div className="row">
                    <div className="collumn" style={{ width: '100%' }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Units:</legend>
                            <div className="row">
                                <div className="col">
                                    {props.DataType != 'FFT' ? < UnitSelector label={"Time"} unit={timeUnit} setter={(unit) => dispatch(SetTimeUnit(unit.current))} /> : null}
                                    {unitCol1.map((item, index) => <UnitSelector key={index} label={GetUnitName(item)} unit={units[item]} setter={(unit) => dispatch(SetUnit({ unit: item, value: unit.current }))} />)}
                                </div>
                                <div className="col">
                                    {unitCol2.map((item, index) => <UnitSelector key={index} label={GetUnitName(item)} unit={units[item]} setter={(unit) => dispatch(SetUnit({ unit: item, value: unit.current }))} />)}
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>
                {colorSettings.length > 0 ? < div className="row">
                    <div className="collumn" style={{ width: '100%', display: "inline-flex" }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%', display: "inline-flex" }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Colors:</legend>
                            <div className="row">
                                <div className="col">
                                    {colCol1.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={GetColorName(c)}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                            />)}
                                </div>
                                <div className="col">
                                    {colCol2.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={GetColorName(c)}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>
                                <div className="col">
                                    {colCol3.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={GetColorName(c)}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>
                                <div className="col">
                                    {colCol4.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={GetColorName(c)}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>

                            </div>
                        </fieldset>
                    </div> 
                </div> : null}
            </div>
        </div>
    </div>);

}
