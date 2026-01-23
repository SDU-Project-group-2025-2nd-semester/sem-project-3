using Backend.Data.Dtos;

namespace Backend.Services.Statistics;

public interface IStatisticsService
{
    Task<CompanyStatsDto?> GetCompanyStats(Guid companyId, DateTime nowUtc);
    Task<RoomStatsDto?> GetRoomStats(Guid companyId, Guid roomId, DateTime nowUtc);
    Task<DeskStatsDto?> GetDeskStats(Guid companyId, Guid deskId, DateTime nowUtc);
    Task<UserStatsDto?> GetUserStats(Guid companyId, string userId, DateTime nowUtc);
}