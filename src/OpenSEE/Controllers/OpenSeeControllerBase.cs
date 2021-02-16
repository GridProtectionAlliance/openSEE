//******************************************************************************************************
//  OpenSEEControllerBase.cs - Gbtc
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
//  09/02/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
using FaultData.DataAnalysis;
using GSF.Data;
using OpenSEE.Model;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.Caching;
using System.Threading.Tasks;
using System.Web.Http;

namespace OpenSEE
{
    public class OpenSEEBaseController : ApiController
    {
        #region [ Members ]

        // Fields
        protected static DateTime m_epoch = new DateTime(1970, 1, 1);
        protected static MemoryCache s_memoryCache;
        protected static Random m_random = new Random();
        protected static double m_cacheSlidingExpiration;

        public class JsonReturn
        {
            public List<D3Series> Data;
            public double EventStartTime;
            public double EventEndTime;
            public double FaultTime;

        }

        public static double Sbase {
            get
            {
                if (m_Sbase != null)
                    return (double)m_Sbase;
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                    m_Sbase = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemMVABase'") ?? 100.0;
                return (double)m_Sbase;
            }
        }

        public static double Fbase
        {
            get
            {
                if (m_Fbase != null)
                    return (double)m_Fbase;
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                    m_Fbase = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'")?? 60.0;
                return (double)m_Fbase;
            }
        }

        public static int DownSampleRate
        {
            get
            {
                if (m_Downsample != null)
                    return (int)m_Downsample;

                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                    m_Downsample = int.Parse(connection.ExecuteScalar<string>("SELECT Value FROM Settings WHERE Name = 'downSample'") ?? "-1");
                return (int)m_Downsample;
            }
        
        }

        private static double? m_Fbase = null;
        private static double? m_Sbase = null;
        private static int? m_Downsample = null;
        #endregion

        #region [ Static ]

        #endregion

        #region [ Methods ]



        /// <summary>
        /// Determines Color based on Channel Information for Full Data Channels
        /// </summary>
        /// <param name="channel">Channel that represents the signal</param>
        /// <returns>A color designation</returns>
        public static string GetColor(Channel channel)
        {

            if (channel == null)
            {
                return "random";
            }

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {

                if (channel.MeasurementType.Name == "Voltage")
                {
                    switch (channel.Phase.Name)
                    {
                        case ("AN"):
                            return "Va";
                        case ("BN"):
                            return "Vb";
                        case ("CN"):
                            return "Vc";
                        case ("AB"):
                            return "Vab";
                        case ("BC"):
                            return "Vbc";
                        case ("CA"):
                            return "Vca";
                        case ("NG"):
                            return "Ires";
                        default: // Should be random
                            return "random";
                    }
                }
                else if (channel.MeasurementType.Name == "Current")
                {
                    switch (channel.Phase.Name)
                    {
                        case ("AN"):
                            return "Ia";
                        case ("BN"):
                            return "Ib";
                        case ("CN"):
                            return "Ic";
                        case ("NG"):
                            return "Ires";
                        case ("RES"):
                            return "Ires";
                        default: // Should be random
                            return "random";
                    }
                }
            }

            //Should be Random
            return "random";

        }

        /// <summary>
        /// Determines Base voltage Value.
        /// </summary>
        /// <param name="channel">The Channel</param>
        /// <param name="rms"> true if Voltage is RMS false if it is pk-pk.</param>
        /// <returns>A Voltage Base Value</returns>
        protected double GetBaseV(Channel channel,bool rms)
        {
            double kV = channel.Asset.VoltageKV;
            if (channel.Phase.Name == "AN" || channel.Phase.Name == "BN" || channel.Phase.Name == "CN")
                kV = kV / Math.Sqrt(3);

            if (!rms)
                kV = kV * Math.Sqrt(2);
            return kV;
        }
        /// <summary>
        /// Determines Color for a FaultDistance Calculation based on the Algorithm.
        /// </summary>
        /// <param name="algorithm">Fault Distance ALgorithm</param>
        /// <returns>A color designation</returns>
        protected string GetFaultDistanceColort(string algorithm)
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

        // <summary>
        /// Determines Color for a Frequency Calculation based on the Phase.
        /// </summary>
        /// <param name="phase">Frequency Phase designation</param>
        /// <returns>A color designation</returns>
        protected string GetFrequencyColor(string phase)
        {
            string random = string.Format("#{0:X6}", m_random.Next(0x1000001));
            switch (phase)
            {
                case ("Avg"):
                    return "freqAll";
                case ("AN"):
                    return "freqVa";
                case ("BN"):
                    return "freqVb";
                case ("CN"):
                    return "freqVc";
                                
                default:
                    return "random";
            }
        }

        /// <summary>
        /// Formats A Phase for Display.
        /// </summary>
        /// <param name="phase">Phase of the signal</param>
        /// <returns>formated Phase Name</returns>
        protected static string DisplayPhaseName(Phase phase)
        {
            Dictionary<string, string> diplayNames = new Dictionary<string, string>()
            {
                { "None", ""}
            };

            string DisplayName;

            if (!diplayNames.TryGetValue(phase.Name, out DisplayName))
                DisplayName = phase.Name;

            return DisplayName;

        }

        /// <summary>
        /// Formats the Voltage type (LL or LN) for Display.
        /// </summary>
        /// <param name="channel">Channel </param>
        /// <returns>formated Voltage Type</returns>
        protected static string GetVoltageType(Channel channel)
        {
            if (channel.MeasurementType.Name == "Voltage")
            {
                if (channel.Phase.Name == "AB" || channel.Phase.Name == "BC" || channel.Phase.Name == "CA")
                {
                    return "L-L";
                }
                else
                {
                    return "L-N";
                }
            }

            return "";
        }

