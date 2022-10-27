//******************************************************************************************************
//  FFTTable.tsx - Gbtc
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
import { useSelector } from 'react-redux';
import { selectFFTData } from '../store/dataSlice';
import { OpenSee } from '../global';

interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
    position: [number, number]
    setPosition: (t: number, l: number) => void
}
const FFTTable = (props: Iprops) => {
    const fftPoints = useSelector(selectFFTData);

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={300} width={700} position={props.position} setPosition={props.setPosition}>
            <table className="table table-bordered table-hover" style={{ maxHeight: '275px', marginBottom: 0, display: 'block', overflowY: 'scroll' }} >
                <thead>
                    <tr>
                        <th></th>
                        {fftPoints.map((item, index) => <th colSpan={2} key={index}><span>{item.Asset} {item.Phase}</span> </th>)}
                    </tr>
                    <tr>
                        <th>Harmonic [Hz]</th>
                        {fftPoints.map((item, index) => <React.Fragment key={index}>
                            <th><span>Mag ({item.Unit.short})</span> </th>
                            <th><span>Ang ({item.PhaseUnit.short})</span> </th>
                        </React.Fragment>)}
                    </tr>
                </thead>
                <tbody>
                    {(fftPoints.length > 0 ? fftPoints[0].Angle.map((a, i) => Row(i, fftPoints)) : null)}
                </tbody>
            </table> 
        </WidgetWindow>
    );
}

const Row = (row: number, data: Array<OpenSee.IFFTSeries>) => {
    
    function showAng(index) {
        let f = (data[index].PhaseUnit != undefined ? data[index].PhaseUnit.factor : 1.0);
        let val = data[index].Angle[row] * f;
        if (isNaN(val))
            return (<td key={2}>N/A</td>)
        return <td key={2}>{val.toFixed(2)}</td>;
    }
    function showMag(index) {
        let f = (data[index].Unit.short == 'pu' || data[index].Unit.short == 'pu/s' ? 1.0 / data[index].BaseValue : data[index].Unit.factor);
        let val = data[index].Magnitude[row] * f;
        if (isNaN(val))
            return (<td key={1}>N/A</td>)
        return <td key={1}>{val.toFixed(2)}</td>;
    }
    
    function createCells() {
        let res = [];
        data.forEach((a, i) => {
            res.push(showMag(i))
            res.push(showAng(i))
        })
        return res;
    }
    return (
        <tr key={row}>
            <td key={0}>{(row > 0 ? data[0].Frequency[row].toFixed(2) :  'DC')}</td>
            {createCells()}
        </tr>
    );
}

export default FFTTable;
