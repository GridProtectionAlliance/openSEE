//******************************************************************************************************
//  LegendBase.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  01/06/2020 - C Lackner
//       Generated original version of source code.
//  07/08/2020 - C Lackner
//       Refactored Trace Picker to work as Grid.
//
//******************************************************************************************************
import * as React from "react";
import { Alert, OverlayDrawer } from "@gpa-gemstone/react-interactive";
import { MultiCheckBoxSelect } from "@gpa-gemstone/react-forms";
import { sortGroup, sortHorizontal, uniq } from './Utilities';
import { useLegendGrid, rowKey } from './useLegendGrid';
import DigitalLegend from './DigitalLegend';
import Header from './Header';
import Row from './Row';
import VCategory from './VCategory';
import { OpenSee } from '../../global';

const hrow = 26;

interface IProps {
    height: number,
    dataKey: OpenSee.IGraphProps
}

const Legend = (props: IProps) => {
    if (props.dataKey.DataType === 'Digitals')
        return <DigitalLegend dataKey={props.dataKey} height={props.height} />;

    return <StandardLegend dataKey={props.dataKey} height={props.height} />;
};

const StandardLegend = (props: IProps) => {
    const { grid, categories, verticalHeader, horizontalHeader, changeCategory, clickGroup, toggleTrace } = useLegendGrid(props.dataKey);

    const hwidth = (200 - 4) / (horizontalHeader.length + (verticalHeader.length > 1 ? 2 : 1));
    const hasSelectedAssets = categories.some(c => c.Selected);

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
                {hasSelectedAssets ?
                    <div className="legend" style={{ width: "100%", borderStyle: "solid", borderWidth: "2px", flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
                        <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderBottom: "2px solid #b2b2b2", position: "sticky", top: 0, zIndex: 1 }}>
                            <div style={{ width: (verticalHeader.length > 1 ? 2 : 1) * hwidth, backgroundColor: "#b2b2b2" }} />
                            {horizontalHeader.map((item, i) =>
                                <Header
                                    key={i}
                                    label={item}
                                    width={hwidth}
                                    onClick={clickGroup}
                                />
                            )}
                        </div>
                        <div style={{ width: '100%' }}>
                            {verticalHeader.length > 1 && verticalHeader.some(v => v[1]) ?
                                <div style={{ width: 'auto', backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                                    {uniq(verticalHeader, v => v[1]).sort(sortGroup).map((v, i) =>
                                        <VCategory
                                            key={i}
                                            label={v[1]}
                                            height={hrow * verticalHeader.filter(item => item[1] == v[1]).length}
                                            width={hwidth}
                                        />
                                    )}
                                </div> : null}
                            <div style={{
                                width: verticalHeader.length > 1 && verticalHeader.some(v => v[1]) ? `calc(100% - ${hwidth}px)` : "100%",
                                backgroundColor: "rgb(204,204,204)",
                                overflow: "hidden",
                                textAlign: "center",
                                display: "inline-block",
                                verticalAlign: "top"
                            }}>
                                {verticalHeader.map((v, i) => (
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
                            </div>
                        </div>
                    </div> :
                    <Alert Class='alert-info' ShowX={false}>
                        Please select an asset.
                    </Alert>
                }
            </div>
        </OverlayDrawer>
    );
};

export default Legend;
