//******************************************************************************************************
//  PolarChart.tsx - Gbtc
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
//  05/10/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { style } from "typestyle"
import { iActiveUnits } from '../Graphs/D3LineChartBase';
import { Colors } from './SettingWindow';

// styles
const outerDiv: React.CSSProperties = {
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    top: '0',
    left: 0,
    display: 'none',
    backgroundColor: 'white',
    width: 530,
    height: 340
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

export interface PolarChartProps {
    Vdata: Array<Vector>,
    Idata: Array<Vector>,
    callback: Function,
    activeUnits: (lbl: string) => iActiveUnits,
    colors: Colors,
    showV: boolean,
    showI: boolean,
}

export interface Vector {
    Color: string,
    Mag: number,
    Phase: number,
    LegendGroup: string,
    VerticalLegend: string,
    PhaseUnit: string,
    MagnitudeUnit: string,
}

export default class PolarChart extends React.Component<any, any>{
    props: PolarChartProps;
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        ($("#phasor") as any).draggable({ scroll: false, handle: '#phasorhandle', containment: '#chartpanel' });
    }


    

    render() {
    
        

       


        let tblData = {
            VAB: [], VAN: [], 
            VBC: [], VBN: [],
            VCA: [], VCN: [],
            IAN: [], IBN: [], ICN: [],
        };

        let tblShow = {
            VAB: false, VAN: false,
            VBC: false, VBN: false,
            VCA: false, VCN: false,
            IAN: false, IBN: false, ICN: false,
        };

        let assetData = []

        let units: iActiveUnits = this.props.activeUnits("Voltage");

        this.props.Vdata.forEach(item => {
            let assetIndex = assetData.findIndex(d => d == item.LegendGroup);
            if (assetIndex < 0) {
                assetIndex = assetData.length;
                assetData.push(item.LegendGroup)
                tblData.VAB.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.VBC.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.VCA.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })

                tblData.VAN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.VBN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.VCN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.IAN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.IBN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.ICN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })

            }

            tblData["V" + item.VerticalLegend][assetIndex] = {
                Mag: item.Mag * units[item.MagnitudeUnit].current.Factor,
                Ang: item.Phase * units[item.PhaseUnit].current.Factor,
                UnitMag: units[item.MagnitudeUnit].current.Short,
                UnitAng: units[item.PhaseUnit].current.Short
            }
            tblShow[ "V" + item.VerticalLegend] = true
        })

        var vMax = 0;
        $.each(this.props.Vdata, function (key, series) {
            if ((series.Mag> vMax))
                vMax = series.Mag;
        });
        var scaleV = 0.9 * 150 / vMax;

        units = this.props.activeUnits("Current");

        this.props.Idata.forEach(item => {
            let assetIndex = assetData.findIndex(d => d == item.LegendGroup);
            if (assetIndex < 0) {
                assetIndex = assetData.length;
                assetData.push(item.LegendGroup)
                tblData.VAB.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: ""})
                tblData.VBC.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.VCA.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })

                tblData.VAN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.VBN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.VCN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.IAN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.IBN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })
                tblData.ICN.push({ Mag: NaN, Ang: NaN, UnitMag: "", UnitAng: "" })

            }

            tblData["I" + item.VerticalLegend][assetIndex] = {
                Mag: item.Mag * units[item.MagnitudeUnit].current.Factor,
                Ang: item.Phase * units[item.PhaseUnit].current.Factor,
                UnitMag: units[item.MagnitudeUnit].current.Short,
                UnitAng: units[item.PhaseUnit].current.Short
            }
            tblShow["I" + item.VerticalLegend] = true
        }) 

        var iMax = 0;
        $.each(this.props.Idata, function (key, series) {
            if ((series.Mag) > iMax)
                iMax = series.Mag;
        });
        var scaleI = 0.9 * 150 / iMax;

        if (!this.props.showV) {
            tblShow.VAB = false
            tblShow.VAN = false
            tblShow.VBC = false
            tblShow.VBN = false
            tblShow.VCA = false
            tblShow.VCN = false

        }

        if (!this.props.showI) {
            tblShow.IAN = false
            tblShow.IBN = false
            tblShow.ICN = false
        }
        //
        //{(tblShow.VBN ? Row("VBN", tblData.VBN) : null)}
        
        return (
            <div id="phasor" className="ui-widget-content" style={outerDiv}>
                <div id="phasorhandle" className={handle}></div>
                <div id="phasorchart" style={{ width: '520px', height: '300px', zIndex: 1001 }}>
                    <svg width="300" height="300">
                        <circle cx="150" cy="150" r={60} stroke="lightgrey" strokeWidth="1" fill='white' fillOpacity="0"/>
                        <circle cx="150" cy="150" r={130} stroke="lightgrey" strokeWidth="1" fill='white' fillOpacity="0" />
                        <line x1="150" y1="0" x2="150" y2="300" style={{ stroke: 'lightgrey' , strokeWidth: 2}} />
                        <line x1="0" y1="150" x2="300" y2="150" style={{ stroke: 'lightgrey', strokeWidth: 2 }} />
                        {(this.props.showV ?
                            this.props.Vdata.map((value, index) => Vector(value, index, scaleV, this.props.colors)) : null
                        )}
                        {(this.props.showI ?
                            this.props.Idata.map((value, index) => Vector(value, index, scaleI, this.props.colors)) : null
                        )}
                    </svg>
                    <div style={{ overflowY: 'scroll', maxWidth: 200, maxHeight: 300, float: 'right'}}>
                        <table className="table" style={{  height: 300, float: 'right' }}>
                            <thead>
                                <tr>
                                    <th></th>
                                    {assetData.map((item, i) => Header(item, i))}
                                </tr>
                                {SubHeader(assetData.length)}
                                
                            </thead>
                            <tbody>
                                { (tblShow.VAN ? Row("VAN", tblData.VAN) : null)}
                                { (tblShow.VBN ? Row("VBN", tblData.VBN) : null)}
                                { (tblShow.VCN ? Row("VCN", tblData.VCN) : null) }

                                { (tblShow.VAB ? Row("VAB", tblData.VAB) : null) }
                                { (tblShow.VBC ? Row("VBC", tblData.VBC) : null) }
                                { (tblShow.VCA ? Row("VCA", tblData.VCA) : null) }

                                { (tblShow.IAN ? Row("IAN", tblData.IAN) : null) }
                                { (tblShow.IBN ? Row("IBN", tblData.IBN) : null) }
                                { (tblShow.ICN ? Row("ICN", tblData.ICN) : null) }
                            </tbody>
                        </table>
                    </div>
                </div>
                <button className={closeButton} onClick={() => {
                    this.props.callback({ phasorButtonText: "Show Phasor" });
                    $('#phasor').hide();
                }}>X</button>

            </div>
        );
    }
}


