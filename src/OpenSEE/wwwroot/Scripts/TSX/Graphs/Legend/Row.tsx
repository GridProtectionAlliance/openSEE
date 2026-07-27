//******************************************************************************************************
//  Row.tsx - Gbtc
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
import { LegendTraceKey } from '../../Context/PlotKeys';
import { ILegendGrid, LegendGroupType } from './Types';
import TraceButton from './TraceButton';

interface IProps {
    category: string,
    label: string,
    data: ILegendGrid[],
    width: number,
    clickHeader: (g: string, t: LegendGroupType) => void,
    horizontalHeaders: string[],
    toggleTrace: (traceKey: LegendTraceKey) => void
}

const Row = (props: IProps) => {
    const hasHorizontalHeaders = props.horizontalHeaders.some(h => h);
    const hasCategory = props.category !== '' && props.category !== null;
    const labelWidth = !hasHorizontalHeaders && !hasCategory ? '50%' : hasHorizontalHeaders && !hasCategory ? 2 * props.width : props.width;

    return (
        <div className="d-flex" style={{ width: "100%", backgroundColor: "rgb(204,204,204)", textAlign: "center", borderTop: "2px solid #b2b2b2", height: 'auto' }}>
            <div style={{ width: labelWidth, textAlign: "center", cursor: 'pointer' }}>
                <span style={{ fontSize: "smaller", fontWeight: "bold", wordWrap: 'break-word' }} onClick={() => props.clickHeader(props.label + props.category, 'vertical')}>
                    {props.label}
                </span>
            </div>
            {props.data.map((item, i) =>
                <TraceButton
                    key={i}
                    width={!hasHorizontalHeaders && !hasCategory ? { width: '50%' } : { width: props.width }}
                    data={item}
                    onToggle={props.toggleTrace}
                />
            )}
        </div>
    );
};

export default Row;
