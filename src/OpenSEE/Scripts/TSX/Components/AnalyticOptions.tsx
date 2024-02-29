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
import { OpenSee } from '../global';
import { SelectHarmonic,SelectHPF, SelectLPF, SelectTRC, SelectCycles, UpdateAnalytic, SelectAnalytics } from '../store/analyticSlice';
import { SelectPlotKeys, RemovePlot, AddPlot, SelectEventIDs } from '../store/dataSlice'
import { useAppDispatch, useAppSelector } from '../hooks';
import { BtnDropdown } from "@gpa-gemstone/react-interactive"
import { Select, Input } from "@gpa-gemstone/react-forms"
import * as _ from 'lodash'
import { ToInt } from '../store/queryThunk'
import { GetDisplayLabel } from '../Graphs/Utilities'

const AnalyticOptions = () => {
    const dispatch = useAppDispatch();
    const harmonic = useAppSelector(SelectHarmonic)
    const plotKeys = useAppSelector(SelectPlotKeys)
    const hpf = useAppSelector(SelectHPF)
    const lpf = useAppSelector(SelectLPF)
    const trc = useAppSelector(SelectTRC)
    const cycles = useAppSelector(SelectCycles);
    const analytics = useAppSelector(SelectAnalytics);
    const eventIDs = useAppSelector(SelectEventIDs)

    const [isHarmonicValid, setIsHarmonicValid] = React.useState<boolean>(true)


    const defaultAnalyticBtns = [
        { Label: 'Fault Distance', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'FaultDistance', EventId: id } }))), DataType: 'FaultDistance' },
        { Label: 'FFT', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'FFT', EventId: id } }))), DataType: 'FFT' },
        { Label: 'First Derivative', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'FirstDerivative', EventId: id } }))), DataType: "FirstDerivative" },
        { Label: 'Fix Clipped Waveforms', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'ClippedWaveforms', EventId: id } }))), DataType: 'ClippedWaveforms' },
        { Label: 'Frequency', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'Frequency', EventId: id } }))), DataType: 'Frequency' },
        { Label: 'High Pass', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'HighPassFilter', EventId: id } }))), DataType: 'HighPassFilter' },
        { Label: 'Impedance', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'Impedance', EventId: id } }))), DataType: 'Impedance' },
        { Label: 'Low Pass', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'LowPassFilter', EventId: id } }))), DataType: 'LowPassFilter' },
        { Label: 'Missing Voltage', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'MissingVoltage', EventId: id } }))), DataType: 'MissingVoltage' },
        { Label: 'Overlapping Waveform', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'OverlappingWave', EventId: id } }))), DataType: 'OverlappingWave' },
        { Label: 'Power', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'Power', EventId: id } }))), DataType: 'Power' },
        { Label: 'Rapid Voltage Change', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'RapidVoltage', EventId: id } }))), DataType: 'RapidVoltage' },
        { Label: 'Rectifier Output', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'Rectifier', EventId: id } }))), DataType: 'Rectifier' },
        { Label: 'Remove Current', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'RemoveCurrent', EventId: id } }))), DataType: 'RemoveCurrent' },
        { Label: 'Specified Harmonic', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'Harmonic', EventId: id } }))), DataType: 'Harmonic' },
        { Label: 'Symmetrical Components', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'SymetricComp', EventId: id } }))), DataType: 'SymetricComp' },
        { Label: 'THD', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'THD', EventId: id } }))), DataType: 'THD' },
        { Label: 'Unbalance', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'Unbalance', EventId: id } }))), DataType: 'Unbalance' },
        { Label: 'i2t', Callback: () => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: 'I2T', EventId: id } }))), DataType: 'I2T' }
    ];

    const [analyticBtns, setAnalyticBtns] = React.useState<any[]>(defaultAnalyticBtns)

    const handleHarmonicChange = (harmonic: number) => {
        if (harmonic) {
            eventIDs.forEach(id => {
                setTimeout(() => {
                    dispatch(UpdateAnalytic({ settings: { ...analytics, Harmonic: ToInt(harmonic) }, key: { DataType: "Harmonic", EventId: id } }));
                }, 500);
            });
            setIsHarmonicValid(true)
        }
        else 
            setIsHarmonicValid(false)
    }


    const options = {
        order: [
            { Label: '1', Value: '1' },
            { Label: '2', Value: '2' },
            { Label: '3', Value: '3' },
        ],
        trc: [
            { Label: '100', Value: '100' },
            { Label: '200', Value: '200' },
            { Label: '500', Value: '500' },
        ],
        cycles: [
            { Label: '1', Value: '1' },
            { Label: '2', Value: '2' },
            { Label: '3', Value: '3' },
            { Label: '4', Value: '4' },
            { Label: '5', Value: '5' },
            { Label: '6', Value: '6' },
            { Label: '7', Value: '7' },
            { Label: '8', Value: '8' },
            { Label: '9', Value: '9' },
            { Label: '10', Value: '10' },
            { Label: '11', Value: '11' },
            { Label: '12', Value: '12' },
            { Label: '13', Value: '13' },
            { Label: '14', Value: '14' },
            { Label: '15', Value: '15' },
        ]
    }

    React.useEffect(() => {
        const filteredAnalyticBtns = defaultAnalyticBtns.filter(btn => !plotKeys.map(key => key.DataType).includes(btn.DataType as OpenSee.graphType));

        setAnalyticBtns(filteredAnalyticBtns)
    }, [plotKeys])


    //nonanalytic plots or analytic plots that need parameters
    const dynamicPlots = ["Harmonic", "HighPassFilter", "LowPassFilter", "Rectifier", "FFT", "Voltage", "Current", "Analogs", 'Digitals', 'TripCoil']

    return (
        <>
            <div className="d-flex" style={{ width: '100%', height: '100%', padding: '10px' }}>
                <form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', height: '100%', width: '100%', overflowY: 'auto', padding: '10px', marginTop: 0 }}>
                    <div style={{marginBottom: '20px'}}>
                    <BtnDropdown // why is this refreshing the page if i click the button  itself..??
                            Label={analyticBtns[0].Label}
                            Callback={() => eventIDs.forEach(id => dispatch(AddPlot({ key: { DataType: analyticBtns[0].DataType, EventId: id } })))}
                            Options={analyticBtns}
                        />
                    </div>
                    {plotKeys.some(type => type.DataType === "Harmonic") && (
                        <div className="form-row">
                            <fieldset className="border" style={{ padding: '10px', width: '100%', marginBottom: '20px' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Specified Harmonic</legend>
                                <div className="row">
                                    <div className="col-6 d-flex flex-column justify-content-end">
                                        <Input
                                            Record={{ harmonic }}
                                            Field={'harmonic'}
                                            Setter={(harmonic) => handleHarmonicChange(ToInt(harmonic.harmonic))}
                                            Label={"Harmonic:"}
                                            Valid={() => isHarmonicValid}
                                            Feedback="Harmonic value can not be empty"
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dispatch(RemovePlot({ EventId: id, DataType: "Harmonic" })))}>Remove</button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}
                    {plotKeys.some(type => type.DataType === "HighPassFilter") && (
                        <div className="form-row">
                            <fieldset className="border" style={{ padding: '10px', width: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>High Pass Filter</legend>
                                <div className="row">
                                    <div className="col-6 d-flex flex-column justify-content-end">
                                        <Select
                                            Record={{ hpf }}
                                            Field={'hpf'}
                                            Options={options.order}
                                            Setter={(hpf) => eventIDs.forEach(id => dispatch(UpdateAnalytic({ settings: { ...analytics, HPFOrder: ToInt(hpf.hpf) }, key: { DataType: "HighPassFilter" , EventId: id} })))}
                                            Label={"Order:"}
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dispatch(RemovePlot({ EventId: id, DataType: "HighPassFilter" })))}>Remove</button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}
                    {plotKeys.some(type => type.DataType === "LowPassFilter") && (
                        <div className="form-row">
                            <fieldset className="border" style={{ padding: '10px', width: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Low Pass Filter</legend>
                                <div className="row">
                                    <div className="col-6 d-flex flex-column justify-content-end">
                                        <Select
                                            Record={{ lpf }}
                                            Field={'lpf'}
                                            Options={options.order}
                                            Setter={(lpf) => eventIDs.forEach(id => dispatch(UpdateAnalytic({ settings: { ...analytics, LPFOrder: ToInt(lpf.lpf) }, key: { DataType: "LowPassFilter", EventId: id } }))) }
                                            Label={"Order:"}
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dispatch(RemovePlot({ EventId: id, DataType: "LowPassFilter" })))}>Remove</button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}
                    {plotKeys.some(type => type.DataType === "Rectifier") && (
                        <div className="form-row">
                            <fieldset className="border" style={{ padding: '10px', width: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Rectifier</legend>
                                <div className="row">
                                    <div className="col-6 d-flex flex-column justify-content-end">
                                        <Select
                                            Record={{ trc }}
                                            Field={'trc'}
                                            Options={options.trc}
                                            Setter={(trc) => eventIDs.forEach(id => dispatch(UpdateAnalytic({ settings: { ...analytics, Trc: ToInt(trc.trc) }, key: { DataType: "Rectifier", EventId: id } }))) }
                                            Label={"RC Time Const. (ms):"}
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dispatch(RemovePlot({ EventId: id, DataType: "Rectifier" })))}>Remove</button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}
                    {plotKeys.some(type => type.DataType === "FFT") && (
                        <div className="form-row">
                            <fieldset className="border" style={{ padding: '10px', width: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>FFT</legend>
                                <div className="row">
                                    <div className="col-6 d-flex flex-column justify-content-end">
                                        <Select
                                            Record={{ cycles }}
                                            Field={'cycles'}
                                            Options={options.cycles}
                                            Setter={(cycles) => eventIDs.forEach(id => dispatch(UpdateAnalytic({ settings: { ...analytics, FFTCycles: ToInt(cycles.cycles) }, key: { DataType: "FFT" , EventId: id}  }))) }
                                            Label={"Length(Cycles):"}
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dispatch(RemovePlot({ EventId: id, DataType: "FFT" })))}>Remove</button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}
                    {_.uniqBy(plotKeys, "DataType").map(key => !dynamicPlots.includes(key.DataType) && (
                        <div className="form-row">
                            <fieldset className="border" style={{ padding: '10px', width: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>{GetDisplayLabel(key.DataType)}</legend>
                                <div className="row">
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dispatch(RemovePlot({ EventId: id, DataType: key.DataType })))}>Remove</button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    ))}
                </form>
            </div>
        </>
    );
}


export default AnalyticOptions;