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
import { selectData, selectEnabled, EnableTrace } from "../store/dataSlice";
import { SelectColor } from "../store/settingSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { OverlayDrawer } from "@gpa-gemstone/react-interactive";
import { MultiCheckBoxSelect, StylableSelect } from "@gpa-gemstone/react-forms";

const hrow = 26;

interface iProps {
    height: number,
    type: OpenSee.graphType,
    eventId: number,
}

interface ICategory {
    Value: number;
    Text: string;
    Selected: boolean 
}

interface ILegendGrid {
    enabled: boolean,
    hLabel: string,
    vLabel: string,
    color: OpenSee.Color,
    traces: Map<string, Array<number>>,
    category?: string,
}

const horizontalSort = ['W', 'Pk', 'RMS', 'Ph', 'V', 'I', 'Pre', 'Post', 'P', 'Q', 'S', 'Pf', 'R', 'X', 'Z', 'Mag', 'Ang'];
const verticalGroupSort = ['L-N', 'L-L', 'Volt.', 'Curr.','V','I'];
const verticalSort = ['AN', 'BN', 'CN', 'NG', 'RES', 'AB', 'BC', 'CA', 'Avg', 'Total', 'Pos', 'Neg', 'Zero','S0/S1','S2/S1', 'Simple', 'Reactance', 'Takagi', 'ModifiedTakagi', 'Novosel'];

