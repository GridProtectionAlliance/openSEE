//******************************************************************************************************
//  Tooltip.tsx - Gbtc
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
//  01/24/2024 - Preston Crawford
//       Refactored layout  
//
//******************************************************************************************************

import * as React from 'react';
import moment = require('moment');
import { SelectDeltaHoverPoints } from '../store/dataSlice';
import { SelectColor } from '../store/settingSlice';
import { useAppSelector } from '../hooks';
import HoverContext from '../Context/HoverContext'

const ToolTipDeltaWidget = () => {
    const hover = React.useContext(HoverContext);
    const points = useAppSelector(SelectDeltaHoverPoints(hover.hover));
    const colors = useAppSelector(SelectColor);

    let data: Array<JSX.Element> = (points.map((p, i) => <tr key={i}>
        <td className="dot" style={{ background: colors[p.Color], width: '12px' }}>&nbsp;&nbsp;&nbsp;</td>
        <td style={{ textAlign: 'left' }}><b>{p.Name}</b></td>
        <td style={{ textAlign: "right" }}><b>{(p.Value * (p.Unit.factor === undefined ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b></td>
        <td style={{ textAlign: "right" }}><b>{(p.PrevValue * (p.Unit.factor === undefined ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b></td>
        <td style={{ textAlign: "right" }}><b>{((p.Value - p.PrevValue) * (p.Unit.factor === undefined ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b></td>
    </tr>))


    let firstDate = hover.hover[0];
    let secondDate = points.length > 0 ? points[0].Time : NaN;

    return (
        <div className="d-flex" style={{ width: '100%', height: '100%', textAlign: 'center', padding: '10px' }}>
            <table className="table" style={{ width: '100%' ,overflowY: 'auto', height: '100%', overflowX: 'hidden' }}>
                <thead>
                    <tr><td style={{ width: 34 }}></td>
                        <td style={{ width: 120 }}></td>
                        <td style={{ width: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }}>
                            <b>{(!isNaN(firstDate) ? moment(firstDate).utc().format("HH:mm:ss.SSSSSS") : null)}</b>
                        </td>
                        {!isNaN(secondDate) ? <>
                            <td style={{ width: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }}>
                                <b>{(moment(secondDate).utc().format("HH:mm:ss.SSSSSS"))}</b>
                            </td>
                            <td style={{ width: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }}>
                                <b>{(!isNaN(firstDate) ? ((secondDate - firstDate) / 1000).toFixed(9) + ' (s)' : '')}</b>
                            </td>
                        </> : <td colSpan={2} style={{ width: 240, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }} >
                            <b>Select a Point</b>
                        </td>}
                    </tr>
                </thead>
                <tbody>
                    {data}
                </tbody>
            </table>
        </div>
    )
}

export default ToolTipDeltaWidget;
