//******************************************************************************************************
//  Common.tsx - Gbtc
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
//  10/13/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { style } from "typestyle"
import { container } from 'webpack';

// styles
export const outerDiv: React.CSSProperties = {
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflowY: 'hidden',
    overflowX: 'hidden',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    display: 'none',
    backgroundColor: 'white',
};

export const handle = style({
    width: '100%',
    height: '20px',
    backgroundColor: '#808080',
    cursor: 'move',
    padding: '0em'
});

export const closeButton = style({
    background: 'firebrick',
    color: 'white',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20px',
    height: '20px',
    textAlign: 'center',
    verticalAlign: 'middle',
    padding: 0,
    border: 0,
    $nest: {
        "&:hover": {
            background: 'orangered'
        }
    }
});

interface IwindowProps {
    show: boolean,
    close: () => void,
    width: number,
    maxHeight: number,
    position: [number, number],
    setPosition: (t: number, l: number) => void,
}

export const WidgetWindow: React.FunctionComponent<IwindowProps> = (props) => {
    const refWindow = React.useRef(null);
    const refHandle = React.useRef(null);
    
    React.useLayoutEffect(() => {
        if (props.show) {
            ($(refWindow.current) as any).draggable({ scroll: false, handle: refHandle.current, containment: '#chartpanel' });
            return () => {
                let left = 0;
                let top = 0;
                if ($(refWindow.current).css('left') !== undefined)
                    left = parseFloat($(refWindow.current).css('left'));
                if ($(refWindow.current).css('top') !== undefined)
                    top = parseFloat($(refWindow.current).css('top'));
                props.setPosition(top, left);
            };
        }
    });

    if (!props.show)
        return null;

    return (
        < div ref={refWindow} className="ui-widget-content" style={{ ...outerDiv, top: props.position[0], left: props.position[1], width: props.width, maxHeight: props.maxHeight, display: undefined }} >
            <div style={{ border: 'black solid 2px' }}>
                <div ref={refHandle} className={handle}></div>
                <div style={{ width: props.width - 6, maxHeight: props.maxHeight - 24 }}>
                    {props.children}
                </div>
                <button className={closeButton} onClick={() => props.close()}>X</button>
            </div>
        </div>
        )
}