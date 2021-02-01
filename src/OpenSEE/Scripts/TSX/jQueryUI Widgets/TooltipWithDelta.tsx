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
import { outerDiv, handle, closeButton } from './Common';
import { useSelector, useDispatch } from 'react-redux';
import { selectHover, selectHoverPoints, selectDeltaHoverPoints } from '../store/dataSlice';
import { selectColor } from '../store/settingSlice';


interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
}

const ToolTipDeltaWidget = (props: Iprops) => {
    const hover = useSelector(selectHover);
    const points = useSelector(selectDeltaHoverPoints);
    const colors = useSelector(selectColor);

    React.useEffect(() => {
        ($("#tooltipwithdelta") as any).draggable({ scroll: false, handle: '#tooltipwithdeltahandle', containment: '#chartpanel' });
    }, [props])

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
        <div id="tooltipwithdelta" className="ui-widget-content" style={outerDiv}>
            <div id="tooltipwithdeltahandle" className={handle}></div>
            <div>
                <div style={{ textAlign: 'center', maxHeight: '580px' }} >
                    <table className="table" style={{ display: 'block', overflowY: 'scroll', maxHeight: '580px' }}>
                        <thead>
                            <tr><td style={{ width: 34 }}></td>
                                <td></td>
                                <td><b>{(!isNaN(firstDate) ? moment(firstDate).utc().format("HH:mm:ss.SSSSSS") : null)}</b></td>
                                {!isNaN(secondDate) ? <>
                                    <td><b>{(moment(secondDate).utc().format("HH:mm:ss.SSSSSS"))}</b></td>
                                    <td><b>{(!isNaN(firstDate) ? (secondDate - firstDate) / 1000 + ' (s)' : '')}</b></td> 
                                    </>: <td colSpan={2}><b>Select a Point</b></td>}
                            </tr>
                        </thead>
                        <tbody>
                            {props.isOpen? data : null}
                        </tbody>
                    </table>
                </div>
            </div>
            <button className={closeButton} onClick={() => { props.closeCallback() }}>X</button>
        </div>
    )
}

export default ToolTipDeltaWidget;
