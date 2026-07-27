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
import { SelectSinglePlot, SetSinglePlot, SelectUseOverlappingTime, SetUseOverlappingTime, SelectTimeUnit } from '../Store/settingSlice';
import { CheckBox, RadioButtons } from '@gpa-gemstone/react-forms';
import _ from 'lodash';
import { LoadingIcon } from '../Graphs/ChartIcons';
import { Alert } from '@gpa-gemstone/react-interactive';
import { TimeUnitOptions } from '../defaults';
import { OverlappingStateContext } from '../Context/OverlappingContext';

interface IProps {
    EnableOverlappingEvent: (eventId: number) => void;
}

type OverlappingTimeMode = 'Original' | 'Selected';

interface IOverlappingTimeModeRecord {
    mode: OverlappingTimeMode
}

const overlappingTimeOptions: Array<{ Label: string, Value: OverlappingTimeMode }> = [
    { Label: "Relative to Original Event", Value: 'Original' },
    { Label: "Relative to Selected Event", Value: 'Selected' }
];

const OverlappingEventWindow = (props: IProps) => {
    const dispatch = useAppDispatch();
    const singlePlot = useAppSelector(SelectSinglePlot);
    const useOverlappingTime = useAppSelector(SelectUseOverlappingTime);
    const timeUnit = useAppSelector(SelectTimeUnit);

    const overlapping = React.useContext(OverlappingStateContext);
    const groupedEvents = _.groupBy(overlapping.events, 'MeterName');

    return (
        <div className="d-flex" style={{ width: '100%', height: '100%', padding: '10px' }}>
            {overlapping.loading === 'Error' ? (
                <div className="row justify-content-center">
                    <div className="col-12">
                        <Alert Class='alert-danger'>
                            Error retrieving overlapping events.
                        </Alert>
                    </div>
                </div>
            ) : overlapping.loading !== 'Idle' ? (
                <LoadingIcon />
            ) : (
                <form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', height: '100%', width: '100%', overflowY: 'auto', padding: '10px', marginTop: 0 }}>
                    <div style={{ marginBottom: '20px' }}>
                        <div className="form-row" style={{ marginBottom: '10px' }}>
                            <div className="col-12">
                                <CheckBox
                                    Record={{ singlePlot }}
                                    Field={'singlePlot'}
                                    Setter={(item) => dispatch(SetSinglePlot(item.singlePlot))}
                                    Label={"Display all events on same plot"}
                                    Help={"Draws the waveform groups (e.g., Voltage) for the current event and the selected asset(s) on a single plot for comparison."}
                                />
                            </div>
                        </div>
                        {TimeUnitOptions[timeUnit.current].short.includes('since') &&
                            (!singlePlot || (singlePlot && !overlapping.events.some(i => i.Selected))) ?
                            <div className="form-row">
                                <RadioButtons<IOverlappingTimeModeRecord>
                                    Record={{ mode: useOverlappingTime ? 'Selected' : 'Original' }}
                                    Field="mode"
                                    Setter={(record) => dispatch(SetUseOverlappingTime(record.mode === 'Selected'))}
                                    Label=""
                                    Position="horizontal"
                                    Style={{ marginBottom: 0 }}
                                    Options={overlappingTimeOptions}
                                />
                            </div>
                            : null}
                    </div>

                    {_.sortBy(Object.entries(groupedEvents), ([meterName]) => meterName)
                        .map(([meterName, events]) => (
                            <fieldset key={meterName} className="border" style={{ padding: '10px', width: '100%', marginBottom: '20px' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>{meterName}</legend>
                                {_.sortBy(events, event => event.AssetName)
                                    .map((event, idx) => (
                                        <div key={idx} className="form-row" style={{ marginBottom: '10px' }}>
                                            <div className="col-12">
                                                <CheckBox
                                                    Record={event}
                                                    Field={'Selected'}
                                                    Setter={(updatedEvent) => props.EnableOverlappingEvent(updatedEvent.EventID)}
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
