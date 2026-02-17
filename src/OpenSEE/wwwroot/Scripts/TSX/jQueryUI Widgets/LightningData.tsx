//******************************************************************************************************
//  LightningData.tsx - Gbtc
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
//  03/13/2019 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { ConfigurableTable, ConfigurableColumn, Column } from '@gpa-gemstone/react-table'
import EventContext from '../Context/EventContext';


interface Column {
    key: string;
    label: string;
    field: keyof any;
    content: (item: any, key: string, field: keyof any, style: React.CSSProperties, index: number) => React.ReactNode;
}

interface LightningData { // these probably arent all strings but not sure since no data is coming back
    Service: string;
    UTCTime: string;
    DisplayTime: string;
    Amplitude: string;
    Latitude: string;
    Longitude: string;
    PeakCurrent: string;
    FlashMultiplicity: string;
    ParticipatingSensors: string;
    DegreesOfFreedom: string;
    EllipseAngle: string;
    SemiMajorAxisLength: string;
    SemiMinorAxisLength: string;
    ChiSquared: string;
    Risetime: string;
    PeakToZeroTime: string;
    MaximumRateOfRise: string;
    CloudIndicator: string;
    AngleIndicator: string;
    SignalIndicator: string;
    TimingIndicator: string;
}


const LightningDataWidget = () => {
    const evt = React.useContext(EventContext);

    const [lightningData, setLightningData] = React.useState<LightningData[]>(null);

    React.useEffect(() => {
        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetLightningData?eventID=${evt.Context.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(lightningData => {
            setLightningData(lightningData)
        });

        return () => { if (handle !== undefined && handle.abort !== undefined) handle.abort(); }
    }, [evt.Context.EventID]);

    return (
        <>
            {lightningData ?
                <div style={{ width: '100%', height: '100%', maxHeight: '100%', overflowY: 'hidden' }}>
                    <ConfigurableTable<LightningData>
                        LocalStorageKey={"OpenSee.Lightning.TableCols"}
                        TableClass={"table table-hover"}
                        Data={lightningData}
                        KeySelector={(item) => item.Service.toString()}
                        OnSort={() => true}
                        SortKey={"Service"}
                        TbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: 'calc(100%)' }}
                        RowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
                        TableStyle={{ height: '100%', width: '100%', margin: '3%' }}
                        Ascending={false}
                    >
                        <ConfigurableColumn Key={'Service'} Label={'Service'} Default={true}>
                            <Column<LightningData>
                                Key={'Service'}
                                AllowSort={true}
                                Field={'Service'}>
                                Service
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'UTCTime'} Label={'UTC Time'} Default={false}>
                            <Column<LightningData>
                                Key={'UTCTime'}
                                AllowSort={true}
                                Field={'UTCTime'}>
                                UTC Time
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'DisplayTime'} Label={'Display Time'} Default={true}>
                            <Column<LightningData>
                                Key={'DisplayTime'}
                                AllowSort={true}
                                Field={'DisplayTime'}>
                                Display Time
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'Amplitude'} Label={'Amplitude'} Default={true}>
                            <Column<LightningData>
                                Key={'Amplitude'}
                                AllowSort={true}
                                Field={'Amplitude'}>
                                Amplitude
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'Latitude'} Label={'Latitude'} Default={true}>
                            <Column<LightningData>
                                Key={'Latitude'}
                                AllowSort={true}
                                Field={'Latitude'}>
                                Latitude
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'Longitude'} Label={'Longitude'} Default={true}>
                            <Column<LightningData>
                                Key={'Longitude'}
                                AllowSort={true}
                                Field={'Longitude'}>
                                Longitude
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'PeakCurrent'} Label={'Peak Current'} Default={false}>
                            <Column<LightningData>
                                Key={'PeakCurrent'}
                                AllowSort={true}
                                Field={'PeakCurrent'}>
                                Peak Current
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'FlashMultiplicity'} Label={'Flash Multiplicity'} Default={false}>
                            <Column<LightningData>
                                Key={'FlashMultiplicity'}
                                AllowSort={true}
                                Field={'FlashMultiplicity'}>
                                Flash Multiplicity
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'ParticipatingSensors'} Label={'Participating Sensors'} Default={false}>
                            <Column<LightningData>
                                Key={'ParticipatingSensors'}
                                AllowSort={true}
                                Field={'ParticipatingSensors'}>
                                Participating Sensors
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'Degrees Of Freedom'} Label={'Degrees Of Freedom'} Default={false}>
                            <Column<LightningData>
                                Key={'DegreesOfFreedom'}
                                AllowSort={true}
                                Field={'DegreesOfFreedom'}>
                                Degrees Of Freedom
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'EllipseAngle'} Label={'Ellipse Angle'} Default={false}>
                            <Column<LightningData>
                                Key={'EllipseAngle'}
                                AllowSort={true}
                                Field={'EllipseAngle'}>
                                Ellipse Angle
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'Semi Major Axis Length'} Label={'Semi Major Axis Length'} Default={false}>
                            <Column<LightningData>
                                Key={'SemiMajorAxisLength'}
                                AllowSort={true}
                                Field={'SemiMajorAxisLength'}>
                                Semi Major Axis Length
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'SemiMinorAxisLength'} Label={'Semi Minor Axis Length'} Default={false}>
                            <Column<LightningData>
                                Key={'SemiMinorAxisLength'}
                                AllowSort={true}
                                Field={'SemiMinorAxisLength'}>
                                Semi Minor Axis Length
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'ChiSquared'} Label={'Chi Squared'} Default={false}>
                            <Column<LightningData>
                                Key={'ChiSquared'}
                                AllowSort={true}
                                Field={'ChiSquared'}>
                                Chi Squared
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'Risetime'} Label={'Rise time'} Default={false}>
                            <Column<LightningData>
                                Key={'Risetime'}
                                AllowSort={true}
                                Field={'Risetime'}>
                                Rise time
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'FlashMultiplicity'} Label={'Flash Multiplicity'} Default={false}>
                            <Column<LightningData>
                                Key={'FlashMultiplicity'}
                                AllowSort={true}
                                Field={'FlashMultiplicity'}>
                                Flash Multiplicity
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'PeakToZeroTime'} Label={'Peak To Zero Time'} Default={false}>
                            <Column<LightningData>
                                Key={'PeakToZeroTime'}
                                AllowSort={true}
                                Field={'PeakToZeroTime'}>
                                Peak To Zero Time
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'MaximumRateOfRise'} Label={'Maximum Rate Of Rise'} Default={false}>
                            <Column<LightningData>
                                Key={'MaximumRateOfRise'}
                                AllowSort={true}
                                Field={'MaximumRateOfRise'}>
                                Maximum Rate Of Rise
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'CloudIndicator'} Label={'Cloud Indicator'} Default={false}>
                            <Column<LightningData>
                                Key={'CloudIndicator'}
                                AllowSort={true}
                                Field={'CloudIndicator'}>
                                Cloud Indicator
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'AngleIndicator'} Label={'Angle Indicator'} Default={false}>
                            <Column<LightningData>
                                Key={'AngleIndicator'}
                                AllowSort={true}
                                Field={'AngleIndicator'}>
                                Angle Indicator
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'SignalIndicator'} Label={'Signal Indicator'} Default={false}>
                            <Column<LightningData>
                                Key={'SignalIndicator'}
                                AllowSort={true}
                                Field={'SignalIndicator'}>
                                Signal Indicator
                            </Column>
                        </ConfigurableColumn>

                        <ConfigurableColumn Key={'TimingIndicator'} Label={'Timing Indicator'} Default={false}>
                            <Column<LightningData>
                                Key={'TimingIndicator'}
                                AllowSort={true}
                                Field={'TimingIndicator'}>
                                Timing Indicator
                            </Column>
                        </ConfigurableColumn>
                    </ConfigurableTable>
                </div>

                : null}
        </>
    );
}

export default LightningDataWidget;

