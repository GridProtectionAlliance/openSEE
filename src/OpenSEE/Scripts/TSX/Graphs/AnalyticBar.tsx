//******************************************************************************************************
//  AnalyticBar.tsx - Gbtc
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
//  02/18/2020 - C. Lackner
//       Generated original version of source code
//
//******************************************************************************************************

/*
import * as React  from 'react';
import * as moment from 'moment';

import OpenSEEService from '../../TS/Services/OpenSEE';
import D3BarChartBase, { D3BarChartBaseProps } from './D3BarChartBase';

import { iD3DataSet } from './D3LineChartBase';
interface AnalyticBarprops extends D3BarChartBaseProps {
    analytic: string,
    analyticParameter: any,
    
}

export default class AnalyticBar extends React.Component<any, any>{
    openSEEService: OpenSEEService;
    props: AnalyticBarprops;
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


    getData(props: D3BarChartBaseProps, baseCtrl: D3BarChartBase, ctrl: AnalyticBar): void {

        var eventDataHandle = this.openSEEServiceFunction(props.eventId).then(data => {

            let dataSet = data

            if (baseCtrl.state.dataSet.Data == undefined)
                dataSet.Data = baseCtrl.createLegendRows(dataSet.Data);
            else
                dataSet.Data = ctrl.updateData(baseCtrl, data, baseCtrl.state.dataSet);

            baseCtrl.createDataRows(dataSet.Data);

            baseCtrl.setState({ dataSet: dataSet });

        });
        this.setState({ eventDataHandle: eventDataHandle });
        
    }

    updateData(baseCtrl: D3BarChartBase, data: iD3DataSet, oldData: iD3DataSet) {
        let containsNew = false;

        if (data.Data.length != oldData.Data.length) 
            return baseCtrl.createLegendRows(data.Data);
        
        //Check if any of them changed except for the dataPoints

        for (let index = 0; index < data.Data.length; index++) {

            let i = oldData.Data.findIndex((val, ind) => {
                return (
                    val.ChannelID == data.Data[index].ChannelID &&
                    val.ChartLabel == data.Data[index].ChartLabel &&
                    val.Unit == data.Data[index].Unit &&
                    val.LegendClass == data.Data[index].LegendClass &&
                    val.LegendGroup == data.Data[index].LegendGroup &&
                    val.SecondaryLegendClass == data.Data[index].SecondaryLegendClass )
            });
            if (i > -1)
                oldData.Data[i].DataPoints = data.Data[index].DataPoints
            else {
                containsNew = true
                break
            }
        }

        if (containsNew)
            return baseCtrl.createLegendRows(data.Data);

        else
            return oldData.Data
    }

    openSEEServiceFunction(eventid: number) {

        if (this.props.analytic == "HarmonicSpectrum") {
            return this.openSEEService.getHarmonicSpectrumData(eventid, this.props.analyticParameter.harmonic, this.props.startTime.toString(), this.props.fftWindow.toString())
        }
        

        return this.openSEEService.getFFTData(eventid, this.props.fftWindow, this.props.startTime.toString())
    }
    render() {
        return <D3BarChartBase
            legendKey={this.props.analytic}
            openSEEServiceFunction={(eventid: number) => this.openSEEServiceFunction(eventid)}
            getData={(props, ctrl) => this.getData(props, ctrl, this)}
            fftWindow={this.props.fftWindow}
            eventId={this.props.eventId}
            height={this.props.height}
            pixels={this.props.pixels}
            startTime={this.props.startTime}
            stateSetter={this.props.stateSetter}
            options={this.props.options}
            colorSettings={this.props.colorSettings}
        />
    }

}*/