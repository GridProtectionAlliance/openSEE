//******************************************************************************************************
//  PolarChart.tsx - Gbtc
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
//  05/10/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as _ from 'lodash';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { PlotDataStateContext } from '../Context/PlotDataContext';
import { PlotStateStateContext } from '../Context/PlotStateContext';
import EventContext from '../Context/EventContext';
import HoverContext from '../Context/HoverContext';
import { OpenSee } from '../global';
import { SelectColor } from '../store/settingSlice';
import { selectPhaseVectors } from '../PlotSelectors';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';

const PhasorChartWidget = () => {
    const [hover] = React.useContext(HoverContext);
    const { plots } = React.useContext(PlotDataStateContext);
    const { meta } = React.useContext(PlotStateStateContext);
    const evt = React.useContext(EventContext);
    const colors = useSelector(SelectColor);

    const VVector = React.useMemo(
        () => selectPhaseVectors(hover, evt.Context.EventID, 'Voltage', plots, meta),
        [hover, evt.Context.EventID, plots, meta]
    );
    const IVector = React.useMemo(
        () => selectPhaseVectors(hover, evt.Context.EventID, 'Current', plots, meta),
        [hover, evt.Context.EventID, plots, meta]
    );

    const [AssetList, setAssetList] = React.useState<string[]>([]);
    const [scaleV, setScaleV] = React.useState<number>(0);
    const [scaleI, setScaleI] = React.useState<number>(0);

    const svgRef = React.useRef(null);
    const { clientWidth, clientHeight } = useGetContainerPosition(svgRef);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            const newAssetList = _.uniq([...VVector.map(item => item.Asset), ...IVector.map(item => item.Asset)]);
            if (!_.isEqual(newAssetList.sort(), AssetList.sort())) {
                setAssetList(newAssetList);
            }
            setScaleV(0.9 * Math.max(clientWidth / 2, clientHeight / 2) / Math.max(...VVector.map(item => item.Magnitude)));
            setScaleI(0.9 * Math.max(clientWidth / 2, clientHeight / 2) / Math.max(...IVector.map(item => item.Magnitude)));
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [VVector, IVector]);

    function drawVectorSVG(vec: OpenSee.IVector, scale: number) {
        if (vec.Magnitude === undefined || scale === undefined) return '';
        const centerX = clientWidth / 2;
        const centerY = clientHeight / 2;
        const x = vec.Magnitude * scale * Math.cos(vec.Angle * Math.PI / 180);
        const y = vec.Magnitude * scale * Math.sin(vec.Angle * Math.PI / 180);
        return `M ${centerX} ${centerY} L ${centerX + x} ${centerY - y} Z`;
    }

    function createTable(vec: OpenSee.IVector | undefined, index: number) {
        if (vec == undefined)
            return <React.Fragment key={index}><td>N/A</td><td>N/A</td></React.Fragment>;

        const factor = (vec.Unit.factor === undefined ? (1.0 / vec.BaseValue) : vec.Unit.factor);
        const phaseFactor = (vec.PhaseUnit.factor === undefined ? (1.0 / vec.BaseValue) : vec.PhaseUnit.factor);

        return (
            <React.Fragment key={index}>
                <td style={{ textAlign: 'right' }}>{(vec.Magnitude * factor).toFixed(2)} {vec.Unit.short}</td>
                <td style={{ textAlign: 'right' }}>{(vec.Angle * phaseFactor).toFixed(2)} {vec.PhaseUnit.short}</td>
            </React.Fragment>
        );
    }

    return (
        <div className="d-flex flex-column" style={{ height: '100%', width: '100%', padding: '10px' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
                <svg ref={svgRef} width="100%" height="100%">
                    {AssetList.map((asset, ai) => (
                        <React.Fragment key={ai}>
                            {VVector.filter(v => v.Asset === asset).map((v, vi) => (
                                <path key={`v-${ai}-${vi}`} d={drawVectorSVG(v, scaleV)} stroke={colors[v.Color]} strokeWidth={2} fill="none" />
                            ))}
                            {IVector.filter(v => v.Asset === asset).map((v, vi) => (
                                <path key={`i-${ai}-${vi}`} d={drawVectorSVG(v, scaleI)} stroke={colors[v.Color]} strokeWidth={2} fill="none" strokeDasharray="5,5" />
                            ))}
                        </React.Fragment>
                    ))}
                </svg>
            </div>
            <div style={{ maxHeight: '40%', overflowY: 'auto' }}>
                {AssetList.map((asset, ai) => {
                    const vPhases = _.uniq(VVector.filter(v => v.Asset === asset).map(v => v.Phase));
                    const iPhases = _.uniq(IVector.filter(v => v.Asset === asset).map(v => v.Phase));
                    const allPhases = _.uniq([...vPhases, ...iPhases]);

                    return (
                        <table key={ai} className="table table-sm" style={{ marginBottom: 5 }}>
                            <thead>
                                <tr>
                                    <th>{asset}</th>
                                    <th colSpan={2} style={{ textAlign: 'center' }}>V</th>
                                    <th colSpan={2} style={{ textAlign: 'center' }}>I</th>
                                </tr>
                                <tr>
                                    <th>Phase</th>
                                    <th>Mag</th><th>Ang</th>
                                    <th>Mag</th><th>Ang</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allPhases.map((phase, pi) => (
                                    <tr key={pi}>
                                        <td>{phase}</td>
                                        {createTable(VVector.find(v => v.Asset === asset && v.Phase === phase), pi * 2)}
                                        {createTable(IVector.find(v => v.Asset === asset && v.Phase === phase), pi * 2 + 1)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                })}
            </div>
        </div>
    );
};

export default PhasorChartWidget;