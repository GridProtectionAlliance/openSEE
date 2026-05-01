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
import { OpenSee } from '../global';
import { cloneDeep } from "lodash";
import { SelectColor } from "../store/settingSlice";
import { useAppSelector } from "../hooks";
import { OverlayDrawer } from "@gpa-gemstone/react-interactive";
import { MultiCheckBoxSelect } from "@gpa-gemstone/react-forms";
import { PlotDataStateContext } from "../Context/PlotDataContext";
import { PlotStateStateContext, PlotStateActionContext } from "../Context/PlotStateContext";
import { toPlotKey, seriesToKey, SeriesKey } from "../Context/PlotKeys";

const hrow = 26;
interface iProps { height: number, dataKey: OpenSee.IGraphProps }
interface ICategory { Value: number; Label: string; Selected: boolean }
interface ILegendGrid { enabled: boolean, hLabel: string, vLabel: string, color: OpenSee.Color, traces: Map<string, SeriesKey[]>, category?: string }

const horizontalSort = ['W', 'Pk', 'RMS', 'Ph', 'V', 'I', 'Pre', 'Post', 'P', 'Q', 'S', 'Pf', 'R', 'X', 'Z', 'Mag', 'Ang'];
const verticalGroupSort = ['L-N', 'L-L', 'Volt.', 'Curr.', 'V', 'I'];
const verticalSort = ['AN', 'BN', 'CN', 'NG', 'RES', 'AB', 'BC', 'CA', 'Avg', 'Total', 'Pos', 'Neg', 'Zero', 'S0/S1', 'S2/S1', 'Simple', 'Reactance', 'Takagi', 'ModifiedTakagi', 'Novosel'];

function sortHorizontal(a: string, b: string): number {
    if (a == b) return 0;
    const ia = horizontalSort.indexOf(a), ib = horizontalSort.indexOf(b);
    if (ia != -1 && ib != -1) return ia - ib;
    if (ia != -1) return 1;
    if (ib != -1) return -1;
    return a > b ? 1 : -1;
}

function sortVertical(a: [string, string], b: [string, string]): number {
    if (a[1] != b[1]) return sortGroup(a, b);
    if (a[0] == b[0]) return 0;
    const ia = verticalSort.indexOf(a[0]), ib = verticalSort.indexOf(b[0]);
    if (ia != -1 && ib != -1) return ia - ib;
    if (ia != -1) return 1;
    if (ib != -1) return -1;
    return a[0] > b[0] ? 1 : -1;
}

function sortGroup(a: [string, string], b: [string, string]): number {
    if (a[1] == b[1]) return 0;
    const ia = verticalGroupSort.indexOf(a[1]), ib = verticalGroupSort.indexOf(b[1]);
    if (ia != -1 && ib != -1) return ia - ib;
    if (ia != -1) return 1;
    if (ib != -1) return -1;
    return a[1] > b[1] ? 1 : -1;
}

function uniq<T>(array: T[], fx: (item: T) => string): T[] {
    const result: T[] = [], seen: string[] = [];
    array.forEach(item => { const k = fx(item); if (!seen.includes(k)) { result.push(item); seen.push(k); } });
    return result;
}

function groupBy(list: ILegendGrid[], fnct: (v: ILegendGrid) => string): Map<string, ILegendGrid[]> {
    const result = new Map<string, ILegendGrid[]>();
    list.forEach(item => { const k = fnct(item); const v = result.get(k); if (v) v.push(item); else result.set(k, [item]); });
    return result;
}

