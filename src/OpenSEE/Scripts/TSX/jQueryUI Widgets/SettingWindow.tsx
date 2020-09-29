//******************************************************************************************************
//  SettingWindow.tsx - Gbtc
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
//  06/08/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { style } from "typestyle"
import { cloneDeep } from 'lodash';
import { BlockPicker } from 'react-color';

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
    width: 700,
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

export interface Colors {
    Va: string,
    Vb: string,
    Vc: string,
    Vn: string,
    Vab: string,
    Vbc: string,
    Vca: string,
    Ia: string,
    Ib: string,
    Ic: string,
    Ires: string,
    In: string,
    random: string,
    faultDistSimple: string,
    faultDistReact: string,
    faultDistTakagi: string,
    faultDistModTakagi: string,
    faultDistNovosel: string,
    faultDistDoubleEnd: string,
    freqAll: string,
    freqVa: string,
    freqVb: string,
    freqVc: string,
    Ra: string,
    Xa: string,
    Za: string,
    Rb: string,
    Xb: string,
    Zb: string,
    Rc: string,
    Xc: string,
    Zc: string,
    Pa: string,
    Qa: string,
    Sa: string,
    Pb: string,
    Qb: string,
    Sb: string,
    Pc: string,
    Qc: string,
    Sc: string,
    Pt: string,
    Qt: string,
    St: string,
    Pfa: string,
    Pfb: string,
    Pfc: string,
    VS0: string,
    VS1: string,
    VS2: string,
    IS0: string,
    IS1: string,
    IS2: string,
    Vdc: string,
    Idc: string,
}

export type UnitSetting = {
    current: Unit,
    options: Array<Unit>
}

export interface GraphUnits {
    Time: UnitSetting,
    Voltage: UnitSetting,
    Current: UnitSetting,
    Angle: UnitSetting,
    TCE: UnitSetting,
    VoltageperSecond: UnitSetting,
    CurrentperSecond: UnitSetting,
    Freq: UnitSetting,
    Distance: UnitSetting,
    Impedance: UnitSetting,
    PowerP: UnitSetting,
    PowerQ: UnitSetting,
    PowerS: UnitSetting,
    PowerPf: UnitSetting,
    Unbalance: UnitSetting,
    THD: UnitSetting,
}

export interface yLimits {
    min: number,
    max: number,
    auto: boolean,
    setter?: (min: number, max: number, auto: boolean) => void
}

export type Unit = {
    Label: string,
    Short: string,
    Factor: number
}

