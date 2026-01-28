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

using System;
using System.IO;
using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Diagnostics;
using Gemstone.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Debug;
using OpenSEE.Models;

namespace OpenSEE
{
    public class Program
    {
        public static IConfiguration Configuration { get; } = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
        .Build();

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
                    if (OperatingSystem.IsWindows())
                    {
                        builder.AddFilter<EventLogLoggerProvider>("Application", LogLevel.Warning);
                        builder.AddEventLog();
                    }
                    #endif
                });
    }
}
