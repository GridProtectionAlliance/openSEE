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
import moment from 'moment';
import { useSelector } from 'react-redux';
import { SelectColor } from '../Store/settingSlice';
import HoverContext from '../Context/HoverContext';
import { PlotDataStateContext } from '../Context/PlotDataContext';
import { PlotStateStateContext } from '../Context/PlotStateContext';
import EventContext from '../Context/EventContext';
import AnalyticContext from '../Context/AnalyticContext';
import { selectHoverPoints } from '../PlotSelectors';
import { Alert } from '@gpa-gemstone/react-interactive';

const ToolTipWidget = () => {
    const [hover] = React.useContext(HoverContext);
    const { plots } = React.useContext(PlotDataStateContext);
    const { meta } = React.useContext(PlotStateStateContext);
    const evt = React.useContext(EventContext);
    const [analytic] = React.useContext(AnalyticContext);
    const colors = useSelector(SelectColor);

    const points = React.useMemo(() => selectHoverPoints(hover, evt.Context.EventID, plots, meta, analytic.Harmonic), [hover, evt.Context.EventID, plots, meta, analytic.Harmonic]);

    if (points.length === 0)
        return (
            <div className="row justify-content-center" style={{ padding: '10px' }}>
                <div className="col-12">
                    <Alert Class='alert-info'>
                        No data for Tooltip.
                    </Alert>
                </div>
            </div>
        );

    return (
        <div className="d-flex" style={{ width: '100%', height: '100%', textAlign: 'center', overflowY: 'hidden' }}>
            <div className="d-flex flex-column" style={{ height: '100%', marginBottom: 0, overflowY: 'hidden', padding: "3%", width: '100%', boxSizing: 'border-box' }}>
                <div className="row no-gutters border-top" style={{ flex: '0 0 auto', position: 'sticky', top: 0, zIndex: 1 }}>
                    <div className="col" style={{ textAlign: 'center' }}>
                        <b>{moment(hover[0]).utc().format("MM-DD-YYYY HH:mm:ss.SSSSSS")}</b>
                    </div>
                </div>
                <div className="d-flex flex-column" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
                    {points.map((p, i) =>
                        <div className="row no-gutters border-top" key={i} style={{ flex: '1 0 auto' }}>
                            <div className="col-1 dot" style={{ background: colors[p.Color] }} />
                            <div className="col" style={{ textAlign: 'left' }}>
                                <b>{p.Name}</b>
                            </div>
                            <div className="col-auto" style={{ textAlign: 'right' }}>
                                <b>{(p.Value * (p.Unit.factor === undefined ? 1.0 / p.BaseValue : p.Unit.factor)).toFixed(2)} ({p.Unit.short})</b>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ToolTipWidget;