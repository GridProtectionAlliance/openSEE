//******************************************************************************************************
//  FFTTable.tsx - Gbtc
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
import OpenSEEService from './../../TS/Services/OpenSEE';
import { style } from "typestyle"
import { iD3DataSet, iD3DataSeries } from '../Graphs/D3LineChartBase';

const outerDiv: React.CSSProperties = {
    minWidth: '200px',
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'none',
    backgroundColor: 'white',
    width: '520px',
    maxHeight: '1040px'
};

const handle = style({
    width: '100 %',
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


export default class FFTTable extends React.Component<any, any>{
    props: { dataSet: iD3DataSet }
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        ($("#ffttable") as any).draggable({ scroll: false, handle: '#ffttablehandle', containment: 'document' });
    }

    render() {
        var table = null;
        let headers = [];
        let rows = [];
        if (this.props.dataSet.Data != undefined) {


            headers = this.props.dataSet.Data.map((a, i) => <th key={"header-" + a.ChartLabel}> {a.ChartLabel}</th>)

            rows = this.props.dataSet.Data[0].DataPoints.map((a, i) => Row(i, this.props.dataSet.Data));            
        }

        return (
            <div id="ffttable" className="ui-widget-content" style={outerDiv}>
                <div style={{ border: 'black solid 2px' }}>
                    <div id="ffttablehandle" className={handle}></div>
                    <div style={{ overflowY: 'scroll', overflowX: 'scroll', maxHeight: 850 }}>
                        <table className="table table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th key="header-harmonic">Harmonic</th>
                                    {headers}
                                 </tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                   
                    <button className={closeButton} style={{ top: '2px', right: '2px' }} onClick={() => {
                        $('#ffttable').hide();
                    }}>X</button>
                </div>

            </div>
        );
    }
}

const Row = (row: number, data: Array<iD3DataSeries>) => {
    
    function showValue(index) {
        let val = data[index].DataPoints[row][1];
        if (isNaN(val))
            return (<td key={"data-" + index}>N/A</td>)
        return <td key={"data-" + index}>{val.toFixed(2)}</td> ;
    }
    
    function createCells() {
        let res = [];
        data.forEach((a, i) => {
            res.push(showValue(i))
        })
        return res;
    }
    return (
        <tr key={"row-" + row}>
            <td key="harmonic">{data[0].DataPoints[row][0].toFixed(0)}</td>
            {createCells()}
        </tr>
    );
}