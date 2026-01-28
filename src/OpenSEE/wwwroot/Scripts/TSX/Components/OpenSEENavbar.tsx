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

import About from './About';


declare var homePath: string;
declare var eventStartTime: string;
declare var eventEndTime: string;

interface IProps {
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    OpenDrawers: OpenSee.Drawers
    Width: number
}

type Hover = ('None' | 'Waveform' | 'Show Points' | 'Polar Chart' | 'Stat' | 'Sags' | 'Lightning' | 'Export' | 'Tooltip' | 'Clock' | 'Zoom Mode' | 'Pan' | 'FFTTable' | 'FFTMove' | 'Reset Zoom' | 'Settings' | 'NavLeft' | 'NavRight' | 'Help' | 'Meter' | 'Station' | 'Asset' | 'EType' | 'EInception' | 'Select')

const OpenSeeNavBar = (props: IProps) => {
    const dispatch = useAppDispatch();
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
    const [hover, setHover] = React.useState<Hover>('None')


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
            <InfoSection hover={hover} setHover={(item) => setHover(item)} eventInfo={eventInfo} width={props.Width}/>
            <div className="col-sm-10 col-md-11 col-xl-7">
                {(props.Width < 1568 && props.Width > 1200) || props.Width < 1050 ?
                    <>
                        {/* Top Section */}
                        <ul className="navbar-nav navbar-expand justify-content-end">
                            <PlotUtilitiesSection hover={hover} setHover={(item) => setHover(item)} lookupInfo={lookupInfo} showAbout={showAbout}
                                showFFT={showFFT} setShowAbout={(item) => setShowAbout(item)} mouseMode={mouseMode} navigation={navigation} OpenDrawers={props.OpenDrawers} ToggleDrawer={props.ToggleDrawer}
                            />
                        </ul>
                        {/* Bottom section */}
                        <ul className="navbar-nav navbar-expand justify-content-end" style={{marginRight: '105px', marginBottom: '10px'}}>
                            <WidgetSection eventInfo={eventInfo} hover={hover} setHover={(item) => setHover(item)} mouseMode={mouseMode} navigation={navigation}
                                OpenDrawers={props.OpenDrawers} ToggleDrawer={props.ToggleDrawer} showFFT={showFFT} lookupInfo={lookupInfo} exportData={(item) => exportData(item)} />
                        </ul>
                    </> :
                    <>
                        <ul className="navbar-nav navbar-expand">
                            {/* Left Section */}
                            <WidgetSection eventInfo={eventInfo} hover={hover} setHover={(item) => setHover(item)} mouseMode={mouseMode} navigation={navigation}
                                OpenDrawers={props.OpenDrawers} ToggleDrawer={props.ToggleDrawer} showFFT={showFFT} lookupInfo={lookupInfo} exportData={(item) => exportData(item)} />
                            {/* Right section */}
                            <PlotUtilitiesSection hover={hover} setHover={(item) => setHover(item)} lookupInfo={lookupInfo} showAbout={showAbout}
                                showFFT={showFFT} setShowAbout={(item) => setShowAbout(item)} mouseMode={mouseMode} navigation={navigation} OpenDrawers={props.OpenDrawers} ToggleDrawer={props.ToggleDrawer}
                            />
                        </ul>
                    </>
                }

            </div>
        </>

    );

}

interface InfoSectionProps {
    eventInfo: OpenSee.IEventInfo,
    hover: Hover,
    setHover: (hover: Hover) => void,
    width: number
}

