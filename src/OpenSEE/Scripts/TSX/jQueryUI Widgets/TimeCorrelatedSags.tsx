//******************************************************************************************************
//  TimeCorrelatedSags.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  02/05/2019 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { ConfigTable } from '@gpa-gemstone/react-interactive';
import { ReactTable } from '@gpa-gemstone/react-table'

interface Iprops {
    exportCallback: () => void,
}

interface ICorrelatedSags {
    AssetName: string,
    EventID: number,
    EventType: "Other"
    MeterName: string,
    SagDurationCycles: string,
    SagDurationMilliseconds: string,
    SagMagnitudePercent: string,
    StartTime: string,
}

const TimeCorrelatedSagsWidget = (props: Iprops) => {
    const [sagsData, setSagsData] = React.useState<ICorrelatedSags[]>(null);

    React.useEffect(() => {
        let handle = getData();

        return () => { if (handle != undefined && handle.abort != undefined) handle.abort(); }
    }, [props])

    function getData(): JQuery.jqXHR {

        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetTimeCorrelatedSags?eventId=${eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(d => {
            setSagsData(d as ICorrelatedSags[])
        });

        return handle;
    }

    return (
        <>
            {sagsData ? //need to add a columnn for the export button..
                <div className="d-flex" style={{ width: '100%', height: '100%', maxHeight: '100vh', overflowY: 'hidden' }}>
                    <ConfigTable.Table<ICorrelatedSags>
                        LocalStorageKey={"OpenSee.Correlated.TableCols"}
                        TableClass={"table table-hover"}
                        Data={sagsData}
                        KeySelector={(item) => item.EventID.toString()}
                        OnSort={() => true}
                        SortKey={"EventID"}
                        TbodyStyle={{ overflowY: 'scroll', maxHeight: '100vh', height: '100%' }}
                        RowStyle={{width: '100%'}}
                        TableStyle={{ height: '100%', width: '100%', margin: '3%' }}
                        Ascending={false}
                    >
                        <ConfigTable.Configurable Key={'EventID'} Label={'Event ID'} Default={true}>
                            <ReactTable.Column<ICorrelatedSags>
                                Key={'EventID'}
                                AllowSort={true}
                                Field={'EventID'}
                                Content={({ item }) => (
                                    <a id="eventLink" target="_blank" href={`./?eventid=${item.EventID}`}>
                                        <div style={{ width: '100%', height: '100%' }}>{item.EventID}</div>
                                    </a>
                                )}
                            >
                                Event ID
                            </ReactTable.Column>
                        </ConfigTable.Configurable>

                        <ConfigTable.Configurable Key={'AssetName'} Label={'Asset Name'} Default={true}>
                            <ReactTable.Column<ICorrelatedSags>
                                Key={'AssetName'}
                                AllowSort={true}
                                Field={'AssetName'}>
                                Asset Name
                            </ReactTable.Column>
                        </ConfigTable.Configurable>

                        <ConfigTable.Configurable Key={'EventType'} Label={'Event Type'} Default={true}>
                            <ReactTable.Column<ICorrelatedSags>
                                Key={'EventType'}
                                AllowSort={true}
                                Field={'EventType'}>
                                Event Type
                            </ReactTable.Column>
                        </ConfigTable.Configurable>

                        <ConfigTable.Configurable Key={'MeterName'} Label={'MeterName'} Default={true}>
                            <ReactTable.Column<ICorrelatedSags>
                                Key={'MeterName'}
                                AllowSort={true}
                                Field={'MeterName'}>
                                Meter Name
                            </ReactTable.Column>
                        </ConfigTable.Configurable>

                        <ConfigTable.Configurable Key={'SagDurationCycles'} Label={'Sag Duration Cycles'} Default={true}>
                            <ReactTable.Column<ICorrelatedSags>
                                Key={'SagDurationCycles'}
                                AllowSort={true}
                                Field={'SagDurationCycles'}>
                                Sag Duration Cycles
                            </ReactTable.Column>
                        </ConfigTable.Configurable>

                        <ConfigTable.Configurable Key={'SagDurationMilliseconds'} Label={'Sag Duration Milliseconds'} Default={true}>
                            <ReactTable.Column<ICorrelatedSags>
                                Key={'SagDurationMilliseconds'}
                                AllowSort={true}
                                Field={'SagDurationMilliseconds'}>
                                Sag Duration Milliseconds
                            </ReactTable.Column>
                        </ConfigTable.Configurable>

                        <ConfigTable.Configurable Key={'SagMagnitudePercent'} Label={'Magnitude'} Default={true}>
                            <ReactTable.Column<ICorrelatedSags>
                                Key={'SagMagnitudePercent'}
                                AllowSort={true}
                                Field={'SagMagnitudePercent'}>
                                Sag Magnitude Percent
                            </ReactTable.Column>
                        </ConfigTable.Configurable>

                        <ConfigTable.Configurable Key={'StartTime'} Label={'Start Time'} Default={true}>
                            <ReactTable.Column<ICorrelatedSags>
                                Key={'StartTime'}
                                AllowSort={true}
                                Field={'StartTime'}>
                                Start Time
                            </ReactTable.Column>
                        </ConfigTable.Configurable>

                    </ConfigTable.Table>
                </div>

                : null}
        </>
    );

}

export default TimeCorrelatedSagsWidget

