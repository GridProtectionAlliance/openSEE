//******************************************************************************************************
//  VCategory.tsx - Gbtc
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

interface IProps {
    label: string,
    height: number,
    width: number
}

const VCategory = (props: IProps) => (
    <div style={{ width: props.width, borderTop: "2px solid #b2b2b2", height: props.height }}>
        <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap", writingMode: "vertical-rl", height: "100%", transform: 'rotate(180deg)' }}>
            {props.label}
        </span>
    </div>
);

export default VCategory;
