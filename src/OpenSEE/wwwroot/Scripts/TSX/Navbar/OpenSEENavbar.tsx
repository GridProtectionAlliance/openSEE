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
import { ToolTip, BtnDropdown } from '@gpa-gemstone/react-interactive';
import { useAppDispatch, useAppSelector } from '../hooks';

import About from '../Components/About';


declare var homePath: string;
declare var eventStartTime: string;
declare var eventEndTime: string;

interface IProps {
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    OpenDrawers: OpenSee.Drawers
    Width: number
}

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
    const [hover, setHover] = React.useState<Hover>('None');

    React.useEffect(() => {
        if (props.OpenDrawers.AccumulatedPoints) {
            let oldMode = clone(mouseMode);
            dispatch(SetMouseMode('select'))
            return () => {
                dispatch(SetMouseMode(oldMode))
            }
        }
        return () => { }

    }, [props.OpenDrawers.AccumulatedPoints]);

    function exportData(type) {
        const uri = homePath + `api/CSV/Download?type=${type}&eventID=${eventID}` +
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
            `&EventType=${eventInfo.EventName}`;
        window.open(uri, '_blank');
    };

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
                                OpenDrawers={props.OpenDrawers} ToggleDrawer={props.ToggleDrawer} showFFT={showFFT} lookupInfo={lookupInfo}
                                exportData={exportData} />
                        </ul>
                    </> :
                    <>
                        <ul className="navbar-nav navbar-expand">
                            {/* Left Section */}
                            <WidgetSection eventInfo={eventInfo} hover={hover} setHover={(item) => setHover(item)} mouseMode={mouseMode} navigation={navigation}
                                OpenDrawers={props.OpenDrawers} ToggleDrawer={props.ToggleDrawer} showFFT={showFFT} lookupInfo={lookupInfo}
                                exportData={exportData} />
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

export default OpenSeeNavBar;
