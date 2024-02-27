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
declare global {
    var homePath: string;
    var userIsAdmin: boolean;
    var eventID: number;
    var eventStartTime: string;
    var eventEndTime: string;
}

declare const MOMENT_DATETIME_FORMAT = 'MM/DD/YYYYTHH:mm:ss.SSSSSSSS';

export namespace OpenSee {

    interface IRootState {
        Settings: ISettingsState,
        Data: IDataState,
        Analytic: IAnalyticStore,
        EventInfo: IEventStore,
        OverlappingEvents: IOverlappingEventsStore
    }

    interface IEventStore { 
        EventInfo: IEventInfo,
        State: LoadingState,
        EventID: number,
        LookupInfo: iNextBackLookup
    }

    interface IAnalyticStore {
        Harmonic: number,
        LPFOrder: number,
        HPFOrder: number,
        Trc: number,
        FFTCycles: number,
        FFTStartTime: number
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

    interface IEventInfo {
        MeterName: string,
        StationName: string,
        AssetName: string,
        EventName: string,
        EventDate: string,
        SystemFrequency: string,
        MeterId: string,
        EventMilliseconds: number,
        xdaInstance: string,
        Inception: number,
        DurationEndTime: number,
        BreakerNumber?: string,
        BreakerTiming?: string,
        BreakerSpeed?: string,
        BreakerOperation?: string,
        CalculationCycle?: string,
        Date: string,
        DurationPeriod?: string,
        EventId: number;
        LineLength?: string,
        Magnitude?: string,
        Phase?: string,
        SagDepth?: string,
        StartTime?: string,
        enableLightningData?: boolean,
        InceptionDate: string
    }

    type graphType = ("Voltage" | "Current" | "Analogs" | 'Digitals' | 'TripCoil' | 'FirstDerivative' | 'ClippedWaveforms' | 'Frequency' | 'HighPassFilter' | 'LowPassFilter' | 'MissingVoltage' | 'OverlappingWave' | 'Power' | 'Impedance' | 'Rectifier' | 'RapidVoltage' | 'RemoveCurrent' | 'Harmonic' | 'SymetricComp' | 'THD' | 'Unbalance' | 'FaultDistance' | 'Restrike' | 'FFT' | 'NewAnalytic')

    type Analytic = ('none' | 'FirstDerivative' | 'ClippedWaveforms' | 'Frequency' | 'HighPassFilter' | 'LowPassFilter' | 'MissingVoltage' | 'OverlappingWave' | 'Power' | 'Impedance' | 'Rectifier' | 'RapidVoltage' | 'RemoveCurrent' | 'Harmonic' | 'SymetricComp' | 'THD' | 'Unbalance' | 'FaultDistance' | 'Restrike' | 'FFT' | 'NewAnalytic')

    type MouseMode = ("zoom" | "select" | 'pan' | 'none' | 'fftMove')

    type ZoomMode = ("x" | "y" | 'xy')

    type LineType = ('-' | ':')

    type Color = keyof IColorCollection;

    type Unit = ((keyof IUnitCollection<number>) | "Time");

    type Trace = "RMS" | "W" | "Pk" | "Ph";

   
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
        SmoothDataPoints: Array<[number, number]>,
        DataPoints: Array<[number, number]>,
        DataMarker: Array<[number, number]>,
        LineType?: LineType,
        EventID: number
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

    interface IGraphCollection<T> {
        Voltage: T,
        Current: T,
        Analogs: T,
        Digitals: T,
        TripCoil: T,
        FirstDerivative: T,
        ClippedWaveforms: T,
        Frequency: T,
        HighPassFilter: T,
        LowPassFilter: T,
        MissingVoltage: T,
        OverlappingWave: T,
        Power: T,
        Impedance: T,
        Rectifier: T,
        RapidVoltage: T,
        RemoveCurrent: T,
        Harmonic: T,
        SymetricComp: T,
        THD: T,
        Unbalance: T,
        FaultDistance: T,
        Restrike: T,
        FFT: T,
        NewAnalytic: T,
    }

