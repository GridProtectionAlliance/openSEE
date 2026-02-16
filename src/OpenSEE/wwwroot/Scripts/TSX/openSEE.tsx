//******************************************************************************************************
//  openSEE.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//  08/22/2019 - Christoph Lackner
//       Added TCE Plot.
//
//******************************************************************************************************

// To-DO:
// # Fix Dowload.ash to include Analytics
//

import 'bootstrap/dist/css/bootstrap.min.css';
import { Application, SplitDrawer, SplitSection, VerticalSplit } from '@gpa-gemstone/react-interactive';
import moment from 'moment'
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import createHistory from "history/createBrowserHistory"

import * as queryString from "query-string";
import * as _ from "lodash";

import AnalyticOptions from './Components/AnalyticOptions';
import LineChart from './Graphs/LineChartBase';
import OpenSeeNavBar from './Navbar/OpenSEENavbar';

import store from './store/store';
import { sortGraph } from './Graphs/Utilities'
import { OpenSee } from './global';

import { LoadSettings, SelectMouseMode, SetMouseMode } from './store/settingSlice';
import { SelectDisplayed, SelectFFTLimits, SelectListGraphs, SelectPlotKeys } from './store/dataSlice';
import { LoadOverlappingEvents, SelectEventList } from './store/overlappingEventsSlice';

import OverlappingEventWindow from './Components/OverlappingEvents';
import BarChart from './Graphs/BarChartBase';
import { updatedURL } from './store/queryThunk';
import { useAppDispatch, useAppSelector } from './hooks';

import SettingsWidget from './jQueryUI Widgets/SettingWindow';
import PointWidget from './jQueryUI Widgets/AccumulatedPoints';
import PhasorChartWidget from './jQueryUI Widgets/PhasorChart';
import ToolTipWidget from './jQueryUI Widgets/Tooltip';
import ToolTipDeltaWidget from './jQueryUI Widgets/TooltipWithDelta';
import ScalarStatsWidget from './jQueryUI Widgets/ScalarStats';
import TimeCorrelatedSagsWidget from './jQueryUI Widgets/TimeCorrelatedSags';
import LightningDataWidget from './jQueryUI Widgets/LightningData';
import FFTTable from './jQueryUI Widgets/FFTTable';
import EventInfo from './jQueryUI Widgets/EventInfo';
import HarmonicStatsWidget from './jQueryUI Widgets/HarmonicStats';

// Providers
import { HoverProvider } from './Context/HoverContext';
import { EventProvider, EventContext } from './Context/EventContext';
import AnalyticContext, { AnalyticProvider } from './Context/AnalyticContext';
import OpenSeeHome from './openSEEHome';
import { DataProvider } from './Context/DataContext';

