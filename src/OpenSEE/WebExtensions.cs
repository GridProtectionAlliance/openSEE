//******************************************************************************************************
//  WebExtensions.cs - Gbtc
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



using Gemstone.Data.Model;
using Gemstone.Web.Model;
using System.Collections.Generic;

namespace OpenSEE
{

    [TableName("OpenSEE.Setting")]
    [UseEscapedName]
    public class OpenSEESetting : openXDA.Model.Setting { };

    public static class WebExtensions
    {
        public static Dictionary<string, string> LoadDatabaseSettings(this DataContext dataContext, string scope)
        {
            Dictionary<string, string> settings = new Dictionary<string, string>();

            foreach (OpenSEESetting setting in dataContext.Table<OpenSEESetting>().QueryRecords("Name"))
            {
                if (!string.IsNullOrEmpty(setting.Name))
                    settings.Add(setting.Name, setting.Value);
            }

            return settings;
        }
    }
}