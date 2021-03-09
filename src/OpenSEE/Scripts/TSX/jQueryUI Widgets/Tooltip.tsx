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
//******************************************************************************************************

import * as React from 'react';
import moment = require('moment');
import { WidgetWindow } from './Common';
import { useSelector } from 'react-redux';
import { selectHover, selectHoverPoints } from '../store/dataSlice';
import { selectColor } from '../store/settingSlice';

interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
}

const ToolTipWidget = (props: Iprops) => {
    const hover = useSelector(selectHover);
    const points = useSelector(selectHoverPoints);
    const colors = useSelector(selectColor);
   
    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={350} width={256}>
            <div style={{ textAlign: 'center'}} >
                    <b>{moment(hover[0]).utc().format("MM-DD-YYYY HH:mm:ss.SSSSSS")}</b>
                    <br />
                <table className="table" style={{ maxHeight: '296px', marginBottom: 0, display: 'block', overflowY: 'scroll' }}>
                    <tbody>
                            {props.isOpen ? points.map((p, i) => <tr key={i}>
                                <td className="dot" style={{ background: colors[p.Color], width: 12 }}><b>&nbsp;&nbsp;&nbsp;</b></td>
                                <td style={{ width: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5, textAlign: 'left' }}>
                                    <b>{p.Name}</b>
                                </td>
                                <td style={{ width: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5, textAlign: 'right' }}>
                                    <b>{(p.Value * (p.Unit.short == 'pu' || p.Unit.short == 'pu/s' ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b>
                                </td>
                            </tr>) : null}
                        </tbody>
                    </table>
                </div>
        </WidgetWindow>
        )
}

export default ToolTipWidget
