//******************************************************************************************************
//  MultiselectWindow.tsx - Gbtc
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
//******************************************************************************************************

import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { SelectEventListLoading, SelectEventList, EnableOverlappingEvent } from '../store/overlappingEventsSlice';
import { SelectSinglePlot, EnableSinglePlot } from '../store/settingSlice'
import { CheckBox } from '@gpa-gemstone/react-forms'

const OverlappingEventWindow = () => {
    const eventList = useAppSelector(SelectEventList);
    const singlePlot = useAppSelector(SelectSinglePlot);
    const loading = useAppSelector(SelectEventListLoading);
    const dispatch = useAppDispatch();

    return (
        <div className="d-flex" style={{ width: '100%', height: '100%', padding: '10px' }}>
            {loading ? (
                <div className="d-flex align-items-center justify-content-center">
                    <i className="fa fa-spinner fa-lg"></i>
                </div>
            ) : (
                <form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', height: '100%', width: '100%', overflowY: 'auto', padding: '10px', marginTop: 0 }}>
                    <div style={{ marginBottom: '20px' }}>
                        <CheckBox
                                Record={{ singlePlot }}
                                Field={'singlePlot'}
                                Setter={(item) => dispatch(EnableSinglePlot(item.singlePlot))}
                                Label={"Display all selected events on same plot"}
                                Help={"Draws the waveform groups (e.g., Voltage) for the current event and the selected asset(s) on a single plot for comparison."}
                        />
                    </div>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {eventList.map((event, index) => (
                            <fieldset className="border" key={event.EventID} style={{ padding: '10px', width: '100%', marginBottom: '20px' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>{event.MeterName}</legend>
                                <div className="row">
                                    <div className="col-12">
                                        <li key={index}>
                                            <ul style={{ listStyleType: 'none' }}>
                                                <li key={index}>
                                                    <CheckBox
                                                        Record={event}
                                                        Field={'Selected'}
                                                        Setter={(event) => dispatch(EnableOverlappingEvent(event.EventID))}
                                                        Label={event.AssetName}
                                                    />
                                                </li>
                                            </ul>
                                        </li>
                                    </div>
                                </div>
                            </fieldset>
                        ))}
                    </ul>
                </form>
            )}
        </div>
    );
}

export default OverlappingEventWindow;


