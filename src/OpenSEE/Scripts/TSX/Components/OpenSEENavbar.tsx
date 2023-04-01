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
import { useSelector } from 'react-redux'
import { selectMouseMode, SetMouseMode, ResetZoom, SetZoomMode, selectZoomMode, selectEventID, selectAnalytic, selectFFTLimits } from '../store/dataSlice';
import { SelectdisplayAnalogs, SelectdisplayCur, SelectdisplayDigitals, SelectdisplayTCE, SelectdisplayVolt, SelectNavigation, SelectTab, SetNavigation } from '../store/settingSlice';
import { selectCycles, selectHarmonic, selectHPF, selectLPF, selectTRC } from '../store/analyticSlice';
import { WaveformViews, PhasorClock, statsIcon, lightningData, exportBtn, Zoom, Pan, FFT, Reset, Square, ValueRect, TimeRect, Settings, Help, ShowPoints, CorrelatedSags } from '../Graphs/ChartIcons';
import { ToolTip } from '@gpa-gemstone/react-interactive';
import { useAppDispatch, useAppSelector } from '../hooks';
import moment from "moment"

import ToolTipDeltaWidget from '../jQueryUI Widgets/TooltipWithDelta';
import ToolTipWidget from '../jQueryUI Widgets/Tooltip'; 
import TimeCorrelatedSagsWidget from '../jQueryUI Widgets/TimeCorrelatedSags';
import PointWidget from '../jQueryUI Widgets/AccumulatedPoints';
import PolarChartWidget from '../jQueryUI Widgets/PolarChart';
import ScalarStatsWidget from '../jQueryUI Widgets/ScalarStats'; 
import LightningDataWidget from '../jQueryUI Widgets/LightningData'; 
import SettingsWidget from '../jQueryUI Widgets/SettingWindow'; 
import FFTTable from '../jQueryUI Widgets/FFTTable'; 
import HarmonicStatsWidget from '../jQueryUI Widgets/HarmonicStats'; 
import About from './About'; 

declare var homePath: string;
declare var eventStartTime: string;
declare var eventEndTime: string;

interface IProps {
    EventData: OpenSee.iPostedData,
    Lookup: OpenSee.iNextBackLookup,
    stateSetter: (ob: any) => void
}

