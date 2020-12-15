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
import { uniq } from 'lodash';
import { BlockPicker } from 'react-color';
import { outerDiv, handle, closeButton } from './Common';
import { OpenSee } from '../global';
import { useSelector, useDispatch } from 'react-redux';
import { selectData, selectGraphTypes } from '../Store/dataSlice';
import { selectColor, SetColor, selectSnap, selectUnit, selectTimeUnit, SetTimeUnit, SetUnit, SetSnapToPoint, selectEventOverlay, SetSinglePlot } from '../Store/settingSlice';

interface Iprops { closeCallback: () => void, isOpen: boolean }

const SettingsWidget = (props: Iprops) => {
    const list = useSelector(selectGraphTypes);
    const snapToPoint = useSelector(selectSnap);
    const eventOverlay = useSelector(selectEventOverlay);
    const dispatch = useDispatch();

    React.useEffect(() => {
        ($("#settings") as any).draggable({ scroll: false, handle: '#settingshandle', containment: '#chartpanel' });
    }, [props])

    return (
        <div id="settings" className="ui-widget-content" style={outerDiv}>
            <div id="settingshandle" className={handle}></div>
            <div style={{ width: '510px', height: '300px', zIndex: 1001, overflowY: 'scroll', overflowX: 'hidden' }}>
                <div className="accordion" id="panelSettings">
                    <div className="card">
                        <div className="card-header" id="header-general">
                            <h2 className="mb-0">
                                <button className="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collaps-general" aria-expanded="true" aria-controls="collaps-general">
                                    General Settings
                                </button>
                            </h2>
                        </div>

                        <div id="collaps-general" className="collapse show" aria-labelledby="header-general" data-parent="#panelSettings">
                            <div className="card-body">
                                <div className="row">
                                    <div className="collumn" style={{ width: '50%' }}>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" checked={snapToPoint}
                                                onChange={() => dispatch(SetSnapToPoint(!snapToPoint)) } />
                                            <label className="form-check-label">Snap ToolTip to Data Point</label>
                                        </div>
                                    </div>
                                    <div className="collumn" style={{ width: '50%' }}>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" checked={eventOverlay}
                                                onChange={() => dispatch(SetSinglePlot(!eventOverlay))} />
                                            <label className="form-check-label">Overlay All Events on one Graph</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {props.isOpen ?
                        list.map(item => <PlotCard {...item}/>) : null
                    }
                   
                </div>

            </div>
            <button className={closeButton} onClick={() => props.closeCallback() }>X</button>
        </div>
    );
}

export default SettingsWidget;

export const ColorButton = (props: { label: string, statesetter: (col: string) => void, color: string }) => {
    const [displayColorPicker, setDisplayColorPicker] = React.useState<boolean>(false);

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


    function updateColor (color, event)  {
        props.statesetter(color.hex);
    };

    
        return (
            <div style={{ margin: ' 5px 10px 5px 10px' }}>
                <button className="btn btn-primary" onClick={() => setDisplayColorPicker(!displayColorPicker)} style={{ backgroundColor: props.color }}>{props.label}</button>
                {displayColorPicker ? <div style={popover}>
                    <div style={{ position: 'fixed' }}>
                        <BlockPicker onChangeComplete={updateColor} color={props.color} triangle={"hide"} />
                    </div>
                    {/*<div style={cover} onClick={() => setDisplayColorPicker(false)} />*/}
                </div> : null}
            </div>
        )
    
}

export const UnitSelector = (props: { label: string, setter: (result: OpenSee.IUnitSetting) => void, unit: OpenSee.IUnitSetting }) => {

    
    let entries = props.unit.options.map((option, index) => <a key={"option-" + index} className="dropdown-item"
        onClick={() => {
            props.setter({ ...props.unit, current: index })
        }
        }> {option.label} </a>)

        return (
            <div className="btn-group dropright" style={{ margin: ' 5px 10px 5px 10px' }}>
                <button type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {props.label + " [" + props.unit.options[props.unit.current].short + "]"}
                </button>
                <div className="dropdown-menu">
                    {entries}
                </div>
            </div>
        );    
}

const PlotCard = (props: OpenSee.IGraphProps) => {
    const lineData = useSelector(selectData(props));
    const colors = useSelector(selectColor);
    const units = useSelector(selectUnit);
    const timeUnit = useSelector(selectTimeUnit);

    const dispatch = useDispatch();

    let colorSettings = uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Color)).map((c: OpenSee.Color) => <ColorButton label={GetColorName(c)} color={colors[c]} statesetter={(col) => dispatch(SetColor({ color: c, value: col }))} />);
    let unitSettings = uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Unit)).map((u: OpenSee.Unit) => <UnitSelector label={GetUnitName(u)} unit={units[u]} setter={(unit) => dispatch(SetUnit({ unit: u, value: unit.current }))} />);

    function GetDisplayName() {
        switch (props.DataType) {
            case ('FirstDerivative'):
                return "First Derivative"
            case ('HighPassFilter'):
                return "High Pass Filter"
            case ('LowPassFilter'):
                return "Low Pass Filter"
            case ('ClippedWaveforms'):
                return "Clipped Waveforms"
            case ('OverlappingWave'):
                return "Overlapping Waveform"
            case ('MissingVoltage'):
                return "Missing Voltage"
            case ('Rectifier'):
                return 'Rectifier Output';
            case ('RapidVoltage'):
                return "Rapid Voltage Change"
            case ('RemoveCurrent'):
                return "Remove Current"
            case ('Harmonic'):
                return "Specified Harmonic"
            case ('SymetricComp'):
                return "Symetrical Components"
            case ('FaultDistance'):
                return "Faulkt Distance"
            case ('Restrike'):
                return "Breaker Restrike"
            default:
                return (props.DataType as string)
        }
    }

    function GetColorName(c: OpenSee.Color) {
        return c as string;
    }

    function GetUnitName(c: OpenSee.Unit) {
        return c as string;
    }

    return (<div className="card">
        <div className="card-header" id={"header-" + props.DataType}>
            <h2 className="mb-0">
                <button className="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target={"#collaps-" + props.DataType} aria-expanded="true" aria-controls={"#collaps-" + props.DataType}>
                    {GetDisplayName()} Settings
                    </button>
            </h2>
        </div>

        <div id={"collaps-" + props.DataType} className="collapse" aria-labelledby={"header-" + props.DataType} data-parent="#panelSettings">
            <div className="card-body">
                <div className="row">
                    <div className="collumn" style={{ width: '50%' }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Units:</legend>
                            <UnitSelector label={"Time"} unit={timeUnit} setter={(unit) => dispatch(SetTimeUnit(unit.current))} />
                            {unitSettings}
                        </fieldset>
                    </div>
                </div>
                <div className="row">
                    <div className="collumn" style={{ width: '100%', display: "inline-flex" }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%', display: "inline-flex" }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Colors:</legend>
                            {colorSettings}
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>
    </div>);

}