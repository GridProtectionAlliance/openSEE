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
                    int cycles = int.Parse(query["cycles"]);

                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    
                    double startTime = query.ContainsKey("startDate") ? double.Parse(query["startDate"]) : evt.StartTime.Subtract(m_epoch).TotalMilliseconds;
                    double endTime = query.ContainsKey("endDate") ? double.Parse(query["endDate"]) : startTime + 16.666667*cycles;
                    DataGroup dataGroup = QueryDataGroup(eventId, meter);

                    List<D3Series> returnList = GetFFTLookup(dataGroup, startTime, endTime);

                    if (returnList.Count == 0) return null;

                    
                    JsonReturn returnDict = new JsonReturn();

                    returnDict.Data = returnList;


                    return returnDict;
                }

            }, cancellationToken);
        }

        private List<D3Series> GetFFTLookup(DataGroup dataGroup, double startTime, double endTime)
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
                vAN.ForEach( item => { GenerateFFT(dataLookup, systemFrequency, item, "VAN", startTime, endTime); });
            }
            if (vBN.Count() != 0)
            {
                vBN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "VBN", startTime, endTime); });
            }
            if (vCN.Count() != 0)
            {
                vCN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "VCN", startTime, endTime); });

            }
            if (iAN.Count() != 0) 
            {
                iAN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "IAN", startTime, endTime); }); 
            }
            if (iBN.Count() != 0) 
            {
                iBN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "IBN", startTime, endTime); });
            }
            if (iCN.Count() != 0) 
            {
                iCN.ForEach(item => { GenerateFFT(dataLookup, systemFrequency, item, "ICN", startTime, endTime); });
            }

            return dataLookup;
        }

        private void GenerateFFT(List<D3Series> dataLookup, double systemFrequency, DataSeries dataSeries, string label, double startTime, double endTime)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);
            var groupedByCycle = dataSeries.DataPoints.Select((Point, Index) => new { Point, Index }).GroupBy((Point) => Point.Index / samplesPerCycle).Select((grouping) => grouping.Select((obj) => obj.Point));

            List<DataPoint> cycleData = dataSeries.DataPoints.SkipWhile(point => point.Time.Subtract(m_epoch).TotalMilliseconds < startTime).Take(samplesPerCycle).ToList();
            D3Series fftMag = new D3Series()
            {
                ChannelID = dataSeries.SeriesInfo.ChannelID,
                ChartLabel = $"{label} FFT Mag",
                XaxisLabel = "",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                LegendClass = "Mag",
                SecondaryLegendClass = (label.IndexOf("V") > -1)? "V": "I",
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetKey,
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
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetKey,
                DataPoints = new List<double[]>()
            };

            if (cycleData.Count() != samplesPerCycle) return;
            double[] points = cycleData.Select(point => point.Value / samplesPerCycle).ToArray();

            FFT fft = new FFT(systemFrequency * samplesPerCycle, points);

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
                        returnList = returnList.Concat(GetFirstDerivativeLookup(dataGroup, viCycleDataGroup)).ToList();
                      
                    }
                    
                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        private List<D3Series> GetFirstDerivativeLookup(DataGroup dataGroup, VICycleDataGroup viCycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            //deal with the followinf Phases
            List<string> phases = new List<string> { "AN","BN","CN" };

            foreach(DataSeries ds in dataGroup.DataSeries)
            {
                if (((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") || (ds.SeriesInfo.Channel.MeasurementType.Name == "Current"))
                    && (ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous") && (phases.Contains(ds.SeriesInfo.Channel.Phase.Name)))
                {
                    string name = ((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I") + ds.SeriesInfo.Channel.Phase.Name;
                    string category = ((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I");

                    dataLookup.Add(GetFirstDerivativeFlotSeries(ds, name, category, "W"));
                }
            }

            foreach (CycleDataGroup dg in viCycleDataGroup.CycleDataGroups)
            {
                if ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") && (dg.RMS.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                    && (phases.Contains(dg.RMS.SeriesInfo.Channel.Phase.Name)))
                {
                    string name = ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I") + dg.RMS.SeriesInfo.Channel.Phase.Name + " RMS";
                    string category = ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I");

                    dataLookup.Add(GetFirstDerivativeFlotSeries(dg.RMS, name, category, "RMS"));
                }
            }

            return dataLookup;
        }

        private D3Series GetFirstDerivativeFlotSeries(DataSeries dataSeries, string label, string legenclass, string type)
        {
            double lastX = 0;
            double lastY = 0;

            D3Series D3Series = new D3Series()
            {
                ChannelID = dataSeries.SeriesInfo.Channel.ID,
                XaxisLabel = GetUnits(dataSeries.SeriesInfo.Channel) + "/s",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                LegendClass = legenclass,
                SecondaryLegendClass = type,
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                ChartLabel = label + " First Derivative",
                DataPoints = dataSeries.DataPoints.Select((point, index) => {
                    double x = point.Time.Subtract(m_epoch).TotalMilliseconds;
                    double y = point.Value;

                    if (index == 0)
                    {
                        lastX = x;
                        lastY = y;
                    }

                    double[] arr = new double[] { x, (y - lastY) / ((x - lastX)) };

                    lastY = y;
                    lastX = x;


                    return arr;
                }).ToList()
            };

            D3Series.DataPoints = D3Series.DataPoints.Select(item => new double[] {item[0], item[1]*1000.0D}).ToList();
            return D3Series;
            

        }

        #endregion

        #region [ Impedance ]
        [Route("GetImpedanceData"),HttpGet]
        public Task<JsonReturn> GetImpedanceData(CancellationToken cancellationToken)
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
                    DateTime endTime =  evt.EndTime;
                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        VICycleDataGroup viCycleDataGroup = QueryVICycleDataGroup(eventID, meter);
                        returnList = returnList.Concat(GetImpedanceLookup(viCycleDataGroup)).ToList();
                       
                    }

                
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetImpedanceLookup(VICycleDataGroup vICycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            if (vICycleDataGroup.IA != null && vICycleDataGroup.VA != null) {

                List<DataPoint> Timing = vICycleDataGroup.VA.RMS.DataPoints;
                IEnumerable<Complex> impedancePoints = CalculateImpedance(vICycleDataGroup.VA, vICycleDataGroup.IA);
                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Reactance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Reactance AN",
                    DataPoints =  impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList() 
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Resistance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Resistance AN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                
                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Resistance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Impedance AN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });

            }

            if (vICycleDataGroup.IB != null && vICycleDataGroup.VB != null)
            {
                List<DataPoint> Timing = vICycleDataGroup.VB.RMS.DataPoints;
                IEnumerable<Complex> impedancePoints = CalculateImpedance(vICycleDataGroup.VB, vICycleDataGroup.IB);
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Reactance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Reactance BN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Resistance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Resistance BN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Resistance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Impedance BN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });

            }

            if (vICycleDataGroup.IC != null && vICycleDataGroup.VC != null)
            {
                List<DataPoint> Timing = vICycleDataGroup.VC.RMS.DataPoints;
                IEnumerable<Complex> impedancePoints = CalculateImpedance(vICycleDataGroup.VC, vICycleDataGroup.IC);
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Reactance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Reactance CN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Resistance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Resistance CN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "Resistance",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Impedance CN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
            }

            return dataLookup;
        }

        private IEnumerable<Complex> CalculateImpedance(CycleDataGroup Voltage, CycleDataGroup Current)
        {
            List<DataPoint> voltagePointsMag = Voltage.RMS.DataPoints;
            List<DataPoint> voltagePointsAng = Voltage.Phase.DataPoints;
            List<Complex> voltagePoints = voltagePointsMag.Select((vMagPoint, index) => Complex.FromPolarCoordinates(vMagPoint.Value, voltagePointsAng[index].Value)).ToList();

            List<DataPoint> currentPointsMag = Current.RMS.DataPoints;
            List<DataPoint> currentPointsAng = Current.Phase.DataPoints;
            List<Complex> currentPoints = currentPointsMag.Select((iMagPoint, index) => Complex.FromPolarCoordinates(iMagPoint.Value, currentPointsAng[index].Value)).ToList();

            return (voltagePoints.Select((vPoint, index) => vPoint / currentPoints[index]));
        }

        #endregion

        #region [ Remove Current ]
        [Route("GetRemoveCurrentData"),HttpGet]
        public Task<JsonReturn> GetRemoveCurrentData(CancellationToken cancellationToken)
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
                    DateTime endTime =  evt.EndTime;
                    
                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}",  evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);

                        returnList = returnList.Concat(GetRemoveCurrentLookup(dataGroup)).ToList();

                    }
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);

        }

        private List<D3Series> GetRemoveCurrentLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();
            double systemFrequency;
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }
            DataSeries iAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries iBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries iCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");



            if (iAN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iAN.SampleRate, systemFrequency);

                List<DataPoint> firstCycle = iAN.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = iAN.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = iAN.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = iAN.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add( new D3Series() {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iAN.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "IAN Pre Fault",
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList() 
                });
                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iAN.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",                    
                    ChartLabel = "IAN Post Fault",
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList() 
                });

            }


            if (iBN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iBN.SampleRate, systemFrequency);

                List<DataPoint> firstCycle = iBN.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = iBN.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = iBN.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = iBN.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iBN.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "IBN Pre Fault",
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iBN.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "IBN Post Fault",
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
            }

            if (iCN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iCN.SampleRate, systemFrequency);

                List<DataPoint> firstCycle = iCN.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = iCN.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = iCN.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = iCN.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iCN.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "ICN Pre Fault",
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iCN.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "ICN Post Fault",
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
            }



            return dataLookup;
        }
        #endregion

        #region [ Power ]
        [Route("GetPowerData"),HttpGet]
        public Task<JsonReturn> GetPowerData(CancellationToken cancellationToken)
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
                    DateTime endTime =  evt.EndTime;
 
                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event ID = {0}",  evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        VICycleDataGroup vICycleDataGroup = QueryVICycleDataGroup(eventID, meter);

                        returnList = returnList.Concat(GetPowerLookup(vICycleDataGroup)).ToList();

                    }
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetPowerLookup(VICycleDataGroup vICycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();
            List<Complex> powerPointsAN = null;
            List<Complex> powerPointsBN = null;
            List<Complex> powerPointsCN = null;

            if (vICycleDataGroup.IA != null && vICycleDataGroup.VA != null)
            {
                List<DataPoint> voltagePointsMag = vICycleDataGroup.VA.RMS.DataPoints;
                List<DataPoint> voltagePointsAng = vICycleDataGroup.VA.Phase.DataPoints;
                List<Complex> voltagePoints = voltagePointsMag.Select((vMagPoint, index) => Complex.FromPolarCoordinates(vMagPoint.Value, voltagePointsAng[index].Value)).ToList();

                List<DataPoint> currentPointsMag = vICycleDataGroup.IA.RMS.DataPoints;
                List<DataPoint> currentPointsAng = vICycleDataGroup.IA.Phase.DataPoints;
                List<Complex> currentPoints = currentPointsMag.Select((iMagPoint, index) => Complex.Conjugate(Complex.FromPolarCoordinates(iMagPoint.Value, currentPointsAng[index].Value))).ToList();

                powerPointsAN = voltagePoints.Select((vPoint, index) => currentPoints[index] * vPoint).ToList();
                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    XaxisLabel = "VAR",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "AN Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary 
                    }).ToList() });
                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    XaxisLabel = "W",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "AN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList() 
                });
                dataLookup.Add( new D3Series() {
                    ChannelID = 0,
                    XaxisLabel = "VA",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "AN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList() 
                });
                dataLookup.Add( new D3Series() {
                    ChannelID = 0,
                    XaxisLabel = "pf",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "AN Power Factor",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real / iPoint.Magnitude }).ToList() 
                });

            }

            if (vICycleDataGroup.IB != null && vICycleDataGroup.VB != null)
            {
                List<DataPoint> voltagePointsMag = vICycleDataGroup.VB.RMS.DataPoints;
                List<DataPoint> voltagePointsAng = vICycleDataGroup.VB.Phase.DataPoints;
                List<Complex> voltagePoints = voltagePointsMag.Select((vMagPoint, index) => Complex.FromPolarCoordinates(vMagPoint.Value, voltagePointsAng[index].Value)).ToList();

                List<DataPoint> currentPointsMag = vICycleDataGroup.IB.RMS.DataPoints;
                List<DataPoint> currentPointsAng = vICycleDataGroup.IB.Phase.DataPoints;
                List<Complex> currentPoints = currentPointsMag.Select((iMagPoint, index) => Complex.Conjugate(Complex.FromPolarCoordinates(iMagPoint.Value, currentPointsAng[index].Value))).ToList();

                powerPointsBN = voltagePoints.Select((vPoint, index) => currentPoints[index] * vPoint).ToList();
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VAR",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "BN Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "W",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "BN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VA",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "BN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "pf",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "BN Power Factor",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real / iPoint.Magnitude }).ToList()
                });
            }

            if (vICycleDataGroup.IC != null && vICycleDataGroup.VC != null)
            {
                List<DataPoint> voltagePointsMag = vICycleDataGroup.VC.RMS.DataPoints;
                List<DataPoint> voltagePointsAng = vICycleDataGroup.VC.Phase.DataPoints;
                List<Complex> voltagePoints = voltagePointsMag.Select((vMagPoint, index) => Complex.FromPolarCoordinates(vMagPoint.Value, voltagePointsAng[index].Value)).ToList();

                List<DataPoint> currentPointsMag = vICycleDataGroup.IC.RMS.DataPoints;
                List<DataPoint> currentPointsAng = vICycleDataGroup.IC.Phase.DataPoints;
                List<Complex> currentPoints = currentPointsMag.Select((iMagPoint, index) => Complex.Conjugate(Complex.FromPolarCoordinates(iMagPoint.Value, currentPointsAng[index].Value))).ToList();

                powerPointsCN = voltagePoints.Select((vPoint, index) => currentPoints[index] * vPoint).ToList();
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VAR",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "CN Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "W",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "CN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VA",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "CN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "pf",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "CN Power Factor",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real / iPoint.Magnitude }).ToList()
                });

            }

            if (powerPointsAN != null && powerPointsAN.Any() && powerPointsBN != null && powerPointsBN.Any() && powerPointsCN != null && powerPointsCN.Any())
            {
                IEnumerable<Complex> powerPoints = powerPointsAN.Select((pPoint, index) => pPoint + powerPointsBN[index] + powerPointsCN[index]).ToList();


                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VAR",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Total Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] {  vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "W",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Total Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VA",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Total Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add( new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "pf",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    ChartLabel = "Total Power Factor",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real / iPoint.Magnitude }).ToList()
                });
            }

            return dataLookup;
        }
        #endregion

        #region [ Missing Voltage ]
        [Route("GetMissingVoltageData"),HttpGet]
        public Task<JsonReturn> GetMissingVoltageData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    
                    DateTime startTime = evt.StartTime;
                    DateTime endTime =  evt.EndTime;
                   
                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);
                        returnList = returnList.Concat(GetMissingVoltageLookup(dataGroup)).ToList();
                        
                    }
                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetMissingVoltageLookup(DataGroup dataGroup)
        {
            List< D3Series> dataLookup = new List<D3Series>();
            double systemFrequency;

            //deal with the followinf Phases
            List<string> phases = new List<string> { "AN", "BN", "CN" };

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            foreach (DataSeries ds in dataGroup.DataSeries)
            {
                if ((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") && (ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                    && (phases.Contains(ds.SeriesInfo.Channel.Phase.Name)))
                {
                    string name = ((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I") + ds.SeriesInfo.Channel.Phase.Name;

                    int samplesPerCycle = Transform.CalculateSamplesPerCycle(ds.SampleRate, systemFrequency);

                    List<DataPoint> firstCycle = ds.DataPoints.Take(samplesPerCycle).ToList();
                    List<DataPoint> lastCycle = ds.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                    List<DataPoint> fullWaveFormPre = ds.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = firstCycle[index % samplesPerCycle].Value - dataPoint.Value }).ToList();
                    List<DataPoint> fullWaveFormPost = ds.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = lastCycle[index % samplesPerCycle].Value - dataPoint.Value }).OrderBy(x => x.Time).ToList();

                    dataLookup.Add(new D3Series() {
                        ChannelID = 0,
                        XaxisLabel = "V",
                        Color = GetColor(ds.SeriesInfo.Channel),
                        LegendClass = "",
                        SecondaryLegendClass = "Pre",
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        ChartLabel = name + " Pre Fault",
                        DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                    });
                    dataLookup.Add(new D3Series() {
                        ChannelID = 0,
                        XaxisLabel = "V",
                        Color = GetColor(ds.SeriesInfo.Channel),
                        LegendClass = "",
                        SecondaryLegendClass = "Post",
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        ChartLabel = name + " Post Fault",
                        DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                    });
                }
            } 

            return dataLookup;
        }
        #endregion

        #region [ Clipped Waveforms ]
        [Route("GetClippedWaveformsData"),HttpGet]
        public Task<JsonReturn> GetClippedWaveformsData(CancellationToken cancellationToken)
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
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);
                        returnList = returnList.Concat(GetClippedWaveformsLookup(dataGroup)).ToList();
                    }


                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        private List<D3Series> GetClippedWaveformsLookup(DataGroup dataGroup)
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

            if (vAN != null)
                dataLookup.Add(GenerateFixedWaveform(systemFrequency, vAN, "VAN"));
            if (vBN != null)
                dataLookup.Add(GenerateFixedWaveform(systemFrequency, vBN, "VBN"));
            if (vCN != null)
                dataLookup.Add(GenerateFixedWaveform(systemFrequency, vCN, "VCN"));
            if (iAN != null)
                dataLookup.Add(GenerateFixedWaveform(systemFrequency, iAN, "IAN"));
            if (iBN != null)
                dataLookup.Add( GenerateFixedWaveform(systemFrequency, iBN, "IBN"));
            if (iCN != null)
                dataLookup.Add( GenerateFixedWaveform(systemFrequency, iCN, "ICN"));

            return dataLookup;
        }

        private D3Series GenerateFixedWaveform(double systemFrequency, DataSeries dataSeries, string label) {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);
            var groupedByCycle = dataSeries.DataPoints.Select((Point, Index) => new { Point, Index }).GroupBy((Point) => Point.Index / samplesPerCycle).Select((grouping) => grouping.Select((obj) => obj.Point));

            string type = "V";
            if (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Current")
                type = "I";

            D3Series fitWave = new D3Series()
            {
                ChannelID = 0,
                ChartLabel = label + " Fixed Clipping",
                XaxisLabel = GetUnits(dataSeries.SeriesInfo.Channel),
                LegendClass = "",
                SecondaryLegendClass = type,
                LegendGroup = "",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                DataPoints = new List<double[]>()
            };

            double max = dataSeries.DataPoints.Select(point => point.Value).Max();
            double min = dataSeries.DataPoints.Select(point => point.Value).Min();

            D3Series dt = GetFirstDerivativeFlotSeries(dataSeries, "", "", "");

            fitWave.DataPoints = dataSeries.DataPoints.Select(point => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).OrderBy(item => item[0]).ToList();

            // Find Section that meet Threshold Criteria of close to top/bottom and low derrivative
            double threshold = 1E-3;
            double relativeThreshold = threshold * (max - min);

            int npoints = dataSeries.DataPoints.Count();
            List<bool> isClipped = new List<bool>();
            double[] distToTop = dataSeries.DataPoints.Select(point => Math.Abs(point.Value - max)).ToArray();
            double[] distToBottom = dataSeries.DataPoints.Select(point => Math.Abs(point.Value - min)).ToArray();

            isClipped = dt.DataPoints.Select((item, index) => (Math.Abs(item[1]) < threshold) && (Math.Min(distToTop[index],distToBottom[index]) < relativeThreshold)).ToList();

            List<int[]> section = new List<int[]>();

            //Corectly determines clipping but now I need to do something about it....
            while(isClipped.Any(item => item==true))
            {
                int start = isClipped.IndexOf(true);
                int end = isClipped.Skip(start).ToList().IndexOf(false) + start;
                
                isClipped = isClipped.Select((item, index) =>
                {
                    if (index < start || index > end)
                        return item;
                    else
                        return false;
                }).ToList();

                int length = end - start;
                int startRecovery = start - length / 2;
                int endRecovery = end + length/2;

                if (startRecovery < 0)
                    startRecovery = 0;

                if (endRecovery >= npoints)
                    endRecovery = npoints - 1;

                List<double[]> filteredDataPoints = fitWave.DataPoints.Where((item, index) =>
                {
                    if (index < startRecovery || index > endRecovery)
                        return false;
                    else if (index < start || index > end)
                        return true;
                    else
                        return false;

                }
                ).ToList();


                SineWave sineWave = WaveFit.SineFit(filteredDataPoints.Select(item => item[1]).ToArray(), filteredDataPoints.Select(item => item[0]/1000.0D).ToArray(), systemFrequency);

                fitWave.DataPoints = fitWave.DataPoints.Select((item, index) =>
                {
                    if (index < start || index > end)
                        return item;
                    else
                        return new double[2] { item[0], sineWave.CalculateY(item[0] / 1000.0D) };
                }).ToList();
            }

            return fitWave;
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
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();

                    int filterOrder = int.Parse(query["filter"]);
                    int eventId = int.Parse(query["eventId"]);

                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
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
                        returnList = returnList.Concat(GetLowPassFilterLookup(dataGroup, filterOrder)).ToList();

                       
                    }
                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetLowPassFilterLookup(DataGroup dataGroup, int order)
        {
            List<D3Series> dataLookup = new List<D3Series>();
            double systemFrequency;
            DataSeries vAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries vBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries vCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");
            DataSeries iAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries iBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries iCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            Filter LPF = Filter.LPButterworth(120.0, order);

            if (vAN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(vAN.SampleRate, systemFrequency);
                List<DataPoint> points = vAN.DataPoints;

                double[] results = LPF.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series()
                {
                    ChartLabel = "VAN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "V",
                    Color = GetColor(vAN.SeriesInfo.Channel),
                    LegendClass = "Voltage",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });

            }
            if (vBN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(vBN.SampleRate, systemFrequency);
                List<DataPoint> points = vBN.DataPoints;

                double[] results = LPF.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series() 
                {
                    ChartLabel = "VBN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "V",
                    Color = GetColor(vBN.SeriesInfo.Channel),
                    LegendClass = "Voltage",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()

                    });
            }

            if (vCN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(vCN.SampleRate, systemFrequency);
                List<DataPoint> points = vCN.DataPoints;

                double[] results = LPF.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series() 
                {
                    ChartLabel = "VCN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "V",
                    Color = GetColor(vCN.SeriesInfo.Channel),
                    LegendClass = "Voltage",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }

            if (iAN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iAN.SampleRate, systemFrequency);
                List<DataPoint> points = iAN.DataPoints;

                double[] results = LPF.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series() 
                {
                    ChartLabel = "IAN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iAN.SeriesInfo.Channel),
                    LegendClass = "Current",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }


            if (iBN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iBN.SampleRate, systemFrequency);
                List<DataPoint> points = iBN.DataPoints;

                double[] results = LPF.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series() 
                {
                    ChartLabel = "IBN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iBN.SeriesInfo.Channel),
                    LegendClass = "Current",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }

            if (iCN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iCN.SampleRate, systemFrequency);
                List<DataPoint> points = iCN.DataPoints;

                double[] results = LPF.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series() 
                {
                    ChartLabel = "ICN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iCN.SeriesInfo.Channel),
                    LegendClass = "Current",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }



            return dataLookup;
        }


        #endregion

        #region [ High Pass Filter ]
        [Route("GetHighPassFilterData"),HttpGet]
        public Task<JsonReturn> GetHighPassFilterData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int filterOrder = int.Parse(query["filter"]);
                    int eventId = int.Parse(query["eventId"]);

                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    int calcCycle = connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
                    double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;


                    DateTime startTime =  evt.StartTime;
                    DateTime endTime =  evt.EndTime;

                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);

                        returnList = returnList.Concat(GetHighPassFilterLookup(dataGroup, filterOrder)).ToList();

                       
                    }
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetHighPassFilterLookup(DataGroup dataGroup, int order)
        {
            List<D3Series> dataLookup = new List <D3Series>();
            double systemFrequency;
            DataSeries vAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries vBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries vCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");
            DataSeries iAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries iBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries iCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            Filter hpf = Filter.HPButterworth(120.0, order);
            

            if (vAN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(vAN.SampleRate, systemFrequency);
                List<DataPoint> points = vAN.DataPoints;

                double[] results = hpf.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add(new D3Series() {
                    ChartLabel = "VAN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "V",
                    Color = GetColor(vAN.SeriesInfo.Channel),
                    LegendClass = "Voltage",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }


            if (vBN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(vBN.SampleRate, systemFrequency);
                List<DataPoint> points = vBN.DataPoints;
                double[] results = hpf.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "VBN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "V",
                    Color = GetColor(vBN.SeriesInfo.Channel),
                    LegendClass = "Voltage",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }

            if (vCN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(vCN.SampleRate, systemFrequency);
                List<DataPoint> points = vCN.DataPoints;


                double[] results = hpf.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series()
                {
                    ChartLabel = "VCN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "V",
                    Color = GetColor(vCN.SeriesInfo.Channel),
                    LegendClass = "Voltage",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }

            if (iAN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iAN.SampleRate, systemFrequency);
                List<DataPoint> points = iAN.DataPoints;


                double[] results = hpf.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series()
                {
                    ChartLabel = "IAN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iAN.SeriesInfo.Channel),
                    LegendClass = "Current",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }


            if (iBN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iBN.SampleRate, systemFrequency);
                List<DataPoint> points = iBN.DataPoints;

                double[] results = hpf.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add( new D3Series()
                {
                    ChartLabel = "IBN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iBN.SeriesInfo.Channel),
                    LegendClass = "Current",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }

            if (iCN != null)
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(iCN.SampleRate, systemFrequency);
                List<DataPoint> points = iCN.DataPoints;

                double[] results = hpf.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * systemFrequency);

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "ICN Low Pass Filter",
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(iCN.SeriesInfo.Channel),
                    LegendClass = "Current",
                    SecondaryLegendClass = "",
                    LegendGroup = "",
                    DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
                });
            }



            return dataLookup;
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
                    DateTime endTime =  evt.EndTime;
                   

                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        DataGroup dataGroup = QueryDataGroup(eventID, meter);
                        returnList = returnList.Concat(GetFrequencyLookup(dataGroup)).ToList();

                     
                    }
                   
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        private List<D3Series> GetFrequencyLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            double systemFrequency;

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            DataSeries vAN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN");
            DataSeries vBN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN");
            DataSeries vCN = dataGroup.DataSeries.ToList().Find(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN");

            D3Series fVa = null;
            D3Series fVb = null;
            D3Series fVc = null;

            if (vAN != null)
            {
                fVa = GenerateFrequency(systemFrequency, vAN, "Va");
            }
            if (vBN != null)
            {
                fVb = GenerateFrequency(systemFrequency, vBN, "Vb");
            }
            if (vCN != null)
            {
                fVc = GenerateFrequency(systemFrequency, vCN, "Vc");
            }


            //    dataLookup.Add("Frequency VBN", GenerateFrequency(systemFrequency, vBN, "VBN"));
            //if (vCN != null)
            //    dataLookup.Add("Frequency VCN", GenerateFrequency(systemFrequency, vCN, "VCN"));
            if (fVa != null || fVb != null || fVc != null)
                dataLookup.Add( AvgFilter(fVa, fVb, fVc));

            return dataLookup;
        }

        private D3Series GenerateFrequency(double systemFrequency, DataSeries dataSeries, string label)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);

            D3Series fitWave = new D3Series()
            {
                ChartLabel = label + "Frequency",
                ChannelID = 0,
                XaxisLabel = "Hz",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                LegendClass = "",
                SecondaryLegendClass = "",
                LegendGroup = "",                
                DataPoints = new List<double[]>()
            };

            double thresholdValue = 0;

            var crosses = dataSeries.DataPoints.Zip(dataSeries.DataPoints.Skip(1), (Point1, Point2) => new { Point1, Point2 }).Where(obj => obj.Point1.Value * obj.Point2.Value < 0 || obj.Point1.Value == 0).Select(obj => {
                double slope = (obj.Point2.Value - obj.Point1.Value) / (obj.Point2.Time - obj.Point1.Time).Ticks;
                DateTime interpolatedCrossingTime = m_epoch.AddTicks((long)Math.Round((thresholdValue - obj.Point1.Value) / slope + obj.Point1.Time.Subtract(m_epoch).Ticks));
                return new DataPoint{ Time = interpolatedCrossingTime, Value = thresholdValue };

            }).ToList();

            fitWave.DataPoints = crosses.Zip(crosses.Skip(2), (Point1, Point2) =>  {
                double frequency =  1 / (Point2.Time - Point1.Time).TotalSeconds;
                return new double[] {  Point1.Time.Subtract(m_epoch).TotalMilliseconds, frequency };

            }).ToList();

            return fitWave;
        }

        private D3Series AvgFilter(D3Series Va, D3Series Vb, D3Series Vc)
        {
            D3Series result = new D3Series()
            {
                ChartLabel = "Frequency",
                ChannelID = 0,
                XaxisLabel = "Hz",
                Color = "#a452a4",
                LegendClass = "",
                SecondaryLegendClass = "",
                LegendGroup = "",
                DataPoints = new List<double[]>()
            };

            double n_signals = 1.0D;
            // for now assume Va is not null
            result.DataPoints = Va.DataPoints.Select(point => new double[] { point[0], point[1] }).ToList();

            if (Vb != null)
            {
                result.DataPoints = result.DataPoints.Zip(Vb.DataPoints, (point1, point2) => { return new double[] { point1[0], point1[1] + point2[1] }; }).ToList();
                n_signals = n_signals + 1.0D;
            }
            if (Vc != null)
            {
                result.DataPoints = result.DataPoints.Zip(Vc.DataPoints, (point1, point2) => { return new double[] { point1[0], point1[1] + point2[1] }; }).ToList();
                n_signals = n_signals + 1.0D;
            }

            result.DataPoints = result.DataPoints.Select(point => new double[] { point[0], point[1] / n_signals }).ToList();

            return MedianFilt(result);
        }

        private D3Series MedianFilt(D3Series input)
        {
            D3Series output = new D3Series()
            {
                ChartLabel = "Frequency",
                ChannelID = 0,
                XaxisLabel = "Hz",
                Color = "#a452a4",
                LegendClass = "",
                SecondaryLegendClass = "",
                LegendGroup = "",
                DataPoints = new List<double[]>()
            };
            

            List<double[]> inputData = input.DataPoints.OrderBy(point => point[0]).ToList();

            // Edges stay constant
            output.DataPoints.Add(inputData[0]);

            output.DataPoints.AddRange(inputData.Skip(1).Take(inputData.Count - 2).Select((value, index) =>
                new double[] { value[0],
                    MathNet.Numerics.Statistics.Statistics.Median(new double[] { value[1],inputData[index][1],inputData[index+2][1] })
                }));

            output.DataPoints.Add(inputData.Last());

            return output;
        }
        #endregion

        #region [ Symmetrical Components  ]
        [Route("GetSymmetricalComponentsData"),HttpGet]
        public Task<JsonReturn> GetSymmetricalComponentsData(CancellationToken cancellationToken)
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
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        VICycleDataGroup vICycleDataGroup = QueryVICycleDataGroup(eventID, meter);

                        returnList = returnList.Concat( GetSymmetricalComponentsLookup(vICycleDataGroup)).ToList();

                        
                    }
                    

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;


                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetSymmetricalComponentsLookup(VICycleDataGroup vICycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();


            
            if (vICycleDataGroup.VA != null && vICycleDataGroup.VB != null && vICycleDataGroup.VC != null)
            {
                var va = vICycleDataGroup.VA.RMS.DataPoints;
                var vaPhase = vICycleDataGroup.VA.Phase.DataPoints;
                var vb = vICycleDataGroup.VB.RMS.DataPoints;
                var vbPhase = vICycleDataGroup.VB.Phase.DataPoints;
                var vc = vICycleDataGroup.VC.RMS.DataPoints;
                var vcPhase = vICycleDataGroup.VC.Phase.DataPoints;

                IEnumerable<SequenceComponents> sequencComponents = va.Select((point, index) => {
                    DataPoint vaPoint = point;
                    DataPoint vaPhasePoint = vaPhase[index];
                    Complex vaComplex = Complex.FromPolarCoordinates(vaPoint.Value, vaPhasePoint.Value);

                    DataPoint vbPoint = vb[index];
                    DataPoint vbPhasePoint = vbPhase[index];
                    Complex vbComplex = Complex.FromPolarCoordinates(vbPoint.Value, vbPhasePoint.Value);

                    DataPoint vcPoint = vc[index];
                    DataPoint vcPhasePoint = vcPhase[index];
                    Complex vcComplex = Complex.FromPolarCoordinates(vcPoint.Value, vcPhasePoint.Value);

                    SequenceComponents sequenceComponents = CalculateSequenceComponents(vaComplex, vbComplex, vcComplex);

                    return sequenceComponents;
                });

                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    ChartLabel = "Voltage S0",
                    XaxisLabel = "V",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "V",
                    LegendGroup = "",                    
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S0.Magnitude }).ToList() 

                });
                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    ChartLabel = "Voltage S1",
                    XaxisLabel = "V",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "V",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S1.Magnitude }).ToList() 
                });
                dataLookup.Add(new D3Series() {
                    ChannelID = 0,
                    ChartLabel = "Voltage S2",
                    XaxisLabel = "V",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "V",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S2.Magnitude }).ToList() 
                });

            }


            if (vICycleDataGroup.IA != null && vICycleDataGroup.IB != null && vICycleDataGroup.IC != null)
            {

                var ia = vICycleDataGroup.IA.RMS.DataPoints;
                var iaPhase = vICycleDataGroup.IA.Phase.DataPoints;
                var ib = vICycleDataGroup.IB.RMS.DataPoints;
                var ibPhase = vICycleDataGroup.IB.Phase.DataPoints;
                var ic = vICycleDataGroup.IC.RMS.DataPoints;
                var icPhase = vICycleDataGroup.IC.Phase.DataPoints;

                IEnumerable<SequenceComponents> sequencComponents = ia.Select((point, index) => {
                    DataPoint iaPoint = point;
                    DataPoint iaPhasePoint = iaPhase[index];
                    Complex iaComplex = Complex.FromPolarCoordinates(iaPoint.Value, iaPhasePoint.Value);

                    DataPoint ibPoint = ib[index];
                    DataPoint ibPhasePoint = ibPhase[index];
                    Complex ibComplex = Complex.FromPolarCoordinates(ibPoint.Value, ibPhasePoint.Value);

                    DataPoint icPoint = ic[index];
                    DataPoint icPhasePoint = icPhase[index];
                    Complex icComplex = Complex.FromPolarCoordinates(icPoint.Value, icPhasePoint.Value);

                    SequenceComponents sequenceComponents = CalculateSequenceComponents(iaComplex, ibComplex, icComplex);

                    return sequenceComponents;
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    ChartLabel = "Current S0",
                    XaxisLabel = "A",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "I",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S0.Magnitude }).ToList()

                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    ChartLabel = "Current S1",
                    XaxisLabel = "A",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "I",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S1.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    ChartLabel = "Current S2",
                    XaxisLabel = "A",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "I",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S2.Magnitude }).ToList()
                });

            }

            return dataLookup;
        }


        private class SequenceComponents {
            public Complex S0 { get; set; }
            public Complex S2 { get; set; }
            public Complex S1 { get; set; }

        }

        private SequenceComponents CalculateSequenceComponents(Complex an, Complex bn, Complex cn)
        {
            double TwoPI = 2.0D * Math.PI;
            double Rad120 = TwoPI / 3.0D;
            Complex a = new Complex(Math.Cos(Rad120), Math.Sin(Rad120));
            Complex aSq = a * a;

            SequenceComponents sequenceComponents = new SequenceComponents();

            sequenceComponents.S0 = (an + bn + cn) / 3.0D;
            sequenceComponents.S1 = (an + a * bn + aSq * cn) / 3.0D;
            sequenceComponents.S2 = (an + aSq * bn + a * cn) / 3.0D;

            return sequenceComponents;
        }


        #endregion

        #region [ Unbalance ]
        [Route("GetUnbalanceData"),HttpGet]
        public Task<JsonReturn> GetUnbalanceData(CancellationToken cancellationToken)
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
                    DateTime endTime =  evt.EndTime;
                 

                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
                    foreach (DataRow row in table.Rows)
                    {
                        int eventID = row.ConvertField<int>("ID");
                        VICycleDataGroup vICycleDataGroup = QueryVICycleDataGroup(eventID, meter);
                        returnList = returnList.Concat(GetUnbalanceLookup(vICycleDataGroup)).ToList();

                    }
                    
                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        private List<D3Series> GetUnbalanceLookup(VICycleDataGroup vICycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();



            if (vICycleDataGroup.VA != null && vICycleDataGroup.VB != null && vICycleDataGroup.VC != null)
            {
                var va = vICycleDataGroup.VA.RMS.DataPoints;
                var vaPhase = vICycleDataGroup.VA.Phase.DataPoints;
                var vb = vICycleDataGroup.VB.RMS.DataPoints;
                var vbPhase = vICycleDataGroup.VB.Phase.DataPoints;
                var vc = vICycleDataGroup.VC.RMS.DataPoints;
                var vcPhase = vICycleDataGroup.VC.Phase.DataPoints;

                IEnumerable<SequenceComponents> sequencComponents = va.Select((point, index) => {
                    DataPoint vaPoint = point;
                    DataPoint vaPhasePoint = vaPhase[index];
                    Complex vaComplex = Complex.FromPolarCoordinates(vaPoint.Value, vaPhasePoint.Value);

                    DataPoint vbPoint = vb[index];
                    DataPoint vbPhasePoint = vbPhase[index];
                    Complex vbComplex = Complex.FromPolarCoordinates(vbPoint.Value, vbPhasePoint.Value);

                    DataPoint vcPoint = vc[index];
                    DataPoint vcPhasePoint = vcPhase[index];
                    Complex vcComplex = Complex.FromPolarCoordinates(vcPoint.Value, vcPhasePoint.Value);

                    SequenceComponents sequenceComponents = CalculateSequenceComponents(vaComplex, vbComplex, vcComplex);

                    return sequenceComponents;
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    ChartLabel = "S0/S1 Voltage",
                    XaxisLabel = "",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "V",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S0.Magnitude / point.S1.Magnitude * 100.0D }).ToList()

                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    ChartLabel = "S2/S1 Voltage",
                    XaxisLabel = "",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "V",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S2.Magnitude / point.S1.Magnitude * 100.0D }).ToList()

                });

            }


            if (vICycleDataGroup.IA != null && vICycleDataGroup.IB != null && vICycleDataGroup.IC != null)
            {

                var ia = vICycleDataGroup.IA.RMS.DataPoints;
                var iaPhase = vICycleDataGroup.IA.Phase.DataPoints;
                var ib = vICycleDataGroup.IB.RMS.DataPoints;
                var ibPhase = vICycleDataGroup.IB.Phase.DataPoints;
                var ic = vICycleDataGroup.IC.RMS.DataPoints;
                var icPhase = vICycleDataGroup.IC.Phase.DataPoints;

                IEnumerable<SequenceComponents> sequencComponents = ia.Select((point, index) => {
                    DataPoint iaPoint = point;
                    DataPoint iaPhasePoint = iaPhase[index];
                    Complex iaComplex = Complex.FromPolarCoordinates(iaPoint.Value, iaPhasePoint.Value);

                    DataPoint ibPoint = ib[index];
                    DataPoint ibPhasePoint = ibPhase[index];
                    Complex ibComplex = Complex.FromPolarCoordinates(ibPoint.Value, ibPhasePoint.Value);

                    DataPoint icPoint = ic[index];
                    DataPoint icPhasePoint = icPhase[index];
                    Complex icComplex = Complex.FromPolarCoordinates(icPoint.Value, icPhasePoint.Value);

                    SequenceComponents sequenceComponents = CalculateSequenceComponents(iaComplex, ibComplex, icComplex);

                    return sequenceComponents;
                });

               
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    ChartLabel = "S0/S1 Current",
                    XaxisLabel = "",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "I",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S0.Magnitude / point.S1.Magnitude * 100.0D }).ToList()

                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    ChartLabel = "S2/S1 Current",
                    XaxisLabel = "",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "I",
                    LegendGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S2.Magnitude / point.S1.Magnitude * 100.0D }).ToList()

                });


            }

            return dataLookup;
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