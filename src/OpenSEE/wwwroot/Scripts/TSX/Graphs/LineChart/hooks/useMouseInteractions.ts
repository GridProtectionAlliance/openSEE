import * as d3 from 'd3';
import * as React from 'react';
import { PlotStateActionContext, PlotDataMap } from '../../../Context/PlotStateContext';
import { OpenSee } from '../../../global';

export interface IMouseInteractionInputs {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    xScaleRef: React.MutableRefObject<d3.ScaleLinear<number, number>>;
    yScaleRef: React.MutableRefObject<OpenSee.IUnitCollection<d3.ScaleLinear<number, number>> | {}>;
    primaryAxis: string;
    hover: [number, number];
    setHover: (h: [number, number]) => void;
    isOverlappingWaveform: boolean;
    mouseMode: OpenSee.MouseMode;
    zoomMode: OpenSee.ZoomMode;
    setAnalytic: React.Dispatch<React.SetStateAction<OpenSee.IAnalyticContext>>;
    plotData: PlotDataMap;
    dataKey: OpenSee.IGraphProps;
    width: number;
    height: number;
    fftWindow: [number, number];
    startTime: number;
    endTime: number;
    yLimits: Partial<OpenSee.IUnitCollection<[number, number]>>;
    oldFFTWindow: [number, number];
    setOldFFTWindow: React.Dispatch<React.SetStateAction<[number, number]>>;
    setCurrentFFTWindow: React.Dispatch<React.SetStateAction<[number, number]>>;
}

export interface IMouseInteractionResult {
    handlers: {
        onMouseMove: (evt: any) => void;
        onMouseDown: (evt: any) => void;
        onMouseUp: () => void;
        onMouseOut: () => void;
        onMouseEnter: () => void;
        onFFTMouseDown: (evt: any) => void;
        onFFTMouseUp: () => void;
    };
    wheelZoom: d3.ZoomBehavior<SVGRectElement, unknown>;
    mouseDown: boolean;
    fftMouseDown: boolean;
    pointMouse: [number, number];
}

interface IPanOrigin {
    xLimits: [number, number];
    yLimits: Partial<OpenSee.IUnitCollection<[number, number]>>;
    xScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleLinear<number, number> | null;
    mouse: [number, number];
}

