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
//  01/24/2024 - Preston Crawford
//       Fix Remove point button / refactor table layout
//
//******************************************************************************************************
import * as React from 'react';
import { SelectColor } from '../store/settingSlice';
import { useAppSelector } from '../hooks';
import { PlotDataStateContext } from '../Context/PlotDataContext';
import { PlotStateStateContext, PlotStateActionContext } from '../Context/PlotStateContext';
import EventContext from '../Context/EventContext';
import { selectSelectedPoints } from '../PlotSelectors';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';

const PointWidget = () => {
    const { plots } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);
    const evt = React.useContext(EventContext);
    const colors = useAppSelector(SelectColor);

    const points = React.useMemo(
        () => selectSelectedPoints(evt.Context.EventID, plots, plotState.meta),
        [evt.Context.EventID, plots, plotState.meta]
    );

    const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);

    const flexRef = React.useRef<HTMLDivElement | null>(null);
    const { offsetWidth: flexWidth } = useGetContainerPosition(flexRef);

    const firstCellRef = React.useRef<HTMLTableCellElement | null>(null);
    const secondCellRef = React.useRef<HTMLTableCellElement | null>(null);
    const { offsetWidth: firstCellWidth } = useGetContainerPosition(firstCellRef);
    const { offsetWidth: secondCellWidth } = useGetContainerPosition(secondCellRef);

    const [leftPosition, setLeftPosition] = React.useState({ secondCell: 0, thirdCell: 0 });

    React.useLayoutEffect(() => {
        setLeftPosition({ secondCell: firstCellWidth, thirdCell: firstCellWidth + secondCellWidth });
    }, [firstCellWidth, secondCellWidth]);

    return (
        <div className="d-flex flex-column" ref={flexRef} style={{ height: '100%', width: '100%', padding: '10px' }}>
            <div style={{ height: '93%', width: '100%', maxWidth: flexWidth, overflowX: 'auto', overflowY: 'auto' }}>
                <table className="table table-bordered" style={{ height: '100%', marginBottom: 0, width: "100%" }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 200 }}>
                        <tr>
                            <td ref={firstCellRef} className="dot" style={{ backgroundColor: 'white', width: 12, position: 'sticky', left: 0, zIndex: 100 }}>
                                <b>&nbsp;&nbsp;&nbsp;</b>
                            </td>
                            <td ref={secondCellRef} style={{ width: 120, position: 'sticky', left: leftPosition.secondCell, zIndex: 100, backgroundColor: 'white', textAlign: 'center', verticalAlign: 'middle' }}>
                                <b>Time</b>
                            </td>
                            <td style={{ position: 'sticky', left: leftPosition.thirdCell, top: 0, zIndex: 200, backgroundColor: 'white', textAlign: 'center', verticalAlign: 'middle' }}>
                                <b>Value</b>
                                <hr style={{ width: '100%' }} />
                                <b>Delta</b>
                            </td>
                            {points[0]?.Value?.map((p, i) => (
                                <td key={i} style={{ maxHeight: 100, backgroundColor: (selectedIndex === i ? 'yellow' : 'white'), zIndex: 100, textAlign: 'center', verticalAlign: 'middle' }}>
                                    <span>
                                        {(p[0] - plotState.startTime).toFixed(7)} sec<hr />{((p[0] - plotState.startTime) * 60.0).toFixed(2)} cycles
                                    </span>
                                </td>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {points.map((point, pointIndex) => (
                            <tr key={pointIndex} style={{ maxWidth: flexWidth }}>
                                <td className="dot" style={{ backgroundColor: colors[point.Color], width: 12, position: 'sticky', left: 0, zIndex: 100 }}>
                                    <b>&nbsp;&nbsp;&nbsp;</b>
                                </td>
                                <td style={{ width: 120, paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5, position: 'sticky', left: leftPosition.secondCell, zIndex: 100, backgroundColor: 'white', textAlign: 'center', verticalAlign: 'middle' }}>
                                    <b>{point.Group}</b>
                                </td>
                                <td style={{ position: 'sticky', left: leftPosition.thirdCell, top: 0, zIndex: 200, backgroundColor: 'white', textAlign: 'center', verticalAlign: 'middle' }}>
                                    <b>Value</b>
                                    <hr style={{ width: '100%' }} />
                                    <b>Delta</b>
                                </td>
                                {point.Value.map((p, i) => (
                                    <td key={i} onClick={() => setSelectedIndex(i)} style={{ backgroundColor: (selectedIndex === i ? 'yellow' : undefined), textAlign: 'center', verticalAlign: 'middle' }}>
                                        <span>
                                            {(p[1] * (point.Unit?.factor === undefined ? 1.0 / point.BaseValue : point.Unit?.factor)).toFixed(2)} {point?.Unit?.short}
                                        </span>
                                        <hr style={{ width: '100%' }} />
                                        <span>
                                            {i === 0 ? 'N/A' :
                                                ((point.Value[i - 1][1] - p[1]) * (point.Unit?.factor === undefined ? 1.0 / point.BaseValue : point.Unit?.factor)).toFixed(4)} {point?.Unit?.short}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ height: '7%' }}>
                <input style={{ marginTop: '5px' }} className="btn btn-primary" type="button" value="Remove" onClick={() => { if (selectedIndex !== -1) stateActions.RemoveSelectPoints(selectedIndex); setSelectedIndex(-1); }} />
                <input style={{ marginTop: '5px', marginLeft: '5px' }} className="btn btn-primary" type="button" value="Pop" onClick={() => stateActions.RemoveSelectPoints(points[0].Value.length - 1)} />
                <input style={{ marginTop: '5px', marginLeft: '5px' }} className="btn btn-primary" type="button" value="Clear" onClick={() => { stateActions.ClearSelectPoints(); setSelectedIndex(-1); }} />
            </div>
        </div>
    );
};

export default PointWidget;