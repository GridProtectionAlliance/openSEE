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
import { WidgetWindow } from './Common';
import { OpenSee } from '../global';
import { useSelector, useDispatch } from 'react-redux';
import { selectData, selectGraphTypes, SetTimeUnit, SetUnit } from '../store/dataSlice';
import { selectColor, SetColor, selectSnap, selectUnit, selectTimeUnit, SetSnapToPoint, selectEventOverlay, SetSinglePlot, selectdefaultTraces, SetDefaultTrace, selectVTypeDefault, SetDefaultVType } from '../store/settingSlice';
import { GetDisplayLabel } from '../Graphs/Utilities';
import { defaultSettings } from '../defaults';

interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
    position: [number, number]
    setPosition: (t: number, l: number) => void
}

const SettingsWidget = (props: Iprops) => {
    const list = useSelector(selectGraphTypes);
    const snapToPoint = useSelector(selectSnap);
    const eventOverlay = useSelector(selectEventOverlay);
    const defaultTraces = useSelector(selectdefaultTraces);
    const defaultVtype = useSelector(selectVTypeDefault);

    const dispatch = useDispatch();
    const [scrollOffset, setScrollOffset] = React.useState<number>(0);

    
    React.useEffect(() => {
        if (!props.isOpen)
            return () => { }

        const handleScroll = () => {
            let offset = document.getElementById("settingScrollContainer").scrollTop;
                setScrollOffset(offset);
        }
        document.getElementById("settingScrollContainer").addEventListener("scroll", handleScroll, { passive: true });
        return () => { if (document.getElementById("settingScrollContainer") != null) document.getElementById("settingScrollContainer").removeEventListener("scroll", handleScroll); }
    }, [props])
  

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={600} width={516} position={props.position} setPosition={props.setPosition} >
            <div id="settingScrollContainer" style={{ width: '510px', height: '575px', zIndex: 1001, overflowY: 'scroll', overflowX: 'hidden' }}>
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
                                    <div className="col" style={{ width: '50%' }}>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" checked={snapToPoint}
                                                onChange={() => dispatch(SetSnapToPoint(!snapToPoint)) } />
                                            <label className="form-check-label">Snap ToolTip to Data Point</label>
                                        </div>
                                    </div>
                                    <div className="col" style={{ width: '50%' }}>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" checked={eventOverlay}
                                                onChange={() => dispatch(SetSinglePlot(!eventOverlay))} />
                                            <label className="form-check-label">Display all Events on single Graph for Compare Overlapping Events</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                    <fieldset className="border" style={{ padding: '10px', height: '100%', display: "block", width: '100%' }}>
                                            <legend className="w-auto" style={{ fontSize: 'large' }}>Default Traces (on Loading):</legend>
                                        <div className="row">
                                            <div className="col" style={{ width: '25%' }}>
                                                <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" checked={defaultTraces.W}
                                                            onChange={() => dispatch(SetDefaultTrace({ ...defaultTraces, W: !defaultTraces.W }))} />
                                                    <label className="form-check-label">WaveForm</label>
                                                </div>
                                            </div>
                                            <div className="col" style={{ width: '25%' }}>
                                                <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" checked={defaultTraces.Pk}
                                                            onChange={() => dispatch(SetDefaultTrace({ ...defaultTraces, Pk: !defaultTraces.Pk }))} />
                                                    <label className="form-check-label">Peak</label>
                                                </div>
                                            </div>
                                            <div className="col" style={{ width: '25%' }}>
                                                <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" checked={defaultTraces.RMS}
                                                            onChange={() => dispatch(SetDefaultTrace({ ...defaultTraces, RMS: ! defaultTraces.RMS }))} />
                                                    <label className="form-check-label">RMS</label>
                                                </div>
                                            </div>
                                            <div className="col" style={{ width: '25%' }}>
                                                <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" checked={defaultTraces.Ph}
                                                            onChange={() => dispatch(SetDefaultTrace({ ...defaultTraces, Ph: !defaultTraces.Ph }))} />
                                                    <label className="form-check-label">Phase</label>
                                                </div>
                                                </div>
                                                
                                            </div>
                                            <div className="row">
                                                <div className="col" style={{ width: '100%', paddingTop: 10 }}>
                                                    <div className="form-check form-check-inline">
                                                        <input className="form-check-input" type="radio" checked={defaultVtype == 'L-L'} onChange={() => {
                                                            if (defaultVtype == 'L-N')
                                                                dispatch(SetDefaultVType('L-L'))
                                                        }} />
                                                            <label className="form-check-label" >Line to Line</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <input className="form-check-input" type="radio" checked={defaultVtype == 'L-N'} onChange={() => {
                                                            if (defaultVtype == 'L-L')
                                                                dispatch(SetDefaultVType('L-N'))
                                                        }}/>
                                                        <label className="form-check-label" >Line to Neutral</label>
                                                    </div>
                                                 </div>      
                                            </div>
                                    </fieldset>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {props.isOpen ?
                        list.map((item, index) => <PlotCard key={index} scrollOffset={scrollOffset} {...item} />) : null
                    }
                   
                </div>
            </div>
        </WidgetWindow>
    );
}

