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
import { useAppDispatch, useAppSelector } from "../hooks";
import { SelectNavigation, SetNavigation } from "../Store/settingSlice";
import { EventContext } from '../Context/EventContext';

interface IProps {
    navigateToEvent: (nextEventId: number) => void
}

const Navigation = (props: IProps) => {
    const dispatch = useAppDispatch();
    const navigation = useAppSelector(SelectNavigation);
    const evt = React.useContext(EventContext);
    const [hover, setHover] = React.useState<string>('None');

    const go = (eventId?: number) => {
        if (eventId != null)
            props.navigateToEvent(eventId);
    };

    return (
        <>
            {evt.Context.LookupInfo != null ?
                <li className="nav-item" style={{ width: '210px', marginTop: "10px", minWidth: '155px' }}>
                    <div className="input-group mb-3">
                        <div
                            className="input-group-prepend"
                            onMouseEnter={() => setHover('NavLeft')}
                            onMouseLeave={() => setHover('None')}
                            data-tooltip={'back-btn'}
                        >

                            <ToolTip Show={hover == 'NavLeft'} Position={'bottom'} Target={'back-btn'}>
                                <p>Navigate to Previous Event in the {navigation}</p>
                                {navigation === "system" && (<p style={{ textAlign: "center" }}>({(evt.Context.LookupInfo?.System?.Item1 != null ? evt.Context.LookupInfo.System.Item1.StartTime : '')})</p>)}
                                {navigation === "station" && (<p style={{ textAlign: "center" }}>({(evt.Context.LookupInfo?.Station?.Item1 != null ? evt.Context.LookupInfo.Station.Item1.StartTime : '')})</p>)}
                                {navigation === "meter" && (<p style={{ textAlign: "center" }}>({(evt.Context.LookupInfo?.Meter?.Item1 != null ? evt.Context.LookupInfo.Meter.Item1.StartTime : '')})</p>)}
                                {navigation === "asset" && (<p style={{ textAlign: "center" }}>({(evt.Context.LookupInfo?.Asset?.Item1 != null ? evt.Context.LookupInfo.Asset.Item1.StartTime : '')})</p>)}
                            </ToolTip>

                            {(navigation == "system" ?
                                <button
                                    type="button"
                                    onClick={() => go(evt.Context.LookupInfo?.System?.Item1?.ID)}
                                    disabled={evt.Context.LookupInfo?.System?.Item1 == null}
                                    id="system-back"
                                    key="system-back"
                                    className={'btn btn-primary' + (evt.Context.LookupInfo?.System?.Item1 == null ? ' disabled' : '')}
                                    style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}
                                >
                                    &lt;
                                </button> : null)}

                            {(navigation == "station" ?
                                <button
                                    type="button"
                                    onClick={() => go(evt.Context.LookupInfo?.Station?.Item1?.ID)}
                                    disabled={evt.Context.LookupInfo?.Station?.Item1 == null}
                                    id="station-back"
                                    key="station-back"
                                    className={'btn btn-primary' + (evt.Context.LookupInfo?.Station?.Item1 == null ? ' disabled' : '')}
                                    style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}
                                >
                                    &lt;
                                </button>
                                : null)}

                            {(navigation == "meter" ?
                                <button
                                    type="button"
                                    onClick={() => go(evt.Context.LookupInfo?.Meter?.Item1?.ID)}
                                    disabled={evt.Context.LookupInfo?.Meter?.Item1 == null}
                                    id="meter-back"
                                    key="meter-back"
                                    className={'btn btn-primary' + (evt.Context.LookupInfo?.Meter?.Item1 == null ? ' disabled' : '')}
                                    style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}
                                >
                                    &lt;
                                </button> : null)}

                            {(navigation == "asset" ?
                                <button
                                    type="button"
                                    onClick={() => go(evt.Context.LookupInfo?.Asset?.Item1?.ID)}
                                    disabled={evt.Context.LookupInfo?.Asset?.Item1 == null}
                                    id="line-back"
                                    key="line-back"
                                    className={'btn btn-primary' + (evt.Context.LookupInfo?.Asset?.Item1 == null ? ' disabled' : '')}
                                    style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}
                                >
                                    &lt;
                                </button> : null)}

                        </div>
                        <select id="next-back-selection" value={navigation} onChange={e => dispatch(SetNavigation(e.target.value as OpenSee.EventNavigation))}>
                            <option value="system">System</option>
                            <option value="station">Station</option>
                            <option value="meter">Meter</option>
                            <option value="asset">Asset</option>
                        </select>
                        <div
                            className="input-group-append"
                            onMouseEnter={() => setHover('NavRight')}
                            onMouseLeave={() => setHover('None')}
                            data-tooltip={'next-btn'}
                        >
                            <ToolTip Show={hover == 'NavRight'} Position={'bottom'} Target={'next-btn'}>
                                <p>Navigate to Next Event in the {navigation}</p>
                                {navigation === "system" && (<p style={{ textAlign: "center" }}>({evt.Context.LookupInfo?.System?.Item2 != null ? evt.Context.LookupInfo.System.Item2.StartTime : ''})</p>)}
                                {navigation === "station" && (<p style={{ textAlign: "center" }}>({(evt.Context.LookupInfo?.Station?.Item2 != null ? evt.Context.LookupInfo.Station.Item2.StartTime : '')})</p>)}
                                {navigation === "meter" && (<p style={{ textAlign: "center" }}>({(evt.Context.LookupInfo?.Meter?.Item2 != null ? evt.Context.LookupInfo.Meter.Item2.StartTime : '')})</p>)}
                                {navigation === "asset" && (<p style={{ textAlign: "center" }}>({(evt.Context.LookupInfo?.Asset?.Item2 != null ? evt.Context.LookupInfo.Asset.Item2.StartTime : '')})</p>)}
                            </ToolTip>
                            {(navigation == "system" ?
                                <button
                                    type="button"
                                    onClick={() => go(evt.Context.LookupInfo?.System?.Item2?.ID)}
                                    disabled={evt.Context.LookupInfo?.System?.Item2 == null}
                                    id="system-next"
                                    key="system-next"
                                    className={'btn btn-primary' + (evt.Context.LookupInfo?.System?.Item2 == null ? ' disabled' : '')}
                                    style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}
                                >
                                    &gt;
                                </button> : null)}
                            {(navigation == "station" ?
                                <button
                                    type="button"
                                    onClick={() => go(evt.Context.LookupInfo?.Station?.Item2?.ID)}
                                    disabled={evt.Context.LookupInfo?.Station?.Item2 == null}
                                    id="station-next"
                                    key="station-next"
                                    className={'btn btn-primary' + (evt.Context.LookupInfo?.Station?.Item2 == null ? ' disabled' : '')}
                                    style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}
                                >
                                    &gt;
                                </button> : null)}
                            {(navigation == "meter" ?
                                <button
                                    type="button"
                                    onClick={() => go(evt.Context.LookupInfo?.Meter?.Item2?.ID)}
                                    disabled={evt.Context.LookupInfo?.Meter?.Item2 == null}
                                    id="meter-next"
                                    key="meter-next"
                                    className={'btn btn-primary' + (evt.Context.LookupInfo?.Meter?.Item2 == null ? ' disabled' : '')}
                                    style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}
                                >
                                    &gt;
                                </button> : null)}
                            {(navigation == "asset" ?
                                <button
                                    type="button"
                                    onClick={() => go(evt.Context.LookupInfo?.Asset?.Item2?.ID)}
                                    disabled={evt.Context.LookupInfo?.Asset?.Item2 == null}
                                    id="line-next"
                                    key="line-next"
                                    className={'btn btn-primary' + (evt.Context.LookupInfo?.Asset?.Item2 == null ? ' disabled' : '')}
                                    style={{ padding: "0.07rem, 0.25rem, 0.25rem, 0.07rem", fontSize: "21px" }}
                                >
                                    &gt;
                                </button> : null)}
                        </div>
                    </div>
                </li> : null}
        </>
    )
}

export default Navigation;
