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
//  05/14/2018 - Preston Crawford
//       Updated layout
//******************************************************************************************************

import * as React from 'react';
import moment = require('moment');
import { useSelector } from 'react-redux';
import { selectHoverPoints } from '../store/dataSlice';
import { SelectColor } from '../store/settingSlice';
import HoverContext from '../Context/HoverContext'


const ToolTipWidget = () => {
    const hover = React.useContext(HoverContext);
    const points = useSelector(selectHoverPoints(hover.hover));
    const colors = useSelector(SelectColor);

    return (
        <div className="d-flex" style={{ width: '100%', height: '100%', textAlign: 'center' }}>
            <table className="table" style={{ height: '100%', marginBottom: 0, overflowY: 'auto', margin: "3%" }}>
                <thead>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                        <b>{moment(hover.hover[0]).utc().format("MM-DD-YYYY HH:mm:ss.SSSSSS")}</b>
                    </td>
                </thead>
                <tbody>
                    {points.map((p, i) =>
                        <tr key={i}>
                            <td className="dot" style={{ background: colors[p.Color], width: 12 }}><b>&nbsp;&nbsp;&nbsp;</b></td>
                            <td style={{ width: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5, textAlign: 'left' }}>
                                <b>{p.Name}</b>
                            </td>
                            <td style={{ width: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5, textAlign: 'right' }}>
                                <b>{(p.Value * (p.Unit.short == 'pu' || p.Unit.short == 'pu/s' ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b>
                            </td>
                        </tr>)}
                </tbody>
            </table>
        </div>
    )
}

export default ToolTipWidget
