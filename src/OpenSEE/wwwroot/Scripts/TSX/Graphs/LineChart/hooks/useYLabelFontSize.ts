import * as React from 'react';
import { GetTextWidth } from '@gpa-gemstone/helper-functions';
import { OpenSee } from '../../../global';

export function useYLabelFontSize(
    yLabels: Partial<OpenSee.IUnitCollection<string>>,
    primaryAxis: string,
    height: number
): number {
    const [fontSize, setFontSize] = React.useState<number>(1);

    React.useEffect(() => {
        let fs = 1;
        let l = GetTextWidth('', '1rem', yLabels?.[primaryAxis]);
        let r = GetTextWidth('', '1rem', yLabels?.[primaryAxis] ?? "");

        while (((l > height - 60) || (r > height - 60)) && fs > 0.2) {
            fs -= 0.05;
            l = GetTextWidth('', `${fs}rem`, yLabels?.[primaryAxis]);
            r = GetTextWidth('', `${fs}rem`, yLabels?.[primaryAxis] ?? "");
        }
        if (fs !== fontSize)
            setFontSize(fs);
    }, [height, yLabels]);

    return fontSize;
}
