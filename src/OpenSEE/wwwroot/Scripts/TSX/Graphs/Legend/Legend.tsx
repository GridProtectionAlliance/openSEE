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
import { cloneDeep } from "lodash";
import { OverlayDrawer } from "@gpa-gemstone/react-interactive";
import { MultiCheckBoxSelect } from "@gpa-gemstone/react-forms";
import { GetScrollbarWidth } from "@gpa-gemstone/helper-functions";
import { PlotDataStateContext } from "../../Context/PlotDataContext";
import { PlotStateStateContext, PlotStateActionContext } from "../../Context/PlotStateContext";
import { toPlotKey, SeriesKey } from "../../Context/PlotKeys";
import { ILegendGrid, LegendGroupType } from './Types';
import { sortGroup, sortHorizontal, uniq, groupBy, sortVertical } from './Utilities';
import Header from './Header';
import Row from './Row';
import VCategory from './VCategory';
import { OpenSee } from '../../global';
import { seriesToKey } from '../../Context/PlotKeys';

const hrow = 26;

interface IProps {
    height: number,
    dataKey: OpenSee.IGraphProps
}

//This should really be exported via gpa-gemstone
interface ICategory {
    Value: number;
    Label: string;
    Selected: boolean
}

const Legend = (props: IProps) => {
    const { plots } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);

    const pk = toPlotKey(props.dataKey);
    const dataPoints = plots[pk] ?? [];
    const enabled = plotState.meta[pk]?.enabled ?? {};

    const [categories, setCategories] = React.useState<ICategory[]>([]);
    const [verticalHeader, setVerticalHeader] = React.useState<[string, string][]>([]);
    const [horizontalHeader, setHorizontalHeader] = React.useState<string[]>([]);
    const [grid, setGrid] = React.useState<Map<string, ILegendGrid[]>>(new Map());
    const scrollWidth = GetScrollbarWidth();

    React.useEffect(() => { const id = setTimeout(buildGrid, 250); return () => clearTimeout(id); }, [dataPoints, enabled]);

    const buildGrid = () => {
        const nextGrid = buildLegendGrid(dataPoints, enabled);
        setGrid(nextGrid.grid);
        setCategories(nextGrid.categories);
        setVerticalHeader(nextGrid.verticalHeader);
        setHorizontalHeader(nextGrid.horizontalHeader);
    };

    const changeCategory = (index: number, item: ICategory) => {
        setCategories(current => {
            const tmp = cloneDeep(current);
            tmp[index].Selected = !tmp[index].Selected;
            let traces: SeriesKey[] = [];
            grid.forEach(row => row.forEach(data => {
                const trace = data.traces.get(item.Label);
                if (trace != null && (tmp[index].Selected ? data.enabled : true)) traces = traces.concat(trace);
            }));
            stateActions.EnableTrace(props.dataKey, traces, tmp[index].Selected, dataPoints);
            return tmp;
        });
    };

    const clickGroup = (group: string, type: LegendGroupType) => {
        let isAny = false;
        const updates: SeriesKey[] = [];

        if (type == 'vertical') {
            const gv = grid.get(group);
            isAny = gv?.some(item => item.enabled) ?? false;
            gv?.forEach(row => {
                if (isAny && row.enabled) { row.enabled = false; categories.forEach(cat => { const t = row.traces.get(cat.Label); if (t) updates.push(...t); }); }
                else if (!isAny) { row.enabled = true; categories.forEach(cat => { if (cat.Selected) { const t = row.traces.get(cat.Label); if (t) updates.push(...t); } }); }
            });
        } else {
            grid.forEach(row => { if (row.some(item => item.enabled && item.hLabel == group)) isAny = true; });
            grid.forEach(row => row.forEach(item => {
                if (isAny && item.enabled && item.hLabel == group) { item.enabled = false; categories.forEach(cat => { const t = item.traces.get(cat.Label); if (t) updates.push(...t); }); }
                else if (!isAny && item.hLabel == group) { item.enabled = true; categories.forEach(cat => { if (cat.Selected) { const t = item.traces.get(cat.Label); if (t) updates.push(...t); } }); }
            }));
        }
        stateActions.EnableTrace(props.dataKey, updates, !isAny, dataPoints);
    };

    const hwidth = (200 - 4) / (horizontalHeader.length + (verticalHeader.length > 1 ? 2 : 1));
    const isScroll = (props.height - 97) < (verticalHeader.length * (2 + hrow));

    return (
        <OverlayDrawer Location="right" Title="Traces" Open={false} Target={"graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId}>
            <div style={{ float: "right", width: "200px", height: props.height - 38, marginTop: "6px" }}>
                <div className="form-group">
                    <MultiCheckBoxSelect
                        Options={categories}
                        OnChange={(_, options) => {
                            options.forEach(o => {
                                const i = categories.findIndex(c => c.Label == o.Label);
                                changeCategory(i, categories[i]);
                            });
                        }}
                        Label=""
                    />
                </div>
                <div className="legend" style={{ width: "100%", borderStyle: "solid", borderWidth: "2px", overflowY: "hidden", maxHeight: props.height - 42 }}>
                    <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderBottom: "2px solid #b2b2b2", paddingRight: isScroll ? scrollWidth : 0 }}>
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
                    <div style={{ overflowY: isScroll ? 'scroll' : 'hidden', maxHeight: props.height - 101, width: '100%' }}>
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
                                    dataKey={props.dataKey}
                                    category={v[1]}
                                    label={v[0]}
                                    data={grid?.get(v[0] + v[1])?.sort((a, b) => sortHorizontal(a.hLabel, b.hLabel)) ?? []}
                                    width={hwidth}
                                    clickHeader={clickGroup}
                                    horizontalHeaders={horizontalHeader}
                                    plotData={dataPoints}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </OverlayDrawer>
    );
};

const buildLegendGrid = (dataPoints: OpenSee.iD3DataSeries[], enabled: { [key: string]: boolean }) => {
    const cats: ICategory[] = [];
    const gridArr: ILegendGrid[] = [];

    dataPoints.forEach((item) => {
        const sk = seriesToKey(item);
        let ci = cats.findIndex(c => c.Label === item.LegendGroup);
        if (ci === -1) { cats.push({ Value: 0, Label: item.LegendGroup, Selected: false }); ci = cats.length - 1; }
        if (enabled[sk]) cats[ci].Selected = true;

        let gi = gridArr.findIndex(g => g.hLabel === item.LegendHorizontal && g.vLabel === item.LegendVertical && g.category == item.LegendVGroup);
        if (gi === -1) { gridArr.push({ enabled: false, hLabel: item.LegendHorizontal, vLabel: item.LegendVertical, color: item.Color, traces: new Map(), category: item.LegendVGroup }); gi = gridArr.length - 1; }
        if (enabled[sk]) gridArr[gi].enabled = true;

        const t = gridArr[gi].traces.get(item.LegendGroup);
        if (t) t.push(sk); else gridArr[gi].traces.set(item.LegendGroup, [sk]);
    });

    if (cats.length == 1) cats[0].Selected = true;
    else if (cats.length > 1 && !cats.some(c => c.Selected)) cats[0].Selected = true;

    return {
        grid: groupBy(gridArr, item => item.vLabel + item.category),
        categories: cats,
        verticalHeader: uniq(gridArr.map(item => [item.vLabel, item.category] as [string, string]), v => v[0] + v[1]).sort(sortVertical),
        horizontalHeader: uniq(gridArr.map(item => item.hLabel), d => d).sort(sortHorizontal)
    };
};

export default Legend;