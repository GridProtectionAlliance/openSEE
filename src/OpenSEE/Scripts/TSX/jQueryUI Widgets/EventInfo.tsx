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
import { useAppSelector } from '../hooks';
import { SelectEventInfo } from '../store/eventInfoSlice'
import queryString from 'querystring';
import moment from 'moment'; 

const EventInfo = () => {
    const eventData = useAppSelector(SelectEventInfo)
    const [pqBrowserURL, setPqBrowserURL] = React.useState<string>('http://localhost:44368')
    const dateFormat = "MM/DD/YYYY"
    const timeFormat = "HH:mm:ss:SSS"
    const [pqBrowserParams, setPQBrowserParams] = React.useState<string>("")

    React.useEffect(() => {
        const handle1 = getPQUrl();
        handle1.done((data) => setPqBrowserURL(data));
    }, [])

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
        const time = moment.utc(eventData.EventDate, timeFormat).format(timeFormat)
        const date = moment.utc(eventData.Date, dateFormat).format(dateFormat)
        const queryParams = {
            eventid: eventID,
            time: time,
            date: date,
            windowSize: 1,
            timeWindowUnits: 3
        }
        setPQBrowserParams(queryString.stringify(queryParams))

    }, [eventData])

    return (
        <>
            {eventData ?
                <div className="d-flex" style={{ marginTop: '10px', width: '100%', height: '100%', textAlign: 'center', padding: '10px' }}>
                    <div style={{ height: '100%', overflow: 'auto' }}>
                        <table className="table" style={{ height: '100%', fontSize: `calc(${(window.innerWidth / 100) * 1}px)`}}>
                            <tbody>
                                <tr><td>Meter:</td><td>{eventData.MeterName}</td></tr>
                                <tr><td>Station:</td><td>{eventData.StationName}</td></tr>
                                <tr><td>Asset:</td><td>{eventData.AssetName}</td></tr>
                                <tr><td>Event Type:</td><td>{(eventData.EventName != 'Fault' ? eventData.EventName : <a href="#"
                                    title="Click for fault details" onClick={() => window.open("./FaultSpecifics.aspx?eventid=" + eventID, eventID +
                                        "FaultLocation", "left=0,top=0,width=350,height=300,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no")}
                                >Fault</a>)}</td></tr>
                                <tr><td>Event Date:</td><td>{eventData.EventDate}</td></tr>
                                <tr><td>Inception:</td><td>{moment(eventData.Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}</td></tr>
                                {(eventData.StartTime ? <tr><td>Event Start:</td><td>{eventData.StartTime}</td></tr> : null)}
                                {(eventData.Phase ? <tr><td>Phase:</td><td>{eventData.Phase}</td></tr> : null)}
                                {(eventData.DurationPeriod ? <tr><td>Duration:</td><td>{eventData.DurationPeriod}</td></tr> : null)}
                                {(eventData.Magnitude ? <tr><td>Magnitude:</td><td>{eventData.Magnitude}</td></tr> : null)}
                                {(eventData.SagDepth ? <tr><td>Sag Depth:</td><td>{eventData.SagDepth}</td></tr> : null)}
                                {(eventData.BreakerNumber ? <tr><td>Breaker:</td><td>{eventData.BreakerNumber}</td></tr> : null)}
                                {(eventData.BreakerTiming ? <tr><td>Timing:</td><td>{eventData.BreakerTiming}</td></tr> : null)}
                                {(eventData.BreakerSpeed ? <tr><td>Speed:</td><td>{eventData.BreakerSpeed}</td></tr> : null)}
                                {(eventData.BreakerOperation ? <tr><td>Operation:</td><td>{eventData.BreakerOperation}</td></tr> : null)}
                                <tr>
                                    {<td><button className="btn btn-link" onClick={() => { window.open(eventData.xdaInstance + '/Workbench/Event.cshtml?EventID=' + eventID) }}>Edit</button></td>}
                                    {<td><button className="btn btn-link" onClick={() => { window.open(pqBrowserURL + '/eventsearch?' + pqBrowserParams) }}>Manage Notes</button></td>}
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div> :
                null}
        </>
    )
}
export default EventInfo;