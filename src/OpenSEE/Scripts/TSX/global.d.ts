//******************************************************************************************************
//  global.d.ts - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  Type definitions for openSEE.tsx
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  09/29/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
// global variables declared in openSEE.cshtml scripts section
declare var homePath: string;
declare var userIsAdmin: boolean;
declare var eventID: number;
declare var eventStartTime: string;
declare var eventEndTime: string;

declare const MOMENT_DATETIME_FORMAT = 'MM/DD/YYYYTHH:mm:ss.SSSSSSSS';

export namespace OpenSee {

    interface iOpenSeeState {
        //For Plots
        graphWidth: number,
        

        //For Event Navigation
        eventData: iPostedData,
        lookup: iNextBackLookup,
        

        eventStartTime: string,
        eventEndTime: string,

        // For Event Compare Logic
        overlappingEvents: Array<iListObject>,
        comparedEvents: Array<number>,

        //Not sure what this is for maybe GTC?
        breakeroperation: any,

    }

    interface IOpenSeeProps {
        eventID: number,
        url: string,
        graphList: IGraphProps[],

        loadVolt: boolean,
        loadCurr: boolean,
        loadAnalog: boolean,
        loadDigital: boolean,
        loadTCE: boolean,

        numberCompareGraphs: number,
        eventGroup: iListObject[],

        displayVolt: boolean,
        displayCur: boolean,
        displayTCE: boolean,
        displayDigitals: boolean,
        displayAnalogs: boolean,
        Tab: Tab,
        Navigation: EventNavigation,
        querystring: string,
        analytic: Analytic,
    }
    // For navigation
    type EventNavigation = ('system' | 'station' | 'meter' | 'asset')

    interface iXDAEvent {
        Alias?: string;
        Description?: string;
        EndTime?: string;
        EventDataID?: number;
        EventTypeID?: number;
        EventTypeName?: string;
        FileGroupID?: number;
        ID?: number;
        Length?: number;
        LineID?: number;
        LineName?: string;
        MeterID?: number;
        MeterName?: string;
        Name?: string;
        Samples?: number;
        SamplesPerCycle?: number;
        SamplesPerSecond?: number;
        ShortName?: string;
        StartTime?: string;
        StationName?: string;
        UpdateBy?: string;
    }

    interface iNextBackLookup {
        Asset: iEventTuple;
        Meter: iEventTuple;
        Station: iEventTuple;
        System: iEventTuple;
    }

    interface iEventTuple {
        m_Item1?: iXDAEvent;
        m_Item2?: iXDAEvent;
    }

    interface iPostedData {
        BreakerNumber?: string;
        BreakerTiming?: string;
        BreakerSpeed?: string;
        BreakerOperation?: string;
        CalculationCycle?: string;
        Date?: string;
        DurationPeriod?: string;
        EventDate?: string;
        EventId?: string;
        EventMilliseconds?: string;
        EventName?: string;
        LineLength?: string;
        AssetName?: string;
        Magnitude?: string;
        MeterId?: string;
        MeterName?: string;
        Phase?: string;
        SagDepth?: string;
        StartTime?: string;
        StationName?: string;
        SystemFrequency?: string;
        xdaInstance?: string;
        enableLightningData?: boolean,
    }

    interface iListObject {
        group?: string;
        label: string;
        value: number;
        selected: boolean;
    }

    type graphType = ("Voltage" | "Current" | "Analogs" | 'Digitals' | 'TripCoil' | 'FirstDerivative' | 'ClippedWaveforms' | 'Frequency' | 'HighPassFilter' | 'LowPassFilter' | 'MissingVoltage' | 'OverlappingWave' | 'Power' | 'Impedance' | 'Rectifier' | 'RapidVoltage' | 'RemoveCurrent' | 'Harmonic' | 'SymetricComp' | 'THD' | 'Unbalance' | 'FaultDistance' | 'Restrike' | 'FFT')

    type Analytic = ('none' | 'FirstDerivative' | 'ClippedWaveforms' | 'Frequency' | 'HighPassFilter' | 'LowPassFilter' | 'MissingVoltage' | 'OverlappingWave' | 'Power' | 'Impedance' | 'Rectifier' | 'RapidVoltage' | 'RemoveCurrent' | 'Harmonic' | 'SymetricComp' | 'THD' | 'Unbalance' | 'FaultDistance' | 'Restrike' | 'FFT')

    type Tab = ("Info" | "Compare" | "Analytic")

    interface iAnalyticParamters { harmonic: number, order: number, tRC: number, fftWindow: number }


    type MouseMode = ("zoom" | "select" | 'pan'| 'none' | 'fftMove')
    type ZoomMode = ("x" | "y" | 'xy')

   

    interface iD3DataSeries {
        LegendHorizontal: string,
        LegendVertical: string,
        LegendGroup: string,
        LegendVGroup: string,

        Unit: Unit,
        Color: Color,

        Display: boolean,
        Enabled: boolean,

        BaseValue: number,
        DataPoints: Array<[number, number]>,
        DataMarker: Array<[number, number]>,
        LineType?: ('-'|':')
    }

    interface IPoint {
        Color: Color,
        Name: string,
        Value: number,
        Unit: iUnitOptions,
        PrevValue?: number,
        BaseValue: number,
        Time: number,
    }

    interface IVector {
        Color: Color,
        Unit: iUnitOptions,
        Phase: string,
        Magnitude: number,
        Angle: number,
        Asset: string,
        PhaseUnit: iUnitOptions,
        BaseValue: number,
    }

    interface IFFTSeries {
        Color: Color,
        Unit: iUnitOptions,
        Phase: string,
        Magnitude: number[],
        Angle: number[],
        Asset: string,
        PhaseUnit: iUnitOptions
    }

