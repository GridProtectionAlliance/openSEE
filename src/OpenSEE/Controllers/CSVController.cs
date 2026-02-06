//******************************************************************************************************
//  CSVController.cs - Gbtc
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
//  11/06/2018 - Billy Ernest
//       Generated original version of source code.
//  02/05/2026 - Gabriel Santos
//      Refactored code to be in controller format for netcore upgrade.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using FaultData.DataAnalysis;
using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OpenSEE.Model;
using openXDA.Model;

namespace OpenSEE
{
    /// <summary>
    /// An MVC controller for downloading 
    /// </summary>
    [Route("api/CSV")]
    public class CSVController : Controller
    {
        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);

        #region [ Methods ]

        /// <summary>
        /// This is just <see cref="StreamWriter"/> with slightly different dispose logic.
        /// </summary>
        /// <remarks>
        ///  MVC owns the <see cref="Stream"/> so we shouldn't close it.
        /// </remarks>
        private class NoCloseStreamWriter : StreamWriter
        {
            public NoCloseStreamWriter(Stream stream) : base(stream) { }

            protected override void Dispose(bool disposing)
            {
                base.Dispose(false);
            }
        }

        [HttpGet, Route("Download")]
        public ActionResult GetCSV()
        {
            IQueryCollection requestParameters = Request.Query;

            string fileName = 
                $"{(requestParameters["type"] == "pqds" ? "PQDS_" : "")}" +
                $"{(requestParameters["Meters"].Any() ? (requestParameters["Meter"].ToString() + "_") : "")}" +
                $"{(requestParameters["EventType"].Any() ? (requestParameters["EventType"].ToString() + "_") : "")}" +
                $"Event_{requestParameters["eventID"].ToString()}.csv";

            // No using block, asp.net takes care of it for us
            MemoryStream stream = new MemoryStream();
            using (StreamWriter writer = new NoCloseStreamWriter(stream))
            {
                // todo: this can probably be turned async
                WriteTableToStream(writer, requestParameters);
                stream.Position = 0;
                return new FileStreamResult(stream, "text/csv")
                {
                    FileDownloadName = fileName
                };
            }
        }

        private void WriteTableToStream(StreamWriter writer, IQueryCollection requestParameters)
        {
            switch (requestParameters["type"].ToString())
            {
                case "csv":
                    ExportToCSV(writer, requestParameters);
                    return;
                case "pqds":
                    ExportToPQDS(writer, requestParameters);
                    return;
                case "stats":
                    ExportStatsToCSV(writer, requestParameters);
                    return;
                case "harmonics":
                    ExportHarmonicsToCSV(writer, requestParameters);
                    return;
                case "correlatedsags":
                    ExportCorrelatedSagsToCSV(writer, requestParameters);
                    return;
                case "fft":
                    ExportFFTToCSV(writer, requestParameters);
                    return;
                default:
                    throw new ArgumentException("Parameter 'type' is not a valid value.");
            }
        }

        // Converts the data group row of CSV data.
        private string ToCSV(IEnumerable<D3Series> data, int index)
        {
            DateTime timestamp = m_epoch.Add(new TimeSpan((long)(data.First().DataPoints[index][1] * TimeSpan.TicksPerMillisecond)));
                
            IEnumerable<string> row = new List<string>() { timestamp.ToString("MM/dd/yyyy HH:mm:ss.fffffff"), timestamp.ToString("fffffff") };

            row = row.Concat(data.Select(x => {
                if (x.DataPoints.Count > index)
                    return x.DataPoints[index][1].ToString();
                else
                    return string.Empty;
            }));

            return string.Join(",", row);
        }

        // Converts the data group row of CSV data.
        private string GetCSVHeader(IEnumerable<string> keys)
        {
            IEnumerable<string> headers = new List<string>() { "TimeStamp", "SubSecond" };
            headers = headers.Concat(keys);
            return string.Join(",", headers);
        }

        public void ExportToCSV(StreamWriter writer, IQueryCollection requestParameters)
        {
            IEnumerable<D3Series> data = BuildDataSeries(requestParameters);
            if (data.Count() == 0) return;

            IEnumerable<string> keys = data.Select(item => (item.LegendGroup + "-" + item.ChartLabel)) ;
            // Write the CSV header to the file
            writer.WriteLine(GetCSVHeader(keys));

            // Write data to the file
            for (int i = 0; i < data.First().DataPoints.Count; ++i)
                writer.WriteLine(ToCSV(data, i));
        }

