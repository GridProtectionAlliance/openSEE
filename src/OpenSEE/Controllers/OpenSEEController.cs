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

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Runtime.Caching;
using System.Threading.Tasks;
using System.Web.Http;
using FaultData.DataAnalysis;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Web;
using OpenSEE.Model;
using openXDA.Model;

namespace OpenSEE
{
    [RoutePrefix("api/OpenSEE")]
    public class OpenSEEController : OpenSEEBaseController
    {
        #region [ Members ]       
        
        // Constants
        public const string TimeCorrelatedSagsSQL =
            "SELECT Disturbance.* " +
            "INTO #sag " +
            "FROM " +
            "    Disturbance JOIN " +
            "    EventType DisturbanceType ON Disturbance.EventTypeID = DisturbanceType.ID JOIN " +
            "    Phase ON Disturbance.PhaseID = Phase.ID " +
            "WHERE " +
            "    DisturbanceType.Name = 'Sag' AND " +
            "    Phase.Name = 'Worst' AND " +
            "    Disturbance.StartTime <= {1} AND " +
            "    Disturbance.EndTime >= {0} " +
            "" +
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
            "        Event.AssetID = MeterAsset.AssetID JOIN " +
            "    Asset ON Asset.ID = MeterAsset.AssetID CROSS APPLY " +
            "    ( " +
            "        SELECT TOP 1 " +
            "            PerUnitMagnitude, " +
            "            DurationSeconds, " +
            "            DurationCycles " +
            "        FROM #sag " +
            "        WHERE EventID = Event.ID " +
            "        ORDER BY PerUnitMagnitude DESC " +
            "    ) Sag " +
            "WHERE Event.ID IN (SELECT EventID FROM #sag) " +
            "ORDER BY " +
            "    Sag.PerUnitMagnitude, " +
            "    Event.StartTime";

        #endregion

        #region [ Constructors ]
        public OpenSEEController() : base() { }
        #endregion

        #region [ Static ]
        

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
        public async Task<JsonReturn> GetData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                Dictionary<string, string> query = Request.QueryParameters();

                int eventId = int.Parse(query["eventId"]);
                string type = query["type"];
                string dataType = query["dataType"];

                int forceFullRes = int.Parse(query.ContainsKey("fullRes")? query["fullRes"] : "0");

                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                List<D3Series> returnList = new List<D3Series>();
                List<D3Series> temp = new List<D3Series>();

                if (dataType == "Time")
                {
                    DataGroup dataGroup = await QueryDataGroupAsync(eventId, meter);
                    returnList = GetD3DataLookup(dataGroup, type, evt.ID);
                }
                else
                {
                    VICycleDataGroup viCycleDataGroup = await QueryVICycleDataGroupAsync(eventId, meter, forceFullRes == 1);
                    returnList = GetD3FrequencyDataLookup(viCycleDataGroup, type, !(forceFullRes == 1));
                }

                JsonReturn returnDict = new JsonReturn();
                returnDict.Data = returnList;
                returnDict.EventStartTime = evt.StartTime.Subtract(m_epoch).TotalMilliseconds;
                returnDict.EventEndTime = evt.EndTime.Subtract(m_epoch).TotalMilliseconds;

