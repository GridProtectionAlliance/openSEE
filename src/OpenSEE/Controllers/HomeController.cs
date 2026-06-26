//******************************************************************************************************
//  HomeController.cs - Gbtc
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
using System.Data;
using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.DataExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OpenSEE.Controllers;

/// <summary>
/// Represents a MVC controller for the site's main pages.
/// </summary>
[Authorize(Startup.Policies.Authenticated)]
public class HomeController : Controller
{
    // Provide default values in the case that nothing is supplied in the query string
    public IActionResult Index()
    {
        using AdoDataConnection connection = new(Settings.Default);
        DataRow evt = connection.RetrieveRow("SELECT TOP 1 * FROM Event");

        DataRow systemFrequencyRow = connection.RetrieveRow("Select * FROM Setting Where Name = 'DataAnalysis.SystemFrequency'");

        ViewBag.DefaultEventID = evt.ConvertField<int>("ID");
        ViewBag.DefaultEventStartTime = evt.ConvertField<DateTime>("StartTime").ToString("yyyy-MM-ddTHH:mm:ss.fffffff");
        ViewBag.DefaultEventEndTime = evt.ConvertField<DateTime>("EndTime").ToString("yyyy-MM-ddTHH:mm:ss.fffffff");

        ViewBag.SystemFrequency = systemFrequencyRow.ConvertField<double>("Value");

        return View("Index");
    }
}