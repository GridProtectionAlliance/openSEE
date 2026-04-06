//******************************************************************************************************
//  EventInfo.tsx - Gbtc
//
//  Copyright � 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  12/27/2023 - Preston Crawford
//       Generated original version of source code.
//******************************************************************************************************

import React from 'react';
import queryString from 'query-string';
import moment from 'moment';
import FaultSpecificsModal from './FaultSpecificsModal';
import EventContext from '../Context/EventContext';

const eventDateFormat = "YYYY-MM-DD HH:mm:ss.fffffff";
const dateFormat = "MM/DD/YYYY";
const timeFormat = "HH:mm:ss.SSS";

const EventInfo = () => {
    const evt = React.useContext(EventContext);
    const [pqBrowserURL, setPqBrowserURL] = React.useState<string>('http://localhost:44368')
    const [pqBrowserParams, setPQBrowserParams] = React.useState<string>("")
    const [showFaultSpecifics, setShowFaultSpecifics] = React.useState<boolean>(false)

    React.useEffect(() => {
        const handle1 = getPQUrl();
        handle1.done((data) => setPqBrowserURL(data));
    }, []);

    function getPQUrl() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetPQBrowser/`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    React.useEffect(() => {
        if (evt.Context.EventInfo == null)
            return;

        const time = moment.utc(evt.Context.EventInfo.EventDate, eventDateFormat).format(timeFormat);
        const date = moment.utc(evt.Context.EventInfo.EventDate, eventDateFormat).format(dateFormat);

        const queryParams = {
            eventid: evt.Context.EventID,
            time: time,
            date: date,
            windowSize: 1,
            timeWindowUnits: 3
        };

        setPQBrowserParams(queryString.stringify(queryParams))

    }, [evt.Context.EventInfo]);

    if (evt.Context.EventInfo == null)
        return null;

    return (
        <div className="d-flex" style={{ marginTop: '10px', width: '100%', height: '100%', textAlign: 'center', padding: '10px' }}>
            <div style={{ height: '100%', overflow: 'auto' }}>
                <table className="table" style={{ height: '100%', fontSize: `calc(${(window.innerWidth / 100) * 1}px)` }}>
                    <tbody>
                        <tr><td>Meter:</td><td>{evt.Context.EventInfo.MeterName}</td></tr>
                        <tr><td>Station:</td><td>{evt.Context.EventInfo.StationName}</td></tr>
                        <tr><td>Asset:</td><td>{evt.Context.EventInfo.AssetName}</td></tr>
                        <tr>
                            <td>Event Type:</td>
                            <td>
                                {
                                    evt.Context.EventInfo.EventName != 'Fault' ? evt.Context.EventInfo.EventName :
                                        <a
                                            href="#"
                                            title="Click for fault details"
                                            onClick={() => setShowFaultSpecifics(true)}
                                        >Fault</a>
                                }
                            </td>
                        </tr>
                        <tr><td>Event Date:</td><td>{evt.Context.EventInfo.EventDate}</td></tr>
                        <tr><td>Inception:</td><td>{moment(evt.Context.EventInfo.Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}</td></tr>
                        {(evt.Context.EventInfo.StartTime ? <tr><td>Event Start:</td><td>{evt.Context.EventInfo.StartTime}</td></tr> : null)}
                        {(evt.Context.EventInfo.Phase ? <tr><td>Phase:</td><td>{evt.Context.EventInfo.Phase}</td></tr> : null)}
                        {(evt.Context.EventInfo.DurationPeriod ? <tr><td>Duration:</td><td>{evt.Context.EventInfo.DurationPeriod}</td></tr> : null)}
                        {(evt.Context.EventInfo.Magnitude ? <tr><td>Magnitude:</td><td>{evt.Context.EventInfo.Magnitude}</td></tr> : null)}
                        {(evt.Context.EventInfo.SagDepth ? <tr><td>Sag Depth:</td><td>{evt.Context.EventInfo.SagDepth}</td></tr> : null)}
                        {(evt.Context.EventInfo.BreakerNumber ? <tr><td>Breaker:</td><td>{evt.Context.EventInfo.BreakerNumber}</td></tr> : null)}
                        {(evt.Context.EventInfo.BreakerTiming ? <tr><td>Timing:</td><td>{evt.Context.EventInfo.BreakerTiming}</td></tr> : null)}
                        {(evt.Context.EventInfo.BreakerSpeed ? <tr><td>Speed:</td><td>{evt.Context.EventInfo.BreakerSpeed}</td></tr> : null)}
                        {(evt.Context.EventInfo.BreakerOperation ? <tr><td>Operation:</td><td>{evt.Context.EventInfo.BreakerOperation}</td></tr> : null)}
                        <tr>
                            {<td><button className="btn btn-link" onClick={() => { window.open(pqBrowserURL + '/eventsearch?' + pqBrowserParams) }}>Edit Event and Manage Notes</button></td>}
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <FaultSpecificsModal
                SetShow={setShowFaultSpecifics}
                Show={showFaultSpecifics}
                EventID={evt.Context.EventInfo.EventId}
            />
        </div>
    )
}
export default EventInfo;