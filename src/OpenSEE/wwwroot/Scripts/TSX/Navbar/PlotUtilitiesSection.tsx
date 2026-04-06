//******************************************************************************************************
//  PlotUtilitiesSection.tsx - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  02/09/2026 - Gabriel Santos
//       Moved code to here from OpenSEENavbar.tsx
//
//******************************************************************************************************

import { Point } from '@gpa-gemstone/gpa-symbols';
import { BtnDropdown } from '@gpa-gemstone/react-interactive';
import { ToolTip } from '@gpa-gemstone/react-forms';
import React from "react";
import About from '../Components/About';
import { OpenSee } from "../global";
import { FFT, Help, Pan, Reset, Settings, Square, TimeRect, ValueRect, Zoom } from '../Graphs/ChartIcons';
import { useAppDispatch, useAppSelector } from '../hooks';
import { SelectMouseMode, SetMouseMode, SetZoomMode } from '../store/settingSlice';
import Navigation from './Navigation';
import { DataContext, DataFunctionContext } from '../Context/DataContext';
import EventContext from '../Context/EventContext';

interface IPlotUtilities {
    OpenDrawers: OpenSee.Drawers,
    showAbout: boolean,
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    setShowAbout: (about: boolean) => void
}

const PlotUtilitiesSection = (props: IPlotUtilities) => {
    const dispatch = useAppDispatch();

    const data = React.useContext(DataContext);
    const evt = React.useContext(EventContext);
    const dataDispatch = React.useContext(DataFunctionContext);

    const mouseMode = useAppSelector(SelectMouseMode);
    const showFFT = data.Selector.current.SelectFFTEnabled();

    const [hover, setHover] = React.useState<string>('None');

    return (
        <>
            <li className="nav-item" style={{ width: '210px', position: "relative", marginTop: "10px" }}>
                <div className="btn-group d-flex" role="group">
                    {/*Zoom*/}
                    <BtnDropdown
                        Label={<i style={{ fontStyle: "normal", fontSize: "25px" }}>{Zoom}</i>}
                        Callback={() => dispatch(SetMouseMode("zoom"))}
                        Size={'sm'}
                        Options={[
                            {
                                Label: <><i style={{ fontStyle: "normal" }}>{TimeRect}</i> Time</>,
                                Callback: () => { dispatch(SetZoomMode('x')); dispatch(SetMouseMode("zoom")); }
                            },
                            {
                                Label: <><i style={{ fontStyle: "normal" }}>{ValueRect}</i> Value</>,
                                Callback: () => { dispatch(SetZoomMode('y')); dispatch(SetMouseMode("zoom")); }
                            },
                            {
                                Label: <><i style={{ fontStyle: "normal" }}>{Square}</i> Rectangle</>,
                                Callback: () => { dispatch(SetZoomMode('xy')); dispatch(SetMouseMode("zoom")); }
                            }
                        ]}
                        BtnClass={'btn-primary' + (mouseMode == "zoom" ? " active" : "")}
                        TooltipContent={<p>Zoom</p>}
                        TooltipLocation={'bottom'}
                        ShowToolTip={true}
                    />

                    {/*Pan*/}
                    <button type="button" className={"btn btn-primary" + (mouseMode == "pan" ? " active" : "")} style={{ padding: '0.195rem' }}
                        onMouseEnter={() => setHover('Pan')}
                        onMouseLeave={() => setHover('None')} data-tooltip={'pan-btn'}
                        data-toggle="tooltip" data-placement="bottom" onClick={() => dispatch(SetMouseMode("pan"))}>
                        <i style={{ fontStyle: "normal", fontSize: "25px" }} >{Pan}</i>
                    </button>
                    <ToolTip Show={hover == 'Pan'} Position={'bottom'} Target={'pan-btn'}>
                        <p>Pan</p>
                    </ToolTip>

                    { /*Select*/}
                    <button type="button" className={"btn btn-" + (props.OpenDrawers.AccumulatedPoints || props.OpenDrawers.ToolTipDelta ? "primary" : "secondary") + (mouseMode == "select" ? " active" : "")} style={{ padding: '0.195rem' }}
                        disabled={!props.OpenDrawers.AccumulatedPoints && !props.OpenDrawers.ToolTipDelta}
                        onMouseEnter={() => setHover('Select')}
                        onMouseLeave={() => setHover('None')} data-tooltip={'select-btn'}
                        data-toggle="tooltip" data-placement="bottom" onClick={() => { dispatch(SetMouseMode("select")); }}>
                        <i style={{ fontStyle: "normal", fontSize: "25px" }} >{Point}</i>
                    </button>
                    <ToolTip Show={hover == 'Select'} Position={'bottom'} Target={'select-btn'}>
                        <p>Select</p>
                    </ToolTip>

                    {/*FFT Move*/}
                    <button type="button" className={"btn btn-" + (showFFT ? "primary" : "secondary") + (mouseMode === "fftMove" ? " active" : "")} style={{ padding: '0.195rem' }}
                        onClick={() => dispatch(SetMouseMode("fftMove"))}
                        disabled={!showFFT}
                        onMouseEnter={() => setHover('FFTMove')}
                        onMouseLeave={() => setHover('None')} data-tooltip={'fftMove-btn'}
                        data-toggle="tooltip" data-placement="bottom">
                        <i style={{ fontStyle: "normal", fontSize: "20px" }}>{FFT}</i>
                    </button>
                    <ToolTip Show={hover == 'FFTMove'} Position={'bottom'} Target={'fftMove-btn'}>
                        <p>FFT Move</p>
                    </ToolTip>

                    {/*reset*/}
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.195rem' }}
                        onMouseEnter={() => setHover('Reset Zoom')}
                        onMouseLeave={() => setHover('None')}
                        data-tooltip={'reset-btn'}
                        data-toggle="tooltip"
                        data-placement="bottom"
                        onClick={() => dataDispatch.Dispatch.current.ResetZoom(new Date(evt.Context.EventInfo?.EventDate + "Z").getTime(), new Date(evt.Context.EventInfo?.EventEnd + "Z").getTime())}
                    >
                        <i style={{ fontStyle: "normal", fontSize: "21px" }}>{Reset}</i>
                    </button>
                    <ToolTip Show={hover == 'Reset Zoom'} Position={'bottom'} Target={'reset-btn'}>
                        <p>Reset Zoom</p>
                    </ToolTip>

                </div>
            </li>

            <li className="nav-item" style={{ width: '74px', marginTop: "10px" }}>
                <button className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Settings')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'settings-btn'} data-toggle="tooltip" data-placement="bottom"
                    onClick={() => { props.ToggleDrawer('Settings', !props.OpenDrawers.Settings); }}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px" }}>{Settings}</i>
                </button>
                <ToolTip Show={hover == 'Settings'} Position={'bottom'} Target={'settings-btn'}>
                    <p>Settings</p>
                </ToolTip>
            </li>

            <Navigation />

            <li className="nav-item" style={{ width: '74px', marginTop: "10px" }}>
                <button className="btn btn-primary" style={{ borderRadius: "4rem", padding: "0.495rem" }}
                    onMouseEnter={() => setHover('Help')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'help-btn'}
                    data-toggle="tooltip" data-placement="bottom" onClick={() => props.setShowAbout(true)}>
                    <i style={{ fontStyle: "normal", fontSize: "20px" }}>{Help}</i>
                </button>
                <ToolTip Show={hover == 'Help'} Position={'bottom'} Target={'help-btn'}>
                    <p>Help</p>
                </ToolTip>
                <About isOpen={props.showAbout} closeCallback={() => props.setShowAbout(false)} />

            </li>
        </>
    )
}

export default PlotUtilitiesSection;