const Header = (header: string, key: number) => {
    return (
        <th colSpan={2} key={key}><span>{header}</span> </th>
    )
}


const SubHeader = (collumns: number) => {
    function createCell(str, i) {
        return (<th key={"header-" + str + "-" + i}>{str}</th>)
    }

    function createCells() {
        let res = [];
        let i;
        res.push(createCell("Phase",0))
        for (i = 0; i < collumns; i++) {
            res.push(createCell("Mag",i))
            res.push(createCell("Angle",i))
        }

        return res;
    }


    return (
        <tr>
            {createCells()}
        </tr>
    );
}

const Row = (label: string, data: Array<{ Mag: number, Ang: number, UnitMag: string, UnitAng: string }>) => {
    function AddMagnitude(index) {
        return (<td key={label + "-mag-" + index}>{data[index].Mag.toFixed(2)} ({data[index].UnitMag})</td>)
    }
       
    function AddPhase(index) {
        return (<td key={label + "-phase-" + index}>{data[index].Ang.toFixed(2)} ({data[index].UnitAng})</td>)
        
    }
    function rows() {
        let res = [];
        let i;
        for (i = 0; i < data.length; i++) {
            res.push(AddMagnitude(i))
            res.push(AddPhase(i))
        }

        return res;
    }
    return (
        <tr key={label}>
            <td key="label">{label}</td>
            {rows()}
        </tr>
    );
}

const Vector = (data: Vector, index: number, scale: number, color: Colors) => {
    function drawVectorSVG(): string {
        if (data.Mag == undefined || scale == undefined || data.Phase == undefined) return '';
        var x = data.Mag * scale * Math.cos(data.Phase * Math.PI / 180);
        var y = data.Mag * scale * Math.sin(data.Phase * Math.PI / 180);
        return `M 150 150 L ${150 + x} ${150 - y} Z`
    }

    return (
        <path key={index} d={drawVectorSVG()} style={{ stroke: color[data.Color], strokeWidth: 3 }} />
    )
}