        public void ExportToPQDS(StreamWriter writer, IQueryCollection requestParameters)
        {
            int eventID = int.Parse(requestParameters["eventID"].ToString());

            using (AdoDataConnection connection = new AdoDataConnection(Settings.Default))
            {
                // only get Single Voltage and Single Current Data for This....
                List<PQDS.DataSeries> data = new List<PQDS.DataSeries>();
                List<PQDS.MetaDataTag> metaData = new List<PQDS.MetaDataTag>();

                VIDataGroup dataGroup = OpenSEEBaseController
                    .QueryVIDataGroupAsync(eventID, connection)
                    .GetAwaiter()
                    .GetResult();

                if (dataGroup.VA != null)
                    data.Add(PQDSSeries(dataGroup.VA, "va"));
                if (dataGroup.VB != null)
                    data.Add(PQDSSeries(dataGroup.VB, "vb"));
                if (dataGroup.VC != null)
                    data.Add(PQDSSeries(dataGroup.VC, "vc"));

                if (dataGroup.IA != null)
                    data.Add(PQDSSeries(dataGroup.IA, "ia"));
                if (dataGroup.IB != null)
                    data.Add(PQDSSeries(dataGroup.IB, "ib"));
                if (dataGroup.IC != null)
                    data.Add(PQDSSeries(dataGroup.IC, "ic"));
                if (dataGroup.IR != null)
                    data.Add(PQDSSeries(dataGroup.IR, "in"));

                if (data.Count() == 0)
                    return;

                // Add MetaData Information
                Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", eventID);
                metaData = PQDSMetaData(evt, connection);

                PQDS.PQDSFile file = new PQDS.PQDSFile(metaData, data, evt.StartTime);

                file.WriteToStream(writer);
            }
        }