    interface IPointCollection {
        Group: string,
        Name: string,
        Unit: iUnitOptions,
        Value: Array<[number,number]>
    }

    // Settings For Plots 
    type Color = ("Va" | "Vc" | "Vb" | "Ia" | "Ib" | "Ic" | "Vab" | "Vbc" | "Vca" | "In" | "Ires" | "random" | "Vn" | 'freqAll' | 'freqVa' | 'freqVb' | 'freqVc' | 'Ra' | 'Xa' | 'Za' | 'Rb' | 'Xb' | 'Zb' | 'Rc' | 'Xc' | 'Zc' |
        'Pa' | 'Qa' | 'Sa' | 'Pfa' | 'Pb' | 'Qb' | 'Sb' | 'Pfb' | 'Pc' | 'Qc' | 'Sc' | 'Pfc' | 'Pt' | 'Qt' | 'St')
   
    type Unit = ("Time" | "Voltage" | "Angle" | "Current" | "VoltageperSecond" | "CurrentperSecond" | "Freq" | "Impedance" | "PowerP" | "PowerQ" | "PowerS" | "PowerPf" | "TCE" | "Distance" | "Unbalance" | "THD")

    interface IUnitCollection {
        Voltage: IUnitSetting,
        Angle: IUnitSetting,
        Current: IUnitSetting,
        VoltageperSecond: IUnitSetting,
        CurrentperSecond: IUnitSetting,
        Freq: IUnitSetting,
        Impedance: IUnitSetting,
        PowerP: IUnitSetting,
        PowerQ: IUnitSetting,
        PowerS: IUnitSetting,
        PowerPf: IUnitSetting,
        TCE: IUnitSetting,
        Distance: IUnitSetting,
        Unbalance: IUnitSetting,
        THD: IUnitSetting,
    }

    interface IColorCollection {
        Va: string,
        Vb: string,
        Vc: string,
        Vn: string,
        Vab: string,
        Vbc: string,
        Vca: string,
        Ia: string,
        Ib: string,
        Ic: string,
        Ires: string,
        In: string,
        random: string,
        freqAll: string,
        freqVa: string,
        freqVb: string,
        freqVc: string,
        Ra: string,
        Xa: string,
        Za: string,
        Rb: string,
        Xb: string,
        Zb: string,
        Rc: string,
        Xc: string,
        Zc: string,
        Pa: string,
        Qa: string,
        Sa: string,
        Pb: string,
        Qb: string,
        Sb: string,
        Pc: string,
        Qc: string,
        Sc: string,
        Pt: string,
        Qt: string,
        St: string,
        Pfa: string,
        Pfb: string,
        Pfc: string,
        VS0: string,
        VS1: string,
        VS2: string,
        IS0: string,
        IS1: string,
        IS2: string,
        Vdc: string,
        Idc: string,
        faultDistSimple: string,
        faultDistReact: string,
        faultDistTakagi: string,
        faultDistModTakagi: string,
        faultDistNovosel: string,
        faultDistDoubleEnd: string,
    }

    interface ISettingsState {
        Units: IUnitCollection,
        Colors: IColorCollection,
        TimeUnit: IUnitSetting,
        SnapToPoint: boolean,
        SinglePlot: boolean,
        displayVolt: boolean,
        displayCur: boolean,
        displayTCE: boolean,
        displayDigitals: boolean,
        displayAnalogs: boolean,
        Tab: Tab,
        Navigation: EventNavigation,
        DefaultTrace: IDefaultTrace,
    }

    interface IUnitSetting {
        current: number,
        options: Array<iUnitOptions>
    }

    interface IDefaultTrace {
        RMS: boolean,
        W: boolean,
        Pk: boolean,
        Ph: boolean
    }
    interface iUnitOptions {
        label: string,
        short: string,
        factor: number
    }

    interface IGraphProps {
        DataType: graphType,
        EventId: number
    }

    // Data For plots
    interface IDataState {
        startTime: number,
        endTime: number,
        hover:  [number,number],
        mouseMode: OpenSee.MouseMode,
        zoomMode: OpenSee.ZoomMode,
        eventID: number,
        Analytic: Analytic,

        plotKeys: OpenSee.IGraphProps[],
        data: Array<OpenSee.iD3DataSeries>[],
        enabled: Array<boolean>[],
        loading: LoadingState[],
        activeRequest: string[]
        activeUnits: IActiveUnits[],
        yLimits: [number, number][],
        autoLimits: boolean[],
        selectedIndixes: Array<number>[],
        cycleLimit: [number,number],
        fftLimits: [number, number],
    }

    type LoadingState = ('Idle' | 'Loading' | 'Partial');

    interface IAnalyticStore {
        Harmonic: number,
        LPFOrder: number,
        HPFOrder: number,
        Trc: number,
        FFTCycles: number,
        FFTStartTime: number,
    }

    interface IEventStore {
        EventList: Array<number>,
        Selected: Array<boolean>,
        Label: Array<string>,
        Group: Array<string>,
        loadingOverlappingEvents: boolean
    }
    //Redux Root State
    interface IRootState {
        Settings: ISettingsState,
        Data: IDataState,
        Analytic: IAnalyticStore,
        Event: IEventStore,
    }

    // for Redux to store active units (in case of Auto Unit)
    interface IActiveUnits {
        Voltage: number,
        Current: number,
        Angle: number,
        VoltageperSecond: number,
        CurrentperSecond: number,
        Freq: number,
        Impedance: number,
        PowerP: number,
        PowerQ: number,
        PowerS: number,
        PowerPf: number,
        TCE: number,
        Distance: number,
        Unbalance: number,
        THD: number,
    }
}
