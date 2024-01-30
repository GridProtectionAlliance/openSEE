import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { SelectEventListLoading, SelectEventList, EnableOverlappingEvent } from '../store/overlappingEventsSlice';
import { SelectSinglePlot, EnableSinglePlot } from '../store/settingSlice';
import { CheckBox } from '@gpa-gemstone/react-forms';
import _ from 'lodash';
import { LoadingIcon } from '../Graphs/ChartIcons';

const OverlappingEventWindow = () => {
    const eventList = useAppSelector(SelectEventList);
    const groupedEvents = _.groupBy(eventList, 'MeterName');
    const singlePlot = useAppSelector(SelectSinglePlot);
    const eventListLoading = useAppSelector(SelectEventListLoading);

    const dispatch = useAppDispatch();

    return (
        <div className="d-flex" style={{ width: '100%', height: '100%', padding: '10px' }}>
            {eventListLoading ? (
                    <LoadingIcon />
            ) : (
                <form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', height: '100%', width: '100%', overflowY: 'auto', padding: '10px', marginTop: 0 }}>
                    <div style={{ marginBottom: '20px' }}>
                        <CheckBox
                            Record={{ singlePlot }}
                            Field={'singlePlot'}
                            Setter={(item) => dispatch(EnableSinglePlot(item.singlePlot))}
                            Label={"Display all events on same plot"}
                            Help={"Draws the waveform groups (e.g., Voltage) for the current event and the selected asset(s) on a single plot for comparison."}
                        />
                    </div>
                    {Object.entries(groupedEvents).map(([meterName, events]) => (
                        <fieldset key={meterName} className="border" style={{ padding: '10px', width: '100%', marginBottom: '20px' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>{meterName}</legend>
                            <ul style={{ listStyleType: 'none', paddingLeft: 0, marginLeft: '5%'}}>
                                {events.map(event => (
                                    <li key={event.EventID} style={{ marginBottom: '10px' }}>
                                        <CheckBox
                                            Record={event}
                                            Field={'Selected'}
                                            Setter={(updatedEvent) => dispatch(EnableOverlappingEvent(updatedEvent.EventID))}
                                            Label={event.AssetName}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </fieldset>
                    ))}
                </form>
            )}
        </div>
    );
};

export default OverlappingEventWindow;