export const DefaultUnits = {
    Time: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "seconds", Short: "s", Factor: 0 },
            { Label: "minutes", Short: "min", Factor: 0 },
            { Label: "milliseconds", Short: "ms", Factor: 0 },
            { Label: "milliseconds since event", Short: "ms since event", Factor: 0 },
            { Label: "cycles since event", Short: "cycles", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    Voltage: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Volt", Short: "V", Factor: 1 },
            { Label: "kiloVolts", Short: "kV", Factor: 0.001 },
            { Label: "milliVolts", Short: "mV", Factor: 1000 },
            { Label: "Per Unit", Short: "pu", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    Current: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Amps", Short: "A", Factor: 1 },
            { Label: "kiloAmps", Short: "kA", Factor: 0.001 },
            { Label: "milliAmps", Short: "mA", Factor: 1000 },
            { Label: "Per Unit", Short: "pu", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    Angle: {
        current: { Label: "degree", Short: "deg", Factor: 1 },
        options: [
            { Label: "degree", Short: "deg", Factor: 1 },
            { Label: "radians", Short: "rad", Factor: 0.0174532925 }
        ]
    },
    TCE: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Amps", Short: "A", Factor: 1 },
            { Label: "kiloAmps", Short: "kA", Factor: 0.001 },
            { Label: "milliAmps", Short: "mA", Factor: 1000 },
            { Label: "Per Unit", Short: "pu", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    VoltageperSecond: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Volt per sec", Short: "V/s", Factor: 1 },
            { Label: "kiloVolts per sec", Short: "kV/s", Factor: 0.001 },
            { Label: "milliVolts per sec", Short: "mV/s", Factor: 1000 },
            { Label: "Per Unit", Short: "pu/s", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    CurrentperSecond: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Amps per sec", Short: "A/s", Factor: 1 },
            { Label: "kiloAmps per sec", Short: "kA/s", Factor: 0.001 },
            { Label: "milliAmps per sec", Short: "mA/s", Factor: 1000 },
            { Label: "Per Unit", Short: "pu/s", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    Freq: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Hertz", Short: "Hz", Factor: 1 },
            { Label: "milliHertz", Short: "mHz", Factor: 1000 },
            { Label: "kiloHertz", Short: "kHz", Factor: 0.001 },
            { Label: "Per Unit", Short: "pu", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    Distance: {
        current: { Label: "miles", Short: "mile", Factor: 1 },
        options: [
            { Label: "kilometers", Short: "km", Factor: 1.60934  },
            { Label: "miles", Short: "mile", Factor: 1 },
        ]
    },
    Impedance: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Ohms", Short: "Ohm", Factor: 1 },
            { Label: "kiloOhms", Short: "kOhm", Factor: 0.001 },
            { Label: "milliOhms", Short: "mOhm", Factor: 1000 },
            { Label: "Per Unit", Short: "pu", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },

    PowerP: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Watt", Short: "W", Factor: 1000000 },
            { Label: "Mega Watt", Short: "MW", Factor: 1 },
            { Label: "Kilo Watt", Short: "kW", Factor: 1000 },
            { Label: "Per Unit", Short: "pu", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    PowerQ: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Volt-Amps Reactive", Short: "VAR", Factor: 1000000 },
            { Label: "Mega Volt-Amps Reactive", Short: "MVAR", Factor: 1 },
            { Label: "Kilo Volt-Amps Reactive", Short: "kVAR", Factor: 1000 },
            { Label: "Per Unit", Short: "pu", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    PowerS: {
        current: { Label: "auto", Short: "auto", Factor: 0 },
        options: [
            { Label: "Volt-Amps", Short: "VA", Factor: 1000000 },
            { Label: "Mega Volt-Amps", Short: "MVA", Factor: 1 },
            { Label: "Kilo Volt-Amps", Short: "kVA", Factor: 1000 },
            { Label: "Per Unit", Short: "pu", Factor: 0 },
            { Label: "auto", Short: "auto", Factor: 0 }
        ]
    },
    PowerPf: {
        current: { Label: "", Short: "pf", Factor: 1 },
        options: [
            { Label: "", Short: "pf", Factor: 1 }
        ]
    },
    Unbalance: {
        current: { Label: "Ratio", Short: "Unbalance", Factor: 1 },
        options: [
            { Label: "Percent", Short: "%", Factor: 100 },
            { Label: "Ratio", Short: "Unbalance", Factor: 1 }
        ]
    },
    THD: {
        current: { Label: "Ratio", Short: "THD", Factor: 1 },
        options: [
            { Label: "Percent", Short: "%", Factor: 100 },
            { Label: "Ratio", Short: "THD", Factor: 1 }
        ]
    },


}

export const DefaultColors = 
    {
    Va: "#A30000",
    Vb: "#0029A3",
    Vc: "#007A29",
    Vn: "#d3d3d3",
    Vab: "#A30000",
    Vbc: "#0029A3",
    Vca: "#007A29",
    Ia: "#FF0000",
    Ib: "#0066CC",
    Ic: "#33CC33",
    Ires: "#d3d3d3",
    In: "#d3d3d3",
    random: "#4287f5",
    faultDistSimple: "#edc240",
    faultDistReact: "#afd8f8",
    faultDistTakagi: "#cb4b4b",
    faultDistModTakagi: "#4da74d",
    faultDistNovosel: "#9440ed",
    faultDistDoubleEnd: "#BD9B33",
    freqAll: "#edc240",
    freqVa: "#A30000",
    freqVb: "#0029A3",
    freqVc: "#007A29",
    Ra: "#A30000",
    Xa: "#0029A3",
    Za: "#007A29",
    Rb: "#A30000",
    Xb: "#0029A3",
    Zb: "#007A29",
    Rc: "#A30000",
    Xc: "#0029A3",
    Zc: "#007A29",
    Pa: "#A30000",
    Qa: "#0029A3",
    Sa: "#007A29",
    Pb: "#A30000",
    Qb: "#0029A3",
    Sb: "#007A29",
    Pc: "#A30000",
    Qc: "#0029A3",
    Sc: "#007A29",
    Pt: "#A30000",
    Qt: "#0029A3",
    St: "#007A29",
    Pfa: "#A30000",
    Pfb: "#0029A3",
    Pfc: "#007A29",
    VS0: "#A30000",
    VS1: "#0029A3",
    VS2: "#007A29",
    IS0: "#A30000",
    IS1: "#0029A3",
    IS2: "#007A29",
    Vdc: "#0029A3",
    Idc: "#007A29"
}

export interface SettingWindowProps {
    stateSetter: Function,
    showV: boolean,
    showI: boolean,
    unitSetting: GraphUnits,
    colorSetting: Colors,
    compareChart: boolean,

    showTCE: boolean,
    showdigitals: boolean,
    showAnalogs: boolean,
    showAnalytics: string,
    showCompare: boolean,
    

    voltageLimits: yLimits,
    currentLimits: yLimits,
    tceLimits: yLimits,
    digitalLimits: yLimits,
    analogLimits: yLimits,
    analyticLimits: yLimits,
}

export default class SettingWindow extends React.Component<any, any>{
    props: SettingWindowProps;
   
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        ($("#settings") as any).draggable({ scroll: false, handle: '#settingshandle', containment: '#chartpanel' });
    }


    
    render() {
        
        return (
            <div id="settings" className="ui-widget-content" style={outerDiv}>
                <div id="settingshandle" className={handle}></div>
                <div style={{ width: '696px', height: '300px', zIndex: 1001, overflowY: 'scroll' }}>
                    <div className="accordion" id="panelSettings">
                        <div className="card">
                            <div className="card-header" id="headingUnit">
                                <h2 className="mb-0">
                                    <button className="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapseUnit" aria-expanded="true" aria-controls="collapseVoltage">
                                        Plot Units
                                    </button>
                                </h2>
                            </div> 
                        
                            <div id="collapseUnit" className="collapse show" aria-labelledby="headingUnit" data-parent="#panelSettings">
                                <div className="card-body">
                                    <div>
                                        {(this.props.showV ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Voltage"} unit={this.props.unitSetting.Voltage} setter={this.updateVoltageUnits.bind(this)} />
                                                <UnitSelector label={"Phase"} unit={this.props.unitSetting.Angle} setter={this.updatePhaseUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showI ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Current"} unit={this.props.unitSetting.Current} setter={this.updateCurrentUnits.bind(this)} />
                                                <UnitSelector label={"Phase"} unit={this.props.unitSetting.Angle} setter={this.updatePhaseUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showTCE ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"TCE"} unit={this.props.unitSetting.TCE} setter={this.updateTCEUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "FaultDistance" ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Distance"} unit={this.props.unitSetting.Distance} setter={this.updateDistUnits.bind(this)} />
                                            </div> : null)}

                                        {(this.props.showAnalytics == "FirstDerivative" ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"dV/dt"} unit={this.props.unitSetting.VoltageperSecond} setter={this.updatedVdtUnits.bind(this)} />
                                                <UnitSelector label={"dI/dt"} unit={this.props.unitSetting.CurrentperSecond} setter={this.updatedIdtUnits.bind(this)} />
                                            </div> : null )}
                                        {(this.props.showAnalytics == "ClippedWaveforms" ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Voltage"} unit={this.props.unitSetting.Voltage} setter={this.updateVoltageUnits.bind(this)} />
                                                <UnitSelector label={"Current"} unit={this.props.unitSetting.Current} setter={this.updateCurrentUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "Frequency" ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Frequency"} unit={this.props.unitSetting.Freq} setter={this.updateFrequencyUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "LowPassFilter" ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Voltage"} unit={this.props.unitSetting.Voltage} setter={this.updateVoltageUnits.bind(this)} />
                                                <UnitSelector label={"Current"} unit={this.props.unitSetting.Current} setter={this.updateCurrentUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "HighPassFilter" ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits} />
                                                <UnitSelector label={"Voltage"} unit={this.props.unitSetting.Voltage} setter={this.updateVoltageUnits} />
                                                <UnitSelector label={"Current"} unit={this.props.unitSetting.Current} setter={this.updateCurrentUnits} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "Impedance" ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits} />
                                                <UnitSelector label={"Impedance"} unit={this.props.unitSetting.Impedance} setter={this.updateImpedanceUnits} />
                                            </div> : null)}

                                    </div>

                                </div>
                            </div> 
                        </div> 

                        <div className="card">
                            <div className="card-header" id="headingTwo">
                                <h2 className="mb-0">
                                    <button className="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                        Plot Colors
                                    </button>
                                </h2>
                            </div>
                            <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#panelSettings">
                                <div className="card-body">
                                        {(this.props.showV ?
                                        <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                            {VoltageColors(this.props.colorSetting, this.props.stateSetter, true)}
                                            {VoltageLLColors(this.props.colorSetting, this.props.stateSetter)} 
                                            
                                        </div>: null)}
                                        {(this.props.showI ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                {CurrentColors(this.props.colorSetting, this.props.stateSetter, true)}
                                            </div> : null)}
                                        {(this.props.showTCE?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                {CurrentColors(this.props.colorSetting, this.props.stateSetter, false)}
                                            </div> : null)}
                                                
                                        {(this.props.showAnalytics == "FaultDistance" ?
                                            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                    <ColorButton label={"Simple"} color={this.props.colorSetting.faultDistSimple} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistSimple = color; this.props.stateSetter({ plotColors: col }); }} />
                                                    <ColorButton label={"Reactance"} color={this.props.colorSetting.faultDistReact} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistReact = color; this.props.stateSetter({ plotColors: col }); }} />
                                                    <ColorButton label={"Takagi"} color={this.props.colorSetting.faultDistTakagi} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistTakagi = color; this.props.stateSetter({ plotColors: col }); }} />
                                                    <ColorButton label={"Modified Takagi"} color={this.props.colorSetting.faultDistModTakagi} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistModTakagi = color; this.props.stateSetter({ plotColors: col }); }} />
                                                    <ColorButton label={"Novosel"} color={this.props.colorSetting.faultDistNovosel} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistNovosel = color; this.props.stateSetter({ plotColors: col }); }} />
                                                    <ColorButton label={"Double Ended"} color={this.props.colorSetting.faultDistDoubleEnd} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistDoubleEnd = color; this.props.stateSetter({ plotColors: col }); }} />
                                            </div> : null)}
                                    {this.props.showAnalytics == "FirstDerivative" ?
                                        <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                            {VoltageColors(this.props.colorSetting, this.props.stateSetter, true)}
                                            {CurrentColors(this.props.colorSetting, this.props.stateSetter, true)} 
                                        </div>: null}
                                    {this.props.showAnalytics == "ClippedWaveforms" && !this.props.showI ?
                                        <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                            {CurrentColors(this.props.colorSetting, this.props.stateSetter, true)}
                                            {VoltageColors(this.props.colorSetting, this.props.stateSetter, true)}
                                        </div> : null}     
                                    {(this.props.showAnalytics == "Frequency" ?
                                        <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                                    <ColorButton label={"f AN"} color={this.props.colorSetting.freqVa} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.freqVa = color; this.props.stateSetter({ plotColors: col }); }} />
                                                    <ColorButton label={"f BN"} color={this.props.colorSetting.freqVb} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.freqVb = color; this.props.stateSetter({ plotColors: col }); }} />
                                                    <ColorButton label={"f CN"} color={this.props.colorSetting.freqVc} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.freqVc = color; this.props.stateSetter({ plotColors: col }); }} />
                                                    <ColorButton label={"f avg"} color={this.props.colorSetting.freqAll} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.freqAll = color; this.props.stateSetter({ plotColors: col }); }} />
                                        </div> : null)}
                                    {this.props.showAnalytics == "LowPassFilter" ?
                                        <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                            {VoltageColors(this.props.colorSetting, this.props.stateSetter, true)}
                                            {CurrentColors(this.props.colorSetting, this.props.stateSetter, true)}
                                        </div>: null}
                                    {this.props.showAnalytics == "HighPassFilter" && !this.props.showI ?
                                        <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                                            {VoltageColors(this.props.colorSetting, this.props.stateSetter, false)}
                                            {CurrentColors(this.props.colorSetting, this.props.stateSetter, true)}
                                        </div> : null}       
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header" id="headingThree">
                                <h2 className="mb-0">
                                    <button className="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                        Axis Limits
                                    </button>
                                </h2>
                            </div>
                            <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-parent="#panelSettings">
                                <div className="card-body">
                                    <div className="container">
                                        {(this.props.showV ? 
                                                <YLimitSetting
                                                    limit={this.props.voltageLimits}
                                                    setter={(update) => { this.props.stateSetter({ voltageLimits: update }); }}
                                                /> : null)}
                                        {(this.props.showI ?
                                            <YLimitSetting
                                                limit={this.props.currentLimits}
                                                setter={(update) => { this.props.stateSetter({ currentLimits: update }); }}
                                            /> : null)}
                                        {(this.props.showTCE ?
                                            <YLimitSetting
                                                limit={this.props.tceLimits}
                                                setter={(update) => { this.props.stateSetter({ tceLimits: update }); }}
                                            /> : null)}
                                        {(this.props.showAnalogs ?
                                            <YLimitSetting
                                                limit={this.props.analogLimits}
                                                setter={(update) => { this.props.stateSetter({ analogLimits: update }); }}
                                            /> : null)}
                                        {(this.props.showdigitals ?
                                            <YLimitSetting
                                                limit={this.props.digitalLimits}
                                                setter={(update) => { this.props.stateSetter({ digitalLimits: update }); }}
                                            /> : null)}
                                        {(this.props.showAnalytics !== "" ?
                                            <YLimitSetting
                                                limit={this.props.analyticLimits}
                                                setter={(update) => { this.props.stateSetter({ analyticLimits: update }); }}
                                            /> : null)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(this.props.showCompare ? 
                        <div className="card">
                            <div className="card-header" id="headingCompare">
                                <h2 className="mb-0">
                                        <button className="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapseCompare" aria-expanded="true" aria-controls="collapseCompare">
                                        Compare Options
                                    </button>
                                </h2>
                            </div>
                            
                            <div id="collapseCompare" className="collapse" aria-labelledby="headingCompare" data-parent="#panelSettings">
                                <div className="card-body">
                                    <div>
                                            <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                                <label className={"btn btn-secondary " + (!this.props.compareChart ? "" : "active")} onClick={() => {
                                                    this.props.stateSetter({ showCompareCharts: !this.props.compareChart })
                                                }}>
                                                    <input type="radio" defaultChecked={this.props.compareChart} />
                                                    show events individually
                                                </label>
                                                <label className={"btn btn-secondary " + (this.props.compareChart ? "" : "active")} onClick={() => {
                                                    this.props.stateSetter({ showCompareCharts: !this.props.compareChart })
                                                }}>
                                                    <input type="radio" checked={!this.props.compareChart} onChange={() => {  }} />
                                                    overlay events on graph
                                                </label>
                                            </div>
                                    </div>

                                </div>
                            </div> 
                        </div> : null)}

                    </div>
                    
                </div>
                <button className={closeButton} onClick={() => {
                    $('#settings').hide();
                }}>X</button>

            </div>
        );
    }

    updateTimeUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, Time: unit } })
    }

    updateVoltageUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, Voltage: unit } })
    }

    updateImpedanceUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, Impedance: unit } })
    }


    updateCurrentUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, Current: unit } })
    }

    updatePhaseUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, Angle: unit } })
    }

    updatedVdtUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, VoltageperSecond: unit } })
    }

    updatedIdtUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, CurrentperSecond: unit } })
    }

    updateFrequencyUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, Freq: unit } })
    }

    updateTCEUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, TCE: unit } })
    }

    updateDistUnits(unit: UnitSetting) {
        this.props.stateSetter({ plotUnits: { ...this.props.unitSetting, Distance: unit } })
    }


}

