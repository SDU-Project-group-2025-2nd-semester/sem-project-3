using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IUserService
{
    public Task<User?> GetUserAsync(Guid companyId, string userId);
    public Task<bool> UpdateUserAsync(Guid companyId, string userId, User updated);
}

class UserService(ILogger<UserService> logger, BackendContext dbContext) : IUserService
{
    public async Task<User?> GetUserAsync(Guid companyId, string userId)
    {
        return await dbContext.Users.FirstOrDefaultAsync(u => u.CompanyId == companyId && u.Id == userId);
    }

    public async Task<bool> UpdateUserAsync(Guid companyId, string userId, User updated)
    {
        var existing = await dbContext.Users.FirstOrDefaultAsync(u => u.CompanyId == companyId && u.Id == userId);

        if (existing is null)
            return false;
        
        existing.FirstName = updated.FirstName;
        existing.LastName = updated.LastName;
        existing.SittingHeight = updated.SittingHeight;
        existing.StandingHeight = updated.StandingHeight;
        existing.HealthRemindersFrequency = updated.HealthRemindersFrequency;
        existing.Role = updated.Role;

        await dbContext.SaveChangesAsync();
        return true;
    }
}