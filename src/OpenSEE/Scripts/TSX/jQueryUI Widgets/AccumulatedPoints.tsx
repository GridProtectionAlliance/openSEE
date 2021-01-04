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
import { outerDiv, handle, closeButton } from './Common';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedPoints, selectStartTime, RemoveSelectPoints, ClearSelectPoints } from '../store/dataSlice';

interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
}

const PointWidget = (props: Iprops) => {
    const points = useSelector(selectSelectedPoints);
    const startTime = useSelector(selectStartTime);
    const dispatch = useDispatch();

    const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);

    React.useEffect(() => {
        ($("#accumulatedpoints") as any).draggable({ scroll: false, handle: '#accumulatedpointshandle', containment: '#chartpanel' });
    }, [props])

    let data: Array<JSX.Element> = (points.length > 0 ? points[0].Value.map((p, i) => <tr onClick={() => setSelectedIndex(i)} style={{ backgroundColor: (selectedIndex == i ? 'yellow' : null) }}>
        <td key={"timeCycles-" + i}><span>{(p[0]- startTime).toFixed(7)} sec<br />{((p[0] - startTime) * 60.0).toFixed(2)} cycles</span> </td>
        <td key={"timeS-" + i} ><span>{i == 0 ? 'N/A' : <> {(points[0].Value[i - 1][0] - p[0]).toFixed(4)} sec<br /> {((points[0].Value[i - 1][0] - p[0]) * 60.0).toFixed(2)} cycles) </>}</span> </td>
        {points.map(pt => <> <td><span>{(pt.Value[i][1] * pt.Unit.factor).toFixed(2)} ({p.Unit.short})</span> </td> <td><span>{i == 0 ? 'N/A' : ((pt.Value[i - 1][1] - pt.Value[i][1]) * pt.Unit.factor).toFixed(4)} ({p.Unit.short})</span> </td> </>)}        
    </tr> ): [])

    return (
        <div id="accumulatedpoints" className="ui-widget-content" style={outerDiv}>
            <div style={{ border: 'black solid 2px' }}>
                <div id="accumulatedpointshandle" className={handle}></div>
                <div style={{ overflowY: 'scroll', maxHeight: 950 }}>
                    {props.isOpen ?
                        <table className="table table-bordered table-hover">
                            <thead>
                                <tr key="row-1">
                                    {props.isOpen ?
                                        <>
                                            <td colSpan={2} key={"header-Time"}> </td>
                                            {points.map(p => <td colSpan={2} key={"header-" + p.Name + "-" + p.Group}><span>{p.Group}<br />{p.Name}</span> </td>)}
                                        </>: null}
                                </tr>
                                <tr key="row-2">
                                    {props.isOpen ? points.map((p, i) => <> <td key={"headerValue-" + i}><span>Value</span> </td> <td key={"headerDelta-" + i} ><span>Delta</span> </td> </>) : null}
                                </tr>
                            </thead>
                            <tbody>
                                {props.isOpen ? data : null}
                            </tbody>
                        </table> : null}
                </div>
                <div style={{ margin: '5px', textAlign: 'right' }}>
                    <input className="btn btn-primary" type="button" value="Remove" onClick={() => { if (selectedIndex != -1) dispatch(RemoveSelectPoints(selectedIndex)); }} />
                    <input className="btn btn-primary" type="button" value="Pop" onClick={() => dispatch(RemoveSelectPoints(points.lenth - 1))} />
                    <input className="btn btn-primary" type="button" value="Clear" onClick={() => dispatch(ClearSelectPoints())} />
                </div>
                <button className={closeButton} style={{ top: '2px', right: '2px' }} onClick={() => {
                    props.closeCallback();
                }}>X</button>
            </div>

        </div>

    );

}

export default PointWidget;

