//******************************************************************************************************
//  Analytics.cs - Gbtc
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
using static OpenSEE.OpenSEEController;

namespace OpenSEE
{
    
    public static class Analytics
    {

        #region [ Members ]

        // Fields
        private static DateTime m_epoch = new DateTime(1970, 1, 1);
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

       
        #region [ First Derivative ]
      
        public static List<D3Series> GetFirstDerivativeLookup(DataGroup dataGroup, VICycleDataGroup viCycleDataGroup)
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

        public static D3Series GetFirstDerivativeFlotSeries(DataSeries dataSeries, string label, string legenclass, string type)
        {
            double lastX = 0;
            double lastY = 0;

            D3Series D3Series = new D3Series()
            {
                ChannelID = dataSeries.SeriesInfo.Channel.ID,
                XaxisLabel = OpenSEEController.GetUnits(dataSeries.SeriesInfo.Channel) + "/s",
                Color = OpenSEEController.GetColor(dataSeries.SeriesInfo.Channel),
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

        #region [ Clipped Waveforms ]
        public static List<D3Series> GetClippedWaveformsLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            double systemFrequency;

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            List<DataSeries> vAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            
            dataLookup = dataLookup.Concat(vAN.Select(x => GenerateFixedWaveform(systemFrequency, x, "VAN"))).ToList();
            dataLookup = dataLookup.Concat(vBN.Select(x => GenerateFixedWaveform(systemFrequency, x, "VBN"))).ToList();
            dataLookup = dataLookup.Concat(vCN.Select(x => GenerateFixedWaveform(systemFrequency, x, "VCN"))).ToList();

            dataLookup = dataLookup.Concat(iAN.Select(x => GenerateFixedWaveform(systemFrequency, x, "IAN"))).ToList();
            dataLookup = dataLookup.Concat(iBN.Select(x => GenerateFixedWaveform(systemFrequency, x, "IBN"))).ToList();
            dataLookup = dataLookup.Concat(iCN.Select(x => GenerateFixedWaveform(systemFrequency, x, "ICN"))).ToList();

            return dataLookup;
        }

        private static D3Series GenerateFixedWaveform(double systemFrequency, DataSeries dataSeries, string label)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);
            var groupedByCycle = dataSeries.DataPoints.Select((Point, Index) => new { Point, Index }).GroupBy((Point) => Point.Index / samplesPerCycle).Select((grouping) => grouping.Select((obj) => obj.Point));

            string type = dataSeries.SeriesInfo.Channel.MeasurementType.Name == "Current"? "I": "V";
           
            D3Series fitWave = new D3Series()
            {
                ChannelID = 0,
                ChartLabel = label + " Fixed Clipping",
                XaxisLabel = GetUnits(dataSeries.SeriesInfo.Channel),
                LegendClass = "",
                SecondaryLegendClass = type,
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                DataPoints = new List<double[]>()
            };

            double max = dataSeries.DataPoints.Select(point => point.Value).Max();
            double min = dataSeries.DataPoints.Select(point => point.Value).Min();

            D3Series dt = Analytics.GetFirstDerivativeFlotSeries(dataSeries, "", "", "");

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


                SineWave sineWave = WaveFit.SineFit(filteredDataPoints.Select(item => item[1]).ToArray(), filteredDataPoints.Select(item => item[0] / 1000.0D).ToArray(), systemFrequency);

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

        #region [Frequency]

        public static List<D3Series> GetFrequencyLookup(VIDataGroup dataGroup)
        {
            IEnumerable<D3Series> dataLookup = new List<D3Series>();

            double systemFrequency;

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            List<DataSeries> vAN = dataGroup.Data.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> vBN = dataGroup.Data.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> vCN = dataGroup.Data.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();

            dataLookup = dataLookup.Concat(vAN.Select(item => GenerateFrequency(systemFrequency, item, "Va")));
            dataLookup = dataLookup.Concat(vBN.Select(item => GenerateFrequency(systemFrequency, item, "Vb")));
            dataLookup = dataLookup.Concat(vCN.Select(item => GenerateFrequency(systemFrequency, item, "Vc")));

            D3Series fVa = null;
            D3Series fVb = null;
            D3Series fVc = null;



            if (dataGroup.VA != null)
            {
                fVa = GenerateFrequency(systemFrequency, dataGroup.VA, "Va");
            }
            if (dataGroup.VB != null)
            {
                fVb = GenerateFrequency(systemFrequency, dataGroup.VB, "Vb");
            }
            if (dataGroup.VC != null)
            {
                fVc = GenerateFrequency(systemFrequency, dataGroup.VC, "Vc");
            }


            List<D3Series> result = dataLookup.ToList();

            if (fVa != null || fVb != null || fVc != null)
                result.Add(AvgFilter(fVa, fVb, fVc));

            return result;
        }

