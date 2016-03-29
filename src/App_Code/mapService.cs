//******************************************************************************************************
//  mapService.cs - Gbtc
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
//  05/02/2014 - Jeff Walker
//       Generated original version of source code.
//  03/29/2016 - Stephen C. Wills
//       Major code cleanup.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Web.Services;

/// <summary>
/// Summary description for MapService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class mapService : System.Web.Services.WebService
{
    private string connectionstring = ConfigurationManager.ConnectionStrings["EPRIConnectionString"].ConnectionString;

    public class MeterID
    {
        public string name;
        public int id;
    }
    
    [WebMethod]
    public List<MeterID> getMeters(string userName)
    {
        SqlConnection conn = null;
        SqlDataReader rdr = null;
        List<MeterID> meterIDs = new List<MeterID>();

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.selectMeters", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@username", userName));
            cmd.CommandTimeout = 300;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                MeterID metersId = new MeterID();
                metersId.name = (string)rdr["name"];
                metersId.id = (int)rdr["id"];
                meterIDs.Add(metersId);
            }
        }
        finally
        {
            if (conn != null)
                conn.Close();

            if (rdr != null)
                rdr.Close();
        }
        return (meterIDs);
    }
}