const Legend = (props: iProps) => {
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
    const [wScroll, setWScroll] = React.useState<number>(0);

    React.useEffect(() => { const id = setTimeout(buildGrid, 250); return () => clearTimeout(id); }, [dataPoints, enabled]);
    React.useEffect(() => { setWScroll(measureScrollbarWidth()); }, []);

    function buildGrid() {
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

        setGrid(groupBy(gridArr, item => item.vLabel + item.category));
        setCategories(cats);
        setVerticalHeader(uniq(gridArr.map(item => [item.vLabel, item.category] as [string, string]), v => v[0] + v[1]).sort(sortVertical));
        setHorizontalHeader(uniq(gridArr.map(item => item.hLabel), d => d).sort(sortHorizontal));
    }

    function changeCategory(index: number, item: ICategory) {
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
    }

    function clickGroup(group: string, type: 'vertical' | 'horizontal') {
        let isAny = false;
        let updates: SeriesKey[] = [];

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
    }

    const hwidth = (200 - 4) / (horizontalHeader.length + (verticalHeader.length > 1 ? 2 : 1));
    const isScroll = (props.height - 97) < (verticalHeader.length * (2 + hrow));

    return (
        <OverlayDrawer Location="right" Title="Traces" Open={false} Target={"graphWindow-" + props.dataKey.DataType + "-" + props.dataKey.EventId}>
            <div style={{ float: "right", width: "200px", height: props.height - 38, marginTop: "6px" }}>
                <div className="form-group">
                    <MultiCheckBoxSelect Options={categories} OnChange={(_, options) => { options.forEach(o => { const i = categories.findIndex(c => c.Label == o.Label); changeCategory(i, categories[i]); }); }} Label="" />
                </div>
                <div className="legend" style={{ width: "100%", borderStyle: "solid", borderWidth: "2px", overflowY: "hidden", maxHeight: props.height - 42 }}>
                    <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderBottom: "2px solid #b2b2b2", paddingRight: isScroll ? wScroll : 0 }}>
                        <div style={{ width: (verticalHeader.length > 1 ? 2 : 1) * hwidth, backgroundColor: "#b2b2b2" }} />
                        {horizontalHeader.map((item, i) => <Header key={i} label={item} index={i} width={hwidth} onClick={clickGroup} />)}
                    </div>
                    <div style={{ overflowY: isScroll ? 'scroll' : 'hidden', maxHeight: props.height - 101, width: '100%' }}>
                        {verticalHeader.length > 1 && verticalHeader.some(v => v[1]) ?
                            <div style={{ width: 'auto', backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                                {uniq(verticalHeader, v => v[1]).sort(sortGroup).map((v, i) =>
                                    <VCategory key={i} label={v[1]} height={hrow * verticalHeader.filter(item => item[1] == v[1]).length} width={hwidth} />
                                )}
                            </div> : null}
                        <div style={{ width: verticalHeader.length > 1 && verticalHeader.some(v => v[1]) ? `calc(100% - ${hwidth}px)` : "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                            {verticalHeader.map((v, i) => (
                                <Row key={i} dataKey={props.dataKey} category={v[1]} activeCategories={categories.filter(c => c.Selected).map(c => c.Label)} label={v[0]}
                                    data={grid?.get(v[0] + v[1])?.sort((a, b) => sortHorizontal(a.hLabel, b.hLabel)) ?? []}
                                    width={hwidth} clickHeader={clickGroup} verticalHeaders={verticalHeader} horizontalHeaders={horizontalHeader} plotData={dataPoints} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </OverlayDrawer>
    );
};

const Header = (props: { index: number, label: string, width: number, onClick: (s: string, t: 'horizontal' | 'vertical') => void }) => (
    <div style={{ width: props.width, borderLeft: "2px solid #b2b2b2" }}>
        <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap" }} onClick={() => props.onClick(props.label, 'horizontal')}> {props.label}</span>
    </div>
);

const VCategory = (props: { key: number, label: string, height: number, width: number }) => (
    <div style={{ width: props.width, borderTop: "2px solid #b2b2b2", height: props.height }}>
        <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap", writingMode: "vertical-rl", height: "100%", transform: 'rotate(180deg)' }}>{props.label}</span>
    </div>
);

const Row = (props: { category: string, label: string, data: ILegendGrid[], width: number, activeCategories: string[], clickHeader: (g: string, t: 'horizontal' | 'vertical') => void, dataKey: OpenSee.IGraphProps, horizontalHeaders: string[], verticalHeaders: [string, string][], plotData: OpenSee.iD3DataSeries[] }) => {
    const hasH = props.horizontalHeaders.some(h => h);
    const hasCat = props.category !== '' && props.category !== null;
    const labelWidth = !hasH && !hasCat ? '50%' : hasH && !hasCat ? 2 * props.width : props.width;

    return (
        <div className="d-flex" style={{ width: "100%", backgroundColor: "rgb(204,204,204)", textAlign: "center", borderTop: "2px solid #b2b2b2", height: 'auto' }}>
            <div style={{ width: labelWidth, textAlign: "center" }}>
                <span style={{ fontSize: "smaller", fontWeight: "bold", wordWrap: 'break-word' }} onClick={() => props.clickHeader(props.label + props.category, 'vertical')}>{props.label}</span>
            </div>
            {props.data.map((item, i) =>
                <TraceButton key={i} width={!hasH && !hasCat ? { width: '50%' } : { width: props.width }} data={item} dataKey={props.dataKey} plotData={props.plotData} />
            )}
        </div>
    );
};

const TraceButton = (props: { data: ILegendGrid, width: React.CSSProperties, dataKey: OpenSee.IGraphProps, plotData: OpenSee.iD3DataSeries[] }) => {
    const colors = useAppSelector(SelectColor);
    const stateActions = React.useContext(PlotStateActionContext);

    function getColor(color: OpenSee.Color) {
        return Object.keys(colors).includes(color as string) ? colors[color] : colors.random;
    }

    function onClick() {
        let traces: SeriesKey[] = [];
        props.data.traces.forEach(val => { traces = traces.concat(val); });
        props.data.enabled = !props.data.enabled;
        stateActions.EnableTrace(props.dataKey, traces, props.data.enabled, props.plotData);
    }

    return (
        <div style={{ ...props.width, backgroundColor: convertHex(getColor(props.data.color), props.data.enabled ? 100 : 50), borderLeft: "2px solid #b2b2b2" }} onClick={onClick}>
            {props.data.enabled ? <i className="fa fa-minus" /> : <i className="fa fa-plus" />}
        </div>
    );
};

function convertHex(hex: string, opacity: number) {
    hex = hex.replace("#", "");
    return `rgba(${parseInt(hex.substring(0, 2), 16)},${parseInt(hex.substring(2, 4), 16)},${parseInt(hex.substring(4, 6), 16)},${opacity / 100})`;
}

function measureScrollbarWidth(): number {
    const el = document.createElement('div');
    el.style.overflow = 'scroll';
    document.body.appendChild(el);
    const w = el.offsetWidth - el.clientWidth;
    document.body.removeChild(el);
    return w;
}

export default Legend;