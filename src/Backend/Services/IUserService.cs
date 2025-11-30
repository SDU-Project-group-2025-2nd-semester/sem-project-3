using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

public interface IUserService
{
    public Task<User?> GetUserAsync(string userId);
    public Task<bool> UpdateUserAsync(string userId, User updated);
    public Task<bool> UpdateMyInfoAsync(string userId, User updated);
}

class UserService(ILogger<UserService> logger, BackendContext dbContext) : IUserService
{
    public async Task<User?> GetUserAsync(string userId)
    {
        return await dbContext.Users
            .Include(u => u.CompanyMemberships)
            .ThenInclude(uc => uc.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);
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
}