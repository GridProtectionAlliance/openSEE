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

export default class D3Legend extends React.Component<any, any>{
    props: ID3LegendProps;
    state: {
        categories: Array<ICategory>,
        horizontal: Array<string>,
        vertical: Array<string>,

    };


    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            horizontal: [],
            vertical: [],
        };
    }

    componentDidUpdate(prevProps: ID3LegendProps, prevState: any) {

        const dataPrev = [];
        const dataNext = [];

        if (this.props.data == null)
            return;

        this.props.data.forEach(item => {
            const itemClone = cloneDeep(item) as any;
            delete itemClone.Color;
            delete itemClone.Enabled;
            delete itemClone.DataPoints;
            delete itemClone.DataMarker;
            delete itemClone.path;
            dataNext.push(itemClone);
        });

        if (prevProps.data != null)
            prevProps.data.forEach(item => {
                const itemClone = cloneDeep(item) as any;
                delete itemClone.Color;
                delete itemClone.Enabled;
                delete itemClone.DataPoints;
                delete itemClone.DataMarker;
                delete itemClone.path;
                dataPrev.push(itemClone);
            });

        if (!(isEqual(dataPrev, dataNext))) {
            const categories: Array<ICategory> = [];
            const horizontals: Array<string> = [];
            const verticals: Array<string> = [];

            this.props.data.forEach(item => {
                let index = categories.findIndex(category => category.label === item.LegendGroup);
                if (index === -1) {
                    categories.push({ label: item.LegendGroup, enabled: false });
                    index = categories.findIndex(category => category.label === item.LegendGroup);
                }
                if (item.Enabled)
                    categories[index].enabled = true;

                index = horizontals.findIndex(category => category === item.LegendHorizontal);
                if (index === -1)
                    horizontals.push(item.LegendHorizontal)

                index = verticals.findIndex(category => category === item.LegendVertical);
                if (index === -1)
                    verticals.push(item.LegendVertical)
            });
            

            this.setState({ categories: categories, horizontal: horizontals, vertical: verticals });
        }

    }

    render() {
        if (this.props.data == null || this.props.data.length === 0) return null;

        const rows: Array<JSX.Element> = [];

        this.props.data.forEach((row, key, map) => {
            rows.push(<Row key={key} label={row.ChartLabel} color={this.getColor(this, row.Color)} enabled={row.Enabled} callback={(e) => {
                this.props.callback(e, row, key);
            }} />);

        });


        const tableHeight = this.props.height - 38;
        const hWidth = (200 - 4) / (this.state.horizontal.length + 1);

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
                            <td style={{ width: hWidth }} ></td>
                            {this.state.horizontal.map(item => <td style={{ width: hWidth }}>
                                <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign:"center" }}>
                                    <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap" }}>{item}</span>
                                </div>
                            </td>)}
                        </tr>
                        {this.state.vertical.map(item =>
                            <tr>
                                <td style={{ width: hWidth }}>
                                    <div style={{ width: "100%", backgroundColor: "rgb(204,204,204)", overflow: "hidden", textAlign: "center" }}>
                                        <span style={{ fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap" }}>{item}</span>
                                    </div>
                                </td>
                                {this.state.horizontal.map(hitem => 
                                    <td style={{ width: hWidth }}> </td>
                                    )}
                            </tr>)}

                    </tbody>
                </table>

                <table ref="table" style={{ maxHeight: tableHeight, overflowY: "auto", display: "block", width: "100%" }}>
                    <tbody style={{ width: "100%", display: "table"}}>
                    {rows}
                    </tbody>
                </table>
            </div>
        );
    }

   
    toggleAll(active: Array<string>, value: string, type: string) {

        this.props.data.forEach((row, key, map) => {
            var enabled = row.Enabled && row.SecondaryLegendClass !== value;

            //If type is Radio we hide all that are not in this one
            if (type === "radio") {
                row.Display = row.LegendClass === value;
                enabled = false;

                if (row.Display && $(this.refs.legend).find("label.active").toArray().some(x => $(x).text() === row.LegendClass)) {
                    enabled = true;
                }
            }
            else {
                if (row.Display && $(this.refs.legend).find("label.active").toArray().some(x => $(x).text() === row.SecondaryLegendClass)) {
                    enabled = true;
                }
            }

            row.Enabled = enabled;
            $(`[name='${key}']`).prop("checked", row.Enabled);

        });

        this.props.callback();
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

const Row = (props: { label: string, enabled: boolean, color: string, callback: LegendClickCallback }) => {

        return (
            <tr>
                <td>
                    <input name={props.label} className="legendCheckbox" type="checkbox" style={{ display: "none" }} defaultChecked={props.enabled} />
                </td>
                <td>
                    <div style={{ border: "1px solid #ccc", padding: "1px", width: "14px" }}>
                        <div style={{ width: " 4px", height: 0, border: "5px solid", borderColor: (props.enabled ? convertHex(props.color, 100) : convertHex(props.color, 50)), overflow: "hidden" }} onClick={props.callback}>
                        </div>
                    </div>
                </td>
                <td>
                    <span style={{ color: props.color, fontSize: "smaller", fontWeight: "bold", whiteSpace: "nowrap" }}>{
                        props.label}</span>
                </td>
            </tr>
        );
    };


function convertHex(hex: string, opacity: number) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const result = `rgba(${r},${g},${b},${opacity / 100})`;
    return result;
}

