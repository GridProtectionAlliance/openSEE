//******************************************************************************************************
//  Program.cs - Gbtc
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
//  01/23/2026 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Diagnostics;
using Gemstone.Security.AuthenticationProviders;
using Gemstone.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Debug;
#if RELEASE
using Microsoft.Extensions.Logging.EventLog;
#endif
using OpenSEE.Models;

namespace OpenSEE
{
    public class Program
    {
        public const string DefaultWebHostingCategory = "WebHosting";

        public static void Main(string[] args)
        {
            try
            {
                ShutdownHandler.Initialize();

                Settings settings = new()
                {
                    INIFile = ConfigurationOperation.ReadWrite,
                    SQLite = ConfigurationOperation.Disabled
                };

                DefineSettings(settings);

                // Bind settings to configuration sources
                settings.Bind(new ConfigurationBuilder()
                    .ConfigureGemstoneDefaults(settings)
                    .AddCommandLine(args, settings.SwitchMappings));

                HostApplicationBuilderSettings appSettings = new()
                {
                    Args = args,
                    ApplicationName = nameof(OpenSEE),
                    DisableDefaults = true,
                };

                CreateHostBuilder(args).Build().Run();

#if DEBUG
                Settings.Save(forceSave: true);
#else
                Settings.Save();
#endif
            }
            finally
            {
                ShutdownHandler.InitiateSafeShutdown();
            }
        }

        /// <summary>
        /// Establishes default settings for the config file.
        /// </summary>
        public static void DefineSettings(Settings settings)
        {
            using (Logger.SuppressFirstChanceExceptionLogMessages())
            {
                DiagnosticsLogger.DefineSettings(settings);
                AdoDataConnection.DefineSettings(settings);
                OAuthAuthenticationProvider.DefineSettings(settings);
                WindowsAuthenticationProvider.DefineSettings(settings);
                DefineWebHotSettings(settings);
                DefineAdditionalSystemSettings(settings);
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                })
                .ConfigureServices((hostContext, services) =>
                {
                    // load settings from config file
                    services.Configure<SystemSettings>(hostContext.Configuration.GetSection("systemSettings"));
                })
                .ConfigureLogging(builder =>
                {
                    builder.ClearProviders();
                    builder.SetMinimumLevel(LogLevel.Information);

                    builder.AddFilter("Microsoft", LogLevel.Warning);
                    builder.AddFilter("Microsoft.Hosting.Lifetime", LogLevel.Error);
                    builder.AddFilter<DebugLoggerProvider>("", LogLevel.Debug);
                    builder.AddFilter<DiagnosticsLoggerProvider>("", LogLevel.Trace);

                    builder.AddConsole(options => options.LogToStandardErrorThreshold = LogLevel.Error);
                    builder.AddDebug();

                    // Add Gemstone diagnostics logging
                    builder.AddGemstoneDiagnostics();

#if RELEASE
                    if (System.OperatingSystem.IsWindows())
                    {
                        builder.AddFilter<EventLogLoggerProvider>("Application", LogLevel.Warning);
                        builder.AddEventLog();
                    }
#endif
                });

        private static void DefineWebHotSettings(Settings settings)
        {
            dynamic section = settings[DefaultWebHostingCategory];

            section.AuthenticationTicketTimeout = (24.0D, "Expiration of the authentication ticket relative to its creation time, in hours");
            section.AuthenticationSessionTimeout = (15.0D, "Expiration of the user's session relative to the last time it was accessed, in minutes");
        }

        private static void DefineAdditionalSystemSettings(Settings settings, string settingsCatergory = Settings.SystemSettingsCategory)
        {
            dynamic section = settings[settingsCatergory];

            section.NodeID = ("00000000-0000-0000-0000-000000000000", "The applications instance identifier");

            //override the UserClaimID here with objectidentifier
        }
    }
}