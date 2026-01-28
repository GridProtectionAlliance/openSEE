// HoverContext.tsx


import * as React from 'react';

interface HoverContextType {
    hover: [number, number];
    setHover: React.Dispatch<React.SetStateAction<[number, number]>>;
}

const defaultState: HoverContextType = {
    hover: [0, 0],
    setHover: () => { }
};

const HoverContext = React.createContext<HoverContextType>(defaultState);

export default HoverContext;
