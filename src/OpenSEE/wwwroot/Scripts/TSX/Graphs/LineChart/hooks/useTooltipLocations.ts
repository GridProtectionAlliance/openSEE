import * as React from 'react';
import * as d3 from 'd3';
import { OpenSee } from '../../../global';

export interface ITooltipLocations {
    toolTipLocation: number;
    selectedPointLocation: number | null;
    inceptionLocation: number;
    durationLocation: number;
}

export function useTooltipLocations(
    xScaleRef: React.MutableRefObject<d3.ScaleLinear<number, number>>,
    hover: [number, number],
    points: OpenSee.IPoint[],
    evtInfo: OpenSee.IEventInfo | null,
    startTime: number,
    endTime: number
): ITooltipLocations {
    const [toolTipLocation, setTooltipLocation] = React.useState<number>(10);
    const [selectedPointLocation, setSelectedPointLocation] = React.useState<number | null>(null);
    const [inceptionLocation, setInceptionLocation] = React.useState<number>(10);
    const [durationLocation, setDurationLocation] = React.useState<number>(10);

    React.useEffect(() => {
        if (xScaleRef.current)
            setTooltipLocation(xScaleRef.current(hover?.[0]));
    }, [hover]);

    React.useEffect(() => {
        if (!xScaleRef.current) return;
        const newTime = points.length > 0 ? points[0].Time : null;
        if (newTime != null)
            setSelectedPointLocation(xScaleRef.current(newTime));
    }, [points, startTime, endTime]);

    React.useEffect(() => {
        if (!xScaleRef.current || evtInfo == null) return;
        setInceptionLocation(xScaleRef.current(evtInfo.Inception));
        setDurationLocation(xScaleRef.current(evtInfo.DurationEndTime));
    }, [startTime, endTime, evtInfo]);

    return { toolTipLocation, selectedPointLocation, inceptionLocation, durationLocation };
}
