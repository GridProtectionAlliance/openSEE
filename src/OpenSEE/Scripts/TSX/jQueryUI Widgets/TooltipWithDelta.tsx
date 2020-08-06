//******************************************************************************************************
//  Tooltip.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  05/14/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { style } from "typestyle"
import { iActiveUnits } from '../Graphs/D3LineChartBase';
import { iD3PointOfInterest } from './AccumulatedPoints';
import { iToolTipPoint, TooltipProps } from './Tooltip';
import moment = require('moment');
import { Colors } from './SettingWindow';

// styles
const outerDiv: React.CSSProperties = {
    minWidth : '400px',
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflowY: 'auto',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    top: '0',
    left: 0,
    display: 'none',
    backgroundColor: 'white'
};

const handle = style({
    width: '100%',
    height: '20px',
    backgroundColor: '#808080',
    cursor: 'move',
    padding: '0em'
});

const closeButton = style({
    background: 'firebrick',
    color: 'white',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20px',
    height: '20px',
    textAlign: 'center',
    verticalAlign: 'middle',
    padding: 0,
    border: 0,
    $nest: {
        "&:hover": {
            background: 'orangered'
        }
    }
});


export default class TooltipWithDelta extends React.Component<any, any>{
    props: TooltipProps;
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var ctrl = this;
        ($('#tooltipwithdelta') as any).draggable({ scroll: false, handle: '#tooltipwithdeltahandle', containment: '#chartpanel' });
    }

    render() {

        let firstDate = this.props.hover;
        let secondDate = NaN;

        let dataRow: Array<iToolTipPoint> = [];
        this.props.data.forEach((item, key) => dataRow.push(...item.map(pt => { return { ...pt, plotLabel: key }; })))

        if (dataRow.length > 0) {
            secondDate = dataRow[0].Current[0];
        
            if (dataRow[0].Selected.length > 0)
                firstDate = dataRow[0].Selected[dataRow[0].Selected.length - 1][0];
        }

        //var subsecond = ("0000000" + (this.props.hover * 10000 % 10000000)).slice(-7);
        //var format = ($.plot as any).formatDate(($.plot as any).dateGenerator(this.props.hover, { timezone: "utc" }), "%Y-%m-%d %H:%M:%S") + "." + subsecond;
        const rows = dataRow.map((data, i) => Row(data, i, this.props.colors, this.props.activeUnits));


        return (
            <div id="tooltipwithdelta" className="ui-widget-content" style={outerDiv}>
                <div id="tooltipwithdeltahandle" className={handle}></div>
                <div>
                    <div style={{textAlign: 'center'}}>
                        <table className="table" style={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight * 0.9}}>
                            <thead>
                                <tr><td style={{ width: 34 }}></td><td></td><td><b>{(!isNaN(firstDate) ? moment(firstDate).utc().format("HH:mm:ss.SSSSSS") : null)}</b></td><td><b>{(!isNaN(secondDate) ? moment(secondDate).utc().format("HH:mm:ss.SSSSSS") : null)}</b></td><td><b>{(!isNaN(firstDate) && !isNaN(secondDate) ? (secondDate - firstDate) / 1000 + ' (s)' : '')}</b></td></tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
                <button className={closeButton} onClick={() => {
                    $('#tooltipwithdelta').hide();
                    $('.legendCheckbox').hide();
                    this.props.callback({ TooltipWithDeltaTable: new Map<string, Map<string, { data: number, color: string }>>()});
                }}>X</button>
            </div>
        );
    }
}

const Row = (row: iToolTipPoint, key: number, colors: Colors, getUnits: (lbl: string) => iActiveUnits) => {
    const unit = getUnits(row.plotLabel)[row.Unit].current;
    const val1 = row.Current[1] * unit.Factor;

    const val2 = (row.Selected.length > 0 ? row.Selected[row.Selected.length - 1][1] * unit.Factor : NaN);

    return (
        <tr key={key}>
            <td className="dot" style={{ background: colors[row.Color], width: '12px' }}>&nbsp;&nbsp;&nbsp;</td>
            <td style={{ textAlign: 'left' }}><b>{row.ChannelName}</b></td>
            <td style={{ textAlign: "right" }}><b>{val2.toFixed(2)} {unit.Short}</b></td>
            <td style={{ textAlign: "right" }}><b>{val1.toFixed(2)} {unit.Short}</b></td>
            <td style={{ textAlign: "right" }}><b>{(val2 - val1).toFixed(2)} {unit.Short}</b></td>
        </tr>
    );
}

