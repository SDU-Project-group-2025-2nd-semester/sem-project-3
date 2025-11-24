using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

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

        if (allowedRoles.Length > 0 && !allowedRoles.Contains(dbUser.Role))
        {
            context.Result = new ForbidResult();
            return;
        }
        
        if (context.RouteData.Values.ContainsKey("companyId"))
        {
            var rawCompanyId = context.RouteData.Values["companyId"];

            if (rawCompanyId != null)
            {
                Guid companyId;

                if (Guid.TryParse(rawCompanyId.ToString(), out companyId))
                {
                    var isMember = await dbContext.UserCompanies
                        .AnyAsync(uc => uc.UserId == dbUser.Id && uc.CompanyId == companyId);

                    if (!isMember)
                    {
                        context.Result = new ForbidResult();
                        return;
                    }
                }
            }
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