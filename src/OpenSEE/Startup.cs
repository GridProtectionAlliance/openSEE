//******************************************************************************************************
//  Startup.cs - Gbtc
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
using Gemstone.Diagnostics;
using Gemstone.IO;
using Gemstone.Security.AuthenticationProviders;
using Gemstone.Web;
using Gemstone.Web.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json.Serialization;
using OpenSEE.Security;
using System;
using System.IO;
namespace OpenSEE;

public class Startup
{
    public Startup(IConfiguration configuration, IWebHostEnvironment env)
    {
        SetupTempPath();
        Configuration = configuration;
        Env = env;
    }

    public static class Policies
    {
        public const string Authenticated = nameof(Authenticated);
        public const string ControllerAccess = nameof(ControllerAccess);
    }

    public IWebHostEnvironment Env { get; set; }
    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        IMvcBuilder builder = services
            .AddControllersWithViews()
            .AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                options.SerializerSettings.ContractResolver = new DefaultContractResolver();
            });

        //probably should wire this up in openSEE in OHEE via global ajax handler
        services.AddAntiforgery(options => options.HeaderName = "X-GEMSTONE-VERIFY");

        services.AddTransient<WindowsAuthenticationProviderOptions>(_ => new()
        {
            LDAPPath = Settings.Default[WindowsAuthenticationProvider.SettingsSection].LDAPPath,
            AllowLocalAccounts = (bool?)(Settings.Default[WindowsAuthenticationProvider.SettingsSection].AllowLocalAccounts) ?? false
        });

        AuthenticationBuilder authenticationBuilder = services.ConfigureGemstoneWebAuthentication<AuthenticationSetup>();

        dynamic oauthSection = Settings.Instance[OAuthAuthenticationProvider.SettingsSection];

        if (oauthSection.Enabled)
        {
            OAuthAuthenticationProviderOptions oauthOptions = new()
            {
                UserIdClaim = oauthSection.UserIdClaim,
                Authority = oauthSection.Authority,
                ClientId = oauthSection.ClientId,
                ClientSecret = oauthSection.ClientSecret,
                Scopes = oauthSection.Scopes
            };

            authenticationBuilder.ConfigureOAuthProvider(oauthOptions);
        }

        services
            .AddOptions<CookieAuthenticationOptions>(CookieAuthenticationDefaults.AuthenticationScheme)
            .Configure(options =>
             {
                 double ticketTimeout = Settings.Default.WebHosting.AuthenticationTicketTimeout;
                 options.ExpireTimeSpan = TimeSpan.FromHours(24);
             });

        services
            .AddOptions<SessionCacheOptions>()
            .Configure(options =>
            {
                double sessionTimeout = Settings.Default.WebHosting.AuthenticationSessionTimeout;
                options.SlidingExpiration = TimeSpan.FromMinutes(15);
            });

        services.AddAuthorization(options =>
        {
            AuthorizationPolicy controllerAccessPolicy = new AuthorizationPolicyBuilder()
                .RequireControllerAccess()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy(Policies.Authenticated, policy => policy.RequireAuthenticatedUser());
            options.AddPolicy(Policies.ControllerAccess, controllerAccessPolicy);
            options.DefaultPolicy = controllerAccessPolicy;
            options.FallbackPolicy = controllerAccessPolicy;
        });

        services.AddSingleton<IAuthorizationHandler, ControllerAccessHandler>();

        services.AddMvc();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler("/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseForwardedHeaders(new ForwardedHeadersOptions()
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
        });

        app.UseGemstoneAuthentication();

        app.UseStaticFiles(WebExtensions.StaticFileEmbeddedResources());
        app.UseStaticFiles();

        app.UseRouting();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapRazorPages();

            endpoints.MapControllerRoute(
            name: "default",
            pattern: "{controller}/{newaction?}/{id?}",
            defaults: new
            {
                controller = "Home",
                action = "Index"
            });

            endpoints.MapControllers();
        });
    }

    private static void SetupTempPath()
    {
        const string DynamicAssembliesFolderName = "DynamicAssemblies";
        string assemblyDirectory = null;

        try
        {
            // Setup custom temp folder so that dynamically compiled razor assemblies can be more easily managed
            assemblyDirectory = FilePath.GetAbsolutePath(DynamicAssembliesFolderName);

            if (!Directory.Exists(assemblyDirectory))
                Directory.CreateDirectory(assemblyDirectory);

            Environment.SetEnvironmentVariable("TEMP", assemblyDirectory);
            Environment.SetEnvironmentVariable("TMP", assemblyDirectory);
        }
        catch (Exception ex)
        {
            // This is not catastrophic
            Logger.SwallowException(ex, $"Failed to assign temp folder location to: {assemblyDirectory}");
        }
    }
}