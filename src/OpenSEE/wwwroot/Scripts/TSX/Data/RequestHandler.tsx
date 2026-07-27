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
const HandleStore = new Map<string, JQuery.jqXHR<any>[]>();

// Store only in-flight handles. Completed jqXHRs retain responseText/responseJSON, which can be very large for some events, so prune them as soon as they settle.
const TrackRequests = (target: string, requests: JQuery.jqXHR<any>[]) => {
    const pendingRequests = requests.filter(item => item != null && item.state() === 'pending');

    pendingRequests.forEach(request => {
        request.always(() => {
            const targetValue = HandleStore.get(target);
            if (targetValue == null)
                return;

            const remaining = targetValue.filter(item => item !== request);
            if (remaining.length > 0)
                HandleStore.set(target, remaining);
            else
                HandleStore.delete(target);
        });
    });

    if (pendingRequests.length > 0)
        HandleStore.set(target, pendingRequests);
    else
        HandleStore.delete(target);
}

//Functions to Handle Requests.
const AddRequest = (key: OpenSee.IGraphProps, requests: JQuery.jqXHR<any>[]) => {
    const target = key.DataType.toString() + '-' + key.EventId.toString();

    const targetValue = HandleStore.get(target);

    if (targetValue != null)
        targetValue.forEach(item => { if (item != null && item.abort != null) item.abort(); })

    TrackRequests(target, requests);
}

const CancelAnalytics = () => {
    for (const key of HandleStore.keys()) {
        if (key.startsWith('Voltage-') || key.startsWith('Current-') || key.startsWith("Analogs-") || key.startsWith("Digitals-") || key.startsWith('TripCoil-'))
            continue;

        const targetValue = HandleStore.get(key);
        if (targetValue != null)
            targetValue.forEach(item => { if (item != null && item.abort != null) item.abort(); })

        HandleStore.delete(key);
    }
}

const CancelCompare = (baseEventID: number) => {
    for (const key of HandleStore.keys()) {
        if (key.endsWith('-' + baseEventID.toString()))
            continue;

        const targetValue = HandleStore.get(key);
        if (targetValue != null)
            targetValue.forEach(item => { if (item != null && item.abort != null) item.abort(); })

        HandleStore.delete(key);
    }
}

const CancelEvent = (eventId: number) => {
    for (const key of HandleStore.keys()) {
        if (!key.endsWith('-' + eventId.toString()))
            continue;

        const targetValue = HandleStore.get(key);
        if (targetValue != null)
            targetValue.forEach(item => { if (item != null && item.abort != null) item.abort(); })

        HandleStore.delete(key);
    }
}

const AppendRequest = (key: OpenSee.IGraphProps, requests: JQuery.jqXHR<any>[]) => {
    const target = key.DataType.toString() + '-' + key.EventId.toString();
    let r = requests;

    const targetValue = HandleStore.get(target);
    if (targetValue != null)
        r = [...r, ...targetValue];

    TrackRequests(target, r)
}

export {
    CancelAnalytics,
    AddRequest,
    CancelEvent,
    CancelCompare,
    AppendRequest
}