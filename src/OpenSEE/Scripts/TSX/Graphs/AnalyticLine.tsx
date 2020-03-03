﻿//******************************************************************************************************
//  AnalyticLine.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  01/22/2020 - C. Lackner
//       Generated original version of source code
//
//******************************************************************************************************

import * as React  from 'react';
import * as moment from 'moment';

import OpenSEEService from '../../TS/Services/OpenSEE';
import D3LineChartBase, { D3LineChartBaseProps } from './D3LineChartBase';
import { AnalyticParamters } from '../Components/RadioselectWindow';
interface AnalyticLineprops extends D3LineChartBaseProps {
    analytic: string,
    analyticParameter: AnalyticParamters
}

export default class AnalyticLine extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    props: AnalyticLineprops;
    constructor(props) {
        super(props);
        this.openSEEService = new OpenSEEService();
    }

    componentWillUnmount() {
        if (this.state.eventDataHandle !== undefined && this.state.eventDataHandle.abort !== undefined) {
            this.state.eventDataHandle.abort();
            this.setState({ eventDataHandle: undefined });
        }
        
    }


    getData(props: D3LineChartBaseProps, baseCtrl: D3LineChartBase, ctrl: AnalyticLine): void {

        var eventDataHandle = this.openSEEServiceFunction(props.eventId).then(data => {

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
        
    }
           
    openSEEServiceFunction(eventid: number) {

        if (this.props.analytic == "FirstDerivative") {
            return this.openSEEService.getFirstDerivativeData(eventid)
        }
        else if (this.props.analytic == "ClippedWaveforms") {
            return this.openSEEService.getClippedWaveformData(eventid)
        }
        else if (this.props.analytic == "Frequency") {
            return this.openSEEService.getFrequencyAnalyticData(eventid)
        }
        else if (this.props.analytic == "Impedance") {
            return this.openSEEService.getImpedanceData(eventid)
        }
        else if (this.props.analytic == "Power") {
            return this.openSEEService.getPowerData(eventid)
        }
        else if (this.props.analytic == "RemoveCurrent") {
            return this.openSEEService.getRemoveCurrentData(eventid)
        }
        else if (this.props.analytic == "MissingVoltage") {
            return this.openSEEService.getMissingVoltageData(eventid)
        }
        else if (this.props.analytic == "LowPassFilter") {
            return this.openSEEService.getLowPassFilterData(eventid, this.props.analyticParameter.order)
        }
        else if (this.props.analytic == "HighPassFilter") {
            return this.openSEEService.getHighPassFilterData(eventid, this.props.analyticParameter.order)
        }
        else if (this.props.analytic == "SymmetricalComponents") {
            return this.openSEEService.getSymmetricalComponentsData(eventid)
        }
        else if (this.props.analytic == "Unbalance") {
            return this.openSEEService.getUnbalanceData(eventid)
        }
        else if (this.props.analytic == "Rectifier") {
            return this.openSEEService.getRectifierData(eventid, this.props.analyticParameter.Trc)
        }
        else if (this.props.analytic == "RapidVoltageChange") {
            return this.openSEEService.getRapidVoltageChangeData(eventid )
        }
        else if (this.props.analytic == "THD") {
            return this.openSEEService.getTHDData(eventid)
        }
        else if (this.props.analytic == "SpecifiedHarmonic") {
            return this.openSEEService.getSpecifiedHarmonicData(eventid, this.props.analyticParameter.harmonic)
        }
        else if (this.props.analytic == "OverlappingWaveform") {
            return this.openSEEService.getOverlappingWaveformData(eventid)
        }
        
        return this.openSEEService.getFaultDistanceData(eventid)
    }
    render() {
        return <D3LineChartBase
            legendKey={this.props.analytic}
            openSEEServiceFunction={(eventid: number) => this.openSEEServiceFunction(eventid)}
            getData={(props, ctrl) => this.getData(props, ctrl, this)}
            eventId={this.props.eventId}
            height={this.props.height}
            stateSetter={this.props.stateSetter}
            options={ this.props.options }
            startTime={this.props.startTime}
            endTime={this.props.endTime}
            startTimeVis={this.props.startTimeVis}
            endTimeVis={this.props.endTimeVis}
            hover={this.props.hover}
        />
    }

}