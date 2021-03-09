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

import { WidgetWindow } from './Common';
import { useSelector } from 'react-redux';
import { selectVPhases, selectIPhases } from '../store/dataSlice';
import { selectColor } from '../store/settingSlice';
import { uniq } from 'lodash';
import { OpenSee } from '../global';

interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
}

const PolarChartWidget = (props: Iprops) => {
    const VVector = useSelector(selectVPhases);
    const IVector = useSelector(selectIPhases);
    const colors = useSelector(selectColor);

    const [AssetList, setAssetList] = React.useState<string[]>([]);

    React.useEffect(() => {
        setAssetList(uniq([...VVector.map(item => item.Asset), ...IVector.map(item => item.Asset)]));
    }, [VVector, IVector])

    const rowStyle = {padding: 2, height: '2em'}
  
    let scaleV = 0.9 * 150 / Math.max(...VVector.map(item => item.Magnitude));
    let scaleI = 0.9 * 150 / Math.max(...IVector.map(item => item.Magnitude));


    function drawVectorSVG(vec, scale): string {
        if (vec.Magnitude == undefined || scale == undefined || vec.Magnitude == undefined) return '';
        var x = vec.Magnitude * scale * Math.cos(vec.Angle * Math.PI / 180);
        var y = vec.Magnitude * scale * Math.sin(vec.Angle * Math.PI / 180);
        return `M 150 150 L ${150 + x} ${150 - y} Z`
    }

    function createTable(vec, index) {
        if (vec == undefined)
            return <React.Fragment key={index}><td style={{ padding: 2 }}>N/A</td><td style={{ padding: 2 }}>N/A</td> </React.Fragment>

        const factor = (vec.Unit.short == 'pu' ? (1.0/vec.BaseValue) : vec.Unit.factor);
        return (<React.Fragment key={index}>
            <td style={{padding: 2}}>{(vec.Magnitude * factor).toFixed(2)}</td>
            <td style={{ padding: 2 }}>{(vec.Angle * vec.PhaseUnit.factor).toFixed(2)}</td>
        </React.Fragment>)
    }

    let Va = VVector.filter(item => item.Phase == 'AN');
    let Vb = VVector.filter(item => item.Phase == 'BN');
    let Vc = VVector.filter(item => item.Phase == 'CN');

    let Vab = VVector.filter(item => item.Phase == 'AB');
    let Vbc = VVector.filter(item => item.Phase == 'BC');
    let Vca = VVector.filter(item => item.Phase == 'CA');

    let Vn = VVector.filter(item => item.Phase == 'NG');

    let Ia = IVector.filter(item => item.Phase == 'AN');
    let Ib = IVector.filter(item => item.Phase == 'BN');
    let Ic = IVector.filter(item => item.Phase == 'CN');
    let In = IVector.filter(item => item.Phase == 'NG');
    let Ires = IVector.filter(item => item.Phase == 'RES');

    let MagUnits = uniq([...VVector.map((d: OpenSee.IVector) => d.Unit.short), ...IVector.map((d: OpenSee.IVector) => d.Unit.short)]).map((s: string) => {
        return "[" + s +  "]";
    }).join("  ");
    let PhaseUnits = uniq([...VVector.map((d: OpenSee.IVector) => d.PhaseUnit)]).map((unit: OpenSee.iUnitOptions) => {
        return "[" + unit.short + "]";
    }).join("  ");

    return (
        <WidgetWindow show={props.isOpen} close={props.closeCallback} maxHeight={325} width={720}>
            <div style={{ width: 714, height: 300, zIndex: 1001 }}>
            <div style={{ width: 300, height: 300, zIndex: 1001, display: 'inline-block'}}>
                <svg width="300" height="300">
                    <circle cx="150" cy="150" r={60} stroke="lightgrey" strokeWidth="1" fill='white' fillOpacity="0" />
                    <circle cx="150" cy="150" r={130} stroke="lightgrey" strokeWidth="1" fill='white' fillOpacity="0" />
                    <line x1="150" y1="0" x2="150" y2="300" style={{ stroke: 'lightgrey', strokeWidth: 2 }} />
                    <line x1="0" y1="150" x2="300" y2="150" style={{ stroke: 'lightgrey', strokeWidth: 2 }} />
                    {props.isOpen ? VVector.map((v,i) => <path key={i} d={drawVectorSVG(v, scaleV)} style={{ stroke: colors[v.Color], strokeWidth: 3 }} />) : null}
                    {props.isOpen ? IVector.map((v, i) => <path key={i} d={drawVectorSVG(v, scaleI)} style={{ stroke: colors[v.Color], strokeWidth: 3 }} />) : null}
                </svg>
                </div>
                <div style={{ overflowY: 'scroll', maxWidth: 250, maxHeight: 300, float: 'right', paddingRight: 5, marginBottom: 0 }}>
                    <table className="table" style={{ maxHeight: 300, float: 'right', display: 'block' }}>
                        <thead>
                            {props.isOpen ? 
                            <>
                                <tr> <th></th> {AssetList.map((item, index) => <th colSpan={2} key={index}><span>{item}</span> </th>)} </tr>
                                <tr> <th></th> {AssetList.map((item, index) => <React.Fragment key={index}><th>Mag {MagUnits}</th><th>Ang {PhaseUnits}</th></React.Fragment>)} </tr>
                            </>
                            : null}
                        </thead>
                        <tbody>
                            {props.isOpen ? 
                                <>
                                    {(Va.length > 0) ? <tr><td style={{ padding: 2 }}>Va</td>{AssetList.map((asset, index) => createTable(Va.find(item => item.Asset == asset), index))}</tr> : null}
                                    {(Vb.length > 0) ? <tr><td style={{ padding: 2 }}>Vb</td>{AssetList.map((asset, index) => createTable(Vb.find(item => item.Asset == asset), index))}</tr> : null}
                                    {(Vc.length > 0) ? <tr><td style={{ padding: 2 }}>Vc</td>{AssetList.map((asset, index) => createTable(Vc.find(item => item.Asset == asset), index))}</tr> : null}

                                    {(Vab.length > 0) ? <tr><td style={{ padding: 2 }}>Vab</td>{AssetList.map((asset, index) => createTable(Vab.find(item => item.Asset == asset), index))}</tr> : null}
                                    {(Vbc.length > 0) ? <tr><td style={{ padding: 2 }}>Vbc</td>{AssetList.map((asset, index) => createTable(Vbc.find(item => item.Asset == asset), index))}</tr> : null}
                                    {(Vca.length > 0) ? <tr><td style={{ padding: 2 }}>Vca</td>{AssetList.map((asset, index) => createTable(Vca.find(item => item.Asset == asset), index))}</tr> : null}

                                    {(Vn.length > 0) ? <tr><td style={{ padding: 2 }}>Vn</td>{AssetList.map((asset, index) => createTable(Vn.find(item => item.asset == asset), index))}</tr> : null}

                                    {(Ia.length > 0) ? <tr><td style={{ padding: 2 }}>Ia</td>{AssetList.map((asset, index) => createTable(Ia.find(item => item.Asset == asset), index))}</tr> : null}
                                    {(Ib.length > 0) ? <tr><td style={{ padding: 2 }}>Ib</td>{AssetList.map((asset, index) => createTable(Ib.find(item => item.Asset == asset), index))}</tr> : null}
                                    {(Ic.length > 0) ? <tr><td style={{ padding: 2 }}>Ic</td>{AssetList.map((asset, index) => createTable(Ic.find(item => item.Asset == asset), index))}</tr> : null}

                                    {(In.length > 0) ? <tr><td style={{ padding: 2 }}>In</td>{AssetList.map((asset, index) => createTable(In.find(item => item.Asset == asset), index))}</tr> : null}
                                    {(Ires.length > 0) ? <tr><td style={{ padding: 2 }}>Ires</td>{AssetList.map((asset, index) => createTable(Ires.find(item => item.Asset == asset), index))}</tr> : null}
                                </>
                                : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </WidgetWindow>
       )

}



export default PolarChartWidget;
