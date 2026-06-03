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

using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using openXDA.Model;

namespace OpenSEE.Controllers
{
    /// <summary>
    /// Represents a MVC controller for the site's main pages.
    /// </summary>
    [Authorize(Startup.Policies.Authenticated)]
    public class HomeController : Controller
    {
        // This provides some default values for if nothing is supplied in the query string
        public IActionResult Index()
        {
            int eventID = -1;
            Event evt;

            using AdoDataConnection connection = new(Settings.Default);
            TableOperations<Event> eventTable = new(connection);

            eventID = eventTable.QueryRecord("ID > 0").ID;
            evt = eventTable.QueryRecordWhere("ID = {0}", eventID);

            ViewBag.DefaultEventID = eventID;
            ViewBag.DefaultEventStartTime = evt.StartTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");
            ViewBag.DefaultEventEndTime = evt.EndTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");

            return View("Index");
        }
    }
}