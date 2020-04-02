//******************************************************************************************************
//  AccumulatedPoints.tsx - Gbtc
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
//  05/11/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { clone } from "lodash";
import { style } from "typestyle";
import { iD3DataPoint } from '../Graphs/D3LineChartBase';

export interface iD3DataRow {
    Value: Array<number>,
    DeltaValue: Array<number>,
    Time: number,
    DeltaTime: number,
    Indices: Array<number>,
}

export interface iD3TableHeader {
    Asset: string,
    Channel: string,
    Color: string
}


interface pointInformation extends iD3DataPoint {
    DeltaValue: number,
    DeltaTime: number
}
// styles
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

export default class Points extends React.Component<any, any>{
    props: {
        pointsData: Array<iD3DataRow>,
        pointsHeader: Array<iD3TableHeader>,
        pointsTable: Array<iD3DataPoint>,
        callback: Function,
        postedData: any
    }

    constructor(props) {
        super(props);

        this.state = {
            selectedPoint: -1
        };
    }

    componentDidMount() {
        ($("#accumulatedpoints") as any).draggable({ scroll: false, handle: '#accumulatedpointshandle', containment: '#chartpanel' });
    }


    render() {


        let headers = this.props.pointsHeader.map((a, i) => Header(a,i))
        if (!headers)
            headers = []

        var rows = this.props.pointsData.map((a, i) => {
            return Row(a, this.props.postedData.postedSystemFrequency, (obj) => this.setState(obj), i, this.state.selectedPoint)
        })
         
       
        return (
            <div id="accumulatedpoints" className="ui-widget-content" style={outerDiv}>
                <div style={{ border: 'black solid 2px' }}>
                    <div id="accumulatedpointshandle" className={handle}></div>
                    <div style={{ overflowY: 'scroll', maxHeight: 950}}>
                        <table className="table table-bordered table-hover">
                            <thead>
                                <tr><td colSpan={2} key="header-time"></td>{headers}</tr>
                                {SubHeader(headers.length)}
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ margin: '5px', textAlign: 'right' }}>
                        <input className="btn btn-primary" type="button" value="Remove" onClick={() => this.removePoint()} />
                        <input className="btn btn-primary" type="button" value="Pop" onClick={() => this.popAccumulatedPoints()} />
                        <input className="btn btn-primary" type="button" value="Clear" onClick={() => this.clearAccumulatedPoints()} />
                    </div>
                    <button className={closeButton} style={{ top: '2px', right: '2px' }} onClick={() => {
                        this.props.callback({ pointsButtonText: "Show Points" });
                        $('#accumulatedpoints').hide();
                    }}>X</button>
                </div>

            </div>

        );
    }

    removePoint() {
        var data = clone(this.props.pointsTable);
        var selectedPoint = this.state.selectedPoint;

        if (selectedPoint === -1) {

        }
        else {
            data = this.removeByIndex(data, this.props.pointsData[selectedPoint].Indices)
        }
        selectedPoint = -1;

        this.props.callback({
            PointsTable: data
        });
        this.setState({ selectedPoint: selectedPoint});
    }

    popAccumulatedPoints() {
        var data = clone(this.props.pointsTable);
        if (data.length > 0) {
            data = this.removeByIndex(data, this.props.pointsData[this.props.pointsData.length -1].Indices)
        }

        this.props.callback({
            PointsTable: data
        });      
    }

    clearAccumulatedPoints() {
        this.props.callback({
            PointsTable: []
        });
    }

    removeByIndex(array, indices) {
        indices.sort(function (a, b) { return b - a; });

        for (let i = 0; i< indices.length ; i++)
            array.splice(indices[i], 1);

        return array
    }
}

const Row = (row: iD3DataRow, systemFrequency: number, stateSetter: Function, arrayIndex: number, currentSelected: number) => {
    function showTime(thetime) {
        return <span>{ thetime.toFixed(7) } sec<br/>{(thetime * Number(systemFrequency)).toFixed(2)} cycles</span>;
    }

    function showDeltaTime(deltatime) {
        if (isNaN(deltatime))
            return (<span>N/A</span>)
        if (deltatime)
        return <span>{deltatime.toFixed(7)} sec<br/>{(deltatime * Number(systemFrequency)).toFixed(2)} cycles</span>;
    }
    function createValue(index) {
        if (isNaN(row.Value[index]))
            return (<td key={"Value-" + index}><span>N/A</span></td>)
        return (<td key={"Value-" + index}>{row.Value[index].toFixed(2)}</td>)
    }
    function createDeltaValue(index) {
        if (isNaN(row.DeltaValue[index]))
            return (<td key={"DeltaValue-" + index} ><span>N/A</span></td>)
        return (<td key={"DeltaValue-" + index}>{row.DeltaValue[index].toFixed(2)}</td>)
    }
    function createCells() {
        let res = [];
        row.Value.forEach((a, i) => {
            res.push(createValue(i))
            res.push(createDeltaValue(i))
        })
        return res;
    }
    return (
        <tr key={arrayIndex} onClick={(e) => stateSetter({ selectedPoint: arrayIndex })} style={{ backgroundColor: (arrayIndex == currentSelected ? 'yellow' : null) }}>
            <td key="Time">{showTime(row.Time / 1000.0)}</td>
            <td key="DeltaTime">{showDeltaTime(row.DeltaTime / 1000.0)}</td>
            {createCells()}
        </tr>
    );
}

const Header = (header: iD3TableHeader, index: number) => {
    return (
        <td colSpan={2} key={"header-" + index}><span>{header.Asset}<br/>{header.Channel}</span> </td>
        )
}


const SubHeader = (collumns: number) => {
    function createCell(str, i) {
        return (<td key={str + i}>{str}</td>)
    }

    function createCells() {
        let res = [];
        let i;
        res.push(createCell("Time",0))
        res.push(createCell("Delta Time",0))
        for (i = 0; i < collumns; i++) {
            res.push(createCell("Value",i))
            res.push(createCell("Delta Value",i))
        }
       
        return res;
    }


    return (
        <tr key="subheaders">
            {createCells()}
        </tr>
        );

}


