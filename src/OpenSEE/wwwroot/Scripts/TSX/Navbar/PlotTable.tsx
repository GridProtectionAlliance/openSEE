//******************************************************************************************************
//  PlotTable.tsx - Gbtc
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
//  02/09/2026 - Gabriel Santos
//       Moved code to here from OpenSEENavbar.tsx
//
//******************************************************************************************************

import React from "react";
import { OpenSee } from "../global";
import { useAppDispatch, useAppSelector } from '../hooks';
import { AddPlot, RemovePlot, SelectDisplayed, SelectEventIDs } from '../store/dataSlice';

const PlotTable = () => {
    const showPlots = useAppSelector(SelectDisplayed);
    const eventIDs = useAppSelector(SelectEventIDs);
    const dispatch = useAppDispatch()

    function tooglePlots(type: OpenSee.graphType) {
        let display;
        if (type === 'Voltage')
            display = showPlots.Voltage;
        else if (type === 'Current')
            display = showPlots.Current;
        else if (type === 'Analogs')
            display = showPlots.Analogs;
        else if (type === 'Digitals')
            display = showPlots.Digitals;
        else if (type === 'TripCoil')
            display = showPlots.TripCoil;

        if (display)
            eventIDs.forEach(id => dispatch(RemovePlot({ DataType: type, EventId: id })))
        else
            eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: type, EventId: id } })))
    }
    return (
        <>
            <table className="table" style={{ margin: 0 }}>
                <tbody>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox" onChange={() => tooglePlots('Voltage')}
                                checked={showPlots.Voltage} />
                        </td>
                        <td>
                            <label className="form-check-label">Voltage</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox"
                                onChange={() => tooglePlots('Current')}
                                checked={showPlots.Current} />
                        </td>
                        <td>
                            <label className="form-check-label">Current</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox"
                                onChange={() => tooglePlots('Analogs')}
                                checked={showPlots.Analogs} />
                        </td>
                        <td>
                            <label className="form-check-label">Analogs</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox"
                                onChange={() => tooglePlots('Digitals')}
                                checked={showPlots.Digitals} />
                        </td>
                        <td>
                            <label className="form-check-label">Digitals</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox"
                                onChange={() => tooglePlots('TripCoil')}
                                checked={showPlots.TripCoil} />
                        </td>
                        <td>
                            <label className="form-check-label">Trip Coil E.</label>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default PlotTable;
