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
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { BtnDropdown } from '@gpa-gemstone/react-interactive';
import { ToolTip } from '@gpa-gemstone/react-forms';
import React from "react";
import About from './About';
import { OpenSee } from "../global";
import { useAppDispatch, useAppSelector } from '../hooks';
import { SelectMouseMode, SetMouseMode, SetZoomMode } from '../Store/settingSlice';
import Navigation from './Navigation';
import { PlotDataStateContext } from '../Context/PlotDataContext';
import { PlotStateStateContext, PlotStateActionContext } from '../Context/PlotStateContext';
import EventContext from '../Context/EventContext';
import { selectFFTEnabled } from '../PlotSelectors';
import { navIconButtonStyle, navIconDropdownButtonClass, navIconDropdownStyle } from './NavStyles';

interface IPlotUtilities {
    OpenDrawers: OpenSee.Drawers,
    showAbout: boolean,
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    setShowAbout: (about: boolean) => void
}

const PlotUtilitiesSection = (props: IPlotUtilities) => {
    const dispatch = useAppDispatch();
    const { plots } = React.useContext(PlotDataStateContext);
    const { meta } = React.useContext(PlotStateStateContext);
    const stateActions = React.useContext(PlotStateActionContext);
    const evt = React.useContext(EventContext);

    const mouseMode = useAppSelector(SelectMouseMode);
    const showFFT = React.useMemo(() => selectFFTEnabled(meta), [meta]);
    const [hover, setHover] = React.useState<string>('None');
    const selectDisabled = !props.OpenDrawers.AccumulatedPoints && !props.OpenDrawers.ToolTipDelta;

    return (
        <>
            <li className="nav-item" style={{ width: '210px', position: "relative", marginTop: "10px" }}>
                <div className="btn-group d-flex" role="group">
                    <BtnDropdown
                        Label={<ReactIcons.MagnifyingGlass />}
                        Callback={() => dispatch(SetMouseMode("zoom"))}
                        Size={'sm'}
                        Options={[
                            {
                                Label: <><ReactIcons.HorizontalResize /> Time</>,
                                Callback: () => { dispatch(SetZoomMode('x')); dispatch(SetMouseMode("zoom")); }
                            },
                            {
                                Label: <><ReactIcons.VeriticalResize /> Value</>,
                                Callback: () => { dispatch(SetZoomMode('y')); dispatch(SetMouseMode("zoom")); }
                            },
                            {
                                Label: <><ReactIcons.MoveArrows /> Rectangle</>,
                                Callback: () => { dispatch(SetZoomMode('xy')); dispatch(SetMouseMode("zoom")); }
                            }
                        ]}
                        BtnClass={'btn-primary ' + navIconDropdownButtonClass + (mouseMode == "zoom" ? " active" : "")}
                        ContainerStyle={navIconDropdownStyle}
                        TooltipContent={<p>Zoom</p>}
                        TooltipLocation={'bottom'}
                        ShowToolTip={true}
                    />

                    <button type="button" className={"btn btn-primary" + (mouseMode == "pan" ? " active" : "")} style={{ ...navIconButtonStyle, padding: '0.195rem' }}
                        onMouseEnter={() => setHover('Pan')}
                        onMouseLeave={() => setHover('None')} data-tooltip={'pan-btn'}
                        onClick={() => dispatch(SetMouseMode("pan"))}>
                        <ReactIcons.PanHand Style={{ strokeWidth: 0.2 }} />
                    </button>
                    <ToolTip Show={hover == 'Pan'} Position={'bottom'} Target={'pan-btn'}>
                        <p>Pan</p>
                    </ToolTip>

                    <button type="button" className={"btn btn-" + (selectDisabled ? "secondary disabled" : "primary") + (mouseMode == "select" ? " active" : "")} style={{ ...navIconButtonStyle, padding: '0.195rem' }}
                        aria-disabled={selectDisabled}
                        onMouseEnter={() => setHover('Select')}
                        onMouseLeave={() => setHover('None')}
                        data-tooltip={'select-btn'}
                        onClick={() => {
                            if (!selectDisabled)
                                dispatch(SetMouseMode("select"));
                        }}
                    >
                        <ReactIcons.FingerSelect />
                    </button>
                    <ToolTip Show={hover == 'Select'} Position={'bottom'} Target={'select-btn'}>
                        <p>Select</p>
                    </ToolTip>

                    <button type="button" className={"btn btn-" + (showFFT ? "primary" : "secondary disabled") + (mouseMode === "fftMove" ? " active" : "")} style={{ ...navIconButtonStyle, padding: '0.195rem' }}
                        onClick={() => {
                            if (showFFT)
                                dispatch(SetMouseMode("fftMove"));
                        }}
                        aria-disabled={!showFFT}
                        onMouseEnter={() => setHover('FFTMove')}
                        onMouseLeave={() => setHover('None')}
                        data-tooltip={'fftMove-btn'}
                    >
                        <ReactIcons.BarChartPanHand />
                    </button>
                    <ToolTip Show={hover == 'FFTMove'} Position={'bottom'} Target={'fftMove-btn'}>
                        <p>FFT Move</p>
                    </ToolTip>

                    <button className="btn btn-primary" style={{ ...navIconButtonStyle, borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem", padding: '0.195rem' }}
                        onMouseEnter={() => setHover('Reset Zoom')}
                        onMouseLeave={() => setHover('None')}
                        data-tooltip={'reset-btn'}
                        onClick={() => stateActions.ResetZoom(
                            new Date(evt.Context.EventInfo?.EventDate + "Z").getTime(),
                            new Date(evt.Context.EventInfo?.EventEnd + "Z").getTime(),
                            plots
                        )}
                    >
                        <ReactIcons.Refresh />
                    </button>
                    <ToolTip Show={hover == 'Reset Zoom'} Position={'bottom'} Target={'reset-btn'}>
                        <p>Reset Zoom</p>
                    </ToolTip>
                </div>
            </li>

            <li className="nav-item" style={{ width: '74px', marginTop: "10px", marginLeft: "10px" }}>
                <button className="btn btn-primary" style={{ ...navIconButtonStyle, borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Settings')}
                    onMouseLeave={() => setHover('None')}
                    data-tooltip={'settings-btn'}
                    onClick={() => props.ToggleDrawer('Settings', !props.OpenDrawers.Settings)}
                >
                    <ReactIcons.Settings />
                </button>
                <ToolTip Show={hover == 'Settings'} Position={'bottom'} Target={'settings-btn'}>
                    <p>Settings</p>
                </ToolTip>
            </li>

            <Navigation />

            <li className="nav-item" style={{ width: '74px', marginTop: "10px" }}>
                <button className="btn btn-primary" style={{ ...navIconButtonStyle, borderRadius: "4rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Help')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'help-btn'}
                    onClick={() => props.setShowAbout(true)}
                >
                    <ReactIcons.QuestionMark />
                </button>
                <ToolTip Show={hover == 'Help'} Position={'bottom'} Target={'help-btn'}>
                    <p>Help</p>
                </ToolTip>
                <About isOpen={props.showAbout} closeCallback={() => props.setShowAbout(false)} />
            </li>
        </>
    );
};

export default PlotUtilitiesSection;
