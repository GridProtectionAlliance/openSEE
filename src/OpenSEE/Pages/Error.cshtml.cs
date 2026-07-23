using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;

namespace OpenSEE.Pages;
[AllowAnonymous]
[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
[IgnoreAntiforgeryToken]
public class ErrorModel(ILogger<ErrorModel> logger) : PageModel
{
    public string RequestId { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    public bool IsAuthenticatedRequest => User.Identity?.IsAuthenticated == true;
    private ILogger<ErrorModel> Logger { get; } = logger;

    public IActionResult OnGet()
    {
        RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
        LogErrorWithRequestID();
        return IsAuthenticatedRequest ? Page() : RedirectToLogin();
    }

    private RedirectToPageResult RedirectToLogin()
    {
        string requestInfo = ShowRequestId
            ? $" Request ID: {RequestId}"
            : string.Empty;

        string error =
            $"An unknown error occurred during logon. " +
            $"Contact your system administrator." +
            $"{requestInfo}";

        StringValues redir = Request.Query["redir"];
        return RedirectToPage("/Login", new { error, redir });
    }

    private void LogErrorWithRequestID()
    {
        if (!ShowRequestId)
            return;

        IExceptionHandlerPathFeature exceptionHandlerPathFeature =
                HttpContext.Features.Get<IExceptionHandlerPathFeature>();

        if (exceptionHandlerPathFeature is null)
            return;

        string requestID = RequestId;
        string path = exceptionHandlerPathFeature.Path;
        Exception error = exceptionHandlerPathFeature.Error;
        Logger.LogError(error, "[HTTP Request Error] ID: {requestID}, Path: {path}", requestID, path);
    }
}

