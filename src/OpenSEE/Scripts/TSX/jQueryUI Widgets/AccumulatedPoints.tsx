//******************************************************************************************************
//  AccumulatedPoints.tsx - Gbtc
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
//  05/11/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { WidgetWindow } from './Common';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedPoints, selectStartTime, RemoveSelectPoints, ClearSelectPoints } from '../store/dataSlice';
import { Dispatch } from '@reduxjs/toolkit';

interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
    position: [number, number],
    setPosition: (t: number, l: number) => void
}

const PointWidget = (props: Iprops) => {
    const points = useSelector(selectSelectedPoints);
    const startTime = useSelector(selectStartTime);
    const dispatch = useDispatch();

    const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);

    let data: Array<JSX.Element> = (points.length > 0 && props.isOpen ? points[0].Value.map((p, i) => <tr key={i} onClick={() => setSelectedIndex(i)} style={{ backgroundColor: (selectedIndex == i ? 'yellow' : null) }}>
        <td>
            <span>
                {(p[0] - startTime).toFixed(7)} sec<br />{((p[0] - startTime) * 60.0).toFixed(2)} cycles
            </span>
        </td>
        <td>
            <span>
                {i == 0 ? 'N/A' : <> {(points[0].Value[i - 1][0] - p[0]).toFixed(4)} sec<br /> {((points[0].Value[i - 1][0] - p[0]) * 60.0).toFixed(2)} cycles) </>}
            </span>
        </td>
        {points.map((pt, j) => <>
            <td key={j + '-1'}>
                <span>
                    {(pt.Value[i][1] * (pt.Unit.short == 'pu' || pt.Unit.short == 'pu/s' ? 1.0 / pt.BaseValue : pt.Unit.factor)).toFixed(2)} ({pt.Unit.short})
                </span>
            </td>
            <td key={j + '-2'}>
                <span>
                    {i == 0 ? 'N/A' : ((pt.Value[i - 1][1] - pt.Value[i][1]) * (pt.Unit.short == 'pu' || pt.Unit.short == 'pu/s' ? 1.0 / pt.BaseValue : pt.Unit.factor)).toFixed(4)} ({pt.Unit.short})
                </span>
            </td>
        </>)}        
    </tr> ): [])

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={350} width={500} position={props.position} setPosition={props.setPosition}>
            <table className="table table-bordered table-hover" style={{ overflowX: 'scroll', marginBottom: 0, width: 494, display: 'block' }}>
                <thead>
                    <tr>
                        {props.isOpen ?
                            <>
                                <td colSpan={2} style={{ minWidth: 240, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }}> </td>
                                {points.map((p, i) => <td style={{ minWidth: 240, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }} colSpan={2} key={i}><span>{p.Group}<br />{p.Name}</span> </td>)}
                            </>: null}
                    </tr>
                    <tr>
                        <td style={{ minWidth: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }} ><span>Value</span> </td>
                        <td style={{ minWidth: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }} ><span>Delta</span> </td>
                        {points.map((p, i) => <React.Fragment key={i}>
                            <td style={{ minWidth: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }}><span>Value</span> </td>
                            <td style={{ minWidth: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 }}><span>Delta</span> </td>
                        </React.Fragment>)}
                    </tr>
                </thead>
                <tbody>
                    {props.isOpen ? data : null}
                </tbody>
            </table>

            <div style={{ margin: '5px', textAlign: 'right' }}>
                <input className="btn btn-primary" type="button" value="Remove" onClick={() => { if (selectedIndex != -1) dispatch(RemoveSelectPoints(selectedIndex)); }} />
                <input className="btn btn-primary" type="button" value="Pop" onClick={() => dispatch(RemoveSelectPoints(points[0].Value.length - 1))} />
                <input className="btn btn-primary" type="button" value="Clear" onClick={() => dispatch(ClearSelectPoints())} />
                </div>
        </WidgetWindow>
    );

}

export default PointWidget;
