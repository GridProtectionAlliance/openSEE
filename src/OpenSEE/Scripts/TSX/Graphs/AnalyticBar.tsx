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

import * as React  from 'react';
import * as moment from 'moment';

import OpenSEEService from '../../TS/Services/OpenSEE';
import D3BarChartBase, { D3BarChartBaseProps } from './D3BarChartBase';
import { AnalyticParamters } from '../Components/RadioselectWindow';
interface AnalyticBarprops extends D3BarChartBaseProps {
    analytic: string,
    analyticParameter: AnalyticParamters,
    
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

            var dataSet = baseCtrl.state.dataSet;
            if (dataSet.Data != undefined)
                dataSet.Data = dataSet.Data.concat(data.Data);
            else
                dataSet = data;

            
            dataSet.Data = baseCtrl.createLegendRows(data.Data);
            baseCtrl.createDataRows(data.Data);

            baseCtrl.setState({ dataSet: data });

        });
        this.setState({ eventDataHandle: eventDataHandle });
        
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
        />
    }

}