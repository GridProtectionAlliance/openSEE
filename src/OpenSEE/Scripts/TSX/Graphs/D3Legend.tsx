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
import * as React from 'react';
import * as _ from 'lodash';
import { LegendClickCallback, iD3DataSeries } from './D3LineChartBase';
import { Colors } from '../jQueryUI Widgets/SettingWindow';



export interface iD3LegendProps {
    type: string,
    data: Array<iD3DataSeries>
    callback: LegendClickCallback,
    height: number,
    colors: Colors
}

export default class D3Legend extends React.Component<any, any>{
    props: iD3LegendProps;

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps: iD3LegendProps) {

    }

    render() {
        if (this.props.data == null || this.props.data.length == 0) return null;

        let rows: Array<JSX.Element> = [];

        this.props.data.forEach((row, key, map) => {
            rows.push(<Row key={key} label={row.ChartLabel} color={this.getColor(this, row.Color)} enabled={row.Enabled} callback={(e) => {
                this.props.callback(e, row, key)
                }} />)
            
        });


        let TableHeight: number = this.props.height - 38;

       
        return (
            <div ref="legend" id={this.props.type + '-legend'} className='legend' style={{ float: 'right', width: '200px', height: this.props.height - 38, marginTop: '6px', borderStyle: 'solid', borderWidth: '2px', overflowY: 'hidden' }}>
                <table ref="table" style={{ maxHeight: TableHeight, overflowY: 'auto', display: 'block', width: '100%' }}>
                    <tbody style={{ width: '100%', display: 'table'}}>
                        {rows}
                    </tbody>
                </table>                
            </div>
        );
    }

   
    toggleAll(active: Array<string>, value: string, type: string) {

        this.props.data.forEach((row, key, map) => {
            var enabled = row.Enabled && row.SecondaryLegendClass != value;

            //If type is Radio we hide all that are not in this one
            if (type == "radio") {
                row.Display = row.LegendClass == value;
                enabled = false;

                if (row.Display && $(this.refs.legend).find('label.active').toArray().some(x => $(x).text() === row.LegendClass)) {
                    enabled = true;
                }
            }
            else {
                if (row.Display && $(this.refs.legend).find('label.active').toArray().some(x => $(x).text() === row.SecondaryLegendClass)) {
                    enabled = true;
                }
            }

            row.Enabled = enabled;
            $('[name="' + key + '"]').prop('checked', row.Enabled);

        });

        this.props.callback();
    }

    getColor(ctrl: D3Legend, color: string) {

        if (ctrl.props.colors[color] !== undefined)
            return ctrl.props.colors[color]
        return ctrl.props.colors.random
    }

}

const Row = (props: { label: string, enabled: boolean, color: string, callback: LegendClickCallback }) => {

        return (
            <tr>
                <td>
                    <input name={props.label} className='legendCheckbox' type="checkbox" style={{ display: 'none' }} defaultChecked={props.enabled} />
                </td>
                <td>
                    <div style={{ border: '1px solid #ccc', padding: '1px', width: '14px' }}>
                        <div style={{ width: ' 4px', height: 0, border: '5px solid', borderColor: (props.enabled ? convertHex(props.color, 100) : convertHex(props.color, 50)), overflow: 'hidden' }} onClick={props.callback}>
                        </div>
                    </div>
                </td>
                <td>
                    <span style={{ color: props.color, fontSize: 'smaller', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{props.label}</span>
                </td>
            </tr>
        );
    }


function convertHex(hex, opacity) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    return result;
}

