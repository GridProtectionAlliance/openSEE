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

import PointWidget from './../jQueryUI Widgets/AccumulatedPoints';
import ToolTipWidget from './../jQueryUI Widgets/Tooltip';
import ToolTipDeltaWidget from '../jQueryUI Widgets/TooltipWithDelta';
import PolarChartWidget from './../jQueryUI Widgets/PolarChart';
import ScalarStatsWidget from '../jQueryUI Widgets/ScalarStats';
import HarmonicStatsWidget from '../jQueryUI Widgets/HarmonicStats';
import TimeCorrelatedSagsWidget from './../jQueryUI Widgets/TimeCorrelatedSags';
import LightningDataWidget from './../jQueryUI Widgets/LightningData';

import { OpenSee } from '../global';
import { clone } from 'lodash';
import SettingsWidget from '../jQueryUI Widgets/SettingWindow';
import { useSelector, useDispatch } from 'react-redux';
import { selectMouseMode, SetMouseMode, ResetZoom, SetZoomMode, selectZoomMode, selectEventID } from '../Store/dataSlice';


declare var homePath: string;
declare var eventStartTime: string;
declare var eventEndTime: string;

interface IProps {
    EventData: OpenSee.iPostedData,
    Lookup: iNextBackLookup,
    navigation: OpenSee.EventNavigation,
    displayVolt: boolean,
    displayCur: boolean,
    displayTCE: boolean,
    displayDigitals: boolean,
    displayAnalogs: boolean,

}
const OpenSeeNavBar = (props: IProps) => {
    const dispatch = useDispatch()
    const mouseMode = useSelector(selectMouseMode);
    const zoomMode = useSelector(selectZoomMode);
    const eventId = useSelector(selectEventID);

    const [showPoints, setShowPoints] = React.useState<boolean>(false);
    const [showToolTip, setShowToolTip] = React.useState<boolean>(false);
    const [showToolTipDelta, setShowToolTipDelta] = React.useState<boolean>(false);
    const [showPolar, setShowPolar] = React.useState<boolean>(false);
    const [showScalarStats, setShowScalarStats] = React.useState<boolean>(false);
    const [showHarmonicStats, setShowHarmonicStats] = React.useState<boolean>(false);
    const [showCorrelatedSags, setShowCorrelatedSags] = React.useState<boolean>(false);
    const [showLightning, setShowLightning] = React.useState<boolean>(false);

    const [showSettings, setShowSettings] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (showPoints) {
            $('#accumulatedpoints').show();
            let oldMode = clone(mouseMode);
            dispatch(SetMouseMode('select'))
            return () => {
                $('#accumulatedpoints').hide();
                dispatch(SetMouseMode(oldMode))
            }
        }
        return () => { }

    }, [showPoints])

    React.useEffect(() => {
        if (showToolTip) {
            $('#unifiedtooltip').show();
            return () => {
                $('#unifiedtooltip').hide();
            }
        }
        return () => { }

    }, [showToolTip])

    React.useEffect(() => {
        if (showToolTipDelta) {
            $('#tooltipwithdelta').show();
            let oldMode = clone(mouseMode);
            dispatch(SetMouseMode('select'))
            return () => {
                $('#tooltipwithdelta').hide();
                dispatch(SetMouseMode(oldMode))
            }
        }
        return () => { }

    }, [showToolTipDelta])

    React.useEffect(() => {
        if (showPolar) {
            $('#phasor').show();
            
            return () => {
                $('#phasor').hide();
            }
        }
        return () => { }

    }, [showPolar])

    React.useEffect(() => {
        if (showScalarStats) {
            $('#scalarstats').show();
           
            return () => {
                $('#scalarstats').hide();
            }
        }
        return () => { }

    }, [showScalarStats])

    React.useEffect(() => {
        if (showHarmonicStats) {
            $('#harmonicstats').show();
           
            return () => {
                $('#harmonicstats').hide();
            }
        }
        return () => { }

    }, [showHarmonicStats])

    React.useEffect(() => {
        if (showCorrelatedSags) {
            $('#correlatedsags').show();
            return () => {
                $('#correlatedsags').hide();
            }
        }
        return () => { }

    }, [showCorrelatedSags])

    React.useEffect(() => {
        if (showSettings) {
            $('#settings').show();
            return () => {
                $('#settings').hide();
            }
        }
        return () => { }

    }, [showSettings])

    

    function exportData(type) {
        window.open(homePath + `CSVDownload.ashx?type=${type}&eventID=${eventId}` +
            `${props.displayVolt != undefined ? `&displayVolt=${props.displayVolt}` : ``}` +
            `${props.displayCur != undefined ? `&displayCur=${props.displayCur}` : ``}` +
            `${props.displayTCE != undefined ? `&displayTCE=${props.displayTCE}` : ``}` +
            `${props.displayDigitals != undefined ? `&breakerdigitals=${props.displayDigitals}` : ``}` +
            `${props.displayAnalogs != undefined ? `&displayAnalogs=${this.props.displayAnalogs}` : ``}` +
            //`${props.displayAnalytics != undefined ? `&displayAnalytics=${this.props.displayAnalytics}` : ``}` +
            //`${this.props.filterOrder != undefined ? `&filterOrder=${this.props.filterOrder}` : ``}` +
            //`${this.props.Trc != undefined ? `&Trc=${this.props.Trc}` : ``}` +
            //`${this.props.harmonic != undefined ? `&harmonic=${this.props.harmonic}` : ``}` +
            `&Meter=${props.EventData.MeterName}` +
            `&EventType=${props.EventData.EventName}`
        );
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                    <li className="nav-item dropdown" style={{ width: '150px' }}>
                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Data Tools</a>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <a className="dropdown-item" onClick={() => setShowPoints(!showPoints) }>{(showPoints ? 'Close Points' : 'Show Points')}</a>
                            <a className="dropdown-item" onClick={() => setShowToolTip(!showToolTip) }>{(showToolTip ? 'Close Tooltip' : 'Show Tooltip')}</a>
                            <a className="dropdown-item" onClick={() => setShowToolTipDelta(!showToolTipDelta) }>{(showToolTipDelta ? 'Close Tooltip w/ Delta' : 'Show Tooltip w/ Delta')} </a>
                            <a className="dropdown-item" onClick={() => setShowPolar(!showPolar) }>{(showToolTipDelta ? 'Close Phasor' : 'Show Phasor')}</a>
                            <a className="dropdown-item" onClick={() => setShowScalarStats(!showScalarStats) }>{(showScalarStats ? 'Close Stats' : 'Show Stats')}</a>
                            <a className="dropdown-item" onClick={() => setShowCorrelatedSags(!showCorrelatedSags)}>{(showCorrelatedSags ? 'Close Correlated Sags' : 'Show Correlated Sags')}</a>
                            {props.EventData != undefined ? 
                                <>
                                    {(props.EventData.enableLightningData ? <a className="dropdown-item" onClick={() => setShowLightning(!showLightning)} >{(showLightning ? 'Close Lightning Data' : 'Show Lightning Data')} </a> : null)}
                                    {(props.EventData.EventName == "Snapshot" ? <a className="dropdown-item" onClick={() => setShowHarmonicStats(!showHarmonicStats) }>{(showHarmonicStats ? 'Hide Harmonics' : 'Show Harmonics')}</a> : null)}
                            </> : null
                            }

                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" onClick={() => { }}>Export CSV</a>
                            <a className="dropdown-item" onClick={() => { }}>Export PQDS</a>

                        </div>
                    </li>
                    <li className="nav-item" style={{ width: 'calc(100% - 741px)', textAlign: 'center' }}>

                    </li>
                    <li className="nav-item" style={{ width: '123px' }}>
                        <div className="btn-group" role="group">
                            <button type="button" className={"btn btn-primary " + (mouseMode == "zoom" ? "active" : "")} onClick={() => dispatch(SetMouseMode("zoom"))}
                                data-toggle="tooltip" data-placement="bottom" title="Zoom">
                                <i className="fa fa-search" ></i>
                            </button>
                            <button type="button" className={"btn btn-primary " + (mouseMode == "pan" ? "active" : "")} onClick={() => dispatch(SetMouseMode("pan"))}
                                data-toggle="tooltip" data-placement="bottom" title="Pan">
                                <i className="fa fa-arrows" ></i>
                            </button>
                        </div>
                    </li>

                    <li className="nav-item" style={{ width: '84px' }}>
                        <div className="btn-group dropright">
                            <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ borderRadius: "0.25rem" }}>
                                {zoomMode == "x" ? < i className="fa fa-arrows-h" ></i> : null}
                                {zoomMode == "y" ? < i className="fa fa-arrows-v" ></i> : null}
                                {zoomMode == "xy" ? < i className="fa fa-arrows" ></i> : null}
                            </button>
                            <div className="dropdown-menu">
                                <a key={"option-x"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('x'))}>
                                    <i className="fa fa-arrows-h" ></i> Time
                                    </a>
                                <a key={"option-y"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('y'))}>
                                    <i className="fa fa-arrows-v" ></i> Value
                                    </a>
                                <a key={"option-xy"} className="dropdown-item" onClick={() => dispatch(SetZoomMode('xy'))}>
                                    <i className="fa fa-arrows" ></i> Rectangle
                                    </a>
                            </div>
                        </div>
                    </li>
                    <li className="nav-item" style={{ width: '156px' }}>
                        <button className="btn btn-primary" onClick={() => dispatch(ResetZoom({ start: new Date(eventStartTime + "Z").getTime(), end: new Date(eventEndTime + "Z").getTime() }))}>Reset Zoom</button>
                    </li>
                    <li className="nav-item" style={{ width: '84px' }}>
                        <button className="btn btn-primary" onClick={() => setShowSettings(!showSettings)}>
                            <i className="fa fa-cog" ></i>
                        </button>
                    </li>
                    {props.Lookup != undefined ?
                        <li className="nav-item" style={{ width: '193px' }}>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    {(props.navigation == "system" ? <a href={(props.Lookup.System.m_Item1 != null ? "?eventid=" + props.Lookup.System.m_Item1.ID + "&navigation=system" : '#')} id="system-back" key="system-back" className={'btn btn-primary' + (props.Lookup.System.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item1 != null ? props.Lookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                    {(props.navigation == "station" ? <a href={(props.Lookup.Station.m_Item1 != null ? "?eventid=" + props.Lookup.Station.m_Item1.ID + "&navigation=station" : '#')} id="station-back" key="station-back" className={'btn btn-primary' + (props.Lookup.Station.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.Station.m_Item1 != null ? props.Lookup.Station.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                    {(props.navigation == "meter" ? <a href={(props.Lookup.Meter.m_Item1 != null ? "?eventid=" + props.Lookup.Meter.m_Item1.ID + "&navigation=meter" : '#')} id="meter-back" key="meter-back" className={'btn btn-primary' + (props.Lookup.Meter.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.Meter.m_Item1 != null ? props.Lookup.Meter.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                    {(props.navigation == "asset" ? <a href={(props.Lookup.Line.m_Item1 != null ? "?eventid=" + props.Lookup.Line.m_Item1.ID + "&navigation=asset" : '#')} id="line-back" key="line-back" className={'btn btn-primary' + (props.Lookup.Line.m_Item1 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item1 != null ? props.Lookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                </div>
                                <select id="next-back-selection" value={props.navigation} onChange={(e) => this.props.stateSetter({ navigation: e.target.value })}>
                                    <option value="system">System</option>
                                    <option value="station">Station</option>
                                    <option value="meter">Meter</option>
                                    <option value="asset">Asset</option>
                                </select>
                                <div className="input-group-append">

                                    {(props.navigation == "system" ? <a href={(props.Lookup.System.m_Item2 != null ? "?eventid=" + props.Lookup.System.m_Item2.ID + "&navigation=system" : '#')} id="system-next" key="system-next" className={'btn btn-primary' + (props.Lookup.System.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.System.m_Item2 != null ? props.Lookup.System.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                    {(props.navigation == "station" ? <a href={(props.Lookup.Station.m_Item2 != null ? "?eventid=" + props.Lookup.Station.m_Item2.ID + "&navigation=station" : '#')} id="station-next" key="station-next" className={'btn btn-primary' + (props.Lookup.Station.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Station.m_Item2 != null ? props.Lookup.Station.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                    {(props.navigation == "meter" ? <a href={(props.Lookup.Meter.m_Item2 != null ? "?eventid=" + props.Lookup.Meter.m_Item2.ID + "&navigation=meter" : '#')} id="meter-next" key="meter-next" className={'btn btn-primary' + (props.Lookup.Meter.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Meter.m_Item2 != null ? props.Lookup.Meter.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                    {(props.navigation == "asset" ? <a href={(props.Lookup.Line.m_Item2 != null ? "?eventid=" + props.Lookup.Line.m_Item2.ID + "&navigation=asset" : '#')} id="line-next" key="line-next" className={'btn btn-primary' + (props.Lookup.Line.m_Item2 == null ? ' disabled' : '')} title={(props.Lookup.Line.m_Item2 != null ? props.Lookup.Line.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                </div>
                            </div>
                        </li> : null}

                </ul>
            </div>
            <PointWidget closeCallback={() => setShowPoints(false)} isOpen={showPoints} />
            <ToolTipWidget closeCallback={() => setShowToolTip(false)} isOpen={showToolTip} />
            <ToolTipDeltaWidget closeCallback={() => setShowToolTipDelta(false)} isOpen={showToolTipDelta} />
            <PolarChartWidget closeCallback={() => setShowPolar(false)} isOpen={showPolar} />
            <ScalarStatsWidget eventId={eventId} closeCallback={() => setShowScalarStats(false)} exportCallback={() => exportData('stats')} />
            <HarmonicStatsWidget eventId={eventId} closeCallback={() => setShowHarmonicStats(false)} exportCallback={() => exportData('harmonics')} /> 
            <TimeCorrelatedSagsWidget eventId={eventId} closeCallback={() => setShowCorrelatedSags(false)} exportCallback={() => exportData('correlatedsags')} />
            <LightningDataWidget eventId={eventId} closeCallback={() => setShowLightning(false)} />
            <SettingsWidget closeCallback={() => setShowSettings(false)} isOpen={showSettings} />
        </nav>
    );

}

export default OpenSeeNavBar;

/*
class OpenSEENavbar extends React.Component {
    props: {
        TableData: Map<string, Array<iD3PointOfInterest>>,
        VoltageVectors: Array<Vector>,
        CurrentVectors: Array<Vector>,
        eventid: number,
        resetZoom: any,
        stateSetter: Function,
        PostedData: any,
        Hover: number,
        nextBackLookup: any,
        selected: string,
        startDate: string,
        endDate: string,
        
        displayVolt: boolean,
        displayCur: boolean,
        displayTCE:boolean,
        breakerdigitals: boolean,
        displayAnalogs: boolean,
        showCompareChart: boolean,
        displayCompare: boolean,
        displayAnalytics: string,
        filterOrder: number,
        Trc: number,
        harmonic: number,

        unitData: GraphUnits,
        colorData: Colors,
        zoomMode: ZoomMode,
        mouseMode: MouseMode,
        voltageLimits: yLimits,
        currentLimits: yLimits,
        tceLimits: yLimits,
        digitalLimits: yLimits,
        analogLimits: yLimits,
        analyticLimits: yLimits,
        activeUnits:  (lbl:string) => iActiveUnits,
    }
    state: {
        showComtradeExportButton: boolean,
    }
    constructor(props, context) {
        super(props, context);

        this.state = {
            showComtradeExportButton: false,
        }
    }
 
    componentDidMount() {
        this.getOutputChannelCount();
    }

    getOutputChannelCount(): void {
        $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetOutputChannelCount/${this.props.eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => this.setState({ showComtradeExportButton: data > 0 }));
        
    }

    render() {
               
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item dropdown" style={{width: '150px'}}>
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Data Tools</a>
                            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <a className="dropdown-item" onClick={this.showhidePoints.bind(this)}>Show Points</a>
                                <a className="dropdown-item" onClick={this.showhideTooltip.bind(this)}>Show Tooltip</a>
                                <a className="dropdown-item" onClick={this.showhideTooltipWithDelta.bind(this)}>Show Tooltip w/ Delta</a>
                                <a className="dropdown-item" onClick={this.showhidePhasor.bind(this)}>Show Phasor</a>
                                <a className="dropdown-item" onClick={this.showhideStats.bind(this)}>Show Stats</a>
                                <a className="dropdown-item" onClick={this.showhideCorrelatedSags.bind(this)}>Show Correlated Sags</a>

                                {(this.props.PostedData.enableLightningData ? <a className="dropdown-item" onClick={this.showhideLightningData.bind(this)}>Show Lightning Data</a> : null)}
                                {(this.props.PostedData.postedEventName == "Snapshot" ? <a className="dropdown-item" onClick={this.showhideHarmonics.bind(this)}>Show Harmonics</a> : null)}

                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" onClick={this.exportData.bind(this, "csv")}>Export CSV</a>
                                <a className="dropdown-item" onClick={this.exportData.bind(this, "pqds")}>Export PQDS</a>
                                
                            </div>
                        </li>
                        <li className="nav-item" style={{ width: 'calc(100% - 741px)', textAlign: 'center' }}>

                        </li>
                        <li className="nav-item" style={{ width: '123px' }}>
                            <div className="btn-group" role="group">
                                <button type="button" className={"btn btn-primary " + (this.props.mouseMode == "zoom" ? "active" : "")} onClick={() => this.props.stateSetter({ mouseMode: "zoom" })}
                                    data-toggle="tooltip" data-placement="bottom" title="Zoom">
                                    <i className="fa fa-search" ></i>
                                </button>
                                <button type="button" className={"btn btn-primary " + (this.props.mouseMode == "pan" ? "active" : "")} onClick={() => this.props.stateSetter({ mouseMode: "pan" })}
                                    data-toggle="tooltip" data-placement="bottom" title="Pan">
                                    <i className="fa fa-arrows" ></i>
                                </button>
                            </div>
                        </li>

                        <li className="nav-item" style={{ width: '84px' }}>
                            <div className="btn-group dropright">
                                <button type="button" className="btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ borderRadius: "0.25rem" }}>
                                    {this.props.zoomMode == "x" ? < i className="fa fa-arrows-h" ></i> : null}
                                    {this.props.zoomMode == "y" ? < i className="fa fa-arrows-v" ></i> : null}
                                    {this.props.zoomMode == "xy" ? < i className="fa fa-arrows" ></i> : null}
                                </button>
                                <div className="dropdown-menu">
                                    <a key={"option-x"} className="dropdown-item" onClick={() => { this.props.stateSetter({ zoomMode: "x" })}}>
                                        <i className="fa fa-arrows-h" ></i> Time
                                    </a>
                                    <a key={"option-y"} className="dropdown-item" onClick={() => { this.props.stateSetter({ zoomMode: "y" })}}>
                                        <i className="fa fa-arrows-v" ></i> Value
                                    </a>
                                    <a key={"option-xy"} className="dropdown-item" onClick={() => { this.props.stateSetter({ zoomMode: "xy" })}}>
                                        <i className="fa fa-arrows" ></i> Rectangle
                                    </a>
                                </div>
                            </div>
                        </li>
                        <li className="nav-item" style={{ width: '156px' }}>
                            <button className="btn btn-primary" onClick={this.props.resetZoom}>Reset Zoom</button>
                        </li>
                        <li className="nav-item" style={{ width: '84px' }}>
                            <button className="btn btn-primary" onClick={this.showhideSetting.bind(this)}>
                                <i className="fa fa-cog" ></i>
                            </button>
                        </li>
                        <li className="nav-item" style={{ width: '193px' }}>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    {(this.props.selected == "system" ? <a href={(this.props.nextBackLookup.System.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.System.m_Item1.ID + "&navigation=system" : '#')} id="system-back" key="system-back" className={'btn btn-primary' + (this.props.nextBackLookup.System.m_Item1 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.System.m_Item1 != null ? this.props.nextBackLookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px'}}>&lt;</a> : null)}
                                    {(this.props.selected == "station" ? <a href={(this.props.nextBackLookup.Station.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Station.m_Item1.ID + "&navigation=station" : '#')} id="station-back" key="station-back" className={'btn btn-primary' + (this.props.nextBackLookup.Station.m_Item1 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Station.m_Item1 != null ? this.props.nextBackLookup.Station.m_Item1.StartTime : '')} style={{ padding: '4px 20px'}}>&lt;</a> : null)}
                                    {(this.props.selected == "meter" ? <a href={(this.props.nextBackLookup.Meter.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Meter.m_Item1.ID + "&navigation=meter" : '#')} id="meter-back" key="meter-back" className={'btn btn-primary' + (this.props.nextBackLookup.Meter.m_Item1 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Meter.m_Item1 != null ? this.props.nextBackLookup.Meter.m_Item1.StartTime : '')} style={{ padding: '4px 20px' }}>&lt;</a> : null)}
                                    {(this.props.selected == "line" ? <a href={(this.props.nextBackLookup.Line.m_Item1 != null ? "?eventid=" + this.props.nextBackLookup.Line.m_Item1.ID + "&navigation=line" : '#')} id="line-back" key="line-back" className={'btn btn-primary' + (this.props.nextBackLookup.Line.m_Item1 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.System.m_Item1 != null ? this.props.nextBackLookup.System.m_Item1.StartTime : '')} style={{ padding: '4px 20px'}}>&lt;</a> : null)}
                                </div>
                                <select id="next-back-selection" value={this.props.selected} onChange={(e) => this.props.stateSetter({ navigation: e.target.value })}>
                                    <option value="system">System</option>
                                    <option value="station">Station</option>
                                    <option value="meter">Meter</option>
                                    <option value="line">Line</option>
                                    </select>
                                <div className="input-group-append">

                                    {(this.props.selected == "system" ? <a href={(this.props.nextBackLookup.System.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.System.m_Item2.ID + "&navigation=system" : '#')} id="system-next" key="system-next" className={'btn btn-primary' + (this.props.nextBackLookup.System.m_Item2 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.System.m_Item2 != null ? this.props.nextBackLookup.System.m_Item2.StartTime : '')} style={{ padding: '4px 20px' }}>&gt;</a> : null)}
                                    {(this.props.selected == "station" ? <a href={(this.props.nextBackLookup.Station.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Station.m_Item2.ID + "&navigation=station" : '#')} id="station-next" key="station-next" className={'btn btn-primary' + (this.props.nextBackLookup.Station.m_Item2 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Station.m_Item2 != null ? this.props.nextBackLookup.Station.m_Item2.StartTime : '')} style={{ padding: '4px 20px'}}>&gt;</a> : null)}
                                    {(this.props.selected == "meter" ? <a href={(this.props.nextBackLookup.Meter.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Meter.m_Item2.ID + "&navigation=meter" : '#')} id="meter-next" key="meter-next" className={'btn btn-primary' + (this.props.nextBackLookup.Meter.m_Item2 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Meter.m_Item2 != null ? this.props.nextBackLookup.Meter.m_Item2.StartTime : '')} style={{ padding: '4px 20px'}}>&gt;</a> : null)}
                                    {(this.props.selected == "line" ? <a href={(this.props.nextBackLookup.Line.m_Item2 != null ? "?eventid=" + this.props.nextBackLookup.Line.m_Item2.ID + "&navigation=line" : '#')} id="line-next" key="line-next" className={'btn btn-primary' + (this.props.nextBackLookup.Line.m_Item2 == null ? ' disabled' : '')} title={(this.props.nextBackLookup.Line.m_Item2 != null ? this.props.nextBackLookup.Line.m_Item2.StartTime : '')} style={{ padding: '4px 20px'}}>&gt;</a> : null)}
                                </div>
                            </div>
                        </li>
                        
                    </ul>
                </div>
               
                
              
                <SettingWindow
                    showI={this.props.displayCur}
                    showV={this.props.displayVolt}
                    stateSetter={this.props.stateSetter}
                    unitSetting={this.props.unitData}
                    colorSetting={this.props.colorData}
                    showAnalogs={this.props.displayAnalogs}
                    showdigitals={this.props.breakerdigitals}
                    showTCE={this.props.displayTCE}
                    showAnalytics={this.props.displayAnalytics}
                    voltageLimits={this.props.voltageLimits}
                    currentLimits={this.props.currentLimits}
                    tceLimits={this.props.tceLimits}
                    digitalLimits={this.props.digitalLimits}
                    analogLimits={this.props.analogLimits}
                    analyticLimits={this.props.analyticLimits}
                    showCompare={this.props.displayCompare}
                    compareChart={this.props.showCompareChart}
    />
            </nav>
        );
 
        //   {this.state.showComtradeExportButton ? <a className="dropdown-item" onClick={this.exportComtrade.bind(this)}>Export COMTRADE</a> : null}   
        
    }

    showhidePoints(evt) {
        this.props.stateSetter({ PointsTable: [] });
        $('#accumulatedpoints').show();
    }

    showhideTooltip(evt) {
        $('#unifiedtooltip').show();
        //$('.legendCheckbox').show();
    }

    showhideTooltipWithDelta(evt) {
        this.props.stateSetter({ PointsTable: [] });
        $('#tooltipwithdelta').show();
        //$('.legendCheckbox').show();
    }

    showhidePhasor(evt) {
        $('#phasor').show();
    }

    showhideStats(evt) {
        $('#scalarstats').show();
    }

    showhideCorrelatedSags(evt) {
        $('#correlatedsags').show();
    }

    showhideHarmonics(evt) {
        $('#harmonicstats').show();
    }

    showhideLightningData() {
        $('#lightningquery').show();
    }

    showhideSetting() {
        $('#settings').show();
    }


    exportData(type) {
        window.open(homePath + `CSVDownload.ashx?type=${type}&eventID=${this.props.eventid}` + 
            `${this.props.displayVolt != undefined ? `&displayVolt=${this.props.displayVolt}` : ``}` + 
            `${this.props.displayCur != undefined ? `&displayCur=${this.props.displayCur}` : ``}` + 
            `${this.props.displayTCE != undefined ? `&displayTCE=${this.props.displayTCE}` : ``}` + 
            `${this.props.breakerdigitals != undefined ? `&breakerdigitals=${this.props.breakerdigitals}` : ``}` + 
            `${this.props.displayAnalogs != undefined ? `&displayAnalogs=${this.props.displayAnalogs}` : ``}` +
            `${this.props.displayAnalytics != undefined ? `&displayAnalytics=${this.props.displayAnalytics}` : ``}` +
            `${this.props.filterOrder != undefined ? `&filterOrder=${this.props.filterOrder}` : ``}` + 
            `${this.props.Trc != undefined ? `&Trc=${this.props.Trc}` : ``}` +
            `${this.props.harmonic != undefined ? `&harmonic=${this.props.harmonic}` : ``}` +
            `&Meter=${this.props.PostedData.postedMeterName}` +
            `&EventType=${this.props.PostedData.postedEventName}`
            );
            +
            `${this.props.startDate != undefined ? `&startDate=${this.props.startDate}` : ``}` +
            `${this.props.endDate != undefined ? `&endDate=${this.props.endDate}` : ``}` +
            `&Meter=${this.props.PostedData.postedMeterName}` +
            `&EventType=${this.props.PostedData.postedEventName}`); 
        
    }

    exportComtrade(evt) {
        window.open(homePath + `OpenSEEComtradeDownload.ashx?eventID=${this.props.eventid}` +
            `${this.props.startDate != undefined ? `&startDate=${this.props.startDate}` : ``}` +
            `${this.props.endDate != undefined ? `&endDate=${this.props.endDate}` : ``}` +
            `&Meter=${this.props.PostedData.postedMeterName}` +
            `&EventType=${this.props.PostedData.postedEventName}`);
    }

}
*/