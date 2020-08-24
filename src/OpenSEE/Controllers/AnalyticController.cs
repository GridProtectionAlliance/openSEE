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
    public class AnalyticController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);

        private static Random m_random = new Random();


        public class JsonReturn
        {
            public List<D3Series> Data;
            public double EventStartTime;
            public double EventEndTime;
            public double FaultTime;

        }

        // Fields

        #endregion

        #region [ Constructors ]
        public AnalyticController() : base() { }

        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;
        private static double m_cacheSlidingExpiration;

        static AnalyticController()
        {
            s_memoryCache = new MemoryCache("openSEE");

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                m_cacheSlidingExpiration = connection.ExecuteScalar<double?>("SELECT Value FROM Settings WHERE Scope = 'app.setting' AND Name = 'SlidingCacheExpiration'") ?? 2.0;
            }
        }
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

        private string GetFaultDistanceColort(string algorithm)
        {
            string random = string.Format("#{0:X6}", m_random.Next(0x1000001));
            switch (algorithm)
            {
                case ("Simple"):
                    return "faultDistSimple";
                case ("Reactance"):
                    return "faultDistReact";
                case ("Takagi"):
                    return "faultDistTakagi";
                case ("ModifiedTakagi"):
                    return "faultDistModTakagi";
                case ("Novosel"):
                    return "faultDistNovosel";
                case ("DoubleEnded"):
                    return "faultDistDoubleEnd";
                default: 
                    return "random";
            }
        }

        #endregion

        #endregion

    }
}