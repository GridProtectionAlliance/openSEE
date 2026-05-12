//******************************************************************************************************
//  PlotChromeBar.ts - Gbtc
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
import { OpenSee } from "../../../global";
import { GetDisplayLabel } from "../../Utils/Utilities";
import { CreatePlotSVG, IChromeHandlers } from "../../Renderers/CreatePlotSVG";
import { createYAxes } from "../../Renderers/YAxes";
import { createFrequencyXAxis, setFrequencyDomainFromBands } from "./XAxisFreq";

export interface IBarPlotChromeParams {
    height: number;
    width: number;
    dataKey: OpenSee.IGraphProps;
    yLimits: Partial<OpenSee.IUnitCollection<[number, number]>>;
    enabledUnits: OpenSee.Unit[];
    yLabels: Partial<OpenSee.IUnitCollection<string>>;
    barData: OpenSee.iD3DataSeries[];
    fftLimits: [number, number];
}

export const CreateBarPlotFrame = (
    containerEl: HTMLDivElement | null,
    xScaleRef: { current: d3.ScaleBand<number> },
    xScaleLblRef: { current: d3.ScaleLinear<number, number> },
    yScaleRef: { current: Record<string, d3.ScaleLinear<number, number>> },
    params: IBarPlotChromeParams,
    handlers: IChromeHandlers
) => {
    const { height, width, dataKey, yLimits, enabledUnits, yLabels, barData, fftLimits } = params;
    const svg = CreatePlotSVG(
        containerEl,
        yScaleRef,
        { height, width, dataKey, yLimits, displayLabel: GetDisplayLabel(dataKey.DataType) },
        handlers
    );
    if (svg == null) return;

    const domain = (barData?.[0]?.DataPoints ?? [])
        .filter(pt => pt[0] >= fftLimits[0] && pt[0] <= fftLimits[1])
        .map(pt => pt[0]);

    xScaleRef.current = d3.scaleBand<number>(domain, [60, width - 110]);
    setFrequencyDomainFromBands(xScaleRef.current, xScaleLblRef.current);

    createFrequencyXAxis(svg, xScaleRef.current, xScaleLblRef.current, height, width);
    createYAxes(svg, enabledUnits, yScaleRef.current, yLabels, height, width);
}
