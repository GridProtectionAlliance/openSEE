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
//
//******************************************************************************************************
import * as React from "react";
import { LegendClickCallback, iD3DataSeries } from "./D3LineChartBase";
import { Colors } from "../jQueryUI Widgets/SettingWindow";
import { cloneDeep, isEqual } from "lodash";



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
    traces: Map<string,Array<number>>
}

export default class D3Legend extends React.Component<ID3LegendProps, any>{
    props: ID3LegendProps;
    state: {
        categories: Array<ICategory>,
        grid: Array<ILegendGrid>,
    };
    hHeader: Map<string, ILegendGrid[]>; 
    vHeader: Map<string, ILegendGrid[]>;
    nData: number;

    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            grid: [],
        };
        this.hHeader = new Map<string, ILegendGrid[]>();
        this.vHeader = new Map<string, ILegendGrid[]>();
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
                grid.push({ enabled: false, hLabel: item.LegendHorizontal, vLabel: item.LegendVertical, color: item.Color, traces: new Map<string, Array<number>>() })
                index = grid.findIndex(g => g.hLabel === item.LegendHorizontal && g.vLabel === item.LegendVertical);
            }
            if (item.Enabled)
                grid[index].enabled = true;

            if (grid[index].traces.has(item.LegendGroup))
                grid[index].traces.get(item.LegendGroup).push(dataIndex)
            else
                grid[index].traces.set(item.LegendGroup, [dataIndex])
        });
            

        this.nData = this.props.data.length;

        this.hHeader = this.groupBy(grid, item => item.hLabel);
        this.vHeader = this.groupBy(grid, item => item.vLabel);

        this.setState({ categories: categories, grid: grid });

        


    }

    render() {
        if (this.props.data == null || this.props.data.length === 0) return null;

        const tableHeight = this.props.height - 38;
        const hWidth = (200 - 4) / (this.hHeader.size + 1);

        const headerRow: Array<JSX.Element> = []
        const tblData: Array<JSX.Element> = []

        this.hHeader.forEach((value, key) =>
            headerRow.push(
                <td key={headerRow.length} style={{ width: hWidth }}>
                    <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center" }}>
                        <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap" }}>{key}</span>
                    </div>
                </td>));

        this.vHeader.forEach((value, key) => tblData.push(<NewRow key={tblData.length} label={key} data={value} ctrl={this} width={hWidth} />));

        return (

            <div ref="legend" id={this.props.type + "-legend"} className="legend" style={{ float: "right", width: "200px", height: this.props.height - 38, marginTop: "6px", borderStyle: "solid", borderWidth: "2px", overflowY: "hidden" }}>
                <div className="btn-group btn-group-sm" role="group" aria-label="...">
                    {this.state.categories.map((item, index) => <Category key={index} label={item.label} enabled={item.enabled} onclick={() => {
                        this.setState((state, props) => {
                            const tmp = cloneDeep(state.categories);
                            tmp[index].enabled = !tmp[index].enabled;
                            return { categories: tmp };
                        });
                }} />)}
                </div>

                <table style={{ maxHeight: tableHeight, overflowY: "auto", display: "block", width: "100%" }}>
                    <tbody style={{ width: "100%", display: "table" }}>
                        <tr>
                            <td style={{ width: hWidth }} id="header-vertical"></td>
                            {headerRow}
                        </tr>
                        {tblData}
                    </tbody>
                </table>

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

}

const Category = (props: { key: number, label: string, enabled: boolean, onclick: () => void}) => {
    return (
        <button type="button" className={"btn btn-secondary " + (props.enabled ? "active" : "")} onClick={() => props.onclick()}>{props.label}</button>
    );
};

const NewRow = (props: { label: string, data: Array<ILegendGrid>, width: number, ctrl: D3Legend }) => {
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
        <tr>
            <td style={{ width: props.width }} key={0}>
                <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center" }}>
                    <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap" }}>{props.label}</span>
                </div>
            </td>
            {props.data.map((item,index) =>
                (hasData(item) ?
                    <TraceButton width={props.width} data={item} ctrl={props.ctrl} activeCategory={activeCategories} key={index} /> :
                    <td key={index} style={{ width: props.width, backgroundColor: "rgb(204,204,204)" }}> </td>)
            )}
        </tr>
        )
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
        <td style={{ width: props.width }}>
                <div style={{ backgroundColor: props.ctrl.getColor(props.ctrl, props.data.color), border: "1px solid #ccc", padding: "1px", margin: "1px", textAlign: "center" }} onClick={onClick} >
                {(props.data.enabled ? <i className="fa fa-minus" ></i> : <i className="fa fa-plus" ></i>)}
            </div>
        </td>)
};

function convertHex(hex: string, opacity: number) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const result = `rgba(${r},${g},${b},${opacity / 100})`;
    return result;
}