const InfoSection = (props: InfoSectionProps) => {
    return (
        <>
            <div className="d-none d-xl-block col-xl-4">
                <ul className="navbar-nav navbar-expand">
                    <li className="nav-item" onMouseEnter={() => props.setHover('Meter')} onMouseLeave={() => props.setHover('None')} data-tooltip={'meter'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Meter:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}> {props.eventInfo?.MeterName?.split(" ")[0]}</div>
                        <ToolTip Show={props.hover == 'Meter'} Position={'bottom'} Target={'meter'} Theme={'dark'} Zindex={9999}>
                            <p>{props.eventInfo?.MeterName}</p>
                        </ToolTip>
                    </li>
                    <li className="nav-item" onMouseEnter={() => props.setHover('Station')} onMouseLeave={() => props.setHover('None')} data-tooltip={'station'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Station:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{props.eventInfo?.StationName}</div>
                        <ToolTip Show={props.hover == 'Station'} Position={'bottom'} Target={'station'} Theme={'dark'} Zindex={9999}>
                            <p>{props.eventInfo?.StationName}</p>
                        </ToolTip>
                    </li>
                    <li className="nav-item" onMouseEnter={() => props.setHover('Asset')} onMouseLeave={() => props.setHover('None')} data-tooltip={'asset'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Asset:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{props.eventInfo?.AssetName?.split(" ")[0]}</div>
                        <ToolTip Show={props.hover == 'Asset'} Position={'bottom'} Target={'asset'} Theme={'dark'} Zindex={9999}>
                            <p>{props.eventInfo?.AssetName}</p>
                        </ToolTip>
                    </li>
                    <li className="nav-item" onMouseEnter={() => props.setHover('EType')} onMouseLeave={() => props.setHover('None')} data-tooltip={'etype'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '15px', paddingRight: '15px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Type:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{props.eventInfo?.EventName}</div>
                        <ToolTip Show={props.hover == 'EType'} Position={'bottom'} Target={'etype'} Theme={'dark'} Zindex={9999}>
                            <p>{props.eventInfo?.EventName}</p>
                        </ToolTip>
                    </li>
                    {props.width > 1695 ? 
                        <li className="nav-item" onMouseEnter={() => props.setHover('EInception')} onMouseLeave={() => props.setHover('None')} data-tooltip={'einception'} data-toggle="tooltip" data-placement="bottom"
                            style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '15px', paddingRight: '15px', minWidth: "60px", marginRight: "10px" }}>
                            <div style={{ textAlign: 'center', color: 'white' }}>Inception: </div>
                            <div style={{ textAlign: 'center', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {moment(props.eventInfo?.Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}
                            </div>
                            <ToolTip Show={props.hover == 'EInception'} Position={'bottom'} Target={'einception'} Theme={'dark'} Zindex={9999}>
                                <p>{moment(props.eventInfo?.Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}</p>
                            </ToolTip>
                        </li> : null}
                </ul>
            </div>
        </>
    )

}

const PlotTable = () => {
    const showPlots = useAppSelector(SelectDisplayed);
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
                        <td>
                            <label className="form-check-label">Analogs</label>
                        </td>
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

interface NavigationProps {
    lookupInfo: OpenSee.iNextBackLookup,
    navigation: OpenSee.EventNavigation,
    hover: Hover,
    setHover: (hover: Hover) => void,
}

const Navigation = (props: NavigationProps) => {
    const dispatch = useAppDispatch();

    return (
        <>
            {props.lookupInfo ?
                <li className="nav-item" style={{ width: '210px', marginTop: "10px", minWidth: '155px' }}>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <ToolTip Show={props.hover == 'NavLeft'} Position={'bottom'} Target={'back-btn'} Theme={'dark'}>
                                <p>Navigate to Previous Event in the {props.navigation}</p>
                                {props.navigation === "system" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.System.m_Item1 != null ? props.lookupInfo.System.m_Item1.StartTime : '')})</p>)}
                                {props.navigation === "station" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Station.m_Item1 != null ? props.lookupInfo.Station.m_Item1.StartTime : '')})</p>)}
                                {props.navigation === "meter" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Meter.m_Item1 != null ? props.lookupInfo.Meter.m_Item1.StartTime : '')})</p>)}
                                {props.navigation === "asset" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.System.m_Item1 != null ? props.lookupInfo.System.m_Item1.StartTime : '')})</p>)}
                            </ToolTip>
                            {(props.navigation == "system" ? <a href={(props.lookupInfo.System.m_Item1 != null ? "?eventID=" + props.lookupInfo.System.m_Item1.ID : '#')} id="system-back" key="system-back" className={'btn btn-primary' + (props.lookupInfo.System.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavLeft')} onMouseLeave={() => props.setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                            {(props.navigation == "station" ? <a href={(props.lookupInfo.Station.m_Item1 != null ? "?eventID=" + props.lookupInfo.Station.m_Item1.ID : '#')} id="station-back" key="station-back" className={'btn btn-primary' + (props.lookupInfo.Station.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavLeft')} onMouseLeave={() => props.setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                            {(props.navigation == "meter" ? <a href={(props.lookupInfo.Meter.m_Item1 != null ? "?eventID=" + props.lookupInfo.Meter.m_Item1.ID : '#')} id="meter-back" key="meter-back" className={'btn btn-primary' + (props.lookupInfo.Meter.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavLeft')} onMouseLeave={() => props.setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                            {(props.navigation == "asset" ? <a href={(props.lookupInfo.Asset.m_Item1 != null ? "?eventID=" + props.lookupInfo.Asset.m_Item1.ID : '#')} id="line-back" key="line-back" className={'btn btn-primary' + (props.lookupInfo.Asset.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavLeft')} onMouseLeave={() => props.setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                        </div>
                        <select id="next-back-selection" value={props.navigation} onChange={e => dispatch(SetNavigation(e.target.value as OpenSee.EventNavigation))}>
                            <option value="system">System</option>
                            <option value="station">Station</option>
                            <option value="meter">Meter</option>
                            <option value="asset">Asset</option>
                        </select>
                        <div className="input-group-append">
                            <ToolTip Show={props.hover == 'NavRight'} Position={'bottom'} Target={'next-btn'} Theme={'dark'}>
                                <p>Navigate to Next Event in the {props.navigation}</p>
                                {props.navigation === "system" && (<p style={{ textAlign: "center" }}>({props.lookupInfo.System.m_Item2 != null ? props.lookupInfo.System.m_Item2.StartTime : ''})</p>)}
                                {props.navigation === "station" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Station.m_Item2 != null ? props.lookupInfo.Station.m_Item2.StartTime : '')})</p>)}
                                {props.navigation === "meter" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Meter.m_Item2 != null ? props.lookupInfo.Meter.m_Item2.StartTime : '')})</p>)}
                                {props.navigation === "asset" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Asset.m_Item2 != null ? props.lookupInfo.Asset.m_Item2.StartTime : '')})</p>)}
                            </ToolTip>
                            {(props.navigation == "system" ? <a href={(props.lookupInfo.System.m_Item2 != null ? "?eventID=" + props.lookupInfo.System.m_Item2.ID : '#')} id="system-next" key="system-next" className={'btn btn-primary' + (props.lookupInfo.System.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavRight')} onMouseLeave={() => props.setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                            {(props.navigation == "station" ? <a href={(props.lookupInfo.Station.m_Item2 != null ? "?eventID=" + props.lookupInfo.Station.m_Item2.ID : '#')} id="station-next" key="station-next" className={'btn btn-primary' + (props.lookupInfo.Station.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavRight')} onMouseLeave={() => props.setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                            {(props.navigation == "meter" ? <a href={(props.lookupInfo.Meter.m_Item2 != null ? "?eventID=" + props.lookupInfo.Meter.m_Item2.ID : '#')} id="meter-next" key="meter-next" className={'btn btn-primary' + (props.lookupInfo.Meter.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavRight')} onMouseLeave={() => props.setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                            {(props.navigation == "asset" ? <a href={(props.lookupInfo.Asset.m_Item2 != null ? "?eventID=" + props.lookupInfo.Asset.m_Item2.ID : '#')} id="line-next" key="line-next" className={'btn btn-primary' + (props.lookupInfo.Asset.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavRight')} onMouseLeave={() => props.setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                        </div>
                    </div>
                </li> : null}
        </>
    )
}

interface iPlotUtilities {
    hover: Hover,
    setHover: (hover: Hover) => void,
    mouseMode: OpenSee.MouseMode,
    OpenDrawers: OpenSee.Drawers,
    navigation: OpenSee.EventNavigation,
    showAbout: boolean,
    showFFT: boolean,
    lookupInfo: OpenSee.iNextBackLookup,
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    setShowAbout: (about: boolean) => void
}

const PlotUtilitiesSection = (props: iPlotUtilities) => {
    const dispatch = useAppDispatch();

    return (
        <>
            <li className="nav-item" style={{ width: '210px', position: "relative", marginTop: "10px" }}>
                <div className="btn-group d-flex" role="group">
                    {/*Zoom*/}
                    <button type="button" className={"btn btn-primary" + (props.mouseMode == "zoom" ? " active" : "")} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ padding: '0.195rem' }}
                        onMouseEnter={() => props.setHover('Zoom Mode')} onMouseLeave={() => props.setHover('None')} data-tooltip={'zoom-btn'}
                        data-placement="bottom" onClick={() => dispatch(SetMouseMode("zoom"))}>
                        < i style={{ fontStyle: "normal", fontSize: "25px" }} >{Zoom}</i>
                    </button>
                    <div className="dropdown-menu" style={{ position: "absolute" }}>
                        <a key={"option-x"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('x'))} style={{ cursor: 'pointer' }}>
                            <i style={{ fontStyle: "normal" }}>{TimeRect}</i> Time
                        </a>
                        <a key={"option-y"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('y'))} style={{ cursor: 'pointer' }}>
                            <i style={{ fontStyle: "normal" }}>{ValueRect}</i> Value
                        </a>
                        <a key={"option-xy"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('xy'))} style={{ cursor: 'pointer' }}>
                            <i style={{ fontStyle: "normal" }}>{Square}</i> Rectangle
                        </a>
                    </div>

                    <ToolTip Show={props.hover == 'Zoom Mode'} Position={'bottom'} Target={'zoom-btn'} Theme={'dark'}>
                        <p>Zoom</p>
                    </ToolTip>

                    {/*Pan*/}
                    <button type="button" className={"btn btn-primary" + (props.mouseMode == "pan" ? " active" : "")} style={{ padding: '0.195rem' }}
                        onMouseEnter={() => props.setHover('Pan')}
                        onMouseLeave={() => props.setHover('None')} data-tooltip={'pan-btn'}
                        data-toggle="tooltip" data-placement="bottom" onClick={() => dispatch(SetMouseMode("pan"))}>
                        <i style={{ fontStyle: "normal", fontSize: "25px" }} >{Pan}</i>
                    </button>
                    <ToolTip Show={props.hover == 'Pan'} Position={'bottom'} Target={'pan-btn'} Theme={'dark'}>
                        <p>Pan</p>
                    </ToolTip>

                    { /*Select*/}
                    <button type="button" className={"btn btn-" + (props.OpenDrawers.AccumulatedPoints || props.OpenDrawers.ToolTipDelta ? "primary" : "secondary") + (props.mouseMode == "select" ? " active" : "")} style={{ padding: '0.195rem' }}
                        disabled={!props.OpenDrawers.AccumulatedPoints && !props.OpenDrawers.ToolTipDelta}
                        onMouseEnter={() => props.setHover('Select')}
                        onMouseLeave={() => props.setHover('None')} data-tooltip={'select-btn'}
                        data-toggle="tooltip" data-placement="bottom" onClick={() => { dispatch(SetMouseMode("select")); }}>
                        <i style={{ fontStyle: "normal", fontSize: "25px" }} >{Point}</i>
                    </button>
                    <ToolTip Show={props.hover == 'Select'} Position={'bottom'} Target={'select-btn'} Theme={'dark'}>
                        <p>Select</p>
                    </ToolTip>

                    {/*FFT Move*/}
                    <button type="button" className={"btn btn-" + (props.showFFT ? "primary" : "secondary") + (props.mouseMode === "fftMove" ? " active" : "")} style={{ padding: '0.195rem' }}
                        onClick={() => dispatch(SetMouseMode("fftMove"))}
                        disabled={!props.showFFT}
                        onMouseEnter={() => props.setHover('FFTMove')}
                        onMouseLeave={() => props.setHover('None')} data-tooltip={'fftMove-btn'}
                        data-toggle="tooltip" data-placement="bottom">
                        <i style={{ fontStyle: "normal", fontSize: "20px" }}>{FFT}</i>
                    </button>
                    <ToolTip Show={props.hover == 'FFTMove'} Position={'bottom'} Target={'fftMove-btn'} Theme={'dark'}>
                        <p>FFT Move</p>
                    </ToolTip>

                    {/*reset*/}
                    <button className="btn btn-primary" style={{ padding: '0.195rem' }}
                        onMouseEnter={() => props.setHover('Reset Zoom')} onMouseLeave={() => props.setHover('None')} data-tooltip={'reset-btn'} data-toggle="tooltip" data-placement="bottom" onClick={() => dispatch(ResetZoom({ start: new Date(eventStartTime + "Z").getTime(), end: new Date(eventEndTime + "Z").getTime() }))}>
                        <i style={{ fontStyle: "normal", fontSize: "21px" }}>{Reset}</i>
                    </button>
                    <ToolTip Show={props.hover == 'Reset Zoom'} Position={'bottom'} Target={'reset-btn'} Theme={'dark'}>
                        <p>Reset Zoom</p>
                    </ToolTip>

                </div>
            </li>

            <li className="nav-item" style={{ width: '74px', marginTop: "10px" }}>
                <button className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => props.setHover('Settings')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'settings-btn'} data-toggle="tooltip" data-placement="bottom"
                    onClick={() => { props.ToggleDrawer('Settings', !props.OpenDrawers.Settings); }}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px" }}>{Settings}</i>
                </button>
                <ToolTip Show={props.hover == 'Settings'} Position={'bottom'} Target={'settings-btn'} Theme={'dark'}>
                    <p>Settings</p>
                </ToolTip>
            </li>

            <Navigation hover={props.hover} setHover={(item) => props.setHover(item)} lookupInfo={props.lookupInfo} navigation={props.navigation} />

            <li className="nav-item" style={{ width: '74px', marginTop: "10px" }}>
                <button className="btn btn-primary" style={{ borderRadius: "4rem", padding: "0.495rem" }}
                    onMouseEnter={() => props.setHover('Help')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'help-btn'}
                    data-toggle="tooltip" data-placement="bottom" onClick={() => props.setShowAbout(true)}>
                    <i style={{ fontStyle: "normal", fontSize: "20px" }}>{Help}</i>
                </button>
                <ToolTip Show={props.hover == 'Help'} Position={'bottom'} Target={'help-btn'} Theme={'dark'}>
                    <p>Help</p>
                </ToolTip>
                <About isOpen={props.showAbout} closeCallback={() => props.setShowAbout(false)} />

            </li>
        </>
    )
}

