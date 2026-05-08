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
    lineData: OpenSee.iD3DataSeries[];
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

export function useMouseInteractions(inputs: IMouseInteractionInputs): IMouseInteractionResult {
    const {
        containerRef, xScaleRef, yScaleRef, primaryAxis,
        hover, setHover, isOverlappingWaveform,
        mouseMode, zoomMode, setAnalytic,
        plotData, lineData, dataKey,
        width, height, fftWindow,
        startTime, endTime, yLimits,
        oldFFTWindow, setOldFFTWindow, setCurrentFFTWindow,
    } = inputs;

    const stateActions = React.useContext(PlotStateActionContext);

    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    const [fftMouseDown, setFFTMouseDown] = React.useState<boolean>(false);
    const [mouseDownInit, setMouseDownInit] = React.useState<boolean>(false);
    const [pointMouse, setPointMouse] = React.useState<[number, number]>([0, 0]);
    const [leftSelectCounter, setLeftSelectCounter] = React.useState<number>(0);

    // rAF coalescing for hover updates: many mousemove events per frame collapse
    // to a single setHover at most once per animation frame.
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

        // TODO: SetCycleLimit condition duplicates SetTimeLimit condition — likely a bug in the original
        if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'x' && !isOverlappingWaveform)
            stateActions.SetTimeLimit(Math.min(pointMouse[0], hover[0]), Math.max(pointMouse[0], hover[0]), plotData);
        if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'x' && !isOverlappingWaveform)
            stateActions.SetCycleLimit(Math.min(pointMouse[0], hover[0]), Math.max(pointMouse[0], hover[0]), plotData);
        else if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'y')
            stateActions.SetZoomedLimits([Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], dataKey, lineData);
        else if (!mouseDown && mouseMode === 'zoom' && zoomMode === 'xy' && !isOverlappingWaveform) {
            stateActions.SetZoomedLimits([Math.min(pointMouse[1], hover[1]), Math.max(pointMouse[1], hover[1])], dataKey, lineData);
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

    // Pan and FFT-drag: update state while mouse moves
    React.useEffect(() => {
        const deltaT = hover[0] - pointMouse[0];
        const deltaData = hover[1] - pointMouse[1];

        if (mouseMode === 'pan' && mouseDown && (zoomMode === 'x' || zoomMode === 'xy')) {
            if (!isOverlappingWaveform)
                stateActions.SetTimeLimit(startTime - deltaT, endTime - deltaT, plotData);
            else
                stateActions.SetCycleLimit(startTime - deltaT, endTime - deltaT, plotData);
        }

        if (mouseMode === 'pan' && mouseDown && (zoomMode === 'y' || zoomMode === 'xy'))
            stateActions.SetZoomedLimits(
                [(yLimits as any)[primaryAxis]?.[0] - deltaData, (yLimits as any)[primaryAxis]?.[1] - deltaData],
                dataKey, lineData
            );

        if (mouseMode === 'fftMove' && fftMouseDown && pointMouse[0] < oldFFTWindow[1] && pointMouse[0] > oldFFTWindow[0])
            setCurrentFFTWindow([
                xScaleRef.current(oldFFTWindow[0] + hover[0] - pointMouse[0]),
                xScaleRef.current(oldFFTWindow[1] + hover[0] - pointMouse[0]),
            ]);
    }, [hover]);

    function MouseMove(evt: any) {
        let x0 = d3.pointer(evt, evt.currentTarget)[0];
        let y0 = d3.pointer(evt, evt.currentTarget)[1];

        if (x0 < 60) x0 = 60;
        if (x0 > (width - 140)) x0 = width - 140;
        if (y0 < 20) y0 = 20;
        if (y0 > (height - 40)) y0 = height - 40;

        const t0 = xScaleRef.current.invert(x0);
        const d0 = (yScaleRef.current as any)[primaryAxis].invert(y0);

        pendingHoverRef.current = [t0, d0];
        if (hoverRafRef.current == null) {
            hoverRafRef.current = requestAnimationFrame(() => {
                hoverRafRef.current = null;
                if (pendingHoverRef.current != null) {
                    setHover(pendingHoverRef.current);
                    pendingHoverRef.current = null;
                }
            });
        }
    }

    function MouseDown(evt: any) {
        const x0 = d3.pointer(evt, evt.currentTarget)[0];
        const y0 = d3.pointer(evt, evt.currentTarget)[1];

        const t0 = xScaleRef.current.invert(x0);
        const d0 = (yScaleRef.current as any)[primaryAxis].invert(y0);

        setMouseDown(true);
        setPointMouse([t0, d0]);

        if (isOverlappingWaveform) return;

        if (x0 > 60 && x0 < width - 140 && mouseMode === 'select')
            stateActions.SetSelectPoint(t0, plotData);

        setOldFFTWindow(() => fftWindow);
    }

    function FFTMouseDown(evt: any) {
        setFFTMouseDown(true);
        const x0 = d3.pointer(evt, evt.currentTarget)[0];
        const y0 = d3.pointer(evt, evt.currentTarget)[1];

        const t0 = xScaleRef.current.invert(x0);
        const d0 = (yScaleRef.current as any)[primaryAxis].invert(y0);

        setPointMouse([t0, d0]);
        setOldFFTWindow(() => fftWindow);
    }

    function flushPendingHover() {
        if (hoverRafRef.current != null) {
            cancelAnimationFrame(hoverRafRef.current);
            hoverRafRef.current = null;
        }
        if (pendingHoverRef.current != null) {
            setHover(pendingHoverRef.current);
            pendingHoverRef.current = null;
        }
    }

    function MouseUp() {
        flushPendingHover();
        setMouseDown(false);
        d3.select(containerRef.current).select('.zoomWindow').style('opacity', 0);
    }

    function MouseOut() {
        setLeftSelectCounter(() => -1);
    }

    function MouseLeft() {
        d3.select(containerRef.current).select('.zoomWindow').style('opacity', 0);
        setMouseDown(false);
    }

    const wheelZoom = d3.zoom<SVGRectElement, unknown>()
        .filter(event => event.type === 'wheel')
        .on('zoom', (event) => {
            const newTime = event.transform.rescaleX(xScaleRef.current).domain();
            const newYLimits = event.transform.rescaleX((yScaleRef.current as any)[primaryAxis]).domain();

            if (mouseMode === 'zoom' && zoomMode === 'x' && !isOverlappingWaveform)
                stateActions.SetTimeLimit(newTime[0], newTime[1], plotData);

            if (mouseMode === 'zoom' && zoomMode === 'y' && !isOverlappingWaveform)
                stateActions.SetZoomedLimits(newYLimits, dataKey, lineData);

            if (mouseMode === 'zoom' && zoomMode === 'xy' && !isOverlappingWaveform) {
                stateActions.SetTimeLimit(newTime[0], newTime[1], plotData);
                stateActions.SetZoomedLimits(newYLimits, dataKey, lineData);
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
            onFFTMouseUp: () => setFFTMouseDown(false),
        },
        wheelZoom,
        mouseDown,
        fftMouseDown,
        pointMouse,
    };
}
