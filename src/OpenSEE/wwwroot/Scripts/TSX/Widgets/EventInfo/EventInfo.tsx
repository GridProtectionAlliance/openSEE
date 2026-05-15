//******************************************************************************************************
//  EventInfo.tsx - Gbtc
//
//  Copyright c 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  12/27/2023 - Preston Crawford
//       Generated original version of source code.
//******************************************************************************************************

import React from 'react';
import queryString from 'query-string';
import moment from 'moment';
import FaultSpecificsModal from './FaultSpecificsModal';
import EventContext from '../../Context/EventContext';
import { Column, Table } from '@gpa-gemstone/react-table';
import { OpenSee } from '../../global';
import { Gemstone } from '@gpa-gemstone/application-typings';
import { Alert, LoadingIcon } from '@gpa-gemstone/react-interactive';

const eventDateFormat = "YYYY-MM-DD HH:mm:ss.fffffff";
const dateFormat = "MM/DD/YYYY";
const timeFormat = "HH:mm:ss.SSS";

interface TableData extends Gemstone.TSX.Interfaces.ILabelValue<string> {
    Key: keyof OpenSee.IEventInfo
}

const skippedKeys: (keyof OpenSee.IEventInfo)[] = [
    'Inception',
    'InceptionDate',
    'EventDate',
    'xdaInstance',
    'enableLightningData',
    'LineLength',
    'EventEnd',
    'SystemFrequency',
    'MeterId',
    'DurationEndTime',
    'CalculationCycle',
    'Date',
    'DurationCycles',
    'DurationSeconds'
];
const EventInfo = () => {
    const { Context } = React.useContext(EventContext);

    const [pqBrowserURL, setPqBrowserURL] = React.useState<string>('http://localhost:44368')
    const [pqBrowserParams, setPQBrowserParams] = React.useState<string>("")
    const [showFaultSpecifics, setShowFaultSpecifics] = React.useState<boolean>(false)

    React.useEffect(() => {
        const handle = getPQUrl();

        handle.done((data) => setPqBrowserURL(data));

        return () => {
            if (handle?.abort != null)
                handle.abort()
        }
    }, []);

    React.useEffect(() => {
        if (Context.EventInfo?.EventDate == null)
            return;

        const time = moment.utc(Context.EventInfo.EventDate, eventDateFormat).format(timeFormat);
        const date = moment.utc(Context.EventInfo.EventDate, eventDateFormat).format(dateFormat);

        const queryParams = {
            eventid: Context.EventID,
            time: time,
            date: date,
            windowSize: 1,
            timeWindowUnits: 3
        };

        setPQBrowserParams(queryString.stringify(queryParams))
    }, [Context.EventInfo?.EventDate]);

    const tableData = React.useMemo<TableData[]>(() => {
        if (Context.EventInfo == null)
            return [];

        const data: TableData[] = Object.keys(Context.EventInfo)
            .filter((key) => !skippedKeys.includes(key as keyof OpenSee.IEventInfo))
            .map((key) => {
                const typedKey = key as keyof OpenSee.IEventInfo;

                return {
                    Label: getLabel(typedKey),
                    Key: typedKey,
                    Value: String(Context.EventInfo![typedKey])
                };
            });

        data.push({
            Label: '',
            Key: 'PQBrowser' as keyof OpenSee.IEventInfo,
            Value: ''
        });

        return data;
    }, [Context.EventInfo, pqBrowserURL, pqBrowserParams]);

    if (Context.EventInfo == null)
        return null;

    return (
        <div className="d-flex w-100 h-100 p-1">
            <LoadingIcon Show={Context.Status === 'loading' || status === 'uninitiated'} Size={150} />
            {Context.Status === 'error' ?
                <div className="row justify-content-center">
                    <Alert Class='alert-danger' >
                        Error retrieving fault information.
                    </Alert>
                </div>
                : null}
            {Context.Status === 'idle' ?
                <Table<TableData>
                    Data={tableData}
                    SortKey={'Key'}
                    Ascending={true}
                    OnSort={() => {/* no-op */ }}
                    TableClass="table"
                    TbodyStyle={{ overflowY: 'auto' }}
                    KeySelector={(item) => item.Key}
                >
                    <Column<TableData>
                        Key="Label"
                        Field="Label"
                        AllowSort={false}
                    >
                        {''}
                    </Column>

                    <Column<TableData>
                        Key="Value"
                        Field="Value"
                        AllowSort={false}
                        Content={({ item }) => (
                            <>{getValue(item, Context.EventInfo, setShowFaultSpecifics, pqBrowserURL, pqBrowserParams)}</>
                        )}
                    >
                        {''}
                    </Column>
                </Table>
                : null}

            <FaultSpecificsModal
                SetShow={setShowFaultSpecifics}
                Show={showFaultSpecifics}
                EventID={Context.EventInfo.EventId}
            />
        </div>
    )
}

const getPQUrl = () => {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/OpenSEE/GetPQBrowser/`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}

const getLabel = (key: keyof OpenSee.IEventInfo): string => {
    switch (key) {
        case 'MeterName':
            return 'Meter';

        case 'StationName':
            return 'Station';

        case 'AssetName':
            return 'Asset';

        case 'EventName':
            return 'Event Type';

        case 'EventMilliseconds':
            return 'Event Date';

        case 'Inception':
            return 'Inception';

        case 'StartTime':
            return 'Event Start';

        case 'Phase':
            return 'Phase';

        case 'DurationPeriod':
            return 'Duration Cycles';

        case 'Magnitude':
            return 'Magnitude';

        case 'SagDepth':
            return 'Sag Depth';

        case 'BreakerNumber':
            return 'Breaker';

        case 'BreakerTiming':
            return 'Timing';

        case 'BreakerSpeed':
            return 'Speed';

        case 'BreakerOperation':
            return 'Operation';

        default:
            return key;
    }
}

const getValue = (
    tableData: TableData,
    record: OpenSee.IEventInfo | null,
    setShowFaultSpecs: React.Dispatch<React.SetStateAction<boolean>>,
    pqBrowserURL: string,
    pqBrowserParams: string
): React.ReactNode => {
    if (record == null)
        return null;

    switch (tableData.Key) {
        case 'EventName':
            return record.EventName !== 'Fault'
                ? record.EventName
                : <a
                    href="#"
                    title="Click for fault details"
                    onClick={() => setShowFaultSpecs(true)}
                >
                    Fault
                </a>

        case 'EventMilliseconds':
            return moment(Number(tableData.Value))
                .format('YYYY-MM-DD HH:mm:ss.SSS');

        case 'PQBrowser' as keyof OpenSee.IEventInfo:
            return (
                <button
                    className="btn btn-link"
                    onClick={() => {
                        window.open(pqBrowserURL + '/eventsearch?' + pqBrowserParams)
                    }}
                >
                    Edit Event and Manage Notes
                </button>
            );

        default:
            return tableData.Value;
    }
}

export default EventInfo;