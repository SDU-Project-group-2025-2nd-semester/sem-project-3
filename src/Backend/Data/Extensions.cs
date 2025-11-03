using System.Security.Claims;

namespace Backend.Data;

public static class Extensions
{


    public static string GetUserId(this ClaimsPrincipal claimsPrincipal)
    {
        string? userId = claimsPrincipal.Claims
            .FirstOrDefault(c => c.Type is "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
            ?.Value;

        if (userId == null)
        {
            throw new InvalidOperationException("User ID claim not found.");
        }

        return userId;
    }
}