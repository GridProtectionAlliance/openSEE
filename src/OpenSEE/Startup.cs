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

using System;
using System.IO;
using Gemstone.Diagnostics;
using Gemstone.IO;
using Gemstone.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json.Serialization;
using OpenSEE.Security;
namespace OpenSEE;

public class Startup
{
    public Startup(IConfiguration configuration, IWebHostEnvironment env)
    {
        SetupTempPath();
        Configuration = configuration;
        Env = env;
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

        // Todo: Temp Auth
        services.AddAuthentication(TestAuthHandler.AuthenticationScheme)
            .AddScheme<TestAuthHandlerOptions, TestAuthHandler>(TestAuthHandler.AuthenticationScheme, (options) => { });


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

        app.UseStaticFiles(WebExtensions.StaticFileEmbeddedResources());
        app.UseStaticFiles();

        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
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