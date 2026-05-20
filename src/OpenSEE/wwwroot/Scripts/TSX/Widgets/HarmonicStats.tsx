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
import { Application } from '@gpa-gemstone/application-typings';
import { Alert } from '@gpa-gemstone/react-interactive';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';

interface Iprops {
    EventID: number,
    ExportCallback: (arg: string) => void
}

const HarmonicStatsWidget = (props: Iprops) => {
    const [tblData, setTblData] = React.useState<Array<JSX.Element>>([]);
    const [status, setStatus] = React.useState<Application.Types.Status>('uninitiated');
    
    React.useEffect(() => {
        setStatus('loading');

        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHarmonics?eventId=${props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done((data) => {
            const rows: JSX.Element[] = [];
            rows.push(
                <tr>
                    <th colSpan={1}><button className='btn btn-primary' style={{ width: 75 }} onClick={() => props.ExportCallback('harmonics')}>Export</button></th>
                    {data.map((key, i) => <th colSpan={2} scope='colgroup' key={i}>{key.Channel}</th>)}
                </tr>)

            rows.push(
                <tr>
                    <th>Harmonic</th>
                    {data.map((item, index) => <React.Fragment key={index}><th>Mag</th> <th>Ang</th> </React.Fragment>)}
                </tr>)


            const numChannels = data.length;
            const jsons = data.map(x => JSON.parse(x.SpectralData));
            const numHarmonics = Math.max(...jsons.map(x => Object.keys(x).length));

            for (let index = 1; index <= numHarmonics; ++index) {
                const tds: JSX.Element[] = [];
                const label = 'H' + index
                for (let j = 0; j < numChannels; ++j) {
                    const key = data[j].Channel + label
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
            setStatus('idle');
        });
        handle.fail(() => setStatus('error'));

        return () => { if (handle?.abort != null) handle.abort(); }
    }, [props.EventID])

    return (
        <>
            {status === 'loading' || status === 'uninitiated' ?
                <div className="d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%' }}>
                    <ReactIcons.SpiningIcon Size={'100%'} />
                </div>
                : null}
            {status === 'error' ?
                <div className="row justify-content-center">
                    <div className="col-12">
                        <Alert Class='alert-danger'>
                            Error retrieving harmonic stats.
                        </Alert>
                    </div>
                </div>
                : null}
            {status === 'idle' ?
                <div className="d-flex" style={{ width: '100%', height: '100%' }}>
                <table className="table" style={{ fontSize: 'large', marginBottom: 0, height: '100%', width: '100%' }}>
                    <thead style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)' }}>
                        {tblData[0]}
                        {tblData[1]}
                    </thead>
                    <tbody style={{ fontSize: 'medium', height: 500, maxHeight: 500, overflowY: 'auto', display: 'block' }}>
                        {tblData.slice(2)}
                    </tbody>
                </table>
                </div>
                : null}
        </>
    );

}

export default HarmonicStatsWidget;