                UpSample(returnDict);
                DownSample(returnDict);
                return returnDict;
            }           
        }

        private List<D3Series> GetD3DataLookup(DataGroup dataGroup, string type, int evtID)
        {
            List<D3Series> dataLookup;

            
            dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == type).Select(
                ds => {
                    if (type == "TripCoilCurrent")
                    {
                        using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                        {
                            RelayPerformance relayPerformance = new TableOperations<RelayPerformance>(connection).QueryRecordWhere("EventID = {0} AND ChannelID = {1}", evtID, ds.SeriesInfo.ChannelID);
                            List<double[]> dataMarkers = new List<double[]>();
                            
                            if (relayPerformance != null) {

                                try
                                {
                                    if (relayPerformance.TripInitiate != null)
                                    {
                                        DateTime tripInitiate = (DateTime)relayPerformance.TripInitiate;
                                        DateTime TImax = tripInitiate.AddTicks((int)relayPerformance.Tmax1);
                                        DateTime TplungerLatch = tripInitiate.AddTicks((int)relayPerformance.TplungerLatch);
                                        DateTime pickuptime = tripInitiate.AddTicks((int)relayPerformance.PickupTime);
                                        DateTime tripTime = tripInitiate.AddTicks((int)relayPerformance.TripTime);
                                        DateTime Tdrop = tripInitiate.AddTicks((int)relayPerformance.TiDrop);
                                        DateTime Tend = tripInitiate.AddTicks((int)relayPerformance.Tend);

                                        DateTime Ta = tripInitiate.AddTicks((int)(relayPerformance.ExtinctionTimeA ?? 0));
                                        DateTime Tb = tripInitiate.AddTicks((int)(relayPerformance.ExtinctionTimeB ?? 0));
                                        DateTime Tc = tripInitiate.AddTicks((int)(relayPerformance.ExtinctionTimeC ?? 0));


                                        dataMarkers.Add(new double[] { tripInitiate.Subtract(m_epoch).TotalMilliseconds, ds.DataPoints.SkipWhile(d => d.Time < tripInitiate).FirstOrDefault()?.Value ?? 0 });
                                        dataMarkers.Add(new double[] { TImax.Subtract(m_epoch).TotalMilliseconds, relayPerformance.Imax1 ?? 0.0D });
                                        dataMarkers.Add(new double[] { TplungerLatch.Subtract(m_epoch).TotalMilliseconds, relayPerformance.IplungerLatch });
                                        dataMarkers.Add(new double[] { pickuptime.Subtract(m_epoch).TotalMilliseconds, relayPerformance.PickupTimeCurrent ?? 0.0D });
                                        dataMarkers.Add(new double[] { tripTime.Subtract(m_epoch).TotalMilliseconds, relayPerformance.Imax2 ?? 0 });
                                        dataMarkers.Add(new double[] { Tdrop.Subtract(m_epoch).TotalMilliseconds, relayPerformance.Idrop ?? 0 });
                                        dataMarkers.Add(new double[] { Tend.Subtract(m_epoch).TotalMilliseconds, ds.DataPoints.SkipWhile(d => d.Time < Tend).FirstOrDefault()?.Value  ?? 0 });

                                        if (Ta > tripInitiate)
                                            dataMarkers.Add(new double[] { Ta.Subtract(m_epoch).TotalMilliseconds, ds.DataPoints.SkipWhile(d => d.Time < Ta).FirstOrDefault()?.Value ?? 0 });
                                        if (Tb > tripInitiate)
                                            dataMarkers.Add(new double[] { Tb.Subtract(m_epoch).TotalMilliseconds, ds.DataPoints.SkipWhile(d => d.Time < Tb).FirstOrDefault()?.Value ?? 0 });
                                        if (Tc > tripInitiate)
                                            dataMarkers.Add(new double[] { Tc.Subtract(m_epoch).TotalMilliseconds, ds.DataPoints.SkipWhile(d => d.Time < Tc).FirstOrDefault()?.Value ?? 0 });

                                    }
                                }
                                catch (Exception ex) { }

                            }

                            return new D3Series()
                            {
                                LegendHorizontal = "TCE ",
                                LegendVertical = "",
                                ChartLabel = GetChartLabel(ds.SeriesInfo.Channel),
                                Unit = "TCE",
                                Color = GetColor(ds.SeriesInfo.Channel),
                                LegendVGroup = "",
                                DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                                DataMarker = dataMarkers,
                                BaseValue = GetIbase(Sbase, ds.SeriesInfo.Channel.Asset.VoltageKV),
                                LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                            };
                        }
                    }
                    else {
                        return new D3Series()
                        {
                            LegendVGroup = GetVoltageType(ds.SeriesInfo.Channel),
                            LegendHorizontal = GetSignalType(ds.SeriesInfo.Channel),
                            LegendVertical = DisplayPhaseName(ds.SeriesInfo.Channel.Phase),
                            ChartLabel = GetChartLabel(ds.SeriesInfo.Channel),
                            Unit = type,
                            Color = GetColor(ds.SeriesInfo.Channel),
                            LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                            DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                            DataMarker = new List<double[]>(),
                            BaseValue = (type == "Voltage" ? GetBaseV(ds.SeriesInfo.Channel, false) * 1000.0 : GetIbase(Sbase, ds.SeriesInfo.Channel.Asset.VoltageKV))
                        };
                  }
                }).ToList();

            if (type == "TripCoilCurrent")
                AdjustLegendNumbering(dataLookup);

            return dataLookup;
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

        private List<D3Series> GetD3FrequencyDataLookup(VICycleDataGroup vICycleDataGroup, string type, bool includeRMS)
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
                    LegendVertical = DisplayPhaseName(cdg.RMS.SeriesInfo.Channel.Phase),
                    DataPoints = cdg.RMS.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.RMS.SeriesInfo.Channel, "RMS"),
                    Unit = type,
                    Color = GetColor(cdg.RMS.SeriesInfo.Channel),
                    LegendVGroup = GetVoltageType(cdg.RMS.SeriesInfo.Channel),
                    LegendGroup = cdg.Asset.AssetName,
                    BaseValue = (type == "Voltage" ? GetBaseV(cdg.RMS.SeriesInfo.Channel, true) * 1000.0 : GetIbase(Sbase, cdg.RMS.SeriesInfo.Channel.Asset.VoltageKV))

                };
                if (includeRMS)
                    dataLookup.Add(flotSeriesRMS);

                D3Series flotSeriesWaveAmp = new D3Series
                {
                    LegendHorizontal = "Pk",
                    LegendVertical = DisplayPhaseName(cdg.Peak.SeriesInfo.Channel.Phase),
                    DataPoints = cdg.Peak.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.Peak.SeriesInfo.Channel, "Amplitude"),

                    Unit = type,
                    Color = GetColor(cdg.Peak.SeriesInfo.Channel),
                    LegendVGroup = GetVoltageType(cdg.Peak.SeriesInfo.Channel),
                    LegendGroup = cdg.Asset.AssetName,
                    BaseValue = (type == "Voltage" ? GetBaseV(cdg.RMS.SeriesInfo.Channel, false) * 1000.0 : GetIbase(Sbase, cdg.RMS.SeriesInfo.Channel.Asset.VoltageKV))

                };
                dataLookup.Add(flotSeriesWaveAmp);

                D3Series flotSeriesPolarAngle = new D3Series
                {
                    LegendHorizontal = "Ph",
                    LegendVertical = DisplayPhaseName(cdg.Phase.SeriesInfo.Channel.Phase),
                    DataPoints = cdg.Phase.Multiply(180.0D / Math.PI).DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.Phase.SeriesInfo.Channel, "Phase"),
                    Unit = "Angle",
                    Color = GetColor(cdg.Phase.SeriesInfo.Channel),
                    LegendVGroup = GetVoltageType(cdg.Phase.SeriesInfo.Channel),
                    LegendGroup = cdg.Asset.AssetName,
                    BaseValue = 1.0
                };
            
                dataLookup.Add(flotSeriesPolarAngle);

            }

            return dataLookup;
        }

        

        

        #endregion

        #region [ Digitals Data ]
        [Route("GetBreakerData"),HttpGet]
        public async Task<JsonReturn> GetBreakerData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventId = int.Parse(query["eventId"]);

                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection(connection.Connection, typeof(SqlDataAdapter), false);
           
                DataGroup dataGroup = await QueryDataGroupAsync(evt.ID, meter);
                List<D3Series> resultList = GetBreakerLookup(dataGroup);
                
                JsonReturn returnDict = new JsonReturn();
                returnDict.Data = resultList;
                DownSample(returnDict);
                return returnDict;
            }
        }

        private List<D3Series> GetBreakerLookup(DataGroup dataGroup)
        {

            List<D3Series>  dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Digital").Select(ds =>
                new D3Series()
                   {
                       ChartLabel = (ds.SeriesInfo.Channel.Description == null) ? GetChartLabel(ds.SeriesInfo.Channel) : ds.SeriesInfo.Channel.Description,
                       Unit = "",
                       Color = GetColor(ds.SeriesInfo.Channel),
                       LegendHorizontal = ds.SeriesInfo.Channel.Asset.AssetKey,
                       LegendVertical = "D ",
                       LegendGroup = "",
                       DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                }).ToList();

            AdjustLegendNumbering(dataLookup);
            return dataLookup;
        }

        private void AdjustLegendNumbering(List<D3Series> data)
        {
            Dictionary<string, int> index = new Dictionary<string, int>();
            data.Select(item => item.LegendHorizontal).Distinct().ToList().ForEach(item => index.Add(item, 0));

            data.ForEach(item =>
            {
                index[item.LegendHorizontal]++;
                item.LegendVertical = item.LegendVertical + index[item.LegendHorizontal].ToString();
            });
        }

        #endregion

        #region [ Analogs Data ]

        [Route("GetAnalogsData"), HttpGet]
        public async Task<JsonReturn> GetAnalogsData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventId = int.Parse(query["eventId"]);

                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection(connection.Connection, typeof(SqlDataAdapter), false);

                DataGroup dataGroup = await QueryDataGroupAsync(evt.ID, meter);
                List<D3Series> returnList = GetAnalogsLookup(dataGroup);
              
                JsonReturn returnDict = new JsonReturn();
                returnDict.Data = returnList;
                DownSample(returnDict);
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
                       ChartLabel = (ds.SeriesInfo.Channel.Description == null)? GetChartLabel(ds.SeriesInfo.Channel): ds.SeriesInfo.Channel.Description,
                       Unit = "",
                       Color = GetColor(ds.SeriesInfo.Channel),
                       LegendClass = "",
                       LegendHorizontal = ds.SeriesInfo.Channel.Asset.AssetKey,
                       LegendVertical = "A ",
                       DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                   }).ToList();

            AdjustLegendNumbering(dataLookup);
            return dataLookup;
        }

        #endregion
        
       
        #region [ Info ]

        [Route("GetHeaderData"),HttpGet]
        public Dictionary<string, dynamic> GetHeaderData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventId = int.Parse(query["eventId"]);
            string breakerOperationID = (query.ContainsKey("breakeroperation") ? query["breakeroperation"] : "-1");

            Dictionary<string, dynamic> returnDict = new Dictionary<string, dynamic>();

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                EventView theEvent = new TableOperations<EventView>(connection).QueryRecordWhere("ID = {0}", eventId);

                returnDict.Add("SystemFrequency", connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? "60.0");
                returnDict.Add("StationName", theEvent.StationName);
                returnDict.Add("MeterId", theEvent.MeterID.ToString());
                returnDict.Add("MeterName", theEvent.MeterName);
                returnDict.Add("AssetName", theEvent.AssetName);

                returnDict.Add("EventName", theEvent.EventTypeName);
                returnDict.Add("EventDate", theEvent.StartTime.ToString("yyyy-MM-dd HH:mm:ss.fffffff"));
                returnDict.Add("Date", theEvent.StartTime.ToShortDateString());
                returnDict.Add("EventMilliseconds", theEvent.StartTime.Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds.ToString());
                                
                returnDict.Add("xdaInstance", connection.ExecuteScalar<string>("SELECT Value FROM DashSettings WHERE Name = 'System.XDAInstance'"));

                

                if (new List<string>() { "Fault", "RecloseIntoFault" }.Contains(returnDict["EventName"]))
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
                        returnDict.Add("StartTime", thesummary.Inception.TimeOfDay.ToString());
                        returnDict.Add("Phase", thesummary.FaultType);
                        returnDict.Add("DurationPeriod", thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles");
                        returnDict.Add("Magnitude", thesummary.CurrentMagnitude.ToString("####.#", CultureInfo.InvariantCulture) + " Amps (RMS)");
                        returnDict.Add("SagDepth", sagDepth.ToString("####.#", CultureInfo.InvariantCulture) + "%");
                        returnDict.Add("CalculationCycle", thesummary.CalculationCycle.ToString());
                    }
                }
                else if (new List<string>() { "Sag", "Swell" }.Contains(returnDict["EventName"]))
                {
                    openXDA.Model.Disturbance disturbance = new TableOperations<openXDA.Model.Disturbance>(connection).QueryRecordsWhere("EventID = {0}", theEvent.ID).Where(row => row.EventTypeID == theEvent.EventTypeID).OrderBy(row => row.StartTime).FirstOrDefault();

                    if ((object)disturbance != null)
                    {
                        returnDict.Add("StartTime", disturbance.StartTime.TimeOfDay.ToString());
                        returnDict.Add("Phase", new TableOperations<Phase>(connection).QueryRecordWhere("ID = {0}", disturbance.PhaseID).Name);
                        returnDict.Add("DurationPeriod", disturbance.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles");

                        if (disturbance.PerUnitMagnitude != -1.0e308)
                        {
                            returnDict.Add("Magnitude", disturbance.PerUnitMagnitude.ToString("N3", CultureInfo.InvariantCulture) + " pu (RMS)");
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
                            returnDict.Add("BreakerNumber", breakerRow.BreakerNumber);
                            returnDict.Add("BreakerPhase", new TableOperations<Phase>(connection).QueryRecordWhere("ID = {0}", breakerRow.PhaseID).Name);
                            returnDict.Add("BreakerTiming", breakerRow.BreakerTiming.ToString());
                            returnDict.Add("BreakerSpeed", breakerRow.BreakerSpeed.ToString());
                            returnDict.Add("BreakerOperation", connection.ExecuteScalar("SELECT Name FROM BreakerOperationType WHERE ID = {0}", breakerRow.BreakerOperationTypeID).ToString());
                        }
                    }
                }

                return returnDict;
            }
        }

    [Route("GetNavData"), HttpGet]
    public Dictionary<string, Tuple<EventView, EventView>> GetNavData()
    {
        Dictionary<string, string> query = Request.QueryParameters();
        int eventId = int.Parse(query["eventId"]);

        Dictionary<string, Tuple<EventView, EventView>> nextBackLookup = new Dictionary<string, Tuple<EventView, EventView>>()
            {
                { "System", Tuple.Create((EventView)null, (EventView)null) },
                { "Station", Tuple.Create((EventView)null, (EventView)null) },
                { "Meter", Tuple.Create((EventView)null, (EventView)null) },
                { "Asset", Tuple.Create((EventView)null, (EventView)null) }
            };

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

        using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
        {
            EventView theEvent = new TableOperations<EventView>(connection).QueryRecordWhere("ID = {0}", eventId);
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
            return nextBackLookup;
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
            DateTime startTime = ((query.ContainsKey("startDate") && query["startDate"]  != "null") ? DateTime.Parse(query["startDate"]) : evt.StartTime);
            DateTime endTime = ((query.ContainsKey("endDate") && query["endDate"] != "null") ? DateTime.Parse(query["endDate"]) : evt.EndTime);


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

        [Route("GetLightningData"), HttpGet]
        public IEnumerable<object> GetLightningData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventID"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                const string QueryFormat =
                    "SELECT * " +
                    "FROM " +
                    "    LightningStrike LEFT OUTER JOIN " +
                    "    VaisalaExtendedLightningData ON VaisalaExtendedLightningData.LightningStrikeID = LightningStrike.ID " +
                    "WHERE EventID = {0}";

                object ToLightningStrike(DataRow row) => new
                {
                    Service = row.ConvertField<string>("Service"),
                    UTCTime = row.ConvertField<DateTime>("UTCTime"),
                    DisplayTime = row.ConvertField<string>("DisplayTime"),
                    Amplitude = row.ConvertField<double>("Amplitude"),
                    Latitude = row.ConvertField<double>("Latitude"),
                    Longitude = row.ConvertField<double>("Longitude"),
                    PeakCurrent = row.ConvertField<int>("PeakCurrent"),
                    FlashMultiplicity = row.ConvertField<int>("FlashMultiplicity"),
                    ParticipatingSensors = row.ConvertField<int>("ParticipatingSensors"),
                    DegreesOfFreedom = row.ConvertField<int>("DegreesOfFreedom"),
                    EllipseAngle = row.ConvertField<double>("EllipseAngle"),
                    SemiMajorAxisLength = row.ConvertField<double>("SemiMajorAxisLength"),
                    SemiMinorAxisLength = row.ConvertField<double>("SemiMinorAxisLength"),
                    ChiSquared = row.ConvertField<double>("ChiSquared"),
                    Risetime = row.ConvertField<double>("Risetime"),
                    PeakToZeroTime = row.ConvertField<double>("PeakToZeroTime"),
                    MaximumRateOfRise = row.ConvertField<double>("MaximumRateOfRise"),
                    CloudIndicator = row.ConvertField<bool>("CloudIndicator"),
                    AngleIndicator = row.ConvertField<bool>("AngleIndicator"),
                    SignalIndicator = row.ConvertField<bool>("SignalIndicator"),
                    TimingIndicator = row.ConvertField<bool>("TimingIndicator")
                };

                return connection
                    .RetrieveData(QueryFormat, eventID)
                    .AsEnumerable()
                    .Select(ToLightningStrike);
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
            

        }
        #endregion
        

        #endregion

    }
}