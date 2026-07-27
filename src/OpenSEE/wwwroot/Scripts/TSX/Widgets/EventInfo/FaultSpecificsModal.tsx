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
import { Application, Gemstone } from '@gpa-gemstone/application-typings';
import { ReadOnlyControllerFunctions_Gemstone } from '@gpa-gemstone/common-pages';
import { OpenSee } from '../../global';
import { Column, Table } from '@gpa-gemstone/react-table';

interface Iprops {
    Show: boolean,
    SetShow: (show: boolean) => void,
    EventID: number
}

const FaultSpecificsController = new ReadOnlyControllerFunctions_Gemstone<OpenSee.IFaultSpecifics>(`${homePath}api/openSEE/FaultSpecifics`);

const FaultSpecificsModal = (props: Iprops) => {
    const [faultSpecifics, setFaultSpecifics] = React.useState<OpenSee.IFaultSpecifics | null>(null);
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

    //It would be nice if we could get an endpoint on the ModelController that returned the label attributes for a models properties? 
    const faultTableData: Gemstone.TSX.Interfaces.ILabelValue<string>[] = React.useMemo(() => {
        if (faultSpecifics == null) return [];

        return Object.keys(faultSpecifics)
            .filter((key) => key !== 'ID')
            .map((key) => {
                const typedKey = key as keyof OpenSee.IFaultSpecifics;

                return {
                    Label: getLabel(typedKey),
                    Value: String(faultSpecifics[typedKey])
                };
            });
    }, [faultSpecifics])

    return (
        <Modal
            Title={'Fault Specifics'}
            CallBack={() => props.SetShow(false)}
            Show={props.Show}
            ShowConfirm={false}
            CancelText='Close'
            ShowX={true}
            Size='lg'
        >
            <LoadingIcon Show={status === 'loading' || status === 'uninitiated'} Size={150} />
            {status === 'error' ?
                <div className="row justify-content-center">
                    <div className="col-12">
                        <Alert Class='alert-danger' >
                            Error retrieving fault information.
                        </Alert>
                    </div>
                </div>
                : null}
            {status === 'idle' ?
                <div className="container-fluid d-flex h-100 flex-column">
                    <Table<Gemstone.TSX.Interfaces.ILabelValue<string>>
                        Data={faultTableData}
                        SortKey="Label"
                        Ascending={true}
                        OnSort={() => {/*do nothing*/ }}
                        TableClass="table"
                        TbodyStyle={{ overflowY: 'auto', maxHeight: 500 }}
                        KeySelector={(item) => item.Label}
                    >
                        <Column<Gemstone.TSX.Interfaces.ILabelValue<string>>
                            Key='Label'
                            Field="Label"
                            AllowSort={false}
                        >
                            {''}
                        </Column>
                        <Column<Gemstone.TSX.Interfaces.ILabelValue<string>>
                            Key='Value'
                            Field='Value'
                            AllowSort={false}
                        >
                            {''}
                        </Column>
                    </Table>
                </div>
                : null}
        </Modal>
    );
}

const getLabel = (key: keyof OpenSee.IFaultSpecifics): string => {
    switch (key) {
        case 'ID':
            return 'ID';

        case 'FaultType':
            return 'Fault Type';

        case 'Inception':
            return 'Inception';

        case 'DurationMs':
            return 'Duration (ms)';

        case 'DurationCycles':
            return 'Duration (Cycles)';

        case 'DeltaTime':
            return 'Delta Time';

        case 'CurrentMagnitude':
            return 'Current Magnitude';

        case 'Algorithm':
            return 'Algorithm';

        case 'Distance':
            return 'Distance';

        case 'DoubleFaultDistance':
            return 'Double Fault Distance';

        case 'DoubleFaultAngle':
            return 'Double Fault Angle';

        case 'StartTime':
            return 'Start Time';

        case 'MeterName':
            return 'Meter Name';

        default:
            return key;
    }
};

export default FaultSpecificsModal