const VoltageColors = (colorSetting: Colors, stateSetter: Function, showNeutral: boolean) => {
    
    return (
        <div>
            <ColorButton label={"VAN"} color={colorSetting.Va} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Va = color; stateSetter({ plotColors: col }); }} />
            <ColorButton label={"VBN"} color={colorSetting.Vb} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vb = color; stateSetter({ plotColors: col }); }} />
            <ColorButton label={"VCN"} color={colorSetting.Vc} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vc = color; stateSetter({ plotColors: col }); }} />
            {(showNeutral ? < ColorButton label={"VN"} color={colorSetting.Vn} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vn = color; stateSetter({ plotColors: col }); }} /> : null)}
        </div>
        );
}

const VoltageLLColors = (colorSetting: Colors, stateSetter: Function) => {

    return (
        <div>
            <ColorButton label={"VAB"} color={colorSetting.Vab} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vab = color; stateSetter({ plotColors: col }); }} />
            <ColorButton label={"VBC"} color={colorSetting.Vbc} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vbc = color; stateSetter({ plotColors: col }); }} />
            <ColorButton label={"VCA"} color={colorSetting.Vca} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vca = color; stateSetter({ plotColors: col }); }} />
        </div>
    );
}

const CurrentColors = (colorSetting: Colors, stateSetter: Function, showIres: boolean) => {

    return (
        <div style={{display: "inline-flex"}}>
            <ColorButton label={"IAN"} color={colorSetting.Ia} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Ia = color; stateSetter({ plotColors: col }); }} />
            <ColorButton label={"IBN"} color={colorSetting.Ib} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Ib = color; stateSetter({ plotColors: col }); }} />
            <ColorButton label={"ICN"} color={colorSetting.Ic} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Ic = color; stateSetter({ plotColors: col }); }} />
            {showIres ? <ColorButton label={"IRES"} color={colorSetting.Ires} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Ires = color; stateSetter({ plotColors: col }); }} /> : null}
            {showIres ? <ColorButton label={"IN"} color={colorSetting.In} statesetter={(color) => { let col = cloneDeep(colorSetting); col.In = color; stateSetter({ plotColors: col }); }} /> : null}
        </div>
    );
}