export const useMouseInteractions = (params: IMouseInteractionInputs): IMouseInteractionResult => {
    const {
        containerRef, xScaleRef, yScaleRef, primaryAxis,
        hover, setHover, isOverlappingWaveform,
        mouseMode, zoomMode, setAnalytic,
        plotData, dataKey,
        width, height, fftWindow,
        startTime, endTime, yLimits,
        oldFFTWindow, setOldFFTWindow, setCurrentFFTWindow,
    } = params;

    const stateActions = React.useContext(PlotStateActionContext);

    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    const [fftMouseDown, setFFTMouseDown] = React.useState<boolean>(false);
    const [mouseDownInit, setMouseDownInit] = React.useState<boolean>(false);
    const [pointMouse, setPointMouse] = React.useState<[number, number]>([0, 0]);
    const [leftSelectCounter, setLeftSelectCounter] = React.useState<number>(0);
    const panOriginRef = React.useRef<IPanOrigin | null>(null);
    const fftMouseDownRef = React.useRef<boolean>(false);

    // rAF coalescing for hover updates: many mousemove events per frame collapse to a single setHover at most once per animation frame.
    const pendingHoverRef = React.useRef<[number, number] | null>(null);
    const hoverRafRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (hoverRafRef.current != null) {
                cancelAnimationFrame(hoverRafRef.current);
                hoverRafRef.current = null;
            }
        };
    }, []);

    React.useEffect(() => {
        if (!fftMouseDown) return;

        const handleMouseUp = () => { MouseUp(); };
        window.addEventListener('mouseup', handleMouseUp);
        return () => { window.removeEventListener('mouseup', handleMouseUp); };
    }, [fftMouseDown]);

    React.useEffect(() => {
        if (leftSelectCounter === 0 || leftSelectCounter === 1) return;
        const handle = setTimeout(() => { MouseLeft(); }, 500);
        return () => { clearTimeout(handle); };
    }, [leftSelectCounter]);

    // Commit zoom/FFT action on mouse release
    React.useEffect(() => {
        if (!mouseDownInit) {
            setMouseDownInit(true);
            return;
        }

        if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'x') {
            if (isOverlappingWaveform)
                stateActions.SetCycleLimit(Math.min(pointMouse[0], hover[0]), Math.max(pointMouse[0], hover[0]), plotData);
            else
                stateActions.SetTimeLimit(Math.min(pointMouse[0], hover[0]), Math.max(pointMouse[0], hover[0]), plotData);
        }
        else if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'y')
            stateActions.SetZoomedLimits([Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], dataKey, plotData);
        else if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'xy') {
            if (isOverlappingWaveform)
                stateActions.SetCycleLimit(Math.min(pointMouse[0], hover[0]), Math.max(pointMouse[0], hover[0]), plotData);
            else
                stateActions.SetTimeLimit(Math.min(pointMouse[0], hover[0]), Math.max(pointMouse[0], hover[0]), plotData);
            stateActions.SetZoomedLimits([Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], dataKey, plotData);
        }
        else if (!fftMouseDown && mouseMode === 'fftMove' && pointMouse[0] < oldFFTWindow[1] && pointMouse[0] > oldFFTWindow[0]) {
            const deltaT = pointMouse[0] - oldFFTWindow[0];
            const deltaData = oldFFTWindow[1] - oldFFTWindow[0];
            let Tstart = hover[0] - deltaT;
            Tstart = (Tstart < xScaleRef.current.domain()[0] ? xScaleRef.current.domain()[0] : Tstart);
            Tstart = ((Tstart + deltaData) > xScaleRef.current.domain()[1] ? xScaleRef.current.domain()[1] - deltaData : Tstart);
            setAnalytic(a => ({ ...a, FFTStartTime: Tstart }));
        }
    }, [mouseDown, fftMouseDown]);

    // FFT-drag: update state while mouse moves
    React.useEffect(() => {
        if (mouseMode === 'fftMove' && fftMouseDown && pointMouse[0] < oldFFTWindow[1] && pointMouse[0] > oldFFTWindow[0])
            setCurrentFFTWindow([
                xScaleRef.current(oldFFTWindow[0] + hover[0] - pointMouse[0]),
                xScaleRef.current(oldFFTWindow[1] + hover[0] - pointMouse[0]),
            ]);
    }, [hover]);

    const MouseMove = (evt: any) => {
        const [x0, y0] = getClampedPointer(evt, width, height);

        pendingHoverRef.current = [x0, y0];
        if (hoverRafRef.current == null) {
            hoverRafRef.current = requestAnimationFrame(() => {
                hoverRafRef.current = null;
                if (pendingHoverRef.current != null) {
                    applyPan(pendingHoverRef.current);
                    setHover(getDataPoint(pendingHoverRef.current));
                    pendingHoverRef.current = null;
                }
            });
        }
    }

    const MouseDown = (evt: any) => {
        const rawPointer = d3.pointer(evt, evt.currentTarget);
        const [x0, y0] = clampPointer(rawPointer[0], rawPointer[1], width, height);

        const t0 = xScaleRef.current.invert(x0);
        const d0 = (yScaleRef.current as any)[primaryAxis].invert(y0);

        setMouseDown(true);
        setPointMouse([t0, d0]);

        if (mouseMode === 'fftMove') {
            setOldFFTWindow(() => fftWindow);
            const isFFTWindowHit = t0 < fftWindow[1] && t0 > fftWindow[0];
            fftMouseDownRef.current = isFFTWindowHit;
            setFFTMouseDown(isFFTWindowHit);
            return;
        }

        if (mouseMode === 'pan') {
            const yScale = (yScaleRef.current as any)[primaryAxis] as d3.ScaleLinear<number, number> | undefined;
            panOriginRef.current = {
                xLimits: [startTime, endTime],
                yLimits: copyYLimits(yLimits),
                xScale: xScaleRef.current.copy(),
                yScale: yScale?.copy() ?? null,
                mouse: [x0, y0],
            };
        }
        else
            panOriginRef.current = null;

        if (isOverlappingWaveform) return;

        if (rawPointer[0] > 60 && rawPointer[0] < width - 110 && mouseMode === 'select')
            stateActions.SetSelectPoint(t0, plotData);

        setOldFFTWindow(() => fftWindow);
    }

    const FFTMouseDown = (evt: any) => {
        fftMouseDownRef.current = true;
        setFFTMouseDown(true);
        const pointer = d3.pointer(evt, evt.currentTarget);
        const x0 = pointer[0];
        const y0 = pointer[1];

        const t0 = xScaleRef.current.invert(x0);
        const d0 = (yScaleRef.current as any)[primaryAxis].invert(y0);

        setPointMouse([t0, d0]);
        setOldFFTWindow(() => fftWindow);
    }

    const flushPendingHover = () => {
        if (hoverRafRef.current != null) {
            cancelAnimationFrame(hoverRafRef.current);
            hoverRafRef.current = null;
        }
        if (pendingHoverRef.current != null) {
            applyPan(pendingHoverRef.current);
            setHover(getDataPoint(pendingHoverRef.current));
            pendingHoverRef.current = null;
        }
    }

    const MouseUp = () => {
        flushPendingHover();
        setMouseDown(false);
        fftMouseDownRef.current = false;
        setFFTMouseDown(false);
        panOriginRef.current = null;
    }

    const MouseOut = () => {
        if (fftMouseDownRef.current) return;
        setLeftSelectCounter(() => -1);
    }

    const MouseLeft = () => {
        if (fftMouseDownRef.current) return;
        setMouseDown(false);
        panOriginRef.current = null;
    }

    const applyPan = (pointer: [number, number]) => {
        const panOrigin = panOriginRef.current;
        if (mouseMode !== 'pan' || panOrigin == null) return;

        const deltaT = panOrigin.xScale.invert(pointer[0]) - panOrigin.xScale.invert(panOrigin.mouse[0]);
        const deltaData = panOrigin.yScale == null ? 0 : panOrigin.yScale.invert(pointer[1]) - panOrigin.yScale.invert(panOrigin.mouse[1]);

        if (zoomMode === 'x' || zoomMode === 'xy') {
            if (!isOverlappingWaveform)
                stateActions.SetTimeLimit(panOrigin.xLimits[0] - deltaT, panOrigin.xLimits[1] - deltaT, plotData);
            else
                stateActions.SetCycleLimit(panOrigin.xLimits[0] - deltaT, panOrigin.xLimits[1] - deltaT, plotData);
        }

        const initialYLimits = (panOrigin.yLimits as any)[primaryAxis];
        if (initialYLimits != null && (zoomMode === 'y' || zoomMode === 'xy'))
            stateActions.SetZoomedLimits(
                [initialYLimits[0] - deltaData, initialYLimits[1] - deltaData],
                dataKey, plotData
            );
    }

    const getDataPoint = (pointer: [number, number]): [number, number] => {
        return [
            xScaleRef.current.invert(pointer[0]),
            (yScaleRef.current as any)[primaryAxis].invert(pointer[1]),
        ];
    }

    const wheelZoom = d3.zoom<SVGRectElement, unknown>()
        .filter(event => event.type === 'wheel')
        .on('zoom', (event) => {
            const newTime = event.transform.rescaleX(xScaleRef.current).domain();
            const newYLimits = event.transform.rescaleY((yScaleRef.current as any)[primaryAxis]).domain();

            if (mouseMode === 'zoom' && zoomMode === 'x') {
                if (isOverlappingWaveform)
                    stateActions.SetCycleLimit(newTime[0], newTime[1], plotData);
                else
                    stateActions.SetTimeLimit(newTime[0], newTime[1], plotData);
            }

            if (mouseMode === 'zoom' && zoomMode === 'y')
                stateActions.SetZoomedLimits(newYLimits, dataKey, plotData);

            if (mouseMode === 'zoom' && zoomMode === 'xy') {
                if (isOverlappingWaveform)
                    stateActions.SetCycleLimit(newTime[0], newTime[1], plotData);
                else
                    stateActions.SetTimeLimit(newTime[0], newTime[1], plotData);
                stateActions.SetZoomedLimits(newYLimits, dataKey, plotData);
            }
        });

    return {
        handlers: {
            onMouseMove: MouseMove,
            onMouseDown: MouseDown,
            onMouseUp: MouseUp,
            onMouseOut: MouseOut,
            onMouseEnter: () => setLeftSelectCounter(1),
            onFFTMouseDown: FFTMouseDown,
            onFFTMouseUp: MouseUp,
        },
        wheelZoom,
        mouseDown,
        fftMouseDown,
        pointMouse,
    };
}

const getClampedPointer = (evt: any, width: number, height: number): [number, number] => {
    const pointer = d3.pointer(evt, evt.currentTarget);
    return clampPointer(pointer[0], pointer[1], width, height);
}

const clampPointer = (x: number, y: number, width: number, height: number): [number, number] => {
    let x0 = x;
    let y0 = y;

    if (x0 < 60) x0 = 60;
    if (x0 > (width - 110)) x0 = width - 110;
    if (y0 < 20) y0 = 20;
    if (y0 > (height - 40)) y0 = height - 40;

    return [x0, y0];
}

const copyYLimits = (currentYLimits: Partial<OpenSee.IUnitCollection<[number, number]>>): Partial<OpenSee.IUnitCollection<[number, number]>> => {
    const copied = {} as Partial<OpenSee.IUnitCollection<[number, number]>>;
    Object.keys(currentYLimits).forEach(unit => {
        const limits = (currentYLimits as any)[unit];
        if (limits != null)
            (copied as any)[unit] = [limits[0], limits[1]];
    });
    return copied;
}
