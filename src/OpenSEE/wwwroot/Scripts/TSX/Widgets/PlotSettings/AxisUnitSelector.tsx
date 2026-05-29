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
import { defaultSettings } from '../../defaults';
import { Select } from '@gpa-gemstone/react-forms';

interface IProps {
    setter: (index: number) => void,
    unitType: OpenSee.Unit,
    axisSetting: OpenSee.IAxisSettings
}

//probably doesnt have to be memoized here
const AxisUnitSelector = React.memo((props: IProps) => {
    const { current, isAuto } = props.axisSetting;

    const options = React.useMemo(() => {
        const unit: OpenSee.IUnitSetting = defaultSettings.Units[props.unitType];

        if(unit == null || unit?.options == null)
            return []

        return unit.options.map((option, index) => ({
            Label: isAuto && current === index && option.factor !== 0 ?
                `${option.label} (auto)` : option.label,
            Value: index
        }))
    }, [props.unitType, current, isAuto]);

    return (
        <Select
            Label={''}
            Record={{ value: props.axisSetting.current }}
            Field='value'
            Setter={(_, option) => props.setter(option.Value as number)}
            Options={options}
        />
    );
});

export default AxisUnitSelector;
