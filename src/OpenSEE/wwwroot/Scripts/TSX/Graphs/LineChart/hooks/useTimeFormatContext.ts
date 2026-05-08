import * as React from 'react';
import * as d3 from 'd3';
import { OpenSee } from '../../../global';
import { IFormatTimeContext } from '../../Utilities';

export function useTimeFormatContext(
    xScaleRef: React.MutableRefObject<d3.ScaleLinear<number, number>>,
    isOverlappingWaveform: boolean,
    overlappingWaveTimeUnit: number,
    timeUnit: OpenSee.IUnitSetting,
    originalStartTime: number,
    useRelevantTime: boolean,
    isOriginalEvt: boolean,
    overlappingEvents: OpenSee.OverlappingEvents[],
    dataKeyEventId: number,
    inceptionTime: number,
    startTime: number
): () => IFormatTimeContext {
    return React.useCallback((): IFormatTimeContext => ({
        xDomainWidth: xScaleRef.current != null
            ? xScaleRef.current.domain()[1] - xScaleRef.current.domain()[0]
            : 100,
        isOverlappingWaveform,
        overlappingWaveTimeUnit,
        timeUnit,
        originalStartTime,
        useRelevantTime,
        isOriginalEvt,
        overlappingEvents,
        dataKeyEventId,
        inceptionTime,
        startTime,
    }), [isOverlappingWaveform, overlappingWaveTimeUnit, timeUnit, originalStartTime,
        useRelevantTime, isOriginalEvt, overlappingEvents, dataKeyEventId, inceptionTime, startTime]);
}
