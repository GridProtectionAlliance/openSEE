//******************************************************************************************************
//  OpenSEECSVDownload.ashx.cs - Gbtc
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
//
//******************************************************************************************************

using FaultData.DataAnalysis;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Threading;
using Newtonsoft.Json;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using CancellationToken = System.Threading.CancellationToken;
using D3Series = OpenSEE.OpenSEEController.D3Series;

namespace OpenSEE
{
    /// <summary>
    /// Summary description for OpenSEECSVDownload
    /// </summary>
    public class CSVDownload : IHttpHandler
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);
        // Nested Types
        private class HttpResponseCancellationToken : CompatibleCancellationToken
        {
            private readonly HttpResponse m_reponse;

            public HttpResponseCancellationToken(HttpResponse response) : base(CancellationToken.None)
            {
                m_reponse = response;
            }

            public override bool IsCancelled => !m_reponse.IsClientConnected;
        }

        const string CsvContentType = "text/csv";

        #endregion

        #region [ Properties ]

        /// <summary>
        /// Gets a value indicating whether another request can use the <see cref="IHttpHandler"/> instance.
        /// </summary>
        /// <returns>
        /// <c>true</c> if the <see cref="IHttpHandler"/> instance is reusable; otherwise, <c>false</c>.
        /// </returns>
        public bool IsReusable => false;

        /// <summary>
        /// Determines if client cache should be enabled for rendered handler content.
        /// </summary>
        /// <remarks>
        /// If rendered handler content does not change often, the server and client will use the
        /// <see cref="IHostedHttpHandler.GetContentHash"/> to determine if the client needs to refresh the content.
        /// </remarks>
        public bool UseClientCache => false;

        public string Filename { get; private set; }
        #endregion

        #region [ Methods ]

        public void ProcessRequest(HttpContext context)
        {
            HttpResponse response = HttpContext.Current.Response;
            HttpResponseCancellationToken cancellationToken = new HttpResponseCancellationToken(response);
            NameValueCollection requestParameters = context.Request.QueryString;

            try
            {
                Filename = (requestParameters["Meter"] == null? (requestParameters["Meter"] + "_") : "") + (requestParameters["EventType"] == null? requestParameters["EventType"] + "_" : "") + "Event_" + requestParameters["eventID"] + ".csv";
                if (requestParameters["type"] == "pqds")
                    Filename = "PQDS_" + Filename;
                response.ClearContent();
                response.Clear();
                response.AddHeader("Content-Type", CsvContentType);
                response.AddHeader("Content-Disposition", "attachment;filename=" + Filename);
                response.BufferOutput = true;

                WriteTableToStream(requestParameters, response.OutputStream, response.Flush, cancellationToken);
            }
            catch (Exception e)
            {
                LogExceptionHandler?.Invoke(e);
                throw;
            }
            finally
            {
                response.End();
            }
        }

        public Task ProcessRequestAsync(HttpRequestMessage request, HttpResponseMessage response, CancellationToken cancellationToken)
        {
            NameValueCollection requestParameters = request.RequestUri.ParseQueryString();

            response.Content = new PushStreamContent((stream, content, context) =>
            {
                try
                {
                    Filename = (requestParameters["Meter"] == null ? (requestParameters["Meter"] + "_") : "") + (requestParameters["EventType"] == null ? requestParameters["EventType"] + "_" : "") + "Event_" + requestParameters["eventID"] + ".csv";
                    if (requestParameters["type"] == "pqds")
                        Filename = "PQDS_" + Filename;

                    WriteTableToStream(requestParameters, stream, null, cancellationToken);
                }
                catch (Exception e)
                {
                    LogExceptionHandler?.Invoke(e);
                    throw;
                }
                finally
                {
                    stream.Close();
                }
            },
            new MediaTypeHeaderValue(CsvContentType));

            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = Filename
            };

            return Task.CompletedTask;
        }

        private void WriteTableToStream(NameValueCollection requestParameters, Stream responseStream, Action flushResponse, CompatibleCancellationToken cancellationToken)
        {
            if (requestParameters["type"] == "csv")
                ExportToCSV(responseStream, requestParameters);
            else if (requestParameters["type"] == "pqds")
                ExportToPQDS(responseStream, requestParameters);
            else if (requestParameters["type"] == "stats")
                ExportStatsToCSV(responseStream, requestParameters);
            else if (requestParameters["type"] == "harmonics")
                ExportHarmonicsToCSV(responseStream, requestParameters);
            else if (requestParameters["type"] == "correlatedsags")
                ExportCorrelatedSagsToCSV(responseStream, requestParameters);
        }

      
        // Converts the data group row of CSV data.
        private string ToCSV(IEnumerable<D3Series> data, int index)
        {
            DateTime timestamp = new DateTime(); //dict.Values.First().DataPoints[index].Time;
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



        public void ExportToCSV(Stream returnStream, NameValueCollection requestParameters)
        {
            IEnumerable<D3Series> data = BuildDataSeries(requestParameters);
            if (data.Count() == 0) return;

            using (StreamWriter writer = new StreamWriter(returnStream))
            {
                IEnumerable<string> keys = data.Select(item => (item.LegendGroup + "-" + item.ChartLabel)) ;
                // Write the CSV header to the file
                writer.WriteLine(GetCSVHeader(keys));

                // Write data to the file
                for (int i = 0; i < data.First().DataPoints.Count; ++i)
                    writer.WriteLine(ToCSV(data,i));
            }
        }


        public void ExportToPQDS(Stream returnStream, NameValueCollection requestParameters)
        {
            int eventID = int.Parse(requestParameters["eventID"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", eventID);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");



                // only get Single Voltage and Single Current Data for This....
                List<PQDS.DataSeries> data = new List<PQDS.DataSeries>();
                List<PQDS.MetaDataTag> metaData = new List<PQDS.MetaDataTag>();

                VIDataGroup dataGroup = new VIDataGroup( OpenSEEController.QueryDataGroup(evt.ID, meter));

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


                if (data.Count() == 0) return;

                PQDS.PQDSFile file = new PQDS.PQDSFile(metaData, data, evt.StartTime);

                using (StreamWriter writer = new StreamWriter(returnStream))
                {
                    file.WriteToStream(writer);
                }
            }
        }

        private PQDS.DataSeries PQDSSeries(DataSeries data, string label)
        {
            PQDS.DataSeries result = new PQDS.DataSeries(label);

            result.Series = data.DataPoints.Select(item => new PQDS.DataPoint() { Time = item.Time, Value = item.Value }).ToList();

            return result;
        }

        public void ExportStatsToCSV(Stream returnStream, NameValueCollection requestParameters)
        {
            int eventId = int.Parse(requestParameters["eventId"]);
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            using (StreamWriter writer = new StreamWriter(returnStream))
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

        public void ExportCorrelatedSagsToCSV(Stream returnStream, NameValueCollection requestParameters)
        {
            int eventID = int.Parse(requestParameters["eventId"]);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            using (StreamWriter writer = new StreamWriter(returnStream))
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

        public void ExportHarmonicsToCSV(Stream returnStream, NameValueCollection requestParameters)
        {
            int eventId = int.Parse(requestParameters["eventId"]);
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            using (StreamWriter writer = new StreamWriter(returnStream))
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

        public List<D3Series> BuildDataSeries(NameValueCollection requestParameters)
        {
            int eventID = int.Parse(requestParameters["eventID"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", eventID);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection("dbOpenXDA");

                IEnumerable<D3Series> returnList = new List<D3Series>();
                returnList = QueryVoltageData(meter, evt);

                returnList = returnList.Concat(QueryCurrentData(meter, evt));
                return returnList.ToList();
            }
        }

        private List<D3Series> QueryVoltageData( Meter meter, Event evt)
        {
            bool useLL;
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                useLL = connection.ExecuteScalar<bool?>("SELECT Value FROM Settings WHERE Name = 'useLLVoltage'") ?? false;
            }
                            
            DataGroup dataGroup = OpenSEEController.QueryDataGroup(evt.ID, meter);

            List<D3Series> WaveForm = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && (
                (useLL && !(ds.SeriesInfo.Channel.Phase.Name == "AB" || ds.SeriesInfo.Channel.Phase.Name == "BC" || ds.SeriesInfo.Channel.Phase.Name == "CA")) ||
                (!useLL && (ds.SeriesInfo.Channel.Phase.Name == "AB" || ds.SeriesInfo.Channel.Phase.Name == "BC" || ds.SeriesInfo.Channel.Phase.Name == "CA")))
                ).Select(
                    ds => new D3Series()
                    {
                        ChannelID = ds.SeriesInfo.Channel.ID,
                        ChartLabel = OpenSEEController.GetChartLabel(ds.SeriesInfo.Channel),
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

            VICycleDataGroup viCycleDataGroup = OpenSEEController.QueryVICycleDataGroup(evt.ID, meter);

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

        private List<D3Series> QueryCurrentData(Meter meter, Event evt)
        {
            DataGroup dataGroup = OpenSEEController.QueryDataGroup(evt.ID, meter);

            List<D3Series> WaveForm = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Current"                 
                ).Select(
                    ds => new D3Series()
                    {
                        ChannelID = ds.SeriesInfo.Channel.ID,
                        ChartLabel = OpenSEEController.GetChartLabel(ds.SeriesInfo.Channel),
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

            VICycleDataGroup viCycleDataGroup = OpenSEEController.QueryVICycleDataGroup(evt.ID, meter);

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



        #endregion

        #region [ Static ]

        public static Action<Exception> LogExceptionHandler;

        #endregion
    }
}