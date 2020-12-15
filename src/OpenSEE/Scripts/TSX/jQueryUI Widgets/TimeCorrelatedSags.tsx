//******************************************************************************************************
//  TimeCorrelatedSags.tsx - Gbtc
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
//  02/05/2019 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import OpenSEEService from './../../TS/Services/OpenSEE';
import { outerDiv, handle, closeButton } from './Common';


interface Iprops { closeCallback: () => void, exportCallback: () => void, eventId: number }

const TimeCorrelatedSagsWidget = (props: Iprops) => {
    const [tblData, setTblData] = React.useState<Array<JSX.Element>>([]);

    React.useEffect(() => {
        ($("#correlatedsags") as any).draggable({ scroll: false, handle: '#correlatedsagshandle', containment: '#chartpanel' });
    }, [props])

    React.useEffect(() => {
        let handle = getData();

        return () => { if (handle != undefined && handle.abort != undefined) handle.abort(); }
    }, [props.eventId])

    function getData(): JQuery.jqXHR {

        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetTimeCorrelatedSags?eventId=${props.eventId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });


        handle.done((d) => {
            setTblData(d.map(row =>
                <tr style={{ display: 'table', tableLayout: 'fixed', background: (row.EventID == props.eventId? 'lightyellow' : 'default') }} key={row.EventID}>
                    <td style={{ width: 60 }} key={'EventID' + row.EventID}><a id="eventLink" target="_blank" href={'./OpenSEE?eventid=' + row.EventID}><div style={{ width: '100%', height: '100%' }}>{row.EventID}</div></a></td>
                    <td style={{ width: 80 }} key={'EventType' + row.EventID}>{row.EventType}</td>
                    <td style={{ width: 80 }} key={'SagMagnitude' + row.EventID}>{row.SagMagnitudePercent}%</td>
                    <td style={{ width: 150 }} key={'SagDuration' + row.EventID}>{row.SagDurationMilliseconds} ms ({row.SagDurationCycles} cycles)</td>
                    <td style={{ width: 220 }} key={'StartTime' + row.EventID}>{row.StartTime}</td>
                    <td style={{ width: 150 }} key={'MeterName' + row.EventID}>{row.MeterName}</td>
                    <td style={{ width: 400 }} key={'LineName' + row.EventID}>{row.LineName}</td>
                </tr>))
        });
                
        return handle;
    }

    return (
        <div id="correlatedsags" className={`ui-widget-content`} style={outerDiv}>>
            <div id="correlatedsagshandle" className={handle}></div>
            <div id="correlatedsagscontent">
                <table className="table" style={{ fontSize: 'small', marginBottom: 0 }}>
                    <thead style={{ display: 'table', tableLayout: 'fixed' }}>
                        <tr key='Header'>
                            <th style={{ width: 60 }} key='EventID'>Event ID</th>
                            <th style={{ width: 80 }} key='EventType'>Event Type</th>
                            <th style={{ width: 80 }} key='SagMagnitude'>Magnitude</th>
                            <th style={{ width: 150 }} key='SagDuration'>Duration</th>
                            <th style={{ width: 220 }} key='StartTime'>Start Time</th>
                            <th style={{ width: 150 }} key='MeterName'>Meter Name</th>
                            <th style={{ width: 'calc(400px - 1em)' }} key='LineName'>Asset Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className='btn btn-primary' onClick={() => props.exportCallback()}>Export(csv)</button></th>
                        </tr>
                    </thead>
                    <tbody style={{ maxHeight: 500, overflowY: 'auto', display: 'block' }}>
                        {tblData}
                    </tbody>
                </table>
            </div>
            <button className={closeButton} onClick={() => props.closeCallback()}>X</button>
        </div>
    );

}

export default TimeCorrelatedSagsWidget

