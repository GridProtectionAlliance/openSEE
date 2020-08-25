//******************************************************************************************************
//  D3Legend.tsx - Gbtc
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
import { LegendClickCallback, iD3DataSeries } from "./D3LineChartBase";
import { Colors } from "../jQueryUI Widgets/SettingWindow";
import { cloneDeep, uniq } from "lodash";

const hrow = 26;

export interface ID3LegendProps {
    type: string,
    data: Array<iD3DataSeries>,
    callback: LegendClickCallback,
    height: number,
    colors: Colors,
}

interface ICategory {
    enabled: boolean,
    label: string,
}

interface ILegendGrid {
    enabled: boolean,
    hLabel: string,
    vLabel: string,
    color: string,
    traces: Map<string, Array<number>>,
    category?: string,
}


export default class D3Legend extends React.Component<ID3LegendProps, any>{
    props: ID3LegendProps;
    state: {
        categories: Array<ICategory>,
        grid: Map<string,ILegendGrid[]>,
        showCategories: boolean,
    };
    hHeader: Array<string>; 
    vHeader: Array<[string,string]>;
    nData: number;

    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            grid: new Map<string, ILegendGrid[]>() ,
            showCategories: false,
        };
        this.hHeader = [];
        this.vHeader = [];
        this.nData = 0;
    }

    componentDidUpdate(prevProps: ID3LegendProps, prevState: any) {

        if (this.props.data == null)
            return;

        if (this.props.data.length == this.nData)
            return;

        const categories: Array<ICategory> = [];
        const grid: Array<ILegendGrid> = [];

        this.props.data.forEach((item, dataIndex) => {
            let index = categories.findIndex(category => category.label === item.LegendGroup);
            if (index === -1) {
                categories.push({ label: item.LegendGroup, enabled: false });
                index = categories.findIndex(category => category.label === item.LegendGroup);
            }
            if (item.Enabled)
                categories[index].enabled = true;

            index = grid.findIndex(g => g.hLabel === item.LegendHorizontal && g.vLabel === item.LegendVertical);
            if (index === -1) {
                grid.push({ enabled: false, hLabel: item.LegendHorizontal, vLabel: item.LegendVertical, color: item.Color, traces: new Map<string, Array<number>>(), category: item.LegendVGroup })
                index = grid.findIndex(g => g.hLabel === item.LegendHorizontal && g.vLabel === item.LegendVertical);
            }
            if (item.Enabled)
                grid[index].enabled = true;

            if (grid[index].traces.has(item.LegendGroup))
                grid[index].traces.get(item.LegendGroup).push(dataIndex)
            else
                grid[index].traces.set(item.LegendGroup, [dataIndex])
        });

        if (categories.length == 1)
            categories[0].enabled = true
        else {
            if (!categories.some(item => item.enabled))
                categories[0].enabled = true
        }


        this.nData = this.props.data.length;

        this.hHeader = uniq(grid.map(item => item.hLabel));
        this.vHeader = this.uniq(grid.map(item => [item.vLabel, item.category]), (item) => { return item[0] });

        this.setState({ categories: categories, grid: this.groupBy(grid, item => item.vLabel) });

    }

    uniq(array, fx) {
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

    render() {
        if (this.props.data == null || this.props.data.length === 0) return null;

        const tableHeight = this.props.height - 38;
        const vCategories: Array<string> = uniq(this.vHeader.map(value => value[1]));
        const showVCat = (vCategories.length > 1 ? true : false);

        const hWidth = (200 - 4) / (this.hHeader.length + (showVCat? 2: 1));

        const headerRow: Array<JSX.Element> = this.hHeader.map((item, index) => (
            <div key={index} style={{ width: hWidth, borderLeft: "2px solid #b2b2b2" }}>
                <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap", margin: "(0,0,0,0)" }} onClick={() => this.clickGroup(item, 'horizontal')} > {item}</span>
            </div>))


        const tblData: Array<JSX.Element> = this.vHeader.map((value, index) => <Row key={index} label={value[0]} data={this.state.grid.get(value[0])} ctrl={this} width={hWidth} clickHeader={this.clickGroup.bind(this)} />)
        const catData: Array<JSX.Element> = vCategories.map((value, index) => <VCategory key={index} label={value} height={hrow * this.vHeader.filter(item => item[1] == value).length} width={hWidth} />)
       
        return (

            <div ref="legend" id={this.props.type + "-legend"} className="legend" style={{ float: "right", width: "200px", height: this.props.height - 38, marginTop: "6px", borderStyle: "solid", borderWidth: "2px", overflowY: "hidden" }}>
                <div className="btn-group" style={{ width: '100%' }}>

                    {(this.state.categories.length > 1 ?
                        <button onClick={() => this.setState((state, prop) => { return { showCategories: !state.showCategories } })} type="button" style={{ borderRadius: 0 }} className="btn btn-sm btn-secondary dropdown-toggle dropdown-toggle-split" aria-haspopup="true" aria-expanded="false">
                            <span className="sr-only">Toggle Dropdown</span>
                        </button> : null)}
                    <button style={{ width: '100%', borderRadius: 0 }} className="btn btn-secondary btn-sm active" type="button">
                        {this.state.categories.filter(item => item.enabled).map(item => item.label).join(", ")}
                    </button>

                    <div className={"dropdown-menu " + (this.state.showCategories ? "show" : "")} style={{ marginTop: 0 }} onMouseLeave={() => { if (this.state.showCategories) this.setState({ showCategories: false }) }}>
                        {(this.state.categories.filter(item => item.label.trim() !== "").length === 0 ? this.props.type
                            : this.state.categories.map((item, index) => <Category key={index} label={item.label} enabled={item.enabled} onclick={() => this.changeCategory(index, item)} />)
                        )}
                    </div>
                </div>

                <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderBottom: "2px solid #b2b2b2" }}>
                    <div style={{ width: (showVCat ? 2 * hWidth : hWidth), backgroundColor: "#b2b2b2" }}></div>
                    {headerRow}
                </div>
                {(showVCat ?
                    <div style={{ width: hWidth, backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                        {catData}
                    </div> : null)}
                <div style={{ width: (showVCat ? "calc(100% - " + hWidth + "px)": "100%"), backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "inline-block", verticalAlign: "top" }}>
                    {tblData}
                </div>
            </div>
        );
    }

    groupBy(list: Array<ILegendGrid>, fnct: (val: ILegendGrid) => string) {
        let result: Map<string, ILegendGrid[]> = new Map<string, ILegendGrid[]>();

        list.forEach(item => {
            if (result.has(fnct(item)))
                result.get(fnct(item)).push(item);
            else
                result.set(fnct(item), [item]);
        })
        return result;
    }

    getColor(ctrl: D3Legend, color: string) {

        if (ctrl.props.colors[color] !== undefined)
            return ctrl.props.colors[color];
        return ctrl.props.colors.random;
    }

    changeCategory(index: number, item: ICategory) {

        this.setState((state, props) => {
            const tmp = cloneDeep(state.categories);
            tmp[index].enabled = !tmp[index].enabled;

            // Also Disable or enable associated Traces and corresponding Grid entries....
            let traces: Array<number> = [];

            if (tmp[index].enabled)
                this.state.grid.forEach(row => row.forEach(data => {
                    if (data.traces.has(item.label) && data.enabled)
                        traces = traces.concat(data.traces.get(item.label));
                }));
            else
                this.state.grid.forEach(row => row.forEach(data => {
                    if (data.traces.has(item.label))
                        traces = traces.concat(data.traces.get(item.label));
                }));

            this.props.callback(null, traces, tmp[index].enabled)
            return { categories: tmp };
        });
    }

    clickGroup(group: string, type: 'vertical' | 'horizontal') {
        let isAny = false;
        let updates: number[] = [];

        if (type == 'vertical') {
            isAny = this.state.grid.get(group).some(item => item.enabled);


            if (isAny) {
                this.state.grid.get(group).forEach(row => {
                    if (row.enabled) {
                        row.enabled = false;
                        this.state.categories.forEach((cat) => {
                            updates.push(...row.traces.get(cat.label));
                        });
                    }
                });
            }
            else {

                this.state.grid.get(group).forEach(row => {
                    row.enabled = true;
                    this.state.categories.forEach((cat) => {
                        if (cat.enabled)
                            updates.push(...row.traces.get(cat.label));
                    });

                });
            }
        }
        else {
            isAny = false;
            this.state.grid.forEach(row => { if (row.some(item => (item.enabled && item.hLabel == group))) isAny = true; });

            if (isAny) {
                this.state.grid.forEach(row => {
                    row.forEach(item => {
                        if (item.enabled && item.hLabel == group) {
                            item.enabled = false;
                            this.state.categories.forEach((cat) => {
                                updates.push(...item.traces.get(cat.label));
                            });
                        }
                    })
                });
            }
            else {
                this.state.grid.forEach(row => {
                    row.forEach(item => {
                        if (item.hLabel == group) {
                            item.enabled = true;
                            this.state.categories.forEach((cat) => {
                                if (cat.enabled)
                                    updates.push(...item.traces.get(cat.label));
                            });
                        }
                    })
                });
            }
        }

        this.props.callback(null, updates, !isAny);
    }
}

