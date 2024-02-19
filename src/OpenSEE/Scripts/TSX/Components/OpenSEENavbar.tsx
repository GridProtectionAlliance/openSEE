//******************************************************************************************************
//  OpenSEENavbar.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  03/14/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { OpenSee } from '../global';
import { clone } from 'lodash';
import { ResetZoom, SelectEventIDs, SelectFFTLimits, SelectDisplayed, AddPlot, RemovePlot, SelectFFTEnabled, SelectAnalytics } from '../store/dataSlice';
import { SelectEventInfo, SelectLookupInfo } from '../store/eventInfoSlice'
import { SelectCycles, SelectHarmonic, SelectHPF, SelectLPF, SelectTRC } from '../store/analyticSlice';
import { SelectNavigation, SetNavigation, SetMouseMode, SetZoomMode, SelectMouseMode } from '../store/settingSlice'

import { WaveformViews, PhasorClock, statsIcon, lightningData, exportBtn, Zoom, Pan, FFT, Reset, Square, ValueRect, TimeRect, Settings, Help, ShowPoints, CorrelatedSags } from '../Graphs/ChartIcons';
import { Point } from '@gpa-gemstone/gpa-symbols'
import { ToolTip } from '@gpa-gemstone/react-interactive';
import { useAppDispatch, useAppSelector } from '../hooks';
import moment from "moment"

import HarmonicStatsWidget from '../jQueryUI Widgets/HarmonicStats'; 
import About from './About'; 


declare var homePath: string;
declare var eventStartTime: string;
declare var eventEndTime: string;

interface IProps {
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    OpenDrawers: OpenSee.Drawers
}

