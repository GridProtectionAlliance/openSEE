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
import { outerDiv, handle, closeButton } from './Common';
import { useSelector } from 'react-redux';
import { selectFFTData } from '../store/dataSlice';
import { OpenSee } from '../global';
import { selectColor } from '../store/settingSlice';

interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
    eventID: number,
}
const FFTTable = (props: Iprops) => {
    const fftPoints = useSelector(selectFFTData);
    const colors = useSelector(selectColor);

    React.useEffect(() => {
        ($("#ffttable") as any).draggable({ scroll: false, handle: '#ffttablehandle', containment: '#chartpanel' });
    }, [props])

 


    return (
        <div id="ffttable" className="ui-widget-content" style={outerDiv}>
            <div style={{ border: 'black solid 2px' }}>
                <div id="ffttablehandle" className={handle}></div>
                <div style={{ overflowY: 'scroll', overflowX: 'scroll', maxHeight: 580 }}>
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th key="header-harmonic"></th>
                                {fftPoints.map((item, index) => <th colSpan={2} key={index}><span>{item.Asset} {item.Phase}</span> </th>)}
                            </tr>
                            <tr>
                                <th key="header-harmonic">Harmonic</th>
                                {fftPoints.map((item, index) => <> <th key={index + '-mag'}><span>Mag</span> </th><th key={index + '-ang'}><span>Ang</span> </th> </>)}
                            </tr>
                        </thead>
                        <tbody>
                            {(fftPoints.length > 0 ? fftPoints[0].Angle.map((a, i) => Row(i, fftPoints)) : null)}
                        </tbody>
                    </table>
                </div>

                <button className={closeButton} style={{ top: '2px', right: '2px' }} onClick={() => {
                    $('#ffttable').hide();
                }}>X</button>
            </div>

        </div>
    );
}

const Row = (row: number, data: Array<OpenSee.IFFTSeries>) => {
    
    function showAng(index) {
        let val = data[index].Angle[row];
        if (isNaN(val))
            return (<td key={"data-" + index}>N/A</td>)
        return <td key={"data-" + index}>{val.toFixed(2)}</td> ;
    }
    function showMag(index) {
        let val = data[index].Magnitude[row];
        if (isNaN(val))
            return (<td key={"data-" + index}>N/A</td>)
        return <td key={"data-" + index}>{val.toFixed(2)}</td>;
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
        <tr key={"row-" + row}>
            <td key="harmonic">{(row > 1? row.toFixed(0) : row == 0? 'DC' : 'Fund')}</td>
            {createCells()}
        </tr>
    );
}

export default FFTTable;
