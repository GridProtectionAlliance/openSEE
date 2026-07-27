import * as React from 'react';
import * as d3 from 'd3';

export interface IFFTWindowState {
    currentFFTWindow: [number, number];
    setCurrentFFTWindow: React.Dispatch<React.SetStateAction<[number, number]>>;
    oldFFTWindow: [number, number];
    setOldFFTWindow: React.Dispatch<React.SetStateAction<[number, number]>>;
}

export function useFFTWindow(
    xScaleRef: React.MutableRefObject<d3.ScaleLinear<number, number>>,
    fftWindow: [number, number]
): IFFTWindowState {
    const [currentFFTWindow, setCurrentFFTWindow] = React.useState<[number, number]>(fftWindow);
    const [oldFFTWindow, setOldFFTWindow] = React.useState<[number, number]>([0, 0]);

    React.useEffect(() => {
        if (xScaleRef.current)
            setCurrentFFTWindow([xScaleRef.current(fftWindow[0]), xScaleRef.current(fftWindow[1])]);
    }, [fftWindow]);

    return { currentFFTWindow, setCurrentFFTWindow, oldFFTWindow, setOldFFTWindow };
}
