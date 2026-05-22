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
import React from 'react';
import moment from 'moment';
import { SelectColor } from '../store/settingSlice';
import { useAppSelector } from '../hooks';
import HoverContext from '../Context/HoverContext';
import { PlotDataStateContext } from '../Context/PlotDataContext';
import { PlotStateStateContext } from '../Context/PlotStateContext';
import EventContext from '../Context/EventContext';
import AnalyticContext from '../Context/AnalyticContext';
import { selectDeltaHoverPoints } from '../PlotSelectors';
import { Alert } from '@gpa-gemstone/react-interactive';

const columnTextStyle = { minWidth: 0, overflowWrap: 'anywhere' } as React.CSSProperties;

const ToolTipDeltaWidget = () => {
    const [hover] = React.useContext(HoverContext);
    const { plots } = React.useContext(PlotDataStateContext);
    const { meta } = React.useContext(PlotStateStateContext);
    const evt = React.useContext(EventContext);
    const [analytic] = React.useContext(AnalyticContext);
    const colors = useAppSelector(SelectColor);

    const points = React.useMemo(() => selectDeltaHoverPoints(hover, evt.Context.EventID, plots, meta, undefined, analytic.Harmonic), [hover, evt.Context.EventID, plots, meta, analytic.Harmonic]);

    const firstDate = hover[0];
    const secondDate = points.length > 0 ? points[0].Time : NaN;

    if (points.length === 0)
        return (
            <div className="row justify-content-center" style={{ padding: '10px' }}>
                <div className="col-12">
                    <Alert Class='alert-info'>
                        No data for Tooltip w/ Delta.
                    </Alert>
                </div>
            </div>
        );

    return (
        <div className="d-flex flex-column" style={{ height: '100%', width: '100%', padding: '10px', overflowX: 'hidden', overflowY: 'hidden', boxSizing: 'border-box' }}>
            <div className="row no-gutters border-top" style={{ flex: '0 0 auto', position: 'sticky', top: 0, zIndex: 1 }}>
                <div className={`${!isNaN(secondDate) ? 'col-4' : 'col-6'} px-1 pb-1 text-center`} style={columnTextStyle}>
                    <b>{(!isNaN(firstDate) ? moment(firstDate).utc().format("HH:mm:ss.SSSSSS") : null)}</b>
                </div>
                {!isNaN(secondDate) ?
                    <>
                        <div className="col-4 px-1 pb-1 text-center" style={columnTextStyle}>
                            <b>{(moment(secondDate).utc().format("HH:mm:ss.SSSSSS"))}</b>
                        </div>
                        <div className="col-4 px-1 pb-1 text-center" style={columnTextStyle}>
                            <b>{(!isNaN(firstDate) ? ((secondDate - firstDate) / 1000).toFixed(9) + ' (s)' : '')}</b>
                        </div>
                    </> :
                    <div className="col-6 px-1 pb-1 text-center" style={columnTextStyle}>
                        <b>Select a Point</b>
                    </div>
                }
            </div>
            <div className="d-flex flex-column" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
                {points.map((p, i) =>
                    <div className="row no-gutters border-top" key={i} style={{ flex: '1 0 auto' }}>
                        <div className="col-1 dot border-left border-right" style={{ background: colors[p.Color] }} />
                        <div className="col-5 text-left border-left border-right" style={columnTextStyle}>
                            <b>
                                {p.Name}
                            </b>
                        </div>
                        <div className="col-2 text-right border-left border-right" style={columnTextStyle}>
                            <b>
                                {(p.Value * (p.Unit.factor === undefined ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})
                            </b>
                        </div>
                        <div className="col-2 text-right border-left border-right" style={columnTextStyle}>
                            <b>
                                {((p.PrevValue ?? 1) * (p.Unit.factor === undefined ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})
                            </b>
                        </div>
                        <div className="col-2 text-right border-left border-right" style={columnTextStyle}>
                            <b>
                                {((p.Value - (p.PrevValue ?? 0)) * (p.Unit.factor === undefined ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})
                            </b>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolTipDeltaWidget;