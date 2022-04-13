//******************************************************************************************************
//  LightningData.tsx - Gbtc
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
//  03/13/2019 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { utc } from 'moment';
import { outerDiv, handle, closeButton, WidgetWindow } from './Common';


interface Iprops { closeCallback: () => void, eventId: number, isOpen: boolean }
declare const window: any

const LightningDataWidget = (props: Iprops) => {
    const [tblData, setTBLData] = React.useState<Array<JSX.Element>>([]);

    function getData(): JQuery.jqXHR {
        const lightningQuery = window.LightningQuery;

        if (lightningQuery === undefined)
            return;

        const updateTable = displayData => {
            const arr = Array.isArray(displayData) ? displayData : [displayData];
            const result = [];
            result.push(
                <tr key='Header'>
                    {Object.keys(arr[0]).map(key => <th key={key}>{key}</th>)}
                </tr>)
            result.push(...arr.map((row, index) =>
                <tr style={{ display: 'table', tableLayout: 'fixed', width: '100%' }} key={"row" + index}>
                    {Object.keys(row).map(key => <td key={"row" + index + key}>{row[key]}</td>)}
                </tr>))
            setTBLData(result);
        };

        const errHandler = err => {
            let message = "Unknown error";

            if (typeof (err) === "string")
                message = err;
            else if (err && typeof (err.message) === "string" && err.message !== "")
                message = err.message;

            updateTable({ Error: message });
        };

        updateTable({ State: "Loading..." });

        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetLightningParameters?eventId=${props.eventId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(lightningParameters => {
            const noData = { State: "No Data" };

            const lineKey = lightningParameters.LineKey;
            const startTime = utc(lightningParameters.StartTime).toDate();
            const endTime = utc(lightningParameters.EndTime).toDate();

            if (!lineKey) {
                updateTable(noData);
                return;
            }

            lightningQuery.queryLineGeometry(lineKey, lineGeometry => {
                lightningQuery.queryLineBufferGeometry(lineGeometry, lineBufferGeometry => {
                    lightningQuery.queryLightningData(lineBufferGeometry, startTime, endTime, lightningData => {
                        const displayData = (lightningData.length !== 0) ? lightningData : noData;
                        updateTable(displayData);
                    }, errHandler);
                }, errHandler);
            }, errHandler);
        });

        return handle;
    }

    React.useEffect(() => {
        const handle = getData();

        return () => { if (handle !== undefined && handle.abort !== undefined) handle.abort(); }
    }, [props.eventId]);

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={500} width={800}>
                <table className="table" style={{ fontSize: 'small', marginBottom: 0 }}>
                    <thead style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)' }}>
                        {tblData[0]}
                    </thead>
                    <tbody style={{ maxHeight: 410, overflowY: 'auto', display: 'block' }}>
                        {tblData.slice(1)}
                    </tbody>
            </table>
         </WidgetWindow>
    );
}

export default LightningDataWidget;

