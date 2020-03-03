﻿//******************************************************************************************************
//  Digital.ts - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  03/18/2019 - Billy Ernest
//       Generated original version of source code.
//  01/20/2020 - C Lackner
//       Moved over to D3.
//
//******************************************************************************************************

import { createElement } from 'react';
import OpenSEEService from './../../TS/Services/OpenSEE';
import D3LineChartBase, { D3LineChartBaseProps } from './../Graphs/D3LineChartBase';

export default function Digital(props: D3LineChartBaseProps): JSX.Element {
    
    var openSEEService = new OpenSEEService();
    return createElement(D3LineChartBase, {
        legendKey: "Digital",
        openSEEServiceFunction: (eventid) => openSEEService.getDigitalsData(eventid),
        eventId: props.eventId,
        height: props.height,
        stateSetter: props.stateSetter,
        options: props.options,
        startTime: props.startTime,
        endTime: props.endTime,
        startTimeVis: props.startTimeVis,
        endTimeVis: props.endTimeVis,
        hover: props.hover,
    }, null);

}