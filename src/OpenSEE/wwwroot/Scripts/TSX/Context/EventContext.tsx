//******************************************************************************************************
//  EventContext.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  02/06/2026 - G. Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { OpenSee } from '../global';
import { Application } from '@gpa-gemstone/application-typings';

interface IProps {
    EventID: number,
    BreakerOperation?: string
}

interface EventContextType {
    EventInfo: OpenSee.IEventInfo,
    LookupInfo: OpenSee.INextBackLookup,
    Status: Application.Types.Status
}

const defaultState: EventContextType = {
    EventInfo: null,
    LookupInfo: null,
    Status: 'uninitiated'
};

export const EventContext = React.createContext<EventContextType>(defaultState);

export const EventProvider = (props: React.PropsWithChildren<IProps>) => {
    const [contextState, setContextState] = React.useState<EventContextType>(defaultState);

    React.useEffect(() => {
        if (props.EventID == null || isNaN(props.EventID) || props.EventID < 0) return;
        setContextState(state => ({
            ...state,
            EventID: props.EventID,
            Status: 'loading'
        }));

        const eventHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetHeaderData` +
                `?eventId=${props.EventID}` +
                `${props.BreakerOperation != null ? "&breakeroperation=" + props.BreakerOperation : ""}`,
            dataType: 'json',
            cache: true,
            async: true
        });
        const lookupHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetNavData?eventId=${props.EventID}`,
            dataType: 'json',
            cache: true,
            async: true
        });
        Promise.all([lookupHandle, eventHandle]).then(([evtResult, lookupResult]) => {
            setContextState({
                Status: 'idle',
                EventInfo: evtResult,
                LookupInfo: lookupResult
            });
        }, () => {
            console.error("Unable to load event context data.");
            setContextState(state => ({
                ...state,
                Status: 'error'
            }));
        });

        return () => {
            if (eventHandle?.abort != null) eventHandle.abort();
            if (lookupHandle?.abort != null) lookupHandle.abort();
        }
    }, [props.EventID, props.BreakerOperation]);

    return (
        <EventContext.Provider value={contextState}>
            {props.children}
        </EventContext.Provider>
    );
};

export default EventContext;
