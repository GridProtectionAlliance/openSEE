//******************************************************************************************************
//  SkipAuthenticationMiddleware.cs - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  07/29/2026 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Security.AccessControl;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OpenSEE.Security;

public class SkipAuthenticationMiddleware
{
    private readonly RequestDelegate m_next;

    public SkipAuthenticationMiddleware(RequestDelegate next)
    {
        m_next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        ClaimsIdentity identity = new("SkipAuthentication");
        identity.AddClaim(new(ClaimTypes.Name, "SkipAuthenticationUser"));
        identity.AddClaim(new("Gemstone.ProviderIdentity", "SkipAuthentication"));
        identity.AddClaim(new("Gemstone.ResourceAccess.Default", ResourceAccessType.Create.ToString()));
        identity.AddClaim(new("Gemstone.ResourceAccess.Default", ResourceAccessType.Read.ToString()));
        identity.AddClaim(new("Gemstone.ResourceAccess.Default", ResourceAccessType.Update.ToString()));
        identity.AddClaim(new("Gemstone.ResourceAccess.Default", ResourceAccessType.Delete.ToString()));
        context.User = new(identity);
        await context.SignInAsync(context.User);
        await m_next(context);
    }
}