export default SettingsWidget;

export const ColorButton = (props: { label: string, statesetter: (col: string) => void, color: string, scrollOffset: number }) => {
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
        setDisplayColorPicker(false)
    };

        return (
            <div style={{ margin: ' 5px 10px 5px 10px' }}>
                <button className="btn btn-primary" onClick={() => setDisplayColorPicker(!displayColorPicker)} style={{ backgroundColor: props.color }}>{props.label}</button>
                {displayColorPicker ? <div style={popover}>
                    <div style={{ position: 'fixed', transform: `translate(0px,-${props.scrollOffset}px)` }}>
                        <BlockPicker onChangeComplete={updateColor} color={props.color} triangle={"hide"} colors={defaultSettings.ColorSelection} />
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

interface ICardProps extends OpenSee.IGraphProps { scrollOffset: number }

const PlotCard = (props: ICardProps) => {

    const SelectData = React.useMemo(selectData, []);
    const lineData = useSelector((state) => SelectData(state, props));

    const colors = useSelector(selectColor);
    const units = useSelector(selectUnit);
    const timeUnit = useSelector(selectTimeUnit);

    const dispatch = useDispatch();

    let colorSettings: OpenSee.Color[] = uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Color as OpenSee.Color));
    let unitSettings: OpenSee.Unit[] = uniq(lineData.map((item: OpenSee.iD3DataSeries) => item.Unit));


    function GetColorName(c: OpenSee.Color) {
        return c as string;
    }

    function GetUnitName(c: OpenSee.Unit) {
        return c as string;
    }

    let unitCol1: OpenSee.Unit[] = unitSettings.filter((item, index) => index % 2 == 0);
    let unitCol2: OpenSee.Unit[] = unitSettings.filter((item, index) => index % 2 == 1);

    let colCol1: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 0);
    let colCol2: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 1);
    let colCol3: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 2);
    let colCol4: OpenSee.Color[] = colorSettings.filter((item, index) => index % 4 == 3);

    return (<div className="card">
        <div className="card-header" id={"header-" + props.DataType}>
            <h2 className="mb-0">
                <button className="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target={"#collaps-" + props.DataType} aria-expanded="true" aria-controls={"#collaps-" + props.DataType}>
                    {GetDisplayLabel(props.DataType)} Settings
                    </button>
            </h2>
        </div>

        <div id={"collaps-" + props.DataType} className="collapse" aria-labelledby={"header-" + props.DataType} data-parent="#panelSettings">
            <div className="card-body">
                <div className="row">
                    <div className="collumn" style={{ width: '100%' }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Units:</legend>
                            <div className="row">
                                <div className="col">
                                    {props.DataType != 'FFT' ? < UnitSelector label={"Time"} unit={timeUnit} setter={(unit) => dispatch(SetTimeUnit(unit.current))} /> : null}
                                    {unitCol1.map((item, index) => <UnitSelector key={index} label={GetUnitName(item)} unit={units[item]} setter={(unit) => dispatch(SetUnit({ unit: item, value: unit.current }))} />)}
                                </div>
                                <div className="col">
                                    {unitCol2.map((item, index) => <UnitSelector key={index} label={GetUnitName(item)} unit={units[item]} setter={(unit) => dispatch(SetUnit({ unit: item, value: unit.current }))} />)}
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>
                {colorSettings.length > 0 ? < div className="row">
                    <div className="collumn" style={{ width: '100%', display: "inline-flex" }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%', display: "inline-flex" }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Colors:</legend>
                            <div className="row">
                                <div className="col">
                                    {colCol1.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={GetColorName(c)}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                            />)}
                                </div>
                                <div className="col">
                                    {colCol2.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={GetColorName(c)}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>
                                <div className="col">
                                    {colCol3.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={GetColorName(c)}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>
                                <div className="col">
                                    {colCol4.map((c: OpenSee.Color, i: number) =>
                                        <ColorButton
                                            key={i}
                                            label={GetColorName(c)}
                                            color={colors[c]}
                                            statesetter={(col) => dispatch(SetColor({ color: c, value: col }))}
                                            scrollOffset={props.scrollOffset}
                                        />)}
                                </div>

                            </div>
                        </fieldset>
                    </div> 
                </div> : null}
            </div>
        </div>
    </div>);

}
