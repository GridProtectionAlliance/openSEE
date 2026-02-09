//******************************************************************************************************
//  InfoSection.tsx - Gbtc
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
//  02/09/2026 - Gabriel Santos
//       Moved code to here from OpenSEENavbar.tsx
//
//******************************************************************************************************

import { ToolTip } from '@gpa-gemstone/react-forms';
import moment from "moment";
import React from "react";
import { OpenSee } from "../global";

interface InfoSectionProps {
    eventInfo: OpenSee.IEventInfo,
    hover: OpenSee.Hover,
    setHover: (hover: OpenSee.Hover) => void,
    width: number
}

const InfoSection = (props: InfoSectionProps) => {
    return (
        <>
            <div className="d-none d-xl-block col-xl-4">
                <ul className="navbar-nav navbar-expand">
                    <li className="nav-item" onMouseEnter={() => props.setHover('Meter')} onMouseLeave={() => props.setHover('None')} data-tooltip={'meter'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Meter:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}> {props.eventInfo?.MeterName?.split(" ")[0]}</div>
                        <ToolTip Show={props.hover == 'Meter'} Position={'bottom'} Target={'meter'} Zindex={9999}>
                            <p>{props.eventInfo?.MeterName}</p>
                        </ToolTip>
                    </li>
                    <li className="nav-item" onMouseEnter={() => props.setHover('Station')} onMouseLeave={() => props.setHover('None')} data-tooltip={'station'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Station:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{props.eventInfo?.StationName}</div>
                        <ToolTip Show={props.hover == 'Station'} Position={'bottom'} Target={'station'} Zindex={9999}>
                            <p>{props.eventInfo?.StationName}</p>
                        </ToolTip>
                    </li>
                    <li className="nav-item" onMouseEnter={() => props.setHover('Asset')} onMouseLeave={() => props.setHover('None')} data-tooltip={'asset'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '30px', paddingRight: '30px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Asset:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{props.eventInfo?.AssetName?.split(" ")[0]}</div>
                        <ToolTip Show={props.hover == 'Asset'} Position={'bottom'} Target={'asset'} Zindex={9999}>
                            <p>{props.eventInfo?.AssetName}</p>
                        </ToolTip>
                    </li>
                    <li className="nav-item" onMouseEnter={() => props.setHover('EType')} onMouseLeave={() => props.setHover('None')} data-tooltip={'etype'} data-toggle="tooltip" data-placement="bottom"
                        style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '15px', paddingRight: '15px' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>Type:</div>
                        <div style={{ textAlign: 'center', color: 'white' }}>{props.eventInfo?.EventName}</div>
                        <ToolTip Show={props.hover == 'EType'} Position={'bottom'} Target={'etype'} Zindex={9999}>
                            <p>{props.eventInfo?.EventName}</p>
                        </ToolTip>
                    </li>
                    {props.width > 1695 ?
                        <li className="nav-item" onMouseEnter={() => props.setHover('EInception')} onMouseLeave={() => props.setHover('None')} data-tooltip={'einception'} data-toggle="tooltip" data-placement="bottom"
                            style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', paddingLeft: '15px', paddingRight: '15px', minWidth: "60px", marginRight: "10px" }}>
                            <div style={{ textAlign: 'center', color: 'white' }}>Inception: </div>
                            <div style={{ textAlign: 'center', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {moment(props.eventInfo?.Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}
                            </div>
                            <ToolTip Show={props.hover == 'EInception'} Position={'bottom'} Target={'einception'} Zindex={9999}>
                                <p>{moment(props.eventInfo?.Inception).format('YYYY-MM-DD HH:mm:ss.SSS')}</p>
                            </ToolTip>
                        </li> : null}
                </ul>
            </div>
        </>
    )

}