const Legend = (props: iProps) => {
    const MemoSelectData = React.useMemo(() => selectData(props.dataKey), []);
    const MemoSelectEnabled = React.useMemo(() => selectEnabled(props.dataKey), []);

    const data = useAppSelector(MemoSelectData);
    const enabled = useAppSelector(MemoSelectEnabled)
    const dispatch = useAppDispatch();

    const [categories, setCategories] = React.useState<Array<ICategory>>([]);
    const [showCategories, setShowCategories] = React.useState<boolean>(false);
    const [verticalHeader, setVerticalHeader] = React.useState<Array<[string, string]>>([]);
    const [horizontalHeader, setHorizontalHeader] = React.useState<Array<string>>([]);
    const [grid, setGrid] = React.useState<Map<string, ILegendGrid[]>>(new Map<string, ILegendGrid[]>());

    const [wScroll, setWScroll] = React.useState<number>(0);

    React.useEffect(() => {
        update();
    }, [enabled])

    React.useEffect(() => {
        dataUpdate();
    }, [data])

    React.useEffect(() => { setWScroll(measureScrollbarWidth()); }, [])
    function dataUpdate() {
        let categories: Array<ICategory> = [];
        let grid: Array<ILegendGrid> = [];

        data.forEach((item: OpenSee.iD3DataSeries, dataIndex) => {
            let index = categories.findIndex(category => category.Text === item.LegendGroup);
            if (index === -1) {
                categories.push({ Value: 0, Text: item.LegendGroup, Selected: false });
                index = categories.findIndex(category => category.Text === item.LegendGroup);
            }
            if (enabled[dataIndex])
                categories[index].Selected = true;
            index = grid.findIndex(g => g.hLabel === item.LegendHorizontal && g.vLabel === item.LegendVertical && g.category == item.LegendVGroup);
            if (index === -1) {
                grid.push({ enabled: false, hLabel: item.LegendHorizontal, vLabel: item.LegendVertical, color: item.Color, traces: new Map<string, Array<number>>(), category: item.LegendVGroup })
                index = grid.findIndex(g => g.hLabel === item.LegendHorizontal && g.vLabel === item.LegendVertical && g.category == item.LegendVGroup);
            }
            if (enabled[dataIndex])
                grid[index].enabled = true;

            if (grid[index].traces.has(item.LegendGroup))
                grid[index].traces.get(item.LegendGroup).push(dataIndex)
            else
                grid[index].traces.set(item.LegendGroup, [dataIndex])
        });

        if (categories.length == 1)
            categories[0].Selected = true
        else if (categories.length > 1) {
            if (!categories.some(item => item.Selected))
                categories[0].Selected = true
        }

        setGrid(groupBy(grid, item => (item.vLabel + item.category)));
        setCategories(categories);
        setVerticalHeader(uniq(grid.map(item => [item.vLabel, item.category]), (item) => { return (item[0] + item[1]) }).sort(sortVertical))
        setHorizontalHeader(uniq(grid.map(item => item.hLabel), (d) => d).sort(sortHorizontal));
    }

    function update() {
        let updateGrid: Map<string, ILegendGrid[]> = cloneDeep(grid);

        data.forEach((item: OpenSee.iD3DataSeries, dataIndex) => {

            let index = item.LegendVertical + item.LegendVGroup;
            if (!updateGrid.has(index)) {
                updateGrid.set(index, [{ enabled: false, hLabel: item.LegendHorizontal, vLabel: item.LegendVertical, color: item.Color, traces: new Map<string, Array<number>>(), category: item.LegendVGroup }])
            }
            let dIndex = updateGrid.get(index).findIndex(g => g.hLabel === item.LegendHorizontal)

            if (dIndex == -1) {
                updateGrid.set(index, [...updateGrid.get(index), { enabled: false, hLabel: item.LegendHorizontal, vLabel: item.LegendVertical, color: item.Color, traces: new Map<string, Array<number>>(), category: item.LegendVGroup }])
                dIndex = updateGrid.get(index).findIndex(g => g.hLabel === item.LegendHorizontal);
            }
            if (enabled[dataIndex])
                updateGrid.get(index)[dIndex].enabled = true;

            if (updateGrid.get(index)[dIndex].traces.has(item.LegendGroup)) {
                let ugrid = updateGrid.get(index);
                ugrid[dIndex].traces.get(item.LegendGroup).push(dataIndex)
                updateGrid.set(index, ugrid);
            }
            else {
                let ugrid = updateGrid.get(index);
                ugrid[dIndex].traces.set(item.LegendGroup, [dataIndex])
                updateGrid.set(index, ugrid);
            }
        });

        setGrid(updateGrid);

    }

    function sortHorizontal(item1: string, item2: string): number {
        if (item1 == item2)
            return 0

        let index1 = horizontalSort.findIndex((v) => v == item1);
        let index2 = horizontalSort.findIndex((v) => v == item2);

        if (index1 != -1 && index2 != -1)
            return (index1 > index2 ? 1 : -1);
        if (index1 != -1)
            return 1;
        if (index2 != -1)
            return -1;

        return (item1 > item2 ? 1 : -1);
    }

    function sortVertical(item1: [string, string], item2: [string, string]): number {
        if (item1[1] != item2[1])
            return sortGroup(item1, item2);
        if (item1[0] == item2[0])
            return 0;

        let index1 = verticalSort.findIndex((v) => v == item1[0]);
        let index2 = verticalSort.findIndex((v) => v == item2[0]);

        if (index1 != -1 && index2 != -1)
            return (index1 > index2 ? 1 : -1);
        if (index1 != -1)
            return 1;
        if (index2 != -1)
            return -1;

        return (item1[0] > item2[0] ? 1 : -1);
    }

    function sortGroup(item1: [string, string], item2: [string, string]): number {
        if (item1[1] == item2[1])
            return 0

        let index1 = verticalGroupSort.findIndex((v) => v == item1[1]);
        let index2 = verticalGroupSort.findIndex((v) => v == item2[1]);

        if (index1 != -1 && index2 != -1)
            return (index1 > index2 ? 1 : -1);
        if (index1 != -1)
            return 1;
        if (index2 != -1)
            return -1;

        return (item1[1] > item2[1] ? 1 : -1);
    }

    function changeCategory(index: number, item: ICategory) {

        setCategories((current) => {
            const tmp = cloneDeep(current);
            tmp[index].Selected = !tmp[index].Selected;

            // Also Disable or enable associated Traces and corresponding Grid entries....
            let traces: Array<number> = [];

            if (tmp[index].Selected)
                grid.forEach(row => row.forEach(data => {
                    if (data.traces.has(item.Text) && data.enabled)
                        traces = traces.concat(data.traces.get(item.Text));
                }));
            else
                grid.forEach(row => row.forEach(data => {
                    if (data.traces.has(item.Text))
                        traces = traces.concat(data.traces.get(item.Text));
                }));

            dispatch(EnableTrace({ trace: traces, enabled: tmp[index].Selected, key: dataKey }));

            return tmp;
        });
    }

    function uniq(array, fx) {
        const result = [];
        const resultfx = [];
        array.forEach(item => {
            const fxn = fx(item);
            const index = resultfx.findIndex(sitem => sitem === fxn)
            if (index < 0) {
                result.push(item);
                resultfx.push(fxn);
            }
        })

        return result;
    }

    function groupBy(list: Array<ILegendGrid>, fnct: (val: ILegendGrid) => string) {
        let result: Map<string, ILegendGrid[]> = new Map<string, ILegendGrid[]>();

        list.forEach(item => {
            if (result.has(fnct(item)))
                result.get(fnct(item)).push(item);
            else
                result.set(fnct(item), [item]);
        })
        return result;
    }


    const hwidth = (200 - 4) / (horizontalHeader.length + (verticalHeader.length > 1 ? 2 : 1));

    function clickGroup(group: string, type: 'vertical' | 'horizontal') {
        let isAny = false;
        let updates: number[] = [];

        if (type == 'vertical') {
            isAny = grid.get(group).some(item => item.enabled);


            if (isAny) {
                grid.get(group).forEach(row => {
                    if (row.enabled) {
                        row.enabled = false;
                        categories.forEach((cat) => {
                            updates.push(...row.traces.get(cat.Text));
                        });
                    }
                });
            }
            else {

                grid.get(group).forEach(row => {
                    row.enabled = true;
                    categories.forEach((cat) => {
                        if (cat.Selected)
                            updates.push(...row.traces.get(cat.Text));
                    });

                });
            }
        }
        else {
            isAny = false;
            grid.forEach(row => { if (row.some(item => (item.enabled && item.hLabel == group))) isAny = true; });

            if (isAny) {
                grid.forEach(row => {
                    row.forEach(item => {
                        if (item.enabled && item.hLabel == group) {
                            item.enabled = false;
                            categories.forEach((cat) => {
                                updates.push(...item.traces.get(cat.Text));
                            });
                        }
                    })
                });
            }
            else {
                grid.forEach(row => {
                    row.forEach(item => {
                        if (item.hLabel == group) {
                            item.enabled = true;
                            categories.forEach((cat) => {
                                if (cat.Selected)
                                    updates.push(...item.traces.get(cat.Text));
                            });
                        }
                    })
                });
            }
        }

        dispatch(EnableTrace({ key: { EventId: props.eventId, DataType: props.type }, trace: updates, enabled: !isAny }))

    }
    const isScroll = (props.height - 97) < (verticalHeader.length * (2 + hrow));

    return (
        <OverlayDrawer Location={"right"} Title={"Traces"} Open={false} Target={"graphWindow-" + props.type + "-" + props.eventId}> 
        <div style={{ float: "right", width: "200px", height: props.height - 38, marginTop: "6px"}} >
                <div className="form-group" style={ {color: undefined}}>
                        <MultiCheckBoxSelect
                            Options={categories}
                            OnChange={(options) => {
                                options.forEach((o) => {
                                    const i = categories.findIndex((c) => c.Text == o.Text);
                                    changeCategory(i, categories[i])
                                })
                            }}
                            Label={""}
                        />
                    </div>
                <div className="legend" style={{ width: "100%", borderStyle: "solid", borderWidth: "2px", overflowY: "hidden", maxHeight: props.height - 42 }}>
                <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderBottom: "2px solid #b2b2b2", paddingRight: (isScroll ? wScroll : 0) }}>
                    <div style={{ width: ((verticalHeader.length > 1 ? 2 : 1) * hwidth), backgroundColor: "#b2b2b2" }}></div>
                    {horizontalHeader.map((item, index) => <Header key={index} label={item} index={index} width={hwidth} onClick={(grp: string, type: ("vertical" | "horizontal")) => clickGroup(grp, type)}/>)}
                </div>
                <div style={{ overflowY: (isScroll ? 'scroll' : 'hidden'), maxHeight: props.height - 101, width: '100%' }}>
                {(verticalHeader.length > 1 && verticalHeader.some(item => item[1]) ?
                    <div style={{ width: 'auto', backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                        {uniq(verticalHeader, v => v[1]).sort(sortGroup).map((value, index) => <VCategory key={index} label={value[1]} height={hrow * verticalHeader.filter(item => item[1] == value[1]).length} width={hwidth} />)}
                    </div> : null)}
                        <div style={{ width: (verticalHeader.length > 1 && verticalHeader.some(item => item[1]) ? "calc(100% - " + hwidth + "px)" : "100%"), backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                            {verticalHeader.map((value, index) => {
                                return (
                                    <Row
                                        dataKey={props.dataKey}
                                        category={value[1]}
                                        activeCategories={categories.filter(item => item.Selected).map(item => item.Text)}
                                        key={index}
                                        label={value[0]}
                                        data={grid?.get(value[0] + value[1])?.sort((item1, item2) => sortHorizontal(item1.hLabel, item2.hLabel))}
                                        width={hwidth}
                                        clickHeader={(grp: string, type: ("vertical" | "horizontal")) => clickGroup(grp, type)}
                                        verticalHeaders={verticalHeader}
                                        horizontalHeaders={horizontalHeader}
                                    />
                                );
                            })}
                    </div>
                </div>
        </div>
        </div>
        </OverlayDrawer>
        );
    
}

const Category = (props: { key: number, label: string, enabled: boolean, onclick: () => void }) => {
    return (
        <a className={"dropdown-item " + (props.enabled ? "active" : "")} style={{ overflow: 'hidden', whiteSpace: 'normal', maxWidth: '196px' }} onClick={() => props.onclick()}>{props.label}</a>
    );
};

const Header = (props: { index: number, label: string, width: number, onClick: (str: string, type: string) => void }) => {

    return (<div key={props.index} style={{ width: props.width, borderLeft: "2px solid #b2b2b2" }}>
        <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap", margin: "(0,0,0,0)" }} onClick={() => props.onClick(props.label, 'horizontal')} > {props.label}</span>
    </div>)

}

const VCategory = (props: { key: number, label: string, height: number, width: number }) => {
    return (
        <div style={{ width: props.width, borderTop: "2px solid #b2b2b2", height: props.height }}>
            <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap", margin: "(0,0,0,0)", writingMode: "vertical-rl", height: "100%", transform: 'rotate(180deg)' }}>{props.label}</span>
        </div>)
}

const Row = (props: { category: string, label: string, data: Array<ILegendGrid>, width: number, activeCategories: Array<string>, clickHeader: (group: string, type: string) => void, dataKey: OpenSee.IGraphProps, horizontalHeaders, verticalHeaders }) => {
    const hasHorizontalHeaders = props.horizontalHeaders.some(item => item)
    const hasCategoryGroup = props.category !== '' && props.category !== null
    const labelWidth = !hasHorizontalHeaders && !hasCategoryGroup ? '50%' : hasHorizontalHeaders && !hasCategoryGroup ? 2 * props.width : props.width

    function hasData(data: ILegendGrid) {
        let n = 0;
        data.traces.forEach((val, key) => {
            if (props.activeCategories.indexOf(key) !== -1)
                n = n + val.length;
        })

        return n > 0;
    }

    return (
        <div className="d-flex" style={{ width: "100%", backgroundColor: "rgb(204,204,204)", textAlign: "center", borderTop: "2px solid #b2b2b2", height: 'auto' }}>
            <div style={{ width: labelWidth, textAlign: "center" }} key={0}>
                <span style={{ fontSize: "smaller", fontWeight: "bold", wordWrap: 'break-word' }} onClick={() => props.clickHeader(props.label+props.category, 'vertical')}>{props.label}</span>
            </div>
            {props.data.map((item, index) =>
                (hasData(item) ?
                <TraceButton width={!hasHorizontalHeaders && !hasCategoryGroup ? { width: '50%' } : {width: props.width}} data={item} activeCategory={props.activeCategories} key={index} dataKey={props.dataKey}/> :
                    <div key={index} style={{ width: props.width, backgroundColor: "b2b2b2", borderLeft: "2px solid #b2b2b2" }}> </div>)
            )}
        </div>
    )
}

const TraceButton = (props: { data: ILegendGrid, activeCategory: Array<string>, width: React.CSSProperties, dataKey: OpenSee.IGraphProps }) => {
    const colors = useAppSelector(SelectColor)
    const dispatch = useAppDispatch();

    function getColor(color: OpenSee.Color) {

        if (Object.keys(colors).findIndex(key => key == (color as string)) > -1)
            return colors[color];
        return colors.random;
    }

    function onClick(sender) {
        let traces: Array<number> = [];
        props.data.traces.forEach((val, key) => {
            if (props.activeCategory.indexOf(key) !== -1)
                traces = traces.concat(val);
        })
        props.data.enabled = !props.data.enabled;
        dispatch(EnableTrace({ key: props.dataKey, trace: traces, enabled: props.data.enabled }));
    }

    return (
        <div style={{ ...props.width, backgroundColor: convertHex(getColor(props.data.color), (props.data.enabled ? 100 : 50)), borderLeft: "2px solid #b2b2b2" }} onClick={onClick} >
            {(props.data.enabled ? <i className="fa fa-minus" ></i> : <i className="fa fa-plus" ></i>)}
        </div>)
};

function convertHex(hex: string, opacity: number) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const result = `rgba(${r},${g},${b},${opacity / 100})`;
    return result;
}

function measureScrollbarWidth(): number {
    // Add temporary box to wrapper
    let scrollbox = document.createElement('div');

    // Make box scrollable
    scrollbox.style.overflow = 'scroll';

    // Append box to document
    document.body.appendChild(scrollbox);

    // Measure inner width of box
    let scrollBarWidth = scrollbox.offsetWidth - scrollbox.clientWidth;

    // Remove box
    document.body.removeChild(scrollbox);

    return scrollBarWidth;
}


export default Legend