const OpenSeeApplication = () => {
    const dispatch = useAppDispatch();

    const applicationRef = React.useRef(null);
    const plotRef = React.useRef<HTMLDivElement>(null);
    const overlayHandles = React.useRef<OpenSee.IOverlayHandlers>({
        Settings: () => { },
        AccumulatedPoints: () => { },
        PolarChart: () => { },
        ScalarStats: () => { },
        CorrelatedSags: () => { },
        Lightning: () => { },
        FFTTable: () => { },
        HarmonicStats: () => { },
    });

    const [openDrawers, setOpenDrawers] = React.useState<OpenSee.Drawers>({
        Settings: false,
        AccumulatedPoints: false,
        PolarChart: false,
        ScalarStats: false,
        CorrelatedSags: false,
        Lightning: false,
        FFTTable: false,
        Info: false,
        Compare: false,
        Analytics: false,
        ToolTip: false,
        ToolTipDelta: false,
        HarmonicStats: false
    });
    const [resizeCount, setResizeCount] = React.useState<number>(0);
    const [plotWidth, setPlotWidth] = React.useState<number>(window.innerWidth - 300);
    const [plotHeight, setPlotHeight] = React.useState<number>(250);
    const [navWidth, setNavWidth] = React.useState<number>(100);

    const mouseMode = useAppSelector(SelectMouseMode);
    const groupedKeys = useAppSelector(SelectListGraphs);
    const plotKeys = useAppSelector(SelectPlotKeys);
    const eventList = useAppSelector(SelectEventList);
    const showPlots = useAppSelector(SelectDisplayed);
    const fftTime = useAppSelector(SelectFFTLimits);

    // ToDo: this and logic that relies on it needs to be moved downstream or contexts up
    const [analytic, setAnalytic] = React.useContext(AnalyticContext);
    const evt = React.useContext(EventContext);


    React.useLayoutEffect(() => {
        const timeoutId = setTimeout(() => {
            if (applicationRef.current) {
                const newHeight = ((window.innerHeight - applicationRef.current?.navBarDiv?.offsetHeight) / Math.min(plotKeys.length, 3))
                const newWidth = plotRef.current ? plotRef.current.offsetWidth : 0
                const newNavBarWidth = applicationRef.current?.navBarDiv?.offsetWidth
                if (newHeight !== plotHeight && !isNaN(newHeight) && isFinite(newHeight))
                    setPlotHeight(newHeight)

                if (newWidth !== plotWidth && !isNaN(newWidth) && isFinite(newWidth))
                    setPlotWidth(newWidth);

                if (navWidth !== newNavBarWidth && !isNaN(newNavBarWidth) && isFinite(newNavBarWidth))
                    setNavWidth(newNavBarWidth)
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [plotKeys, openDrawers, resizeCount])


    React.useEffect(() => {
        window.addEventListener("resize", () => {
            setResizeCount(x => x + 1)
        });
        return () => { $(window).off('resize'); }
    }, [])

    React.useEffect(() => {
        if (openDrawers.ToolTipDelta) {
            let oldMode = _.clone(mouseMode);
            dispatch(SetMouseMode('select'))
            return () => { dispatch(SetMouseMode(oldMode)) }
        }
    }, [openDrawers.ToolTipDelta]);

    const ToggleDrawer = (drawer: OpenSee.OverlayDrawers, open: boolean) => {
        overlayHandles.current[drawer](open);
    };

    const handleDrawerChange = (drawerName: keyof OpenSee.Drawers, isOpen: boolean) => {
        setOpenDrawers(prevStates => ({ ...prevStates, [drawerName]: isOpen }));
    };

    function exportData(type) {
        const uri = homePath + `api/CSV/Download?type=${type}&eventID=${eventId}` +
            `${showPlots.Voltage != undefined ? `&displayVolt=${showPlots.Voltage}` : ``}` +
            `${showPlots.Current != undefined ? `&displayCur=${showPlots.Current}` : ``}` +
            `${showPlots.TripCoil != undefined ? `&displayTCE=${showPlots.TripCoil}` : ``}` +
            `${showPlots.Digitals != undefined ? `&breakerdigitals=${showPlots.Digitals}` : ``}` +
            `${showPlots.Analogs != undefined ? `&displayAnalogs=${showPlots.Analogs}` : ``}` +
            `${type == 'fft' ? `&startDate=${fftTime[0]}` : ``}` +
            `${type == 'fft' ? `&cycles=${analytic.FFTCycles}` : ``}` +
            `&Meter=${evt.EventInfo.MeterName}` +
            `&EventType=${evt.EventInfo.MeterName}`;
        window.open(uri, "_blank");
    }

    return (
        <EventProvider>
            <HoverProvider>
                <AnalyticProvider>
                    <DataProvider>
                        <Application
                            HomePath={""}
                            DefaultPath={""}
                            HideSideBar={true}
                            Version={version}
                            Logo={`${homePath}Images/openSEE.jpg`}
                            NavBarContent={<OpenSeeNavBar ToggleDrawer={ToggleDrawer} OpenDrawers={openDrawers} Width={navWidth} />}
                            UseLegacyNavigation={true}
                            ref={applicationRef}
                        >
                            <OpenSeeHome HandleDrawerChange={handleDrawerChange} OverlayHandles={overlayHandles} />
                        </Application>
                    </DataProvider>
                </AnalyticProvider>
            </HoverProvider>
        </EventProvider>
    );
}

//Load Settings for settings Slice
store.dispatch(LoadSettings());

// After
const container = document.getElementById('DockCharts');
const root = ReactDOM.createRoot(container!);
root.render(<Provider store={store}><OpenSeeApplication /></Provider>);