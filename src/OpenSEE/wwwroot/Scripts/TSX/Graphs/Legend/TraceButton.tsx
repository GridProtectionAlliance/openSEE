//******************************************************************************************************
//  TraceButton.tsx - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  05/08/2026 - Preston Crawford
//       Generated original version of source code
//
//******************************************************************************************************

import * as React from "react";
import { OpenSee } from '../../global';
import { PlotStateActionContext } from '../../Context/PlotStateContext';
import { SeriesKey } from '../../Context/PlotKeys';
import { useAppSelector } from '../../hooks';
import { SelectColor } from '../../Store/settingSlice';
import { ILegendGrid } from './Types';
import { convertHex } from './Utilities';

const TraceButton = (props: { data: ILegendGrid, width: React.CSSProperties, dataKey: OpenSee.IGraphProps, plotData: OpenSee.iD3DataSeries[] }) => {
    const colors = useAppSelector(SelectColor);
    const stateActions = React.useContext(PlotStateActionContext);

    const getColor = (color: OpenSee.Color) => {
        return Object.keys(colors).includes(color as string) ? colors[color] : colors.random;
    };

    const onClick = () => {
        let traces: SeriesKey[] = [];
        props.data.traces.forEach(val => { traces = traces.concat(val); });
        props.data.enabled = !props.data.enabled;
        stateActions.EnableTrace(props.dataKey, traces, props.data.enabled, props.plotData);
    };

    return (
        <div style={{ ...props.width, backgroundColor: convertHex(getColor(props.data.color), props.data.enabled ? 100 : 50), borderLeft: "2px solid #b2b2b2" }} onClick={onClick}>
            {props.data.enabled ?
                <i className="fa fa-minus" /> :
                <i className="fa fa-plus" />
            }
        </div>
    );
};

export default TraceButton;
