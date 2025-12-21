using Backend.Data.Database;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services.Users;

public class UserService(ILogger<UserService> logger, BackendContext dbContext, UserManager<User> userManager) : IUserService
{
    public async Task<User?> GetUserAsync(string userId)
    {
        return await dbContext.Users
            .Include(u => u.CompanyMemberships)
            .ThenInclude(uc => uc.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await dbContext.Users.ToListAsync();
    }

    public async Task<bool> UpdateUserAsync(string userId, UpdateUserDto updated)
    {
        //if (!string.IsNullOrEmpty(updated.NewPassword))
        //{
        //    return false; // NewPassword updates are not allowed through this method
        //}

        return await UpdateUserAsyncInternal(userId, updated);
    }

    private async Task<bool> UpdateUserAsyncInternal(string userId, UpdateUserDto updated)
    {
        var user = await dbContext.Users.FindAsync(userId);

        if (user is null)
            return false;

        if (!string.IsNullOrEmpty(updated.FirstName))
        {
            user.FirstName = updated.FirstName;
        }

        if (!string.IsNullOrEmpty(updated.LastName))
        {
            user.LastName = updated.LastName;
        }

        
        if (updated.SittingHeight.HasValue)
        {
            user.SittingHeight = updated.SittingHeight.Value;
        }

        if (updated.StandingHeight.HasValue)
        {
            user.StandingHeight = updated.StandingHeight.Value;
        }

        if (updated.HealthRemindersFrequency.HasValue)
        {
            user.HealthRemindersFrequency = updated.HealthRemindersFrequency.Value;
        }

        
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateMyInfoAsync(string userId, UpdateUserDto updated)
    {
        return await UpdateUserAsyncInternal(userId, updated);
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return false;

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<List<object>> GetUserCompaniesAsync(string userId)
    {
        var userCompanies = await dbContext.UserCompanies
            .Include(uc => uc.Company)
            .Where(uc => uc.UserId == userId)
            .Select(uc => new
            {
                uc.CompanyId,
                CompanyName = uc.Company.Name
            })
            .ToListAsync<object>();

        return userCompanies;
    }

    public async Task<IEnumerable<object>> GetUsersByCompanyAsync(string adminUserId, Guid? companyId = null)
    {
        if (companyId == null)
        {
            var adminUser = await dbContext.Users
                .Include(u => u.CompanyMemberships)
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            if (adminUser?.CompanyMemberships.FirstOrDefault() == null)
                throw new InvalidOperationException("Admin has no company association");

            companyId = adminUser.CompanyMemberships.First().CompanyId;
        }

        var hasAccess = await dbContext.UserCompanies
            .AnyAsync(uc => uc.UserId == adminUserId &&
                            uc.CompanyId == companyId &&
                            uc.Role == UserRole.Admin);

        if (!hasAccess)
            throw new UnauthorizedAccessException("Admin does not have access to this company");

        var users = await dbContext.UserCompanies
            .Where(uc => uc.CompanyId == companyId)
            .Include(uc => uc.User)
            .Select(uc => new
            {
                uc.User.Id,
                uc.User.Email,
                uc.User.UserName,
                uc.User.FirstName,
                uc.User.LastName,
                uc.User.StandingHeight,
                uc.User.SittingHeight,
                uc.User.HealthRemindersFrequency,
                uc.User.SittingTime,
                uc.User.StandingTime,
                uc.User.AccountCreation,
                Role = (int)uc.Role
            })
            .ToListAsync();

        return users;
    }
}