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
import { utc } from "moment";
import { style } from "typestyle"
import { iD3DataPoint } from '../Graphs/D3LineChartBase';
import { iD3TableHeader, iD3DataRow } from './AccumulatedPoints';
import moment = require('moment');

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

export interface TooltipWithDeltaProps {
    pointdata: Array<iD3DataRow>,
    pointheader: Array<iD3TableHeader>,
    callback: Function,
    PostedData: any
}

export default class TooltipWithDelta extends React.Component<any, any>{
    props: TooltipWithDeltaProps;
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var ctrl = this;
        ($('#tooltipwithdelta') as any).draggable({ scroll: false, handle: '#tooltipwithdeltahandle', containment: 'document' });
    }

    render() {
        var rows = [];

        let firstDate: number = NaN;
        let secondDate: number = NaN;

        if (this.props.pointdata.length > 1)
            secondDate = (this.props.pointdata[this.props.pointdata.length - 2].Time) + parseFloat(this.props.PostedData.postedEventMilliseconds);

        if (this.props.pointdata.length > 0)
            firstDate = (this.props.pointdata[this.props.pointdata.length - 1].Time) + parseFloat(this.props.PostedData.postedEventMilliseconds);

        if (!isNaN(firstDate)) {
            this.props.pointheader.forEach((header, i) => {
                var row;

                if (!isNaN(secondDate))
                    row = Row(header.Channel, header.Color, this.props.pointdata[this.props.pointdata.length - 1].Value[i], this.props.pointdata[this.props.pointdata.length - 2].Value[i]);
                else
                    row = Row(header.Channel, header.Color, this.props.pointdata[this.props.pointdata.length - 1].Value[i], NaN);
                rows.push(row);
            });
        }

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

const Row = ( label: string, color: string, data1: number, data2: number ) => {
    return (
        <tr key={label}>
            <td className="dot" style={{ background: color, width: '12px' }}>&nbsp;&nbsp;&nbsp;</td>
            <td style={{ textAlign: 'left' }}><b>{label}</b></td>
            <td style={{ textAlign: "right" }}><b>{data1.toFixed(2)}</b></td>
            <td style={{ textAlign: "right" }}><b>{data2.toFixed(2)}</b></td>
            <td style={{ textAlign: "right" }}><b>{(data2 - data1).toFixed(2)}</b></td>
        </tr>
    );
}