        private List<PQDS.MetaDataTag> PQDSMetaData(Event evt, AdoDataConnection connection)
        {
            List<PQDS.MetaDataTag> result = new List<PQDS.MetaDataTag>();
            Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
            Asset asset = (new TableOperations<Asset>(connection)).QueryRecordWhere("ID = {0}", evt.AssetID);
            meter.ConnectionFactory = () => new AdoDataConnection(Settings.Default);

            result.Add(new PQDS.MetaDataTag<string>("DeviceName", meter.Name));
            result.Add(new PQDS.MetaDataTag<string>("DeviceAlias", meter.ShortName));
            result.Add(new PQDS.MetaDataTag<string>("DeviceLocation", meter.Location.Name));
            result.Add(new PQDS.MetaDataTag<string>("DeviceLocationAlias", meter.Location.ShortName));
            result.Add(new PQDS.MetaDataTag<string>("Latitude", Convert.ToString(meter.Location.Latitude)));
            result.Add(new PQDS.MetaDataTag<string>("Longitude", Convert.ToString(meter.Location.Longitude)));

            double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;

            if (asset != null)
            {
                result.Add(new PQDS.MetaDataTag<double>("NominalVoltage-LG", asset.VoltageKV));
                result.Add(new PQDS.MetaDataTag<double>("NominalFrequency", systemFrequency));
                result.Add(new PQDS.MetaDataTag<string>("AssetName", asset.AssetKey));

                if (asset.AssetTypeID == connection.ExecuteScalar<int>("SELECT ID FROM AssetType WHERE Name = 'Line'"))
                    result.Add(new PQDS.MetaDataTag<double>("LineLength", connection.ExecuteScalar<double>("SELECT Length FROM LineView WHERE ID = {0}", asset.ID)));
            }


            result.Add(new PQDS.MetaDataTag<string>("EventID", evt.Name));
            result.Add(new PQDS.MetaDataTag<string>("EventGUID", Guid.NewGuid().ToString()));
            result.Add(new PQDS.MetaDataTag<double>("EventDuration", (evt.EndTime - evt.StartTime).TotalMilliseconds));
            result.Add(new PQDS.MetaDataTag<int>("EventTypeCode", PQDSEventTypeCode(evt.EventTypeID)));

            EventStat stat = (new TableOperations<EventStat>(connection)).QueryRecordWhere("EventID = {0}", evt.ID);

            if (stat != null)
            {
                if (stat.VAMax != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMaxVA", (double)stat.VAMax));
                }
                if (stat.VBMax != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMaxVB", (double)stat.VBMax));
                }
                if (stat.VCMax != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMaxVC", (double)stat.VCMax));
                }
                if (stat.VAMin != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMinVA", (double)stat.VAMin));
                }
                if (stat.VBMin != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMinVB", (double)stat.VBMin));
                }
                if (stat.VCMin != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMinVC", (double)stat.VCMin));
                }

                if (stat.IAMax != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMaxIA", (double)stat.IAMax));
                }
                if (stat.IBMax != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMaxIB", (double)stat.IBMax));
                }
                if (stat.ICMax != null)
                {
                    result.Add(new PQDS.MetaDataTag<double>("EventMaxIC", (double)stat.ICMax));
                }
            }

            result.Add(new PQDS.MetaDataTag<int>("EventYear", ((DateTime)evt.StartTime).Year));
            result.Add(new PQDS.MetaDataTag<int>("EventMonth", (evt.StartTime).Month));
            result.Add(new PQDS.MetaDataTag<int>("EventDay", (evt.StartTime).Day));
            result.Add(new PQDS.MetaDataTag<int>("EventHour", (evt.StartTime).Hour));
            result.Add(new PQDS.MetaDataTag<int>("EventMinute", (evt.StartTime).Minute));
            result.Add(new PQDS.MetaDataTag<int>("EventSecond", (evt.StartTime).Second));
            result.Add(new PQDS.MetaDataTag<int>("EventNanoSecond", Get_nanoseconds(evt.StartTime)));

            String date = String.Format("{0:D2}/{1:D2}/{2:D4}", (evt.StartTime).Month, (evt.StartTime).Day, (evt.StartTime).Year);
            String time = String.Format("{0:D2}:{1:D2}:{2:D2}", (evt.StartTime).Hour, (evt.StartTime).Minute, (evt.StartTime).Second);
            result.Add(new PQDS.MetaDataTag<string>("EventDate", date));
            result.Add(new PQDS.MetaDataTag<string>("EventTime", time));
            return result;
        }

        private int Get_nanoseconds(DateTime date)
        {
            TimeSpan day = date.TimeOfDay;
            long result = day.Ticks;
            result = result - (long)day.Hours * (60L * 60L * 10000000L);
            result = result - (long)day.Minutes * (60L * 10000000L);
            result = result - (long)day.Seconds * 10000000L;
            return ((int)result * 100);
        }

        private int PQDSEventTypeCode(int XDAevtTypeID) => 0;

        private PQDS.DataSeries PQDSSeries(DataSeries data, string label)
        {
            PQDS.DataSeries result = new PQDS.DataSeries(label);

            result.Series = data.DataPoints.Select(item => new PQDS.DataPoint() { Time = item.Time, Value = item.Value }).ToList();

            return result;
        }

        public void ExportStatsToCSV(StreamWriter writer, IQueryCollection requestParameters)
        {
            int eventId = int.Parse(requestParameters["eventId"].ToString());
            using (AdoDataConnection connection = new AdoDataConnection(Settings.Default))
            {
                DataTable dataTable = connection.RetrieveData("SELECT * FROM OpenSEEScalarStatView WHERE EventID = {0}", eventId);
                DataRow row = dataTable.AsEnumerable().First();
                Dictionary<string, string>  dict = row.Table.Columns.Cast<DataColumn>().ToDictionary(c => c.ColumnName, c => row[c].ToString());

                if (dict.Keys.Count() == 0) return;

                // Write the CSV header to the file
                writer.WriteLine(string.Join(",", dict.Keys));
                writer.WriteLine(string.Join(",", dict.Values));
            }
        }