class ColorButton extends React.Component {
    props: { label: string, statesetter: Function, color:string };

    state = {
        displayColorPicker: false,
    };

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    updateColor = (color, event) => {
        this.props.statesetter(color.hex);
    };

    render() {
        const popover: React.CSSProperties =
        {
            position: "absolute",
            zIndex: 1010,
        }
        const cover: React.CSSProperties =
        {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        }
        return (
            <div style={{ margin: ' 5px 10px 5px 10px' }}>
                <button className="btn btn-primary" onClick={this.handleClick} style={{ backgroundColor:  this.props.color }}>{this.props.label}</button>
                {this.state.displayColorPicker ? <div style={popover}>
                    <div style={cover} onClick={this.handleClose} />
                    <div style={{ position: 'fixed' }}>
                        <BlockPicker onChangeComplete={this.updateColor} color={this.props.color} triangle={"hide"}/>
                    </div>
                </div> : null}
            </div>
        )
    }
}

class UnitSelector extends React.Component {
    props: { label: string, setter: (result: UnitSetting) => void, unit: UnitSetting };

    render() {

        let entries = this.props.unit.options.map((option, index) => <a key={"option-" + index} className="dropdown-item"
            onClick={() => {
                this.props.setter({ ...this.props.unit, current: option })
            }
            }> {option.Label} </a>)

        return (
            <div className="btn-group dropright" style={{ margin: ' 5px 10px 5px 10px' }}>
                <button type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {this.props.label + " [" + this.props.unit.current.Short + "]"}
                </button>
                <div className="dropdown-menu">
                    {entries}
                </div>
            </div>
        );
    }
}