/*
export class Points extends React.Component<any, any>{
    Data: Array<iD3DataRow>
    props: {
        data: Map<string, Array<iD3PointOfInterest>>,
        callback: Function,
        postedData: any,
        activeUnits: (lbl: string) => iActiveUnits,
    }

    constructor(props) {
        super(props);
        this.Data = [];

        this.state = {
            selectedPoint: -1
        };
    }

    componentDidMount() {
        ($("#accumulatedpoints") as any).draggable({ scroll: false, handle: '#accumulatedpointshandle', containment: '#chartpanel' });
    }


    render() {


        const headerRow: Array<JSX.Element> = [];
        const headerKeys: Array<string> = [];

        this.props.data.forEach((val, key) => val.forEach((item, index) => {
            let asset = ""
            if (key === "Voltage" || key === "Current")
                asset = item.LegendGroup;
            headerRow.push(Header(key, index, asset, item.ChannelName))
            headerKeys.push(key);
        })
        );

        let t = [];

        this.props.data.forEach(item => item.forEach(series => series.Selected.forEach(pt => t.push(pt[0]))));
        

        t = t.sort();
        t = uniq(t);

        this.Data = t.map((time, i) => {
            let val = [];
            let deltaVal = [];
            let pointIndex = [];
            let seriesIndex = [];
            let label = [];
            let unit = [];
            let Toffset = 0;
            headerKeys.forEach((key) => {

                if (this.props.activeUnits(key).Tstart !== undefined)
                    Toffset = this.props.activeUnits(key).Tstart;

                this.props.data.get(key).forEach((series, seriesI) => {
                    let ptIndex = series.Selected.findIndex(pt => pt[0] === time);
                    if (ptIndex != -1) {
                        pointIndex.push(ptIndex);
                        seriesIndex.push(seriesI);
                        label.push(key);
                        val.push(series.Selected[ptIndex][1]);
                        deltaVal.push((ptIndex > 0 ? series.Selected[ptIndex][1] - series.Selected[ptIndex - 1][1] : NaN))
                        unit.push(series.Unit)
                    } else {
                        pointIndex.push(NaN);
                        seriesIndex.push(NaN);
                        label.push(key);
                        val.push(NaN);
                        deltaVal.push(NaN)
                        unit.push("Current")
                    }
                })
            })

            let row: iD3DataRow = {
                Value: val,
                DeltaValue: deltaVal,
                DeltaTime: (i > 0 ? t[i] - t[i - 1] : NaN),
                Time: time - Toffset,
                GraphLabel: label,
                PointIndex: pointIndex,
                SeriesIndex: seriesIndex,
                Unit: unit
            }
            return row;
        });

        const dataRows: Array<JSX.Element> = this.Data.map((row, i) => Row(row, this.props.postedData.postedSystemFrequency, (obj) => this.setState(obj), i, this.state.selectedPoint, this.props.activeUnits))
      
       
        return (
            <div id="accumulatedpoints" className="ui-widget-content" style={outerDiv}>
                <div style={{ border: 'black solid 2px' }}>
                    <div id="accumulatedpointshandle" className={handle}></div>
                    <div style={{ overflowY: 'scroll', maxHeight: 950}}>
                        <table className="table table-bordered table-hover">
                            <thead>
                                <tr><td colSpan={2} key="header-time"></td>{headerRow}</tr>
                                {SubHeader(headerRow.length)}
                            </thead>
                            <tbody>
                                {dataRows}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ margin: '5px', textAlign: 'right' }}>
                        <input className="btn btn-primary" type="button" value="Remove" onClick={this.removePoint.bind(this)} />
                        <input className="btn btn-primary" type="button" value="Pop" onClick={this.popAccumulatedPoints.bind(this)} />
                        <input className="btn btn-primary" type="button" value="Clear" onClick={this.clearAccumulatedPoints.bind(this)} />
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
        if (this.state.selectedPoint < 0)
            return;

        const row = this.Data[this.state.selectedPoint]
        this.props.callback((state) => {
            const obj = cloneDeep(state.tableData);
            row.GraphLabel.forEach((label, index) => {
                let data = obj.get(label);
                if (!isNaN(row.SeriesIndex[index]))
                    data[row.SeriesIndex[index]].Selected.splice(row.PointIndex[index], 1);
            })
            return { tableData: obj };
        })
    }

    popAccumulatedPoints() {
        if (this.Data.length == 0)
            return;

        const row = this.Data[this.Data.length -1]
        this.props.callback((state) => {
            const obj = cloneDeep(state.tableData);
            row.GraphLabel.forEach((label, index) => {
                let data = obj.get(label);
                if (!isNaN(row.SeriesIndex[index]))
                    data[row.SeriesIndex[index]].Selected.splice(row.PointIndex[index], 1);
            })
            return { tableData: obj };
        })
    }

    clearAccumulatedPoints() {
        this.props.callback((state) => {
            const obj = cloneDeep(state.tableData);
            obj.forEach(lst => lst.forEach(pnt => pnt.Selected = []));
            return { tableData: obj };
        })
    }

}

const Row = (row: iD3DataRow, systemFrequency: number, stateSetter: Function, arrayIndex: number, currentSelected: number, getUnits: (lbl: string) => iActiveUnits) => {
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
        let unit = getUnits(row.GraphLabel[index])[row.Unit[index]].current;
        let val = row.Value[index]*unit.Factor
        if (isNaN(val))
            return (<td key={"Value-" + index}><span>N/A</span></td>)
        return (<td key={"Value-" + index}>{val.toFixed(2) + " " + unit.Short}</td>)
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

const Header = (graphLabel: string, index: number, asset: string, channel: string) => {
    return (
        <td colSpan={2} key={"header-" + graphLabel + "-" +  index}><span>{asset}<br/>{channel}</span> </td>
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


*/