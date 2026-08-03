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
import { Application } from '@gpa-gemstone/application-typings';
import { Alert } from '@gpa-gemstone/react-interactive';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { ConfigurableTable, ConfigurableColumn, Column } from '@gpa-gemstone/react-table';
import _ from 'lodash';

interface Iprops {
    EventID: number,
    ExportCallback: (arg: string) => void
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
    const [sagsData, setSagsData] = React.useState<ICorrelatedSags[]>([]);
    const [status, setStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [sortKey, setSortKey] = React.useState('EventID');
    const [ascending, setAscending] = React.useState(false);

    const sortedSagsData = React.useMemo(() =>
        _.orderBy(sagsData, [sortKey], [ascending ? 'asc' : 'desc']),
        [sagsData, sortKey, ascending]
    );

    React.useEffect(() => {
        setStatus('loading');

        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetTimeCorrelatedSags?eventId=${props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(data => {
            setSagsData(data);
            setStatus('idle');
        });
        handle.fail(() => setStatus('error'));

        return () => { if (handle?.abort != null) handle.abort(); }
    }, [props.EventID]);

    return (
        <>
            {status === 'loading' || status === 'uninitiated' ?
                <div className="d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%' }}>
                    <ReactIcons.SpiningIcon Size={'100%'} />
                </div>
                : null}
            {status === 'error' ?
                <div className="row justify-content-center">
                    <div className="col-12">
                        <Alert Class='alert-danger'>
                            Error retrieving time-correlated sags.
                        </Alert>
                    </div>
                </div>
                : null}
            {status === 'idle' && sagsData.length > 0 ?
                <div className="d-flex" style={{ width: '100%', height: '100%', maxHeight: '100vh', overflowY: 'hidden' }}>
                    <ConfigurableTable<ICorrelatedSags>
                        LocalStorageKey={"OpenSee.Correlated.TableCols"}
                        TableClass={"table table-hover"}
                        Data={sortedSagsData}
                        KeySelector={(item) => item.EventID.toString()}
                        OnSort={(data) => {
                            setAscending(data.colKey === sortKey ? !ascending : true);
                            setSortKey(data.colKey);
                        }}
                        SortKey={sortKey}
                        TbodyStyle={{ overflowY: 'scroll', maxHeight: '100vh', height: '100%' }}
                        RowStyle={{ width: '100%' }}
                        TableStyle={{ height: '100%', width: '100%', margin: '3%' }}
                        Ascending={ascending}
                    >
                        <ConfigurableColumn Key={'EventID'} Label={'Event ID'} Default={true}>
                            <Column<ICorrelatedSags>
                                Key={'EventID'}
                                AllowSort={true}
                                Field={'EventID'}
                                Content={({ item }) => (
                                    <a id="eventLink" target="_blank" href={`${homePath}?eventid=${item.EventID}`}>
                                        <div style={{ width: '100%', height: '100%' }}>{item.EventID}</div>
                                    </a>
                                )}
                            >
                                Event ID
                            </Column>
                        </ConfigurableColumn>
                        <ConfigurableColumn Key={'AssetName'} Label={'Asset Name'} Default={false}>
                            <Column<ICorrelatedSags>
                                Key={'AssetName'}
                                AllowSort={true}
                                Field={'AssetName'}>
                                Asset Name
                            </Column>
                        </ConfigurableColumn>
                        <ConfigurableColumn Key={'EventType'} Label={'Event Type'} Default={false}>
                            <Column<ICorrelatedSags>
                                Key={'EventType'}
                                AllowSort={true}
                                Field={'EventType'}>
                                Event Type
                            </Column>
                        </ConfigurableColumn>
                        <ConfigurableColumn Key={'MeterName'} Label={'MeterName'} Default={false}>
                            <Column<ICorrelatedSags>
                                Key={'MeterName'}
                                AllowSort={true}
                                Field={'MeterName'}>
                                Meter Name
                            </Column>
                        </ConfigurableColumn>
                        <ConfigurableColumn Key={'SagDurationCycles'} Label={'Sag Duration Cycles'} Default={true}>
                            <Column<ICorrelatedSags>
                                Key={'SagDurationCycles'}
                                AllowSort={true}
                                Field={'SagDurationCycles'}>
                                Sag Duration Cycles
                            </Column>
                        </ConfigurableColumn>
                        <ConfigurableColumn Key={'SagDurationMilliseconds'} Label={'Sag Duration Milliseconds'} Default={true}>
                            <Column<ICorrelatedSags>
                                Key={'SagDurationMilliseconds'}
                                AllowSort={true}
                                Field={'SagDurationMilliseconds'}>
                                Sag Duration Milliseconds
                            </Column>
                        </ConfigurableColumn>
                        <ConfigurableColumn Key={'SagMagnitudePercent'} Label={'Magnitude'} Default={true}>
                            <Column<ICorrelatedSags>
                                Key={'SagMagnitudePercent'}
                                AllowSort={true}
                                Field={'SagMagnitudePercent'}>
                                Sag Magnitude Percent
                            </Column>
                        </ConfigurableColumn>
                        <ConfigurableColumn Key={'StartTime'} Label={'Start Time'} Default={false}>
                            <Column<ICorrelatedSags>
                                Key={'StartTime'}
                                AllowSort={true}
                                Field={'StartTime'}>
                                Start Time
                            </Column>
                        </ConfigurableColumn>
                        <Column<ICorrelatedSags>
                            Key={'Export'}
                            AllowSort={false}
                            RowStyle={{ width: 0 }}
                        >
                            <button className="btn btn-primary" onClick={() => props.ExportCallback('correlatedsags')}>Export(csv)</button>
                        </Column>
                    </ConfigurableTable>
                </div>
                : null}
            {status === 'idle' && sagsData.length === 0 ?
                <div className="row justify-content-center">
                    <div className="col-12">
                        <Alert Class='alert-info'>
                            No data for Correlated Sags.
                        </Alert>
                    </div>
                </div>
                : null}
        </>
    );

}

export default TimeCorrelatedSagsWidget