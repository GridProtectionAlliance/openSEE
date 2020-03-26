//******************************************************************************************************
//  OpenSEEController.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//  08/21/2019 - Christoph Lackner
//       Added Trip Coil Energization Functions
//  01/22/2020 - Christoph Lackner
//       Split Analytics in sepperate File
//
//******************************************************************************************************
using FaultData.DataAnalysis;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.NumericalAnalysis;
using GSF.Security;
using GSF.Web;
using GSF.Web.Model;
using MathNet.Numerics.IntegralTransforms;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Numerics;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace OpenSEE
{
    
    public partial class OpenSEEController
    {
        #region [ Members ]

        // Fields
      
        #endregion 

        #region[AnalyticFilterClasses]

        public class FFT
        {
            #region[constructor]

            public FFT(double samplingfreq, double[] data)
            {

                if (data.Count() == 0)
                {
                    this.m_freq = new double[0];
                    this.m_result = new Complex[0];
                    return;
                }
                this.m_freq = Fourier.FrequencyScale(data.Length, samplingfreq);

                this.m_result = data
                    .Select(sample => new Complex(sample, 0))
                    .ToArray();

                Fourier.Forward(this.m_result, FourierOptions.NoScaling);

                int dcIndex = 0;
                int nyquistIndex = this.m_result.Count() / 2;

                this.m_result = this.m_result.Select(number => number * 2.0D).ToArray();

                //adjust first and last bucket (residual and DC)
                this.m_result[dcIndex] = this.m_result[dcIndex] / 2.0D;
                this.m_result[nyquistIndex] = this.m_result[nyquistIndex] / 2.0D;
                this.m_result = this.m_result.Where((value, index) => this.m_freq[index] >= 0.0D).ToArray();

                //adjust frequency
                this.m_freq = this.m_freq.Where(number => number >= 0.0D).ToArray();
            }

            #endregion[constructor]

            #region[Properties]

            private Complex[] m_result;
            private double[] m_freq;

            public double[] Angle
            {
                get { return m_result.Select(number => number.Phase).ToArray(); }
            }
            public double[] Magnitude
            {
                get { return m_result.Select(number => number.Magnitude).ToArray(); }
            }

            public double[] Frequency
            {
                get { return m_freq; }
            }

            #endregion[Properties]
        }

        public class Filter
        {
            #region[Properties]
            private List<System.Numerics.Complex> ContinousPoles;
            private List<System.Numerics.Complex> ContinousZeros;
            private double Gain;

            private List<System.Numerics.Complex> DiscretePoles;
            private List<System.Numerics.Complex> DiscreteZeros;
            private double DiscreteGain;

            #endregion[Properties]

            #region[methods]

            public Filter(List<Complex> poles, List<Complex> zeros, double Gain)
            {
                this.ContinousPoles = poles;
                this.ContinousZeros = zeros;
                this.Gain = Gain;

                this.DiscretePoles = new List<Complex>();
                this.DiscreteZeros = new List<Complex>();
                this.DiscreteGain = 0;
            }

            private void ContinousToDiscrete(double fs, double fp=0 )
            {
                // prewarp
                double ws = 2* fs;
                if (fp > 0.0D)
                {
                    fp = 2.0D * Math.PI * fp;
                    ws = fp / Math.Tan(fp / fs / 2.0D);
                }

                //pole and zero Transormation
                Complex poleProd = 1.0D;
                Complex zeroProd = 1.0D;

                foreach (Complex p in this.ContinousPoles)
                {
                    this.DiscretePoles.Add((1.0D + p / ws)/ (1.0D - p / ws));
                    poleProd = poleProd * (ws - p);
                }
                foreach (Complex p in this.ContinousZeros)
                {
                    this.DiscreteZeros.Add((1.0D + p / ws) / (1.0D - p / ws));
                    zeroProd = zeroProd * (ws - p);
                }


                this.DiscreteGain = (this.Gain * zeroProd / poleProd).Real;

                if (this.DiscreteZeros.Count < this.DiscretePoles.Count)
                {
                    int n = this.DiscretePoles.Count - this.DiscreteZeros.Count;
                    for (int i = 0; i < n; i++)
                    {
                        this.DiscreteZeros.Add(-1.0D);
                    }
                }

            }

            public void Scale(double fc)
            {
                double wc = 2 * Math.PI * fc;

                this.ContinousPoles = this.ContinousPoles.Select(p => p * wc).ToList();
                this.ContinousZeros = this.ContinousZeros.Select(p => p * wc).ToList();

                if (this.ContinousZeros.Count < this.ContinousPoles.Count)
                {
                    int n = this.ContinousPoles.Count - this.ContinousZeros.Count;
                    this.Gain = Math.Pow(wc, (double)n) * this.Gain;
                }
            }

            public void LP2HP()
            {
                Complex k = 1;
                List<Complex> hPFPoles = new List<Complex>();
                List<Complex> hPFZeros = new List<Complex>();
                foreach (Complex p in this.ContinousPoles)
                {
                    k = k * (-1.0D / p);
                    hPFPoles.Add(1.0D / p);
                }

                foreach (Complex p in this.ContinousZeros)
                {
                    k = k * (-p);
                    hPFZeros.Add(1.0D / p);
                }

                if (this.ContinousZeros.Count < this.ContinousPoles.Count)
                {
                    int n = this.ContinousPoles.Count - this.ContinousZeros.Count;
                    for (int i = 0; i < n; i++)
                    {
                        hPFZeros.Add(0.0D);
                    }
                }

                this.ContinousPoles = hPFPoles;
                this.ContinousZeros = hPFZeros;
                this.DiscretePoles = new List<Complex>();
                this.DiscreteZeros = new List<Complex>();
            }

            private double[] PolesToPolynomial(Complex[] poles)
            {
                int n = poles.Count();
                double[] polynomial = new double[n + 1];

                switch (n)
                {
                    case (1):
                        polynomial[0] = 1;
                        polynomial[1] = (-poles[0]).Real;
                        break;
                    case (2):
                        polynomial[0] = 1;
                        polynomial[1] = (-(poles[0] + poles[1])).Real;
                        polynomial[2] = (poles[0] * poles[1]).Real;
                        break;
                    case (3):
                        polynomial[0] = 1;
                        polynomial[1] = (-(poles[0] + poles[1] + poles[2])).Real;
                        polynomial[2] = (poles[0] * poles[1] + poles[0] * poles[2] + poles[1] * poles[2]).Real;
                        polynomial[3] = (-poles[0] * poles[1] * poles[2]).Real;
                        break;

                }
                return polynomial;
            }

            public double[] filt(double[] signal, double fs)
            {
                int n = signal.Count();
                double[] output = new double[n];

                if (this.DiscretePoles.Count == 0)
                    this.ContinousToDiscrete(fs);

                double[] a = this.PolesToPolynomial(this.DiscretePoles.ToArray());
                double[] b = this.PolesToPolynomial(this.DiscreteZeros.ToArray());
                b = b.Select(z => z * this.DiscreteGain).ToArray();

                int order = a.Count() - 1;
                //setup first few points for computation
                for (int i = 0; i < order; i++)
                {
                    output[i] = signal[i];
                }

                //Forward Filtering
                for (int i = order; i < n; i++)
                {
                    output[i] = 0;
                    for (int j = 0; j < (order + 1); j++)
                    {
                        output[i] += signal[i - j] * b[j] - output[i - j] * a[j];
                    }
                    output[i] = output[i] / a[0];
                }
                return output;
            }

            private double[] reverserFilt(double[] signal)
            {
                int n = signal.Count();
                double[] output = new double[n];

                signal = signal.Reverse().ToArray();

                double[] a = this.PolesToPolynomial(this.DiscretePoles.ToArray());
                double[] b = this.PolesToPolynomial(this.DiscreteZeros.ToArray());
                b = b.Select(z => z * this.DiscreteGain).ToArray();

                int order = a.Count() - 1;
                //setup first few points for computation
                for (int i = 0; i < order; i++)
                {
                    output[i] = signal[i];
                }

                //Forward Filtering
                for (int i = order; i < n; i++)
                {
                    output[i] = 0;
                    for (int j = 0; j < (order + 1); j++)
                    {
                        output[i] += signal[i - j] * b[j] - output[i - j] * a[j];
                    }
                    output[i] = output[i] / a[0];
                }
                return output.Reverse().ToArray();
            }

            public double[] filtfilt(double[] signal, double fs)
            {
                double[] forward = filt(signal, fs);
                return reverserFilt(forward);
            }

            #endregion[methods]
            #region[static]

            public static Filter LPButterworth(double fc, int order)
            {
                Filter result = NormalButter(order);
                result.Scale(fc);

                return result;

            }

            private static Filter NormalButter(int order)
            {
                List<Complex> zeros = new List<Complex>();
                List<Complex> poles = new List<Complex>();

                //Generate poles
                for (int i = 1; i < order; i++)
                {
                    double theta = Math.PI * (2 * i - 1.0D) / (2.0D * i) + Math.PI / 2.0D;
                    double re = Math.Cos(theta);
                    double im = Math.Sin(theta);
                    if (i % 2 == 0)
                    {
                        poles.Add(new Complex(re, im));
                    }
                    else
                    {
                        poles.Add(new Complex(re, -im));
                    }
                }

                if (order % 2 == 1)
                {
                    poles.Add(new Complex(-1.0D, 0.0D));
                }
                else
                {
                    poles.Add(new Complex(1.0D, 0.0D));
                }

                Complex Gain = -poles[0];
                for (int i = 1; i < order; i++)
                {
                    Gain = Gain * -poles[i];
                }

                //scale to fit new filter
                Filter result = new Filter(poles, zeros, Gain.Real);
                return result;
            }

            public static Filter HPButterworth(double fc, int order)
            {
                Filter result = NormalButter( order);
                result.LP2HP();
                result.Scale(fc);
                return result;
            }
            #endregion[static]


        }

        #endregion[AnalyticFilterClasses]        
       
        #region [ Methods ]

        #region [ Fault Location Data ]
        [Route("GetFaultDistanceData"),HttpGet]
        public JsonReturn GetFaultDistanceData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                Dictionary<string, string> query = Request.QueryParameters();

                int eventId = int.Parse(query["eventId"]);
                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection(connection.Connection, typeof(SqlDataAdapter), false);

                DataTable table;
                
                table = connection.RetrieveData("SELECT ID FROM FaultCurve WHERE EventID = {0}", evt.ID);
                List<D3Series> returnList = new List<D3Series>();

                foreach (DataRow row in table.Rows)
                {
                    D3Series temp = QueryFaultDistanceData(int.Parse(row["ID"].ToString()), meter);

                    returnList.Add(temp);
                }

                
                JsonReturn returnDict = new JsonReturn();
                returnDict.Data = returnList;


                return returnDict;
            }


        }

        private D3Series QueryFaultDistanceData(int faultCurveID, Meter meter)
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                FaultCurve faultCurve = new TableOperations<FaultCurve>(connection).QueryRecordWhere("ID = {0}", faultCurveID);
                DataGroup dataGroup = new DataGroup();
                dataGroup.FromData(meter, new List<byte[]>(1) { faultCurve.Data });
                D3Series flotSeries = new D3Series()
                {

                    ChannelID = 0,
                    ChartLabel = faultCurve.Algorithm,
                    XaxisLabel = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'LengthUnits'"),
                    Color = GetFaultDistanceColort(faultCurve.Algorithm),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = dataGroup.DataSeries[0].DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList()
                };

                return flotSeries;

            }

        }

        private string GetFaultDistanceColort(string algorithm)
        {
            string random = string.Format("#{0:X6}", m_random.Next(0x1000001));
            switch (algorithm)
            {
                case ("Simple"):
                    return "#edc240";
                case ("Reactance"):
                    return "#afd8f8";
                case ("Takagi"):
                    return "#cb4b4b";
                case ("ModifiedTakagi"):
                    return "#4da74d";
                case ("Novosel"):
                    return "#9440ed";
                case ("DoubleEnded"):
                    return "#BD9B33";
                default: 
                    return random;
            }
        }
        #endregion


        #region [ FFT ]
        [Route("GetFFTData"),HttpGet]
        public Task<JsonReturn> GetFFTData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    int cycles = query.ContainsKey("cycles") ? int.Parse(query["cycles"]): 1;

                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    
                    double startTime = query.ContainsKey("startDate") ? double.Parse(query["startDate"]) : evt.StartTime.Subtract(m_epoch).TotalMilliseconds;

                    DataGroup dataGroup = QueryDataGroup(eventId, meter);

                    List<D3Series> returnList = GetFFTLookup(dataGroup, startTime, cycles);

                    if (returnList.Count == 0) return null;

                    
                    JsonReturn returnDict = new JsonReturn();

                    returnDict.Data = returnList;


                    return returnDict;
                }

            }, cancellationToken);
        }

        private List<D3Series> GetFFTLookup(DataGroup dataGroup, double startTime, int cycles)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            double systemFrequency;

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            List<DataSeries> vAN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            if (vAN.Count() != 0)
            {
                vAN.ForEach( item => { GenerateFFT(dataLookup, systemFrequency, item, "VAN", startTime, cycles); });
            }
            if (vBN.Count() != 0)
            {
                vBN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "VBN", startTime, cycles); });
            }
            if (vCN.Count() != 0)
            {
                vCN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "VCN", startTime, cycles); });

            }
            if (iAN.Count() != 0) 
            {
                iAN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "IAN", startTime, cycles); }); 
            }
            if (iBN.Count() != 0) 
            {
                iBN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "IBN", startTime, cycles); });
            }
            if (iCN.Count() != 0) 
            {
                iCN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "ICN", startTime, cycles); });
            }

            return dataLookup;
        }

        private void GenerateFFT(List<D3Series> dataLookup, double systemFrequency, DataSeries dataSeries, string label, double startTime, int cycles)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);
            var groupedByCycle = dataSeries.DataPoints.Select((Point, Index) => new { Point, Index }).GroupBy((Point) => Point.Index / (samplesPerCycle*cycles)).Select((grouping) => grouping.Select((obj) => obj.Point));

            List<DataPoint> cycleData = dataSeries.DataPoints.SkipWhile(point => point.Time.Subtract(m_epoch).TotalMilliseconds < startTime).Take((samplesPerCycle * cycles)).ToList();
            D3Series fftMag = new D3Series()
            {
                ChannelID = dataSeries.SeriesInfo.ChannelID,
                ChartLabel = $"{label} FFT Mag",
                XaxisLabel = "",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                LegendClass = "Mag",
                SecondaryLegendClass = (label.IndexOf("V") > -1)? "V": "I",
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataPoints = new List<double[]>()
            };

            D3Series fftAng = new D3Series()
            {
                ChannelID = dataSeries.SeriesInfo.ChannelID,
                ChartLabel = $"{label} FFT Ang",
                XaxisLabel = "",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                LegendClass = "Ang",
                SecondaryLegendClass = (label.IndexOf("V") > -1) ? "V" : "I",
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataPoints = new List<double[]>()
            };

            if (cycleData.Count() != (samplesPerCycle * cycles)) return;
            double[] points = cycleData.Select(point => point.Value / (samplesPerCycle * cycles)).ToArray();

            FFT fft = new FFT(systemFrequency * (samplesPerCycle), points);

            fftMag.DataPoints = fft.Magnitude.Select((value, index) => new double[] { index, (value / Math.Sqrt(2)) }).ToList();
            fftAng.DataPoints = fft.Angle.Select((value, index) => new double[] {index, (value * 180.0D / Math.PI)}).ToList();

            dataLookup.Add(fftMag);
            dataLookup.Add(fftAng);

        }
        #endregion

        #region [ First Derivative ]
        [Route("GetFirstDerivativeData"),HttpGet]
        public Task<JsonReturn> GetFirstDerivativeData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                   
                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}",  evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventId, meter);
                        VICycleDataGroup viCycleDataGroup = QueryVICycleDataGroup(eventID, meter);
                        returnList = returnList.Concat(Analytics.GetFirstDerivativeLookup(dataGroup, viCycleDataGroup)).ToList();
                      
                    }
                    
                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

     
        #endregion

        #region [ Impedance ]
        [Route("GetImpedanceData"),HttpGet]
        public Task<JsonReturn> GetImpedanceData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    VICycleDataGroup viCycleDataGroup = QueryVICycleDataGroup(evt.ID, meter);
                    List<D3Series> returnList = Analytics.GetImpedanceLookup(viCycleDataGroup);
                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList; 

                    return returnDict;


                }

            }, cancellationToken);
        }


        #endregion

        #region [ Remove Current ]
        [Route("GetRemoveCurrentData"),HttpGet]
        public Task<JsonReturn> GetRemoveCurrentData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    DataGroup dataGroup = QueryDataGroup(evt.ID, meter);
                    List<D3Series> returnList = Analytics.GetRemoveCurrentLookup(dataGroup);
                    
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);

        }

        #endregion

        #region [ Power ]
        [Route("GetPowerData"),HttpGet]
        public Task<JsonReturn> GetPowerData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    VICycleDataGroup vICycleDataGroup = QueryVICycleDataGroup(evt.ID, meter);
                    List<D3Series> returnList = Analytics.GetPowerLookup(vICycleDataGroup);
                   
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        #endregion

        #region [ Missing Voltage ]
        [Route("GetMissingVoltageData"),HttpGet]
        public Task<JsonReturn> GetMissingVoltageData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    DataGroup dataGroup = QueryDataGroup(evt.ID, meter);

                    List<D3Series> returnList = Analytics.GetMissingVoltageLookup(dataGroup);
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        #endregion

        #region [ Clipped Waveforms ]
        [Route("GetClippedWaveformsData"),HttpGet]
        public Task<JsonReturn> GetClippedWaveformsData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                  
                    DataGroup dataGroup = QueryDataGroup(evt.ID, meter);
                    List<D3Series> returnList = Analytics.GetClippedWaveformsLookup(dataGroup);
                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

      
        #endregion

        #region [ Harmonic Spectrum ]
        [Route("GetHarmonicSpectrumData"),HttpGet]
        public Task<JsonReturn> GetHarmonicSpectrumData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    int cycles = int.Parse(query["cycles"]);

                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;


                    double startTime = query.ContainsKey("startDate") ? double.Parse(query["startDate"]) : evt.StartTime.Subtract(m_epoch).TotalMilliseconds;
                    double endTime = query.ContainsKey("endDate") ? double.Parse(query["endDate"]) : startTime + 16.666667*cycles;
                    DataGroup dataGroup = QueryDataGroup(eventId, meter);

                    List<D3Series> returnList = GetHarmonicSpectrumLookup(dataGroup, startTime, endTime, systemFrequency, cycles);
                    if (returnList.Count == 0) return null;

                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;
                    return returnDict;
                }

            }, cancellationToken);
        }

        private List<D3Series> GetHarmonicSpectrumLookup(DataGroup dataGroup, double startTime, double endTime, double systemFrequency, int cycles)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            DataSeries vAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries iAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries vBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries iBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries vCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");
            DataSeries iCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");

            if (vAN != null) GenerateHarmonicSpectrum(dataLookup, systemFrequency, vAN, "VAN", startTime, endTime, cycles);
            if (vBN != null) GenerateHarmonicSpectrum(dataLookup, systemFrequency, vBN, "VBN", startTime, endTime, cycles);
            if (vCN != null) GenerateHarmonicSpectrum(dataLookup, systemFrequency, vCN, "VCN", startTime, endTime, cycles);
            if (iAN != null) GenerateHarmonicSpectrum(dataLookup, systemFrequency, iAN, "IAN", startTime, endTime, cycles);
            if (iBN != null) GenerateHarmonicSpectrum(dataLookup, systemFrequency, iBN, "IBN", startTime, endTime, cycles);
            if (iCN != null) GenerateHarmonicSpectrum(dataLookup, systemFrequency, iCN, "ICN", startTime, endTime, cycles);

            return dataLookup;
        }

        private void GenerateHarmonicSpectrum(List<D3Series> dataLookup, double systemFrequency, DataSeries dataSeries, string label, double startTime, double endTime, int cycles)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);

            List<DataPoint> cycleData = dataSeries.DataPoints.SkipWhile(point => point.Time.Subtract(m_epoch).TotalMilliseconds < startTime).Take(samplesPerCycle*cycles).ToList();
            D3Series fftMag = new D3Series()
            {
                ChannelID = dataSeries.SeriesInfo.ChannelID,
                ChartLabel = $"{label} DFT Mag",
                XaxisLabel = "",
                Color = GetColor(null),
                LegendClass = "",
                SecondaryLegendClass = "Mag",
                LegendGroup = "",
                DataPoints = new List<double[]>()
            };

            D3Series fftAng = new D3Series()
            {
                ChannelID = dataSeries.SeriesInfo.ChannelID,
                ChartLabel = $"{label} DFT Ang",
                XaxisLabel = "",
                Color = GetColor(null),
                LegendClass = "",
                SecondaryLegendClass = "Ang",
                LegendGroup = "",
                DataPoints = new List<double[]>()
            };

            if (cycleData.Count() != samplesPerCycle * cycles) return;
            double[] points = cycleData.Select(point => point.Value / samplesPerCycle).ToArray();

            FFT fft = new FFT(systemFrequency * samplesPerCycle, points);

            fftMag.DataPoints = fft.Magnitude.Select((value, index) => new double[] { fft.Frequency[index], (value / cycles) / Math.Sqrt(2) }).ToList();
            fftAng.DataPoints = fft.Angle.Select((value, index) => new double[] { fft.Frequency[index], value * 180 / Math.PI }).ToList();
           
            dataLookup.Add( fftMag);
            dataLookup.Add( fftAng);

        }
        #endregion


        #region [ LowPassFilter ]
        [Route("GetLowPassFilterData"),HttpGet]
        public Task<JsonReturn> GetLowPassFilterData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();

                    int filterOrder = int.Parse(query["filter"]);
                    int eventId = int.Parse(query["eventId"]);

                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    DataGroup dataGroup = QueryDataGroup(evt.ID, meter);
                    List<D3Series> returnList = Analytics.GetLowPassFilterLookup(dataGroup, filterOrder);

                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        #endregion

         #region [ High Pass Filter ]
        [Route("GetHighPassFilterData"),HttpGet]
        public Task<JsonReturn> GetHighPassFilterData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int filterOrder = int.Parse(query["filter"]);
                    int eventId = int.Parse(query["eventId"]);

                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    DataGroup dataGroup = QueryDataGroup(evt.ID, meter);

                    List<D3Series> returnList = Analytics.GetHighPassFilterLookup(dataGroup, filterOrder);
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        #endregion

        #region [ Overlapping Waveform ]
        [Route("GetOverlappingWaveformData"),HttpGet]
        public Task<OverlapReturn> GetOverlappingWaveformData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    int calcCycle = connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
                    double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;


                    DateTime startTime = (query.ContainsKey("startDate") ? DateTime.Parse(query["startDate"]) : evt.StartTime);
                    DateTime endTime = (query.ContainsKey("endDate") ? DateTime.Parse(query["endDate"]) : evt.EndTime);

                    DataTable table;

                    Dictionary<string, OverlapSeries> dict = new Dictionary<string, OverlapSeries>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2} AND LineID = {3}", ToDateTime2(connection, endTime), ToDateTime2(connection, startTime), evt.MeterID, evt.AssetID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);
                        Dictionary<string, OverlapSeries> temp = GetOverlappingWaveformLookup(dataGroup);

                        foreach (string key in temp.Keys)
                        {
                            if (dict.ContainsKey(key))
                                dict[key].DataPoints = dict[key].DataPoints.Concat(temp[key].DataPoints).ToList();
                            else
                                dict.Add(key, temp[key]);
                        }
                    }
                    if (dict.Count == 0) return null;


                    List<OverlapSeries> returnList = new List<OverlapSeries>();
                    foreach (string key in dict.Keys)
                    {
                        OverlapSeries series = new OverlapSeries();
                        series = dict[key];
                        series.DataPoints = dict[key].DataPoints;
                        returnList.Add(series);
                    }
                    OverlapReturn returnDict = new OverlapReturn();
                    returnDict.StartDate = evt.StartTime;
                    returnDict.EndDate = evt.EndTime;
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        private Dictionary<string, OverlapSeries> GetOverlappingWaveformLookup(DataGroup dataGroup)
        {
            double systemFrequency;

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            Dictionary<string, OverlapSeries> dataLookup = new Dictionary<string, OverlapSeries>();

            DataSeries vAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries iAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries vBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries iBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries vCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");
            DataSeries iCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");

            if (vAN != null) GenerateOverlappingWaveform(dataLookup, vAN, "VAN", systemFrequency);
            if (vBN != null) GenerateOverlappingWaveform(dataLookup, vBN, "VBN", systemFrequency);
            if (vCN != null) GenerateOverlappingWaveform(dataLookup, vCN, "VCN", systemFrequency);
            if (iAN != null) GenerateOverlappingWaveform(dataLookup, iAN, "IAN", systemFrequency);
            if (iBN != null) GenerateOverlappingWaveform(dataLookup, iBN, "IBN", systemFrequency);
            if (iCN != null) GenerateOverlappingWaveform(dataLookup, iCN, "ICN", systemFrequency);

            return dataLookup;
        }

        private void GenerateOverlappingWaveform(Dictionary<string, OverlapSeries> dataLookup, DataSeries dataSeries, string label, double systemFrequency)
        {

            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);
            var cycles = dataSeries.DataPoints.Select((Point, Index) => new { Point, SampleIndex = Index % samplesPerCycle, GroupIndex = Index / samplesPerCycle }).GroupBy(point => point.GroupIndex);
            OverlapSeries series = new OverlapSeries()
            {
                ChartLabel = label + " Overlapping",
                DataPoints = new List<double?[]>()
            };

            foreach(var cycle in cycles)
            {
                series.DataPoints = series.DataPoints.Concat(cycle.Select(dataPoint => new double?[] { dataPoint.SampleIndex, dataPoint.Point.Value }).ToList()).ToList();
                series.DataPoints = series.DataPoints.Concat(new List<double?[]> { new double?[] { null, null } }).ToList();

            }

            dataLookup.Add(series.ChartLabel, series);
        }

        public class OverlapSeries{
            public string ChartLabel;
            public List<double?[]> DataPoints;
        }

        public class OverlapReturn
        {
            public DateTime StartDate;
            public DateTime EndDate;
            public List<OverlapSeries> Data;
        }

        #endregion


        #region [ Rapid Voltage Change ]
        [Route("GetRapidVoltageChangeData"),HttpGet]
        public Task<JsonReturn> GetRapidVoltageChangeData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    int calcCycle = connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
                    double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;


                    DateTime startTime = evt.StartTime;
                    DateTime endTime = evt.EndTime;
                    int pixels = int.Parse(query["pixels"]);
                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        VICycleDataGroup vICycleDataGroup = QueryVICycleDataGroup(eventID, meter);
                        returnList = returnList.Concat(GetRapidVoltageChangeLookup(vICycleDataGroup)).ToList();
                        
                    }
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetRapidVoltageChangeLookup(VICycleDataGroup vICycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            foreach(CycleDataGroup dg in vICycleDataGroup.CycleDataGroups)
            {
                if (dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage")
                {
                    string name = ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I") + dg.RMS.SeriesInfo.Channel.Phase.Name;
                    dataLookup.Add(GetRapidVoltageChangeFlotSeries(dg.RMS, name));
                }
            }

            return dataLookup;
        }

        private D3Series GetRapidVoltageChangeFlotSeries(DataSeries dataSeries, string label) {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                double nominalVoltage = connection.ExecuteScalar<double?>("SELECT VoltageKV * 1000 FROM Line WHERE ID = {0}", dataSeries.SeriesInfo.Channel.AssetID) ?? 1;

                double lastY = 0;
                double lastX = 0;
                D3Series flotSeries = new D3Series()
                {
                    ChartLabel = label + " Rapid Voltage Change",
                    DataPoints = dataSeries.DataPoints.Select((point, index) => {
                        double x = point.Time.Subtract(m_epoch).TotalMilliseconds;
                        double y = point.Value;

                        if (index == 0)
                        {
                            lastY = y;
                        }

                        double[] arr =  new double[] { x, (y - lastY) * 100 / nominalVoltage };

                        lastY = y;
                        lastX = x;
                        return arr;
                    }).ToList()
                };

                return flotSeries;
            }

        }
        #endregion

        #region [ Frequency ]
        [Route("GetFrequencyData"),HttpGet]
        public Task<JsonReturn> GetFrequencyData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");


                    DataGroup dataGroup = QueryDataGroup(evt.ID, meter);
                    

                    List<D3Series> returnList = Analytics.GetFrequencyLookup(new VIDataGroup(dataGroup));

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        
        #endregion

        #region [ Symmetrical Components  ]
        [Route("GetSymmetricalComponentsData"),HttpGet]
        public Task<JsonReturn> GetSymmetricalComponentsData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    VICycleDataGroup vICycleDataGroup = QueryVICycleDataGroup(evt.ID, meter);

                    List<D3Series> returnList = Analytics.GetSymmetricalComponentsLookup(vICycleDataGroup);
                   

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;


                    return returnDict;


                }

            }, cancellationToken);
        }

        #endregion

        #region [ Unbalance ]
        [Route("GetUnbalanceData"),HttpGet]
        public Task<JsonReturn> GetUnbalanceData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    VICycleDataGroup vICycleDataGroup = QueryVICycleDataGroup(evt.ID, meter);
                    List<D3Series> returnList = Analytics.GetUnbalanceLookup(vICycleDataGroup);
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }


        #endregion

        #region [ Rectifier ]
        [Route("GetRectifierData"),HttpGet]
        public Task<JsonReturn> GetRectifierData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    double TRC = double.Parse(query["Trc"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    int calcCycle = connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
                    double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;


                    DateTime startTime =  evt.StartTime;
                    DateTime endTime = evt.EndTime;
                 
                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);

                        returnList = returnList.Concat(GetRectifierLookup(dataGroup, systemFrequency, TRC)).ToList();
                       
                    }
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;


                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetRectifierLookup(DataGroup dataGroup, double systemFrequency, double RC)
        {
            List<D3Series> dataLookup = new List<D3Series>();
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataGroup.DataSeries.First(), systemFrequency);

            var vAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").DataPoints.ToList();
            var vBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").DataPoints.ToList();
            var vCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").DataPoints.ToList();
            var iAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").DataPoints.ToList();
            var iBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").DataPoints.ToList();
            var iCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").DataPoints.ToList();


            if (vAN != null && vBN != null && vCN != null)
            {


                IEnumerable<DataPoint> phaseMaxes = vAN.Select((point, index) => new DataPoint() { Time = point.Time, Value = new double[] { Math.Abs(vAN[index].Value), Math.Abs(vBN[index].Value), Math.Abs(vCN[index].Value) }.Max() });

                // Run Through RC Filter
                if (RC > 0)
                {
                    double wc = 2.0D * Math.PI * 1.0D / (RC / 1000.0D);
                    Filter filt = new Filter(new List<Complex>(){-wc}, new List<Complex>(), wc);

                    phaseMaxes = phaseMaxes.OrderBy(item => item.Time);
                    double[] points = phaseMaxes.Select(item => item.Value).ToArray();

                    double[] filtered = filt.filt(points, samplesPerCycle* systemFrequency);

                    phaseMaxes = phaseMaxes.Select((point, index) => new DataPoint() { Time = point.Time, Value = filtered[index] });
                }

                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    ChartLabel = "Voltage Rectifier",
                    XaxisLabel = "V",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "V",
                    LegendGroup = "",
                    DataPoints = phaseMaxes.Select(point  => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                    });

            }


            if (iAN != null && iBN != null && iCN != null)
            {
                IEnumerable<DataPoint> phaseMaxes = iAN.Select((point, index) => new DataPoint() { Time = point.Time, Value = new double[] { Math.Abs(iAN[index].Value), Math.Abs(iBN[index].Value), Math.Abs(iCN[index].Value) }.Max() });
                //IEnumerable<DataPoint> cycleMaxes = phaseMaxes.Select((point, index) => new { Point = point, Index = index }).GroupBy(obj => obj.Index / samplesPerCycle).SelectMany(grouping => grouping.Select(point => new DataPoint() { Time = point.Point.Time, Value = grouping.Select(p => p.Point.Value).Max() }));


                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    ChartLabel = "Current Rectifier",
                    XaxisLabel = "A",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "I",
                    LegendGroup = "",
                    DataPoints = phaseMaxes.Select(point => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });

            }



            return dataLookup;
        }
        #endregion

        #region [ THD ]
        [Route("GetTHDData"),HttpGet]
        public Task<JsonReturn> GetTHDData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    int calcCycle = connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
                    double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;


                    DateTime startTime =  evt.StartTime;
                    DateTime endTime = evt.EndTime;

                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0} ", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);
                        returnList = returnList.Concat(GetTHDLookup(dataGroup)).ToList();

                    }
                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        private List<D3Series> GetTHDLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            double systemFrequency;

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            DataSeries vAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries iAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries vBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries iBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries vCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");
            DataSeries iCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");

            if (vAN != null) dataLookup.Add(GenerateTHD(systemFrequency, vAN, "VAN"));
            if (vBN != null) dataLookup.Add(GenerateTHD(systemFrequency, vBN, "VBN"));
            if (vCN != null) dataLookup.Add(GenerateTHD(systemFrequency, vCN, "VCN"));
            if (iAN != null) dataLookup.Add(GenerateTHD(systemFrequency, iAN, "IAN"));
            if (iBN != null) dataLookup.Add(GenerateTHD(systemFrequency, iBN, "IBN"));
            if (iCN != null) dataLookup.Add(GenerateTHD(systemFrequency, iCN, "ICN"));

            return dataLookup;
        }

        private D3Series GenerateTHD(double systemFrequency, DataSeries dataSeries, string label)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);
            //var groupedByCycle = dataSeries.DataPoints.Select((Point, Index) => new { Point, Index }).GroupBy((Point) => Point.Index / samplesPerCycle).Select((grouping) => grouping.Select((obj) => obj.Point));

            D3Series thd = new D3Series()
            {
                ChannelID = 0,
                XaxisLabel = GetUnits(dataSeries.SeriesInfo.Channel),
                Color = GetColor(null),
                LegendClass = "",
                SecondaryLegendClass = "",
                LegendGroup = "",
                ChartLabel = label + " THD",
                DataPoints = new List<double[]>()
            };

            double[][] dataArr = new double[(dataSeries.DataPoints.Count - samplesPerCycle)][];
            for (int i= 0; i < dataSeries.DataPoints.Count - samplesPerCycle; i++)
            //Parallel.For(0, dataSeries.DataPoints.Count - samplesPerCycle, i =>
            {

                double[] points = dataSeries.DataPoints.Skip(i).Take(samplesPerCycle).Select(point => point.Value / samplesPerCycle).ToArray();
                FFT fft = new FFT(systemFrequency * samplesPerCycle, points);


                double rmsHarmSum = fft.Magnitude.Where((value,index) => index != 1).Select(value => Math.Pow(value, 2)).Sum();
                double rmsHarm = fft.Magnitude[1];
                double thdValue = 100 * Math.Sqrt(rmsHarmSum) / rmsHarm;

                dataArr[i] = new double[] { dataSeries.DataPoints[i].Time.Subtract(m_epoch).TotalMilliseconds, thdValue };
            }//);

            thd.DataPoints = dataArr.ToList();
            return thd;
        }

        #endregion

        #region [ Specified Harmonic ]
        [Route("GetSpecifiedHarmonicData"),HttpGet]
        public Task<JsonReturn> GetSpecifiedHarmonicData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    int specifiedHarmonic = int.Parse(query["specifiedHarmonic"]);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    int calcCycle = connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
                    double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;


                    DateTime startTime = evt.StartTime;
                    DateTime endTime = evt.EndTime;
                    
                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);

                        returnList = returnList.Concat(GetSpecifiedHarmonicLookup(dataGroup, specifiedHarmonic)).ToList();
                        
                    }
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;


                    return returnDict;
                }

            }, cancellationToken);
        }

        private List<D3Series> GetSpecifiedHarmonicLookup(DataGroup dataGroup, int specifiedHarmonic)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            double systemFrequency;

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            DataSeries vAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries iAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries vBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries iBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries vCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");
            DataSeries iCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");

            if (vAN != null) GenerateSpecifiedHarmonic(dataLookup, systemFrequency, vAN, "VAN", specifiedHarmonic);
            if (vBN != null) GenerateSpecifiedHarmonic(dataLookup, systemFrequency, vBN, "VBN", specifiedHarmonic);
            if (vCN != null) GenerateSpecifiedHarmonic(dataLookup, systemFrequency, vCN, "VCN", specifiedHarmonic);
            if (iAN != null) GenerateSpecifiedHarmonic(dataLookup, systemFrequency, iAN, "IAN", specifiedHarmonic);
            if (iBN != null) GenerateSpecifiedHarmonic(dataLookup, systemFrequency, iBN, "IBN", specifiedHarmonic);
            if (iCN != null) GenerateSpecifiedHarmonic(dataLookup, systemFrequency, iCN, "ICN", specifiedHarmonic);

            return dataLookup;
        }

        private void GenerateSpecifiedHarmonic(List<D3Series> dataLookup, double systemFrequency, DataSeries dataSeries, string label, int specifiedHarmonic)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);
            //var groupedByCycle = dataSeries.DataPoints.Select((Point, Index) => new { Point, Index }).GroupBy((Point) => Point.Index / samplesPerCycle).Select((grouping) => grouping.Select((obj) => obj.Point));

            D3Series SpecifiedHarmonicMag = new D3Series()
            {
                ChannelID = 0,
                XaxisLabel = GetUnits(dataSeries.SeriesInfo.Channel),
                Color = GetColor(null),
                LegendClass = "",
                SecondaryLegendClass = "Phase",
                LegendGroup = "",
                ChartLabel = label + $"Harmonic [{specifiedHarmonic}] Mag",
                DataPoints = new List<double[]>()
            };

            D3Series SpecifiedHarmonicAng = new D3Series()
            {
                ChannelID = 0,
                XaxisLabel = "deg",
                Color = GetColor(null),
                LegendClass = "",
                SecondaryLegendClass = "Phase",
                LegendGroup = "",

                ChartLabel = label + $"Harmonic [{specifiedHarmonic}] Ang",
                DataPoints = new List<double[]>()
            };

            double[][] dataArrHarm = new double[(dataSeries.DataPoints.Count - samplesPerCycle)][];
            double[][] dataArrAngle = new double[(dataSeries.DataPoints.Count - samplesPerCycle)][];

            Parallel.For(0, dataSeries.DataPoints.Count - samplesPerCycle, i =>
            {
                double[] points = dataSeries.DataPoints.Skip(i).Take(samplesPerCycle).Select(point => point.Value / samplesPerCycle).ToArray();
                double specifiedFrequency = systemFrequency * specifiedHarmonic;

                FFT fft = new FFT(systemFrequency * samplesPerCycle, points);

                int index = Array.FindIndex(fft.Frequency ,value => Math.Round(value) == specifiedFrequency);

                dataArrHarm[i] = new double[] { dataSeries.DataPoints[i].Time.Subtract(m_epoch).TotalMilliseconds, fft.Magnitude[index] / Math.Sqrt(2) };
                dataArrAngle[i] = new double[] { dataSeries.DataPoints[i].Time.Subtract(m_epoch).TotalMilliseconds, fft.Angle[index] * 180 / Math.PI };

            });

            SpecifiedHarmonicMag.DataPoints = dataArrHarm.ToList();
            SpecifiedHarmonicAng.DataPoints = dataArrAngle.ToList();

            dataLookup.Add(SpecifiedHarmonicMag);
            dataLookup.Add(SpecifiedHarmonicAng);
        }

        #endregion

        
        #endregion


    }
}