interface iWidgets {
    hover: Hover,
    setHover: (hover: Hover) => void,
    mouseMode: OpenSee.MouseMode,
    OpenDrawers: OpenSee.Drawers,
    navigation: OpenSee.EventNavigation,
    showFFT: boolean,
    lookupInfo: OpenSee.iNextBackLookup,
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    exportData: (type: string) => void,
    eventInfo: OpenSee.IEventInfo
}

const WidgetSection = (props: iWidgets) => {
    const dispatch = useAppDispatch();

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
                <ToolTip Show={props.hover == 'Waveform'} Position={'bottom'} Target={'waveform-btn'} Theme={'dark'}>
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
                <ToolTip Show={props.hover == 'Show Points'} Position={'bottom'} Target={'points-btn'} Theme={'dark'}>
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
                <ToolTip Show={props.hover == 'Clock'} Position={'bottom'} Target={'phasorclock-btn'} Theme={'dark'}>
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
                    <a key={"option-scalar"} className="dropdown-item" onClick={() => props.ToggleDrawer('ScalarStats', !props.OpenDrawers.ScalarStats)} style={{cursor: 'pointer'}}>
                        <i style={{ fontStyle: "normal" }}>Scalar Stats</i>
                    </a>
                    {props.eventInfo?.EventName === "Snapshot" ?
                        <a key={"option-harmonic"} className="dropdown-item" onClick={() => props.ToggleDrawer('ScalarStats', !props.OpenDrawers.HarmonicStats)} style={{ cursor: 'pointer' }}>
                            <i style={{ fontStyle: "normal" }}>Harmonic Stats</i>
                        </a>
                        : null}
                </div>
                <ToolTip Show={props.hover == 'Stat'} Position={'bottom'} Target={'stats-btn'} Theme={'dark'}>
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
                <ToolTip Show={props.hover == 'Sags'} Position={'bottom'} Target={'sags-btn'} Theme={'dark'}>
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
                <ToolTip Show={props.hover == 'FFTTable'} Position={'bottom'} Target={'fftTable-btn'} Theme={'dark'}>
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
                <ToolTip Show={props.hover == 'Lightning'} Position={'bottom'} Target={'lightning-btn'} Theme={'dark'}>
                    <p>Lightning Data</p>
                </ToolTip>
            </li>

            <li className="nav-item dropdown" style={{ width: '84px', position: "relative", marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => props.setHover('Export')}
                    onMouseLeave={() => props.setHover('None')} data-tooltip={'export-btn'}
                    data-placement="bottom">
                    < i style={{ fontStyle: "normal", fontSize: "25px" }} >{exportBtn}</i>
                </button>
                <div className="dropdown-menu" style={{ position: "absolute" }}>
                    <a className="dropdown-item" onClick={() => { props.exportData('csv') }} style={{ cursor: 'pointer' }}>
                        Export CSV
                    </a>
                    <a className="dropdown-item" onClick={() => { props.exportData('pqds') }} style={{ cursor: 'pointer' }}>
                        Export PQDS
                    </a>
                    {props.showFFT ?
                        <a className="dropdown-item" onClick={() => { props.exportData('fft') }} style={{ cursor: 'pointer' }}>
                            Export FFT
                        </a>
                        : null}
                </div>
                <ToolTip Show={props.hover == 'Export'} Position={'bottom'} Target={'export-btn'} Theme={'dark'}>
                    <p>Export</p>
                </ToolTip>
            </li>
        </>
    )
}

export default OpenSeeNavBar;
