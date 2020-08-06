//******************************************************************************************************
//  Current.tsx - Gbtc
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
//  03/18/2019 - Billy Ernest
//       Generated original version of source code.
//  01/17/2020 - C. Lackner
//       Moved to D3.
//
//******************************************************************************************************

import * as React  from 'react';
import OpenSEEService from './../../TS/Services/OpenSEE';
import D3LineChartBase, { D3LineChartBaseProps } from './../Graphs/D3LineChartBase';
import { cloneDeep } from "lodash";
import { Vector } from '../jQueryUI Widgets/PolarChart';

export interface CurrentChartProps extends D3LineChartBaseProps { }


export default class Current extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    props: CurrentChartProps
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
    }

    componentWillUnmount() {
        if (this.state.eventDataHandle !== undefined) {
            this.state.eventDataHandle.forEach(item => {
                if (item.abort !== undefined)
                    item.abort();
            })
            this.setState({ eventDataHandle: undefined });
        }
        if (this.state.frequencyDataHandle !== undefined) {
            this.state.frequencyDataHandle.forEach(item => {
                if (item.abort !== undefined)
                    item.abort();
            });
            this.setState({ frequencyDataHandle: undefined });
        }
    }


    getData(props: D3LineChartBaseProps, baseCtrl: D3LineChartBase, ctrl: Current): void {

        const eventDataHandle = ctrl.openSEEService.getWaveformCurrentData(props.eventId).then(data => {
            if (data == null) return;

            baseCtrl.addData(data, baseCtrl, true);


            if (this.props.endTime == 0) this.props.stateSetter({ graphEndTime: this.props.endTime });
            if (this.props.startTime == 0) this.props.stateSetter({ graphStartTime: this.props.startTime });

        });
        this.setState((props, state) => {
            if (state.evendDataHandle == undefined)
                return { eventDataHandle: [eventDataHandle] }
            else {
                let tmp = state.eventDataHandle;
                tmp.push(eventDataHandle);
                return { eventDataHandle: tmp }
            }
        });

        const frequencyDataHandle = this.openSEEService.getFrequencyData(props.eventId, "Current").then(data => {
            setTimeout(() => {
                if (data == null) return;

                baseCtrl.addData(data, baseCtrl)


                if (this.props.endTime == 0) this.props.stateSetter({ graphEndTime: this.props.endTime });
                if (this.props.startTime == 0) this.props.stateSetter({ graphStartTime: this.props.startTime });

            }, 200);
        })

        this.setState((props, state) => {
            if (state.frequencyDataHandle == undefined)
                return { frequencyDataHandle: [frequencyDataHandle] }
            else {
                let tmp = state.frequencyDataHandle;
                tmp.push(frequencyDataHandle);
                return { frequencyDataHandle: tmp }
            }
        });


        this.props.compareEvents.forEach(evtID => {
            const compareDataHandle = ctrl.openSEEService.getWaveformCurrentData(evtID).then(data => {
                setTimeout(() => {
                    if (data == null) return;
                    baseCtrl.addData(data, baseCtrl);
                }, 200);
            });

            const compareFrequencyDataHandle = ctrl.openSEEService.getFrequencyData(evtID, "Current").then(data => {
                setTimeout(() => {
                    if (data == null) return;
                    baseCtrl.addData(data, baseCtrl);
                }, 200);
            });

            this.setState((props, state) => {
                if (state.evendDataHandle == undefined)
                    return { eventDataHandle: [compareDataHandle] }
                else {
                    let tmp = state.eventDataHandle;
                    tmp.push(compareDataHandle);
                    return { eventDataHandle: tmp }
                }
            });

            this.setState((props, state) => {
                if (state.frequencyDataHandle == undefined)
                    return { frequencyDataHandle: [compareFrequencyDataHandle] }
                else {
                    let tmp = state.frequencyDataHandle;
                    tmp.push(compareFrequencyDataHandle);
                    return { frequencyDataHandle: tmp }
                }
            });

        })


    }

    setYLimits(ymin: number, ymax: number, auto: boolean) {
        let lim = cloneDeep(this.props.yLimits);
        if (this.props.yLimits.max !== ymax || this.props.yLimits.min !== ymin) {
            lim.min = ymin;
            lim.max = ymax;
            lim.auto = auto;


            this.props.stateSetter({ currentLimits: lim });
        }

    }

    setVectors(v: Array<Vector>) {
        this.props.stateSetter({ iVectors: v });
    }


    render() {
        return <D3LineChartBase
            legendKey="Current"
            openSEEServiceFunction={this.openSEEService.getWaveformCurrentData}
            getData={(props, ctrl) => this.getData(props, ctrl, this)}
            eventId={this.props.eventId}
            height={this.props.height}
            width={this.props.width}
            stateSetter={this.props.stateSetter}
            options={this.props.options}
            startTime={this.props.startTime}
            endTime={this.props.endTime}
            hover={this.props.hover}
            fftWindow={this.props.fftWindow}
            fftStartTime={this.props.fftStartTime}
            tableSetter={this.props.tableSetter}
            unitSettings={this.props.unitSettings}
            colorSettings={this.props.colorSettings}
            zoomMode={this.props.zoomMode}
            mouseMode={this.props.mouseMode}
            yLimits={{ ...this.props.yLimits, setter: this.setYLimits.bind(this) }}
            compareEvents={this.props.compareEvents}
            activeUnitSetter={this.props.activeUnitSetter}
            getPointSetter={this.props.getPointSetter}
            setVector={this.setVectors.bind(this)}
        />
    }

}