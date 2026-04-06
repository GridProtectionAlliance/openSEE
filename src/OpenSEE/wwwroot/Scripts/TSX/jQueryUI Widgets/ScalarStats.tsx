//******************************************************************************************************
//  ScalarStats.tsx - Gbtc
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
//  05/14/2018 - Billy Ernest
//       Generated original version of source code.
//
//  12/07/2023 - Preston Crawford
//       Switched table elements to a gpa-gemstone component
//******************************************************************************************************

import * as React from 'react';
import { Table, Column } from '@gpa-gemstone/react-table';
import { CreateGuid } from '@gpa-gemstone/helper-functions';

interface IEventData {
    Stat: string,
    Value: string,
    ID: string // created clientside for table
}

interface Iprops {
    EventID: number,
    ExportCallback: (arg: string) => void
}

const ScalarStatsWidget = (props: Iprops) => {
    const [stats, setStats] = React.useState<IEventData[]>([]);

    React.useEffect(() => {
        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetScalarStats?eventId=${props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        handle.done((d) => {
            let t: IEventData[] = []
            Object.keys(d).forEach(stat => {
                t.push({ Stat: stat, Value: d[stat], ID: CreateGuid() })
            })
            setStats(t);
        });

        return () => { if (handle != undefined && handle.abort != undefined) handle.abort(); }
    }, [props.EventID]);

    return (
        <>
            <div className="d-flex flex-column h-100 w-100" style={{ padding: '10px' }}>
                <div className="table-responsive h-100" style={{ maxHeight: '100%', overflowY: 'auto' }}>
                    <Table<IEventData>
                        TableClass="table table-hover w-100"
                        Data={stats}
                        SortKey={""}
                        Ascending={true}
                        OnSort={() => { }}
                        OnClick={() => { }}
                        Selected={() => false}
                        KeySelector={(item) => item.ID}
                    >
                        <Column<IEventData>
                            Key={'Stat'}
                            AllowSort={false}
                            HeaderStyle={{ width: "30%" }}
                            RowStyle={{ width: "30%" }}
                            Field={'Stat'}>
                            Stat
                        </Column>
                        <Column<IEventData>
                            Key={'Value'}
                            AllowSort={false}
                            HeaderStyle={{ width: "60%" }}
                            RowStyle={{ width: "60%" }}
                            Field={'Value'}>
                            Value
                        </Column>
                        <Column<IEventData>
                            Key={'Export'}
                            AllowSort={false}>
                            <button className="btn btn-primary" onClick={() => props.ExportCallback('stats')}>Export(csv)</button>
                        </Column>
                    </Table>
                </div>
            </div>
        </>
    );
}

export default ScalarStatsWidget;