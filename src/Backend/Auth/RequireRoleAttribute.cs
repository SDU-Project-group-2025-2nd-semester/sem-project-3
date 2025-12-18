using Backend.Data.Database;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Auth;

public class RequireRoleAttribute : TypeFilterAttribute
{
    public RequireRoleAttribute(params UserRole[] roles)
        : base(typeof(RoleAuthorizationFilter))
    {
        Arguments = [roles];
    }
}