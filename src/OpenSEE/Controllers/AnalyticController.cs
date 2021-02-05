//******************************************************************************************************
//  AnalyticController.cs - Gbtc
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
//  08/24/2020 - C. Lackner
//       Generated original version of source code.
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
using OpenSEE.Model;
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
    [RoutePrefix("api/Analytic")]
    public class AnalyticController : OpenSEEBaseController
    {
        #region [ Members ]

        // Fields
       
        // Fields

        #endregion

        #region [ Constructors ]
        public AnalyticController() : base() { }

        #endregion

        #region [ Static ]

        static AnalyticController()
        {
            s_memoryCache = new MemoryCache("Analytics");

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                m_cacheSlidingExpiration = connection.ExecuteScalar<double?>("SELECT Value FROM Settings WHERE Scope = 'app.setting' AND Name = 'SlidingCacheExpiration'") ?? 2.0;
            }
        }
        #endregion

        #region[Analytic Classes]

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
                //for (int i = 0; i < order; i++)
                //{
                //    output[i] = signal[i];
                //}

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

                signal.Reverse();
                

                double[] a = this.PolesToPolynomial(this.DiscretePoles.ToArray());
                double[] b = this.PolesToPolynomial(this.DiscreteZeros.ToArray());
                b = b.Select(z => z * this.DiscreteGain).ToArray();

                int order = a.Count() - 1;
                //setup first few points for computation
                //for (int i = 0; i < order; i++)
                //{
                //    output[i] = signal[i];
                //}

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

                output.Reverse();
                return output;
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



        private class SequenceComponents
        {
            public Complex S0 { get; set; }
            public Complex S2 { get; set; }
            public Complex S1 { get; set; }

        }


        #endregion[Analytic Classes]        

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
                string units = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'LengthUnits'");

                D3Series series = new D3Series()
                {
                    ChartLabel = faultCurve.Algorithm,
                    Unit = "Distance",
                    Color = GetFaultDistanceColort(faultCurve.Algorithm),
                    DataPoints = dataGroup.DataSeries[0].DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList()
                };

                if (units == "kilometer")
                    series.DataPoints = series.DataPoints.Select(pt => new double[] { pt[0], pt[1] * 0.621371 }).ToList();

                return series;

            }

        }

        #endregion

        #region [ First Derivative ]
        [Route("GetFirstDerivativeData"), HttpGet]
        public Task<JsonReturn> GetFirstDerivativeData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    DataTable table;

                    List<D3Series> returnList = new List<D3Series>();
                    table = connection.RetrieveData("select ID, StartTime from Event WHERE ID = {0}", evt.ID);
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

        public List<D3Series> GetFirstDerivativeLookup(DataGroup dataGroup, VICycleDataGroup viCycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            //deal with the following Phases
            List<string> phases = new List<string> { "AN", "BN", "CN" };

            foreach (DataSeries ds in dataGroup.DataSeries)
            {
                if (((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") || (ds.SeriesInfo.Channel.MeasurementType.Name == "Current"))
                    && (ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous") && (phases.Contains(ds.SeriesInfo.Channel.Phase.Name)))
                {
                    string name = ((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I") + ds.SeriesInfo.Channel.Phase.Name;
                    string category = ((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "Volt." : "Curr.");

                    dataLookup.Add(GetFirstDerivativeSeries(ds, name, category, "W"));
                }
            }

            foreach (CycleDataGroup dg in viCycleDataGroup.CycleDataGroups)
            {
                if ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") && (dg.RMS.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                    && (phases.Contains(dg.RMS.SeriesInfo.Channel.Phase.Name)))
                {
                    string name = ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I") + dg.RMS.SeriesInfo.Channel.Phase.Name + " RMS";
                    string category = ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "Volt." : "Curr.");

                    dataLookup.Add(GetFirstDerivativeSeries(dg.RMS, name, category, "RMS"));
                }
                if ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Current") && (dg.RMS.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                    && (phases.Contains(dg.RMS.SeriesInfo.Channel.Phase.Name)))
                {
                    string name = ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "V" : "I") + dg.RMS.SeriesInfo.Channel.Phase.Name + " RMS";
                    string category = ((dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage") ? "Volt." : "Curr.");

                    dataLookup.Add(GetFirstDerivativeSeries(dg.RMS, name, category, "RMS"));
                }
            }

            return dataLookup;
        }

        public static D3Series GetFirstDerivativeSeries(DataSeries dataSeries, string label, string legenclass, string type)
        {
            double lastX = 0;
            double lastY = 0;

            D3Series D3Series = new D3Series()
            {
                Unit = (dataSeries.SeriesInfo.Channel.MeasurementType.Name) + "perSecond",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetKey,
                ChartLabel = dataSeries.SeriesInfo.Channel.Phase.Name + type +  " First Derivative",
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = type,
                LegendVGroup = legenclass,
                DataMarker = new List<double[]>(),
                BaseValue = (type == "Voltage" ? dataSeries.SeriesInfo.Channel.Asset.VoltageKV * 1000.0 : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)* 1000.0),
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

            D3Series.DataPoints = D3Series.DataPoints.Select(item => new double[] { item[0], item[1] * 1000.0D }).ToList();
            return D3Series;


        }

        #endregion

        #region [ Impedance ]
        [Route("GetImpedanceData"), HttpGet]
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
                    List<D3Series> returnList = GetImpedanceLookup(viCycleDataGroup);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        public List<D3Series> GetImpedanceLookup(VICycleDataGroup vICycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            if (vICycleDataGroup.IA != null && vICycleDataGroup.VA != null)
            {

                List<DataPoint> Timing = vICycleDataGroup.VA.RMS.DataPoints;
                IEnumerable<Complex> impedancePoints = CalculateImpedance(vICycleDataGroup.VA, vICycleDataGroup.IA);
                dataLookup.Add(new D3Series()
                {
                    LegendGroup = vICycleDataGroup.IA.Asset.AssetName,
                    LegendHorizontal = "X",
                    LegendVertical = "AN",
                    Unit = "Impedance",
                    Color = "Xa",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),           
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "Resistance AN",
                    LegendGroup = vICycleDataGroup.IA.Asset.AssetName,
                    LegendHorizontal = "R",
                    LegendVertical = "AN",
                    Unit = "Impedance",
                    Color = "Ra",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "Impedance AN",
                    LegendGroup = vICycleDataGroup.IA.Asset.AssetName,
                    LegendHorizontal = "Z",
                    LegendVertical = "AN",
                    Unit = "Impedance",
                    Color = "Za",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });

            }

            if (vICycleDataGroup.IB != null && vICycleDataGroup.VB != null)
            {
                List<DataPoint> Timing = vICycleDataGroup.VB.RMS.DataPoints;
                IEnumerable<Complex> impedancePoints = CalculateImpedance(vICycleDataGroup.VB, vICycleDataGroup.IB);

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "Reactance BN",
                    LegendGroup = vICycleDataGroup.IB.Asset.AssetName,
                    LegendHorizontal = "X",
                    LegendVertical = "BN",
                    Unit = "Impedance",
                    Color = "Xb",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VB.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "Resistance BN",
                    LegendGroup = vICycleDataGroup.IB.Asset.AssetName,
                    LegendHorizontal = "R",
                    LegendVertical = "BN",
                    Unit = "Impedance",
                    Color = "Rb",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VB.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "Impedance BN",
                    LegendGroup = vICycleDataGroup.IB.Asset.AssetName,
                    LegendHorizontal = "Z",
                    LegendVertical = "BN",
                    Unit = "Impedance",
                    Color = "Zb",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VB.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });

            }

            if (vICycleDataGroup.IC != null && vICycleDataGroup.VC != null)
            {
                List<DataPoint> Timing = vICycleDataGroup.VC.RMS.DataPoints;
                IEnumerable<Complex> impedancePoints = CalculateImpedance(vICycleDataGroup.VC, vICycleDataGroup.IC);
                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "Reactance CN",
                    LegendGroup = vICycleDataGroup.IC.Asset.AssetName,
                    LegendHorizontal = "X",
                    LegendVertical = "CN",
                    Unit = "Impedance",
                    Color = "Xc",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VC.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "Resistance CN",
                    LegendGroup = vICycleDataGroup.IC.Asset.AssetName,
                    LegendHorizontal = "R",
                    LegendVertical = "CN",
                    Unit = "Impedance",
                    Color = "Rc",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VC.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChartLabel = "Impedance CN",
                    LegendGroup = vICycleDataGroup.IC.Asset.AssetName,
                    LegendHorizontal = "Z",
                    LegendVertical = "CN",
                    Unit = "Impedance",
                    Color = "Zc",
                    LegendVGroup = "",
                    BaseValue = GetZbase(Sbase, vICycleDataGroup.VC.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    DataMarker = new List<double[]>(),
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

        [Route("GetRemoveCurrentData"), HttpGet]
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
                    List<D3Series> returnList = GetRemoveCurrentLookup(dataGroup);


                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);

        }

        public List<D3Series> GetRemoveCurrentLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();
           

            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();


            iAN.ForEach(item => {

                int samplesPerCycle = Transform.CalculateSamplesPerCycle(item.SampleRate, Fbase);

                List<DataPoint> firstCycle = item.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = item.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = item.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = item.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add(new D3Series()
                {

                    LegendVGroup = "",
                    LegendHorizontal = "Pre",
                    LegendVertical = DisplayPhaseName(item.SeriesInfo.Channel.Phase),
                    ChartLabel = GetChartLabel(item.SeriesInfo.Channel) + " Pre-Fault",
                    Unit = "Current",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    BaseValue = GetIbase(Sbase, item.SeriesInfo.Channel.Asset.VoltageKV),
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendVGroup = "",
                    LegendHorizontal = "Post",
                    LegendVertical = DisplayPhaseName(item.SeriesInfo.Channel.Phase),
                    ChartLabel = GetChartLabel(item.SeriesInfo.Channel) + " Post-Fault",
                    Unit = "Current",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    BaseValue = GetIbase(Sbase, item.SeriesInfo.Channel.Asset.VoltageKV),
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });

            });

            iBN.ForEach(item =>
            {

                int samplesPerCycle = Transform.CalculateSamplesPerCycle(item.SampleRate, Fbase);

                List<DataPoint> firstCycle = item.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = item.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = item.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = item.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add(new D3Series()
                {
                    LegendVGroup = "",
                    LegendHorizontal = "Pre",
                    LegendVertical = DisplayPhaseName(item.SeriesInfo.Channel.Phase),
                    ChartLabel = GetChartLabel(item.SeriesInfo.Channel) + " Pre-Fault",
                    Unit = "Current",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    BaseValue = GetIbase(Sbase, item.SeriesInfo.Channel.Asset.VoltageKV),
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendVGroup = "",
                    LegendHorizontal = "Post",
                    LegendVertical = DisplayPhaseName(item.SeriesInfo.Channel.Phase),
                    ChartLabel = GetChartLabel(item.SeriesInfo.Channel) + " Post-Fault",
                    Unit = "Current",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    BaseValue = GetIbase(Sbase, item.SeriesInfo.Channel.Asset.VoltageKV),
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
            });

            iCN.ForEach(item =>
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(item.SampleRate, Fbase);

                List<DataPoint> firstCycle = item.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = item.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = item.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = item.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add(new D3Series()
                {
                    LegendVGroup = "",
                    LegendHorizontal = "Pre",
                    LegendVertical = DisplayPhaseName(item.SeriesInfo.Channel.Phase),
                    ChartLabel = GetChartLabel(item.SeriesInfo.Channel) + " Pre-Fault",
                    Unit = "Current",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    BaseValue = GetIbase(Sbase, item.SeriesInfo.Channel.Asset.VoltageKV),
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendVGroup = "",
                    LegendHorizontal = "Post",
                    LegendVertical = DisplayPhaseName(item.SeriesInfo.Channel.Phase),
                    ChartLabel = GetChartLabel(item.SeriesInfo.Channel) + " Post-Fault",
                    Unit = "Current",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    BaseValue = GetIbase(Sbase, item.SeriesInfo.Channel.Asset.VoltageKV),
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
            });

            return dataLookup;
        }

        #endregion

        #region [ Power ]
        [Route("GetPowerData"), HttpGet]
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
                    List<D3Series> returnList = GetPowerLookup(vICycleDataGroup);


                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        public List<D3Series> GetPowerLookup(VICycleDataGroup vICycleDataGroup)
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

                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "Q",
                    LegendVertical = "AN",
                    Unit = "PowerQ",
                    Color = "Qa",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "AN Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "P",
                    LegendVertical = "AN",
                    Unit = "PowerP",
                    Color = "Pa",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "AN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "S",
                    LegendVertical = "AN",
                    Unit = "PowerS",
                    Color = "Sa",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "AN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "Pf",
                    LegendVertical = "AN",
                    Unit = "PowerPf",
                    Color = "Pfa",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = 1.0,
                    DataMarker = new List<double[]>(),
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
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "Q",
                    LegendVertical = "BN",
                    Unit = "PowerQ",
                    Color = "Qb",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "BN Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "P",
                    LegendVertical = "BN",
                    Unit = "PowerP",
                    Color = "Pb",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "BN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "S",
                    LegendVertical = "BN",
                    Unit = "PowerS",
                    Color = "Sb",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "BN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "Pf",
                    LegendVertical = "BN",
                    Unit = "PowerPf",
                    Color = "Pfb",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = 1.0,
                    DataMarker = new List<double[]>(),
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
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "Q",
                    LegendVertical = "CN",
                    Unit = "PowerQ",
                    Color = "Qc",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "CN Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "P",
                    LegendVertical = "CN",
                    Unit = "PowerP",
                    Color = "Pc",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "CN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "S",
                    LegendVertical = "CN",
                    Unit = "PowerS",
                    Color = "Sc",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "CN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "Pf",
                    LegendVertical = "CN",
                    Unit = "PowerPf",
                    Color = "Pfc",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = 1.0,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "CN Power Factor",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real / iPoint.Magnitude }).ToList()
                });

            }

            if (powerPointsAN != null && powerPointsAN.Any() && powerPointsBN != null && powerPointsBN.Any() && powerPointsCN != null && powerPointsCN.Any())
            {
                IEnumerable<Complex> powerPoints = powerPointsAN.Select((pPoint, index) => pPoint + powerPointsBN[index] + powerPointsCN[index]).ToList();


                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "Q",
                    LegendVertical = "Total",
                    Unit = "PowerQ",
                    Color = "Qt",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = 3*Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "Total Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] {  vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "P",
                    LegendVertical = "Total",
                    Unit = "PowerP",
                    Color = "Pt",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "Total Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "S",
                    LegendVertical = "Total",
                    Unit = "PowerS",
                    Color = "St",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = Sbase,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "Total Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    LegendHorizontal = "Pf",
                    LegendVertical = "Total",
                    Unit = "PowerPf",
                    Color = "Pft",
                    LegendVGroup = "",
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    BaseValue = 1.0,
                    DataMarker = new List<double[]>(),
                    ChartLabel = "Total Power Factor",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real / iPoint.Magnitude }).ToList()
                });
            }

            return dataLookup;
        }
        #endregion

        #region [ Missing Voltage ]

        [Route("GetMissingVoltageData"), HttpGet]
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

                    List<D3Series> returnList = GetMissingVoltageLookup(dataGroup);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        public List<D3Series> GetMissingVoltageLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            //deal with the followinf Phases
            List<string> phases = new List<string> { "AN", "BN", "CN" };

            foreach (DataSeries ds in dataGroup.DataSeries)
            {
                if ((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") && (ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                    && (phases.Contains(ds.SeriesInfo.Channel.Phase.Name)))
                {
                    string name = "V" + ds.SeriesInfo.Channel.Phase.Name;

                    int samplesPerCycle = Transform.CalculateSamplesPerCycle(ds.SampleRate, Fbase);

                    List<DataPoint> firstCycle = ds.DataPoints.Take(samplesPerCycle).ToList();
                    List<DataPoint> lastCycle = ds.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                    List<DataPoint> fullWaveFormPre = ds.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = firstCycle[index % samplesPerCycle].Value - dataPoint.Value }).ToList();
                    List<DataPoint> fullWaveFormPost = ds.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = lastCycle[index % samplesPerCycle].Value - dataPoint.Value }).OrderBy(x => x.Time).ToList();

                    dataLookup.Add(new D3Series()
                    {

                        Unit = "Voltage",
                        Color = GetColor(ds.SeriesInfo.Channel),
                        LegendVGroup = "",
                        LegendVertical = DisplayPhaseName(ds.SeriesInfo.Channel.Phase),
                        LegendHorizontal = "Pre",
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        BaseValue = ds.SeriesInfo.Channel.Asset.VoltageKV,
                        DataMarker = new List<double[]>(),
                        DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()


                    }) ;
                    dataLookup.Add(new D3Series()
                    {
                        Unit = "Voltage",
                        Color = GetColor(ds.SeriesInfo.Channel),
                        LegendVGroup = "",
                        LegendVertical = DisplayPhaseName(ds.SeriesInfo.Channel.Phase),
                        LegendHorizontal = "Post",
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        BaseValue = ds.SeriesInfo.Channel.Asset.VoltageKV,
                        DataMarker = new List<double[]>(),
                        DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                    });
                }
            }

            return dataLookup;
        }

        #endregion


        #region [ Clipped Waveforms ]

        [Route("GetClippedWaveformsData"), HttpGet]
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
                    List<D3Series> returnList = GetClippedWaveformsLookup(dataGroup);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        public List<D3Series> GetClippedWaveformsLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

           
            List<DataSeries> vAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();


            dataLookup = dataLookup.Concat(vAN.Select(x => GenerateFixedWaveform( x, "VAN"))).ToList();
            dataLookup = dataLookup.Concat(vBN.Select(x => GenerateFixedWaveform( x, "VBN"))).ToList();
            dataLookup = dataLookup.Concat(vCN.Select(x => GenerateFixedWaveform( x, "VCN"))).ToList();

            dataLookup = dataLookup.Concat(iAN.Select(x => GenerateFixedWaveform( x, "IAN"))).ToList();
            dataLookup = dataLookup.Concat(iBN.Select(x => GenerateFixedWaveform( x, "IBN"))).ToList();
            dataLookup = dataLookup.Concat(iCN.Select(x => GenerateFixedWaveform( x, "ICN"))).ToList();

            return dataLookup;
        }

        private static D3Series GenerateFixedWaveform(DataSeries dataSeries, string label)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, Fbase);
            var groupedByCycle = dataSeries.DataPoints.Select((Point, Index) => new { Point, Index }).GroupBy((Point) => Point.Index / samplesPerCycle).Select((grouping) => grouping.Select((obj) => obj.Point));

            string type = dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Current" ? "I" : "V";

            D3Series fitWave = new D3Series()
            {

                Unit = dataSeries.SeriesInfo.Channel.MeasurementType.Name,
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = (type == "V" ? dataSeries.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = type,
                LegendVGroup = "",
                LegendClass = "",
                SecondaryLegendClass = type,
                DataPoints = new List<double[]>()
            };

            double max = dataSeries.DataPoints.Select(point => point.Value).Max();
            double min = dataSeries.DataPoints.Select(point => point.Value).Min();

            D3Series dt = GetFirstDerivativeSeries(dataSeries, "", "", "");

            fitWave.DataPoints = dataSeries.DataPoints.Select(point => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).OrderBy(item => item[0]).ToList();

            // Find Section that meet Threshold Criteria of close to top/bottom and low derrivative
            double threshold = 1E-3;
            double relativeThreshold = threshold * (max - min);

            int npoints = dataSeries.DataPoints.Count();
            List<bool> isClipped = new List<bool>();
            double[] distToTop = dataSeries.DataPoints.Select(point => Math.Abs(point.Value - max)).ToArray();
            double[] distToBottom = dataSeries.DataPoints.Select(point => Math.Abs(point.Value - min)).ToArray();

            isClipped = dt.DataPoints.Select((item, index) => (Math.Abs(item[1]) < threshold) && (Math.Min(distToTop[index], distToBottom[index]) < relativeThreshold)).ToList();

            List<int[]> section = new List<int[]>();


            while (isClipped.Any(item => item == true))
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
                int endRecovery = end + length / 2;

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


                SineWave sineWave = WaveFit.SineFit(filteredDataPoints.Select(item => item[1]).ToArray(), filteredDataPoints.Select(item => item[0] / 1000.0D).ToArray(), Fbase);

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
        [Route("GetHarmonicSpectrumData"), HttpGet]
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
                   

                    double startTime = query.ContainsKey("startDate") ? double.Parse(query["startDate"]) : evt.StartTime.Subtract(m_epoch).TotalMilliseconds;

                    DataGroup dataGroup = QueryDataGroup(eventId, meter);

                    List<D3Series> returnList = GetHarmonicSpectrumLookup(dataGroup, startTime, cycles);


                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;
                    return returnDict;
                }

            }, cancellationToken);
        }

        public static List<D3Series> GetHarmonicSpectrumLookup(DataGroup dataGroup, double startTime, int cycles)
        {
            List<D3Series> dataLookup = new List<D3Series>();


            List<DataSeries> vAN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            dataLookup = dataLookup.Concat(vAN.SelectMany(item => GenerateHarmonicSpectrum( item, startTime, cycles))).ToList();
            dataLookup = dataLookup.Concat(vBN.SelectMany(item => GenerateHarmonicSpectrum( item, startTime, cycles))).ToList();
            dataLookup = dataLookup.Concat(vCN.SelectMany(item => GenerateHarmonicSpectrum( item, startTime, cycles))).ToList();

            dataLookup = dataLookup.Concat(iAN.SelectMany(item => GenerateHarmonicSpectrum( item, startTime, cycles))).ToList();
            dataLookup = dataLookup.Concat(iBN.SelectMany(item => GenerateHarmonicSpectrum( item, startTime, cycles))).ToList();
            dataLookup = dataLookup.Concat(iCN.SelectMany(item => GenerateHarmonicSpectrum( item, startTime, cycles))).ToList();

            return dataLookup;
        }

        private static List<D3Series> GenerateHarmonicSpectrum(DataSeries dataSeries, double startTime, int cycles)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, Fbase);

            List<DataPoint> cycleData = dataSeries.DataPoints.SkipWhile(point => point.Time.Subtract(m_epoch).TotalMilliseconds < startTime).Take(samplesPerCycle * cycles).ToList();
            D3Series fftMag = new D3Series()
            {
                Unit = dataSeries.SeriesInfo.Channel.MeasurementType.Name,
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? dataSeries.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? "V" : "I"),
                DataMarker = new List<double[]>(),
                LegendVGroup = "Mag",
                DataPoints = new List<double[]>()
            };

            D3Series fftAng = new D3Series()
            {
                Unit = "Angle",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? dataSeries.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? "V" : "I"),
                DataMarker = new List<double[]>(),
                LegendVGroup = "Ang",
                DataPoints = new List<double[]>(),
            };

            if (cycleData.Count() != samplesPerCycle * cycles)
                return new List<D3Series>();

            double[] points = cycleData.Select(point => point.Value / samplesPerCycle).ToArray();

            FFT fft = new FFT(Fbase * samplesPerCycle, points);

            fftMag.DataPoints = fft.Magnitude.Select((value, index) => new double[] { fft.Frequency[index], (value / cycles) / Math.Sqrt(2) }).ToList();
            fftAng.DataPoints = fft.Angle.Select((value, index) => new double[] { fft.Frequency[index], value * 180 / Math.PI }).ToList();

            return new List<D3Series>() { fftMag, fftAng };

        }

        #endregion

        #region [ LowPassFilter ]

        [Route("GetLowPassFilterData"), HttpGet]
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
                    List<D3Series> returnList = GetLowPassFilterLookup(dataGroup, filterOrder);


                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        public List<D3Series> GetLowPassFilterLookup(DataGroup dataGroup, int order)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            List<DataSeries> vAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            

            Filter LPF = Filter.LPButterworth(120.0, order);

            dataLookup.AddRange(vAN.Select(item => FilteredPassSignal(LPF, item)));
            dataLookup.AddRange(vBN.Select(item => FilteredPassSignal(LPF, item)));
            dataLookup.AddRange(vCN.Select(item => FilteredPassSignal(LPF, item)));

            dataLookup.AddRange(iAN.Select(item => FilteredPassSignal(LPF, item)));
            dataLookup.AddRange(iBN.Select(item => FilteredPassSignal(LPF, item)));
            dataLookup.AddRange(iCN.Select(item => FilteredPassSignal(LPF, item)));

            return dataLookup;
        }

        public D3Series FilteredPassSignal(Filter Filt, DataSeries Data)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(Data.SampleRate, Fbase);
            List<DataPoint> points = Data.DataPoints;

            double[] results = Filt.filtfilt(points.Select(x => x.Value).ToArray(), samplesPerCycle * Fbase);

            return new D3Series()
            {
                Unit = Data.SeriesInfo.Channel.MeasurementType.Name,
                Color = GetColor(Data.SeriesInfo.Channel),
                BaseValue = (Data.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? Data.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, Data.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = Data.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(Data.SeriesInfo.Channel.Phase),
                LegendHorizontal = (Data.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? "V" : "I"),
                LegendVGroup = "",
                DataPoints = results.Select((point, index) => new double[] { points[index].Time.Subtract(m_epoch).TotalMilliseconds, point }).ToList()
            };
        
        }

        #endregion

        #region [ High Pass Filter ]

        [Route("GetHighPassFilterData"), HttpGet]
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

                    List<D3Series> returnList = GetHighPassFilterLookup(dataGroup, filterOrder);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        public List<D3Series> GetHighPassFilterLookup(DataGroup dataGroup, int order)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            List<DataSeries> vAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();



            Filter HPF = Filter.HPButterworth(120.0, order);

            dataLookup.AddRange(vAN.Select(item => FilteredPassSignal(HPF, item)));
            dataLookup.AddRange(vBN.Select(item => FilteredPassSignal(HPF, item)));
            dataLookup.AddRange(vCN.Select(item => FilteredPassSignal(HPF, item)));

            dataLookup.AddRange(iAN.Select(item => FilteredPassSignal(HPF, item)));
            dataLookup.AddRange(iBN.Select(item => FilteredPassSignal(HPF, item)));
            dataLookup.AddRange(iCN.Select(item => FilteredPassSignal(HPF, item)));

            return dataLookup;
        }

        #endregion


        #region [ Overlapping Waveform ]
        [Route("GetOverlappingWaveformData"), HttpGet]
        public Task<JsonReturn> GetOverlappingWaveformData(CancellationToken cancellationToken)
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

                    List<D3Series> returnList = GetOverlappingWaveformLookup(dataGroup);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        public List<D3Series> GetOverlappingWaveformLookup(DataGroup dataGroup)
        {
            

            List<D3Series> dataLookup = new List<D3Series>();

            List<DataSeries> vAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();


            dataLookup = dataLookup.Concat(vAN.Select(item => GenerateOverlappingWaveform(item))).ToList();
            dataLookup = dataLookup.Concat(vBN.Select(item => GenerateOverlappingWaveform(item))).ToList();
            dataLookup = dataLookup.Concat(vCN.Select(item => GenerateOverlappingWaveform(item))).ToList();

            dataLookup = dataLookup.Concat(iAN.Select(item => GenerateOverlappingWaveform(item))).ToList();
            dataLookup = dataLookup.Concat(iBN.Select(item => GenerateOverlappingWaveform(item))).ToList();
            dataLookup = dataLookup.Concat(iCN.Select(item => GenerateOverlappingWaveform(item))).ToList();

            return dataLookup;
        }

        private D3Series GenerateOverlappingWaveform(DataSeries dataSeries)
        {

            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, Fbase);
            var cycles = dataSeries.DataPoints.Select((Point, Index) => new { Point, SampleIndex = Index % samplesPerCycle, GroupIndex = Index / samplesPerCycle }).GroupBy(point => point.GroupIndex);

            double factor = 1000.0D / dataSeries.SampleRate;
            D3Series series = new D3Series()
            {
                Unit = dataSeries.SeriesInfo.Channel.MeasurementType.Name,
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? dataSeries.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? "V" : "I"),
                LegendVGroup = "",
                DataPoints = new List<double[]>()
            };

            foreach (var cycle in cycles)
            {
                series.DataPoints = series.DataPoints.Concat(cycle.Select(dataPoint => new double[] { dataPoint.SampleIndex* factor, dataPoint.Point.Value }).ToList()).ToList();
                series.DataPoints = series.DataPoints.Concat(new List<double[]> { new double[] { double.NaN, double.NaN } }).ToList();

            }

            return series;
        }
        #endregion

        #region [ Rapid Voltage Change ]

        [Route("GetRapidVoltageChangeData"), HttpGet]
        public Task<JsonReturn> GetRapidVoltageChangeData(CancellationToken cancellationToken)
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
                    List<D3Series> returnList = GetRapidVoltageChangeLookup(vICycleDataGroup);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        public List<D3Series> GetRapidVoltageChangeLookup(VICycleDataGroup vICycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            foreach (CycleDataGroup dg in vICycleDataGroup.CycleDataGroups)
            {
                if (dg.RMS.SeriesInfo.Channel.MeasurementType.Name == "Voltage")
                {
                    dataLookup.Add(GetRapidVoltageChangeFlotSeries(dg.RMS));
                }
            }

            return dataLookup;
        }

        private D3Series GetRapidVoltageChangeFlotSeries(DataSeries dataSeries)
        {
            
                double nominalVoltage = dataSeries.SeriesInfo.Channel.Asset.VoltageKV * 1000.0D;

                double lastY = 0;
                double lastX = 0;

                D3Series series = new D3Series()
                {
                    Unit = "Voltage",
                    Color = GetColor(dataSeries.SeriesInfo.Channel),
                    BaseValue = dataSeries.SeriesInfo.Channel.Asset.VoltageKV,
                    LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                    LegendHorizontal = "",
                    LegendVGroup = GetVoltageType(dataSeries.SeriesInfo.Channel),
                    DataPoints = dataSeries.DataPoints.Select((point, index) => {
                        double x = point.Time.Subtract(m_epoch).TotalMilliseconds;
                        double y = point.Value;

                        if (index == 0)
                        {
                            lastY = y;
                        }

                        double[] arr = new double[] { x, (y - lastY) * 100 / nominalVoltage };

                        lastY = y;
                        lastX = x;
                        return arr;
                    }).ToList()
                };

                return series;
            
        }

        #endregion


        #region [ Symmetrical Components  ]
        [Route("GetSymmetricalComponentsData"), HttpGet]
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

                    List<D3Series> returnList = GetSymmetricalComponentsLookup(vICycleDataGroup);


                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;


                    return returnDict;


                }

            }, cancellationToken);
        }

        public List<D3Series> GetSymmetricalComponentsLookup(VICycleDataGroup vICycleDataGroup)
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
                    Unit = "Voltage",
                    Color = "VS0",
                    BaseValue = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.VoltageKV,
                    LegendGroup = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "Zero",
                    LegendHorizontal = "V",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S0.Magnitude }).ToList()

                });
                dataLookup.Add(new D3Series()
                {
                    Unit = "Voltage",
                    Color = "VS1",
                    BaseValue = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.VoltageKV,
                    LegendGroup = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "Pos",
                    LegendHorizontal = "V",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S1.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    Unit = "Voltage",
                    Color = "VS2",
                    BaseValue = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.VoltageKV,
                    LegendGroup = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "Neg",
                    LegendHorizontal = "V",
                    LegendVGroup = "",
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
                    Unit = "Current",
                    Color = "IS0",
                    BaseValue = GetIbase(Sbase,vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "Zero",
                    LegendHorizontal = "I",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S0.Magnitude }).ToList()

                });
                dataLookup.Add(new D3Series()
                {
                    Unit = "Current",
                    Color = "IS1",
                    BaseValue = GetIbase(Sbase, vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "Pos",
                    LegendHorizontal = "I",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S1.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    Unit = "Current",
                    Color = "IS2",
                    BaseValue = GetIbase(Sbase, vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.VoltageKV),
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "Neg",
                    LegendHorizontal = "I",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S2.Magnitude }).ToList()
                });

            }

            return dataLookup;
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
        [Route("GetUnbalanceData"), HttpGet]
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
                    List<D3Series> returnList = GetUnbalanceLookup(vICycleDataGroup);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        public List<D3Series> GetUnbalanceLookup(VICycleDataGroup vICycleDataGroup)
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
                    Unit = "Unbalance",
                    Color = "VS0",
                    BaseValue = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.VoltageKV,
                    LegendGroup = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "S0/S1",
                    LegendHorizontal = "V",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S0.Magnitude / point.S1.Magnitude }).ToList()

                });

                dataLookup.Add(new D3Series()
                {
                    Unit = "Unbalance",
                    Color = "VS2",
                    BaseValue = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.VoltageKV,
                    LegendGroup = vICycleDataGroup.VA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "S2/S1",
                    LegendHorizontal = "V",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { va[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S2.Magnitude / point.S1.Magnitude }).ToList()

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
                    Unit = "Unbalance",
                    Color = "IS0",
                    BaseValue = 1.0,
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "S0/S1",
                    LegendHorizontal = "I",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S0.Magnitude / point.S1.Magnitude }).ToList()

                });

                dataLookup.Add(new D3Series()
                {
                    Unit = "Unbalance",
                    Color = "IS2",
                    BaseValue = 1.0,
                    LegendGroup = vICycleDataGroup.IA.RMS.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "S2/S1",
                    LegendHorizontal = "I",
                    LegendVGroup = "",
                    DataPoints = sequencComponents.Select((point, index) => new double[] { ia[index].Time.Subtract(m_epoch).TotalMilliseconds, point.S2.Magnitude / point.S1.Magnitude }).ToList()

                });


            }

            return dataLookup;
        }

        #endregion

        #region [ Rectifier ]
        [Route("GetRectifierData"), HttpGet]
        public Task<JsonReturn> GetRectifierData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    double TRC = double.Parse(query["Trc"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;

                    VIDataGroup dataGroup = new VIDataGroup(QueryDataGroup(evt.ID, meter));

                    List<D3Series> returnList = GetRectifierLookup(dataGroup, TRC);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;


                }

            }, cancellationToken);
        }

        public List<D3Series> GetRectifierLookup(VIDataGroup dataGroup, double RC)
        {
           
            List<D3Series> dataLookup = new List<D3Series>();
            if (dataGroup.VA == null)
                return dataLookup;

            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataGroup.VA, Fbase);


            if (dataGroup.VA != null && dataGroup.VB != null && dataGroup.VC != null)
            {


                IEnumerable<DataPoint> phaseMaxes = dataGroup.VA.DataPoints.Select((point, index) => new DataPoint() { Time = point.Time, Value = new double[] { Math.Abs(dataGroup.VA[index].Value), Math.Abs(dataGroup.VB[index].Value), Math.Abs(dataGroup.VC[index].Value) }.Max() });

                // Run Through RC Filter
                if (RC > 0)
                {
                    double wc = 2.0D * Math.PI * 1.0D / (RC / 1000.0D);
                    Filter filt = new Filter(new List<Complex>() { -wc }, new List<Complex>(), wc);

                    phaseMaxes = phaseMaxes.OrderBy(item => item.Time);
                    double[] points = phaseMaxes.Select(item => item.Value).ToArray();

                    double[] filtered = filt.filt(points, samplesPerCycle * Fbase);

                    phaseMaxes = phaseMaxes.Select((point, index) => new DataPoint() { Time = point.Time, Value = filtered[index] });
                }

                dataLookup.Add(new D3Series()
                {
                    Unit = "Voltage",
                    Color = "Vdc",
                    BaseValue = 1.0,
                    LegendGroup = "",
                    DataMarker = new List<double[]>(),
                    LegendVertical = "",
                    LegendHorizontal = "V",
                    LegendVGroup = dataGroup.VA.SeriesInfo.Channel.Asset.AssetName,
                    DataPoints = phaseMaxes.Select(point => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });

            }


            if (dataGroup.IA != null && dataGroup.IB != null && dataGroup.IC != null)
            {
                IEnumerable<DataPoint> phaseMaxes = dataGroup.IA.DataPoints.Select((point, index) => new DataPoint() { Time = point.Time, Value = new double[] { Math.Abs(dataGroup.IA[index].Value), Math.Abs(dataGroup.IB[index].Value), Math.Abs(dataGroup.IC[index].Value) }.Max() });


                dataLookup.Add(new D3Series()
                {
                    Unit = "Current",
                    Color = "Idc",
                    BaseValue = 1.0,
                    LegendGroup = dataGroup.VA.SeriesInfo.Channel.Asset.AssetName,
                    DataMarker = new List<double[]>(),
                    LegendVertical = "",
                    LegendHorizontal = "I",
                    LegendVGroup = "",
                    DataPoints = phaseMaxes.Select(point => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });

            }



            return dataLookup;
        }

        #endregion

        #region [ Frequency ]
        [Route("GetFrequencyData"), HttpGet]
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


                    List<D3Series> returnList = GetFrequencyLookup(new VIDataGroup(dataGroup));

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        public List<D3Series> GetFrequencyLookup(VIDataGroup dataGroup)
        {
            IEnumerable<D3Series> dataLookup = new List<D3Series>();

            

            List<DataSeries> vAN = dataGroup.Data.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.Data.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.Data.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            dataLookup = dataLookup.Concat(vAN.Select(item => GenerateFrequency(item, "Va")));
            dataLookup = dataLookup.Concat(vBN.Select(item => GenerateFrequency( item, "Vb")));
            dataLookup = dataLookup.Concat(vCN.Select(item => GenerateFrequency( item, "Vc")));

            D3Series fVa = null;
            D3Series fVb = null;
            D3Series fVc = null;



            if (dataGroup.VA != null)
            {
                fVa = GenerateFrequency( dataGroup.VA, "Va");
            }
            if (dataGroup.VB != null)
            {
                fVb = GenerateFrequency( dataGroup.VB, "Vb");
            }
            if (dataGroup.VC != null)
            {
                fVc = GenerateFrequency( dataGroup.VC, "Vc");
            }


            List<D3Series> result = dataLookup.ToList();

            if (fVa != null || fVb != null || fVc != null)
                result.Add(AvgFilter(fVa, fVb, fVc));

            return result;
        }

        private D3Series GenerateFrequency(DataSeries dataSeries, string label)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, Fbase);

            D3Series fitWave = new D3Series()
            {
                Unit = "Freq",
                Color = GetFrequencyColor(dataSeries.SeriesInfo.Channel.Phase.Name),
                BaseValue = Fbase,
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = "",
                LegendVGroup = "",               
                DataPoints = new List<double[]>()
            };

            double thresholdValue = 0;

            var crosses = dataSeries.DataPoints.Zip(dataSeries.DataPoints.Skip(1), (Point1, Point2) => new { Point1, Point2 }).Where(obj => obj.Point1.Value * obj.Point2.Value < 0 || obj.Point1.Value == 0).Select(obj => {
                double slope = (obj.Point2.Value - obj.Point1.Value) / (obj.Point2.Time - obj.Point1.Time).Ticks;
                DateTime interpolatedCrossingTime = m_epoch.AddTicks((long)Math.Round((thresholdValue - obj.Point1.Value) / slope + obj.Point1.Time.Subtract(m_epoch).Ticks));
                return new DataPoint { Time = interpolatedCrossingTime, Value = thresholdValue };

            }).ToList();

            fitWave.DataPoints = crosses.Zip(crosses.Skip(2), (Point1, Point2) => {
                double frequency = 1 / (Point2.Time - Point1.Time).TotalSeconds;
                return new double[] { Point1.Time.Subtract(m_epoch).TotalMilliseconds, frequency };

            }).ToList();

            return fitWave;
        }

        private D3Series AvgFilter(D3Series Va, D3Series Vb, D3Series Vc)
        {
            D3Series result = new D3Series()
            {
                Unit = "Freq",
                Color = GetFrequencyColor("Avg"),
                BaseValue = Fbase,
                LegendGroup = "System",
                DataMarker = new List<double[]>(),
                LegendVertical = "Avg",
                LegendHorizontal = "",
                LegendVGroup = "",
                
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
                Unit = "Freq",
                Color = GetFrequencyColor("Avg"),
                BaseValue = Fbase,
                LegendGroup = "System",
                DataMarker = new List<double[]>(),
                LegendVertical = "Avg",
                LegendHorizontal = "",
                LegendVGroup = "",
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


        #region [ THD ]

        [Route("GetTHDData"), HttpGet]
        public Task<JsonReturn> GetTHDData(CancellationToken cancellationToken)
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
                    List<D3Series> returnList = GetTHDLookup(dataGroup);


                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;

                    return returnDict;
                }

            }, cancellationToken);
        }

        public List<D3Series> GetTHDLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

           

            List<DataSeries> vAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            dataLookup = dataLookup.Concat(vAN.Select(item => GenerateTHD( item))).ToList();
            dataLookup = dataLookup.Concat(vBN.Select(item => GenerateTHD( item))).ToList();
            dataLookup = dataLookup.Concat(vCN.Select(item => GenerateTHD( item))).ToList();

            dataLookup = dataLookup.Concat(iAN.Select(item => GenerateTHD( item))).ToList();
            dataLookup = dataLookup.Concat(iBN.Select(item => GenerateTHD( item))).ToList();
            dataLookup = dataLookup.Concat(iCN.Select(item => GenerateTHD( item))).ToList();


            return dataLookup;
        }

        private D3Series GenerateTHD( DataSeries dataSeries)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, Fbase);

            D3Series thd = new D3Series()
            {
                Unit = "THD",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = 1,
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage"? "V" : "I"),
                LegendVGroup = "",
                DataPoints = new List<double[]>()
            };

            //Limit to 100 pts per cycle
            int step = (int)Math.Floor(samplesPerCycle / 100.0D);
            if (step == 0)
                step = 1;

            int size = (dataSeries.DataPoints.Count - samplesPerCycle) / step;

            double[][] dataArr = new double[(size + 1)][];
            int j = 0;
            for (int i = 0; i < dataSeries.DataPoints.Count - samplesPerCycle; i += step)
            {

                double[] points = dataSeries.DataPoints.Skip(i).Take(samplesPerCycle).Select(point => point.Value / samplesPerCycle).ToArray();
                FFT fft = new FFT(Fbase * samplesPerCycle, points);


                double rmsHarmSum = fft.Magnitude.Where((value, index) => index != 1).Select(value => Math.Pow(value, 2)).Sum();
                double rmsHarm = fft.Magnitude[1];
                double thdValue = 100 * Math.Sqrt(rmsHarmSum) / rmsHarm;

                dataArr[j] = new double[] { dataSeries.DataPoints[i].Time.Subtract(m_epoch).TotalMilliseconds, thdValue };
                j++;
            }

            thd.DataPoints = dataArr.ToList();
            return thd;
        }

        #endregion

        #region [ Specified Harmonic ]

        [Route("GetSpecifiedHarmonicData"), HttpGet]
        public Task<JsonReturn> GetSpecifiedHarmonicData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    int specifiedHarmonic = int.Parse(query["specifiedHarmonic"]);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");
                    DataGroup dataGroup = QueryDataGroup(evt.ID, meter);
                    List<D3Series> returnList = GetSpecifiedHarmonicLookup(dataGroup, specifiedHarmonic);

                    JsonReturn returnDict = new JsonReturn();
                    returnDict.Data = returnList;


                    return returnDict;
                }

            }, cancellationToken);
        }

        public List<D3Series> GetSpecifiedHarmonicLookup(DataGroup dataGroup, int specifiedHarmonic)
        {
            List<D3Series> dataLookup = new List<D3Series>();

           
            List<DataSeries> vAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            dataLookup = dataLookup.Concat(vAN.SelectMany(item => GenerateSpecifiedHarmonic( item, specifiedHarmonic))).ToList();
            dataLookup = dataLookup.Concat(vBN.SelectMany(item => GenerateSpecifiedHarmonic( item, specifiedHarmonic))).ToList();
            dataLookup = dataLookup.Concat(vCN.SelectMany(item => GenerateSpecifiedHarmonic( item, specifiedHarmonic))).ToList();

            dataLookup = dataLookup.Concat(iAN.SelectMany(item => GenerateSpecifiedHarmonic( item, specifiedHarmonic))).ToList();
            dataLookup = dataLookup.Concat(iBN.SelectMany(item => GenerateSpecifiedHarmonic( item, specifiedHarmonic))).ToList();
            dataLookup = dataLookup.Concat(iCN.SelectMany(item => GenerateSpecifiedHarmonic( item, specifiedHarmonic))).ToList();

            return dataLookup;
        }

        private static IEnumerable<D3Series> GenerateSpecifiedHarmonic( DataSeries dataSeries, int specifiedHarmonic)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, Fbase);

            D3Series SpecifiedHarmonicMag = new D3Series()
            {
                Unit = dataSeries.SeriesInfo.Channel.MeasurementType.Name,
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage"? dataSeries.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? "V Mag" : "I Mag"),
                LegendVGroup = "",               
                DataPoints = new List<double[]>()
            };

            D3Series SpecifiedHarmonicAng = new D3Series()
            {
                Unit = "Angle",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? dataSeries.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? "V Ang" : "I Ang"),
                LegendVGroup = "",
                DataPoints = new List<double[]>()
            };

            //Limit to 100 pts per cycle
            int step = (int)Math.Floor(samplesPerCycle / 100.0D);
            if (step == 0)
                step = 1;

            int size = (dataSeries.DataPoints.Count - samplesPerCycle)/ step;
            double[][] dataArrHarm = new double[size+1][];
            double[][] dataArrAngle = new double[size+1][];

            double specifiedFrequency = Fbase * specifiedHarmonic;
            double freq = Fbase;

           

            int j = 0;
            for (int i=0; i < dataSeries.DataPoints.Count - samplesPerCycle; i += step)
            {
                double[] points = dataSeries.DataPoints.Skip(i).Take(samplesPerCycle).Select(point => point.Value / samplesPerCycle).ToArray();
               

                FFT fft = new FFT(freq * samplesPerCycle, points);

                int index = Array.FindIndex(fft.Frequency, value => Math.Round(value) == specifiedFrequency);

                dataArrHarm[j] = new double[] { dataSeries.DataPoints[i].Time.Subtract(m_epoch).TotalMilliseconds, fft.Magnitude[index] / Math.Sqrt(2) };
                dataArrAngle[j] = new double[] { dataSeries.DataPoints[i].Time.Subtract(m_epoch).TotalMilliseconds, fft.Angle[index] * 180 / Math.PI };
                j++;
            }

            SpecifiedHarmonicMag.DataPoints = dataArrHarm.ToList();
            SpecifiedHarmonicAng.DataPoints = dataArrAngle.ToList();

            return new List<D3Series>() { SpecifiedHarmonicMag, SpecifiedHarmonicAng };
        }
        #endregion


        #region [ Relay Voltages ]
            // Just needs to pull Voltages from all connected Relays
        #endregion


        #region [ TCE Analysis]
            // Needs to pull TCE and add points of interest per Tonys email
        #endregion

        #region [Breaker Restrike Data]

        [Route("GetBreakerRestrikeData"), HttpGet]
        public JsonReturn GetBreakerRestrikeData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {

                Dictionary<string, string> query = Request.QueryParameters();

                int eventId = int.Parse(query["eventId"]);

                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                DataGroup dataGroup = QueryDataGroup(eventId, meter);
                List<D3Series> returnList = GetBreakerRestrikeData(evt.ID, dataGroup);

                JsonReturn returnDict = new JsonReturn();


                returnDict.Data = returnList;
                return returnDict;

            }

        }

        private List<D3Series> GetBreakerRestrikeData(int eventID, DataGroup dataGroup)
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                List<D3Series> currents;
                List<D3Series> voltages;

                TableOperations<BreakerRestrike> restrikeTbl = new TableOperations<BreakerRestrike>(connection);

                if (restrikeTbl.QueryRecordCountWhere("EventID = {0}", eventID) == 0)
                    return new List<D3Series>();



                currents = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Current" &&
                    restrikeTbl.QueryRecordCountWhere("EventID = {0} AND PhaseID = {1}", eventID, ds.SeriesInfo.Channel.PhaseID) > 0).Select(
                        ds => new D3Series()
                        {
                            Unit = "Current",
                            Color = GetColor(ds.SeriesInfo.Channel),
                            BaseValue = GetIbase(Sbase, ds.SeriesInfo.Channel.Asset.VoltageKV),
                            LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                            LegendVertical = DisplayPhaseName(ds.SeriesInfo.Channel.Phase),
                            LegendHorizontal = "I",
                            LegendVGroup = "",
                            DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                            DataMarker = new List<double[]>()
                        }).ToList();

                voltages = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage" &&
                    restrikeTbl.QueryRecordCountWhere("EventID = {0} AND PhaseID = {1}", eventID, ds.SeriesInfo.Channel.PhaseID) > 0).Select(
                        ds => new D3Series()
                        {
                            Unit = "Voltage",
                            Color = GetColor(ds.SeriesInfo.Channel),
                            BaseValue = ds.SeriesInfo.Channel.Asset.VoltageKV,
                            LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                            LegendVertical = DisplayPhaseName(ds.SeriesInfo.Channel.Phase),
                            LegendHorizontal = "V",
                            LegendVGroup = "",
                            DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                            DataMarker = new List<double[]>()
                        }).ToList();

                currents.ForEach(item =>
                {
                    item.DataMarker = new List<double[]>();

                    restrikeTbl.QueryRecordsWhere("EventID = {0} AND PhaseID = (SELECT ID FROM PHASE WHERE Name = {1})", eventID, item.SecondaryLegendClass).ToList().ForEach(restrike =>
                    {
                        item.DataMarker.Add(item.DataPoints[restrike.InitialExtinguishSample]);
                        item.DataMarker.Add(item.DataPoints[restrike.RestrikeSample]);
                        item.DataMarker.Add(item.DataPoints[restrike.FinalExtinguishSample]);

                    });

                });

                voltages.ForEach(item =>
                {
                    item.DataMarker = new List<double[]>();

                    restrikeTbl.QueryRecordsWhere("EventID = {0} AND PhaseID = (SELECT ID FROM PHASE WHERE Name = {1})", eventID, item.SecondaryLegendClass).ToList().ForEach(restrike =>
                    {
                        item.DataMarker.Add(item.DataPoints[restrike.InitialExtinguishSample]);
                        item.DataMarker.Add(item.DataPoints[restrike.RestrikeSample]);
                        item.DataMarker.Add(item.DataPoints[restrike.TransientPeakSample]);

                    });

                });

                return voltages.Concat(currents).ToList();

            }
        }

        #endregion

        #region [ FFT ]
        [Route("GetFFTData"), HttpGet]
        public Task<JsonReturn> GetFFTData(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    Dictionary<string, string> query = Request.QueryParameters();
                    int eventId = int.Parse(query["eventId"]);
                    int cycles = query.ContainsKey("cycles") ? int.Parse(query["cycles"]) : 1;

                    Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                    double startTime = query.ContainsKey("startDate") ? double.Parse(query["startDate"]) : evt.StartTime.Subtract(m_epoch).TotalMilliseconds;

                    DataGroup dataGroup = QueryDataGroup(eventId, meter);

                    List<D3Series> returnList = GetFFTLookup(dataGroup, startTime, cycles);

                    JsonReturn returnDict = new JsonReturn();

                    returnDict.Data = returnList;


                    return returnDict;
                }

            }, cancellationToken);
        }

        public List<D3Series> GetFFTLookup(DataGroup dataGroup, double startTime, int cycles)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            List<DataSeries> vAN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.ToList().Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            dataLookup = dataLookup.Concat(vAN.SelectMany(item => GenerateFFT( item, startTime, cycles))).ToList();
            dataLookup = dataLookup.Concat(vBN.SelectMany(item => GenerateFFT( item, startTime, cycles))).ToList();
            dataLookup = dataLookup.Concat(vCN.SelectMany(item => GenerateFFT( item, startTime, cycles))).ToList();

            dataLookup = dataLookup.Concat(iAN.SelectMany(item => GenerateFFT( item, startTime, cycles))).ToList();
            dataLookup = dataLookup.Concat(iBN.SelectMany(item => GenerateFFT( item, startTime, cycles))).ToList();
            dataLookup = dataLookup.Concat(iCN.SelectMany(item => GenerateFFT( item, startTime, cycles))).ToList();
            return dataLookup;
        }

        private static List<D3Series> GenerateFFT(DataSeries dataSeries, double startTime, int cycles)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, Fbase);
            var groupedByCycle = dataSeries.DataPoints.Select((Point, Index) => new { Point, Index }).GroupBy((Point) => Point.Index / (samplesPerCycle * cycles)).Select((grouping) => grouping.Select((obj) => obj.Point));

            List<DataPoint> cycleData = dataSeries.DataPoints.SkipWhile(point => point.Time.Subtract(m_epoch).TotalMilliseconds < startTime).Take((samplesPerCycle * cycles)).ToList();
            D3Series fftMag = new D3Series()
            {
                Unit = dataSeries.SeriesInfo.Channel.MeasurementType.Name,
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? dataSeries.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = "Mag",
                LegendVGroup = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? "Volt." : "Curr."),
                DataPoints = new List<double[]>()
            };

            D3Series fftAng = new D3Series()
            {
                Unit = "Angle",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                BaseValue = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? dataSeries.SeriesInfo.Channel.Asset.VoltageKV : GetIbase(Sbase, dataSeries.SeriesInfo.Channel.Asset.VoltageKV)),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                DataMarker = new List<double[]>(),
                LegendVertical = DisplayPhaseName(dataSeries.SeriesInfo.Channel.Phase),
                LegendHorizontal = "Ang",
                LegendVGroup = (dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Voltage" ? "Volt." : "Curr."),
                DataPoints = new List<double[]>()
            };

            if (cycleData.Count() != (samplesPerCycle * cycles))
                return new List<D3Series>();
               
            double[] points = cycleData.Select(point => point.Value / (samplesPerCycle * cycles)).ToArray();

            FFT fft = new FFT(Fbase * (samplesPerCycle), points);

            fftMag.DataPoints = fft.Magnitude.Select((value, index) => new double[] { index, (value / Math.Sqrt(2)) }).ToList();
            fftAng.DataPoints = fft.Angle.Select((value, index) => new double[] { index, (value * 180.0D / Math.PI) }).ToList();

            return new List<D3Series>() { fftMag, fftAng };

        }

        
        #endregion

        #endregion

    }
}