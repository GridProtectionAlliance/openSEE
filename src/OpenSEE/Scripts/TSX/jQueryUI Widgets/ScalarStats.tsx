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
import Table from '@gpa-gemstone/react-table'

interface Iprops {
    exportCallback: () => void,
}

interface EventData {
    Stat: string,
    Value: string
}

const ScalarStatsWidget = (props: Iprops) => {
    const [stats, setStats] = React.useState<EventData[]>([]);

    React.useEffect(() => {
        let handle = getData();

        return () => { if (handle != undefined && handle.abort != undefined) handle.abort(); }
    }, [props])

    function getData(): JQuery.jqXHR {

        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetScalarStats?eventId=${eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done((d) => {
            let t = []
            Object.keys(d).forEach(stat => {
                t.push({ Stat: stat, Value: d[stat] })
            })
            setStats(t);
        })
        return handle;
    }

    return (
        <>
            <div className="d-flex flex-column h-100 w-100" style={{padding: '10px'}}>
                <div className="table-responsive h-100" style={{ maxHeight: '100%', overflowY: 'auto'}}>
                    <Table<EventData>
                        cols={[
                            {
                                field: 'Stat',
                                key: 'Stat',
                                label: 'Stat',
                                headerStyle: { width: 'calc(30% - 8.25em - 130px)' },
                                rowStyle: { width: 'calc(30% - 8.25em - 130px)' },
                            },
                            {
                                field: 'Value',
                                key: 'Value',
                                label: 'Value',
                                headerStyle: { width: 'calc(60% - 8.25em)' },
                                rowStyle: { width: 'calc(60% - 8.25em)' },
                            },
                        ]}
                        tableClass="table table-hover w-100"
                        data={stats}
                        sortKey={""}
                        ascending={true}
                        onSort={() => { }}
                        onClick={() => { }}
                        selected={() => false}
                    />
                </div>
            </div>
        </>
    );
}

export default ScalarStatsWidget;