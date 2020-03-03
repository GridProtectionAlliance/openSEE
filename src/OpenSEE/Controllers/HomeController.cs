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

using GSF.Data;
using GSF.Identity;
using GSF.Web.Model;
using GSF.Web.Security;
using OpenSEE.Model;
using openXDA.Model;
using System;
using System.Web.Mvc;

namespace OpenSEE.Controllers
{
    /// <summary>
    /// Represents a MVC controller for the site's main pages.
    /// </summary>
    public class HomeController : Controller
    {

        public HomeController() {
            ViewData.Model = new AppModel();
        }
        #region [ Methods ]
        public ActionResult Home()
        {
            int eventID = 1;
            using (DataContext dataContext = new DataContext("systemSettings"))
            {
                ViewBag.EnableLightningQuery = dataContext.Connection.ExecuteScalar<bool?>("SELECT Value FROM Settings WHERE Name = 'EnableLightningQuery'") ?? false;

                ViewBag.IsAdmin = ValidateAdminRequest();

                
                if (Request.QueryString.Get("eventid") != null)
                    eventID = int.Parse(Request.QueryString["eventid"]);
            }

            using (DataContext dataContext = new DataContext("dbOpenXDA"))
            { 
                Event evt = dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventID);
                ViewBag.EventID = eventID;
                ViewBag.EventStartTime = evt.StartTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");
                ViewBag.EventEndTime = evt.EndTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");
                ViewBag.SamplesPerCycle = evt.SamplesPerCycle;
                ViewBag.Cycles = Math.Floor((evt.EndTime - evt.StartTime).TotalSeconds * 60.0D);
                return View("Index");
            }

            
        }

        private bool ValidateAdminRequest()
        {
            string username = User.Identity.Name;
            string userid = UserInfo.UserNameToSID(username);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                bool isAdmin = connection.ExecuteScalar<int>(@"
					select 
						COUNT(*) 
					from 
						UserAccount JOIN 
						ApplicationRoleUserAccount ON ApplicationRoleUserAccount.UserAccountID = UserAccount.ID JOIN
						ApplicationRole ON ApplicationRoleUserAccount.ApplicationRoleID = ApplicationRole.ID
					WHERE 
						ApplicationRole.Name = 'Administrator' AND UserAccount.Name = {0}
                ", userid) > 0;

                if (isAdmin) return true;
                else return false;
            }

            
        }
        #endregion
    }
}