class YLimitSetting extends React.Component {
    props: { limit: yLimits, setter: (result: yLimits) => void }
    state: { max: string, min: string, errorMax: boolean, errorMin: boolean }

    constructor(props, context) {
        super(props, context);

        this.state = {
            max: props.limit.max,
            min: props.limit.min,
            errorMax: false,
            errorMin: false
        };
    }

    componentDidUpdate(prevProps: any, prevState: any) {

        if ((prevProps.limit.min !== this.props.limit.min) || (prevProps.limit.max !== this.props.limit.max)) 
            this.setState({
                min: this.props.limit.min.toString(),
                max: this.props.limit.max.toString(),
                errorMax: false,
                errorMin: false
            })
    }
    

    isNumber(d): boolean {
        if (!isNaN(parseFloat(d)))
            return true
        return false
    }

    changedMin(event) {
        if (this.props.limit.auto)
            return;
        this.setState({ min: event.target.value, errorMin: !this.isNumber(event.target.value) });
        if (this.isNumber(event.target.value) && parseFloat(event.target.value) !== this.props.limit.min) {
            let lim = this.props.limit;
            lim.min = parseFloat(event.target.value);
            this.props.setter(lim)
        }
    }

    changedMax(event) {
        if (this.props.limit.auto)
            return;
        this.setState({ max: event.target.value, errorMax: !this.isNumber(event.target.value) });
        if (this.isNumber(event.target.value) && parseFloat(event.target.value) !== this.props.limit.max) {
            let lim = this.props.limit;
            lim.max = parseFloat(event.target.value);
            this.props.setter(lim)
        }
    }

