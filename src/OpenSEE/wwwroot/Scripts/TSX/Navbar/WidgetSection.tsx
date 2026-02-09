//******************************************************************************************************
//  WidgetSection.tsx - Gbtc
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

import { ToolTip } from '@gpa-gemstone/react-forms';
import { BtnDropdown } from '@gpa-gemstone/react-interactive';
import React from "react";
import { OpenSee } from "../global";
import { CorrelatedSags, exportBtn, FFT, lightningData, PhasorClock, ShowPoints, statsIcon, WaveformViews } from '../Graphs/ChartIcons';
import { useAppDispatch } from '../hooks';
import { SetMouseMode } from '../store/settingSlice';
import PlotTable from './PlotTable';

interface IWidgets {
    hover: OpenSee.Hover,
    setHover: (hover: OpenSee.Hover) => void,
    mouseMode: OpenSee.MouseMode,
    OpenDrawers: OpenSee.Drawers,
    navigation: OpenSee.EventNavigation,
    showFFT: boolean,
    lookupInfo: OpenSee.INextBackLookup,
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    exportData: (type: string) => void,
    eventInfo: OpenSee.IEventInfo
}

const WidgetSection = (props: IWidgets) => {
    const dispatch = useAppDispatch();

    const optionList = React.useMemo(() => {
        const optionList = [
            {
                Label: (
                    <a className="dropdown-item" style={{ cursor: 'pointer' }} target="_blank">
                        Export CSV
                    </a>
                ),
                Callback: () => props.exportData('csv')
            },
            {
                Label: (
                    <a className="dropdown-item" style={{ cursor: 'pointer' }} target="_blank">
                        Export PQDS
                    </a>
                ),
                Callback: () => props.exportData('pqds')
            }
        ];

        if (props.showFFT)
            optionList.push({
                Label: (
                    <a className="dropdown-item" style={{ cursor: 'pointer' }} target="_blank">
                        Export FFT
                    </a>
                ),
                Callback: () => props.exportData('fft')
            });
        return optionList;
    }, [props.showFFT, props.exportData]);

    return (
        <>
            <li className="nav-item" style={{ width: 'calc(100% - 909px)', textAlign: 'center' }}>
            </li>
            <li className="nav-item dropdown" style={{ width: '54px', position: 'relative', marginTop: "10px" }}>
                <button type="button"
                    className="btn btn-primary"
                    style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => props.setHover('Waveform')}
                    onMouseLeave={() => props.setHover('None')}
                    data-tooltip={'waveform-btn'}
                    data-toggle="dropdown" data-placement="bottom">
                    <i style={{ fontStyle: "normal", fontSize: "25px" }} >{WaveformViews}</i>
                </button>

                <div className="dropdown-menu"
                    style={{
                        maxHeight: window.innerHeight * 0.75,
                        overflowY: 'auto',
                        padding: '10 5',
                        position: 'absolute',
                        backgroundColor: '#fff',
                        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
                        zIndex: 401,
                        minWidth: '100%'
                    }}>
                    <PlotTable />
                </div>
                <ToolTip Show={props.hover == 'Waveform'} Position={'bottom'} Target={'waveform-btn'}>
                    <p>Waveform Views</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => props.setHover('Show Points')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'points-btn'}
                    data-toggle="tooltip" data-placement="bottom" onClick={() => { props.ToggleDrawer('AccumulatedPoints', !props.OpenDrawers.AccumulatedPoints); }}>
                    < i style={{ fontStyle: "normal", fontSize: "25px" }} >{ShowPoints}</i>
                </button>
                <ToolTip Show={props.hover == 'Show Points'} Position={'bottom'} Target={'points-btn'}>
                    <p>Show Points</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => props.setHover('Clock')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'phasorclock-btn'}
                    data-toggle="tooltip" data-placement="bottom" onClick={() => { props.ToggleDrawer('PolarChart', !props.OpenDrawers.PolarChart); }}>
                    <i style={{ fontStyle: "normal", fontSize: "25px", margin: '3px' }} >{PhasorClock}</i>
                </button>
                <ToolTip Show={props.hover == 'Clock'} Position={'bottom'} Target={'phasorclock-btn'}>
                    <p>Phasor Chart</p>
                </ToolTip>
            </li>
            <li className={"nav-item dropdown"} style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => props.setHover('Stat')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'stats-btn'}
                    data-placement="bottom">
                    < i style={{ fontStyle: "normal", fontSize: "25px" }} >{statsIcon}</i>
                </button>
                <div className="dropdown-menu" style={{ position: "absolute" }}>
                    <a key={"option-scalar"} className="dropdown-item" onClick={() => props.ToggleDrawer('ScalarStats', !props.OpenDrawers.ScalarStats)} style={{ cursor: 'pointer' }}>
                        <i style={{ fontStyle: "normal" }}>Scalar Stats</i>
                    </a>
                    {props.eventInfo?.EventName === "Snapshot" ?
                        <a key={"option-harmonic"} className="dropdown-item" onClick={() => props.ToggleDrawer('ScalarStats', !props.OpenDrawers.HarmonicStats)} style={{ cursor: 'pointer' }}>
                            <i style={{ fontStyle: "normal" }}>Harmonic Stats</i>
                        </a>
                        : null}
                </div>
                <ToolTip Show={props.hover == 'Stat'} Position={'bottom'} Target={'stats-btn'}>
                    <p>Stats</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => props.setHover('Sags')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'sags-btn'}
                    data-toggle="tooltip" data-placement="bottom" onClick={() => { props.ToggleDrawer('CorrelatedSags', !props.OpenDrawers.CorrelatedSags); }}>
                    < i style={{ fontStyle: "normal", fontSize: "25px" }} >{CorrelatedSags}</i>
                </button>
                <ToolTip Show={props.hover == 'Sags'} Position={'bottom'} Target={'sags-btn'}>
                    <p>Correlated Sags</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className={"btn btn-" + (props.showFFT ? "primary" : "secondary")} style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    disabled={!props.showFFT}
                    onMouseEnter={() => props.setHover('FFTTable')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'fftTable-btn'}
                    data-toggle="tooltip" data-placement="bottom" onClick={() => { dispatch(SetMouseMode("fftMove")); props.ToggleDrawer('FFTTable', !props.OpenDrawers.FFTTable) }}>
                    <i style={{ fontStyle: "normal", fontSize: "25px" }} >{FFT}</i>
                </button>
                <ToolTip Show={props.hover == 'FFTTable'} Position={'bottom'} Target={'fftTable-btn'}>
                    <p>FFT Table</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => props.setHover('Lightning')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'lightning-btn'}
                    data-toggle="tooltip" data-placement="bottom" onClick={() => { props.ToggleDrawer('Lightning', !props.OpenDrawers.Lightning); }}>
                    <i style={{ fontStyle: "normal", fontSize: "25px" }} >{lightningData}</i>
                </button>
                <ToolTip Show={props.hover == 'Lightning'} Position={'bottom'} Target={'lightning-btn'}>
                    <p>Lightning Data</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '84px', marginTop: "10px" }}>
                <div style={{ position: 'absolute' }}>
                    <BtnDropdown Label={<i style={{ fontStyle: "normal", fontSize: "24px" }}>{exportBtn}</i>}
                        Callback={() => { }}
                        Size={'sm'}
                        Options={optionList}
                        ShowToolTip={props.hover == "Export"}
                        BtnClass={'btn-primary'}
                        TooltipContent={<p>Export</p>}
                    />
                </div>
            </li>
        </>
    )
}

export default WidgetSection;
