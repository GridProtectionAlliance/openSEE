//******************************************************************************************************
//  LightningData.tsx - Gbtc
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
//  03/13/2019 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { WidgetWindow } from './Common';
import { ConfigurableTable } from '@gpa-gemstone/react-interactive';


interface Iprops {
    closeCallback: () => void;
    eventId: number;
    isOpen: boolean;
    position: [number, number],
    setPosition: (t: number, l: number) => void
}

interface Column {
    key: string;
    label: string;
    field: keyof any;
    content: (item: any, key: string, field: keyof any, style: React.CSSProperties, index: number) => React.ReactNode;
}

const LightningDataWidget = (props: Iprops) => {
    const [lightningData, setLightningData] = React.useState([]);
    const [cols, setCols] = React.useState<Column[]>([]);

    function getData(): JQuery.jqXHR {
        setLightningData([{ State: "Loading..." }]);

        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetLightningData?eventID=${props.eventId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done((lightningData: unknown[]) => {
            if (lightningData.length === 0) {
                const noData = [{ State: "No Data" }];
                setLightningData(noData);
                return;
            }

            setLightningData(lightningData);
        });

        handle.fail((_, __, err) => {
            setLightningData([{ Error: err }]);
        });

        return handle;
    }

    React.useEffect(() => {
        const handle = getData();

        return () => { if (handle !== undefined && handle.abort !== undefined) handle.abort(); }
    }, [props.eventId]);

    React.useEffect(() => {
        if (lightningData.length === 0)
            return;

        const keys = Object.keys(lightningData[0]);

        const content = (item, _, field) => {
            return item[field];
        };

        const cols = keys.map(key => {
            const col: Column = {
                key: key,
                label: key,
                field: key,
                content: content
            };

            return col;
        });

        setCols(cols);
    }, [lightningData]);

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={500} width={800} position={props.position} setPosition={props.setPosition} >
            <ConfigurableTable<any>
                cols={cols}
                tableClass="table"
                data={lightningData}
                sortKey="UTCTime"
                ascending={true}
                onSort={() => { /* Sort not implemented */ }}
                theadStyle={{ display: "table", tableLayout: "fixed", width: "calc(100% - 1em)" }}
                tbodyStyle={{ maxHeight: 410, overflowY: 'auto', display: 'block' }}
                rowStyle={{ display: 'table', tableLayout: 'fixed', width: '100%' }}
                defaultColumns={["Service", "DisplayTime", "Amplitude", "Latitude", "Longitude", "State"]}
            />
         </WidgetWindow>
    );
}

export default LightningDataWidget;

