//******************************************************************************************************
//  Global.asax.cs - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  02/19/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Gemstone;
using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Identity;
using Gemstone.IO;
using Gemstone.Security;
using Gemstone.Web.Embedded;
using Gemstone.Web.Model;
using OpenSEE.Model;

namespace OpenSEE
{
    public class MvcApplication : HttpApplication
    {
        /// <summary>
        /// Gets the default model used for the application.
        /// </summary>
        public static readonly AppModel DefaultModel = new AppModel();

        protected void Application_Start()
        {
            Directory.SetCurrentDirectory(FilePath.GetAbsolutePath(""));

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Add additional virtual path provider to allow access to embedded resources
            EmbeddedResourceProvider.Register();

            GlobalSettings global = DefaultModel.Global;

            // Make sure LSCVSReport specific default config file service settings exist
            CategorizedSettingsElementCollection systemSettings = ConfigurationFile.Current.Settings["systemSettings"];
            CategorizedSettingsElementCollection securityProvider = ConfigurationFile.Current.Settings["securityProvider"];

            systemSettings.Add("ConnectionString", "Data Source=localhost; Initial Catalog=OpenSee; Integrated Security=SSPI", "Configuration connection string.");
            systemSettings.Add("DataProviderString", "AssemblyName={System.Data, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089}; ConnectionType=System.Data.SqlClient.SqlConnection; AdapterType=System.Data.SqlClient.SqlDataAdapter", "Configuration database ADO.NET data provider assembly type creation string used");
            systemSettings.Add("CompanyName", "Grid Protection Alliance", "The name of the company who owns this instance of the openSee.");
            systemSettings.Add("CompanyAcronym", "GPA", "The acronym representing the company who owns this instance of the openSee.");
            systemSettings.Add("DateFormat", "MM/dd/yyyy", "The default date format to use when rendering timestamps.");
            systemSettings.Add("TimeFormat", "HH:mm.ss.fff", "The default time format to use when rendering timestamps.");
            systemSettings.Add("DefaultSecurityRoles", "Administrator, Manager, Engineer", "The default security roles that should exist for the application.");
            securityProvider.Add("PasswordRequirementsRegex", AdoSecurityProvider.DefaultPasswordRequirementsRegex, "Regular expression used to validate new passwords for database users.");
            securityProvider.Add("PasswordRequirementsError", AdoSecurityProvider.DefaultPasswordRequirementsError, "Error message to be displayed when new database user password fails regular expression test.");

            // Load default configuration file based model settings
            global.CompanyName = systemSettings["CompanyName"].Value;
            global.CompanyAcronym = systemSettings["CompanyAcronym"].Value;
            global.DateFormat = systemSettings["DateFormat"].Value;
            global.TimeFormat = systemSettings["TimeFormat"].Value;
            global.DateTimeFormat = $"{global.DateFormat} {global.TimeFormat}";
            global.PasswordRequirementsRegex = securityProvider["PasswordRequirementsRegex"].Value;
            global.PasswordRequirementsError = securityProvider["PasswordRequirementsError"].Value;

            // Load database driven model settings
            using (DataContext dataContext = new DataContext(exceptionHandler: LogException))
            {
                
                // Load global web settings
                Dictionary<string, string> appSetting = dataContext.LoadDatabaseSettings("app.setting");
                global.ApplicationName = appSetting.TryGetValue("applicationName", out string setting)? setting : "OpenSEE";
                global.ApplicationDescription = appSetting.TryGetValue("applicationDescription", out setting) ? setting : "Event Viewing Engine";
                global.ApplicationKeywords = appSetting.TryGetValue("applicationKeywords", out setting) ? setting : "open source, utility, browser, power quality, management";
                global.BootstrapTheme = appSetting.TryGetValue("bootstrapTheme", out setting) ? setting : "~/Content/bootstrap-theme.css";

                // Cache application settings
                foreach (KeyValuePair<string, string> item in appSetting)
                    global.ApplicationSettings.Add(item.Key, item.Value);
            }
        }

        private void Page_Error(object sender, EventArgs e)
        {
            Exception exc = Server.GetLastError();
            WriteToErrorLog(exc);

            // Clear the error from the server.
            Server.ClearError();
        }

        void Application_Error(object sender, EventArgs e)
        {
            Exception exc = Server.GetLastError();
            WriteToErrorLog(exc);
        }

        /// <summary>
        /// Logs a status message.
        /// </summary>
        /// <param name="message">Message to log.</param>
        /// <param name="type">Type of message to log.</param>
        public static void LogStatusMessage(string message, UpdateType type = UpdateType.Information)
        {
            // TODO: Write message to log with log4net, etc.
        }

        /// <summary>
        /// Logs an exception.
        /// </summary>
        /// <param name="ex">Exception to log.</param>
        public static void LogException(Exception ex)
        {
            // TODO: Write exception to log with log4net, etc.
#if DEBUG
            ThreadPool.QueueUserWorkItem(state =>
            {
                Thread.Sleep(1500);
            });
#endif
            WriteToErrorLog(ex);
        }

        private static ReaderWriterLockSlim LogFileReadWriteLock = new ReaderWriterLockSlim();

        public static void WriteToErrorLog(Exception ex, bool innerException = false)
        {
            if (ex.InnerException != null) WriteToErrorLog(ex.InnerException, true);

            string folderPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "OpenSee");
            string path = Path.Combine("C:\\Users\\Public\\Documents", "OpenSee.ErrorLog.txt");
            // Set Status to Locked
            LogFileReadWriteLock.EnterWriteLock();
            try
            {
                Directory.CreateDirectory(folderPath);
                // Append text to the file
                using (StreamWriter sw = File.AppendText(path))
                {
                    sw.WriteLine($"[{DateTime.Now}] ({(innerException ? "Inner Exception" : "Outer Excpetion")})");
                    sw.WriteLine($"Exception Source:    {ex.Source}");
                    sw.WriteLine($"Exception Message:    {ex.Message}");
                    sw.WriteLine();
                    sw.WriteLine("---- Stack Trace ----");
                    sw.WriteLine();
                    sw.WriteLine(ex.StackTrace);
                    sw.WriteLine();
                    sw.WriteLine();

                    sw.Close();
                }
            }
            finally
            {
                // Release lock
                LogFileReadWriteLock.ExitWriteLock();
            }
        }


    }
}
