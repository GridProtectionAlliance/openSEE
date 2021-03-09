//******************************************************************************************************
//  HarmonicStats.tsx - Gbtc
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
import { outerDiv, handle, closeButton, WidgetWindow } from './Common';

interface Iprops { closeCallback: () => void, exportCallback: () => void, eventId: number, isOpen: boolean }

const HarmonicStatsWidget = (props: Iprops) => {

    const [tblData, setTblData] = React.useState<Array<JSX.Element>>([]);

    
    React.useEffect(() => {
        let handle = getData();

        return () => { if (handle != undefined && handle.abort != undefined) handle.abort(); }
    }, [props.eventId])

    function getData(): JQuery.jqXHR {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHarmonics?eventId=${props.eventId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done((data) => {
            let rows = [];
            rows.push(
                <tr>
                    <th colSpan={1}><button className='btn btn-primary' style={{ width: 75 }} onClick={() => props.exportCallback()}>Export</button></th>
                    {data.map((key,i) => <th colSpan={2} scope='colgroup' key={i}>{key.Channel}</th>)}
                </tr>)

            rows.push(
                <tr>
                    <th>Harmonic</th>
                    {data.map((item, index) => <React.Fragment key={index}><th>Mag</th> <th>Ang</th> </React.Fragment>)}
                </tr>)


            let numChannels = data.length;
            let jsons = data.map(x => JSON.parse(x.SpectralData));
            let numHarmonics = Math.max(...jsons.map(x => Object.keys(x).length));
                        
            for (var index = 1; index <= numHarmonics; ++index) {
                let tds = [];
                let label = 'H' + index
                for (let j = 0; j < numChannels; ++j) {
                    let key = data[j].Channel + label
                    if (jsons[j][label] != undefined) {
                        tds.push(<td key={key + 'Mag'}>{jsons[j][label].Magnitude.toFixed(2)}</td>);
                        tds.push(<td key={key + 'Ang'}>{jsons[j][label].Angle.toFixed(2)}</td>);
                    }
                    else {
                        tds.push(<td key={key + 'Mag'}></td>);
                        tds.push(<td key={key + 'Ang'}></td>);
                    }
                }
                rows.push(
                    <tr style={{ display: 'table', tableLayout: 'fixed', width: '100%' }} key={label}>
                        <td>{label}</td>
                        {tds}
                    </tr>);
            }
            setTblData(rows);
        });

        return handle;
    }

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={600} width={1706}>
            <div style={{ maxWidth: 1700 }}>
                <table className="table" style={{ fontSize: 'large', marginBottom: 0 }}>
                    <thead style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)' }}>
                        {tblData[0]}
                        {tblData[1]}
                    </thead>
                    <tbody style={{ fontSize: 'medium', height: 500, maxHeight: 500, overflowY: 'auto', display: 'block' }}>
                        {tblData.slice(2)}
                    </tbody>
                </table>
            </div>
        </WidgetWindow>
    );

}

export default HarmonicStatsWidget;


