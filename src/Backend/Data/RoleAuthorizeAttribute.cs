using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Backend.Data;

public class RoleAuthorizationFilter(BackendContext dbContext, UserRole[] allowedRoles) : IAsyncActionFilter
{

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;

        if (user.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userId = user.GetUserId();
        var dbUser = await dbContext.Users.FindAsync(userId);

        if (dbUser is null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (!allowedRoles.Contains(dbUser.Role))
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}

public class RequireRoleAttribute : TypeFilterAttribute
{
    public RequireRoleAttribute(params UserRole[] roles)
        : base(typeof(RoleAuthorizationFilter))
    {
        Arguments = [ roles ];
    }
}