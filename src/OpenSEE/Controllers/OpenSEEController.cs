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
    [RoutePrefix("api/OpenSEE")]
    public partial class OpenSEEController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);

        private static Random  m_random = new Random();

        
        public class JsonReturn
        {
            public List<D3Series> Data;
            public double EventStartTime;
            public double EventEndTime;
            public double FaultTime;

        }
        
        // New D3 Ploting initially only for Voltage
        public class D3Series
        {
            public D3Series()
            {
                this.LegendHorizontal = "";
            }
 
            public string ChartLabel; // -> not sure We need this one
            public string LegendGroup;// -> Button on Top
                                      // LegendVertGrp => Buttons on side
            public string LegendHorizontal; //=> Horizontal Category
            // LegendVertical => Vertical category
            // LegendVertGrp => Buttons on side
            public string Unit;
            public string Color;
            public string LegendClass; //Determines which Button this will be under in the Legend
            public string SecondaryLegendClass; //Determines which Button this will be under in the Legend
           
            public int ChannelID; // Probably don't need this
            public double BaseValue;
            public List<double[]> DataPoints = new List<double[]>();
            public List<double[]> DataMarker = new List<double[]>();
        }

       
        // Constants
        public const string TimeCorrelatedSagsSQL =
            "SELECT " +
            "    Event.ID AS EventID, " +
            "    EventType.Name AS EventType, " +
            "    FORMAT(Sag.PerUnitMagnitude * 100.0, '0.#') AS SagMagnitudePercent, " +
            "    FORMAT(Sag.DurationSeconds * 1000.0, '0') AS SagDurationMilliseconds, " +
            "    FORMAT(Sag.DurationCycles, '0.##') AS SagDurationCycles, " +
            "    Event.StartTime, " +
            "    Meter.Name AS MeterName, " +
            "    Asset.AssetName " +
            "FROM " +
            "    Event JOIN " +
            "    EventType ON Event.EventTypeID = EventType.ID JOIN " +
            "    Meter ON Event.MeterID = Meter.ID JOIN " +
            "    MeterAsset ON " +
            "        Event.MeterID = MeterAsset.MeterID AND " +
            "        Event.AssetID = MeterAsset.AssetID JOIN" +
            "   Asset ON Asset.ID = MeterAsset.AssetID  CROSS APPLY " +
            "    ( " +
            "        SELECT TOP 1 " +
            "            Disturbance.PerUnitMagnitude, " +
            "            Disturbance.DurationSeconds, " +
            "            Disturbance.DurationCycles " +
            "        FROM " +
            "            Disturbance JOIN " +
            "            EventType DisturbanceType ON Disturbance.EventTypeID = DisturbanceType.ID JOIN " +
            "            Phase ON " +
            "                Disturbance.PhaseID = Phase.ID AND " +
            "                Phase.Name = 'Worst' " +
            "        WHERE " +
            "            Disturbance.EventID = Event.ID AND " +
            "            DisturbanceType.Name = 'Sag' AND " +
            "            Disturbance.StartTime <= {1} AND " +
            "            Disturbance.EndTime >= {0} " +
            "        ORDER BY PerUnitMagnitude DESC " +
            "    ) Sag " +
            "ORDER BY " +
            "    Sag.PerUnitMagnitude, " +
            "    Event.StartTime";


        #endregion

        #region [ Constructors ]
        public OpenSEEController() : base() { }
        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;
        private static double m_cacheSlidingExpiration;

        static OpenSEEController()
        {
            s_memoryCache = new MemoryCache("openSEE");

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                m_cacheSlidingExpiration = connection.ExecuteScalar<double?>("SELECT Value FROM Settings WHERE Scope = 'app.setting' AND Name = 'SlidingCacheExpiration'") ?? 2.0;
            }
        }
        #endregion

        #region [ Methods ]

        #region [ Waveform Data ]
        [Route("GetData"),HttpGet]
        public JsonReturn GetData()
        {

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {

                Dictionary<string, string> query = Request.QueryParameters();

                int eventId = int.Parse(query["eventId"]);
                string type = query["type"];
                string dataType = query["dataType"];

                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");


                List<D3Series> returnList = new List<D3Series>();
                List<D3Series> temp = new List<D3Series>();

                if (dataType == "Time")
                {
                    DataGroup dataGroup = QueryDataGroup(eventId, meter);
                    returnList = GetD3DataLookup(dataGroup, type, evt.ID);

                }
                else
                {
                    VICycleDataGroup viCycleDataGroup;

                    viCycleDataGroup = QueryVICycleDataGroup(eventId, meter);
                    returnList = GetD3FrequencyDataLookup(viCycleDataGroup, type);


                }

                JsonReturn returnDict = new JsonReturn();


                returnDict.Data = returnList;
                returnDict.EventStartTime = evt.StartTime.Subtract(m_epoch).TotalMilliseconds;
                returnDict.EventEndTime = evt.EndTime.Subtract(m_epoch).TotalMilliseconds;


                return returnDict;
            }           
            
        }

        private List<D3Series> GetD3DataLookup(DataGroup dataGroup, string type, int evtID)
        {
            List<D3Series> dataLookup;

            //Determine Sbase
                            
            double Sbase = 0;
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                Sbase = connection.ExecuteScalar<double>("SELECT Value FROM Setting WHERE Name = 'SystemMVABase'");

            dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == type).Select(
                ds => new D3Series()
                {
                    LegendHorizontal = GetSignalType(ds.SeriesInfo.Channel),
                    ChannelID = ds.SeriesInfo.Channel.ID,
                    ChartLabel = GetChartLabel(ds.SeriesInfo.Channel),
                    Unit = (type == "TripCoilCurrent" ? "TCE" : type),
                    Color = GetColor(ds.SeriesInfo.Channel),
                    LegendClass = GetVoltageType(ds.SeriesInfo.Channel),
                    SecondaryLegendClass = GetSignalType(ds.SeriesInfo.Channel),
                    LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                    DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    DataMarker = new List<double[]>(),
                    BaseValue = (type == "Voltage" ? ds.SeriesInfo.Channel.Asset.VoltageKV * 1000.0 : GetIbase(Sbase,ds.SeriesInfo.Channel.Asset.VoltageKV) )
                }).ToList();

            return dataLookup;
        }

        private double GetIbase(double Sbase, double Vbase)
        {
            return (Sbase / (Math.Sqrt(3) * Vbase * 1000));
        }
        public static string GetUnits(Channel channel)
        {
            if (channel.MeasurementType.Name == "Voltage")
                return "V";
            if (channel.MeasurementType.Name == "Current")
                return "A";
            else
                return " ";
        }

        /// <summary>
        /// Determines Color based on Channel Information
        /// </summary>
        /// <param name="channel">Channel that represents the signal</param>
        /// <returns>a color designation</returns>
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
                            return "Va";
                        case ("BC"):
                            return "Vb";
                        case ("CA"):
                            return "Vc";
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

        private string GetVoltageType(Channel channel)
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

        private string GetSignalType(Channel channel)
        {
            if (channel.MeasurementType.Name == "Voltage" || channel.MeasurementType.Name == "Current")
            {
                if (channel.MeasurementCharacteristic.Name == "Instantaneous")
                {
                    return "W";
                }
                else if (channel.MeasurementCharacteristic.Name == "RMS")
                {
                    return "RMS";
                }
            }

            return "";
        }

        private List<D3Series> GetD3FrequencyDataLookup(VICycleDataGroup vICycleDataGroup, string type)
        {
            //Determine Sbase
            double Sbase = 0;
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                Sbase = connection.ExecuteScalar<double>("SELECT Value FROM Setting WHERE Name = 'SystemMVABase'");

            IEnumerable<string> names = vICycleDataGroup.CycleDataGroups.Where(ds => ds.RMS.SeriesInfo.Channel.MeasurementType.Name == type).Select(ds => ds.RMS.SeriesInfo.Channel.Phase.Name);
            List<D3Series> dataLookup = new List<D3Series>();

            foreach (CycleDataGroup cdg in vICycleDataGroup.CycleDataGroups.Where(ds => ds.RMS.SeriesInfo.Channel.MeasurementType.Name == type))
            {

                D3Series flotSeriesRMS = new D3Series
                {
                    LegendHorizontal = "RMS",
                    ChannelID = cdg.RMS.SeriesInfo.Channel.ID,
                    DataPoints = cdg.RMS.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.RMS.SeriesInfo.Channel, "RMS"),
                    Unit = type,
                    Color = GetColor(cdg.RMS.SeriesInfo.Channel),
                    LegendClass = GetVoltageType(cdg.RMS.SeriesInfo.Channel),
                    SecondaryLegendClass = "RMS",
                    LegendGroup = cdg.Asset.AssetName,
                    BaseValue = Math.Sqrt(2) * (type == "Voltage" ? cdg.RMS.SeriesInfo.Channel.Asset.VoltageKV * 1000.0 : GetIbase(Sbase, cdg.RMS.SeriesInfo.Channel.Asset.VoltageKV))

                };
                dataLookup.Add(flotSeriesRMS);

                D3Series flotSeriesWaveAmp = new D3Series
                {
                    LegendHorizontal = "A",
                    ChannelID = cdg.Peak.SeriesInfo.Channel.ID,
                    DataPoints = cdg.Peak.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.Peak.SeriesInfo.Channel, "Amplitude"),

                    Unit = type,
                    Color = GetColor(cdg.Peak.SeriesInfo.Channel),
                    LegendClass = GetVoltageType(cdg.Peak.SeriesInfo.Channel),
                    SecondaryLegendClass = "A",
                    LegendGroup = cdg.Asset.AssetName,
                    BaseValue = (type == "Voltage" ? cdg.RMS.SeriesInfo.Channel.Asset.VoltageKV * 1000.0 : GetIbase(Sbase, cdg.RMS.SeriesInfo.Channel.Asset.VoltageKV))

                };
                dataLookup.Add(flotSeriesWaveAmp);

                D3Series flotSeriesPolarAngle = new D3Series
                {
                    LegendHorizontal = "Ph",
                    ChannelID = cdg.Phase.SeriesInfo.Channel.ID,
                    DataPoints = cdg.Phase.Multiply(180.0D / Math.PI).DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.Phase.SeriesInfo.Channel, "Phase"),

                    Unit = "Angle",
                    Color = GetColor(cdg.Phase.SeriesInfo.Channel),
                    LegendClass = GetVoltageType(cdg.Phase.SeriesInfo.Channel),
                    SecondaryLegendClass = "Ph",
                    LegendGroup = cdg.Asset.AssetName,
                    BaseValue = 0
                };
            
                dataLookup.Add(flotSeriesPolarAngle);

            }

            return dataLookup;
        }

        public static string GetChartLabel(openXDA.Model.Channel channel, string type = null)
        {
            if (channel.MeasurementType.Name == "Voltage" && type == null)
                return "V" + DisplayPhaseName(channel.Phase.Name);
            else if (channel.MeasurementType.Name == "Current" && type == null)
                return "I" + DisplayPhaseName(channel.Phase.Name);
            else if (channel.MeasurementType.Name == "TripCoilCurrent" && type == null)
                return "TCE" + DisplayPhaseName(channel.Phase.Name);
            else if (channel.MeasurementType.Name == "TripCoilCurrent")
                return "TCE" + DisplayPhaseName(channel.Phase.Name) + " " + type;
            else if (channel.MeasurementType.Name == "Voltage")
                return "V" + DisplayPhaseName(channel.Phase.Name) + " " + type;
            else if (channel.MeasurementType.Name == "Current")
                return "I" + DisplayPhaseName(channel.Phase.Name) + " " + type;

            return null;
        }

        private static string DisplayPhaseName(string phaseName)
        {
            Dictionary<string, string> diplayNames = new Dictionary<string, string>()
            {
                { "None", ""}
            };

            string DisplayName;

            if (!diplayNames.TryGetValue(phaseName, out DisplayName))
                DisplayName = phaseName;

            return DisplayName;

        }

        #endregion

        #region [ Digitals Data ]
        [Route("GetBreakerData"),HttpGet]
        public JsonReturn GetBreakerData()
        {
            Dictionary<string, string> query = Request.QueryParameters();

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA")) {
                int eventId = int.Parse(query["eventId"]);
                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);

                meter.ConnectionFactory = () => new AdoDataConnection(connection.Connection, typeof(SqlDataAdapter), false);

           
                DataGroup dataGroup = QueryDataGroup(evt.ID, meter);
                List<D3Series> resultList = GetBreakerLookup(dataGroup);

                
                JsonReturn returnDict = new JsonReturn();
                
                returnDict.Data = resultList;
               
                return returnDict;


            }
        }

        private List<D3Series> GetBreakerLookup(DataGroup dataGroup)
        {

            List<D3Series>  dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Digital").Select(ds =>
                new D3Series()
                   {
                       ChannelID = ds.SeriesInfo.Channel.ID,
                       ChartLabel = (ds.SeriesInfo.Channel.Description == null) ? GetChartLabel(ds.SeriesInfo.Channel) : ds.SeriesInfo.Channel.Description,
                       Unit = " ",
                       Color = GetColor(ds.SeriesInfo.Channel),
                       LegendClass = "",
                       SecondaryLegendClass = "",
                       LegendGroup = "",
                       DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                   }).ToList();

            return dataLookup;
        }

        #endregion

        #region [ Analogs Data ]
        [Route("GetAnalogsData"), HttpGet]
        public JsonReturn GetAnalogsData()
        {
            Dictionary<string, string> query = Request.QueryParameters();

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                int eventId = int.Parse(query["eventId"]);
                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);

                meter.ConnectionFactory = () => new AdoDataConnection(connection.Connection, typeof(SqlDataAdapter), false);

                DataGroup dataGroup = QueryDataGroup(evt.ID, meter);
                List<D3Series> returnList = GetAnalogsLookup(dataGroup);
              
                JsonReturn returnDict = new JsonReturn();
            
                returnDict.Data = returnList;

                return returnDict;


            }
        }

        private List<D3Series> GetAnalogsLookup(DataGroup dataGroup)
        {

            List<D3Series> dataLookup = dataGroup.DataSeries.Where(ds => 
                ds.SeriesInfo.Channel.MeasurementType.Name != "Digital" && 
                ds.SeriesInfo.Channel.MeasurementType.Name != "Voltage" && 
                ds.SeriesInfo.Channel.MeasurementType.Name != "Current" && 
                ds.SeriesInfo.Channel.MeasurementType.Name != "TripCoilCurrent").Select(ds => 
                   new D3Series()
                   {
                       ChannelID = ds.SeriesInfo.Channel.ID,
                       ChartLabel = (ds.SeriesInfo.Channel.Description == null)? GetChartLabel(ds.SeriesInfo.Channel): ds.SeriesInfo.Channel.Description,
                       Unit = "",
                       Color = GetColor(ds.SeriesInfo.Channel),
                       LegendClass = "",
                       SecondaryLegendClass = "",
                       LegendGroup = "",
                       DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                   }).ToList();

           
            return dataLookup;
        }

        #endregion
        
       
        #region [ Shared Functions ]

        public static DataGroup QueryDataGroup(int eventID, Meter meter)
        {
            string target = $"DataGroup-{eventID}";

            Task<DataGroup> dataGroupTask = new Task<DataGroup>(() =>
            {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    List<byte[]> data = ChannelData.DataFromEvent(eventID, connection);
                    return ToDataGroup(meter, data);
                }
            });

            if (s_memoryCache.Add(target, dataGroupTask, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(m_cacheSlidingExpiration) }))
                dataGroupTask.Start();

            dataGroupTask = (Task<DataGroup>)s_memoryCache.Get(target);

            return dataGroupTask.Result;
        }

        public static VICycleDataGroup QueryVICycleDataGroup(int eventID, Meter meter)
        {
            string target = $"VICycleDataGroup-{eventID}";

            Task<VICycleDataGroup> viCycleDataGroupTask = new Task<VICycleDataGroup>(() =>
            {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    DataGroup dataGroup = QueryDataGroup(eventID, meter);
                    double freq = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0D;
                    return Transform.ToVICycleDataGroup(new VIDataGroup(dataGroup), freq);
                }
            });

            if (s_memoryCache.Add(target, viCycleDataGroupTask, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(m_cacheSlidingExpiration) }))
                viCycleDataGroupTask.Start();

            viCycleDataGroupTask = (Task<VICycleDataGroup>)s_memoryCache.Get(target);

            return viCycleDataGroupTask.Result;
        }

        public static DataGroup ToDataGroup(Meter meter, List<byte[]> data)
        {
            DataGroup dataGroup = new DataGroup();
            dataGroup.FromData(meter, data);
            VIDataGroup vIDataGroup = new VIDataGroup(dataGroup);
            return vIDataGroup.ToDataGroup();
        }

       
        private IDbDataParameter ToDateTime2(AdoDataConnection connection, DateTime dateTime)
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

        #region [ Info ]

        [Route("GetHeaderData"),HttpGet]
        public Dictionary<string, dynamic> GetHeaderData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventId = int.Parse(query["eventId"]);
            string breakerOperationID = (query.ContainsKey("breakeroperation") ? query["breakeroperation"] : "-1");

            Func<string, string> func = inputString => {
                switch (inputString)
                {
                    case "System":
                        return "GetPreviousAndNextEventIdsForSystem";
                    case "Station":
                        return "GetPreviousAndNextEventIdsForMeterLocation";
                    case "Meter":
                        return "GetPreviousAndNextEventIdsForMeter";
                    default:
                        return "GetPreviousAndNextEventIdsForLine";
                }

            };

            Dictionary<string, Tuple<EventView, EventView>> nextBackLookup = new Dictionary<string, Tuple<EventView, EventView>>()
            {
                { "System", Tuple.Create((EventView)null, (EventView)null) },
                { "Station", Tuple.Create((EventView)null, (EventView)null) },
                { "Meter", Tuple.Create((EventView)null, (EventView)null) },
                { "Asset", Tuple.Create((EventView)null, (EventView)null) }
            };

            Dictionary<string, dynamic> returnDict = new Dictionary<string, dynamic>();

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                returnDict.Add("enableLightningData", connection.ExecuteScalar<string>("SELECT Value FROM Settings WHERE Name = 'EnableLightningQuery'") ?? "false");
            }

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                EventView theEvent = new TableOperations<EventView>(connection).QueryRecordWhere("ID = {0}", eventId);

                returnDict.Add("postedSystemFrequency", connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? "60.0");
                returnDict.Add("postedStationName", theEvent.StationName);
                returnDict.Add("postedMeterId", theEvent.MeterID.ToString());
                returnDict.Add("postedMeterName", theEvent.MeterName);
                returnDict.Add("postedAssetName", theEvent.AssetName);

                returnDict.Add("postedEventName", theEvent.EventTypeName);
                returnDict.Add("postedEventDate", theEvent.StartTime.ToString("yyyy-MM-dd HH:mm:ss.fffffff"));
                returnDict.Add("postedDate", theEvent.StartTime.ToShortDateString());
                returnDict.Add("postedEventMilliseconds", theEvent.StartTime.Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds.ToString());

                
                returnDict.Add("xdaInstance", connection.ExecuteScalar<string>("SELECT Value FROM DashSettings WHERE Name = 'System.XDAInstance'"));

                using (IDbCommand cmd = connection.Connection.CreateCommand())
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EventID", eventId));
                    cmd.CommandTimeout = 300;

                    foreach (string procedure in nextBackLookup.Keys.ToList())
                    {
                        EventView back = null;
                        EventView next = null;
                        int backID = -1;
                        int nextID = -1;

                        cmd.CommandText = func(procedure);

                        using (IDataReader rdr = cmd.ExecuteReader())
                        {
                            rdr.Read();

                            if (!rdr.IsDBNull(0))
                            {
                                backID = rdr.GetInt32(0);
                            }

                            if (!rdr.IsDBNull(1))
                            {
                                nextID = rdr.GetInt32(1);
                            }
                        }

                        back = new TableOperations<EventView>(connection).QueryRecordWhere("ID = {0}", backID);
                        next = new TableOperations<EventView>(connection).QueryRecordWhere("ID = {0}", nextID);
                        nextBackLookup[procedure] = Tuple.Create(back, next);
                    }
                }

                returnDict.Add("nextBackLookup", nextBackLookup);

                if (new List<string>() { "Fault", "RecloseIntoFault" }.Contains(returnDict["postedEventName"]))
                {
                    const string SagDepthQuery =
                        "SELECT TOP 1 " +
                        "    PerUnitMagnitude * 100 " +
                        "FROM " +
                        "    FaultSummary JOIN " +
                        "    Disturbance ON " +
                        "         Disturbance.EventID = FaultSummary.EventID AND " +
                        "         Disturbance.StartTime <= dbo.AdjustDateTime2(FaultSummary.Inception, FaultSummary.DurationSeconds) AND " +
                        "         Disturbance.EndTime >= FaultSummary.Inception JOIN " +
                        "    EventType ON " +
                        "        Disturbance.EventTypeID = EventType.ID AND " +
                        "        EventType.Name = 'Sag' JOIN " +
                        "    Phase ON " +
                        "        Disturbance.PhaseID = Phase.ID AND " +
                        "        Phase.Name = 'Worst' " +
                        "WHERE FaultSummary.ID = {0} " +
                        "ORDER BY PerUnitMagnitude";

                    FaultSummary thesummary = new TableOperations<FaultSummary>(connection).QueryRecordsWhere("EventID = {0} AND IsSelectedAlgorithm = 1", theEvent.ID).OrderBy(row => row.IsSuppressed).ThenBy(row => row.Inception).FirstOrDefault();
                    double sagDepth = connection.ExecuteScalar<double>(SagDepthQuery, thesummary.ID);

                    if ((object)thesummary != null)
                    {
                        returnDict.Add("postedStartTime", thesummary.Inception.TimeOfDay.ToString());
                        returnDict.Add("postedPhase", thesummary.FaultType);
                        returnDict.Add("postedDurationPeriod", thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles");
                        returnDict.Add("postedMagnitude", thesummary.CurrentMagnitude.ToString("####.#", CultureInfo.InvariantCulture) + " Amps (RMS)");
                        returnDict.Add("postedSagDepth", sagDepth.ToString("####.#", CultureInfo.InvariantCulture) + "%");
                        returnDict.Add("postedCalculationCycle", thesummary.CalculationCycle.ToString());
                    }
                }
                else if (new List<string>() { "Sag", "Swell" }.Contains(returnDict["postedEventName"]))
                {
                    openXDA.Model.Disturbance disturbance = new TableOperations<openXDA.Model.Disturbance>(connection).QueryRecordsWhere("EventID = {0}", theEvent.ID).Where(row => row.EventTypeID == theEvent.EventTypeID).OrderBy(row => row.StartTime).FirstOrDefault();

                    if ((object)disturbance != null)
                    {
                        returnDict.Add("postedStartTime", disturbance.StartTime.TimeOfDay.ToString());
                        returnDict.Add("postedPhase", new TableOperations<Phase>(connection).QueryRecordWhere("ID = {0}", disturbance.PhaseID).Name);
                        returnDict.Add("postedDurationPeriod", disturbance.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles");

                        if (disturbance.PerUnitMagnitude != -1.0e308)
                        {
                            returnDict.Add("postedMagnitude", disturbance.PerUnitMagnitude.ToString("N3", CultureInfo.InvariantCulture) + " pu (RMS)");
                        }
                    }
                }

                if (breakerOperationID != "")
                {
                    int id;

                    if (int.TryParse(breakerOperationID, out id))
                    {
                        BreakerOperation breakerRow = new TableOperations<BreakerOperation>(connection).QueryRecordWhere("ID = {0}", id);

                        if ((object)breakerRow != null)
                        {
                            returnDict.Add("postedBreakerNumber", breakerRow.BreakerNumber);
                            returnDict.Add("postedBreakerPhase", new TableOperations<Phase>(connection).QueryRecordWhere("ID = {0}", breakerRow.PhaseID).Name);
                            returnDict.Add("postedBreakerTiming", breakerRow.BreakerTiming.ToString());
                            returnDict.Add("postedBreakerSpeed", breakerRow.BreakerSpeed.ToString());
                            returnDict.Add("postedBreakerOperation", connection.ExecuteScalar("SELECT Name FROM BreakerOperationType WHERE ID = {0}", breakerRow.BreakerOperationTypeID).ToString());
                        }
                    }
                }

                return returnDict;
            }
        }


        #endregion

        #region [ Compare ]

        [Route("GetOverlappingEvents"),HttpGet]
        public DataTable GetOverlappingEvents()
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventId = int.Parse(query["eventId"]);

                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                DateTime startTime = (query.ContainsKey("startDate") ? DateTime.Parse(query["startDate"]) : evt.StartTime);
                DateTime endTime = (query.ContainsKey("endDate") ? DateTime.Parse(query["endDate"]) : evt.EndTime);


                DataTable dataTable = connection.RetrieveData(@"
                SELECT
	                DISTINCT
	                Meter.Name as MeterName,
	                Asset.AssetName,
	                Event.ID as EventID
                FROM
	                Event JOIN
	                Meter ON Meter.ID = Event.MeterID JOIN
	                Asset ON Asset.ID = Event.AssetID
                WHERE
	                Event.ID != {0} AND  
	                Event.StartTime <= {2} AND
	                Event.EndTime >= {1} 
                ", eventId, ToDateTime2(connection, startTime), ToDateTime2(connection, endTime));
                return dataTable;

            }
        }

        #endregion


        #region [ UI Widgets ]
        [Route("GetScalarStats"),HttpGet]
        public Dictionary<string, string> GetScalarStats()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventId = int.Parse(query["eventId"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                DataTable dataTable = connection.RetrieveData("SELECT * FROM OpenSEEScalarStatView WHERE EventID = {0}", eventId);
                if (dataTable.Rows.Count == 0) return new Dictionary<string, string>();

                DataRow row = dataTable.AsEnumerable().First();
                return row.Table.Columns.Cast<DataColumn>().ToDictionary(c => c.ColumnName, c => row[c].ToString());

            }
        }

        [Route("GetHarmonics"),HttpGet]
        public DataTable GetHarmonics()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventId = int.Parse(query["eventId"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                DataTable dataTable = connection.RetrieveData(@"
                    SELECT 
                        MeasurementType.Name + ' ' + Phase.Name as Channel, 
                        SpectralData 
                    FROM 
                        SnapshotHarmonics JOIN 
                        Channel ON Channel.ID = SnapshotHarmonics.ChannelID JOIN
                        MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN
                        Phase ON Channel.PhaseID = Phase.ID
                        WHERE EventID = {0}", eventId);

                return dataTable;

            }
        }

        [Route("GetTimeCorrelatedSags"), HttpGet]
        public DataTable GetTimeCorrelatedSags()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventId"]);

            if (eventID <= 0) return new DataTable();
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                double timeTolerance = connection.ExecuteScalar<double>("SELECT Value FROM Setting WHERE Name = 'TimeTolerance'");
                DateTime startTime = connection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0}", eventID);
                DateTime endTime = connection.ExecuteScalar<DateTime>("SELECT EndTime FROM Event WHERE ID = {0}", eventID);
                DateTime adjustedStartTime = startTime.AddSeconds(-timeTolerance);
                DateTime adjustedEndTime = endTime.AddSeconds(timeTolerance);
                DataTable dataTable = connection.RetrieveData(TimeCorrelatedSagsSQL, adjustedStartTime, adjustedEndTime);
                return dataTable;
            }
        }

       
        [Route("GetLightningParameters"), HttpGet]
        public object GetLightningParameters()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventId"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                const string Query =
                    "SELECT " +
                    "    Asset.AssetKey AS LineKey, " +
                    "    DATEADD(SECOND, -2, Fault.Inception) AS StartTime, " +
                    "    DATEADD(SECOND, 2, Fault.Inception) AS EndTime " +
                    "FROM " +
                    "    Event JOIN " +
                    "    Asset ON Event.AssetID = Asset.ID CROSS APPLY " +
                    "    ( " +
                    "        SELECT " +
                    "            DATEADD " +
                    "            ( " +
                    "                MINUTE, " +
                    "                -Event.TimeZoneOffset, " +
                    "                DATEADD " +
                    "                ( " +
                    "                    NANOSECOND, " +
                    "                    -DATEPART(NANOSECOND, FaultSummary.Inception), " +
                    "                    FaultSummary.Inception " +
                    "                ) " +
                    "            ) AS Inception " +
                    "        FROM FaultSummary " +
                    "        WHERE " +
                    "            FaultSummary.EventID = Event.ID AND " +
                    "            FaultSummary.FaultNumber = 1 AND " +
                    "            FaultSummary.IsSelectedAlgorithm <> 0 " +
                    "    ) Fault " +
                    "WHERE Event.ID = {0}";

                DataRow row = connection.RetrieveRow(Query, eventID);
                string LineKey = row.ConvertField<string>("LineKey");
                DateTime StartTime = row.ConvertField<DateTime>("StartTime");
                DateTime EndTime = row.ConvertField<DateTime>("EndTime");
                return new { LineKey, StartTime, EndTime };
            }
        }

        [Route("GetOutputChannelCount/{eventID}"), HttpGet]
        public IHttpActionResult GetOutputChannelCount(int eventID)
        {
            try
            {
                if (eventID <= 0) return BadRequest("Invalid EventID");
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    int count = connection.ExecuteScalar<int>(@"
                SELECT 
	                COUNT(*) 
                FROM 
	                Event JOIN 
	                Channel ON Channel.MeterID = Event.MeterID AND Channel.AssetID = Event.AssetID JOIN
	                Series ON Channel.ID = Series.ChannelID JOIN
	                OutputChannel ON OutputChannel.SeriesID = Series.ID
                WHERE
                    Event.ID = {0}
                ", eventID);
                    return Ok(count);
                }
            }
            catch(Exception ex)
            {
                return InternalServerError(ex);
            }

        }


        #endregion

        #region [ Note Management ]
        [Route("GetNotes"),HttpGet]
        public DataTable GetNotes()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventId"]);
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                const string SQL = "SELECT * FROM EventNote WHERE EventID = {0}";

                DataTable dataTable = connection.RetrieveData(SQL, eventID);
                return dataTable;
            }


        }

        public class FormData
        {
            public int? ID { get; set; }
            public int EventID { get; set; }
            public string Note { get; set; }
        }

        public class FormDataMultiNote
        {
            public int? ID { get; set; }
            public int[] EventIDs { get; set; }
            public string Note { get; set; }
            public string UserAccount {get; set;}
            public DateTime Timestamp { get; set; }
        }


        [Route("AddNote"),HttpPost]
        public IHttpActionResult AddNote(FormData note)
        {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;

            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    EventNote record = new EventNote()
                    {
                        EventID = note.EventID,
                        Note = note.Note,
                        UserAccount = User.Identity.Name,
                        Timestamp = DateTime.Now
                    };

                    new TableOperations<EventNote>(connection).AddNewRecord(record);

                    result = Ok(record);

                }
            }
            catch (Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;
        }

        [Route("AddMultiNote"),HttpPost]
        public IHttpActionResult AddMultiNote(FormDataMultiNote note)
        {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;

            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DateTime now = DateTime.Now;
                    List<EventNote> records = new List<EventNote>();
                    foreach(int eventId in note.EventIDs)
                    {
                        EventNote record = new EventNote()
                        {
                            EventID = eventId,
                            Note = note.Note,
                            UserAccount = User.Identity.Name,
                            Timestamp = now
                        };

                        new TableOperations<EventNote>(connection).AddNewRecord(record);
                        records.Add(record);
                    }

                    result = Ok(records);

                }
            }
            catch (Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;
        }


        [Route("DeleteNote"),HttpDelete]
        public IHttpActionResult DeleteNote(FormData note)
        {
            try
            {
               IHttpActionResult result = ValidateAdminRequest();

                if (result != null) return result;

                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    EventNote record = new TableOperations<EventNote>(connection).QueryRecordWhere("ID = {0}", note.ID);
                    new TableOperations<EventNote>(connection).DeleteRecord(record);
                    result = Ok(record);

                }
                return result;

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }


        }

        [Route("DeleteMultiNote"),HttpDelete]
        public IHttpActionResult DeleteMultiNote(FormDataMultiNote note)
        {
            try
            {
                IHttpActionResult result = ValidateAdminRequest();

                if (result != null) return result;

                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    connection.ExecuteNonQuery(@"
                        DELETE FROM EventNote WHERE Note = {0} AND UserAccount = {1} AND Timestamp = {2}
                    ", note.Note, note.UserAccount, note.Timestamp);

                }
                return Ok();

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }


        }


        [Route("UpdateNote"),HttpPatch]
        public IHttpActionResult UpdateNote(FormData note)
        {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    EventNote record = new TableOperations<EventNote>(connection).QueryRecordWhere("ID = {0}", note.ID);

                    record.Note = note.Note;
                    record.UserAccount = User.Identity.Name;
                    record.Timestamp = DateTime.Now;


                    new TableOperations<EventNote>(connection).UpdateRecord(record);

                    result = Ok(record);

                }
            }
            catch (Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;
        }

        #endregion

        #region [ Security ]

        private IHttpActionResult ValidateAdminRequest()
        {
            string username = User.Identity.Name;
            string userid = UserInfo.UserNameToSID(username);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                bool isAdmin = connection.ExecuteScalar<int>(@"
					select 
						COUNT(*) 
					from 
						UserAccount JOIN 
						ApplicationRoleUserAccount ON ApplicationRoleUserAccount.UserAccountID = UserAccount.ID JOIN
						ApplicationRole ON ApplicationRoleUserAccount.ApplicationRoleID = ApplicationRole.ID
					WHERE 
						ApplicationRole.Name = 'Administrator' AND UserAccount.Name = {0}
                ", userid) > 0;

                if (isAdmin) return null;
                else return StatusCode(HttpStatusCode.Forbidden);
            }
            //    ISecurityProvider securityProvider = SecurityProviderUtility.CreateProvider(username);
            //securityProvider.PassthroughPrincipal = User;

            //if (!securityProvider.Authenticate())
            //    return StatusCode(HttpStatusCode.Forbidden);

            //SecurityIdentity approverIdentity = new SecurityIdentity(securityProvider);
            //SecurityPrincipal approverPrincipal = new SecurityPrincipal(approverIdentity);

            //if (!approverPrincipal.IsInRole("Administrator"))
            //    return StatusCode(HttpStatusCode.Forbidden);

        }
        #endregion
        

        #endregion

    }
}