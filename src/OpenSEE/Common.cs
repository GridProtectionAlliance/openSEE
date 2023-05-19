//******************************************************************************************************
//  Common.cs - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  02/26/2023 - J. Ritchie Carroll
//       Generated original version of source code.
//
//******************************************************************************************************

using System.IO;
using GSF;
using GSF.Configuration;
using GSF.IO;
using GSF.Reflection;
using GSF.Web.Security;

namespace OpenSEE;

public static class Common
{
    private static string s_applicationName;
    private static string s_anonymousResourceExpression;

    public static string ApplicationName => s_applicationName ??= GetApplicationName();

    public static string AnonymousResourceExpression => s_anonymousResourceExpression ??= GetAnonymousResourceExpression();

    public static bool LogEnabled => GetLogEnabled();

    public static string LogPath => GetLogPath();

    public static int MaxLogFiles => GetMaxLogFiles();

    private static string GetApplicationName() =>
        // Try database configured application name (if loaded yet)
        MvcApplication.DefaultModel.Global.ApplicationName ??
        // Fall back on setting defined in web.config
        GetSettingValue("SecurityProvider", "ApplicationName", "GSF Authentication");

    private static string GetAnonymousResourceExpression() =>
        GetSettingValue("SystemSettings", "AnonymousResourceExpression", AuthenticationOptions.DefaultAnonymousResourceExpression);

    private static bool GetLogEnabled() =>
        GetSettingValue("SystemSettings", "LogEnabled", AssemblyInfo.ExecutingAssembly.Debuggable.ToString()).ParseBoolean();

    private static string GetLogPath() =>
        GetSettingValue("SystemSettings", "LogPath", string.Format("{0}{1}Logs{1}", FilePath.GetAbsolutePath(""), Path.DirectorySeparatorChar));

    private static int GetMaxLogFiles() =>
        int.TryParse(GetSettingValue("SystemSettings", "MaxLogFiles", "300"), out int maxLogFiles) ? maxLogFiles : 300;

    private static string GetSettingValue(string section, string keyName, string defaultValue)
    {
        try
        {
            ConfigurationFile config = ConfigurationFile.Current;
            CategorizedSettingsElementCollection settings = config.Settings[section];
            return settings[keyName, true].ValueAs(defaultValue);
        }
        catch
        {
            return defaultValue;
        }
    }
}