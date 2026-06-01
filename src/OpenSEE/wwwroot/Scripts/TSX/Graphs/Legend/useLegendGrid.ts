//******************************************************************************************************
//  useLegendGrid.ts - Gbtc
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
import { cloneDeep } from "lodash";
import { PlotDataStateContext } from "../../Context/PlotDataContext";
import { PlotStateStateContext, PlotStateActionContext } from "../../Context/PlotStateContext";
import { toPlotKey, SeriesKey, seriesToKey } from "../../Context/PlotKeys";
import { ICategory, ILegendGrid, LegendGroupType } from './Types';
import { sortHorizontal, uniq, groupBy, sortVertical } from './Utilities';
import { OpenSee } from '../../global';

// Key for a verticalHeader entry ([vLabel, category])
export const rowKey = (v: [string, string]) => v[0] + v[1];

export const useLegendGrid = (dataKey: OpenSee.IGraphProps) => {
    const { plots } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);

    const pk = toPlotKey(dataKey);
    const dataPoints = plots[pk] ?? [];
    const enabled = plotState.meta[pk]?.enabled ?? {};

    const [categories, setCategories] = React.useState<ICategory[]>([]);
    const [verticalHeader, setVerticalHeader] = React.useState<[string, string][]>([]);
    const [horizontalHeader, setHorizontalHeader] = React.useState<string[]>([]);
    const [grid, setGrid] = React.useState<Map<string, ILegendGrid[]>>(new Map());

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
            stateActions.EnableTrace(dataKey, traces, tmp[index].Selected, dataPoints);
            return tmp;
        });
    };

    // visibleKeys (optional) limits a horizontal-group click to the rows currently shown in the legend.
    const clickGroup = (group: string, type: LegendGroupType, visibleKeys?: Set<string>) => {
        let isAny = false;
        const updates: SeriesKey[] = [];
        const inScope = (key: string) => visibleKeys == null || visibleKeys.has(key);

        if (type == 'vertical') {
            const gv = grid.get(group);
            isAny = gv?.some(item => item.enabled) ?? false;
            gv?.forEach(row => {
                if (isAny && row.enabled) { row.enabled = false; categories.forEach(cat => { const t = row.traces.get(cat.Label); if (t) updates.push(...t); }); }
                else if (!isAny) { row.enabled = true; categories.forEach(cat => { if (cat.Selected) { const t = row.traces.get(cat.Label); if (t) updates.push(...t); } }); }
            });
        } else {
            grid.forEach((row, key) => { if (inScope(key) && row.some(item => item.enabled && item.hLabel == group)) isAny = true; });
            grid.forEach((row, key) => { if (!inScope(key)) return; row.forEach(item => {
                if (isAny && item.enabled && item.hLabel == group) { item.enabled = false; categories.forEach(cat => { const t = item.traces.get(cat.Label); if (t) updates.push(...t); }); }
                else if (!isAny && item.hLabel == group) { item.enabled = true; categories.forEach(cat => { if (cat.Selected) { const t = item.traces.get(cat.Label); if (t) updates.push(...t); } }); }
            }); });
        }
        stateActions.EnableTrace(dataKey, updates, !isAny, dataPoints);
    };

    return { dataPoints, grid, categories, verticalHeader, horizontalHeader, changeCategory, clickGroup };
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
        grid: groupBy(gridArr, item => rowKey([item.vLabel, item.category] as [string, string])),
        categories: cats,
        verticalHeader: uniq(gridArr.map(item => [item.vLabel, item.category] as [string, string]), rowKey).sort(sortVertical),
        horizontalHeader: uniq(gridArr.map(item => item.hLabel), d => d).sort(sortHorizontal)
    };
};