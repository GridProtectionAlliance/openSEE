using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace OpenSEE.Pages
{
    [AllowAnonymous]
    public class LoginModel : PageModel
    {
        public string ErrorMessage { get; set; }
        public bool HasErrorMessage => !string.IsNullOrEmpty(ErrorMessage);

        public void OnGet()
        {
            ErrorMessage = Request.Query["error"];
        }
    }
}
