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
import { PlotStateStateContext } from "../Context/PlotStateContext";
import { OverlappingStateContext } from "../Context/OverlappingContext";
import EventContext from "../Context/EventContext";
import { selectDisplayed, selectEventIDs } from "../PlotSelectors";
import { IPlotLifecycleActions } from "../hooks/usePlotLifeCycle";

interface IProps {
    lifecycle: IPlotLifecycleActions;
}

const PlotTable = React.memo((props: IProps) => {
    const { meta } = React.useContext(PlotStateStateContext);
    const evt = React.useContext(EventContext);
    const overlapping = React.useContext(OverlappingStateContext);

    const showPlots = React.useMemo(() => selectDisplayed(meta), [meta]);

    function togglePlots(type: OpenSee.graphType) {
        let display: boolean | undefined;
        if (type === 'Voltage') display = showPlots.Voltage;
        else if (type === 'Current') display = showPlots.Current;
        else if (type === 'Analogs') display = showPlots.Analogs;
        else if (type === 'Digitals') display = showPlots.Digitals;
        else if (type === 'TripCoil') display = showPlots.TripCoil;

        const eventIds = selectEventIDs(evt.Context.EventID, overlapping.events);

        if (display)
            eventIds.forEach(id => props.lifecycle.RemovePlot({ DataType: type, EventId: id }));
        else
            eventIds.forEach(id => props.lifecycle.AddPlot({ DataType: type, EventId: id }));
    }

    return (
        <table className="table" style={{ margin: 0 }}>
            <tbody>
                {(['Voltage', 'Current', 'Analogs', 'Digitals', 'TripCoil'] as const).map(type => (
                    <tr key={type}>
                        <td>
                            <input className="form-check-input" style={{ margin: 0 }}
                                type="checkbox" onChange={() => togglePlots(type)}
                                checked={showPlots[type === 'TripCoil' ? 'TripCoil' : type]} />
                        </td>
                        <td>
                            <label className="form-check-label">
                                {type === 'TripCoil' ? 'Trip Coil E.' : type}
                            </label>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

export default PlotTable;