        private static D3Series GenerateFrequency(double systemFrequency, DataSeries dataSeries, string label)
        {
            int samplesPerCycle = Transform.CalculateSamplesPerCycle(dataSeries.SampleRate, systemFrequency);

            D3Series fitWave = new D3Series()
            {
                ChartLabel = label + " Frequency",
                ChannelID = 0,
                XaxisLabel = "Hz",
                Color = GetColor(dataSeries.SeriesInfo.Channel),
                LegendClass = "",
                SecondaryLegendClass = (dataSeries.SeriesInfo.Channel.Phase.Name == "CN" ? "C" : (dataSeries.SeriesInfo.Channel.Phase.Name == "BN"? "B" : "A")),
                LegendGroup = dataSeries.SeriesInfo.Channel.Asset.AssetName,
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

        private static D3Series AvgFilter(D3Series Va, D3Series Vb, D3Series Vc)
        {
            D3Series result = new D3Series()
            {
                ChartLabel = "Frequency",
                ChannelID = 0,
                XaxisLabel = "Hz",
                Color = "#a452a4",
                LegendClass = "",
                SecondaryLegendClass = "Avg",
                LegendGroup = "System Average",
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

        private static D3Series MedianFilt(D3Series input)
        {
            D3Series output = new D3Series()
            {
                ChartLabel = "Frequency",
                ChannelID = 0,
                XaxisLabel = "Hz",
                Color = "#a452a4",
                LegendClass = "",
                SecondaryLegendClass = "",
                LegendGroup = "System Average",
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

        #region [ Impedance ]

        public static List<D3Series> GetImpedanceLookup(VICycleDataGroup vICycleDataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();

            if (vICycleDataGroup.IA != null && vICycleDataGroup.VA != null)
            {

                List<DataPoint> Timing = vICycleDataGroup.VA.RMS.DataPoints;
                IEnumerable<Complex> impedancePoints = CalculateImpedance(vICycleDataGroup.VA, vICycleDataGroup.IA);
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "A",
                    LegendGroup = "Reactance",
                    ChartLabel = "Reactance AN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "A",
                    LegendGroup = "Resistance",
                    ChartLabel = "Resistance AN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "A",
                    LegendGroup = "Impedance",
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
                    LegendClass = "",
                    SecondaryLegendClass = "B",
                    LegendGroup = "Reactance",
                    ChartLabel = "Reactance BN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "B",
                    LegendGroup = "Resistance",
                    ChartLabel = "Resistance BN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "",
                    LegendGroup = "B",
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
                    LegendClass = "",
                    SecondaryLegendClass = "C",
                    LegendGroup = "Reactance",
                    ChartLabel = "Reactance CN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "C",
                    LegendGroup = "Resistance",
                    ChartLabel = "Resistance CN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "Ohm",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "C",
                    LegendGroup = "Impedance",
                    ChartLabel = "Impedance CN",
                    DataPoints = impedancePoints.Select((iPoint, index) => new double[] { Timing[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
            }

            return dataLookup;
        }

        private static IEnumerable<Complex> CalculateImpedance(CycleDataGroup Voltage, CycleDataGroup Current)
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

        #region [ Power ]
       
        public static List<D3Series> GetPowerLookup(VICycleDataGroup vICycleDataGroup)
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
                    ChannelID = 0,
                    XaxisLabel = "VAR",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "A",
                    LegendGroup = "Reactive Power",
                    ChartLabel = "AN Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "W",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "A",
                    LegendGroup = "Active Power",
                    ChartLabel = "AN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VA",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "A",
                    LegendGroup = "Apparent Power",
                    ChartLabel = "AN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "pf",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "A",
                    LegendGroup = "Power Factor",
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
                    ChannelID = 0,
                    XaxisLabel = "VAR",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "B",
                    LegendGroup = "Reactive Power",
                    ChartLabel = "BN Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "W",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "B",
                    LegendGroup = "Active Power",
                    ChartLabel = "BN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VA",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "B",
                    LegendGroup = "Apparent Power",
                    ChartLabel = "BN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "pf",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "B",
                    LegendGroup = "Power Factor",
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
                    ChannelID = 0,
                    XaxisLabel = "VAR",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "C",
                    LegendGroup = "Reactive Power",
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
                    SecondaryLegendClass = "C",
                    LegendGroup = "Active Power",
                    ChartLabel = "CN Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VA",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "C",
                    LegendGroup = "Apparent Power",
                    ChartLabel = "CN Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "pf",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "C",
                    LegendGroup = "Power Factor",
                    ChartLabel = "CN Power Factor",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { voltagePointsMag[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real / iPoint.Magnitude }).ToList()
                });

            }

            if (powerPointsAN != null && powerPointsAN.Any() && powerPointsBN != null && powerPointsBN.Any() && powerPointsCN != null && powerPointsCN.Any())
            {
                IEnumerable<Complex> powerPoints = powerPointsAN.Select((pPoint, index) => pPoint + powerPointsBN[index] + powerPointsCN[index]).ToList();


                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VAR",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "Sum",
                    LegendGroup = "Reactive Power",
                    ChartLabel = "Total Reactive Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] {  vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Imaginary
                    }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "W",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "Sum",
                    LegendGroup = "Active Power",
                    ChartLabel = "Total Active Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "VA",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "Sum",
                    LegendGroup = "Apparent Power",
                    ChartLabel = "Total Apparent Power",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Magnitude }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "pf",
                    Color = GetColor(null),
                    LegendClass = "",
                    SecondaryLegendClass = "Sum",
                    LegendGroup = "Power Factor",
                    ChartLabel = "Total Power Factor",
                    DataPoints = powerPointsAN.Select((iPoint, index) => new double[] { vICycleDataGroup.VC.RMS.DataPoints[index].Time.Subtract(m_epoch).TotalMilliseconds, iPoint.Real / iPoint.Magnitude }).ToList()
                });
            }

            return dataLookup;
        }
        #endregion

        #region [ Remove Current ]
        
        public static List<D3Series> GetRemoveCurrentLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();
            double systemFrequency;
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            List<DataSeries> iAN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "AN").ToList();
            List<DataSeries> iBN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "BN").ToList();
            List<DataSeries> iCN = dataGroup.DataSeries.Where(x => x.SeriesInfo.Channel.MeasurementType.Name == "Current" && x.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && x.SeriesInfo.Channel.Phase.Name == "CN").ToList();


