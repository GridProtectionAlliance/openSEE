//******************************************************************************************************
//  OpenSEEAuthenticationSetup.cs - Gbtc
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
//  06/02/2026 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.DataExtensions;
using Gemstone.Security.AccessControl;
using Gemstone.Security.AuthenticationProviders;
using Microsoft.Extensions.Configuration;

namespace OpenSEE.Security;

/// <summary>
/// Provides setup logic for Gemstone authentication by mapping the existing GSF security
/// groups/roles (in the openXDA database) into <see cref="ClaimTypes.Role"/> claims.
/// </summary>
/// <remarks>
public class AuthenticationSetup() : IAuthenticationSetup
{
    public static bool OAuthEnabled
    {
        get
        {
            try
            {
                dynamic section = Settings.Default[OAuthAuthenticationProvider.SettingsSection];
                return section.Enabled;
            }
            catch
            {
                return false;
            }
        }
    }

    private static Guid NodeID => Guid.TryParse(Settings.Default[Settings.SystemSettingsCategory].NodeID, out Guid nodeID) ? nodeID : Guid.Empty;

    private const string GroupRoleQuery =
        """
        SELECT SecurityGroup.Name AS Identifier, ApplicationRole.Name AS RoleName
        FROM
            ApplicationRole JOIN
            ApplicationRoleSecurityGroup ON ApplicationRoleSecurityGroup.ApplicationRoleID = ApplicationRole.ID JOIN
            SecurityGroup ON SecurityGroup.ID = ApplicationRoleSecurityGroup.SecurityGroupID
        WHERE ApplicationRole.NodeID = {0}
        """;

    private const string UserRoleQuery =
        """
        SELECT UserAccount.Name AS Identifier, ApplicationRole.Name AS RoleName
        FROM
            ApplicationRole JOIN
            ApplicationRoleUserAccount ON ApplicationRoleUserAccount.ApplicationRoleID = ApplicationRole.ID JOIN
            UserAccount ON UserAccount.ID = ApplicationRoleUserAccount.UserAccountID
        WHERE ApplicationRole.NodeID = {0} AND UserAccount.LockedOut = 0 AND UserAccount.Approved <> 0 AND UserAccount.UseADAuthentication <> 0
        UNION
        SELECT UserAccount.Name AS Identifier, ApplicationRole.Name AS RoleName
        FROM
            ApplicationRole JOIN
            ApplicationRoleSecurityGroup ON ApplicationRoleSecurityGroup.ApplicationRoleID = ApplicationRole.ID JOIN
            SecurityGroupUserAccount ON SecurityGroupUserAccount.SecurityGroupID = ApplicationRoleSecurityGroup.SecurityGroupID JOIN
            UserAccount ON UserAccount.ID = SecurityGroupUserAccount.UserAccountID
        WHERE ApplicationRole.NodeID = {1} AND UserAccount.LockedOut = 0 AND UserAccount.Approved <> 0 AND UserAccount.UseADAuthentication <> 0
        """;

    private const string ResourceAccessAllowClaim = "Gemstone.ResourceAccess.Default";

    private static readonly string[] GSFOpenSEERoles =
    [
        "Administrator",
        "Engineer",
        "Viewer"
    ];

    private static readonly Claim[] AssignedClaims =
    [
        new(ResourceAccessAllowClaim, ResourceAccessType.Create.ToString()),
        new(ResourceAccessAllowClaim, ResourceAccessType.Read.ToString()),
        new(ResourceAccessAllowClaim, ResourceAccessType.Update.ToString()),
        new(ResourceAccessAllowClaim, ResourceAccessType.Delete.ToString())
    ];

    public IEnumerable<string> GetProviderIdentities()
    {
        // Windows integrated authentication is always available.
        yield return WindowsAuthenticationProviderExtensions.DefaultIdentity;

        if (OAuthEnabled)
            yield return OAuthAuthenticationProviderExtensions.DefaultIdentity;
    }

    public IEnumerable<(Claim Match, Claim Assigned)> GetProviderClaims(string providerIdentity)
    {
        if (providerIdentity == WindowsAuthenticationProviderExtensions.DefaultIdentity)
        {
            // AD security group -> application role. The Windows provider exposes group membership
            // as ClaimTypes.GroupSid claims; SecurityGroup.Name holds the AD group SID.
            foreach ((string identifier, string roleName) in QueryRoleMappings(GroupRoleQuery, NodeID))
            {
                if (!GSFOpenSEERoles.Contains(roleName))
                    continue;

                //Add filter here to ensure its a valid SID if not continue
                Claim matchingClaim = new(ClaimTypes.GroupSid, identifier);

                foreach (Claim assignedClaim in AssignedClaims)
                    yield return (matchingClaim, assignedClaim);
            }

            // Direct user assignments and database-defined group membership -> application role.
            // UserAccount.Name holds the AD user SID for Windows accounts.
            foreach ((string identifier, string roleName) in QueryRoleMappings(UserRoleQuery, NodeID, NodeID))
            {
                if (!GSFOpenSEERoles.Contains(roleName))
                    continue;

                //Add filter here to ensure its a valid SID if not continue
                Claim matchingClaim = new(ClaimTypes.PrimarySid, identifier);

                foreach (Claim assignedClaim in AssignedClaims)
                    yield return (matchingClaim, assignedClaim);
            }
        }
        else if (providerIdentity == OAuthAuthenticationProviderExtensions.DefaultIdentity)
        {
            //Not sure the matchingClaim key is correct here, need to verify with Azure
            foreach ((string identifier, string roleName) in QueryRoleMappings(UserRoleQuery, NodeID, NodeID))
            {
                if (!GSFOpenSEERoles.Contains(roleName))
                    continue;

                Claim matchingClaim = new(ClaimTypes.Name, identifier);

                foreach (Claim assignedClaim in AssignedClaims)
                    yield return (matchingClaim, assignedClaim);
            }
        }
    }

    /// <summary>
    /// Executes the specified query to retrieve application role mappings, yielding tuples of
    /// identifier and role name.
    /// </summary>
    /// <param name="query">The SQL query to execute</param>
    /// <returns>Enumerable of tuples containing identifier and role name</returns>
    private static IEnumerable<(string Identifier, string RoleName)> QueryRoleMappings(string query, params object[] parameters)
    {
        using AdoDataConnection connection = new(Settings.Default);
        using DataTable table = connection.RetrieveData(query, parameters);

        foreach (DataRow row in table.AsEnumerable())
        {
            string identifier = row.ConvertField<string>("Identifier");
            string roleName = row.ConvertField<string>("RoleName");

            if (!string.IsNullOrEmpty(identifier) && !string.IsNullOrEmpty(roleName))
                yield return (identifier, roleName);
        }
    }
}