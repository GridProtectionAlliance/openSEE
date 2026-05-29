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
import React from 'react';
import moment from 'moment';
import {
    SelectTimeUnit,
    SelectDefaultTraces,
    SelectPlotMarkers,
    SetPlotMarkers,
    SetDefaultTrace,
    SelectVTypeDefault,
    SetDefaultVType,
    SelectSinglePlot,
    SetTimeUnit
} from '../../Store/settingSlice';
import { TimeUnitOptions } from '../../defaults';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { DatePicker, Input, CheckBox, RadioButtons } from '@gpa-gemstone/react-forms';
import { PlotDataStateContext } from '../../Context/PlotDataContext';
import { PlotStateStateContext, PlotStateActionContext } from '../../Context/PlotStateContext';
import EventContext from '../../Context/EventContext';
import { selectPlotKeys } from '../../PlotSelectors';
import PlotCard from './PlotCard';
import TimeUnitSelector from './TimeUnitSelector';

interface TimeLimit {
    start: string,
    end: string
}

const SettingsWidget = () => {
    const dispatch = useAppDispatch();

    const defaultTraces = useAppSelector(SelectDefaultTraces);
    const defaultVtype = useAppSelector(SelectVTypeDefault);
    const plotMarkers = useAppSelector(SelectPlotMarkers);
    const timeUnit = useAppSelector(SelectTimeUnit);
    const singlePlot = useAppSelector(SelectSinglePlot);

    const { plots: plotData } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);
    const evt = React.useContext(EventContext);

    const plotKeys = React.useMemo(() => selectPlotKeys(plotState.meta, singlePlot), [plotState.meta, singlePlot]);

    const originalStartTime = new Date(evt.Context.EventInfo?.EventDate + "Z").getTime();
    const inceptionOffset = ((evt.Context.EventInfo?.Inception ?? 0) - originalStartTime);

    const [scrollOffset, setScrollOffset] = React.useState<number>(0);
    const [valid, setValid] = React.useState<boolean>(true);
    const startTime = plotState.startTime;
    const endTime = plotState.endTime;

    const formattedTime = React.useMemo(() => ({
        start: moment(startTime).format('HH:mm:ss.SSS'),
        end: moment(endTime).format('HH:mm:ss.SSS')
    }), [startTime, endTime]);

    const isSinceMode = TimeUnitOptions[timeUnit.current].short.includes('since');
    const isCycles = TimeUnitOptions[timeUnit.current].short.includes('cycles');
    const isSinceInception = TimeUnitOptions[timeUnit.current].short.includes('inception');

    const startMS = React.useMemo(() => {
        const offset = isSinceInception ? inceptionOffset : 0;
        const ms = startTime - originalStartTime - offset;
        return isCycles ? ms * 60.0 / 1000.0 : ms;
    }, [startTime, originalStartTime, inceptionOffset, isCycles, isSinceInception]);

    const endMS = React.useMemo(() => {
        const offset = isSinceInception ? inceptionOffset : 0;
        const ms = endTime - originalStartTime - offset;
        return isCycles ? ms * 60.0 / 1000.0 : ms;
    }, [endTime, originalStartTime, inceptionOffset, isCycles, isSinceInception]);

    const handleTimeChange = React.useCallback((value: number, isStart: boolean) => {
        const ms = isCycles ? value / (60.0 / 1000.0) : value;
        const offset = isSinceInception ? inceptionOffset : 0;
        const newTime = originalStartTime + ms + offset;

        if (isStart)
            stateActions.SetTimeLimit(newTime, endTime, plotData);
        else
            stateActions.SetTimeLimit(startTime, newTime, plotData);
    }, [startTime, endTime, isCycles, isSinceInception, inceptionOffset, originalStartTime, plotData, stateActions]);

    const handleSetTimeUnit = React.useCallback((index: number) => dispatch(SetTimeUnit({ index })), [dispatch]);

    const handleDateChange = React.useCallback((time: string, isStart: boolean) => {
        if (!time || time === 'Invalid date') return;

        const baseDate = new Date(isStart ? startTime : endTime);
        const parts = time.split(':');
        const [seconds, milliseconds] = parts[2].split('.');
        baseDate.setHours(parseInt(parts[0]), parseInt(parts[1]), parseInt(seconds), parseInt(milliseconds));

        const newTime = baseDate.getTime();

        if (isStart && newTime < endTime) {
            setValid(true);
            stateActions.SetTimeLimit(newTime, endTime, plotData);
        } else if (!isStart && newTime > startTime) {
            setValid(true);
            stateActions.SetTimeLimit(startTime, newTime, plotData);
        } else {
            setValid(false);
        }
    }, [startTime, endTime, plotData, stateActions]);

    React.useEffect(() => {
        const container = document.getElementById("settingScrollContainer");
        const handleScroll = () => {
            const offset = container?.scrollTop;
            if (offset != null) setScrollOffset(offset);
        };

        if (container != null)
            container.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            if (container != null)
                container.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="d-flex flex-column" style={{ marginTop: '10px', width: '100%', height: '100%', padding: '10px' }}>
            <div id="settingScrollContainer" className="overflow-auto" style={{ height: '100%', zIndex: 1001 }}>
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
                                        //Make options stable const
                                        Options={[{ Label: "Line to Line", Value: 'L-L' }, { Label: "Line to Neutral", Value: 'L-N' }]}
                                    />
                                </div>
                            </fieldset>
                            <fieldset className="border p-2">
                                <legend style={{ fontSize: '1.2em' }}>Time:</legend>
                                <div className="form-row">
                                    <div className="col-12">
                                        <TimeUnitSelector
                                            timeUnitIndex={timeUnit.current}
                                            setter={handleSetTimeUnit}
                                        />
                                    </div>
                                </div>
                                {isSinceMode ?
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
                                            <DatePicker<TimeLimit>
                                                Record={formattedTime}
                                                Format={"HH:mm:ss.SSS"}
                                                Field={'start'}
                                                Setter={(e) => handleDateChange(e.start, true)}
                                                Label={"Start Time"}
                                                Accuracy={'millisecond'}
                                                Valid={() => valid}
                                                Type={'time'}
                                                Feedback={"Start Time can not be greater than End Time"}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <DatePicker<TimeLimit>
                                                Record={formattedTime}
                                                Format={"HH:mm:ss.SSS"}
                                                Field={'end'}
                                                Setter={(e) => handleDateChange(e.end, false)}
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
                    {plotKeys
                        .filter(key => key.EventId === evt.Context.EventID || key.EventId === -1)
                        .map((item, index) =>
                            <PlotCard
                                key={index + item.DataType}
                                scrollOffset={scrollOffset}
                                {...item}
                            />
                        )}
                </div>
            </div>
        </div>
    );
};

export default SettingsWidget;
