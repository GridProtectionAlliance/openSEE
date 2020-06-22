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
import { clone, cloneDeep } from 'lodash';
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
    Vab: string,
    Vbc: string,
    Vca: string,
    Ia: string,
    Ib: string,
    Ic: string,
    Ires: string,
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
}

export const DefaultColors = 
    {
    Va: "#A30000",
    Vb: "#0029A3",
    Vc: "#007A29",
    Vab: "#A30000",
    Vbc: "#0029A3",
    Vca: "#007A29",
    Ia: "#FF0000",
    Ib: "#0066CC",
    Ic: "#33CC33",
    Ires: "#d3d3d3",
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
}

export interface SettingWindowProps {
    stateSetter: Function,
    showV: boolean,
    showI: boolean,
    unitSetting: GraphUnits,
    colorSetting: Colors,

    showTCE: boolean,
    showdigitals: boolean,
    showAnalogs: boolean,
    showAnalytics: string,
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
                <div id="phasorchart" style={{ width: '696px', height: '300px', zIndex: 1001, overflowY: 'scroll' }}>
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
                                    <div className="container">
                                        {(this.props.showV ?
                                            <div className="row">
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Voltage"} unit={this.props.unitSetting.Voltage} setter={this.updateVoltageUnits.bind(this)} />
                                                <UnitSelector label={"Phase"} unit={this.props.unitSetting.Angle} setter={this.updatePhaseUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showI ?
                                            <div className="row">
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Current"} unit={this.props.unitSetting.Current} setter={this.updateCurrentUnits.bind(this)} />
                                                <UnitSelector label={"Phase"} unit={this.props.unitSetting.Angle} setter={this.updatePhaseUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showTCE ?
                                            <div className="row">
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"TCE"} unit={this.props.unitSetting.TCE} setter={this.updateTCEUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "FirstDerivative" ?
                                            <div className="row">
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"dV/dt"} unit={this.props.unitSetting.VoltageperSecond} setter={this.updatedVdtUnits.bind(this)} />
                                                <UnitSelector label={"dI/dt"} unit={this.props.unitSetting.CurrentperSecond} setter={this.updatedIdtUnits.bind(this)} />
                                            </div> : null )}
                                        {(this.props.showAnalytics == "ClippedWaveforms" ?
                                            <div className="row">
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Voltage"} unit={this.props.unitSetting.Voltage} setter={this.updateVoltageUnits.bind(this)} />
                                                <UnitSelector label={"Current"} unit={this.props.unitSetting.Current} setter={this.updateCurrentUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "Frequency" ?
                                            <div className="row">
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Frequency"} unit={this.props.unitSetting.Freq} setter={this.updateFrequencyUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "LowPassFilter" ?
                                            <div className="row">
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits.bind(this)} />
                                                <UnitSelector label={"Voltage"} unit={this.props.unitSetting.Voltage} setter={this.updateVoltageUnits.bind(this)} />
                                                <UnitSelector label={"Current"} unit={this.props.unitSetting.Current} setter={this.updateCurrentUnits.bind(this)} />
                                            </div> : null)}
                                        {(this.props.showAnalytics == "HighPassFilter" ?
                                            <div className="row">
                                                <UnitSelector label={"Time"} unit={this.props.unitSetting.Time} setter={this.updateTimeUnits} />
                                                <UnitSelector label={"Voltage"} unit={this.props.unitSetting.Voltage} setter={this.updateVoltageUnits} />
                                                <UnitSelector label={"Current"} unit={this.props.unitSetting.Current} setter={this.updateCurrentUnits} />
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
                                    <div className="container">
                                        {(this.props.showV ?
                                            <div> 
                                                VoltageColors(this.props.colorSetting, this.props.stateSetter) 
                                                VoltageLLColors(this.props.colorSetting, this.props.stateSetter) 
                                            </div> : null)}
                                        {(this.props.showI ? CurrentColors(this.props.colorSetting, this.props.stateSetter, true) : null)}
                                        {(this.props.showTCE && !this.props.showI ? CurrentColors(this.props.colorSetting, this.props.stateSetter, false) : null)}
                                            
                                        {(this.props.showAnalytics == "FaultDistance" ?
                                            <div className="row">
                                                <div className="col">
                                                    <ColorButton label={"Simple"} color={this.props.colorSetting.faultDistSimple} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistSimple = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                                <div className="col">
                                                    <ColorButton label={"Reactance"} color={this.props.colorSetting.faultDistReact} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistReact = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                                <div className="col">
                                                    <ColorButton label={"Takagi"} color={this.props.colorSetting.faultDistTakagi} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistTakagi = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                                <div className="col">
                                                        <ColorButton label={"Modified Takagi"} color={this.props.colorSetting.faultDistModTakagi} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistModTakagi = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                                <div className="col">
                                                        <ColorButton label={"Novosel"} color={this.props.colorSetting.faultDistNovosel} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistNovosel = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                                <div className="col">
                                                        <ColorButton label={"Double Ended"} color={this.props.colorSetting.faultDistDoubleEnd} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.faultDistDoubleEnd = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                            </div> : null)}
                                        {this.props.showAnalytics == "FirstDerivative" && !this.props.showI?
                                            CurrentColors(this.props.colorSetting, this.props.stateSetter, true) : null} 
                                        {this.props.showAnalytics == "FirstDerivative" && !this.props.showV ?
                                            VoltageColors(this.props.colorSetting, this.props.stateSetter) : null}
                                        {this.props.showAnalytics == "ClippedWaveforms" && !this.props.showI ?
                                            CurrentColors(this.props.colorSetting, this.props.stateSetter, true) : null}
                                        {this.props.showAnalytics == "ClippedWaveforms" && !this.props.showV ?
                                            VoltageColors(this.props.colorSetting, this.props.stateSetter) : null}     
                                        {(this.props.showAnalytics == "Frequency" ?
                                            <div className="row">
                                                <div className="col">
                                                    <ColorButton label={"f AN"} color={this.props.colorSetting.freqVa} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.freqVa = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                                <div className="col">
                                                    <ColorButton label={"f BN"} color={this.props.colorSetting.freqVb} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.freqVb = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                                <div className="col">
                                                    <ColorButton label={"f CN"} color={this.props.colorSetting.freqVc} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.freqVc = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                                <div className="col">
                                                    <ColorButton label={"f avg"} color={this.props.colorSetting.freqAll} statesetter={(color) => { let col = cloneDeep(this.props.colorSetting); col.freqAll = color; this.props.stateSetter({ plotColors: col }); }} />
                                                </div>
                                            </div> : null)}
                                        {this.props.showAnalytics == "LowPassFilter" && !this.props.showI ?
                                            CurrentColors(this.props.colorSetting, this.props.stateSetter, true) : null}
                                        {this.props.showAnalytics == "LowPassFilter" && !this.props.showV ?
                                            VoltageColors(this.props.colorSetting, this.props.stateSetter) : null}
                                        {this.props.showAnalytics == "HighPassFilter" && !this.props.showI ?
                                            CurrentColors(this.props.colorSetting, this.props.stateSetter, true) : null}
                                        {this.props.showAnalytics == "HighPassFilter" && !this.props.showV ?
                                            VoltageColors(this.props.colorSetting, this.props.stateSetter) : null}

                                    </div>                                
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
                <button className={closeButton} onClick={() => {
                    $('#settings').hide();
                }}>X</button>

            </div>
        );
    }

    updateTimeUnits(unit: UnitSetting) {
        let settings = cloneDeep(this.props.unitSetting)
        settings.Time = unit;
        this.props.stateSetter({ plotUnits: settings })
    }

    updateVoltageUnits(unit: UnitSetting) {
        let settings = cloneDeep(this.props.unitSetting)
        settings.Voltage = unit;
        this.props.stateSetter({ plotUnits: settings })
    }

    updateCurrentUnits(unit: UnitSetting) {
        let settings = cloneDeep(this.props.unitSetting)
        settings.Current = unit;
        this.props.stateSetter({ plotUnits: settings })
    }

    updatePhaseUnits(unit: UnitSetting) {
        let settings = cloneDeep(this.props.unitSetting)
        settings.Angle = unit;
        this.props.stateSetter({ plotUnits: settings })
    }

    updatedVdtUnits(unit: UnitSetting) {
        let settings = cloneDeep(this.props.unitSetting)
        settings.VoltageperSecond = unit;
        this.props.stateSetter({ plotUnits: settings })
    }

    updatedIdtUnits(unit: UnitSetting) {
        let settings = cloneDeep(this.props.unitSetting)
        settings.CurrentperSecond = unit;
        this.props.stateSetter({ plotUnits: settings })
    }

    updateFrequencyUnits(unit: UnitSetting) {
        let settings = cloneDeep(this.props.unitSetting)
        settings.Freq = unit;
        this.props.stateSetter({ plotUnits: settings })
    }

    updateTCEUnits(unit: UnitSetting) {
        let settings = cloneDeep(this.props.unitSetting)
        settings.TCE = unit;
        this.props.stateSetter({ plotUnits: settings })
    }

}

const VoltageColors = (colorSetting: Colors, stateSetter: Function) => {
    
    return (
        <div className="row">
            <div className="col">
                <ColorButton label={"VAN"} color={colorSetting.Va} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Va = color; stateSetter({ plotColors: col }); }} />
            </div>
            <div className="col">
                <ColorButton label={"VBN"} color={colorSetting.Vb} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vb = color; stateSetter({ plotColors: col }); }} />
            </div>
            <div className="col">
                <ColorButton label={"VCN"} color={colorSetting.Vc} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vc = color; stateSetter({ plotColors: col }); }} />
            </div>
        </div>
        );
}

