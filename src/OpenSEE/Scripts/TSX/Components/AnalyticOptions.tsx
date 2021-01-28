//******************************************************************************************************
//  RadioselectWindow.tsx - Gbtc
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
//  03/13/2019 - Billy Ernest
//       Generated original version of source code.
//  09/25/2019 - Christoph Lackner
//       Added Settings Form
//
//******************************************************************************************************

import * as React from 'react';
import { clone } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { OpenSee } from '../global';
import { selectAnalytic, SetAnalytic } from '../store/dataSlice';
import { selectHarmonic, SetHarmonic, selectHPF, selectLPF, SetHPF, SetLPF, selectTRC, SetTrc, selectCycles, selectFFTWindow, SetFFTWindow } from '../store/analyticSlice';

declare var cycles: number;
declare var samplesPerCycle: number;


interface IProps {}

const AnalyticOptions = (props: IProps) => {
    const dispatch = useDispatch();
    const analytic = useSelector(selectAnalytic)
    const harmonic = useSelector(selectHarmonic)
    const hpf = useSelector(selectHPF)
    const lpf = useSelector(selectLPF)
    const trc = useSelector(selectTRC)
    const cycles = useSelector(selectCycles);
    const FFTWindow = useSelector(selectFFTWindow);

    function ChangeAnalytic(event) {
        let val = event.target.value as OpenSee.Analytic;
        dispatch(SetAnalytic(val));
    }
    function ChangeHarmonic(event) {
        let val = event.target.value as OpenSee.Analytic;
        dispatch(SetHarmonic(parseInt(val)));
    }
    function ChangeHPF(event) {
        let val = event.target.value as OpenSee.Analytic;
        dispatch(SetHPF(parseInt(val)));
    }
    function ChangeLPF(event) {
        let val = event.target.value as OpenSee.Analytic;
        dispatch(SetLPF(parseInt(val)));
    }
    function ChangeTRC(event) {
        let val = event.target.value as OpenSee.Analytic;
        dispatch(SetTrc(parseInt(val)));
    }
    function ChangeCycles(event) {
        let val = event.target.value as OpenSee.Analytic;
        dispatch(SetFFTWindow({ cycle: parseInt(val), startTime: FFTWindow[0] }));
    }

    return <div style={{ marginTop: '10px', width: '100%', height: '100%' }}>
        <form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', padding: '10px', width: '90%', height: '100%', overflow: 'auto', marginLeft: '5%', marginRight: '5%' }}>
            <select onChange={(ev) => ChangeAnalytic(ev)} value={analytic} >
                <option value={'FirstDerivative'}> First Derivative </option>
                <option value={'ClippedWaveforms'}> Fix Clipped Waveforms </option>
                <option value={'Frequency'}> Frequency </option>
                <option value={'HighPassFilter'}> High Pass </option>
                <option value={'LowPassFilter'}> Low Pass </option>
                <option value={'MissingVoltage'}> Missing Voltage </option>
                <option value={'OverlappingWave'}> Overlapping Waveform </option>
                <option value={'Power'}> Power </option>
                <option value={'Impedance'}> Impedance </option>
                <option value={'Rectifier'}>Rectifier Output </option>
                <option value={'RapidVoltage'}> Rapid Voltage Change</option>
                <option value={'RemoveCurrent'}> Remove Current </option>
                <option value={'Harmonic'}> Specified Harmonic </option>
                <option value={'SymetricComp'}> Symmetrical Components </option>
                <option value={'THD'}> THD</option>
                <option value={'Unbalance'}> Unbalance </option>
                <option value={'FaultDistance'}> Fault Distance </option>
                {/*<option value={'Restrike'}> Breaker Restrike </option>*/}
                <option value={'FFT'}> FFT </option>
            </select>
        </form>
        {analytic == "Harmonic" ? < form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', padding: '10px', width: '90%', height: '100%', overflow: 'auto', marginLeft: '5%', marginRight: '5%', marginTop: '5%' }}>
            <ul ref="list" style={{ listStyleType: 'none', padding: 0 }}>
                <li>
                    <label> Harmonic: <select value={harmonic.toString()} onChange={(ev) => ChangeHarmonic(ev)}>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                        <option value='4'>4</option>
                        <option value='5'>5</option>
                    </select></label>
                </li>
            </ul>
        </form> : null}

        {analytic == "HighPassFilter" ? < form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', padding: '10px', width: '90%', height: '100%', overflow: 'auto', marginLeft: '5%', marginRight: '5%', marginTop: '5%' }}>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li>
                    <label> Order: <select value={hpf.toString()} onChange={(ev) => ChangeHPF(ev)}>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                    </select></label>
                </li>
            </ul>
        </form> : null}
        {analytic == "LowPassFilter" ? < form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', padding: '10px', width: '90%', height: '100%', overflow: 'auto', marginLeft: '5%', marginRight: '5%', marginTop: '5%' }}>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li>
                    <label> Order: <select value={lpf.toString()} onChange={(ev) => ChangeLPF(ev)}>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                    </select></label>
                </li>
            </ul>
        </form> : null}
        {analytic == "Rectifier" ? < form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', padding: '10px', width: '90%', height: '100%', overflow: 'auto', marginLeft: '5%', marginRight: '5%', marginTop: '5%' }}>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li>
                    <label> RC Time Const. (ms): <select value={trc.toString()} onChange={(ev) => ChangeTRC(ev)}>
                        <option value='0'>0</option>
                        <option value='100'>100</option>
                        <option value='200'>200</option>
                        <option value='500'>500</option>
                    </select></label>
                </li>
            </ul>
        </form> : null}
        {analytic == "FFT" ? < form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', padding: '10px', width: '90%', height: '100%', overflow: 'auto', marginLeft: '5%', marginRight: '5%', marginTop: '5%' }}>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li>
                    <label> Cycles: <select value={cycles.toString()} onChange={(ev) => ChangeCycles(ev)}>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                        <option value='4'>4</option>
                        <option value='5'>5</option>
                    </select></label>
                </li>
            </ul>
        </form> : null}
    </div>
} 


export default AnalyticOptions;

