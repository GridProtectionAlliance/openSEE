//******************************************************************************************************
//  TimeCorrelatedSags.tsx - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  02/05/2026 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { Modal, LoadingIcon, Alert } from '@gpa-gemstone/react-interactive';
import { DatePicker } from '@gpa-gemstone/react-forms';
import { Application } from '@gpa-gemstone/application-typings';
import { ReadOnlyControllerFunctions_Gemstone } from '@gpa-gemstone/common-pages';
import { OpenSee } from '../global';
import { Input } from '@gpa-gemstone/react-forms';

interface Iprops {
    Show: boolean,
    SetShow: (show: boolean) => void,
    EventID: number
}
const FaultSpecificsController = new ReadOnlyControllerFunctions_Gemstone<OpenSee.IFaultSpecifics>(`${homePath}api/openSEE/FaultSpecifics`);

const FaultSpecificsModal = (props: Iprops) => {
    const [faultSpecifics, setFaultSpecifics] = React.useState<OpenSee.IFaultSpecifics>(null);
    const [status, setStatus] = React.useState<Application.Types.Status>('uninitiated');

    React.useEffect(() => {
        setStatus('loading');

        const handle = FaultSpecificsController.GetOne(props.EventID);
        handle.then(obj => {
            setFaultSpecifics(obj);
            setStatus('idle');
        }, () => setStatus('error'));

        return () => { if (handle?.abort == null) handle.abort(); }
    }, [props.EventID]);

    return (
        <Modal Title={'Fault Specifics'} CallBack={() => props.SetShow(false)} Show={props.Show}>
            <LoadingIcon Show={status === 'loading' || status === 'uninitiated'} Size={150} />
            {status === 'error' ?
                <div className="row justify-content-center">
                    <Alert
                        ShowX={false}
                        Class='alert-danger'
                    >
                        Error retrieving fault information.
                    </Alert>
                </div> :
                <></>
            }
            {status === 'idle' ?
                <div className="col">
                    <div className="row">
                        <div className="col">
                            <DatePicker<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'StartTime'}
                                Label={'Start Time'}
                                Setter={setFaultSpecifics}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                        <div className="col">
                            <DatePicker<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'Inception'}
                                Label={'Inception Time'}
                                Setter={setFaultSpecifics}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'DeltaTime'}
                                Label={'Delta Time (s)'}
                                Setter={setFaultSpecifics}
                                Type={'number'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'FaultType'}
                                Label={'Fault Type'}
                                Setter={setFaultSpecifics}
                                Type={'text'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'DurationMs'}
                                Label={'Fault Duration (ms)'}
                                Setter={setFaultSpecifics}
                                Type={'number'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'DurationCycles'}
                                Label={'Fault Duration (cycles)'}
                                Setter={setFaultSpecifics}
                                Type={'number'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'CurrentMagnitude'}
                                Label={'Fault Current (Amps RMS)'}
                                Setter={setFaultSpecifics}
                                Type={'number'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'Algorithm'}
                                Label={'Distance Method'}
                                Setter={setFaultSpecifics}
                                Type={'text'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'Distance'}
                                Label={'Single-Ended Distance (mi)'}
                                Setter={setFaultSpecifics}
                                Type={'number'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'DoubleFaultDistance'}
                                Label={'Double-Ended Distance (mi)'}
                                Setter={setFaultSpecifics}
                                Type={'number'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'DoubleFaultAngle'}
                                Label={'Double-Ended Angle (deg)'}
                                Setter={setFaultSpecifics}
                                Type={'number'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                        <div className="col">
                            <Input<OpenSee.IFaultSpecifics>
                                Record={faultSpecifics}
                                Field={'ID'}
                                Label={'OpenXDA EventID'}
                                Setter={setFaultSpecifics}
                                Type={'number'}
                                Valid={() => true}
                                Disabled={true}
                            />
                        </div>
                    </div>
                </div>
                : <></>
            }
        </Modal>
    );
}

export default FaultSpecificsModal
