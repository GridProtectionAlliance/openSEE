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
import { useSelector } from 'react-redux';
import { SelectFFTData } from '../store/dataSlice';


const FFTTable = () => {
    const fftPoints = useSelector(SelectFFTData);

    const showAng = (index, row) => {
        let f = fftPoints[index].PhaseUnit != undefined ? fftPoints[index].PhaseUnit.factor : 1.0;
        let val = fftPoints[index].Angle[row] * f;
        return isNaN(val) ? <td key={`ang-${index}-${row}`}>N/A</td> : <td key={`ang-${index}-${row}`}>{val.toFixed(2)}</td>;
    };


    const showMag = (index, row) => {
        let f = (fftPoints?.[index]?.Unit?.factor === undefined ? 1.0 / fftPoints?.[index]?.BaseValue : fftPoints[index]?.Unit?.factor);
        let val = fftPoints?.[index]?.Magnitude[row] * f;
        return isNaN(val) ? <td key={`mag-${index}-${row}`} >N/A</td> : <td key={`mag-${index}-${row}`}>{val.toFixed(2)}</td>;
    };

    return (
        <>
            {fftPoints.length > 0 ? 
            <div className="d-flex flex-column" style={{ height: '95%', width: '100%', overflow: 'auto', padding: '10px' }}>
                <table className="table table-bordered table-hover" style={{ height: '100%', marginBottom: 0, width: '100%' }}>
                        <thead>
                            <tr>
                                <th></th>
                                {fftPoints.map((item, index) => (
                                    <th colSpan={2} key={`header-${index}`}><span>{item.Asset} {item.Phase}</span></th>
                                ))}
                            </tr>
                            <tr>
                                <th>Harmonic [Hz]</th>
                                {fftPoints.map((item, index) => (
                                    <React.Fragment key={`headerFrag-${index}`}>
                                        <th key={`mag-${index}`}><span>Mag ({item?.Unit?.short})</span></th>
                                        <th key={`ang-${index}`}><span>Ang ({item?.PhaseUnit?.short})</span></th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                        {fftPoints[0].Angle.map((a, row) => (
                            <tr key={a+row}>
                                <td key={a+row} >{(row > 0 ? fftPoints[0].Frequency[row].toFixed(2) : 'DC')}</td>
                                {fftPoints.map((_, index) => (
                                    <React.Fragment key={`row-${index}-${row}`}>
                                        {showMag(index, row)}
                                        {showAng(index, row)}
                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                : null}
        </>
    );
}

export default FFTTable;