    render() {
        return (
            <div style={{ display: "inline-flex", border: "2px solid #ccc", width: "100%", borderRadius: 5, marginBottom: 10 }}>
                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                    <label className={"btn btn-secondary " + (!this.props.limit.auto ? "" : "active")} onClick={() => {
                        let result = this.props.limit;
                        result.auto = true;
                        this.props.setter(result);
                    }}>
                        <input type="radio" defaultChecked={this.props.limit.auto}/>
                        auto
                    </label>
                    <label className={"btn btn-secondary " + (this.props.limit.auto? "": "active")} onClick={() => {
                        let result = this.props.limit;
                        result.auto = false;
                        this.props.setter(result);
                    }}>
                        <input type="radio" checked={!this.props.limit.auto} onChange={() => { console.log("here") }} />
                        manual
                    </label>
                </div>
                <div className="input-group">
                    <input type="number" className={"form-control " + (this.state.errorMin ? "is-invalid" : "")} disabled={this.props.limit.auto} value={this.state.min} onChange={this.changedMin.bind(this)} />
                    <input type="number" className={"form-control " + (this.state.errorMax ? "is-invalid" : "")} disabled={this.props.limit.auto} value={this.state.max} onChange={this.changedMax.bind(this)} />
                    <div className="input-group-append">
                        <span className="input-group-text">..</span>
                    </div>
                </div>
            </div>
        );
    }
}