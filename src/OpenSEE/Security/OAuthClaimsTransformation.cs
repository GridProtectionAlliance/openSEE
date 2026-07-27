//******************************************************************************************************
//  OAuthClaimsTransformation.cs - Gbtc
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

using Azure.Core;
using Azure.Identity;
using Gemstone.Configuration;
using Gemstone.Security.AuthenticationProviders;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
namespace OpenSEE.Security;

public class OAuthClaimsTransformation : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        string? providerIdentity = principal
            .FindFirst("Gemstone.ProviderIdentity")?
            .Value;

        if (providerIdentity != OAuthAuthenticationProviderExtensions.DefaultIdentity)
            return Task.FromResult(principal);

        if (principal.Identity is not ClaimsIdentity identity)
            return Task.FromResult(principal);

        //Add a claim with the user's email address in lowercase to facilitate case-insensitive matching against UserAccount.Name in the database for role mapping.
        string? preferredUsernameClaimValue = principal.FindFirst("preferred_username")?.Value;

        if (!string.IsNullOrWhiteSpace(preferredUsernameClaimValue))
        {
            string lowercaseEmail = preferredUsernameClaimValue.Trim().ToLowerInvariant();

            if (!identity.HasClaim(AuthenticationSetup.LowercaseEmailClaim, lowercaseEmail))
                identity.AddClaim(new(AuthenticationSetup.LowercaseEmailClaim, lowercaseEmail));
        }

        //Add claims for Azure AD group memberships. The provider doesn't include these by default, but we need them to support role mapping based on group membership in the database.
        string[] groupNames = GetAzureGroupNames(principal);

        foreach (string groupName in groupNames)
        {
            if (!identity.HasClaim(AuthenticationSetup.AzureGroupClaim, groupName))
                identity.AddClaim(new(AuthenticationSetup.AzureGroupClaim, groupName));
        }

        return Task.FromResult(principal);
    }

    /// <summary>
    /// Queries Microsoft Graph for the groups that the user is a member of, and extracts the display names of those groups to use for role mapping.
    /// This is necessary because the provider doesn't include group membership claims by default,
    /// but we need them to support role mapping based on group membership in the database.
    /// </summary>
    /// <param name="claimsPrincipal"></param>
    /// <returns></returns>
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

}