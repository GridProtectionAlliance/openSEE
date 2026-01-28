//******************************************************************************************************
//  OverlappingEvents.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  03/13/2019 - Billy Ernest
//       Generated original version of source code.
//
//  01/24/2024 - Preston Crawford
//       Fix issue where events weren't getting grouped by meter
//
//******************************************************************************************************


import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { SelectEventListLoading, SelectEventList, EnableOverlappingEvent } from '../store/overlappingEventsSlice';
import { SelectSinglePlot, EnableSinglePlot, SelectUseOverlappingTime, SetUseOverlappingTime, SelectTimeUnit } from '../store/settingSlice';
import { CheckBox } from '@gpa-gemstone/react-forms';
import _ from 'lodash';
import { LoadingIcon } from '../Graphs/ChartIcons';
import { defaultSettings } from '../defaults';

const OverlappingEventWindow = () => {
    const eventList = useAppSelector(SelectEventList);
    const groupedEvents = _.groupBy(eventList, 'MeterName');
    const singlePlot = useAppSelector(SelectSinglePlot);
    const eventListLoading = useAppSelector(SelectEventListLoading);
    const useOverlappingTime = useAppSelector(SelectUseOverlappingTime);
    const timeUnit = useAppSelector(SelectTimeUnit);

    const dispatch = useAppDispatch();

    return (
        <div className="d-flex" style={{ width: '100%', height: '100%', padding: '10px' }}>
            {eventListLoading ? (
                <LoadingIcon />
            ) : (
                <form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', height: '100%', width: '100%', overflowY: 'auto', padding: '10px', marginTop: 0 }}>
                    <div style={{ marginBottom: '20px' }}>
                        <div className="form-row" style={{ marginBottom: '10px' }}>
                            <div className="col-12">
                                <CheckBox
                                    Record={{ singlePlot }}
                                    Field={'singlePlot'}
                                    Setter={(item) => dispatch(EnableSinglePlot(item.singlePlot))}
                                    Label={"Display all events on same plot"}
                                    Help={"Draws the waveform groups (e.g., Voltage) for the current event and the selected asset(s) on a single plot for comparison."}
                                />
                            </div>
                        </div>
                        {defaultSettings.TimeUnit.options[timeUnit.current].short.includes('since') &&
                                (!singlePlot || (singlePlot && !eventList.some(i => i.Selected))) ?
                                <div className="form-row">
                                    <div className="col-6 form-check-inline" style={{ margin: 0 }}>
                                        <input className="form-check-input" type="radio" checked={!useOverlappingTime} onChange={e => dispatch(SetUseOverlappingTime(!e.target.checked))} />
                                        <label className="form-check-label">Relative to Original Event</label>
                                    </div>
                                    <div className="col-6 form-check-inline" style={{ margin: 0 }}>
                                        <input className="form-check-input" type="radio" checked={useOverlappingTime} onChange={e => dispatch(SetUseOverlappingTime(e.target.checked))} />
                                        <label className="form-check-label">Relative to Selected Event</label>
                                    </div>
                                </div>
                                : null}
                    </div>

                    {Object.entries(groupedEvents).map(([meterName, events]) => (
                        <fieldset key={meterName} className="border" style={{ padding: '10px', width: '100%', marginBottom: '20px' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>{meterName}</legend>
                            {events.map((event, idx) => (
                                <div key={idx} className="form-row" style={{ marginBottom: '10px' }}>
                                        <div className="col-12">
                                            <CheckBox
                                                Record={event}
                                                Field={'Selected'}
                                                Setter={(updatedEvent) => dispatch(EnableOverlappingEvent(updatedEvent.EventID))}
                                                Label={event.AssetName}
                                            />
                                        </div>
                                    </div>
                            ))}
                        </fieldset>
                    ))}
                </form>
            )}
        </div>
    );
};

export default OverlappingEventWindow;
