﻿//******************************************************************************************************
//  store.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  11/01/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import { configureStore } from '@reduxjs/toolkit';
import SettingsReducer from './settingSlice';
import DataReducer from './dataSlice';
import AnalyticReducer  from './analyticSlice';
import OverlappingEventReducer from './overlappingEventsSlice';
import EventInfoReducer from './eventInfoSlice'

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>

const reducer = {
    Settings: SettingsReducer,
    Data: DataReducer,
    Analytic: AnalyticReducer,
    EventInfo: EventInfoReducer,
    OverlappingEvents: OverlappingEventReducer
}
const store = configureStore({ reducer });

export default store;