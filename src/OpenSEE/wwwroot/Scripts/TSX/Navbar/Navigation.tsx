//******************************************************************************************************
//  Navigation.tsx - Gbtc
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
import React from "react";
import { OpenSee } from "../global";
import { useAppDispatch } from "../hooks";
import { SetNavigation } from "../store/settingSlice";

interface NavigationProps {
    lookupInfo: OpenSee.INextBackLookup,
    navigation: OpenSee.EventNavigation,
    hover: OpenSee.Hover,
    setHover: (hover: OpenSee.Hover) => void,
}

const Navigation = (props: NavigationProps) => {
    const dispatch = useAppDispatch();

    return (
        <>
            {props.lookupInfo ?
                <li className="nav-item" style={{ width: '210px', marginTop: "10px", minWidth: '155px' }}>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <ToolTip Show={props.hover == 'NavLeft'} Position={'bottom'} Target={'back-btn'}>
                                <p>Navigate to Previous Event in the {props.navigation}</p>
                                {props.navigation === "system" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.System.m_Item1 != null ? props.lookupInfo.System.m_Item1.StartTime : '')})</p>)}
                                {props.navigation === "station" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Station.m_Item1 != null ? props.lookupInfo.Station.m_Item1.StartTime : '')})</p>)}
                                {props.navigation === "meter" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Meter.m_Item1 != null ? props.lookupInfo.Meter.m_Item1.StartTime : '')})</p>)}
                                {props.navigation === "asset" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.System.m_Item1 != null ? props.lookupInfo.System.m_Item1.StartTime : '')})</p>)}
                            </ToolTip>
                            {(props.navigation == "system" ? <a href={(props.lookupInfo.System.m_Item1 != null ? "?eventID=" + props.lookupInfo.System.m_Item1.ID : '#')} id="system-back" key="system-back" className={'btn btn-primary' + (props.lookupInfo.System.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavLeft')} onMouseLeave={() => props.setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                            {(props.navigation == "station" ? <a href={(props.lookupInfo.Station.m_Item1 != null ? "?eventID=" + props.lookupInfo.Station.m_Item1.ID : '#')} id="station-back" key="station-back" className={'btn btn-primary' + (props.lookupInfo.Station.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavLeft')} onMouseLeave={() => props.setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                            {(props.navigation == "meter" ? <a href={(props.lookupInfo.Meter.m_Item1 != null ? "?eventID=" + props.lookupInfo.Meter.m_Item1.ID : '#')} id="meter-back" key="meter-back" className={'btn btn-primary' + (props.lookupInfo.Meter.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavLeft')} onMouseLeave={() => props.setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                            {(props.navigation == "asset" ? <a href={(props.lookupInfo.Asset.m_Item1 != null ? "?eventID=" + props.lookupInfo.Asset.m_Item1.ID : '#')} id="line-back" key="line-back" className={'btn btn-primary' + (props.lookupInfo.Asset.m_Item1 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavLeft')} onMouseLeave={() => props.setHover('None')} data-tooltip={'back-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&lt;</a> : null)}
                        </div>
                        <select id="next-back-selection" value={props.navigation} onChange={e => dispatch(SetNavigation(e.target.value as OpenSee.EventNavigation))}>
                            <option value="system">System</option>
                            <option value="station">Station</option>
                            <option value="meter">Meter</option>
                            <option value="asset">Asset</option>
                        </select>
                        <div className="input-group-append">
                            <ToolTip Show={props.hover == 'NavRight'} Position={'bottom'} Target={'next-btn'}>
                                <p>Navigate to Next Event in the {props.navigation}</p>
                                {props.navigation === "system" && (<p style={{ textAlign: "center" }}>({props.lookupInfo.System.m_Item2 != null ? props.lookupInfo.System.m_Item2.StartTime : ''})</p>)}
                                {props.navigation === "station" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Station.m_Item2 != null ? props.lookupInfo.Station.m_Item2.StartTime : '')})</p>)}
                                {props.navigation === "meter" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Meter.m_Item2 != null ? props.lookupInfo.Meter.m_Item2.StartTime : '')})</p>)}
                                {props.navigation === "asset" && (<p style={{ textAlign: "center" }}>({(props.lookupInfo.Asset.m_Item2 != null ? props.lookupInfo.Asset.m_Item2.StartTime : '')})</p>)}
                            </ToolTip>
                            {(props.navigation == "system" ? <a href={(props.lookupInfo.System.m_Item2 != null ? "?eventID=" + props.lookupInfo.System.m_Item2.ID : '#')} id="system-next" key="system-next" className={'btn btn-primary' + (props.lookupInfo.System.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavRight')} onMouseLeave={() => props.setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                            {(props.navigation == "station" ? <a href={(props.lookupInfo.Station.m_Item2 != null ? "?eventID=" + props.lookupInfo.Station.m_Item2.ID : '#')} id="station-next" key="station-next" className={'btn btn-primary' + (props.lookupInfo.Station.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavRight')} onMouseLeave={() => props.setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                            {(props.navigation == "meter" ? <a href={(props.lookupInfo.Meter.m_Item2 != null ? "?eventID=" + props.lookupInfo.Meter.m_Item2.ID : '#')} id="meter-next" key="meter-next" className={'btn btn-primary' + (props.lookupInfo.Meter.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavRight')} onMouseLeave={() => props.setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                            {(props.navigation == "asset" ? <a href={(props.lookupInfo.Asset.m_Item2 != null ? "?eventID=" + props.lookupInfo.Asset.m_Item2.ID : '#')} id="line-next" key="line-next" className={'btn btn-primary' + (props.lookupInfo.Asset.m_Item2 == null ? ' disabled' : '')} onMouseEnter={() => props.setHover('NavRight')} onMouseLeave={() => props.setHover('None')} data-tooltip={'next-btn'} data-toggle="tooltip" data-placement="bottom" style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}>&gt;</a> : null)}
                        </div>
                    </div>
                </li> : null}
        </>
    )
}

export default Navigation;
