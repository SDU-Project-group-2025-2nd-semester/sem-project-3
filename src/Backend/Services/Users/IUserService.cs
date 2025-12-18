using Backend.Data.Database;

namespace Backend.Services.Users;

public interface IUserService
{
    public Task<User?> GetUserAsync(string userId);
    public Task<List<User>> GetAllUsersAsync();
    public Task<bool> UpdateUserAsync(string userId, User updated);
    public Task<bool> UpdateMyInfoAsync(string userId, User updated);
    public Task<bool> DeleteUserAsync(string userId);
    public Task<List<object>> GetUserCompaniesAsync(string userId);
    public Task<IEnumerable<object>> GetUsersByCompanyAsync(string adminUserId, Guid? companyId = null);
}