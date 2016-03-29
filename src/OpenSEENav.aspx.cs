//******************************************************************************************************
//  OpenSEENav.aspx.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  12/18/2014 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Text.RegularExpressions;
using System.Web;

public partial class OpenSEENav : System.Web.UI.Page
{
    public string postedEventId = "";
    public string postedMeterId = "";
    public string postedDateFrom = "";
    public string postedDateTo = "";
    public string postedEventType = "";
    public string postedEventDate = "";
    public string username = "";

    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            username = System.Security.Principal.WindowsIdentity.GetCurrent().Name;

            username = HttpContext.Current.User.Identity.Name;

            username = Request.ServerVariables.Get("AUTH_USER");

            if (username == "")
            {
                username = "External";
            }

            username = Regex.Replace(username,".*\\\\(.*)", "$1",RegexOptions.None);
        }
        catch (Exception ex)
        {
            username = "";
        }
    }


}