//******************************************************************************************************
//  Startup.cs - Gbtc
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
using System.IO;
using System.Reflection;
using System.Web.Http;
using Gemstone.Diagnostics;
using Gemstone.IO;
using Gemstone.Web.Security;
using Gemstone.Web.Shared;
using Microsoft.Owin;
using Owin;
using static OpenSEE.Common;

[assembly: OwinStartup(typeof(OpenSEE.Startup))]
namespace OpenSEE;

public class Startup
{
    public void Configuration(IAppBuilder app)
    {
        // Enable GSF role-based security authentication
        app.UseAuthentication(s_authenticationOptions);

        OwinLoaded = true;

        // Configure Web API for self-host
        HttpConfiguration config = new HttpConfiguration();

        // Enable GSF session management
        config.EnableSessions(s_authenticationOptions);

        // Set configuration to use reflection to setup routes
        config.MapHttpAttributeRoutes();

        app.UseWebApi(config);
    }

    private static readonly AuthenticationOptions s_authenticationOptions;

    static Startup()
    {
        SetupTempPath();

        s_authenticationOptions = new AuthenticationOptions
        {
            LoginPage = "~/Login",
            LogoutPage = "~/Security/logout",
            LoginHeader = $"<h3><img src=\"{Resources.Root}/Shared/Images/gpa-smalllock.png\"/> {ApplicationName}</h3>",
            AuthTestPage = "~/AuthTest",
            AnonymousResourceExpression = AnonymousResourceExpression,
            AuthFailureRedirectResourceExpression = @"^/$|^/.+$"
        };

        AuthenticationOptions = CreateInstance<ReadonlyAuthenticationOptions>(s_authenticationOptions);

        if (!LogEnabled)
            return;

        // Retrieve application log path as defined in the config file
        string logPath = LogPath;

        // Make sure log directory exists
        try
        {
            if (!Directory.Exists(logPath))
                Directory.CreateDirectory(logPath);
        }
        catch
        {
            logPath = FilePath.GetAbsolutePath("");
        }

        try
        {
            Logger.FileWriter.SetPath(logPath);
            Logger.FileWriter.SetLoggingFileCount(MaxLogFiles);
        }
        catch
        {
            // ignored
        }
    }

    public static bool OwinLoaded { get; private set; }

    public static ReadonlyAuthenticationOptions AuthenticationOptions { get; }

    private static T CreateInstance<T>(params object[] args)
    {
        Type type = typeof(T);
        object instance = type.Assembly.CreateInstance(type.FullName!, false, BindingFlags.Instance | BindingFlags.NonPublic, null, args, null, null);
        return (T)instance;
    }

    private static void SetupTempPath()
    {
        const string DynamicAssembliesFolderName = "DynamicAssemblies";
        string assemblyDirectory = null;

        try
        {
            // Setup custom temp folder so that dynamically compiled razor assemblies can be more easily managed
            assemblyDirectory = FilePath.GetAbsolutePath(DynamicAssembliesFolderName);

            if (!Directory.Exists(assemblyDirectory))
                Directory.CreateDirectory(assemblyDirectory);

            Environment.SetEnvironmentVariable("TEMP", assemblyDirectory);
            Environment.SetEnvironmentVariable("TMP", assemblyDirectory);
        }
        catch (Exception ex)
        {
            // This is not catastrophic
            Logger.SwallowException(ex, $"Failed to assign temp folder location to: {assemblyDirectory}");
        }
    }
}