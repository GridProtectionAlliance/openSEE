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
import { cloneDeep, uniq } from "lodash";
import { useSelector, useDispatch } from 'react-redux';
import { selectData, selectEnabled, EnableTrace } from "../store/dataSlice";
import { selectColor } from "../store/settingSlice";

const hrow = 26;

interface iProps {
    height: number,
    type: OpenSee.graphType,
    eventId: number,
}

interface ICategory {
    enabled: boolean,
    label: string,
}

interface ILegendGrid {
    enabled: boolean,
    hLabel: string,
    vLabel: string,
    color: OpenSee.Color,
    traces: Map<string, Array<number>>,
    category?: string,
}

const horizontalSort = ['W', 'Pk', 'RMS', 'Ph'];
const verticalGroupSort = ['L-N', 'L-L', 'V', 'I'];
const verticalSort = [ 'AN', 'BN','CN', 'NG', 'RES', 'AB', 'BC', 'CA'];

const Legend = (props: iProps) => {
    const dataKey: OpenSee.IGraphProps = { DataType: props.type, EventId: props.eventId }
    const data = useSelector(selectData(dataKey));
    const enabled = useSelector(selectEnabled(dataKey))
    const dispatch = useDispatch();

    const [categories, setCategories] = React.useState<Array<ICategory>>([]);
    const [showCategories, setShowCategories] = React.useState<boolean>(false);
    const [verticalHeader, setVerticalHeader] = React.useState<Array<[string, string]>>([]);
    const [horizontalHeader, setHorizontalHeader] = React.useState<Array<string>>([]);
    const [grid, setGrid] = React.useState<Map<string, ILegendGrid[]>>(new Map<string, ILegendGrid[]>());


    React.useEffect(() => {
        update();
    }, [enabled])

    React.useEffect(() => {
        dataUpdate();
    }, [data])

    function dataUpdate() {
        let categories: Array<ICategory> = [];
        let grid: Array<ILegendGrid> = [];

        data.forEach((item: OpenSee.iD3DataSeries, dataIndex) => {
            let index = categories.findIndex(category => category.label === item.LegendGroup);
            if (index === -1) {
                categories.push({ label: item.LegendGroup, enabled: false });
                index = categories.findIndex(category => category.label === item.LegendGroup);
            }
            if (enabled[dataIndex])
                categories[index].enabled = true;
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
            categories[0].enabled = true
        else if (categories.length > 1) {
            if (!categories.some(item => item.enabled))
                categories[0].enabled = true
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
                updateGrid.set(index,[{ enabled: false, hLabel: item.LegendHorizontal, vLabel: item.LegendVertical, color: item.Color, traces: new Map<string, Array<number>>(), category: item.LegendVGroup }])
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
            tmp[index].enabled = !tmp[index].enabled;

            // Also Disable or enable associated Traces and corresponding Grid entries....
            let traces: Array<number> = [];

            if (tmp[index].enabled)
                grid.forEach(row => row.forEach(data => {
                   if (data.traces.has(item.label) && data.enabled)
                        traces = traces.concat(data.traces.get(item.label));
                }));
            else
                grid.forEach(row => row.forEach(data => {
                    if (data.traces.has(item.label))
                        traces = traces.concat(data.traces.get(item.label));
                }));

            dispatch(EnableTrace({ trace: traces, enabled: tmp[index].enabled, key: dataKey }));

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

    function groupBy(list: Array < ILegendGrid >, fnct: (val: ILegendGrid) => string) {
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
                            updates.push(...row.traces.get(cat.label));
                        });
                    }
                });
            }
            else {

                grid.get(group).forEach(row => {
                    row.enabled = true;
                    categories.forEach((cat) => {
                        if (cat.enabled)
                            updates.push(...row.traces.get(cat.label));
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
                                updates.push(...item.traces.get(cat.label));
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
                                if (cat.enabled)
                                    updates.push(...item.traces.get(cat.label));
                            });
                        }
                    })
                });
            }
        }

    }

    return ( 
        <div style={{ float: "right", width: "200px", height: props.height - 38, marginTop: "6px",  overflowY: "hidden" }} >
            <div className="legend" style={{  width: "100%",  borderStyle: "solid", borderWidth: "2px", overflowY: "hidden" }}>
                <div className="btn-group" style={{ width: '100%' }}>

                    {(categories.length > 1 ?
                        <button onClick={() => setShowCategories(!showCategories)} type="button" style={{ width: '25px', borderRadius: 0 }} className="btn btn-sm btn-secondary dropdown-toggle dropdown-toggle-split" aria-haspopup="true" aria-expanded="false">
                            <span className="sr-only">Toggle Dropdown</span>
                        </button> : null)}
                    <button style={{ width: '100%', borderRadius: 0, textOverflow: 'ellipsis', maxWidth: (categories.length > 1 ? '175px' : '200px'), overflow: 'hidden', whiteSpace: 'nowrap' }} className="btn btn-secondary btn-sm active" type="button">
                        {categories.filter(item => item.enabled).map(item => item.label).join(", ")}
                    </button>

                    <div className={"dropdown-menu " + (showCategories ? "show" : "")} style={{ marginTop: 0, maxWidth: '196px' }} onMouseLeave={() => { setShowCategories(false) }}>
                        {(categories.filter(item => item.label.trim() !== "").length === 0 ? props.type
                            : categories.map((item, index) => <Category key={index} label={item.label} enabled={item.enabled} onclick={() => changeCategory(index, item)} />)
                        )}
                    </div>
                </div>

                <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderBottom: "2px solid #b2b2b2" }}>
                    <div style={{ width: ((verticalHeader.length > 1 ? 2 : 1) * hwidth), backgroundColor: "#b2b2b2" }}></div>
                    {horizontalHeader.map((item, index) => <Header key={index} label={item} index={index} width={hwidth} onClick={(grp: string, type: ("vertical" | "horizontal")) => clickGroup(grp, type)}/>)}
                </div>
                {(verticalHeader.length > 1 ?
                    <div style={{ width: ((200 - 4) / (horizontalHeader.length + 2)), backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                        {uniq(verticalHeader, v => v[1]).sort(sortGroup).map((value, index) => <VCategory key={index} label={value[1]} height={hrow * verticalHeader.filter(item => item[1] == value[1]).length} width={hwidth} />)}
                    </div> : null)}
                <div style={{ width: (verticalHeader.length > 1 ? "calc(100% - " + hwidth + "px)" : "100%"), backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                    {verticalHeader.map((value, index) => <Row dataKey={dataKey} category={value[1]} activeCategories={categories.filter(item => item.enabled).map(item => item.label)} key={index} label={value[0]} data={grid.get(value[0] + value[1]).sort((item1, item2) => sortHorizontal(item1.hLabel, item2.hLabel))} width={hwidth} clickHeader={(grp: string, type: ("vertical" | "horizontal")) => clickGroup(grp, type)} />)}
                </div>
        </div>
        </div>
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

const Row = (props: { category: string, label: string, data: Array<ILegendGrid>, width: number, activeCategories: Array<string>, clickHeader: (group: string, type: string) => void, dataKey: OpenSee.IGraphProps }) => {

    function hasData(data: ILegendGrid) {
        let n = 0;
        data.traces.forEach((val, key) => {
            if (props.activeCategories.indexOf(key) !== -1)
                n = n + val.length;
        })

        return n > 0;
    }

    return (
        <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderTop: "2px solid #b2b2b2", height: hrow }}>
            <div style={{ width: props.width, overflow: "hidden", textAlign: "center" }} key={0}>
                <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap" }} onClick={() => props.clickHeader(props.label+props.category, 'vertical')}>{props.label}</span>
            </div>
            {props.data.map((item, index) =>
                (hasData(item) ?
                    <TraceButton width={props.width} data={item} activeCategory={props.activeCategories} key={index} dataKey={props.dataKey}/> :
                    <div key={index} style={{ width: props.width, backgroundColor: "b2b2b2", borderLeft: "2px solid #b2b2b2" }}> </div>)
            )}
        </div>
    )
}

const TraceButton = (props: { data: ILegendGrid, activeCategory: Array<string>, width: number, dataKey: OpenSee.IGraphProps }) => {
    const colors = useSelector(selectColor)
    const dispatch = useDispatch();

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
        <div style={{ width: props.width, backgroundColor: convertHex(getColor(props.data.color), (props.data.enabled ? 100 : 50)), borderLeft: "2px solid #b2b2b2" }} onClick={onClick} >
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



export default Legend