            iAN.ForEach(item => {
            
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(item.SampleRate, systemFrequency);

                List<DataPoint> firstCycle = item.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = item.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = item.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = item.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "Pre",
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    ChartLabel = "IAN Pre Fault",
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "Post",
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    ChartLabel = "IAN Post Fault",
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });

            });

            iBN.ForEach(item =>
            {

                int samplesPerCycle = Transform.CalculateSamplesPerCycle(item.SampleRate, systemFrequency);

                List<DataPoint> firstCycle = item.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = item.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = item.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = item.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "Pre",
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    ChartLabel = "IBN Pre Fault",
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "Post",
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    ChartLabel = "IBN Post Fault",
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
            });

            iCN.ForEach(item =>
            {
                int samplesPerCycle = Transform.CalculateSamplesPerCycle(item.SampleRate, systemFrequency);

                List<DataPoint> firstCycle = item.DataPoints.Take(samplesPerCycle).ToList();
                List<DataPoint> lastCycle = item.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                List<DataPoint> fullWaveFormPre = item.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - firstCycle[index % samplesPerCycle].Value }).ToList();
                List<DataPoint> fullWaveFormPost = item.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = dataPoint.Value - lastCycle[index % samplesPerCycle].Value }).OrderBy(x => x.Time).ToList();

                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "Pre",
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,

                    ChartLabel = "ICN Pre Fault",
                    DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
                dataLookup.Add(new D3Series()
                {
                    ChannelID = 0,
                    XaxisLabel = "A",
                    Color = GetColor(item.SeriesInfo.Channel),
                    LegendClass = "",
                    SecondaryLegendClass = "Post",
                    LegendGroup = item.SeriesInfo.Channel.Asset.AssetName,
                    ChartLabel = "ICN Post Fault",
                    DataPoints = fullWaveFormPost.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                });
            });



            return dataLookup;
        }

        #endregion

        #region [ Missing Voltage ]
        
        public static List<D3Series> GetMissingVoltageLookup(DataGroup dataGroup)
        {
            List<D3Series> dataLookup = new List<D3Series>();
            double systemFrequency;

            //deal with the followinf Phases
            List<string> phases = new List<string> { "AN", "BN", "CN" };

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;
            }

            foreach (DataSeries ds in dataGroup.DataSeries)
            {
                if ((ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage") && (ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                    && (phases.Contains(ds.SeriesInfo.Channel.Phase.Name)))
                {
                    string name =  "V"  + ds.SeriesInfo.Channel.Phase.Name;

                    int samplesPerCycle = Transform.CalculateSamplesPerCycle(ds.SampleRate, systemFrequency);

                    List<DataPoint> firstCycle = ds.DataPoints.Take(samplesPerCycle).ToList();
                    List<DataPoint> lastCycle = ds.DataPoints.OrderByDescending(x => x.Time).Take(samplesPerCycle).ToList();

                    List<DataPoint> fullWaveFormPre = ds.DataPoints.Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = firstCycle[index % samplesPerCycle].Value - dataPoint.Value }).ToList();
                    List<DataPoint> fullWaveFormPost = ds.DataPoints.OrderByDescending(x => x.Time).Select((dataPoint, index) => new DataPoint() { Time = dataPoint.Time, Value = lastCycle[index % samplesPerCycle].Value - dataPoint.Value }).OrderBy(x => x.Time).ToList();

                    dataLookup.Add(new D3Series()
                    {
                        ChannelID = 0,
                        XaxisLabel = "V",
                        Color = GetColor(ds.SeriesInfo.Channel),
                        LegendClass = "",
                        SecondaryLegendClass = "Pre",
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        ChartLabel = name + " Pre Fault",
                        DataPoints = fullWaveFormPre.Select((point, index) => new double[] { point.Time.Subtract(m_epoch).TotalMilliseconds, point.Value }).ToList()
                    });
                    dataLookup.Add(new D3Series()
                    {
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


        #endregion


    }
}