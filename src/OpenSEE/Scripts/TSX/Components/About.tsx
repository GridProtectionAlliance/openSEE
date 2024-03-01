//******************************************************************************************************
//  About.tsx - Gbtc
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
//  03/29/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { Modal } from '@gpa-gemstone/react-interactive'

interface Iprops {
    closeCallback: () => void,
    isOpen: boolean,
}

const About = (props: Iprops) => {
    return (
        <>
            <Modal Show={props.isOpen} Title={'About openSEE -- System Event Explorer'} Size={'xlg'} CallBack={() => {
                props.closeCallback()
            }}
                ShowX={true}
                ShowCancel={true}
                CancelBtnClass={"btn btn-danger"}
                ShowConfirm={false}
            >
                <p>Version 3.0</p>

                <p>openSEE is a browser-based waveform display and analytics tool that is used to view waveforms recorded by DFRs, Power Quality meters, relays and other substation devices that are stored in the openXDA database.
                    The link in the URL window of openSEE can be embedded in emails so that recipients can quickly access the waveforms being studied.</p>

                <p><b>General Navigation Features</b></p>

                <p>The navigational context of openSEE is relative to the "waveform-of-focus" -- the waveform displayed in the top-most collection of charts that is displayed when openSEE is first opened --
                    typically after clicking a link to drill down into a specific waveform in the Open PQ Dashboard.
                    Tools in openSEE allow the user to dig deeper and understand more about this waveform-of-focus.
                    Tools in openSEE also enable users to easily change the waveform-of-focus from the initially loaded -- moving forward or back sequentially in time.
                </p>

                <ul>
                    <li><u>Region Select Zooming</u> - The waveform initially loads with the the time-scale set to the full length of the waveform capture. With the mouse, the user can select a region of the waveform to zoom in and see more detail.</li>
                    <li><u>Forward and Back Navigation</u> - Using the collection of controls in the upper-right of the openSEE display, the user can select the basis for changing to a new waveform-of-focus.  A selection of "system" means that user can step forward or back
                        to next event in the openXDA base globally (for all DFRs, PQ Meters, etc.),
                        i.e., what happened immediately previously or next on the system relative to the current waveform-of-focus.  A selection of "asset" (or "line") limits this navigation to just events on this asset.
                        A selection of "meter" limits this navigation to just events recorded by this substation device.</li>
                    <li><u>Chart Trace Section</u> - To the right of each chart, the user has the ability to turn on and off individual traces.  Tabs are provided to organize these selections by data type.</li>
                </ul>

                <p>
                    The open-source code for openSEE can be found on GitHub. See: <a href="https://github.com/GridProtectionAlliance/openSEE">https://github.com/GridProtectionAlliance/openSEE</a>
                </p>

            </Modal>

        </>

    );

}

export default About; 