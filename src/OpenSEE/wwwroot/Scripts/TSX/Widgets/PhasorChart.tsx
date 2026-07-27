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
import { SelectColor } from '../Store/settingSlice';
import { selectPhaseVectors } from '../PlotSelectors';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';
import { Alert } from '@gpa-gemstone/react-interactive';
    
const widgetPadding = 10;

const PhasorChartWidget = () => {
    const [hover] = React.useContext(HoverContext);
    const { plots } = React.useContext(PlotDataStateContext);
    const { meta } = React.useContext(PlotStateStateContext);
    const evt = React.useContext(EventContext);
    const colors = useSelector(SelectColor);

    const VVector = React.useMemo(() => selectPhaseVectors(hover, evt.Context.EventID, 'Voltage', plots, meta),[hover, evt.Context.EventID, plots, meta] );
    const IVector = React.useMemo(() => selectPhaseVectors(hover, evt.Context.EventID, 'Current', plots, meta),[hover, evt.Context.EventID, plots, meta]);

    const [AssetList, setAssetList] = React.useState<string[]>([]);

    const containerRef = React.useRef(null);
    const { clientWidth, clientHeight } = useGetContainerPosition(containerRef);
    const svgSize = Math.max(0, Math.min(clientWidth, clientHeight) - widgetPadding * 2);

    const scaleV = React.useMemo(() => 0.9 * (svgSize / 2) / Math.max(...VVector.map(item => item.Magnitude)), [VVector, svgSize]);
    const scaleI = React.useMemo(() => 0.9 * (svgSize / 2) / Math.max(...IVector.map(item => item.Magnitude)), [IVector, svgSize]);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            const newAssetList = _.uniq([...VVector.map(item => item.Asset), ...IVector.map(item => item.Asset)]);
            if (!_.isEqual(newAssetList.sort(), AssetList.sort())) {
                setAssetList(newAssetList);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [VVector, IVector]);

    if (VVector.length === 0 && IVector.length === 0)
        return (
            <div className="row justify-content-center" style={{ padding: '10px' }}>
                <div className="col-12">
                    <Alert Class='alert-info'>
                        No data for Phasor Chart.
                    </Alert>
                </div>
            </div>
        );

    return (
        <div ref={containerRef} className="d-flex flex-column" style={{ height: '100%', width: '100%', padding: widgetPadding, boxSizing: 'border-box', overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ flex: '0 0 auto', width: svgSize, height: svgSize, alignSelf: 'center' }}>
                <svg width={svgSize} height={svgSize}>
                    <defs>
                        <marker
                            id="phasor-arrow"
                            viewBox="0 0 10 10"
                            refX={10}
                            refY={5}
                            markerWidth={12}
                            markerHeight={12}
                            markerUnits="userSpaceOnUse"
                            orient="auto"
                        >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                        </marker>
                    </defs>
                    <circle
                        cx={svgSize / 2}
                        cy={svgSize / 2}
                        r={0.9 * (svgSize / 2)}
                        stroke="#ccc"
                        strokeWidth={1}
                        fill="none"
                    />
                    {AssetList.map((asset, ai) => (
                        <React.Fragment key={ai}>
                            {VVector.filter(v => v.Asset === asset).map((v, vi) => (
                                <path
                                    key={`v-${ai}-${vi}`}
                                    d={drawVectorSVG(v, scaleV, svgSize, svgSize)}
                                    stroke={colors[v.Color]}
                                    strokeWidth={2}
                                    fill="none"
                                    markerEnd="url(#phasor-arrow)"
                                />
                            ))}
                            {IVector.filter(v => v.Asset === asset).map((v, vi) => (
                                <path
                                    key={`i-${ai}-${vi}`}
                                    d={drawVectorSVG(v, scaleI, svgSize, svgSize)}
                                    stroke={colors[v.Color]}
                                    strokeWidth={2}
                                    fill="none"
                                    strokeDasharray="5,5"
                                    markerEnd="url(#phasor-arrow)"
                                />
                            ))}
                        </React.Fragment>
                    ))}
                </svg>
            </div>
            <div>
                {AssetList.map((asset, ai) => {
                    const vPhases = _.uniq(VVector.filter(v => v.Asset === asset).map(v => v.Phase));
                    const iPhases = _.uniq(IVector.filter(v => v.Asset === asset).map(v => v.Phase));
                    const allPhases = _.uniq([...vPhases, ...iPhases]);

                    return (
                        <React.Fragment key={ai}>
                            <h4>{asset}</h4>
                            <div style={{ width: '100%', overflowX: 'auto' }}>
                                <table className="table table-sm" style={{ marginBottom: 5, whiteSpace: 'nowrap' }}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th colSpan={2} style={{ textAlign: 'center' }}>V</th>
                                            <th colSpan={2} style={{ textAlign: 'center' }}>I</th>
                                        </tr>
                                        <tr>
                                            <th>Phase</th>
                                            <th style={{ textAlign: 'right' }}>Mag</th>
                                            <th style={{ textAlign: 'right' }}>Ang</th>
                                            <th style={{ textAlign: 'right' }}>Mag</th>
                                            <th style={{ textAlign: 'right' }}>Ang</th>
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
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

const drawVectorSVG = (vec: OpenSee.IVector, scale: number, width: number, height: number) => {
    if (vec.Magnitude === undefined || scale === undefined) return '';
    const centerX = width / 2;
    const centerY = height / 2;
    const x = vec.Magnitude * scale * Math.cos(vec.Angle * Math.PI / 180);
    const y = vec.Magnitude * scale * Math.sin(vec.Angle * Math.PI / 180);
    return `M ${centerX} ${centerY} L ${centerX + x} ${centerY - y}`;
}

const createTable = (vec: OpenSee.IVector | undefined, index: number) => {
    if (vec == undefined)
        return (
            <React.Fragment key={index}>
                <td style={{ textAlign: 'right' }}>N/A</td>
                <td style={{ textAlign: 'right' }}>N/A</td>
            </React.Fragment>
        );

    const factor = (vec.Unit.factor === undefined ? (1.0 / vec.BaseValue) : vec.Unit.factor);
    const phaseFactor = (vec.PhaseUnit.factor === undefined ? (1.0 / vec.BaseValue) : vec.PhaseUnit.factor);

    return (
        <React.Fragment key={index}>
            <td style={{ textAlign: 'right' }}>{(vec.Magnitude * factor).toFixed(2)} {vec.Unit.short}</td>
            <td style={{ textAlign: 'right' }}>{(vec.Angle * phaseFactor).toFixed(2)} {vec.PhaseUnit.short}</td>
        </React.Fragment>
    );
}


export default PhasorChartWidget;
