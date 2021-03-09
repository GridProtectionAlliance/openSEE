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
import { WidgetWindow } from './Common';


interface Iprops { closeCallback: () => void, exportCallback: () => void, eventId: number, isOpen: boolean }

const TimeCorrelatedSagsWidget = (props: Iprops) => {
    const [tblData, setTblData] = React.useState<Array<JSX.Element>>([]);

    
    React.useEffect(() => {
        let handle = getData();

        return () => { if (handle != undefined && handle.abort != undefined) handle.abort(); }
    }, [props.eventId])

    const rowStyle = { paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }

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
                    <td style={{ width: 60, ...rowStyle }} ><a id="eventLink" target="_blank" href={'./?eventid=' + row.EventID}><div style={{ width: '100%', height: '100%' }}>{row.EventID}</div></a></td>
                    <td style={{ width: 80, ...rowStyle }} >{row.EventType}</td>
                    <td style={{ width: 80, ...rowStyle }} >{row.SagMagnitudePercent}%</td>
                    <td style={{ width: 200, ...rowStyle }}>{row.SagDurationMilliseconds} ms ({row.SagDurationCycles} cycles)</td>
                    <td style={{ width: 220, ...rowStyle }}>{row.StartTime}</td>
                    <td style={{ width: 200, ...rowStyle }}>{row.MeterName}</td>
                    <td style={{ width: 300, ...rowStyle }}>{row.AssetName}</td>
                </tr>))
        });
                
        return handle;
    }

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={550} width={996}>
            <table className="table" style={{ fontSize: 'small', marginBottom: 0 }}>
                <thead style={{ display: 'table', tableLayout: 'fixed', marginBottom: 0 }}>
                    <tr>
                        <th style={{ width: 60, ...rowStyle }}>Event ID</th>
                        <th style={{ width: 80, ...rowStyle }}>Event Type</th>
                        <th style={{ width: 80, ...rowStyle }}>Magnitude</th>
                        <th style={{ width: 200, ...rowStyle }}>Duration</th>
                        <th style={{ width: 220, ...rowStyle }}>Start Time</th>
                        <th style={{ width: 200, ...rowStyle }}>Meter Name</th>
                        <th style={{ width: 300, ...rowStyle }}>Asset Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className='btn btn-primary' onClick={() => props.exportCallback()}>Export(csv)</button></th>
                    </tr>
                </thead>
                <tbody style={{ maxHeight: 500, overflowY: 'auto', display: 'block' }}>
                    {tblData}
                </tbody>
            </table>
        </WidgetWindow>
    );

}

export default TimeCorrelatedSagsWidget

