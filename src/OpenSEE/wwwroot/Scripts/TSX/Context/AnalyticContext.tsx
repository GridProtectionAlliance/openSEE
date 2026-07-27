//******************************************************************************************************
//  AnalyticContext.tsx - Gbtc
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
//  02/11/2026 - G. Santos
//       Migrated code from slice to context.
//
//******************************************************************************************************
import * as React from 'react';
import { OpenSee } from '../global';

const DefaultContext: OpenSee.IAnalyticContext = {
    Harmonic: 1,
    LPFOrder: 2,
    HPFOrder: 2,
    Trc: 500,
    FFTCycles: 1,
    FFTStartTime: 0
};

type IAnalyticContextType = [OpenSee.IAnalyticContext, React.Dispatch<React.SetStateAction<OpenSee.IAnalyticContext>>];

export const AnalyticContext = React.createContext<IAnalyticContextType>([DefaultContext, () => { }]);

// This likely can and SHOULD be converted to a simple state in the topmost element...
export const AnalyticProvider = (props: React.PropsWithChildren<{}>) => {
    const analytic = React.useState<OpenSee.IAnalyticContext>(DefaultContext);

    return (
        <AnalyticContext.Provider value={analytic}>
            {props.children}
        </AnalyticContext.Provider>
    );
};

export const SelectAnalyticOptions = (context: OpenSee.IAnalyticContext, key: OpenSee.graphType) => {
    switch (key) {
        case 'LowPassFilter':
            return [context.LPFOrder];
        case 'HighPassFilter':
            return [context.HPFOrder];
        case 'Harmonic':
            return [context.Harmonic];
        case 'Rectifier':
            return [context.Trc];
        case 'FFT':
            return [context.FFTCycles, context.FFTStartTime];
        default:
            return [];
    }
}

export default AnalyticContext;
