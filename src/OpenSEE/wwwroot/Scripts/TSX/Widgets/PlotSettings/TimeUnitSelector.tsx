//******************************************************************************************************
//  AxisUnitSelector.tsx - Gbtc
//
//  Copyright c 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  05/08/2026 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { OpenSee } from '../../global';
import { defaultSettings, TimeUnitOptions } from '../../defaults';
import { Select } from '@gpa-gemstone/react-forms';

interface IProps {
    label: string,
    setter: (index: number) => void,
    timeUnitIndex: number,
    overlappingWave?: boolean
}

const TimeUnitSelector = React.memo((props: IProps) => {
    let options: OpenSee.iUnitOptions[];
    let buttonLabel: string;

    if (props.overlappingWave) {
        options = defaultSettings.OverlappingWaveTimeUnit.options ?? [];
        buttonLabel = props.label + " [" + (defaultSettings.OverlappingWaveTimeUnit.options?.[props.timeUnitIndex]?.short ?? '') + "]";
    } else {
        options = defaultSettings.TimeUnit.options ?? [];
        buttonLabel = props.label + " [" + TimeUnitOptions[props.timeUnitIndex].short + "]";
    }

    return (
        <Select
            Label={''}
            Record={{ buttonLabel }}
            Field='buttonLabel'
            Setter={(_, option) => props.setter(option.Value as number)}
            Options={options.map((option, index) => ({ Label: option.label, Value: index }))}
        />
    );
});

export default TimeUnitSelector;