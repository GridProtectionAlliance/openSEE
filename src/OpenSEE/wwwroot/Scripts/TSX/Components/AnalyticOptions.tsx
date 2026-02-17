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
import { useAppDispatch, useAppSelector } from '../hooks';
import { BtnDropdown } from "@gpa-gemstone/react-interactive"
import { Select, Input } from "@gpa-gemstone/react-forms"
import * as _ from 'lodash';
import { GetDisplayLabel } from '../Graphs/Utilities'
import AnalyticContext from '../Context/AnalyticContext';
import { DataContext, DataFunctionContext } from '../Context/DataContext';

const AnalyticOptions = () => {
    const [analytic, setAnalytic] = React.useContext(AnalyticContext);
    const data = React.useContext(DataContext);
    const dataDispatch = React.useContext(DataFunctionContext);

    const eventIDs = data.Selector.current.SelectEventIDs(data.Context);
    const defaultAnalyticBtns = [
        { Label: 'Fault Distance', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'FaultDistance', EventId: id })), DataType: 'FaultDistance' },
        { Label: 'FFT', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'FFT', EventId: id })), DataType: 'FFT' },
        { Label: 'First Derivative', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'FirstDerivative', EventId: id })), DataType: "FirstDerivative" },
        { Label: 'Fix Clipped Waveforms', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'ClippedWaveforms', EventId: id })), DataType: 'ClippedWaveforms' },
        { Label: 'Frequency', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'Frequency', EventId: id })), DataType: 'Frequency' },
        { Label: 'High Pass', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'HighPassFilter', EventId: id })), DataType: 'HighPassFilter' },
        { Label: 'Impedance', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'Impedance', EventId: id })), DataType: 'Impedance' },
        { Label: 'Low Pass', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'LowPassFilter', EventId: id })), DataType: 'LowPassFilter' },
        { Label: 'Missing Voltage', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'MissingVoltage', EventId: id })), DataType: 'MissingVoltage' },
        { Label: 'Overlapping Waveform', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'OverlappingWave', EventId: id })), DataType: 'OverlappingWave' },
        { Label: 'Power', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'Power', EventId: id })), DataType: 'Power' },
        { Label: 'Rapid Voltage Change', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'RapidVoltage', EventId: id })), DataType: 'RapidVoltage' },
        { Label: 'Rectifier Output', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'Rectifier', EventId: id })), DataType: 'Rectifier' },
        { Label: 'Remove Current', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'RemoveCurrent', EventId: id })), DataType: 'RemoveCurrent' },
        { Label: 'Specified Harmonic', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'Harmonic', EventId: id })), DataType: 'Harmonic' },
        { Label: 'Symmetrical Components', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'SymetricComp', EventId: id })), DataType: 'SymetricComp' },
        { Label: 'THD', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'THD', EventId: id })), DataType: 'THD' },
        { Label: 'Unbalance', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'Unbalance', EventId: id })), DataType: 'Unbalance' },
        { Label: 'i2t', Callback: () => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: 'I2T', EventId: id })), DataType: 'I2T' }
    ];

    const [analyticBtns, setAnalyticBtns] = React.useState<any[]>(defaultAnalyticBtns)

    const analyticDebounce = (newAnalytic: OpenSee.IAnalyticContext) => {
        setTimeout(() => {
            setAnalytic(newAnalytic);
        }, 500);
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

    const plotKeys = data.Selector.current.SelectPlotKeys();

    React.useEffect(() => {
        const filteredAnalyticBtns = defaultAnalyticBtns.filter(btn => !plotKeys.map(key => key.DataType).includes(btn.DataType as OpenSee.graphType));

        setAnalyticBtns(filteredAnalyticBtns)
    }, [data])


    //nonanalytic plots or analytic plots that need parameters
    const dynamicPlots = ["Harmonic", "HighPassFilter", "LowPassFilter", "Rectifier", "FFT", "Voltage", "Current", "Analogs", 'Digitals', 'TripCoil']

    return (
        <>
            <div className="d-flex" style={{ width: '100%', height: '100%', padding: '10px' }}>
                <form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', height: '100%', width: '100%', overflowY: 'auto', padding: '10px', marginTop: 0 }}>
                    <div style={{marginBottom: '20px'}}>
                    <BtnDropdown
                            Label={analyticBtns[0].Label}
                            Callback={() => eventIDs.forEach(id => dataDispatch.Dispatch.current.AddPlot({ DataType: analyticBtns[0].DataType, EventId: id }))}
                            Options={analyticBtns}
                        />
                    </div>
                    {plotKeys.some(type => type.DataType === "Harmonic") && (
                        <div className="form-row">
                            <fieldset className="border" style={{ padding: '10px', width: '100%', marginBottom: '20px' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Specified Harmonic</legend>
                                <div className="row">
                                    <div className="col-6 d-flex flex-column justify-content-end">
                                        <Input<OpenSee.IAnalyticContext>
                                            Record={analytic}
                                            Field={'Harmonic'}
                                            Type={'integer'}
                                            Setter={analyticDebounce}
                                            Label={"Harmonic:"}
                                            Valid={() => analytic.Harmonic != null}
                                            Feedback="Harmonic value can not be empty"
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dataDispatch.Dispatch.current.RemovePlot({ EventId: id, DataType: "Harmonic" }))}>Remove</button>
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
                                        <Select<OpenSee.IAnalyticContext>
                                            Record={analytic}
                                            Field={'HPFOrder'}
                                            Options={options.order}
                                            Setter={setAnalytic}
                                            Label={"Order:"}
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dataDispatch.Dispatch.current.RemovePlot({ EventId: id, DataType: "HighPassFilter" }))}>Remove</button>
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
                                        <Select<OpenSee.IAnalyticContext>
                                            Record={analytic}
                                            Field={'LPFOrder'}
                                            Options={options.order}
                                            Setter={setAnalytic}
                                            Label={"Order:"}
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dataDispatch.Dispatch.current.RemovePlot({ EventId: id, DataType: "LowPassFilter" }))}>Remove</button>
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
                                        <Select<OpenSee.IAnalyticContext>
                                            Record={analytic}
                                            Field={'Trc'}
                                            Options={options.trc}
                                            Setter={setAnalytic}
                                            Label={"RC Time Const. (ms):"}
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dataDispatch.Dispatch.current.RemovePlot({ EventId: id, DataType: "Rectifier" }))}>Remove</button>
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
                                        <Input<OpenSee.IAnalyticContext>
                                            Record={analytic}
                                            Field={'FFTCycles'}
                                            Type={"integer"}
                                            Setter={analyticDebounce}
                                            Label={"Length(Cycles):"}
                                            Valid={() => analytic.FFTCycles != null}
                                            Feedback="FFT Cycles value can not be empty"
                                        />
                                    </div>
                                    <div className="col-6 d-flex flex-column justify-content-end" style={{ marginBottom: '1rem' }}>
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dataDispatch.Dispatch.current.RemovePlot({ EventId: id, DataType: "FFT" }))}>Remove</button>
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
                                        <button className="btn btn-primary" onClick={() => eventIDs.forEach(id => dataDispatch.Dispatch.current.RemovePlot({ EventId: id, DataType: key.DataType }))}>Remove</button>
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