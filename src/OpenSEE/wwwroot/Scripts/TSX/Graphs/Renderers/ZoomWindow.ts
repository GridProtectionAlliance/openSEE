//******************************************************************************************************
//  ZoomWindow.ts - Gbtc
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
//  05/08/2026 - Preston Crawford
//       Generated original version of source code
//
//******************************************************************************************************

import * as d3 from "d3";

export interface ZoomWindowRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Computes the zoom-selection rectangle geometry, or null when no selection is in progress.
// Coordinates are in the plot's translated (translate(10,0)) coordinate system.
export const computeZoomWindow = (
    pxAtX: (d: number) => number,
    primaryYScale: d3.ScaleLinear<number, number>,
    hover: [number, number],
    pointMouse: [number, number],
    mouseMode: string,
    zoomMode: string,
    mouseDown: boolean,
    xDomainStart: number,
    xDomainEnd: number,
    height: number
): ZoomWindowRect | null => {
    if (mouseMode !== "zoom" || !mouseDown || primaryYScale == null) return null;

    if (zoomMode === "x")
        return {
            x: pxAtX(Math.min(hover[0], pointMouse[0])),
            width: Math.abs(pxAtX(hover[0]) - pxAtX(pointMouse[0])),
            y: 20,
            height: height - 60,
        };

    if (zoomMode === "y")
        return {
            x: pxAtX(xDomainStart),
            width: pxAtX(xDomainEnd) - pxAtX(xDomainStart),
            y: Math.min(primaryYScale(pointMouse[1]), primaryYScale(hover[1])),
            height: Math.abs(primaryYScale(pointMouse[1]) - primaryYScale(hover[1])),
        };

    if (zoomMode === "xy")
        return {
            x: pxAtX(Math.min(hover[0], pointMouse[0])),
            width: Math.abs(pxAtX(hover[0]) - pxAtX(pointMouse[0])),
            y: Math.min(primaryYScale(pointMouse[1]), primaryYScale(hover[1])),
            height: Math.abs(primaryYScale(pointMouse[1]) - primaryYScale(hover[1])),
        };

    return null;
}
