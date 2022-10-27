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
import { selectHover, selectDeltaHoverPoints } from '../store/dataSlice';
import { selectColor } from '../store/settingSlice';


interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
    position: [number, number],
    setPosition: (t: number, l: number) => void
}

const ToolTipDeltaWidget = (props: Iprops) => {
    const hover = useSelector(selectHover);
    const points = useSelector(selectDeltaHoverPoints);
    const colors = useSelector(selectColor);


    let data: Array<JSX.Element> = (props.isOpen? points.map((p, i) => <tr key={i}>
        <td className="dot" style={{ background: colors[p.Color], width: '12px' }}>&nbsp;&nbsp;&nbsp;</td>
        <td style={{ textAlign: 'left' }}><b>{p.Name}</b></td>
        <td style={{ textAlign: "right" }}><b>{(p.Value * (p.Unit.short == 'pu' || p.Unit.short == 'pu/s' ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b></td>
        <td style={{ textAlign: "right" }}><b>{(p.PrevValue * (p.Unit.short == 'pu' || p.Unit.short == 'pu/s' ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b></td>
        <td style={{ textAlign: "right" }}><b>{((p.Value - p.PrevValue) * (p.Unit.short == 'pu' || p.Unit.short == 'pu/s' ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b></td>
    </tr>) : [])


    let firstDate = hover[0];
    let secondDate = props.isOpen && points.length > 0? points[0].Time : NaN;

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={600} width={538} position={props.position} setPosition={props.setPosition} >
            <div style={{ textAlign: 'center' }} >
                <table className="table" style={{ display: 'block', overflowY: 'scroll', maxHeight: '576px', overflowX: 'hidden', marginBottom: 0 }}>
                    <thead>
                        <tr><td style={{ width: 34 }}></td>
                            <td style={{width: 120 }}></td>
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
        </WidgetWindow>
        
    )
}

export default ToolTipDeltaWidget;
