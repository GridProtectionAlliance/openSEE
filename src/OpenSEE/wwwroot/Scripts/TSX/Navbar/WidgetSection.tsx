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
import AnalyticContext from '../Context/AnalyticContext';
import { PlotStateStateContext } from '../Context/PlotStateContext';
import EventContext from '../Context/EventContext';
import { OpenSee } from "../global";
import { CorrelatedSags, exportBtn, FFT, lightningData, PhasorClock, ShowPoints, statsIcon, WaveformViews } from '../Graphs/ChartIcons';
import { useAppDispatch } from '../hooks';
import { SetMouseMode } from '../store/settingSlice';
import PlotTable from './PlotTable';
import { selectFFTEnabled, selectDisplayed, selectAnalytics } from '../PlotSelectors';
import { IPlotLifecycleActions } from '../hooks/usePlotLifeCycle';

interface IWidgets {
    OpenDrawers: OpenSee.Drawers,
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    lifecycle: IPlotLifecycleActions
}

const WidgetSection = (props: IWidgets) => {
    const dispatch = useAppDispatch();
    const evt = React.useContext(EventContext);
    const [analytic] = React.useContext(AnalyticContext);
    const plotState = React.useContext(PlotStateStateContext);

    const [hover, setHover] = React.useState<string>('None');

    const showFFT = React.useMemo(() => selectFFTEnabled(plotState.meta), [plotState.meta]);

    const exportData = (type: string) => {
        const showPlots = selectDisplayed(plotState.meta);
        const analytics = selectAnalytics(plotState.meta, evt.Context.EventID);
        const uri = homePath + `api/CSV/Download?type=${type}&eventID=${evt.Context.EventInfo?.EventId}` +
            `${showPlots.Voltage != undefined ? `&displayVolt=${showPlots.Voltage}` : ``}` +
            `${showPlots.Current != undefined ? `&displayCur=${showPlots.Current}` : ``}` +
            `${showPlots.TripCoil != undefined ? `&displayTCE=${showPlots.TripCoil}` : ``}` +
            `${showPlots.Digitals != undefined ? `&breakerdigitals=${showPlots.Digitals}` : ``}` +
            `${showPlots.Analogs != undefined ? `&displayAnalogs=${showPlots.Analogs}` : ``}` +
            `${`&displayAnalytics=${analytics}`}` +
            `${`&lpfOrder=${analytic.LPFOrder}`}` +
            `${`&hpfOrder=${analytic.HPFOrder}`}` +
            `${`&Trc=${analytic.Trc}`}` +
            `${`&harmonic=${analytic.Harmonic}`}` +
            `${type == 'fft' ? `&startDate=${plotState.fftLimits[0]}` : ``}` +
            `${type == 'fft' ? `&cycles=${analytic.FFTCycles}` : ``}` +
            `&Meter=${evt.Context.EventInfo?.MeterName}` +
            `&EventType=${evt.Context.EventInfo?.EventName}`;
        window.open(uri, '_blank');
    };

    const optionList = [
        { Label: "Export CSV", Callback: () => exportData('csv') },
        { Label: "Export PQDS", Callback: () => exportData('pqds') }
    ];

    if (showFFT)
        optionList.push({ Label: "Export FFT", Callback: () => exportData('fft') });

    return (
        <>
            <li className="nav-item" style={{ width: 'calc(100% - 909px)', textAlign: 'center' }}></li>
            <li className="nav-item dropdown" style={{ width: '54px', position: 'relative', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Waveform')}
                    onMouseLeave={() => setHover('None')}
                    data-tooltip={'waveform-btn'}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px" }}>{WaveformViews}</i>
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
                    <PlotTable lifecycle={props.lifecycle} />
                </div>
                <ToolTip Show={hover == 'Waveform'} Position={'bottom'} Target={'waveform-btn'}>
                    <p>Waveform Views</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Show Points')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'points-btn'}
                    onClick={() => props.ToggleDrawer('AccumulatedPoints', !props.OpenDrawers.AccumulatedPoints)}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px" }}>{ShowPoints}</i>
                </button>
                <ToolTip Show={hover == 'Show Points'} Position={'bottom'} Target={'points-btn'}>
                    <p>Show Points</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Clock')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'phasorclock-btn'}
                    onClick={() => props.ToggleDrawer('PolarChart', !props.OpenDrawers.PolarChart)}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px", margin: '3px' }}>{PhasorClock}</i>
                </button>
                <ToolTip Show={hover == 'Clock'} Position={'bottom'} Target={'phasorclock-btn'}>
                    <p>Phasor Chart</p>
                </ToolTip>
            </li>

            <li className={"nav-item dropdown"} style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Stat')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'stats-btn'}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px" }}>{statsIcon}</i>
                </button>
                <div className="dropdown-menu" style={{ position: "absolute" }}>
                    <a key={"option-scalar"} className="dropdown-item" onClick={() => props.ToggleDrawer('ScalarStats', !props.OpenDrawers.ScalarStats)} style={{ cursor: 'pointer' }}>
                        <i style={{ fontStyle: "normal" }}>Scalar Stats</i>
                    </a>
                    {evt.Context.EventInfo?.EventName === "Snapshot" ?
                        <a key={"option-harmonic"} className="dropdown-item" onClick={() => props.ToggleDrawer('ScalarStats', !props.OpenDrawers.HarmonicStats)} style={{ cursor: 'pointer' }}>
                            <i style={{ fontStyle: "normal" }}>Harmonic Stats</i>
                        </a>
                        : null}
                </div>
                <ToolTip Show={hover == 'Stat'} Position={'bottom'} Target={'stats-btn'}>
                    <p>Stats</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Sags')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'sags-btn'}
                    onClick={() => props.ToggleDrawer('CorrelatedSags', !props.OpenDrawers.CorrelatedSags)}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px" }}>{CorrelatedSags}</i>
                </button>
                <ToolTip Show={hover == 'Sags'} Position={'bottom'} Target={'sags-btn'}>
                    <p>Correlated Sags</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className={"btn btn-" + (showFFT ? "primary" : "secondary disabled")} style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    aria-disabled={!showFFT}
                    onMouseEnter={() => setHover('FFTTable')}
                    onMouseLeave={() => setHover('None')}
                    data-tooltip={'fftTable-btn'}
                    onClick={() => {
                        if (showFFT) {
                            dispatch(SetMouseMode("fftMove"));
                            props.ToggleDrawer('FFTTable', !props.OpenDrawers.FFTTable);
                        }
                    }}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px" }}>{FFT}</i>
                </button>
                <ToolTip Show={hover == 'FFTTable'} Position={'bottom'} Target={'fftTable-btn'}>
                    <p>FFT Table</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Lightning')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'lightning-btn'}
                    onClick={() => props.ToggleDrawer('Lightning', !props.OpenDrawers.Lightning)}
                >
                    <i style={{ fontStyle: "normal", fontSize: "25px" }}>{lightningData}</i>
                </button>
                <ToolTip Show={hover == 'Lightning'} Position={'bottom'} Target={'lightning-btn'}>
                    <p>Lightning Data</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '84px', marginTop: "10px" }}>
                <div style={{ position: 'absolute' }}>
                    <BtnDropdown Label={<i style={{ fontStyle: "normal", fontSize: "24px" }}>{exportBtn}</i>}
                        Callback={() => exportData('csv')}
                        Size={'sm'}
                        Options={optionList}
                        ShowToolTip={hover == "Export"}
                        BtnClass={'btn-primary'}
                        TooltipContent={<p>Export</p>}
                    />
                </div>
            </li>
        </>
    );
};

export default WidgetSection;
