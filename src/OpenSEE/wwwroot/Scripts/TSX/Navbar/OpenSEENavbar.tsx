//******************************************************************************************************
//  OpenSEENavbar.tsx - Gbtc
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
//  03/14/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import { clone } from 'lodash';
import * as React from 'react';
import { OpenSee } from '../global';
import { useAppDispatch, useAppSelector } from '../hooks';
import { SelectMouseMode, SetMouseMode } from '../store/settingSlice';
import { IPlotLifecycleActions } from '../hooks/usePlotLifeCycle';
import InfoSection from './InfoSection';
import PlotUtilitiesSection from './PlotUtilitiesSection';
import WidgetSection from './WidgetSection';

interface IProps {
    ToggleDrawer: (drawer: OpenSee.OverlayDrawers, open: boolean) => void,
    OpenDrawers: OpenSee.Drawers,
    Width: number,
    lifecycle: IPlotLifecycleActions
}

const OpenSeeNavBar = (props: IProps) => {
    const dispatch = useAppDispatch();
    const mouseMode = useAppSelector(SelectMouseMode);
    const [showAbout, setShowAbout] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (props.OpenDrawers.AccumulatedPoints) {
            const oldMode = clone(mouseMode);
            dispatch(SetMouseMode('select'));
            return () => { dispatch(SetMouseMode(oldMode)); };
        }
        return () => { };
    }, [props.OpenDrawers.AccumulatedPoints, mouseMode, dispatch]);

    return (
        <>
            <InfoSection width={props.Width} />
            <div className="col-sm-10 col-md-11 col-xl-7">
                {(props.Width < 1568 && props.Width > 1200) || props.Width < 1050 ?
                    <>
                        <ul className="navbar-nav navbar-expand justify-content-end">
                            <PlotUtilitiesSection
                                showAbout={showAbout}
                                setShowAbout={(item) => setShowAbout(item)}
                                OpenDrawers={props.OpenDrawers}
                                ToggleDrawer={props.ToggleDrawer}
                            />
                        </ul>
                        <ul className="navbar-nav navbar-expand justify-content-end" style={{ marginRight: '105px', marginBottom: '10px' }}>
                            <WidgetSection
                                OpenDrawers={props.OpenDrawers}
                                ToggleDrawer={props.ToggleDrawer}
                                lifecycle={props.lifecycle}
                            />
                        </ul>
                    </> :
                    <>
                        <ul className="navbar-nav navbar-expand">
                            <WidgetSection
                                OpenDrawers={props.OpenDrawers}
                                ToggleDrawer={props.ToggleDrawer}
                                lifecycle={props.lifecycle}
                            />
                            <PlotUtilitiesSection
                                showAbout={showAbout}
                                setShowAbout={(item) => setShowAbout(item)}
                                OpenDrawers={props.OpenDrawers}
                                ToggleDrawer={props.ToggleDrawer}
                            />
                        </ul>
                    </>
                }
            </div>
        </>
    );
};

export default OpenSeeNavBar;