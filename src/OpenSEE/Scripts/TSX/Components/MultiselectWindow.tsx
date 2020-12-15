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
import { selectEventListLoading, selectEventGroup, EnableOverlappingEvent } from '../Store/eventSlice';

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
                        {Object.keys(eventList).map((key, index) => <Group key={index} name={key} children={(eventList[key] as Array<iListObject>)} />)}
                    </ul>
                </form>
            }
        </div>
    );
}

export default OverlappingEventWindow;

const Group = (props: { name: string, children: Array<iListObject>}): any => {
    if (props.name == "undefined")
        return props.children.map(c => <ListItem key={"undefined" + c.label} name={c.label} value={c.value} data={c} />);
    return [<li key={props.name}>{props.name}<ul style={{ listStyleType: 'none' }}>{props.children.map(c => <ListItem key={props.name + c.label} value={c.value} name={c.label} data={c} />)}</ul></li>];
}

const ListItem = (props: { name: string, value: number, data: iListObject }) => {
    const dispatch = useDispatch();

    return <li key={props.data.group + props.name}><label><input type="checkbox" value={props.value} onClick={() => dispatch(EnableOverlappingEvent(props.value))} defaultChecked={props.data.selected} /> {props.name}</label></li>
}

/*
export default class MultiselectWindow extends React.Component<{ data: Array<iListObject>, style?: object, className?: string, stateSetter: Function, comparedEvents: Array<number>}>{
    constructor(props, context) {
        super(props, context);
    }

    handleClicks(e) {
        this.props.stateSetter({ comparedEvents: $(this.refs.list).find('input[type="checkbox"]:checked').toArray().filter((a: HTMLInputElement) => a.value != "on").map((a: HTMLInputElement) => parseInt(a.value)) });
    }

    render() {
        var groups = groupBy(this.props.data, 'group'); 

      

        return (
            <div style={style}> 
                <form style={formStyle}>
                    <ul ref="list" style={{listStyleType: 'none', padding: 0}}>
                        {Object.keys(groups).map((key, index) => <Group key={index} name={key} children={(groups[key] as Array<iListObject>)} callback={this.handleClicks.bind(this)}/>)}
                    </ul>
                </form>
            </div>
        );
    }
}

const Group = (props: {name: string, children: Array<iListObject>, callback: Function}, context): any => {
    if (props.name == "undefined")
        return props.children.map(c => <ListItem key={"undefined" + c.label} name={c.label} value={c.value} callback={props.callback} data={c} />);
    return [<li key={props.name}>{props.name}<ul style={{ listStyleType: 'none' }}>{props.children.map(c => <ListItem key={props.name + c.label} value={c.value} name={c.label} callback={props.callback} data={c} />)}</ul></li>];
}

const ListItem = (props: { name: string, value: number, callback: Function, data: iListObject}, context)=> {
    return <li key={props.data.group + props.name}><label><input type="checkbox" value={props.value} onClick={() => props.callback()} defaultChecked={props.data.selected}/> {props.name}</label></li>
}
*/