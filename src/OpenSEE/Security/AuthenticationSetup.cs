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
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;
using Azure.Core;
using Azure.Identity;
using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.DataExtensions;
using Gemstone.Security.AccessControl;
using Gemstone.Security.AuthenticationProviders;
using Microsoft.Graph;

namespace OpenSEE.Security;

/// <summary>
/// Provides setup logic for Gemstone authentication by mapping the existing GSF security
/// groups/roles (in the openXDA database) into <see cref="ClaimTypes.Role"/> claims.
/// </summary>
public class AuthenticationSetup : IAuthenticationSetup
{
    #region [ Members ]
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

    private static string NodeID => Settings.Default[Settings.SystemSettingsCategory].NodeID;

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
        WHERE ApplicationRole.NodeID = {0} AND UserAccount.LockedOut = 0 AND UserAccount.Approved <> 0 AND UserAccount.UseADAuthentication = {1}
        UNION
        SELECT UserAccount.Name AS Identifier, ApplicationRole.Name AS RoleName
        FROM
            ApplicationRole JOIN
            ApplicationRoleSecurityGroup ON ApplicationRoleSecurityGroup.ApplicationRoleID = ApplicationRole.ID JOIN
            SecurityGroupUserAccount ON SecurityGroupUserAccount.SecurityGroupID = ApplicationRoleSecurityGroup.SecurityGroupID JOIN
            UserAccount ON UserAccount.ID = SecurityGroupUserAccount.UserAccountID
        WHERE ApplicationRole.NodeID = {0} AND UserAccount.LockedOut = 0 AND UserAccount.Approved <> 0 AND UserAccount.UseADAuthentication = {1}
        """;

    private const string ResourceAccessAllowClaim = "Gemstone.ResourceAccess.Default";
    private const string LowercaseEmailClaim = "lowercase_email";
    private const string AzureGroupClaim = "azure_group";

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

    #endregion

    #region [ Methods ]

    /// <inheritdoc />
    public IEnumerable<string> GetProviderIdentities()
    {
        // Windows integrated authentication is always available.
        yield return WindowsAuthenticationProviderExtensions.DefaultIdentity;

        if (OAuthEnabled)
            yield return OAuthAuthenticationProviderExtensions.DefaultIdentity;
    }

    /// <inheritdoc />
    public IEnumerable<(Claim Match, Claim Assigned)> GetProviderClaims(string providerIdentity)
    {
        if (providerIdentity == WindowsAuthenticationProviderExtensions.DefaultIdentity)
        {
            // AD security group -> application role. The Windows provider exposes group membership
            // as ClaimTypes.GroupSid claims; SecurityGroup.Name holds the AD group SID.
            foreach ((Claim Match, Claim Assigned) claimPair in AssignClaims(QueryRoleMappings(GroupRoleQuery, NodeID), ClaimTypes.GroupSid))
                yield return claimPair;

            // Direct user assignments and database-defined group membership -> application role.
            // UserAccount.Name holds the AD user SID for Windows accounts.
            foreach ((Claim Match, Claim Assigned) claimPair in AssignClaims(QueryRoleMappings(UserRoleQuery, NodeID, 1), ClaimTypes.PrimarySid, IsValidSid))
                yield return claimPair;
        }
        else if (providerIdentity == OAuthAuthenticationProviderExtensions.DefaultIdentity)
        {
            IEnumerable<(string Identifier, string RoleName)> userRoleMappings = QueryRoleMappings(UserRoleQuery, NodeID, 0)
                .Select(mapping => (mapping.Identifier.Trim().ToLowerInvariant(), mapping.RoleName));

            foreach ((Claim Match, Claim Assigned) claimPair in AssignClaims(userRoleMappings, LowercaseEmailClaim, IsValidEmailAddress))
                yield return claimPair;

            foreach ((Claim Match, Claim Assigned) claimPair in AssignClaims(QueryRoleMappings(GroupRoleQuery, NodeID), AzureGroupClaim))
                yield return claimPair;
        }
    }

    /// <inheritdoc />
    public void ExtendClaimPrincipal(ClaimsPrincipal claimsPrincipal, string providerIdentity)
    {
        if (providerIdentity != OAuthAuthenticationProviderExtensions.DefaultIdentity)
            return;

        if (claimsPrincipal.Identity is not ClaimsIdentity identity)
            return;

        //Add a claim with the user's email address in lowercase to facilitate case-insensitive matching against UserAccount.Name in the database for role mapping.
        string? preferredUsernameClaimValue = claimsPrincipal.FindFirst("preferred_username")?.Value;

        if (!string.IsNullOrWhiteSpace(preferredUsernameClaimValue))
        {
            string lowercaseEmail = preferredUsernameClaimValue.Trim().ToLowerInvariant();

            if (!identity.HasClaim(LowercaseEmailClaim, lowercaseEmail))
                identity.AddClaim(new(LowercaseEmailClaim, lowercaseEmail));
        }

        //Add claims for Azure AD group memberships. The provider doesn't include these by default, but we need them to support role mapping based on group membership in the database.
        string[] groupNames = GetAzureGroupNames(claimsPrincipal);

        foreach (string groupName in groupNames)
        {
            if (!identity.HasClaim(AzureGroupClaim, groupName))
                identity.AddClaim(new(AzureGroupClaim, groupName));
        }
    }

    /// <summary>
    /// Executes the specified query to retrieve application role mappings, yielding tuples of
    /// identifier and role name.
    /// </summary>
    /// <param name="query">The SQL query to execute</param>
    /// <param name="parameters">The parameter values to substitute into the query</param>
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

    /// <summary>
    /// Generates claims to be assigned to the user based on the provided role mappings and claim type.
    /// </summary>
    /// <param name="roleMappings">The role mappings to process.</param>
    /// <param name="claimType">The type of claim to generate.</param>
    /// <param name="validateIdentifier">An optional function to validate the identifier.</param>
    /// <returns>An enumerable of tuples containing the matching and assigned claims.</returns>
    private static IEnumerable<(Claim Match, Claim Assigned)> AssignClaims(
        IEnumerable<(string Identifier, string RoleName)> roleMappings,
        string claimType,
        Func<string, bool>? validateIdentifier = null)
    {
        foreach ((string identifier, string roleName) in roleMappings)
        {
            if (!GSFOpenSEERoles.Contains(roleName))
                continue;

            if (validateIdentifier is not null && !validateIdentifier(identifier))
                continue;

            Claim matchingClaim = new(claimType, identifier);

            foreach (Claim assignedClaim in AssignedClaims)
                yield return (matchingClaim, assignedClaim);
        }
    }

    /// <summary>
    /// Determines if the provided identifier is a valid SID by attempting to create a SecurityIdentifier object with it.
    /// </summary>
    /// <param name="identifier">The identifier to validate.</param>
    private static bool IsValidSid(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier))
            return false;

        try
        {
            _ = new SecurityIdentifier(identifier);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Determines if the provided identifier is a valid email address by attempting to parse it using the MailAddress class.
    /// </summary>
    /// <param name="emailAddress">The email address to validate.</param>
    private static bool IsValidEmailAddress(string emailAddress)
    {
        return MailAddress.TryCreate(emailAddress, out MailAddress? address) &&
            string.Equals(address.Address, emailAddress, StringComparison.OrdinalIgnoreCase);
    }

    private static string[] GetAzureGroupNames(ClaimsPrincipal claimsPrincipal)
    {
        //find the user's object identifier
        string userObjectIdentifier = claimsPrincipal.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value ??
            claimsPrincipal.FindFirst("oid")?.Value ?? string.Empty;

        //find the tenant identifier for the user's directory
        string tenantID = claimsPrincipal.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value ??
            claimsPrincipal.FindFirst("tid")?.Value ?? string.Empty;

        if (string.IsNullOrWhiteSpace(userObjectIdentifier) || string.IsNullOrWhiteSpace(tenantID))
            return [];

        GraphServiceClient? graphClient = GetGraphClient(tenantID);

        if (graphClient is null)
            return [];

        return [.. QueryAzureGroupNames(graphClient, userObjectIdentifier).Distinct(StringComparer.OrdinalIgnoreCase)];
    }

    /// <summary>
    /// Creates and returns a Microsoft Graph client authenticated with an application identity using the client credential settings.
    /// </summary>
    /// <param name="tenantID">The tenant ID for the Azure AD directory.</param>
    /// <returns>The GraphServiceClient instance, or null if authentication fails.</returns>
    private static GraphServiceClient? GetGraphClient(string tenantID)
    {
        try
        {
            dynamic section = Settings.Default[OAuthAuthenticationProvider.SettingsSection];
            string clientID = Convert.ToString(section.ClientId) ?? string.Empty;
            string clientSecret = Convert.ToString(section.ClientSecret) ?? string.Empty;

            if (string.IsNullOrWhiteSpace(clientID) || string.IsNullOrWhiteSpace(clientSecret))
                return null;

            //Create a client credential to authenticate to Microsoft Graph using the client ID and secret from configuration.
            ClientSecretCredential credential = new(tenantID, clientID, clientSecret);

            //Get an access token for Microsoft Graph with the default scope, which will be used to authenticate Graph API requests.
            string token = credential.GetToken(new TokenRequestContext(["https://graph.microsoft.com/.default"])).Token;

            return new(new DelegateAuthenticationProvider(request =>
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                return Task.CompletedTask;
            }));
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Queries Microsoft Graph for the groups that the user is a member of, and extracts the display names of those groups to use for role mapping.
    /// </summary>
    /// <param name="graphClient">The Microsoft Graph client.</param>
    /// <param name="userObjectIdentifier">The user object identifier for which to query group membership.</param>
    /// <returns>A list of group names.</returns>
    private static List<string> QueryAzureGroupNames(GraphServiceClient graphClient, string userObjectIdentifier)
    {
        List<string> groupNames = [];

        try
        {
            // Query Microsoft Graph for the groups that the user is a member of, and extract the display names of those groups to use for role mapping.
            IUserMemberOfCollectionWithReferencesPage memberOf = graphClient.Users[userObjectIdentifier].MemberOf.Request().GetAsync().GetAwaiter().GetResult();

            while (memberOf is not null)
            {
                foreach (DirectoryObject directoryObject in memberOf.CurrentPage)
                {
                    if (directoryObject is Group group && !string.IsNullOrWhiteSpace(group.DisplayName))
                        groupNames.Add(group.DisplayName);
                }

                // Get the next page of results, if there are more groups than can be returned in a single response.
                memberOf = memberOf.NextPageRequest?.GetAsync().GetAwaiter().GetResult();
            }
        }
        catch { }

        return groupNames;
    }

    #endregion
}
