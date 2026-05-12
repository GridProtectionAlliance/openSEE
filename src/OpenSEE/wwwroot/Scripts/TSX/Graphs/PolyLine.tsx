//******************************************************************************************************
//  PolyLine.tsx - Gbtc
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

export interface PolyLineSpec {
    className: string;
    left: number;
    style: React.CSSProperties;
}

interface IProps extends PolyLineSpec {
    height: number;
}

const PolyLine = (props: IProps) => {
    return (
        <g className={props.className}>
            <polyline className="polyLine" points={`${props.left + 10},20 ${props.left + 10},${props.height}`} style={props.style} />
        </g>
    );
}

export default PolyLine;
