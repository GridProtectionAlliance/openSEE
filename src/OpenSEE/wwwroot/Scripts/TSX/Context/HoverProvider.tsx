// HoverProvider.tsx
import * as React from 'react';
import HoverContext from './HoverContext';

const HoverProvider = ({ children }) => {
    const [hover, setHover] = React.useState<[number, number]>([0, 0]);

    return (
        <HoverContext.Provider value={{ hover, setHover }}>
            {children}
        </HoverContext.Provider>
    );
};

export default HoverProvider;
