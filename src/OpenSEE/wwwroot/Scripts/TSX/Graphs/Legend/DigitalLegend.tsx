//******************************************************************************************************
//  DigitalLegend.tsx - Gbtc
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
//  06/01/2026 - Preston Crawford
//       Generated original version of source code
//
//******************************************************************************************************
import * as React from "react";
import { Alert, OverlayDrawer } from "@gpa-gemstone/react-interactive";
import { MultiCheckBoxSelect, SearchableSelect } from "@gpa-gemstone/react-forms";
import { sortHorizontal } from './Utilities';
import { useLegendGrid, rowKey } from './useLegendGrid';
import Header from './Header';
import Row from './Row';
import { OpenSee } from '../../global';

const maxInitialRows = 10;

interface IProps {
    height: number,
    dataKey: OpenSee.IGraphProps
}

const DigitalLegend = (props: IProps) => {
    const { grid, categories, verticalHeader, horizontalHeader, changeCategory, clickGroup, toggleTrace } = useLegendGrid(props.dataKey);

    const [addedKeys, setAddedKeys] = React.useState<string[]>([]);
    const hasSelectedAssets = categories.some(c => c.Selected);

    const visibleHeader = React.useMemo(() => {
        if (verticalHeader.length <= maxInitialRows) return verticalHeader;
        return verticalHeader.filter((v, i) =>
            i < maxInitialRows
            || (grid.get(rowKey(v))?.some(g => g.enabled) ?? false)
            || addedKeys.includes(rowKey(v))
        );
    }, [verticalHeader, grid, addedKeys]);

    const hasHidden = verticalHeader.length > visibleHeader.length;

    const hwidth = (200 - 4) / (horizontalHeader.length + (verticalHeader.length > 1 ? 2 : 1));

    const search = (text: string) => {
        const visibleKeys = new Set(visibleHeader.map(rowKey));
        const opts = verticalHeader
            .filter(v => !visibleKeys.has(rowKey(v)))
            .filter(v => v[0].toLowerCase().includes(text.toLowerCase()))
            .map(v => ({ Label: v[0], Value: rowKey(v) }));
        return Promise.resolve(opts);
    };

    return (
        <OverlayDrawer Location="right" Title="Traces" Open={false} Target={"graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId}>
            <div style={{ float: "right", width: "200px", height: props.height - 38, marginTop: "6px", display: "flex", flexDirection: "column" }}>
                <div className="form-group">
                    <MultiCheckBoxSelect
                        Options={categories}
                        OnChange={(_, options) => changeCategory(options)}
                        Label=""
                    />
                </div>
                {hasSelectedAssets && hasHidden ?
                    <div className="form-group">
                        <SearchableSelect<{ search: string }>
                            Record={{search: ''}}
                            Field={'search'}
                            Label="Add Channel"
                            Help="Search for channels to add to the legend."
                            AllowCustom={false}
                            ResetSearchOnSelect={true}
                            Search={search}
                            Style={{ width: '100%' }}
                            BtnStyle={{ display: 'flex', paddingLeft: 0, alignItems: 'center' }}
                            Setter={(_, opt) => setAddedKeys(prev => prev.includes(opt.Value as string) ? prev : [...prev, opt.Value as string])}
                        />
                </div> : null}
                {hasSelectedAssets ?
                    <div className="legend" style={{ width: "100%", borderStyle: "solid", borderWidth: "2px", flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
                        <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderBottom: "2px solid #b2b2b2", position: "sticky", top: 0, zIndex: 1 }}>
                            <div style={{ width: (verticalHeader.length > 1 ? 2 : 1) * hwidth, backgroundColor: "#b2b2b2" }} />
                            {horizontalHeader.map((item, i) =>
                                <Header
                                    key={i}
                                    label={item}
                                    width={hwidth}
                                    onClick={(g, t) => clickGroup(g, t, new Set(visibleHeader.map(rowKey)))}
                                />
                            )}
                        </div>
                        {visibleHeader.map((v, i) => (
                            <Row key={i}
                                category={v[1]}
                                label={v[0]}
                                data={grid?.get(rowKey(v))?.sort((a, b) => sortHorizontal(a.hLabel, b.hLabel)) ?? []}
                                width={hwidth}
                                clickHeader={clickGroup}
                                horizontalHeaders={horizontalHeader}
                                toggleTrace={toggleTrace}
                            />
                        ))}
                    </div> :
                    <Alert Class='alert-info' ShowX={false}>Please select an asset.</Alert>
                }
            </div>
        </OverlayDrawer>
    );
};

export default DigitalLegend;
