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
import * as moment from 'moment';

export default class Current extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    props: D3LineChartBaseProps
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


    getData(props: D3LineChartBaseProps, baseCtrl: D3LineChartBase, ctrl: Current): void {

        var eventDataHandle = ctrl.openSEEService.getWaveformCurrentData(props.eventId).then(data => {
            if (data == null) return;

            var dataSet = baseCtrl.state.dataSet;
            
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

            if (this.props.endTimeVis == null) this.props.stateSetter({ endTimeVis: this.props.endTime });
            if (this.props.startTimeVis == null) this.props.stateSetter({ startTimeVis: this.props.startTime });

            dataSet.Data = baseCtrl.createLegendRows(dataSet.Data);

            baseCtrl.createDataRows(dataSet.Data);
            baseCtrl.setState({ dataSet: data });
        });
        this.setState({ eventDataHandle: eventDataHandle });

        var frequencyDataHandle = this.openSEEService.getFrequencyData(props.eventId, "Current").then(data => {
            setTimeout(() => {
                if (data == null) return;


                var dataSet = baseCtrl.state.dataSet;

                if (dataSet.Data != undefined)
                    dataSet.Data = dataSet.Data.concat(data.Data);
                else
                    dataSet = data;

                if (this.props.endTimeVis == null) this.props.stateSetter({ endTimeVis: this.props.endTime });
                if (this.props.startTimeVis == null) this.props.stateSetter({ startTimeVis: this.props.startTime });

                dataSet.Data = baseCtrl.createLegendRows(dataSet.Data);

                baseCtrl.createDataRows(dataSet.Data)
                baseCtrl.setState({ dataSet: dataSet });
            }, 200);
        })

        this.setState({ frequencyDataHandle: frequencyDataHandle });


    }
    

    render() {
        return <D3LineChartBase
            legendKey="Current"
            openSEEServiceFunction={this.openSEEService.getWaveformCurrentData}
            getData={(props, ctrl) => this.getData(props, ctrl, this)}
            eventId={this.props.eventId}
            height={this.props.height}
            stateSetter={this.props.stateSetter}
            options={this.props.options}
            startTime={this.props.startTime}
            endTime={this.props.endTime}
            startTimeVis={this.props.startTimeVis}
            endTimeVis={this.props.endTimeVis}
            hover={this.props.hover}
            fftWindow={this.props.fftWindow}
            fftStartTime={this.props.fftStartTime}
        />
    }

}