        /// <summary>
        /// Computes the Current Base based on Voltage and Power Base.
        /// </summary>
        /// <param name="Sbase">Power Base </param>
        /// <param name="Vbase">Voltage Base </param>
        /// <returns>Current Base</returns>
        protected static double GetIbase(double Sbase, double Vbase)
        {
            return (Sbase / (Math.Sqrt(3) * Vbase * 1000));
        }

        /// <summary>
        /// Computes the Impedance Base based on Voltage and Power Base.
        /// </summary>
        /// <param name="Sbase">Power Base </param>
        /// <param name="Vbase">Voltage Base </param>
        /// <returns>Imp[edance Base</returns>
        protected static double GetZbase(double Sbase, double Vbase)
        {
            return (Sbase / (Math.Sqrt(3) * Vbase * 1000));
        }

        /// <summary>
        /// Formats a Chart Label consistent of Name, Phase and Type
        /// </summary>
        /// <param name="channel">The Channel from which the Label is generated.</param>
        /// <param name="type">The type of the signal (RMS/Pow...)</param>
        /// <returns>Formated Chart Label</returns>
        public static string GetChartLabel(openXDA.Model.Channel channel, string type = null)
        {
            if (channel.MeasurementType.Name == "Voltage" && type == null)
                return "V" + DisplayPhaseName(channel.Phase);
            else if (channel.MeasurementType.Name == "Current" && type == null)
                return "I" + DisplayPhaseName(channel.Phase);
            else if (channel.MeasurementType.Name == "TripCoilCurrent" && type == null)
                return "TCE" + DisplayPhaseName(channel.Phase);
            else if (channel.MeasurementType.Name == "TripCoilCurrent")
                return "TCE" + DisplayPhaseName(channel.Phase) + " " + type;
            else if (channel.MeasurementType.Name == "Voltage")
                return "V" + DisplayPhaseName(channel.Phase) + " " + type;
            else if (channel.MeasurementType.Name == "Current")
                return "I" + DisplayPhaseName(channel.Phase) + " " + type;

            return null;
        }

        /// <summary>
        /// Down samples data if necessary to run in low Resource Systems 
        /// </summary>
        /// <param name="dict">The object that will be returned to the Client</param>
        public static void DownSample(JsonReturn dict)
        {
            if (DownSampleRate == -1)
                return;

            int i = 0;
            double dT = 0;
            double cycles = 0;
            int step = 0;
            for (i=0; i < dict.Data.Count; i++)
            {
                dT = dict.Data[i].DataPoints.Max(pt => pt[0]) - dict.Data[i].DataPoints.Min(pt => pt[0]);
                cycles = dT * Fbase/1000.0D;
                if (cycles* DownSampleRate > dict.Data[i].DataPoints.Count)
                    continue;

                step = (int)Math.Floor((dict.Data[i].DataPoints.Count-1) / (cycles * DownSampleRate));
                dict.Data[i].DataPoints = Enumerable.Range(0, (int)Math.Floor(cycles*DownSampleRate)).Select(j => dict.Data[i].DataPoints[(j * step)]).ToList();
            }
            

        }
            
        #endregion

        #region [ Shared Functions ]

        public static DataGroup QueryDataGroup(int eventID, Meter meter)
        {
            string target = $"DataGroup-{eventID}";

            Task<DataGroup> dataGroupTask = new Task<DataGroup>(() =>
            {
               
                    List<byte[]> data = ChannelData.DataFromEvent(eventID, "dbOpenXDA");
                    return ToDataGroup(meter, data);
                
            });

            if (s_memoryCache.Add(target, dataGroupTask, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(m_cacheSlidingExpiration) }))
                dataGroupTask.Start();

            dataGroupTask = (Task<DataGroup>)s_memoryCache.Get(target);

            return dataGroupTask.Result;
        }

        public static VICycleDataGroup QueryVICycleDataGroup(int eventID, Meter meter, bool fullres=false)
        {
            string target = $"VICycleDataGroup-{eventID}";
            if (s_memoryCache.Contains(target))
                return (VICycleDataGroup)s_memoryCache.Get(target);

            DataGroup dataGroup = QueryDataGroup(eventID, meter);
            Task<bool> viCycleDataGroupTask = new Task<bool>(() =>
            {
                    return 
                s_memoryCache.Add(target,Transform.ToVICycleDataGroup(new VIDataGroup(dataGroup), Fbase, false), new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(m_cacheSlidingExpiration) });
                
            });
            
            viCycleDataGroupTask.Start();

            if (fullres)
            {
                viCycleDataGroupTask.Wait();
                if (s_memoryCache.Contains(target))
                    return (VICycleDataGroup)s_memoryCache.Get(target);
            }
            return Transform.ToVICycleDataGroup(new VIDataGroup(dataGroup), Fbase, true);
            
        }

        public static DataGroup ToDataGroup(Meter meter, List<byte[]> data)
        {
            DataGroup dataGroup = new DataGroup();
            dataGroup.FromData(meter, data);
            VIDataGroup vIDataGroup = new VIDataGroup(dataGroup);
            return vIDataGroup.ToDataGroup();
        }


        protected IDbDataParameter ToDateTime2(AdoDataConnection connection, DateTime dateTime)
        {
            using (IDbCommand command = connection.Connection.CreateCommand())
            {
                IDbDataParameter parameter = command.CreateParameter();
                parameter.DbType = DbType.DateTime2;
                parameter.Value = dateTime;
                return parameter;
            }
        }

        #endregion

    }


}