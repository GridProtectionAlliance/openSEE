import * as React from 'react';

const navIconSize = 46;

export const navIconButtonStyle: React.CSSProperties = {
    alignItems: 'center',
    display: 'inline-flex',
    flex: `0 0 ${navIconSize}px`,
    height: navIconSize,
    justifyContent: 'center',
    width: navIconSize
};

export const navIconDropdownStyle: React.CSSProperties = {
    height: navIconSize,
    width: navIconSize * .75
};

export const navIconDropdownButtonClass = 'd-inline-flex align-items-center justify-content-center';
