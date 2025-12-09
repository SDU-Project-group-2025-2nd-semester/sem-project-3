using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class RoleAuthorizationFilter(BackendContext dbContext, UserRole[] allowedRoles) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var principal = context.HttpContext.User;

        if (principal.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userId = principal.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }
        
        Guid? companyId = null;
        if (context.RouteData.Values.TryGetValue("companyId", out var rawCompanyId) &&
            Guid.TryParse(rawCompanyId.ToString(), out var parsedId))
        {
            companyId = parsedId;
        }
        
        if (companyId != null)
        {
            var membership = await dbContext.UserCompanies
                .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.CompanyId == companyId.Value);

            if (membership is null)
            {
                context.Result = new ForbidResult();
                return;
            }
            
            if (allowedRoles.Length > 0 && !allowedRoles.Contains(membership.Role))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
        
        else if (allowedRoles.Length > 0)
        {
            var hasRoleAnywhere = await dbContext.UserCompanies
                .AnyAsync(uc => uc.UserId == userId && allowedRoles.Contains(uc.Role));

            if (!hasRoleAnywhere)
            {
                context.Result = new ForbidResult();
                return;
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
        Arguments = new object[] { roles };
    }
}