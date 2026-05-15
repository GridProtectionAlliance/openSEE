//******************************************************************************************************
//  ChartContainer.tsx - Gbtc
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

import * as React from 'react';
import { OpenSee } from '../global';
import { ErrorIcon, LoadingIcon, NoDataIcon } from './ChartIcons';
import PolyLine, { PolyLineSpec } from './PolyLine';

interface IContainerProps {
    height: number;
    dataKey: OpenSee.IGraphProps;
    loading: OpenSee.LoadingState;
    hasData: boolean;
    hasTrace: boolean;
    polyLines?: PolyLineSpec[];
}

const ChartContainer = React.memo(React.forwardRef<HTMLDivElement, IContainerProps>((props, ref) => {
    const showSVG = props.loading != 'Loading' && props.hasData;

    return (
        <div ref={ref} data-drawer={"graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId} id={"graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId} style={{ height: props.height, width: '100%' }}>
            {props.loading === 'Loading' ? <LoadingIcon /> : null}
            {props.loading != 'Loading' && props.loading != 'Error' && !props.hasData ? <NoDataIcon /> : null}
            {props.loading === 'Error' ? <ErrorIcon /> : null}

            <svg className="root" style={{ width: (showSVG ? '100%' : 0), height: (showSVG ? '100%' : 0) }}>
                {showSVG ? (
                    <g className="polyLineOverlay" transform="translate(10,0)">
                        {(props.polyLines ?? []).map(line => (
                            <PolyLine
                                className={line.className}
                                key={line.className}
                                points={line.points}
                                style={line.style}
                            />
                        ))}
                    </g>
                ) : null}

                {props.loading != 'Loading' && props.hasData && !props.hasTrace ?
                    <text x={'50%'} y={'45%'} style={{ textAnchor: 'middle', fontSize: 'x-large' }} > Select a Trace in the Legend to Display. </text>
                    : null}
            </svg>
        </div>
    );
}));

export default ChartContainer;
