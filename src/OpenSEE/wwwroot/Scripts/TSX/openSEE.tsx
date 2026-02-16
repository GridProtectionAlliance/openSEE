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
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { AnalyticProvider } from './Context/AnalyticContext';
import { DataProvider } from './Context/DataContext';
import { EventProvider } from './Context/EventContext';
import { HoverProvider } from './Context/HoverContext';
import OpenSeeApplication from './OpenSeeApplication';
import { LoadSettings } from './store/settingSlice';
import store from './store/store';

const OpenSEE = () => (
    <EventProvider>
        <HoverProvider>
            <AnalyticProvider>
                <DataProvider>
                    <OpenSeeApplication />
                </DataProvider>
            </AnalyticProvider>
        </HoverProvider>
    </EventProvider>
)

//Load Settings for settings Slice
store.dispatch(LoadSettings());

// After
const container = document.getElementById('DockCharts');
const root = ReactDOM.createRoot(container!);
root.render(<Provider store={store}><OpenSEE /></Provider>);