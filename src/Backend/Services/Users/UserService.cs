using Backend.Data.Database;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services.Users;

class UserService(ILogger<UserService> logger, BackendContext dbContext) : IUserService
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

    public async Task<bool> DeleteUserAsync(string userId)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return false;

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateUserAsync(string userId, User updated)
    {
        var existing = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (existing is null)
            return false;

        existing.FirstName = updated.FirstName;
        existing.LastName = updated.LastName;
        existing.SittingHeight = updated.SittingHeight;
        existing.StandingHeight = updated.StandingHeight;
        existing.HealthRemindersFrequency = updated.HealthRemindersFrequency;

        await dbContext.SaveChangesAsync();
        return true;
    }
    public async Task<bool> UpdateMyInfoAsync(string userId, User updated)
    {
        var existing = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (existing is null)
            return false;

        existing.FirstName = updated.FirstName;
        existing.LastName = updated.LastName;
        existing.SittingHeight = updated.SittingHeight;
        existing.StandingHeight = updated.StandingHeight;
        existing.HealthRemindersFrequency = updated.HealthRemindersFrequency;

        if (!string.IsNullOrWhiteSpace(updated.Email) && updated.Email != existing.Email)
        {
            existing.Email = updated.Email;
            existing.NormalizedEmail = updated.Email.ToUpperInvariant();
        }

        if (!string.IsNullOrWhiteSpace(updated.PasswordHash))
        {
            var hasher = new PasswordHasher<User>();
            existing.PasswordHash = hasher.HashPassword(existing, updated.PasswordHash);
        }

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