using Backend.Auth;
using Backend.Data.Database;
using Backend.Services.Statistics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
[Authorize]
[RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
public class StatisticsController(IStatisticsService statisticsService) : ControllerBase
{
    [HttpGet("company")]
    public async Task<ActionResult<CompanyStatsDto>> GetCompanyStats(Guid companyId)
    {
        var nowUtc = DateTime.UtcNow;
        var dto = await statisticsService.GetCompanyStats(companyId, nowUtc);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("rooms/{roomId:guid}")]
    public async Task<ActionResult<RoomStatsDto>> GetRoomStats(Guid companyId, Guid roomId)
    {
        var nowUtc = DateTime.UtcNow;
        var dto = await statisticsService.GetRoomStats(companyId, roomId, nowUtc);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("desks/{deskId:guid}")]
    public async Task<ActionResult<DeskStatsDto>> GetDeskStats(Guid companyId, Guid deskId)
    {
        var nowUtc = DateTime.UtcNow;
        var dto = await statisticsService.GetDeskStats(companyId, deskId, nowUtc);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("users/{userId}")]
    public async Task<ActionResult<UserStatsDto>> GetUserStats(Guid companyId, string userId)
    {
        var nowUtc = DateTime.UtcNow;
        var dto = await statisticsService.GetUserStats(companyId, userId, nowUtc);
        return dto is null ? NotFound() : Ok(dto);
    }
}