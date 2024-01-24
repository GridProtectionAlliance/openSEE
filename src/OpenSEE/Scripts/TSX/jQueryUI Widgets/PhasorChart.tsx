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

import * as React from 'react';

import { useSelector } from 'react-redux';
import { selectVPhases, selectIPhases } from '../store/dataSlice';
import { SelectColor } from '../store/settingSlice';
import * as _ from 'lodash';
import { OpenSee } from '../global';
import HoverContext from '../Context/HoverContext'


const PhasorChartWidget = () => {
    const hover = React.useContext(HoverContext);

    const VVector = useSelector(selectVPhases(hover.hover));
    const IVector = useSelector(selectIPhases(hover.hover));
    const colors = useSelector(SelectColor);

    const [AssetList, setAssetList] = React.useState<string[]>([]);
    const [scaleV, setScaleV] = React.useState<number>(0);
    const [scaleI, setScaleI] = React.useState<number>(0);

    const svgRef = React.useRef(null);
    const [svgSize, setSvgSize] = React.useState({ width: 0, height: 0 });

    React.useLayoutEffect(() => {
        if (svgRef.current)
            setSvgSize({ width: svgRef.current.clientWidth, height: svgRef.current.clientHeight });
    }, [])

    React.useEffect(() => {
        const newAssetList = _.uniq([...VVector.map(item => item.Asset), ...IVector.map(item => item.Asset)]);
        if (!_.isEqual(newAssetList.sort(), AssetList.sort())) {
            setAssetList(newAssetList);
        }
        setScaleV(0.9 * Math.max(svgSize.width / 2, svgSize.height / 2) / Math.max(...VVector.map(item => item.Magnitude)))
        setScaleI(0.9 * Math.max(svgSize.width / 2, svgSize.height / 2) / Math.max(...IVector.map(item => item.Magnitude)))
    }, [VVector, IVector]);

    function drawVectorSVG(vec, scale) {
        if (vec.Magnitude === undefined || scale === undefined) return '';

        const centerX = svgSize.width / 2;
        const centerY = svgSize.height / 2;

        let x = vec.Magnitude * scale * Math.cos(vec.Angle * Math.PI / 180);
        let y = vec.Magnitude * scale * Math.sin(vec.Angle * Math.PI / 180);


        return `M ${centerX} ${centerY} L ${centerX + x} ${centerY - y} Z`;
    }


    function createTable(vec, index) {
        if (vec == undefined)
            return <React.Fragment key={index}><td>N/A</td><td>N/A</td> </React.Fragment>

        const factor = (vec.Unit.short == 'pu' ? (1.0 / vec.BaseValue) : vec.Unit.factor);

        return (<React.Fragment key={index}>
            <td >{(vec.Magnitude * factor).toFixed(2)}</td>
            <td >{(vec.Angle * vec.PhaseUnit.factor).toFixed(2)}</td>
        </React.Fragment>)
    }


    let rowSpan = VVector.length + IVector.length + 1

    let MagUnits = _.uniq([...VVector.map((d: OpenSee.IVector) => d.Unit.short), ...IVector.map((d: OpenSee.IVector) => d.Unit.short)]).map((s: string) => {
        return "[" + s + "]";
    }).join("  ");


    let PhaseUnits = _.uniq([...VVector.map((d: OpenSee.IVector) => d.PhaseUnit)]).map((unit: OpenSee.iUnitOptions) => {
        return "[" + unit.short + "]";
    }).join("  ");

    const radius = (Math.min(svgSize.width, svgSize.height) / 2) - 10;

    return (
        <div className="d-flex flex-column" style={{ width: '100%', height: '100%', zIndex: 1001, padding: '10px' }}>
            <div style={{ zIndex: 1001, height: '50%' }}>
                <svg ref={svgRef} width="100%" height="100%">
                    <circle cx={svgSize.width / 2} cy={svgSize.height / 2} r={radius / 2.167} stroke="lightgrey" strokeWidth="1" fill='white' fillOpacity="0" />
                    <circle cx={svgSize.width / 2} cy={svgSize.height / 2} r={radius} stroke="lightgrey" strokeWidth="1" fill='white' fillOpacity="0" />
                    <line x1="0" y1={svgSize.height / 2} x2={svgSize.width} y2={svgSize.height / 2} style={{ stroke: 'lightgrey', strokeWidth: 2 }} />
                    <line x1={svgSize.width / 2} y1="0" x2={svgSize.width / 2} y2={svgSize.height} style={{ stroke: 'lightgrey', strokeWidth: 2 }} />
                    {VVector.map((v, i) => <path key={i} d={drawVectorSVG(v, scaleV)} style={{ stroke: colors[v.Color], strokeWidth: 3 }} />)}
                    {IVector.map((v, i) => <path key={i} d={drawVectorSVG(v, scaleI)} style={{ stroke: colors[v.Color], strokeWidth: 3 }} />)}
                </svg>
            </div>
            <div style={{ height: '50%' }}>
                <table className="table" style={{ width: '100%', height: '100%' }}>
                    <thead>
                        <tr><th></th><th></th><th></th>{AssetList.map((item, index) => <React.Fragment key={index}><th key={index} style={{ marginLeft: 15 }}>Mag{MagUnits}</th><th >Ang{PhaseUnits}</th></React.Fragment>)}</tr>
                    </thead>
                    <tbody style={{ overflowY: 'scroll', width: '100%', height: '100%' }}>
                        <tr>
                            {AssetList.map(item => <th rowSpan={rowSpan} style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', whiteSpace: 'nowrap', textAlign: 'center' }}>{item}</th>)}
                        </tr>
                        {VVector?.length > 0 ?
                            VVector.map((vv, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td className="dot" style={{ background: colors[vv.Color] }}><b>&nbsp;&nbsp;&nbsp;</b></td>
                                        <td><b>{vv.Color}</b></td>
                                        {createTable(vv, index)}
                                    </tr>
                                </React.Fragment>
                            ))
                            : null}
                        {IVector?.length > 0 ?
                            IVector.map((iv, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td className="dot" style={{ background: colors[iv.Color] }}><b>&nbsp;&nbsp;&nbsp;</b></td>
                                        <td>{iv.Color}</td>
                                        {createTable(iv, index)}
                                    </tr>
                                </React.Fragment>
                            ))
                            : null}

                    </tbody>
                </table>
            </div>
        </div>
    )
}



export default PhasorChartWidget;
