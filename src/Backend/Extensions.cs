using System.Security.Claims;

namespace Backend;

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

    public static bool IsGeneratingOpenApiDocument()
    {

        // Check if running in a context that suggests OpenAPI generation
        return Environment.GetCommandLineArgs().Any(arg =>
            arg.Contains("swagger", StringComparison.OrdinalIgnoreCase) ||
            arg.Contains("openapi", StringComparison.OrdinalIgnoreCase));

    }
}