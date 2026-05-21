// OverlappingContext.tsx
// Manages the list of overlapping events and their selection state.
// Isolated from plot data/meta -- only two components consume this.

import * as React from 'react';
import { OpenSee } from '../global';
import { getOverlappingEvents } from '../Data/GraphLogic';

interface IOverlappingState {
    loading: OpenSee.LoadingState;
    events: OpenSee.OverlappingEvents[];
}

interface IOverlappingActions {
    LoadOverlappingEvents: (eventId: number) => void;
    ToggleEventSelection: (eventId: number) => void;
    SetSelectedEvents: (eventIds: number[]) => void;
    // Called externally after adding plot data for an overlapping event
    SetEventSelected: (eventId: number, selected: boolean) => void;
}

const defaultState: IOverlappingState = {
    loading: 'Uninitiated',
    events: []
};

const defaultActions: IOverlappingActions = {
    LoadOverlappingEvents: () => { /* noop */ },
    ToggleEventSelection: () => { /* noop */ },
    SetSelectedEvents: () => { /* noop */ },
    SetEventSelected: () => { /* noop */ },
};

export const OverlappingStateContext = React.createContext<IOverlappingState>(defaultState);
export const OverlappingActionContext = React.createContext<IOverlappingActions>(defaultActions);

export const OverlappingProvider = (props: React.PropsWithChildren<{}>) => {
    const [state, setState] = React.useState<IOverlappingState>(defaultState);
    const selectedEventIdsRef = React.useRef<Set<number>>(new Set());

    const actions = React.useMemo<IOverlappingActions>(() => ({
        LoadOverlappingEvents: (eventId) => {
            if (eventId == null || isNaN(eventId) || eventId <= 0) return;

            setState(prev => ({ ...prev, loading: 'Loading' }));

            const handle = getOverlappingEvents(eventId, null, null);
            handle.then(
                (data) => {
                    setState(prev => {
                        const newEvents = [...prev.events];
                        data.forEach((event: any) => {
                            const idx = newEvents.findIndex(e => e.EventID === event.EventID);
                            const parsed: OpenSee.OverlappingEvents = {
                                Selected: selectedEventIdsRef.current.has(event.EventID) || (idx >= 0 ? newEvents[idx].Selected : false),
                                AssetName: event.AssetName,
                                MeterName: event.MeterName,
                                EventID: event.EventID,
                                StartTime: new Date(event.StartTime + 'Z').getTime(),
                                EndTime: new Date(event.EndTime + 'Z').getTime(),
                                EventType: event.EventType,
                                Inception: event.Inception,
                                DurationEndTime: event.DurationEndTime
                            };
                            if (idx < 0)
                                newEvents.push(parsed);
                            else
                                newEvents[idx] = { ...newEvents[idx], ...parsed };
                        });
                        return { loading: 'Idle', events: newEvents };
                    });
                },
                () => {
                    setState(prev => ({ ...prev, loading: 'Error' }));
                }
            );
        },

        ToggleEventSelection: (eventId) => {
            setState(prev => {
                const idx = prev.events.findIndex(e => e.EventID === eventId);
                if (idx < 0) return prev;

                const newEvents = [...prev.events];
                const selected = !newEvents[idx].Selected;
                if (selected)
                    selectedEventIdsRef.current.add(eventId);
                else
                    selectedEventIdsRef.current.delete(eventId);

                newEvents[idx] = { ...newEvents[idx], Selected: selected };
                return { ...prev, events: newEvents };
            });
        },

        SetSelectedEvents: (eventIds) => {
            selectedEventIdsRef.current = new Set(eventIds);
            setState(prev => {
                const newEvents = prev.events.map(event => ({
                    ...event,
                    Selected: selectedEventIdsRef.current.has(event.EventID)
                }));

                return { ...prev, events: newEvents };
            });
        },

        SetEventSelected: (eventId, selected) => {
            if (selected)
                selectedEventIdsRef.current.add(eventId);
            else
                selectedEventIdsRef.current.delete(eventId);

            setState(prev => {
                const idx = prev.events.findIndex(e => e.EventID === eventId);
                if (idx < 0) return prev;

                const newEvents = [...prev.events];
                newEvents[idx] = { ...newEvents[idx], Selected: selected };
                return { ...prev, events: newEvents };
            });
        }
    }), []);

    return (
        <OverlappingActionContext.Provider value={actions}>
            <OverlappingStateContext.Provider value={state}>
                {props.children}
            </OverlappingStateContext.Provider>
        </OverlappingActionContext.Provider>
    );
};
