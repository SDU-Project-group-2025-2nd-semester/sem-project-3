using Backend.Data.Database;

namespace Backend.Services.Desks;

public interface IDeskService
{
    public Task<List<Desk>> GetAllDesksAsync(Guid companyId);
    public Task<List<Desk>> GetDesksByRoomAsync(Guid companyId, Guid roomId);
    public Task<Desk?> GetDeskAsync(Guid companyId, Guid deskId);
    Task<Desk> CreateDeskAsync(Guid companyId, CreateDeskDto dto);
    Task<bool> UpdateDeskAsync(Guid companyId, Guid deskId, UpdateDeskDto updated);
    Task<bool> UpdateDeskHeightAsync(Guid companyId, Guid deskId, int newHeight);
    Task<bool> UnadoptDeskAsync(Guid companyId, Guid deskId);
    Task<List<string>> GetNotAdoptedDesks(Guid companyId);
    Task<Desk?> GetDeskByMacAsync(Guid companyId, string macAddress);
}