const Category = (props: { key: number, label: string, enabled: boolean, onclick: () => void}) => {
    return (
        <a className={"dropdown-item " + (props.enabled ? "active" : "")} onClick={() => props.onclick()}>{props.label}</a>
    );
};

const Row = (props: { label: string, data: Array<ILegendGrid>, width: number, ctrl: D3Legend, clickHeader: Function}) => {
    let activeCategories = props.ctrl.state.categories.filter(item => item.enabled).map(item => item.label);

    function hasData(data: ILegendGrid) {
        let n = 0;
        data.traces.forEach((val, key) => {
            if (activeCategories.indexOf(key) !== -1)
                n = n + val.length;
        })

        return n > 0;
    }

    return (
        <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center", display: "flex", borderTop: "2px solid #b2b2b2", height: hrow }}>
            <div style={{ width: props.width, overflow: "hidden", textAlign: "center" }} key={0}>
                <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap" }} onClick={() => props.clickHeader(props.label,'vertical')}>{props.label}</span>
            </div>
            {props.data.map((item, index) =>
                (hasData(item) ?
                    <TraceButton width={props.width} data={item} ctrl={props.ctrl} activeCategory={activeCategories} key={index} /> :
                    <div key={index} style={{ width: props.width, backgroundColor: "b2b2b2", borderLeft: "2px solid #b2b2b2" }}> </div>)
            )}
        </div>
    )
}

const VCategory = (props: { key: number, label: string, height: number, width: number }) => {
    return (
        <div style={{ width: props.width, borderTop: "2px solid #b2b2b2", height: props.height }}>
            <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap", margin: "(0,0,0,0)", writingMode: "vertical-rl", height: "100%", transform: 'rotate(180deg)'}}>{props.label}</span>
        </div>)
}

const TraceButton = (props: { data: ILegendGrid, activeCategory: Array<string>, width: number, ctrl: D3Legend }) => {

    function onClick(sender) {
        let traces: Array<number> = [];
        props.data.traces.forEach((val, key) => {
            if (props.activeCategory.indexOf(key) !== -1)
                traces = traces.concat(val);
        })
        props.data.enabled = !props.data.enabled;
        props.ctrl.props.callback(sender, traces, props.data.enabled)
    }

    return (
        <div style={{ width: props.width, backgroundColor: convertHex(props.ctrl.getColor(props.ctrl, props.data.color),(props.data.enabled? 100 : 50)), borderLeft: "2px solid #b2b2b2" }} onClick={onClick} >
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

