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
import { PlotDataStateContext } from "../../Context/PlotDataContext";
import { PlotStateStateContext, PlotStateActionContext } from "../../Context/PlotStateContext";
import { LegendTraceKey, seriesToKey, seriesToLegendTraceKey, toPlotKey } from "../../Context/PlotKeys";
import { ICategory, ILegendGrid, LegendGroupType } from './Types';
import { sortHorizontal, uniq, groupBy, sortVertical } from './Utilities';
import { OpenSee } from '../../global';

// Key for a verticalHeader entry ([vLabel, category])
export const rowKey = (v: [string, string]) => v[0] + v[1];

type CategoryOption = { Label: string | JSX.Element };

export const useLegendGrid = (dataKey: OpenSee.IGraphProps) => {
    const { plots } = React.useContext(PlotDataStateContext);
    const plotState = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);

    const pk = toPlotKey(dataKey);
    const dataPoints = plots[pk] ?? [];
    const selectedAssets = plotState.meta[pk]?.selectedAssets ?? [];
    const selectedTraces = plotState.meta[pk]?.selectedTraces ?? [];

    const [categories, setCategories] = React.useState<ICategory[]>([]);
    const [verticalHeader, setVerticalHeader] = React.useState<[string, string][]>([]);
    const [horizontalHeader, setHorizontalHeader] = React.useState<string[]>([]);
    const [grid, setGrid] = React.useState<Map<string, ILegendGrid[]>>(new Map());

    React.useEffect(() => { const id = setTimeout(buildGrid, 250); return () => clearTimeout(id); }, [dataPoints, selectedAssets, selectedTraces]);

    const buildGrid = () => {
        const nextGrid = buildLegendGrid(dataPoints, selectedAssets, selectedTraces);
        setGrid(nextGrid.grid);
        setCategories(nextGrid.categories);
        setVerticalHeader(nextGrid.verticalHeader);
        setHorizontalHeader(nextGrid.horizontalHeader);
    };

    const changeCategory = (items: CategoryOption[]) => {
        const nextAssets = [...selectedAssets];
        items.forEach(item => {
            if (typeof item.Label !== 'string') return;

            const index = nextAssets.indexOf(item.Label);
            if (index >= 0)
                nextAssets.splice(index, 1);
            else
                nextAssets.push(item.Label);
        });
        stateActions.SetLegendSelections(dataKey, dataPoints, nextAssets, selectedTraces);
    };

    const toggleTraceKeys = (traceKeys: LegendTraceKey[]) => {
        const nextTraces = [...selectedTraces];
        const isAny = traceKeys.some(traceKey => nextTraces.includes(traceKey));

        traceKeys.forEach(traceKey => {
            const index = nextTraces.indexOf(traceKey);
            if (isAny && index >= 0)
                nextTraces.splice(index, 1);
            else if (!isAny && index < 0)
                nextTraces.push(traceKey);
        });

        stateActions.SetLegendSelections(dataKey, dataPoints, selectedAssets, nextTraces);
    };

    // visibleKeys (optional) limits a horizontal-group click to the rows currently shown in the legend.
    const clickGroup = (group: string, type: LegendGroupType, visibleKeys?: Set<string>) => {
        const inScope = (key: string) => visibleKeys == null || visibleKeys.has(key);
        const traceKeys: LegendTraceKey[] = [];

        if (type == 'vertical') {
            const gv = grid.get(group);
            gv?.forEach(row => { if (!traceKeys.includes(row.traceKey)) traceKeys.push(row.traceKey); });
        } else {
            grid.forEach((row, key) => { if (!inScope(key)) return; row.forEach(item => {
                if (item.hLabel == group && !traceKeys.includes(item.traceKey)) traceKeys.push(item.traceKey);
            }); });
        }
        toggleTraceKeys(traceKeys);
    };

    return { dataPoints, grid, categories, verticalHeader, horizontalHeader, changeCategory, clickGroup, toggleTrace: (traceKey: LegendTraceKey) => toggleTraceKeys([traceKey]) };
};

const buildLegendGrid = (dataPoints: OpenSee.iD3DataSeries[], selectedAssets: string[], selectedTraces: LegendTraceKey[]) => {
    const cats: ICategory[] = [];
    const gridArr: ILegendGrid[] = [];

    dataPoints.forEach((item) => {
        const sk = seriesToKey(item);
        const traceKey = seriesToLegendTraceKey(item);
        let ci = cats.findIndex(c => c.Label === item.LegendGroup);
        if (ci === -1) { cats.push({ Value: 0, Label: item.LegendGroup, Selected: false }); ci = cats.length - 1; }
        if (selectedAssets.includes(item.LegendGroup)) cats[ci].Selected = true;

        let gi = gridArr.findIndex(g => g.hLabel === item.LegendHorizontal && g.vLabel === item.LegendVertical && g.category == item.LegendVGroup);
        if (gi === -1) { gridArr.push({ enabled: false, hLabel: item.LegendHorizontal, vLabel: item.LegendVertical, traceKey, color: item.Color, traces: new Map(), category: item.LegendVGroup }); gi = gridArr.length - 1; }
        if (selectedTraces.includes(traceKey)) gridArr[gi].enabled = true;

        const t = gridArr[gi].traces.get(item.LegendGroup);
        if (t) t.push(sk); else gridArr[gi].traces.set(item.LegendGroup, [sk]);
    });

    return {
        grid: groupBy(gridArr, item => rowKey([item.vLabel, item.category] as [string, string])),
        categories: cats,
        verticalHeader: uniq(gridArr.map(item => [item.vLabel, item.category] as [string, string]), rowKey).sort(sortVertical),
        horizontalHeader: uniq(gridArr.map(item => item.hLabel), d => d).sort(sortHorizontal)
    };
};