const VoltageLLColors = (colorSetting: Colors, stateSetter: Function) => {

    return (
        <div className="row">
            <div className="col">
                <ColorButton label={"VAB"} color={colorSetting.Vab} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vab = color; stateSetter({ plotColors: col }); }} />
            </div>
            <div className="col">
                <ColorButton label={"VBC"} color={colorSetting.Vbc} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vbc = color; stateSetter({ plotColors: col }); }} />
            </div>
            <div className="col">
                <ColorButton label={"VCA"} color={colorSetting.Vca} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Vca = color; stateSetter({ plotColors: col }); }} />
            </div>
        </div>
    );
}


const CurrentColors = (colorSetting: Colors, stateSetter: Function, showIres: boolean) => {

    return (
        <div className="row">
            <div className="col">
                <ColorButton label={"IAN"} color={colorSetting.Ia} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Ia = color; stateSetter({ plotColors: col }); }} />
            </div>
            <div className="col">
                <ColorButton label={"IBN"} color={colorSetting.Ib} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Ib = color; stateSetter({ plotColors: col }); }} />
            </div>
            <div className="col">
                <ColorButton label={"ICN"} color={colorSetting.Ic} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Ic = color; stateSetter({ plotColors: col }); }} />
            </div>
            {showIres ?
                <div className="col">
                    <ColorButton label={"IRES"} color={colorSetting.Ires} statesetter={(color) => { let col = cloneDeep(colorSetting); col.Ires = color; stateSetter({ plotColors: col }); }} />
                </div> : null}
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
                let r = this.props.unit;
                r.current = option;
                this.props.setter(r)
            }
            }> {option.Label} </a>)

        return (
            <div className="col">
                <div className="btn-group dropright" style={{ margin: ' 5px 10px 5px 10px' }}>
                    <button type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {this.props.label + " [" + this.props.unit.current.Short + "]"}
                    </button>
                    <div className="dropdown-menu">
                        {entries}
                    </div>
                </div>
            </div>
        );
    }
}
