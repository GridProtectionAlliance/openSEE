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
import { ToggleSwitch, ToolTip } from '@gpa-gemstone/react-forms';
import { BtnDropdown } from '@gpa-gemstone/react-interactive';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import React from "react";
import AnalyticContext from '../Context/AnalyticContext';
import { PlotStateStateContext } from '../Context/PlotStateContext';
import EventContext from '../Context/EventContext';
import { OverlappingStateContext } from '../Context/OverlappingContext';
import { OpenSee } from "../global";
import { useAppDispatch } from '../hooks';
import { SetMouseMode } from '../Store/settingSlice';
import { selectFFTEnabled, selectDisplayed, selectAnalytics, selectEventIDs } from '../PlotSelectors';
import { IPlotLifecycleActions } from '../Hooks/usePlotLifeCycle';
import { BasePlots } from '../defaults';
import { navIconButtonStyle, navIconDropdownButtonClass, navIconDropdownStyle } from './NavStyles';

interface IProps {
    OpenDrawers: OpenSee.Drawers,
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    Lifecycle: IPlotLifecycleActions
}

const WidgetSection = (props: IProps) => {
    const dispatch = useAppDispatch();
    const evt = React.useContext(EventContext);
    const overlapping = React.useContext(OverlappingStateContext);
    const [analytic] = React.useContext(AnalyticContext);
    const plotState = React.useContext(PlotStateStateContext);

    const [hover, setHover] = React.useState<string>('None');

    const showFFT = React.useMemo(() => selectFFTEnabled(plotState.meta), [plotState.meta]);
    const showPlots = React.useMemo(() => selectDisplayed(plotState.meta), [plotState.meta]);

    const togglePlots = (type: OpenSee.graphType) => {
        let display: boolean | undefined;
        if (type === 'Voltage') display = showPlots.Voltage;
        else if (type === 'Current') display = showPlots.Current;
        else if (type === 'Analogs') display = showPlots.Analogs;
        else if (type === 'Digitals') display = showPlots.Digitals;
        else if (type === 'TripCoil') display = showPlots.TripCoil;

        const eventIds = selectEventIDs(evt.Context.EventID, overlapping.events);

        if (display)
            eventIds.forEach(id => props.Lifecycle.RemovePlot({ DataType: type, EventId: id }));
        else
            eventIds.forEach(id => props.Lifecycle.AddPlot({ DataType: type, EventId: id }));
    }

    const exportData = (type: string) => {
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

    const waveformOptionList = BasePlots.map(type => {
        const enabled = showPlots[type] === true;
        const label = type === 'TripCoil' ? 'Trip Coil E.' : type;

        return {
            Label: (
                <div className="container-fluid p-0">
                    <div className="row no-gutters align-items-center">
                        <div className="col">
                            <ToggleSwitch<{ Enabled: boolean }>
                                Record={{ Enabled: enabled }}
                                Field={'Enabled'}
                                Label={label}
                                Setter={() => togglePlots(type)}
                                Style={{ marginBottom: 0 }}
                            />
                        </div>
                    </div>
                </div>
            ),
            Callback: () => { }
        };
    });

    const statsOptionList = [
        { Label: "Event Stats", Callback: () => props.ToggleDrawer('EventStats', !props.OpenDrawers.EventStats) }
    ];

    if (evt.Context.EventInfo?.EventName === "Snapshot")
        statsOptionList.push({ Label: "Harmonic Stats", Callback: () => props.ToggleDrawer('HarmonicStats', !props.OpenDrawers.HarmonicStats) });

    return (
        <>
            <li className="nav-item" style={{ width: '84px', marginTop: "10px" }}>
                <div style={{ position: 'absolute' }}>
                    <BtnDropdown Label={<ReactIcons.LineChart />}
                        Callback={() => togglePlots('Voltage')}
                        Size={'sm'}
                        Options={waveformOptionList}
                        ShowToolTip={true}
                        BtnClass={'btn-primary ' + navIconDropdownButtonClass}
                        ContainerStyle={navIconDropdownStyle}
                        TooltipContent={<p>Waveform Views</p>}
                        TooltipLocation={'bottom'}
                    />
                </div>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ ...navIconButtonStyle, borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Show Points')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'points-btn'}
                    onClick={() => props.ToggleDrawer('AccumulatedPoints', !props.OpenDrawers.AccumulatedPoints)}
                >
                    <ReactIcons.ScatterPlot />
                </button>
                <ToolTip Show={hover == 'Show Points'} Position={'bottom'} Target={'points-btn'}>
                    <p>Show Points</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ ...navIconButtonStyle, borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Clock')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'phasorclock-btn'}
                    onClick={() => props.ToggleDrawer('PolarChart', !props.OpenDrawers.PolarChart)}
                >
                    <ReactIcons.PhasorArrows />
                </button>
                <ToolTip Show={hover == 'Clock'} Position={'bottom'} Target={'phasorclock-btn'}>
                    <p>Phasor Chart</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '84px', marginTop: "10px" }}>
                <div style={{ position: 'absolute' }}>
                    <BtnDropdown Label={<ReactIcons.Info />}
                        Callback={() => props.ToggleDrawer('EventStats', !props.OpenDrawers.EventStats)}
                        Size={'sm'}
                        Options={statsOptionList}
                        ShowToolTip={true}
                        BtnClass={'btn-primary ' + navIconDropdownButtonClass}
                        ContainerStyle={navIconDropdownStyle}
                        TooltipContent={<p>Stats</p>}
                        TooltipLocation={'bottom'}
                    />
                </div>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ ...navIconButtonStyle, borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Sags')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'sags-btn'}
                    onClick={() => props.ToggleDrawer('CorrelatedSags', !props.OpenDrawers.CorrelatedSags)}
                >
                    <ReactIcons.List />
                </button>
                <ToolTip Show={hover == 'Sags'} Position={'bottom'} Target={'sags-btn'}>
                    <p>Correlated Sags</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className={"btn btn-" + (showFFT ? "primary" : "secondary disabled")} style={{ ...navIconButtonStyle, borderRadius: "0.25rem", padding: "0.195rem" }}
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
                    <ReactIcons.BarChart />
                </button>
                <ToolTip Show={hover == 'FFTTable'} Position={'bottom'} Target={'fftTable-btn'}>
                    <p>FFT Table</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '54px', marginTop: "10px" }}>
                <button type="button" className="btn btn-primary" style={{ ...navIconButtonStyle, borderRadius: "0.25rem", padding: "0.195rem" }}
                    onMouseEnter={() => setHover('Lightning')}
                    onMouseLeave={() => setHover('None')} data-tooltip={'lightning-btn'}
                    onClick={() => props.ToggleDrawer('Lightning', !props.OpenDrawers.Lightning)}
                >
                    <ReactIcons.LightningCloud />
                </button>
                <ToolTip Show={hover == 'Lightning'} Position={'bottom'} Target={'lightning-btn'}>
                    <p>Lightning Data</p>
                </ToolTip>
            </li>

            <li className="nav-item" style={{ width: '84px', marginTop: "10px" }}>
                <div style={{ position: 'absolute' }}>
                    <BtnDropdown Label={<ReactIcons.Download />}
                        Callback={() => exportData('csv')}
                        Size={'sm'}
                        Options={optionList}
                        ShowToolTip={hover == "Export"}
                        BtnClass={'btn-primary ' + navIconDropdownButtonClass}
                        ContainerStyle={navIconDropdownStyle}
                        TooltipContent={<p>Export</p>}
                    />
                </div>
            </li>
        </>
    );
};

export default WidgetSection;
