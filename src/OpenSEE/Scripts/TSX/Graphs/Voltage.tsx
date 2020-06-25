//******************************************************************************************************
//  Voltage.tsx - Gbtc
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
//  01/06/2020 - C. Lackner
//       Switched to D3 plotting
//
//******************************************************************************************************

import * as React  from 'react';
import { utc } from "moment";
import * as moment from 'moment';
import { cloneDeep } from "lodash";

import OpenSEEService from './../../TS/Services/OpenSEE';
import D3LineChartBase, { D3LineChartBaseProps } from './../Graphs/D3LineChartBase';

export interface VoltageChartProps extends D3LineChartBaseProps { }

export default class Voltage extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    props: VoltageChartProps;
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
    }

    componentWillUnmount() {
        if (this.state.eventDataHandle !== undefined && this.state.eventDataHandle.abort !== undefined) {
            this.state.eventDataHandle.abort();
            this.setState({ eventDataHandle: undefined });
        }
        if (this.state.frequencyDataHandle !== undefined && this.state.frequencyDataHandle.abort !== undefined) {
            this.state.frequencyDataHandle.abort();
            this.setState({ frequencyDataHandle: undefined });
        }

    }


    getData(props: D3LineChartBaseProps, baseCtrl: D3LineChartBase, ctrl: Voltage): void {

        baseCtrl.createPlot();
        var eventDataHandle = ctrl.openSEEService.getWaveformVoltageData(props.eventId).then(data => {
            if (data == null) return;

            baseCtrl.addData(data, baseCtrl)


            if (this.props.endTime == 0) this.props.stateSetter({ graphEndTime: this.props.endTime });
            if (this.props.startTime == 0) this.props.stateSetter({ graphStartTime: this.props.startTime });

        });
        this.setState({ eventDataHandle: eventDataHandle });

        var frequencyDataHandle = this.openSEEService.getFrequencyData(props.eventId, "Voltage").then(data => {
            setTimeout(() => {
                if (data == null) return;

                baseCtrl.addData(data, baseCtrl)


                if (this.props.endTime == 0) this.props.stateSetter({ graphEndTime: this.props.endTime });
                if (this.props.startTime == 0) this.props.stateSetter({ graphStartTime: this.props.startTime });

            }, 200);
        })

        this.setState({ frequencyDataHandle: frequencyDataHandle });


    }

    setYLimits(ymin: number, ymax: number, auto: boolean) {
        let lim = cloneDeep(this.props.yLimits);

        lim.min = ymin;
        lim.max = ymax;
        lim.auto = auto;

        this.props.stateSetter({ voltageLimits: lim });

    }

    render() {
        return <D3LineChartBase
            legendKey="Voltage"
            openSEEServiceFunction={this.openSEEService.getWaveformVoltageData}
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
            tableReset={this.props.tableReset}
            pointTable={this.props.pointTable}
            unitSettings={this.props.unitSettings}
            colorSettings={this.props.colorSettings}
            zoomMode={this.props.zoomMode}
            mouseMode={this.props.mouseMode}
            yLimits={{ ...this.props.yLimits, setter: this.setYLimits.bind(this)}}
        />
    }

}