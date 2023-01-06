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
import { useSelector, useDispatch } from 'react-redux';
import { selectMouseMode, SetMouseMode, ResetZoom, SetZoomMode, selectZoomMode, selectEventID, selectAnalytic, selectFFTLimits } from '../store/dataSlice';
import { SelectdisplayAnalogs, SelectdisplayCur, SelectdisplayDigitals, SelectdisplayTCE, SelectdisplayVolt, SelectNavigation, SelectTab, SetNavigation } from '../store/settingSlice';
import { selectCycles, selectHarmonic, selectHPF, selectLPF, selectTRC } from '../store/analyticSlice';
import { FFT, Pan, PhasorClock, Settings, Square, TimeRect, Tooltip, ValueRect, Zoom } from '../Graphs/ChartIcons';
import { ToolTip } from '@gpa-gemstone/react-interactive';


declare var homePath: string;
declare var eventStartTime: string;
declare var eventEndTime: string;

interface IProps {
    EventData: OpenSee.iPostedData,
    Lookup: OpenSee.iNextBackLookup,
    stateSetter: (ob: any) => void
}

const OpenSeeNavBar = (props: IProps) => {

    const ToolTipDeltaWidget = React.lazy(() => import(/* webpackChunkName: "ToolTipDeltaWidget" */ '../jQueryUI Widgets/TooltipWithDelta'));
    const ToolTipWidget = React.lazy(() => import(/* webpackChunkName: "ToolTipWidget" */ '../jQueryUI Widgets/Tooltip'));
    const TimeCorrelatedSagsWidget = React.lazy(() => import(/* webpackChunkName: "TimeCorrelatedSagsWidget" */ '../jQueryUI Widgets/TimeCorrelatedSags'));
    const PointWidget = React.lazy(() => import(/* webpackChunkName: "PointWidget" */ '../jQueryUI Widgets/AccumulatedPoints'));
    const PolarChartWidget = React.lazy(() => import(/* webpackChunkName: "PolarChartWidget" */ '../jQueryUI Widgets/PolarChart'));
    const ScalarStatsWidget = React.lazy(() => import(/* webpackChunkName: "ScalarStatsWidget" */ '../jQueryUI Widgets/ScalarStats'));
    const LightningDataWidget = React.lazy(() => import(/* webpackChunkName: "LightningDataWidget" */ '../jQueryUI Widgets/LightningData'));
    const SettingsWidget = React.lazy(() => import(/* webpackChunkName: "SettingsWidget" */ '../jQueryUI Widgets/SettingWindow'));
    const FFTTable = React.lazy(() => import(/* webpackChunkName: "FFTTable" */ '../jQueryUI Widgets/FFTTable'));
    const HarmonicStatsWidget = React.lazy(() => import(/* webpackChunkName: "HarmonicStatsWidget" */ '../jQueryUI Widgets/HarmonicStats'));
    
    const dispatch = useDispatch()
    const mouseMode = useSelector(selectMouseMode);
    const zoomMode = useSelector(selectZoomMode);
    const eventId = useSelector(selectEventID);
    const analytic = useSelector(selectAnalytic);
    const navigation = useSelector(SelectNavigation);

    const showVolts = useSelector(SelectdisplayVolt);
    const showCurr = useSelector(SelectdisplayCur);
    const showDigitals = useSelector(SelectdisplayDigitals);
    const showAnalog = useSelector(SelectdisplayAnalogs);
    const showTCE = useSelector(SelectdisplayTCE);
    const tab = useSelector(SelectTab);

    const harmonic = useSelector(selectHarmonic);
    const trc = useSelector(selectTRC);
    const lpf = useSelector(selectLPF);
    const hpf = useSelector(selectHPF);
    const cycles = useSelector(selectCycles);
    const fftTime = useSelector(selectFFTLimits);

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

    const [hover, setHover] = React.useState<('None'|'Zoom')>('None')
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
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <a className="navbar-brand col-sm-3 col-md-2 mr-0 mr-auto" href={''} ><img style={{ maxHeight: 35, margin: -5 }} src={'openSee.png'} /></a>
                <ul className="navbar-nav mr-auto nav-expand">
                    <li className="nav-item dropdown" style={{ width: '150px' }}>
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
                    </li>
                    <li className="nav-item" style={{ width:  (analytic == 'FFT' ? 'calc(100% - 954px)': 'calc(100% - 909px)'), textAlign: 'center' }}>

                    </li>
                    <li className="nav-item" style={{ width: '64px' }}>
                        <button type="button" className="btn btn-primary" title="ToolTip" style={{ borderRadius: "0.25rem" }} onClick={() => setShowToolTip(!showToolTip)}>
                            <i style={{ fontStyle: "normal" }}>{Tooltip}</i> 
                        </button>
                    </li>
                    <li className="nav-item" style={{ width: '64px' }}>
                        <button type="button" className="btn btn-primary" title="Polar Chart" style={{ borderRadius: "0.25rem" }} onClick={() => setShowPolar(!showPolar)}>
                            < i style={{ fontStyle: "normal" }} >{PhasorClock}</i>
                        </button>
                    </li>
                    <li className="nav-item" style={{ width: (analytic == 'FFT' ? '168px' : '103px') }}>
                        <div className="btn-group" role="group">
                            <button type="button" className={"btn btn-primary " + (mouseMode == "zoom" ? "active" : "")} onClick={() => dispatch(SetMouseMode("zoom"))}
                                data-toggle="tooltip" data-placement="bottom" title="Zoom">
                                <i style={{fontStyle: "normal"}}>{Zoom}</i>
                            </button>
                            <button type="button" className={"btn btn-primary " + (mouseMode == "pan" ? "active" : "")} onClick={() => dispatch(SetMouseMode("pan"))}
                                data-toggle="tooltip" data-placement="bottom" title="Pan">
                                <i style={{ fontStyle: "normal" }} >{Pan}</i>
                            </button>
                            {analytic == 'FFT'? <button type="button" className={"btn btn-primary " + (mouseMode == "fftMove" ? "active" : "")} onClick={() => dispatch(SetMouseMode("fftMove"))}
                                data-toggle="tooltip" data-placement="bottom" title="FFT">
                                <i style={{ fontStyle: "normal" }}>{FFT}</i>
                            </button> : null}
                        </div>
                    </li>

                    <li className="nav-item" style={{ width: '64px' }}>
                        <div className="btn-group dropright">
                            <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem" }}
                                disabled={mouseMode != 'zoom' && mouseMode != 'pan'} onMouseEnter={() => setHover('Zoom')}
                                onMouseLeave={() => setHover('None')} >
                                {zoomMode == "x" ? <i style={{ fontStyle: "normal" }}>{TimeRect}</i> : null}
                                {zoomMode == "y" ? <i style={{ fontStyle: "normal" }}>{ValueRect}</i> : null}
                                {zoomMode == "xy" ? <i style={{ fontStyle: "normal" }}>{Square}</i> : null}
                            </button>
                            <ToolTip Show={hover == 'Zoom'} Position={'bottom'} Target={'zoom-btn'} Theme={'dark'}>
                                <p>Zoom</p>
                            </ToolTip>
                            <div className="dropdown-menu">
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
                        </div>
                    </li>
                    <li className="nav-item" style={{ width: '136px' }}>
                        <button className="btn btn-primary" title='Reset Zoom' onClick={() => dispatch(ResetZoom({ start: new Date(eventStartTime + "Z").getTime(), end: new Date(eventEndTime + "Z").getTime() }))}>Reset Zoom</button>
                    </li>
                    <li className="nav-item" style={{ width: '64px' }}>
                        <button className="btn btn-primary" title='Settings' onClick={() => setShowSettings(!showSettings)}>
                            <i style={{ fontStyle: "normal" }}>{Settings}</i>
                        </button>
                    </li>
                    {props.Lookup != undefined ?
                        <li className="nav-item" style={{ width: '183px' }}>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    {(navigation == "system" ? <a href={(props.Lookup.System.m_Item1 != null ? "?eventID=" + props.Lookup.System.m_Item1.ID + "&Navigation=system" : '#')} id="system-back" key="system-back" className={'btn btn-primary' + (props.Lookup.System.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item1 != null ? props.Lookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                    {(navigation == "station" ? <a href={(props.Lookup.Station.m_Item1 != null ? "?eventID=" + props.Lookup.Station.m_Item1.ID + "&Navigation=station" : '#')} id="station-back" key="station-back" className={'btn btn-primary' + (props.Lookup.Station.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.Station.m_Item1 != null ? props.Lookup.Station.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                    {(navigation == "meter" ? <a href={(props.Lookup.Meter.m_Item1 != null ? "?eventID=" + props.Lookup.Meter.m_Item1.ID + "&Navigation=meter" : '#')} id="meter-back" key="meter-back" className={'btn btn-primary' + (props.Lookup.Meter.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.Meter.m_Item1 != null ? props.Lookup.Meter.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                    {(navigation == "asset" ? <a href={(props.Lookup.Asset.m_Item1 != null ? "?eventID=" + props.Lookup.Asset.m_Item1.ID + "&Navigation=asset" : '#')} id="line-back" key="line-back" className={'btn btn-primary' + (props.Lookup.Asset.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item1 != null ? props.Lookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                </div>
                                <select id="next-back-selection" value={navigation} onChange={(e) => dispatch(SetNavigation(e.target.value as OpenSee.EventNavigation))}>
                                    <option value="system">System</option>
                                    <option value="station">Station</option>
                                    <option value="meter">Meter</option>
                                    <option value="asset">Asset</option>
                                </select>
                                <div className="input-group-append">

                                    {(navigation == "system" ? <a href={(props.Lookup.System.m_Item2 != null ? "?eventID=" + props.Lookup.System.m_Item2.ID + "&Navigation=system" : '#')} id="system-next" key="system-next" className={'btn btn-primary' + (props.Lookup.System.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item2 != null ? props.Lookup.System.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                    {(navigation == "station" ? <a href={(props.Lookup.Station.m_Item2 != null ? "?eventID=" + props.Lookup.Station.m_Item2.ID + "&Navigation=station" : '#')} id="station-next" key="station-next" className={'btn btn-primary' + (props.Lookup.Station.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Station.m_Item2 != null ? props.Lookup.Station.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                    {(navigation == "meter" ? <a href={(props.Lookup.Meter.m_Item2 != null ? "?eventID=" + props.Lookup.Meter.m_Item2.ID + "&Navigation=meter" : '#')} id="meter-next" key="meter-next" className={'btn btn-primary' + (props.Lookup.Meter.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Meter.m_Item2 != null ? props.Lookup.Meter.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                    {(navigation == "asset" ? <a href={(props.Lookup.Asset.m_Item2 != null ? "?eventID=" + props.Lookup.Asset.m_Item2.ID + "&Navigation=asset" : '#')} id="line-next" key="line-next" className={'btn btn-primary' + (props.Lookup.Asset.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Asset.m_Item2 != null ? props.Lookup.Asset.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                </div>
                            </div>
                        </li> : null}
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
            </React.Suspense>
        </nav>
    );

}

export default OpenSeeNavBar;