const OpenSeeNavBar = (props: IProps) => {

    //const ToolTipDeltaWidget = React.lazy(() => import(/* webpackChunkName: "ToolTipDeltaWidget" */ '../jQueryUI Widgets/TooltipWithDelta'));
    //const ToolTipWidget = React.lazy(() => import(/* webpackChunkName: "ToolTipWidget" */ '../jQueryUI Widgets/Tooltip'));
    //const TimeCorrelatedSagsWidget = React.lazy(() => import(/* webpackChunkName: "TimeCorrelatedSagsWidget" */ '../jQueryUI Widgets/TimeCorrelatedSags'));
    //const PointWidget = React.lazy(() => import(/* webpackChunkName: "PointWidget" */ '../jQueryUI Widgets/AccumulatedPoints'));
    //const PolarChartWidget = React.lazy(() => import(/* webpackChunkName: "PolarChartWidget" */ '../jQueryUI Widgets/PolarChart'));
    //const ScalarStatsWidget = React.lazy(() => import(/* webpackChunkName: "ScalarStatsWidget" */ '../jQueryUI Widgets/ScalarStats'));
    //const LightningDataWidget = React.lazy(() => import(/* webpackChunkName: "LightningDataWidget" */ '../jQueryUI Widgets/LightningData'));
    //const SettingsWidget = React.lazy(() => import(/* webpackChunkName: "SettingsWidget" */ '../jQueryUI Widgets/SettingWindow'));
    //const FFTTable = React.lazy(() => import(/* webpackChunkName: "FFTTable" */ '../jQueryUI Widgets/FFTTable'));
    //const HarmonicStatsWidget = React.lazy(() => import(/* webpackChunkName: "HarmonicStatsWidget" */ '../jQueryUI Widgets/HarmonicStats'));
    //const AboutWindow = React.lazy(() => import(/* webpackChunkName: "About"*/ './About'));
    
    const dispatch = useAppDispatch()
    const mouseMode = useAppSelector(selectMouseMode);
    const zoomMode = useAppSelector(selectZoomMode);
    const eventId = useAppSelector(selectEventID);
    const analytic = useAppSelector(selectAnalytic);
    const navigation = useAppSelector(SelectNavigation);

    const showVolts = useAppSelector(SelectdisplayVolt);
    const showCurr = useAppSelector(SelectdisplayCur);
    const showDigitals = useAppSelector(SelectdisplayDigitals);
    const showAnalog = useAppSelector(SelectdisplayAnalogs);
    const showTCE = useAppSelector(SelectdisplayTCE);
    const tab = useAppSelector(SelectTab);

    const harmonic = useAppSelector(selectHarmonic);
    const trc = useAppSelector(selectTRC);
    const lpf = useAppSelector(selectLPF);
    const hpf = useAppSelector(selectHPF);
    const cycles = useAppSelector(selectCycles);
    const fftTime = useAppSelector(selectFFTLimits);

    const [showPoints, setShowPoints] = React.useState<boolean>(false);
    const [showToolTip, setShowToolTip] = React.useState<boolean>(false);
    const [showToolTipDelta, setShowToolTipDelta] = React.useState<boolean>(false);
    const [showPolar, setShowPolar] = React.useState<boolean>(false);
    const [showScalarStats, setShowScalarStats] = React.useState<boolean>(false);
    const [showHarmonicStats, setShowHarmonicStats] = React.useState<boolean>(false);
    const [showCorrelatedSags, setShowCorrelatedSags] = React.useState<boolean>(false);
    const [showLightning, setShowLightning] = React.useState<boolean>(false);
    const [showFFTTable, setShowFFTTable] = React.useState<boolean>(false);
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const [showAbout, setShowAbout] = React.useState<boolean>(false); 

    const [positionPoints, setPositionPoints] = React.useState<[number, number]>([0,0]);
    const [positionToolTip, setPositionToolTip] = React.useState<[number, number]>([0,0]);
    const [positionToolTipDelta, setPositionToolTipDelta] = React.useState<[number, number]>([0, 0]);
    const [positionPolar, setPositionPolar] = React.useState<[number, number]>([0, 0]);
    const [positionScalarStats, setPositionScalarStats] = React.useState<[number, number]>([0, 0]);
    const [positionHarmonicStats, setPositionHarmonicStats] = React.useState<[number, number]>([0, 0]);
    const [positionCorrelatedSags, setPositionCorrelatedSags] = React.useState<[number, number]>([0, 0]);
    const [positionLightning, setPositionLightning] = React.useState<[number, number]>([0, 0]);
    const [positionFFTTable, setPositionFFTTable] = React.useState<[number, number]>([0, 0]);
    const [positionSettings, setPositionSettings] = React.useState<[number, number]>([0, 0]);

    const [hover, setHover] = React.useState<('None'|'Waveform'|'Show Points'|'Polar Chart'|'Stat'|'Sags'|'Lightning'|'Export'|'Tooltip'|'Clock'|'Zoom Mode'|'Pan'|'FFT'|'Reset Zoom'| 'Settings'| 'NavLeft' | 'NavRight'| 'Help'| 'Meter' | 'Station' | 'Asset' | 'EType' | 'EInception')>('None')
    
    const {eventInfo} = useAppSelector(state => state.EventInfo)

    
    React.useEffect(() => {
        if (showPoints) {
            let oldMode = clone(mouseMode);
            dispatch(SetMouseMode('select'))
            return () => {
                dispatch(SetMouseMode(oldMode))
            }
        }
        return () => { }

    }, [showPoints])


    React.useEffect(() => {
        if (showToolTipDelta) {
            let oldMode = clone(mouseMode);
            dispatch(SetMouseMode('select'))
            return () => {
                dispatch(SetMouseMode(oldMode))
            }
        }
        return () => { }

    }, [showToolTipDelta])

    React.useEffect(() => {
        if (mouseMode == 'fftMove' && analytic != 'FFT')
            dispatch(SetMouseMode('zoom'));
    },[analytic])

    function exportData(type) {
        window.open(homePath + `CSVDownload.ashx?type=${type}&eventID=${eventId}` +
            `${showVolts != undefined ? `&displayVolt=${showVolts}` : ``}` +
            `${showCurr != undefined ? `&displayCur=${showCurr}` : ``}` +
            `${showTCE != undefined ? `&displayTCE=${showTCE}` : ``}` +
            `${showDigitals != undefined ? `&breakerdigitals=${showDigitals}` : ``}` +
            `${showAnalog != undefined ? `&displayAnalogs=${showAnalog}` : ``}` +
            `${tab == 'Analytic' && analytic != 'FFT' ? `&displayAnalytics=${analytic}` : ``}` +
            `${tab == 'Analytic' && analytic == 'LowPassFilter' ? `&filterOrder=${lpf}` : ``}` +
            `${tab == 'Analytic' && analytic == 'HighPassFilter' ? `&filterOrder=${hpf}` : ``}` +
            `${tab == 'Analytic' && analytic == 'Rectifier' ? `&Trc=${trc}` : ``}` +
            `${tab == 'Analytic' && analytic == 'Harmonic' ? `&harmonic=${harmonic}` : ``}` +
            `${type == 'fft' ? `&startDate=${fftTime[0]}` : ``}` +
            `${type == 'fft' ? `&cycles=${cycles}` : ``}` +
            `&Meter=${props.EventData.MeterName}` +
            `&EventType=${props.EventData.EventName}`
        );
    }


            return (
                <>
                    <ul className="navbar-nav mr-auto navbar-expand ml-auto">
                        <li className="nav-item" onMouseEnter={() => setHover('Meter')} onMouseLeave={() => setHover('None')} data-tooltip={'meter'} data-toggle="tooltip" data-placement="bottom"
                            style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                            <div style={{textAlign: 'center', color: 'white'}}>Meter:</div>
                            <div style={{textAlign: 'center', color: 'white'}}> { eventInfo?.MeterName?.split(" ")[0] }</div>
                            <ToolTip Show={hover == 'Meter'} Position={'bottom'} Target={'meter'} Theme={'dark'}>
                                <p>{ eventInfo?.MeterName?.split(" ")[0] }</p>
                            </ToolTip>
                        </li>
                        <li className="nav-item" onMouseEnter={() => setHover('Station')} onMouseLeave={() => setHover('None')} data-tooltip={'station'} data-toggle="tooltip" data-placement="bottom"style = {{borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px'  }}>
                            <div style={{textAlign: 'center', color: 'white'}}>Station:</div> 
                            <div style={{textAlign: 'center', color: 'white'}}>{eventInfo?.StationName}</div>
                            <ToolTip Show={hover == 'Station'} Position={'bottom'} Target={'station'} Theme={'dark'}>
                                <p>{eventInfo?.StationName}</p>
                            </ToolTip>
                        </li>
                        <li className="nav-item" onMouseEnter={() => setHover('Asset')} onMouseLeave={() => setHover('None')} data-tooltip={'asset'} data-toggle="tooltip" data-placement="bottom"style = {{borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px'  }}>
                            <div style={{textAlign: 'center', color: 'white'}}>Asset:</div> 
                            <div style={{textAlign: 'center', color: 'white'}}>{eventInfo?.AssetName?.split(" ")[0]}</div>
                            <ToolTip Show={hover == 'Asset'} Position={'bottom'} Target={'asset'} Theme={'dark'}>
                                <p>{eventInfo?.AssetName?.split(" ")[0]}</p>
                            </ToolTip>
                        </li>
                        <li className="nav-item" onMouseEnter={() => setHover('EType')}onMouseLeave={() => setHover('None')} data-tooltip={'etype'} data-toggle="tooltip" data-placement="bottom"style = {{borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '15px', paddingRight: '15px'  }}>
                            <div style={{textAlign: 'center', color: 'white'}}>Event Type:</div>
                            <div style={{textAlign: 'center', color: 'white'}}>{eventInfo?.EventName}</div>
                            <ToolTip Show={hover == 'EType'} Position={'bottom'} Target={'etype'} Theme={'dark'}>
                                <p>{eventInfo?.EventName}</p>
                            </ToolTip>
                        </li>
                        <li className="nav-item" onMouseEnter={() => setHover('EInception')} onMouseLeave={() => setHover('None')} data-tooltip={'einception'} data-toggle="tooltip" data-placement="bottom"style = {{borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', padding: "0 5px", minWidth: "60px", marginRight: "10px"  }}>
                            <div style={{textAlign: 'center', color: 'white'}}>Event Inception: </div>
                            <div style={{ textAlign: 'center', color: 'white'}}>{moment(eventInfo?.EventDate).format('YYYY-MM-DD h:mm')}...</div>
                            <ToolTip Show={hover == 'EInception'} Position={'bottom'} Target={'einception'} Theme={'dark'}>
                                <p>{moment(eventInfo?.EventDate).format('YYYY-MM-DD HH:mm:ss')}</p>
                            </ToolTip>
                        </li>
                    </ul>

                    <ul className="navbar-nav mr-auto navbar-expand ml-auto">
                        {/*<li className="nav-item dropdown" style={{ width: '150px' }}>
                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Data Tools</a>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <a className="dropdown-item" onClick={() => setShowPoints(!showPoints) }>{(showPoints ? 'Close Points' : 'Show Points')}</a>
                            <a className="dropdown-item" onClick={() => setShowToolTip(!showToolTip) }>{(showToolTip ? 'Close Tooltip' : 'Show Tooltip')}</a>
                            <a className="dropdown-item" onClick={() => setShowToolTipDelta(!showToolTipDelta)}>{(showToolTipDelta ? 'Close Tooltip w/ Delta' : 'Show Tooltip w/ Delta')} </a>
                            <a className="dropdown-item" onClick={() => setShowPolar(!showPolar)}>{(showPolar ? 'Close Phasor' : 'Show Phasor')}</a>
                            <a className="dropdown-item" onClick={() => setShowScalarStats(!showScalarStats) }>{(showScalarStats ? 'Close Stats' : 'Show Stats')}</a>
                            <a className="dropdown-item" onClick={() => setShowCorrelatedSags(!showCorrelatedSags)}>{(showCorrelatedSags ? 'Close Correlated Sags' : 'Show Correlated Sags')}</a>
                            <a className="dropdown-item" onClick={() => setShowLightning(!showLightning)} >{(showLightning ? 'Close Lightning Data' : 'Show Lightning Data')}</a>
                            {props.EventData != undefined ? 
                                <>
                                    {(props.EventData.EventName == "Snapshot" ? <a className="dropdown-item" onClick={() => setShowHarmonicStats(!showHarmonicStats) }>{(showHarmonicStats ? 'Hide Harmonics' : 'Show Harmonics')}</a> : null)}
                            </> : null
                            }
                            {analytic == 'FFT' && tab == 'Analytic' ? <a className="dropdown-item" onClick={() => setShowFFTTable(!showFFTTable)}>{(showFFTTable ? 'Close FFT Table' : 'Show FFT Table')}</a> : null}
                            <div className="dropdown-divider"></div>
                            {analytic == 'FFT' && tab == 'Analytic' ? <a className="dropdown-item" onClick={() => { exportData('fft') }}>Export FFT</a> : null}
                            <a className="dropdown-item" onClick={() => { exportData('csv') }}>Export CSV</a>
                            <a className="dropdown-item" onClick={() => { exportData('pqds') }}>Export PQDS</a>

                        </div>
                    </li>*/}

                        <li className="nav-item" style={{ width: (analytic == 'FFT' ? 'calc(100% - 954px)' : 'calc(100% - 909px)'), textAlign: 'center' }}>

                        </li>
                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                            <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Waveform')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'waveform-btn'}
                                data-toggle="tooltip" data-placement="bottom" onClick={() => setShowPoints(true)}>
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{WaveformViews}</i>
                            </button>
                            <ToolTip Show={hover == 'Waveform'} Position={'bottom'} Target={'waveform-btn'} Theme={'dark'}>
                                <p>Waveform Views</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item dropdown" style={{ width: '54px', position: 'relative', marginTop: "10px" }}>
                        <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Show Points')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'points-btn'}
                                data-toggle="dropdown" data-placement="bottom">
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{ShowPoints}</i>
                            </button>
                            <div className="dropdown-menu" style={{position: 'absolute'}}>
                                <label><input type = "checkbox"/>
                                    Voltage
                                </label>
                                <label><input type = "checkbox"/>
                                    Current
                                </label>
                                <label><input type = "checkbox"/>
                                    Analogs
                                </label>
                                <label><input type = "checkbox"/>
                                    Digitals
                                </label>
                                <label><input type = "checkbox"/>
                                    Trip Coil E.
                                </label>
                            </div>
                            <ToolTip Show={hover == 'Show Points'} Position={'bottom'} Target={'points-btn'} Theme={'dark'}> 
                                <p>Show Points</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                            <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Clock')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'phasorclock-btn'}
                                data-toggle="tooltip" data-placement="bottom">
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{PhasorClock}</i>
                            </button>
                            <ToolTip Show={hover == 'Clock'} Position={'bottom'} Target={'phasorclock-btn'} Theme={'dark'}>
                                <p>Phasor Chart</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                            <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Stat')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'stats-btn'}
                                data-toggle="tooltip" data-placement="bottom" onClick={() => setShowScalarStats(!showScalarStats) }>
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{statsIcon}</i>
                            </button>
                            <ToolTip Show={hover == 'Stat'} Position={'bottom'} Target={'stats-btn'} Theme={'dark'}>
                                <p>Stats</p>
                            </ToolTip>
                        </li>
                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                            <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Sags')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'sags-btn'}
                                data-toggle="tooltip" data-placement="bottom" onClick={() => setShowCorrelatedSags(!showCorrelatedSags)}>
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{CorrelatedSags}</i>
                            </button>
                            <ToolTip Show={hover == 'Sags'} Position={'bottom'} Target={'sags-btn'} Theme={'dark'}>
                                <p>Correlated Sags</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                            <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Lightning')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'lightning-btn'}
                                data-toggle="tooltip" data-placement="bottom" onClick={() => setShowLightning(!showLightning)}>
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{lightningData}</i>
                            </button>
                            <ToolTip Show={hover == 'Lightning'} Position={'bottom'} Target={'lightning-btn'} Theme={'dark'}>
                                <p>Lightning Datas</p>
                            </ToolTip>
                        </li>

                        <li className="nav-item dropdown" style={{ width: '84px', position: "relative", marginTop: "10px" }}>
                            <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"  style={{ borderRadius: "0.25rem", padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Export')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'export-btn'}
                                 data-placement="bottom">
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{exportBtn}</i>
                            </button>
                            <div className="dropdown-menu">
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

                        <li className="nav-item" style={{ width: '180px', position: "relative", marginTop: "10px" }}>
                            <div className="btn-group" role="group">
                            <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Zoom Mode')} onMouseLeave={() => setHover('None')} data-tooltip={'zoom-btn'}
                                data-placement="bottom" onClick={() => dispatch(SetMouseMode("zoom"))}>
                                < i style={{ fontStyle: "normal", fontSize: "25px" }} >{Zoom}</i>
                            </button>
                            <div className="dropdown-menu" style={{position: "absolute"}}>
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
                                <button type="button" className={"btn btn-primary" + (mouseMode == "pan" ? "active" : "")} style={{ padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Pan')}
                                    onMouseLeave={() => setHover('None')} data-tooltip={'pan-btn'}
                                    data-toggle="tooltip" data-placement="bottom" onClick={() => dispatch(SetMouseMode("pan"))}>
                                    <i style={{ fontStyle: "normal", fontSize: "25px" }} >{Pan}</i>
                                </button>
                                <ToolTip Show={hover == 'Pan'} Position={'bottom'} Target={'pan-btn'} Theme={'dark'}>
                                    <p>Pan</p>
                                </ToolTip>

                                {/*FFT*/}
                                <button type="button" className={"btn btn-primary " + (mouseMode == "fftMove" ? "active" : "")} onClick={() => dispatch(SetMouseMode("fftMove"))}
                                    disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('FFT')}
                                    onMouseLeave={() => setHover('None')} data-tooltip={'fft-btn'}
                                    data-toggle="tooltip" data-placement="bottom">
                                    <i style={{ fontStyle: "normal", fontSize: "20px" }}>{FFT}</i>
                                </button>
                                <ToolTip Show={hover == 'FFT'} Position={'bottom'} Target={'fft-btn'} Theme={'dark'}>
                                    <p>FFT</p>
                                </ToolTip>

                                {/*reset*/}
                                <button className="btn btn-primary" style={{padding: "0.195rem"}} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Reset Zoom')} onMouseLeave={() => setHover('None')} data-tooltip={'reset-btn'} data-toggle="tooltip" data-placement="bottom">
                                <i style={{ fontStyle: "normal", fontSize: "21px"}}>{Reset}</i>
                                </button>
                                <ToolTip Show={hover == 'Reset Zoom'} Position={'bottom'} Target={'reset-btn'} Theme={'dark'}>
                                    <p>Reset Zoom</p>
                                </ToolTip>
                                
                            </div>
                        </li>

                        <li className="nav-item" style={{ width: '74px', marginTop: "10px" }}>
                            <button className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Settings')} onMouseLeave={() => setHover('None')} data-tooltip={'settings-btn'} data-toggle="tooltip" data-placement="bottom" onClick={() => setShowSettings(!showSettings)}>
                                <i style={{ fontStyle: "normal", fontSize: "25px" }}>{Settings}</i>
                            </button>
                            <ToolTip Show={hover == 'Settings'} Position={'bottom'} Target={'settings-btn'} Theme={'dark'}>
                                <p>Settings</p>
                            </ToolTip>
                        </li>
                        {props.Lookup != undefined ?
                            <li className="nav-item" style={{ width: '163px', marginTop: "10px" }}>
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                    <ToolTip Show={hover == 'NavLeft'} Position={'bottom'} Target={'back-btn'} Theme={'dark'}>
                                        <p>Navigate to Previous Event</p>
                                    </ToolTip>
                                        {(navigation == "system" ? <a href={(props.Lookup.System.m_Item1 != null ? "?eventID=" + props.Lookup.System.m_Item1.ID + "&Navigation=system" : '#')} id="system-back" key="system-back" className={'btn btn-primary' + (props.Lookup.System.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item1 != null ? props.Lookup.System.m_Item1.StartTime : '')} onMouseEnter={() => setHover('NavLeft')} onMouseLeave={() => setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                                        {(navigation == "station" ? <a href={(props.Lookup.Station.m_Item1 != null ? "?eventID=" + props.Lookup.Station.m_Item1.ID + "&Navigation=station" : '#')} id="station-back" key="station-back" className={'btn btn-primary' + (props.Lookup.Station.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.Station.m_Item1 != null ? props.Lookup.Station.m_Item1.StartTime : '')}  onMouseEnter={() => setHover('NavLeft')} onMouseLeave={() => setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                                        {(navigation == "meter" ? <a href={(props.Lookup.Meter.m_Item1 != null ? "?eventID=" + props.Lookup.Meter.m_Item1.ID + "&Navigation=meter" : '#')} id="meter-back" key="meter-back" className={'btn btn-primary' + (props.Lookup.Meter.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.Meter.m_Item1 != null ? props.Lookup.Meter.m_Item1.StartTime : '')} onMouseEnter={() => setHover('NavLeft')} onMouseLeave={() => setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                                        {(navigation == "asset" ? <a href={(props.Lookup.Asset.m_Item1 != null ? "?eventID=" + props.Lookup.Asset.m_Item1.ID + "&Navigation=asset" : '#')} id="line-back" key="line-back" className={'btn btn-primary' + (props.Lookup.Asset.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item1 != null ? props.Lookup.System.m_Item1.StartTime : '')} onMouseEnter={() => setHover('NavLeft')} onMouseLeave={() => setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                                    </div>
                                    <select id="next-back-selection" value={navigation} onChange={(e) => dispatch(SetNavigation(e.target.value as OpenSee.EventNavigation))}>
                                        <option value="system">System</option>
                                        <option value="station">Station</option>
                                        <option value="meter">Meter</option>
                                        <option value="asset">Asset</option>
                                    </select>
                                    <div className="input-group-append">
                                    <ToolTip Show={hover == 'NavRight'} Position={'bottom'} Target={'next-btn'} Theme={'dark'}>
                                        <p>Navigate to Next Event</p>
                                    </ToolTip>
                                        {(navigation == "system" ? <a href={(props.Lookup.System.m_Item2 != null ? "?eventID=" + props.Lookup.System.m_Item2.ID + "&Navigation=system" : '#')} id="system-next" key="system-next" className={'btn btn-primary' + (props.Lookup.System.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item2 != null ? props.Lookup.System.m_Item2.StartTime : '')} onMouseEnter={() => setHover('NavRight')} onMouseLeave={() => setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                                        {(navigation == "station" ? <a href={(props.Lookup.Station.m_Item2 != null ? "?eventID=" + props.Lookup.Station.m_Item2.ID + "&Navigation=station" : '#')} id="station-next" key="station-next" className={'btn btn-primary' + (props.Lookup.Station.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Station.m_Item2 != null ? props.Lookup.Station.m_Item2.StartTime : '')} onMouseEnter={() => setHover('NavRight')} onMouseLeave={() => setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                                        {(navigation == "meter" ? <a href={(props.Lookup.Meter.m_Item2 != null ? "?eventID=" + props.Lookup.Meter.m_Item2.ID + "&Navigation=meter" : '#')} id="meter-next" key="meter-next" className={'btn btn-primary' + (props.Lookup.Meter.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Meter.m_Item2 != null ? props.Lookup.Meter.m_Item2.StartTime : '')} onMouseEnter={() => setHover('NavRight')} onMouseLeave={() => setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                                        {(navigation == "asset" ? <a href={(props.Lookup.Asset.m_Item2 != null ? "?eventID=" + props.Lookup.Asset.m_Item2.ID + "&Navigation=asset" : '#')} id="line-next" key="line-next" className={'btn btn-primary' + (props.Lookup.Asset.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Asset.m_Item2 != null ? props.Lookup.Asset.m_Item2.StartTime : '')} onMouseEnter={() => setHover('NavRight')} onMouseLeave={() => setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                                    </div>
                                </div>
                            </li> : null}

                        <li className="nav-item" style={{ width: '74px', marginTop: "10px" }}>
                            <button className="btn btn-primary" style={{ borderRadius: "4rem", padding: "0.495rem" }} disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Help')}
                                onMouseLeave={() => setHover('None')} data-tooltip={'help-btn'}
                                data-toggle="tooltip" data-placement="bottom" onClick={() => setShowAbout(true)}>
                                <i style={{ fontStyle: "normal", fontSize: "20px" }}>{Help}</i>
                            </button>
                            <ToolTip Show={hover == 'Help'} Position={'bottom'} Target={'help-btn'} Theme={'dark'}>
                                <p>Help</p>
                            </ToolTip>
                        </li>
                    </ul>
                    <React.Suspense fallback={<div>Loading...</div>}>
                        <PointWidget closeCallback={() => setShowPoints(false)} isOpen={showPoints} position={positionPoints} setPosition={(t, l) => setPositionPoints([t, l])} />
                        <ToolTipWidget closeCallback={() => setShowToolTip(false)} isOpen={showToolTip} position={positionToolTip} setPosition={(t, l) => setPositionToolTip([t, l])} />
                        <ToolTipDeltaWidget closeCallback={() => setShowToolTipDelta(false)} isOpen={showToolTipDelta} position={positionToolTipDelta} setPosition={(t, l) => setPositionToolTipDelta([t, l])} />
                        <PolarChartWidget closeCallback={() => setShowPolar(false)} isOpen={showPolar} position={positionPolar} setPosition={(t, l) => setPositionPolar([t, l])} />
                        <ScalarStatsWidget isOpen={showScalarStats} eventId={eventId} closeCallback={() => setShowScalarStats(false)} exportCallback={() => exportData('stats')} position={positionScalarStats} setPosition={(t, l) => setPositionScalarStats([t, l])} />
                        <HarmonicStatsWidget isOpen={showHarmonicStats} eventId={eventId} closeCallback={() => setShowHarmonicStats(false)} exportCallback={() => exportData('harmonics')} position={positionHarmonicStats} setPosition={(t, l) => setPositionHarmonicStats([t, l])} />
                        <TimeCorrelatedSagsWidget eventId={eventId} closeCallback={() => setShowCorrelatedSags(false)} exportCallback={() => exportData('correlatedsags')} isOpen={showCorrelatedSags} position={positionCorrelatedSags} setPosition={(t, l) => setPositionCorrelatedSags([t, l])} />
                        <LightningDataWidget isOpen={showLightning} eventId={eventId} closeCallback={() => setShowLightning(false)} position={positionLightning} setPosition={(t, l) => setPositionLightning([t, l])} />
                        <SettingsWidget closeCallback={() => setShowSettings(false)} isOpen={showSettings} position={positionSettings} setPosition={(t, l) => setPositionSettings([t, l])} />
                        <FFTTable isOpen={showFFTTable} closeCallback={() => setShowFFTTable(false)} position={positionFFTTable} setPosition={(t, l) => setPositionFFTTable([t, l])} />
                        <About isOpen={showAbout} closeCallback={() => setShowAbout(false)}/>
                    </React.Suspense>
                    </>
            );

}

export default OpenSeeNavBar;