        public void ExportCorrelatedSagsToCSV(StreamWriter writer, IQueryCollection requestParameters)
        {
            int eventID = int.Parse(requestParameters["eventId"].ToString());

            using (AdoDataConnection connection = new AdoDataConnection(Settings.Default))
            {
                double timeTolerance = connection.ExecuteScalar<double>("SELECT Value FROM Setting WHERE Name = 'TimeTolerance'");
                DateTime startTime = connection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0}", eventID);
                DateTime endTime = connection.ExecuteScalar<DateTime>("SELECT EndTime FROM Event WHERE ID = {0}", eventID);
                DateTime adjustedStartTime = startTime.AddSeconds(-timeTolerance);
                DateTime adjustedEndTime = endTime.AddSeconds(timeTolerance);
                DataTable dataTable = connection.RetrieveData(OpenSEEController.TimeCorrelatedSagsSQL, adjustedStartTime, adjustedEndTime);

                if (dataTable.Columns.Count == 0)
                    return;

                string[] header = dataTable.Columns
                    .Cast<DataColumn>()
                    .Select(column => column.ColumnName)
                    .ToArray();

                IEnumerable<string[]> rows = dataTable
                    .Select()
                    .Select(row => header.Select(column => row[column].ToString()).ToArray());

                writer.WriteLine(string.Join(",", header));

                foreach (string[] row in rows)
                    writer.WriteLine(string.Join(",", row));
            }
        }

        private class PhasorResult {
            public double Magnitude;
            public double Angle;
        }

        public void ExportFFTToCSV(StreamWriter writer, IQueryCollection requestParameters)
        {
            int eventId = int.Parse(requestParameters["eventID"].ToString());

            using (AdoDataConnection connection = new AdoDataConnection(Settings.Default))
            {
                double startTime = requestParameters["startDate"].Any() ? double.Parse(requestParameters["startDate"].ToString()) : 0.0;
                int cycles = requestParameters["cycles"].Any() ? int.Parse(requestParameters["cycles"].ToString()) : 0;

                AnalyticController ctrl = new AnalyticController();

                DataGroup dataGroup = OpenSEEBaseController
                    .QueryDataGroupAsync(eventId, connection)
                    .GetAwaiter()
                    .GetResult();

                List<D3Series> harmonics = ctrl.GetFFTLookup(dataGroup, startTime, cycles); // AnalyticController.GetFFTLookup(dataGroup, startTime, cycles);
                List<string> headers = new List<string>() { "Harmonic" };
                headers = headers.Concat(harmonics.Select(item => item.LegendGroup + " " + item.LegendVertical + " " + item.LegendHorizontal)).ToList();

                if (headers.Count == 1)
                    return;

                // Write the CSV header to the file
                writer.WriteLine(string.Join(",", headers));

                for (int i = 0; i < harmonics.First().DataPoints.Count(); ++i)
                {
                    List<string> line = new List<string>() { harmonics.First().DataPoints[i][0].ToString() };
                    line = line.Concat(harmonics.Select(item => item.DataPoints[i][1].ToString())).ToList();
                    writer.WriteLine(string.Join(",", line));
                }
            }
        }

        public void ExportHarmonicsToCSV(StreamWriter writer, IQueryCollection requestParameters)
        {
            int eventId = int.Parse(requestParameters["eventId"].ToString());
            using (AdoDataConnection connection = new AdoDataConnection(Settings.Default))
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

                Dictionary<string, Dictionary<string, PhasorResult>> dict = dataTable.Select().ToDictionary(x => x["Channel"].ToString(), x => JsonConvert.DeserializeObject<Dictionary<string, PhasorResult>>(x["SpectralData"].ToString()));
                int numHarmonics = dict.Select(x => x.Value.Count).Max();

                List<string> headers = new List<string>() { "Harmonic" };
                foreach(var kvp in dict)
                {
                    headers.Add(kvp.Key + " Mag");
                    headers.Add(kvp.Key + " Ang");
                }

                if (dict.Keys.Count() == 0) return;

                // Write the CSV header to the file
                writer.WriteLine(string.Join(",", headers));

                for (int i = 1; i <= numHarmonics; ++i) {
                    string label = $"H{i}";
                    List<string> line = new List<string>() { label };
                    foreach(var kvp in dict)
                    {
                        if (kvp.Value.ContainsKey(label))
                        {
                            line.Add(kvp.Value[label].Magnitude.ToString());
                            line.Add(kvp.Value[label].Angle.ToString());
                        }
                        else {
                            line.Add("0");
                            line.Add("0");
                        }

                    }
                    writer.WriteLine(string.Join(",", line));
                }
            }
        }

        public List<D3Series> BuildDataSeries(IQueryCollection requestParameters)
        {
            int eventID = int.Parse(requestParameters["eventID"].ToString());
            bool displayVolt = requestParameters["displayVolt"].Any() ? bool.Parse(requestParameters["displayVolt"]) : true;
            bool displayCur = requestParameters["displayCur"].Any() ? bool.Parse(requestParameters["displayCur"]) : true;
            bool displayTCE = requestParameters["displayTCE"].Any() ? bool.Parse(requestParameters["displayTCE"]) : false;
            bool breakerdigitals = requestParameters["breakerdigitals"].Any() ? bool.Parse(requestParameters["breakerdigitals"]) : false;
            bool displayAnalogs = requestParameters["displayAnalogs"].Any() ? bool.Parse(requestParameters["displayAnalogs"]) : false;
            int lpfOrder = requestParameters["lpfOrder"].Any() ? int.Parse(requestParameters["lpfOrder"]) : 0;
            int hpfOrder = requestParameters["hpfOrder"].Any() ? int.Parse(requestParameters["hpfOrder"]) : 0;
            double Trc = requestParameters["Trc"].Any() ? double.Parse(requestParameters["Trc"]) : 0.0;
            int harmonic = requestParameters["harmonic"].Any() ? int.Parse(requestParameters["harmonic"]) : 1;
            List<string> displayAnalytics = requestParameters["displayAnalytics"].Any() ? requestParameters["displayAnalytics"].ToString().Split(',').ToList() : new List<string>();
            
            using (AdoDataConnection connection = new AdoDataConnection(Settings.Default))
            {
                DataGroup dataGroup = OpenSEEBaseController
                    .QueryDataGroupAsync(eventID, connection)
                    .GetAwaiter()
                    .GetResult();

                VICycleDataGroup viCycleDataGroup = OpenSEEBaseController
                    .QueryVICycleDataGroupAsync(eventID, connection)
                    .GetAwaiter()
                    .GetResult();

                Lazy<VIDataGroup> lazyVIDataGroup = new Lazy<VIDataGroup>(() =>
                {
                    return OpenSEEBaseController
                        .QueryVIDataGroupAsync(eventID, connection)
                        .GetAwaiter()
                        .GetResult();
                });

                IEnumerable<D3Series> returnList = new List<D3Series>();
                if (displayVolt)
                    returnList = returnList.Concat(QueryVoltageData(dataGroup, viCycleDataGroup));

                if(displayCur)
                    returnList = returnList.Concat(QueryCurrentData(dataGroup, viCycleDataGroup));

                if(displayTCE)
                    returnList = returnList.Concat(QueryTCEData(dataGroup));

                if (displayAnalogs)
                    returnList = returnList.Concat(QueryAnalogData(dataGroup));

                if (breakerdigitals)
                    returnList = returnList.Concat(QueryDigitalData(dataGroup));

                foreach (var analytics in displayAnalytics)
                {
                    if (!string.IsNullOrEmpty(analytics))
                        returnList = returnList.Concat(QueryAnalyticData(dataGroup, viCycleDataGroup, lazyVIDataGroup, analytics, lpfOrder, hpfOrder, Trc, harmonic));
                }

                returnList = AlignData(returnList.ToList());

                return returnList.ToList();
            }
        }

        private List<D3Series> QueryAnalyticData(DataGroup dataGroup, VICycleDataGroup viCycleData, Lazy<VIDataGroup> lazyVIDataGroup, string analytic, int lowPassOrder, int highPassOrder, double Trc, int harmonic)
        {

            AnalyticController controller = new AnalyticController();

            if (analytic == "FirstDerivative")
                return controller.GetFirstDerivativeLookup(dataGroup, viCycleData);
            if (analytic == "ClippedWaveforms")
                return controller.GetClippedWaveformsLookup(dataGroup);
            if (analytic == "Frequency")
                return controller.GetFrequencyLookup(lazyVIDataGroup.Value);
            if (analytic == "Impedance")
                return controller.GetImpedanceLookup(viCycleData);
            if (analytic == "Power")
                return controller.GetPowerLookup(viCycleData);
            if (analytic == "RemoveCurrent")
                return controller.GetRemoveCurrentLookup(dataGroup);
            if (analytic == "MissingVoltage")
                return controller.GetMissingVoltageLookup(dataGroup);
            if (analytic == "LowPassFilter")
                return controller.GetLowPassFilterLookup(dataGroup, lowPassOrder);
            if (analytic == "HighPassFilter")
                return controller.GetHighPassFilterLookup(dataGroup, highPassOrder);
            if (analytic == "SymmetricalComponents")
                return controller.GetSymmetricalComponentsLookup(viCycleData);
            if (analytic == "Unbalance")
                return controller.GetUnbalanceLookup(viCycleData);
            if (analytic == "Rectifier")
                return controller.GetRectifierLookup(lazyVIDataGroup.Value, Trc);
            if (analytic == "RapidVoltageChange")
                return controller.GetRapidVoltageChangeLookup(viCycleData);
            if (analytic == "THD")
                return controller.GetTHDLookup(dataGroup, true);
            if (analytic == "SpecifiedHarmonic")
                return controller.GetSpecifiedHarmonicLookup(dataGroup, harmonic, true);
            if (analytic == "OverlappingWaveform")
                return controller.GetOverlappingWaveformLookup(dataGroup);

            return new List<D3Series>();
        }

        private List<D3Series> QueryVoltageData(DataGroup dataGroup, VICycleDataGroup viCycleDataGroup)
        {
            bool useLL;
            using (AdoDataConnection connection = new AdoDataConnection(Settings.Default))
            {
                useLL = bool.Parse(new TableOperations<OpenSEESetting>(connection).QueryRecordWhere("Name = {0}", "useLLVoltage")?.Value ?? bool.FalseString);
            }

            List<D3Series> WaveForm = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && (
                (useLL && !(ds.SeriesInfo.Channel.Phase.Name == "AB" || ds.SeriesInfo.Channel.Phase.Name == "BC" || ds.SeriesInfo.Channel.Phase.Name == "CA")) ||
                (!useLL && (ds.SeriesInfo.Channel.Phase.Name == "AB" || ds.SeriesInfo.Channel.Phase.Name == "BC" || ds.SeriesInfo.Channel.Phase.Name == "CA")))
                ).Select(
                    ds => new D3Series()
                    {
                        ChannelID = ds.SeriesInfo.Channel.ID,
                        ChartLabel = OpenSEEBaseController.GetChartLabel(ds.SeriesInfo.Channel),
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    }).ToList();

            WaveForm.Sort((a, b) => {
                    if (a.LegendGroup == b.LegendGroup)
                    {
                        return a.ChartLabel.CompareTo(b.ChartLabel);
                    }
                    return a.LegendGroup.CompareTo(b.LegendGroup);
                });

            List<D3Series> result = new List<D3Series>();

            foreach(D3Series w in WaveForm)
            {
                result.Add(w);
                int index = viCycleDataGroup.CycleDataGroups.FindIndex(item => item.RMS.SeriesInfo.ChannelID == w.ChannelID);
                if (index > -1)
                {
                    result.Add(new D3Series
                    {
                        ChannelID = w.ChannelID,
                        DataPoints = viCycleDataGroup.CycleDataGroups[index].RMS.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                        ChartLabel = w.ChartLabel +  " RMS",
                        LegendGroup = w.LegendGroup,

                    });

                    result.Add(new D3Series
                    {
                        ChannelID = w.ChannelID,
                        DataPoints = viCycleDataGroup.CycleDataGroups[index].Phase.Multiply(180.0D / Math.PI).DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                        ChartLabel = w.ChartLabel + " Phase",
                        LegendGroup = w.LegendGroup,
                    });

                }
            }

            return result;
        }

        private List<D3Series> QueryCurrentData(DataGroup dataGroup, VICycleDataGroup viCycleDataGroup)
        {

            List<D3Series> WaveForm = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Current"                 
                ).Select(
                    ds => new D3Series()
                    {
                        ChannelID = ds.SeriesInfo.Channel.ID,
                        ChartLabel = OpenSEEBaseController.GetChartLabel(ds.SeriesInfo.Channel),
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    }).ToList();

            WaveForm.Sort((a, b) => {
                if (a.LegendGroup == b.LegendGroup)
                {
                    return a.ChartLabel.CompareTo(b.ChartLabel);
                }
                return a.LegendGroup.CompareTo(b.LegendGroup);
            });

            List<D3Series> result = new List<D3Series>();

            foreach (D3Series w in WaveForm)
            {
                result.Add(w);
                int index = viCycleDataGroup.CycleDataGroups.FindIndex(item => item.RMS.SeriesInfo.ChannelID == w.ChannelID);
                if (index > -1)
                {
                    result.Add(new D3Series
                    {
                        ChannelID = w.ChannelID,
                        DataPoints = viCycleDataGroup.CycleDataGroups[index].RMS.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                        ChartLabel = w.ChartLabel + " RMS",
                        LegendGroup = w.LegendGroup,

                    });

                    result.Add(new D3Series
                    {
                        ChannelID = w.ChannelID,
                        DataPoints = viCycleDataGroup.CycleDataGroups[index].Phase.Multiply(180.0D / Math.PI).DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                        ChartLabel = w.ChartLabel + " Phase",
                        LegendGroup = w.LegendGroup,
                    });

                }
            }

            return result;
        }

        private List<D3Series> QueryTCEData(DataGroup dataGroup)
        {
            return dataGroup.DataSeries
                .Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "TripCoilCurrent")
                .Select(
                    ds => new D3Series()
                    {
                        ChannelID = ds.SeriesInfo.Channel.ID,
                        ChartLabel = OpenSEEBaseController.GetChartLabel(ds.SeriesInfo.Channel),
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    })
                .ToList();
        }

        private List<D3Series> QueryDigitalData(DataGroup dataGroup)
        {
            return dataGroup.DataSeries
                .Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Digital")
                .Select(
                    ds => new D3Series()
                    {
                        ChannelID = ds.SeriesInfo.Channel.ID,
                        ChartLabel = OpenSEEController.GetChartLabel(ds.SeriesInfo.Channel),
                        LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                        DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    })
                .ToList();
        }

        private List<D3Series> AlignData(List<D3Series> data)
        {
            data.ForEach(series => {
                series.DataPoints = series.DataPoints.OrderBy(p => p[0]).ToList();
            });

            double minT = data.Select(item => item.DataPoints[0][0]).Min();
            double maxT = data.Select(item => item.DataPoints[item.DataPoints.Count - 1][0]).Max();
            int indexFirstTS = data.FindIndex(x => x.DataPoints[0][0] == minT);

            // For Now We are Assuming all data has the same Sampling Rate
            // Should be guaranteed since we have a single DFR
            IEnumerable<D3Series> result = data.Select(item =>
            {
                if (item.DataPoints[0][0] <= minT)
                    return item;

                int idx = data[indexFirstTS].DataPoints.FindIndex(i => i[0] > item.DataPoints[0][0]);

                List<double[]> temp = new List<double[]>();

                for (int i = 0; i < idx; i++)
                    temp.Add(new double[] { data[indexFirstTS].DataPoints[i][0], double.NaN });

                item.DataPoints = temp.Concat(item.DataPoints).ToList();

                return item;
            });

            return result.ToList();
        }

        private List<D3Series> QueryAnalogData(DataGroup dataGroup)
        {
            return dataGroup.DataSeries
                .Where(ds =>
                    ds.SeriesInfo.Channel.MeasurementType.Name != "Digital" &&
                    ds.SeriesInfo.Channel.MeasurementType.Name != "Voltage" &&
                    ds.SeriesInfo.Channel.MeasurementType.Name != "Current" &&
                    ds.SeriesInfo.Channel.MeasurementType.Name != "TripCoilCurrent").Select(ds =>
                        new D3Series()
                        {
                            ChannelID = ds.SeriesInfo.Channel.ID,
                            ChartLabel = ds.SeriesInfo.Channel.Description ?? OpenSEEBaseController.GetChartLabel(ds.SeriesInfo.Channel),
                            LegendGroup = ds.SeriesInfo.Channel.Asset.AssetName,
                            DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                        }
                ).ToList();
        }

        #endregion
    }
}