    interface ISettingsState { 
        Colors: IColorCollection,
        TimeUnit: IUnitSetting,
        SinglePlot: boolean,
        DefaultTrace: IDefaultTrace,
        DefaultVType: 'L-L' | 'L-N',
        Navigation: EventNavigation,
        PlotMarkers: boolean,
        UseOverlappingTime: boolean,
        OverlappingWaveTimeUnit: number,
        MouseMode: MouseMode,
        ZoomMode: ZoomMode,
        Units: { DataType: OpenSee.graphType, Units: OpenSee.IUnitCollection<{ current: number, isAuto: boolean }>}[]
    }
    

    interface IGraphstate {
        key: OpenSee.IGraphProps,
        data: OpenSee.iD3DataSeries[],
        loading: LoadingState,
        yLimits: IUnitCollection<IAxisSettings>,
        isZoomed: boolean,
        selectedIndixes: number[],
    }

    interface IUnitSetting {
        current: number,
        options?: Array<iUnitOptions>, 
        autoUnit: boolean
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
        EventId: number,
        NoCompress?: boolean
    }

    // Data For plots
    interface IDataState {
        startTime: number,
        endTime: number,
        Plots: OpenSee.IGraphstate[],
        fftLimits: [number, number],
        cycleLimit: [number, number],
    }

    type LoadingState = ('Idle' | 'Loading' | 'Partial' | 'Error' | 'Uninitiated');

    interface IOverlappingEventsStore {
        EventList: OverlappingEvents[],
        Loading: boolean
    }

    interface OverlappingEvents {
        Selected: boolean,
        AssetName: string,
        MeterName: string,
        EventID: number,
        StartTime: number,
        EndTime: number,
        EventType: string,
        Inception: number, 
        InceptionDate: string,
        DurationEndTime: number
    }

    interface PlotQuery {
        key: IGraphProps,
        yLimits: IUnitCollection<OpenSee.IAxisSettings>,
        isZoomed: boolean
    }
    interface Query {
        plots: PlotQuery[]
        Harmonic: number,
        LPFOrder: number,
        HPFOrder: number,
        Trc: number,
        CycleLimits: [number, number],
        FFTLimits: [number, number],
        FFTCycles: number,
        FFTStartTime: number,
        startTime: number,
        endTime: number,
        eventID: number,
        overlappingInfo: [number],
        singlePlot: boolean
    }

    interface IUnitCollection<T> {
        Voltage: T,
        Current: T,
        Angle: T,
        VoltageperSecond: T,
        CurrentperSecond: T,
        Freq: T,
        Impedance: T,
        PowerP: T,
        PowerQ: T,
        PowerS: T,
        PowerPf: T,
        TCE: T,
        Distance: T,
        Unbalance: T,
        THD: T,
    }

    interface IAxisSettings {
        isManual: boolean,
        dataLimits: [number, number],
        manualLimits: [number, number],
        zoomedLimits: [number, number],
        isAuto: boolean,
        current: number
    }

    interface IOverlayHandlers {
        Settings: (state: boolean) => void,
        AccumulatedPoints: (state: boolean) => void,
        PolarChart: (state: boolean) => void,
        ScalarStats: (state: boolean) => void,
        CorrelatedSags: (state: boolean) => void,
        Lightning: (state: boolean) => void,
        FFTTable: (state: boolean) => void,
        HarmonicStats: (state: boolean) => void,
    }

    type OverlayDrawers = 'Settings' | 'Info' | 'Tooltip' | 'Phasor' | 'PolarChart' | 'AccumulatedPoints' | 'ScalarStats' | 'CorrelatedSags' | 'Lightning' | 'FFTTable' | 'HarmonicStats'


    interface Drawers {
        Settings: boolean,
        AccumulatedPoints: boolean,
        PolarChart: boolean,
        ScalarStats: boolean,
        CorrelatedSags: boolean,
        Lightning: boolean,
        FFTTable: boolean,
        Info: boolean,
        Compare: boolean,
        Analytics: boolean,
        ToolTip: boolean,
        ToolTipDelta: boolean,
        HarmonicStats: boolean
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
        Frequency: number[],
        Asset: string,
        PhaseUnit: iUnitOptions,
        BaseValue: number,
    }

    interface BarSeries {
        unit: OpenSee.Unit,
        data: [number, number],
        color: OpenSee.Color,
        base: number,
        enabled: boolean
    }

    interface IPointCollection {
        Group: string,
        Name: string,
        Unit: iUnitOptions,
        Value: Array<[number, number]>,
        BaseValue: number,
        Color: Color
    }

}