const OpenSeeNavBar = (props: IProps) => {
    const dispatch = useAppDispatch()
    const mouseMode = useAppSelector(SelectMouseMode);
    const eventInfo = useAppSelector(SelectEventInfo);
    const lookupInfo = useAppSelector(SelectLookupInfo);
    const showFFT = useAppSelector(SelectFFTEnabled);

    const analytics = useAppSelector(SelectAnalytics);

    const navigation = useAppSelector(SelectNavigation);
    const showPlots = useAppSelector(SelectDisplayed);
    const harmonic = useAppSelector(SelectHarmonic);
    const trc = useAppSelector(SelectTRC);
    const lpf = useAppSelector(SelectLPF);
    const hpf = useAppSelector(SelectHPF);
    const cycles = useAppSelector(SelectCycles);
    const fftTime = useAppSelector(SelectFFTLimits);

    const [showAbout, setShowAbout] = React.useState<boolean>(false); 

    const [positionHarmonicStats, setPositionHarmonicStats] = React.useState<[number, number]>([0, 0]);
    const [hover, setHover] = React.useState<('None' | 'Waveform' | 'Show Points' | 'Polar Chart' | 'Stat' | 'Sags' | 'Lightning' | 'Export' | 'Tooltip' | 'Clock' | 'Zoom Mode' | 'Pan' | 'FFTTable' | 'FFTMove' | 'Reset Zoom' | 'Settings' | 'NavLeft' | 'NavRight' | 'Help' | 'Meter' | 'Station' | 'Asset' | 'EType' | 'EInception' | 'Select')>('None')
    

    React.useEffect(() => {
        if (props.OpenDrawers.AccumulatedPoints) {
            let oldMode = clone(mouseMode);
            dispatch(SetMouseMode('select'))
            return () => {
                dispatch(SetMouseMode(oldMode))
            }
        }
        return () => { }

    }, [props.OpenDrawers.AccumulatedPoints])

    function exportData(type) {
        window.open(homePath + `CSVDownload.ashx?type=${type}&eventID=${eventID}` +
            `${showPlots.Voltage != undefined ? `&displayVolt=${showPlots.Voltage}` : ``}` +
            `${showPlots.Current != undefined ? `&displayCur=${showPlots.Current}` : ``}` +
            `${showPlots.TripCoil != undefined ? `&displayTCE=${showPlots.TripCoil}` : ``}` +
            `${showPlots.Digitals != undefined ? `&breakerdigitals=${showPlots.Digitals}` : ``}` +
            `${showPlots.Analogs != undefined ? `&displayAnalogs=${showPlots.Analogs}` : ``}` +
            `${`&displayAnalytics=${analytics}`}` +
            `${`&lpfOrder=${lpf}`}` +
            `${`&hpfOrder=${hpf}`}` +
            `${`&Trc=${trc}`}` +
            `${`&harmonic=${harmonic}`}` +
            `${type == 'fft' ? `&startDate=${fftTime[0]}` : ``}` +
            `${type == 'fft' ? `&cycles=${cycles}` : ``}` +
            `&Meter=${eventInfo.MeterName}` +
            `&EventType=${eventInfo.EventName}`
        );
    }

            return (
                <>
            <div className="d-none d-xl-block col-xl-5">
                <ul className="navbar-nav navbar-expand">
                        <li className="nav-item" onMouseEnter={() => setHover('Meter')} onMouseLeave={() => setHover('None')} data-tooltip={'meter'} data-toggle="tooltip" data-placement="bottom"
                            style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Meter:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}> {eventInfo?.MeterName?.split(" ")[0]}</div>
                        <ToolTip Show={hover == 'Meter'} Position={'bottom'} Target={'meter'} Theme={'dark'} Zindex={9999}>
                            <p>{eventInfo?.MeterName}</p>
                            </ToolTip>
                        </li>
                    <li className="nav-item" onMouseEnter={() => setHover('Station')} onMouseLeave={() => setHover('None')} data-tooltip={'station'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Station:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{eventInfo?.StationName}</div>
                        <ToolTip Show={hover == 'Station'} Position={'bottom'} Target={'station'} Theme={'dark'} Zindex={9999}>
                                <p>{eventInfo?.StationName}</p>
                            </ToolTip>
                        </li>
                    <li className="nav-item" onMouseEnter={() => setHover('Asset')} onMouseLeave={() => setHover('None')} data-tooltip={'asset'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Asset:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{eventInfo?.AssetName?.split(" ")[0]}</div>
                        <ToolTip Show={hover == 'Asset'} Position={'bottom'} Target={'asset'} Theme={'dark'} Zindex={9999}>
                            <p>{eventInfo?.AssetName}</p>
                            </ToolTip>
                        </li>
                    <li className="nav-item" onMouseEnter={() => setHover('EType')} onMouseLeave={() => setHover('None')} data-tooltip={'etype'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '15px', paddingRight: '15px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Type:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{eventInfo?.EventName}</div>
                        <ToolTip Show={hover == 'EType'} Position={'bottom'} Target={'etype'} Theme={'dark'} Zindex={9999}>
                                <p>{eventInfo?.EventName}</p>
                            </ToolTip>
                        </li>
                    <li className="nav-item" onMouseEnter={() => setHover('EInception')} onMouseLeave={() => setHover('None')} data-tooltip={'einception'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '15px', paddingRight: '15px', minWidth: "60px", marginRight: "10px" }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Inception: </div>
                        <div style={{ textAlign: 'center', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{moment(eventInfo?.EventDate).format('YYYY-MM-DD HH:mm:ss')}</div>
                        <ToolTip Show={hover == 'EInception'} Position={'bottom'} Target={'einception'} Theme={'dark'} Zindex={9999}>
                                <p>{moment(eventInfo?.EventDate).format('YYYY-MM-DD HH:mm:ss')}</p>
                            </ToolTip>
                        </li>
                    </ul>
            </div>
            <div className="col-sm-10 col-xl-6">
                <ul className="navbar-nav navbar-expand">
                        <li className="nav-item" style={{ width: (analytic == 'FFT' ? 'calc(100% - 954px)' : 'calc(100% - 909px)'), textAlign: 'center' }}>
                        </li>
                        <li className="nav-item dropdown" style={{ width: '54px', position: 'relative', marginTop: "10px" }}>
                            <button type="button"
                                className="btn btn-primary"
                                style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                                onMouseEnter={() => setHover('Waveform')}
                                onMouseLeave={() => setHover('None')}
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
                        <PlotTable/>
                            </div>
                            <ToolTip Show={hover == 'Waveform'} Position={'bottom'} Target={'waveform-btn'} Theme={'dark'}> 
                                <p>Waveform Views</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                        <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                            onMouseEnter={() => setHover('Show Points')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'points-btn'}
                            data-toggle="tooltip" data-placement="bottom" onClick={() => { props.ToggleDrawer('AccumulatedPoints', !props.OpenDrawers.AccumulatedPoints); }}>
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{ShowPoints}</i>
                            </button>
                            <ToolTip Show={hover == 'Show Points'} Position={'bottom'} Target={'points-btn'} Theme={'dark'}>
                                <p>Show Points</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                        <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                            onMouseEnter={() => setHover('Clock')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'phasorclock-btn'}
                            data-toggle="tooltip" data-placement="bottom" onClick={() => { props.ToggleDrawer('PolarChart', !props.OpenDrawers.PolarChart); }}>
                            <i style={{ fontStyle: "normal", fontSize: "25px", margin: '3px' }} >{PhasorClock}</i>
                            </button>
                            <ToolTip Show={hover == 'Clock'} Position={'bottom'} Target={'phasorclock-btn'} Theme={'dark'}>
                                <p>Phasor Chart</p>
                            </ToolTip>
                        </li>
                    <li className={"nav-item dropdown" } style={{ width: '54px', marginTop: "10px" }}>
                        <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                            onMouseEnter={() => setHover('Stat')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'stats-btn'}
                            data-placement="bottom">
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{statsIcon}</i>
                            </button>
                        <div className="dropdown-menu" style={{ position: "absolute" }}>
                            <a key={"option-scalar"} className="dropdown-item" onClick={() => props.ToggleDrawer('ScalarStats', !props.OpenDrawers.ScalarStats)}>
                                <i style={{ fontStyle: "normal" }}>Scalar Stats</i>
                            </a>
                            {eventInfo?.EventName === "Snapshot" ?
                                <a key={"option-harmonic"} className="dropdown-item" onClick={() => props.ToggleDrawer('ScalarStats', !props.OpenDrawers.HarmonicStats)}>
                                    <i style={{ fontStyle: "normal" }}>Harmonic Stats</i>
                                </a>
                                : null}
                        </div>
                            <ToolTip Show={hover == 'Stat'} Position={'bottom'} Target={'stats-btn'} Theme={'dark'}>
                                <p>Stats</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                        <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                            onMouseEnter={() => setHover('Sags')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'sags-btn'}
                            data-toggle="tooltip" data-placement="bottom" onClick={() => { props.ToggleDrawer('CorrelatedSags', !props.OpenDrawers.CorrelatedSags); }}>
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{CorrelatedSags}</i>
                            </button>
                            <ToolTip Show={hover == 'Sags'} Position={'bottom'} Target={'sags-btn'} Theme={'dark'}>
                                <p>Correlated Sags</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                        <button type="button" className={"btn btn-" + (showFFT ? "primary" : "secondary")} style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                            disabled={!showFFT}
                            onMouseEnter={() => setHover('FFTTable')}
                            onMouseLeave={() => setHover('None')} data-tooltip={'fftTable-btn'}
                            data-toggle="tooltip" data-placement="bottom" onClick={() => { dispatch(SetMouseMode("fftMove")); props.ToggleDrawer('FFTTable', !props.OpenDrawers.FFTTable) }}>
                            <i style={{ fontStyle: "normal", fontSize: "25px" }} >{FFT}</i>
                        </button>
                        <ToolTip Show={hover == 'FFTTable'} Position={'bottom'} Target={'fftTable-btn'} Theme={'dark'}>
                            <p>FFT Table</p>
                        </ToolTip>
                    </li>

                    <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                        <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                            onMouseEnter={() => setHover('Lightning')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'lightning-btn'}
                            data-toggle="tooltip" data-placement="bottom" onClick={() => { props.ToggleDrawer('Lightning', !props.OpenDrawers.Lightning); }}>
                            <i style={{ fontStyle: "normal", fontSize: "25px" }} >{lightningData}</i>
                            </button>
                            <ToolTip Show={hover == 'Lightning'} Position={'bottom'} Target={'lightning-btn'} Theme={'dark'}>
                            <p>Lightning Data</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item dropdown" style={{ width: '84px', position: "relative", marginTop: "10px" }}>
                        <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                            onMouseEnter={() => setHover('Export')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'export-btn'}
                                 data-placement="bottom">
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{exportBtn}</i>
                            </button>
                        <div className="dropdown-menu" style={{ position: "absolute" }}>
                                <a className="dropdown-item" onClick={() => { exportData('csv') }}>
                                    Export CSV
                                </a>
                                <a className="dropdown-item" onClick={() => { exportData('pqds') }}>
                                    Export PQDS
                                </a>
                            </div>
                            <ToolTip Show={hover == 'Export'} Position={'bottom'} Target={'export-btn'} Theme={'dark'}>
                                <p>Export</p>
                            </ToolTip>
                        </li>

                    <li className="nav-item" style={{ width: '210px', position: "relative", marginTop: "10px" }}>
                        <div className="btn-group d-flex" role="group">
                            {/*Zoom*/}
                            <button type="button" className={"btn btn-primary" + (mouseMode == "zoom" ? " active" : "")} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ padding: '0.195rem' }}
                                onMouseEnter={() => setHover('Zoom Mode')} onMouseLeave={() => setHover('None')} data-tooltip={'zoom-btn'}
                                data-placement="bottom" onClick={() => dispatch(SetMouseMode("zoom"))}>
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{Zoom}</i>
                            </button>
                            <div className="dropdown-menu" style={{ position: "absolute" }}>
                                <a key={"option-x"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('x'))}>
                                    <i style={{ fontStyle: "normal" }}>{TimeRect}</i> Time
                                </a>
                                <a key={"option-y"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('y'))}>
                                    <i style={{ fontStyle: "normal" }}>{ValueRect}</i> Value
                                </a>
                                <a key={"option-xy"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('xy'))}>
                                    <i style={{ fontStyle: "normal" }}>{Square}</i> Rectangle
                                </a>
                            </div>

                            <ToolTip Show={hover == 'Zoom Mode'} Position={'bottom'} Target={'zoom-btn'} Theme={'dark'}>
                                <p>Zoom</p>
                            </ToolTip>            

                                {/*Pan*/}
                            <button type="button" className={"btn btn-primary" + (mouseMode == "pan" ? " active" : "")} style={{ padding: '0.195rem' }}
                                onMouseEnter={() => setHover('Pan')}
                                    onMouseLeave={() => setHover('None')} data-tooltip={'pan-btn'}
                                    data-toggle="tooltip" data-placement="bottom" onClick={() => dispatch(SetMouseMode("pan"))}>
                                    <i style={{ fontStyle: "normal", fontSize: "25px" }} >{Pan}</i>
                                </button>
                                <ToolTip Show={hover == 'Pan'} Position={'bottom'} Target={'pan-btn'} Theme={'dark'}>
                                    <p>Pan</p>
                                </ToolTip>

                            { /*Select*/}
                            <button type="button" className={"btn btn-" + (props.OpenDrawers.AccumulatedPoints && props.OpenDrawers.ToolTipDelta ? "primary" : "secondary") + (mouseMode == "select" ? " active" : "")} style={{ padding: '0.195rem' }}
                                disabled={!props.OpenDrawers.AccumulatedPoints && !props.OpenDrawers.ToolTipDelta}
                                onMouseEnter={() => setHover('Select')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'select-btn'}
                                data-toggle="tooltip" data-placement="bottom" onClick={() => { dispatch(SetMouseMode("select")); }}>
                                <i style={{ fontStyle: "normal", fontSize: "25px" }} >{Point}</i>
                            </button>
                            <ToolTip Show={hover == 'Select'} Position={'bottom'} Target={'select-btn'} Theme={'dark'}>
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
                            <ToolTip Show={hover == 'FFTMove'} Position={'bottom'} Target={'fftMove-btn'} Theme={'dark'}>
                                <p>FFT Move</p>
                                </ToolTip>

                                {/*reset*/}
                            <button className="btn btn-primary" style={{ padding: '0.195rem' }}
                                onMouseEnter={() => setHover('Reset Zoom')} onMouseLeave={() => setHover('None')} data-tooltip={'reset-btn'} data-toggle="tooltip" data-placement="bottom" onClick={() => dispatch(ResetZoom({ start: new Date(eventStartTime + "Z").getTime(), end: new Date(eventEndTime + "Z").getTime() }))}>
                                <i style={{ fontStyle: "normal", fontSize: "21px" }}>{Reset}</i>
                                </button>
                                <ToolTip Show={hover == 'Reset Zoom'} Position={'bottom'} Target={'reset-btn'} Theme={'dark'}>
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
                            <ToolTip Show={hover == 'Settings'} Position={'bottom'} Target={'settings-btn'} Theme={'dark'}>
                                <p>Settings</p>
                            </ToolTip>
                        </li>

                    {/*navigation*/}
                    {lookupInfo ?
                        <li className="nav-item" style={{ width: '210px', marginTop: "10px", minWidth: '155px' }}>
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                    <ToolTip Show={hover == 'NavLeft'} Position={'bottom'} Target={'back-btn'} Theme={'dark'}>
                                        <p>Navigate to Previous Event in the {navigation}</p>
                                        {navigation === "system" && (<p style={{ textAlign: "center" }}>({(lookupInfo.System.m_Item1 != null ? lookupInfo.System.m_Item1.StartTime : '')})</p>)}
                                        {navigation === "station" && (<p style={{ textAlign: "center" }}>({(lookupInfo.Station.m_Item1 != null ? lookupInfo.Station.m_Item1.StartTime : '')})</p>)}
                                        {navigation === "meter" && (<p style={{ textAlign: "center" }}>({(lookupInfo.Meter.m_Item1 != null ? lookupInfo.Meter.m_Item1.StartTime : '')})</p>)}
                                        {navigation === "asset" && (<p style={{ textAlign: "center" }}>({(lookupInfo.System.m_Item1 != null ? lookupInfo.System.m_Item1.StartTime : '')})</p>)}
                                    </ToolTip>
                                    {(navigation == "system" ? <a href={(lookupInfo.System.m_Item1 != null ? "?eventID=" + lookupInfo.System.m_Item1.ID : '#')} id="system-back" key="system-back" className={'btn btn-primary' + (lookupInfo.System.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => setHover('NavLeft')} onMouseLeave={() => setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                                    {(navigation == "station" ? <a href={(lookupInfo.Station.m_Item1 != null ? "?eventID=" + lookupInfo.Station.m_Item1.ID : '#')} id="station-back" key="station-back" className={'btn btn-primary' + (lookupInfo.Station.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => setHover('NavLeft')} onMouseLeave={() => setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                                    {(navigation == "meter" ? <a href={(lookupInfo.Meter.m_Item1 != null ? "?eventID=" + lookupInfo.Meter.m_Item1.ID : '#')} id="meter-back" key="meter-back" className={'btn btn-primary' + (lookupInfo.Meter.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => setHover('NavLeft')} onMouseLeave={() => setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                                    {(navigation == "asset" ? <a href={(lookupInfo.Asset.m_Item1 != null ? "?eventID=" + lookupInfo.Asset.m_Item1.ID : '#')} id="line-back" key="line-back" className={'btn btn-primary' + (lookupInfo.Asset.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => setHover('NavLeft')} onMouseLeave={() => setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                                    </div>
                                <select id="next-back-selection" value={navigation} onChange={e => dispatch(SetNavigation(e.target.value as OpenSee.EventNavigation))}>
                                        <option value="system">System</option>
                                        <option value="station">Station</option>
                                        <option value="meter">Meter</option>
                                        <option value="asset">Asset</option>
                                    </select>
                                    <div className="input-group-append">
                                    <ToolTip Show={hover == 'NavRight'} Position={'bottom'} Target={'next-btn'} Theme={'dark'}>
                                        <p>Navigate to Next Event in the {navigation}</p>
                                        {navigation === "system" && (<p style={{ textAlign: "center" }}>({lookupInfo.System.m_Item2 != null ? lookupInfo.System.m_Item2.StartTime : ''})</p>)}
                                        {navigation === "station" && (<p style={{ textAlign: "center" }}>({(lookupInfo.Station.m_Item2 != null ? lookupInfo.Station.m_Item2.StartTime : '')})</p>)}
                                        {navigation === "meter" && (<p style={{ textAlign: "center" }}>({(lookupInfo.Meter.m_Item2 != null ? lookupInfo.Meter.m_Item2.StartTime : '')})</p>)}
                                        {navigation === "asset" && (<p style={{ textAlign: "center" }}>({(lookupInfo.Asset.m_Item2 != null ? lookupInfo.Asset.m_Item2.StartTime : '')})</p>)}
                                    </ToolTip>
                                    {(navigation == "system" ? <a href={(lookupInfo.System.m_Item2 != null ? "?eventID=" + lookupInfo.System.m_Item2.ID : '#')} id="system-next" key="system-next" className={'btn btn-primary' + (lookupInfo.System.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => setHover('NavRight')} onMouseLeave={() => setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                                    {(navigation == "station" ? <a href={(lookupInfo.Station.m_Item2 != null ? "?eventID=" + lookupInfo.Station.m_Item2.ID : '#')} id="station-next" key="station-next" className={'btn btn-primary' + (lookupInfo.Station.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => setHover('NavRight')} onMouseLeave={() => setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                                    {(navigation == "meter" ? <a href={(lookupInfo.Meter.m_Item2 != null ? "?eventID=" + lookupInfo.Meter.m_Item2.ID : '#')} id="meter-next" key="meter-next" className={'btn btn-primary' + (lookupInfo.Meter.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => setHover('NavRight')} onMouseLeave={() => setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                                    {(navigation == "asset" ? <a href={(lookupInfo.Asset.m_Item2 != null ? "?eventID=" + lookupInfo.Asset.m_Item2.ID : '#')} id="line-next" key="line-next" className={'btn btn-primary' + (lookupInfo.Asset.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => setHover('NavRight')} onMouseLeave={() => setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                                    </div>
                                </div>
                            </li> : null}

                        <li className="nav-item" style={{ width: '74px', marginTop: "10px" }}>
                        <button className="btn btn-primary" style={{ borderRadius: "4rem", padding: "0.495rem" }}
                            onMouseEnter={() => setHover('Help')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'help-btn'}
                                data-toggle="tooltip" data-placement="bottom" onClick={() => setShowAbout(true)}>
                                <i style={{ fontStyle: "normal", fontSize: "20px" }}>{Help}</i>
                            </button>
                            <ToolTip Show={hover == 'Help'} Position={'bottom'} Target={'help-btn'} Theme={'dark'}>
                                <p>Help</p>
                            </ToolTip>
                        </li>
                    </ul>
            </div>
                    <React.Suspense fallback={<div>Loading...</div>}>
                {eventID ? <HarmonicStatsWidget isOpen={showHarmonicStats} eventId={eventID} closeCallback={() => setShowHarmonicStats(false)} exportCallback={() => exportData('harmonics')} position={positionHarmonicStats} setPosition={(t, l) => setPositionHarmonicStats([t, l])} /> : null}
                <About isOpen={showAbout} closeCallback={() => setShowAbout(false)} />
                    </React.Suspense>
                    </>
            );

}

const PlotTable = () => {
    const showPlots = useAppSelector(selectDisplayed); 
    const eventIDs = useAppSelector(SelectEventIDs);
    const dispatch = useAppDispatch()

    function tooglePlots(type: OpenSee.graphType) {
        let display;
        if (type === 'Voltage')
            display = showPlots.Voltage;
        else if (type === 'Current')
            display = showPlots.Current;
        else if (type === 'Analogs')
            display = showPlots.Analogs;
        else if (type === 'Digitals')
            display = showPlots.Digitals;
        else if (type === 'TripCoil')
            display = showPlots.TripCoil;

        if (display)
            eventIDs.forEach(id => dispatch(RemovePlot({ DataType: type, EventId: id })))
        else
            eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: type, EventId: id } })))
    }
    return (
        <>
            <table className="table" style={{ margin: 0 }}>
                <tbody>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox" onChange={() => tooglePlots('Voltage')}
                                checked={showPlots.Voltage} />
                        </td>
                        <td>
                            <label className="form-check-label">Voltage</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox"
                                onChange={() => tooglePlots('Current')}
                                checked={showPlots.Current} />
                        </td>
                        <td>
                            <label className="form-check-label">Current</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox"
                                onChange={() => tooglePlots('Analogs')}
                                checked={showPlots.Analogs} />
                        </td>
                        <td><label className="form-check-label">Analogs</label></td>
                    </tr>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox"
                                onChange={() => tooglePlots('Digitals')}
                                checked={showPlots.Digitals} />
                        </td>
                        <td>
                            <label className="form-check-label">Digitals</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input className="form-check-input"
                                style={{ margin: 0 }}
                                type="checkbox"
                                onChange={() => tooglePlots('TripCoil')}
                                checked={showPlots.TripCoil} />
                        </td>
                        <td>
                            <label className="form-check-label">Trip Coil E.</label>
                        </td>
                    </tr>
                </tbody>
            </table>
    </>
    )
}

export default OpenSeeNavBar;
