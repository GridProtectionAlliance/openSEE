//******************************************************************************************************
//  FaultSpecificsController.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  02/05/2026 - Gabriel Santos
//      Refactored code to be in controller format for netcore upgrade.
//
//******************************************************************************************************

using Gemstone.Web.APIController;
using Microsoft.AspNetCore.Mvc;
using OpenSEE.Models;

namespace OpenSEE
{
    /// <summary>
    /// Controller to fetch FaultSpecifics for faults.
    /// </summary>
    [Route("api/openSEE/FaultSpecifics")]
    public class FaultSpecificsController : ReadOnlyModelController<FaultSpecifics> { }
}