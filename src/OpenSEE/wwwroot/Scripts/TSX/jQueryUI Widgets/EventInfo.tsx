//******************************************************************************************************
//  EventInfo.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
import queryString from 'querystring';
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
        const time = moment.utc(evt.EventInfo.EventDate, eventDateFormat).format(timeFormat)
        const date = moment.utc(evt.EventInfo.EventDate, eventDateFormat).format(dateFormat)
        const queryParams = {
            eventid: evt.EventID,
            time: time,
            date: date,
            windowSize: 1,
            timeWindowUnits: 3
        }
        setPQBrowserParams(queryString.stringify(queryParams))

    }, [evt.EventInfo]);

    if (evt.EventInfo == null)
        return null;

    return (
        <div className="d-flex" style={{ marginTop: '10px', width: '100%', height: '100%', textAlign: 'center', padding: '10px' }}>
            <div style={{ height: '100%', overflow: 'auto' }}>
                <table className="table" style={{ height: '100%', fontSize: `calc(${(window.innerWidth / 100) * 1}px)`}}>
                    <tbody>
                        <tr><td>Meter:</td><td>{evt.EventInfo.MeterName}</td></tr>
                        <tr><td>Station:</td><td>{evt.EventInfo.StationName}</td></tr>
                        <tr><td>Asset:</td><td>{evt.EventInfo.AssetName}</td></tr>
                        <tr>
                            <td>Event Type:</td>
                            <td>
                                {
                                    evt.EventInfo.EventName != 'Fault' ? evt.EventInfo.EventName :
                                        <a
                                            href="#"
                                            title="Click for fault details"
                                            onClick={() => setShowFaultSpecifics(true)}
                                >Fault</a>
                                }
                            </td>
                        </tr>
                        <tr><td>Event Date:</td><td>{evt.EventInfo.EventDate}</td></tr>
                        <tr><td>Inception:</td><td>{moment(evt.EventInfo.Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}</td></tr>
                        {(evt.EventInfo.StartTime ? <tr><td>Event Start:</td><td>{evt.EventInfo.StartTime}</td></tr> : null)}
                        {(evt.EventInfo.Phase ? <tr><td>Phase:</td><td>{evt.EventInfo.Phase}</td></tr> : null)}
                        {(evt.EventInfo.DurationPeriod ? <tr><td>Duration:</td><td>{evt.EventInfo.DurationPeriod}</td></tr> : null)}
                        {(evt.EventInfo.Magnitude ? <tr><td>Magnitude:</td><td>{evt.EventInfo.Magnitude}</td></tr> : null)}
                        {(evt.EventInfo.SagDepth ? <tr><td>Sag Depth:</td><td>{evt.EventInfo.SagDepth}</td></tr> : null)}
                        {(evt.EventInfo.BreakerNumber ? <tr><td>Breaker:</td><td>{evt.EventInfo.BreakerNumber}</td></tr> : null)}
                        {(evt.EventInfo.BreakerTiming ? <tr><td>Timing:</td><td>{evt.EventInfo.BreakerTiming}</td></tr> : null)}
                        {(evt.EventInfo.BreakerSpeed ? <tr><td>Speed:</td><td>{evt.EventInfo.BreakerSpeed}</td></tr> : null)}
                        {(evt.EventInfo.BreakerOperation ? <tr><td>Operation:</td><td>{evt.EventInfo.BreakerOperation}</td></tr> : null)}
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
                EventID={evt.EventInfo.EventId}
            />
        </div>
    )
}
export default EventInfo;