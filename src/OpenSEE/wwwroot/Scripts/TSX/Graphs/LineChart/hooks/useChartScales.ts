import * as React from 'react';
import * as d3 from 'd3';
import { OpenSee } from '../../../global';

export interface IChartScales {
    xScaleRef: React.MutableRefObject<d3.ScaleLinear<number, number>>;
    yScaleRef: React.MutableRefObject<OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}>;
}

export function useChartScales(): IChartScales {
    const xScaleRef = React.useRef<d3.ScaleLinear<number, number>>(d3.scaleLinear());
    const yScaleRef = React.useRef<OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}>({});
    return { xScaleRef, yScaleRef };
}