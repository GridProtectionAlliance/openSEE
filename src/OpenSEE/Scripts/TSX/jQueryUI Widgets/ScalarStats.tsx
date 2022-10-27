//******************************************************************************************************
//  ScalarStats.tsx - Gbtc
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
//  05/14/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { WidgetWindow } from './Common';

interface Iprops {
    closeCallback: () => void,
    exportCallback: () => void,
    eventId: number,
    isOpen: boolean,
    position: [number, number],
    setPosition: (t: number, l: number) => void
}

const ScalarStatsWidget = (props: Iprops) => {
    const [stats, setStats] = React.useState<Array<JSX.Element>>([]);

    React.useEffect(() => {
        let handle = getData();

        return () => { if (handle != undefined && handle.abort != undefined) handle.abort();}
    }, [props.eventId])

    function getData(): JQuery.jqXHR {
            
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetScalarStats?eventId=${props.eventId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done((d) => {
            setStats(Object.keys(d).map(item =>
                <tr style={{ display: 'table', tableLayout: 'fixed', width: '100%' }} key={item}>
                    <td>{item}</td>
                    <td>{d[item]}</td>
                </tr>));
        })
        return handle;
        }

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={400} width={500} position={props.position} setPosition={props.setPosition} >
            <table className="table" style={{ fontSize: 'small', marginBottom: 0 }}>
                    <thead style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)' }}>
                        <tr><th>Stat</th><th>Value&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className='btn btn-primary' onClick={() => props.exportCallback()}>Export(csv)</button></th></tr>
                    </thead>
                    <tbody style={{ maxHeight: 310, overflowY: 'auto', display: 'block' }}>
                        {stats}
                    </tbody>
                </table>
        </WidgetWindow>
    );
}

export default ScalarStatsWidget;