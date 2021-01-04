//******************************************************************************************************
//  MultiselectWindow.tsx - Gbtc
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
//  03/13/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import { groupBy } from 'lodash';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { OpenSee } from '../global';
import { selectEventListLoading, selectEventGroup, EnableOverlappingEvent } from '../store/eventSlice';

interface Iprops { }

const OverlappingEventWindow = (props: Iprops) => {
    
    const eventList = useSelector(selectEventGroup);
    const loading = useSelector(selectEventListLoading);

    return (
        <div style={{ marginTop: '10px', width: '100%', height: '100%' }}>
            {loading ?
                <div className="d-flex align-items-center justify-content-center">
                    <i className="fa fa-spinner fa-lg"></i>
                </div> :
                <form style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #000000', padding: '10px', width: '90%', height: '100%', overflow: 'auto', marginLeft: '5%', marginRight: '5%' }}>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {Object.keys(eventList).map((key, index) => <Group key={index} name={key} children={(eventList[key] as Array<OpenSee.iListObject>)} />)}
                    </ul>
                </form>
            }
        </div>
    );
}

export default OverlappingEventWindow;

const Group = (props: { name: string, children: Array<OpenSee.iListObject>}): any => {
    if (props.name == "undefined")
        return props.children.map(c => <ListItem key={"undefined" + c.label} name={c.label} value={c.value} data={c} />);
    return [<li key={props.name}>{props.name}<ul style={{ listStyleType: 'none' }}>{props.children.map(c => <ListItem key={props.name + c.label} value={c.value} name={c.label} data={c} />)}</ul></li>];
}

const ListItem = (props: { name: string, value: number, data: OpenSee.iListObject }) => {
    const dispatch = useDispatch();

    return <li key={props.data.group + props.name}><label><input type="checkbox" value={props.value} onClick={() => dispatch(EnableOverlappingEvent(props.value))} defaultChecked={props.data.selected} /> {props.name}</label></li>
}

