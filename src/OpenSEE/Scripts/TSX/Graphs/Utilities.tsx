//******************************************************************************************************
//  Utilities.tsx - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  02/23/2021 - C. Lackner
//       Generated original version of source code
//
//******************************************************************************************************

import { OpenSee } from "../global"

export function GetDisplayLabel(type: OpenSee.graphType): string {
    switch (type) {
        case ('FirstDerivative'):
            return "First Derivative"
        case ('HighPassFilter'):
            return "High Pass Filter"
        case ('LowPassFilter'):
            return "Low Pass Filter"
        case ('ClippedWaveforms'):
            return "Clipped Waveforms"
        case ('OverlappingWave'):
            return "Overlapping Waveform"
        case ('MissingVoltage'):
            return "Missing Voltage"
        case ('Rectifier'):
            return 'Rectifier Output';
        case ('RapidVoltage'):
            return "Rapid Voltage Change"
        case ('RemoveCurrent'):
            return "Remove Current"
        case ('Harmonic'):
            return "Specified Harmonic"
        case ('SymetricComp'):
            return "Symmetrical Components"
        case ('FaultDistance'):
            return "Fault Distance"
        case ('Restrike'):
            return "Breaker Restrike"
        default:
            return (type as string)
    }
}