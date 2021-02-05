//******************************************************************************************************
//  RequestHandler.tsx - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  02/05/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import { OpenSee } from "../global";
var HandleStore = new Map<string, JQuery.jqXHR<any>[]>();

//Functions to Handle Requests.
function AddRequest(key: OpenSee.IGraphProps, requests: JQuery.jqXHR<any>[]) {
    let target = key.DataType.toString() + '-' + key.EventId.toString();
    if (HandleStore.has(target))
        HandleStore.get(target).forEach(item => { if (item != null && item.abort != null) item.abort(); })
    HandleStore.set(target, requests);
}

function CancelAnalytics() {
    for (let key of HandleStore.keys()) {
        if (key.startsWith('Voltage-') || key.startsWith('Current-') || key.startsWith("Analogs-") || key.startsWith("Digitals-") || key.startsWith('TripCoil-'))
            continue;
        HandleStore.get(key).forEach(item => { if (item != null && item.abort != null) item.abort(); })
        HandleStore.delete(key);
    }
}

function CancelCompare(baseEventID: number) {
    for (let key of HandleStore.keys()) {
        if (key.endsWith('-' + baseEventID.toString()))
            continue;
        HandleStore.get(key).forEach(item => { if (item != null && item.abort != null) item.abort(); })
        HandleStore.delete(key);
    }
}

function CancelEvent(eventId: number) {
    for (let key of HandleStore.keys()) {
        if (!key.endsWith('-' + eventId.toString()))
            continue;
        HandleStore.get(key).forEach(item => { if (item != null && item.abort != null) item.abort(); })
        HandleStore.delete(key);
    }
}

export { CancelAnalytics, AddRequest, CancelEvent, CancelCompare }