//******************************************************************************************************
//  Utilities.tsx - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  05/08/2026 - Preston Crawford
//       Generated original version of source code
//
//******************************************************************************************************
import { ILegendGrid } from './Types';

const horizontalSort = ['W', 'Pk', 'RMS', 'Ph', 'V', 'I', 'Pre', 'Post', 'P', 'Q', 'S', 'Pf', 'R', 'X', 'Z', 'Mag', 'Ang'];
const verticalGroupSort = ['L-N', 'L-L', 'Volt.', 'Curr.', 'V', 'I'];
const verticalSort = ['AN', 'BN', 'CN', 'NG', 'RES', 'AB', 'BC', 'CA', 'Avg', 'Total', 'Pos', 'Neg', 'Zero', 'S0/S1', 'S2/S1', 'Simple', 'Reactance', 'Takagi', 'ModifiedTakagi', 'Novosel'];

export const sortHorizontal = (a: string, b: string): number => {
    if (a == b) return 0;
    const ia = horizontalSort.indexOf(a), ib = horizontalSort.indexOf(b);
    if (ia != -1 && ib != -1) return ia - ib;
    if (ia != -1) return 1;
    if (ib != -1) return -1;
    return a > b ? 1 : -1;
};

export const sortVertical = (a: [string, string], b: [string, string]): number => {
    if (a[1] != b[1]) return sortGroup(a, b);
    if (a[0] == b[0]) return 0;
    const ia = verticalSort.indexOf(a[0]), ib = verticalSort.indexOf(b[0]);
    if (ia != -1 && ib != -1) return ia - ib;
    if (ia != -1) return 1;
    if (ib != -1) return -1;
    return a[0] > b[0] ? 1 : -1;
};

export const sortGroup = (a: [string, string], b: [string, string]): number => {
    if (a[1] == b[1]) return 0;
    const ia = verticalGroupSort.indexOf(a[1]), ib = verticalGroupSort.indexOf(b[1]);
    if (ia != -1 && ib != -1) return ia - ib;
    if (ia != -1) return 1;
    if (ib != -1) return -1;
    return a[1] > b[1] ? 1 : -1;
};

export const uniq = <T,>(array: T[], fx: (item: T) => string): T[] => {
    const result: T[] = [], seen: string[] = [];
    array.forEach(item => { const k = fx(item); if (!seen.includes(k)) { result.push(item); seen.push(k); } });
    return result;
};

export const groupBy = (list: ILegendGrid[], fnct: (v: ILegendGrid) => string): Map<string, ILegendGrid[]> => {
    const result = new Map<string, ILegendGrid[]>();
    list.forEach(item => { const k = fnct(item); const v = result.get(k); if (v) v.push(item); else result.set(k, [item]); });
    return result;
};

export const convertHex = (hex: string, opacity: number) => {
    hex = hex.replace("#", "");
    return `rgba(${parseInt(hex.substring(0, 2), 16)},${parseInt(hex.substring(2, 4), 16)},${parseInt(hex.substring(4, 6), 16)},${opacity / 100})`;
};
