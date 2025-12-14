using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IStatisticsService
{
    Task<CompanyStatsDto?> GetCompanyStats(Guid companyId, DateTime nowUtc);
    Task<RoomStatsDto?> GetRoomStats(Guid companyId, Guid roomId, DateTime nowUtc);
    Task<DeskStatsDto?> GetDeskStats(Guid companyId, Guid deskId, DateTime nowUtc);
    Task<UserStatsDto?> GetUserStats(Guid companyId, string userId, DateTime nowUtc);
}

public class StatisticsService(BackendContext dbContext) : IStatisticsService
{
    public async Task<CompanyStatsDto?> GetCompanyStats(Guid companyId, DateTime nowUtc)
    {
        var companyExists = await dbContext.Companies.AnyAsync(c => c.Id == companyId);
        if (!companyExists) return null;

        var todayStart = nowUtc.Date;
        var tomorrowStart = todayStart.AddDays(1);

        var roomsCount = await dbContext.Rooms.CountAsync(r => r.CompanyId == companyId);
        var desksCount = await dbContext.Desks.CountAsync(d => d.CompanyId == companyId);

        var activeReservationsQuery = dbContext.Reservations
            .AsNoTracking()
            .Where(r => r.CompanyId == companyId && r.Start <= nowUtc && r.End > nowUtc);

        var activeReservationsNow = await activeReservationsQuery.CountAsync();

        var occupiedDesksNow = await activeReservationsQuery
            .Select(r => r.DeskId)
            .Distinct()
            .CountAsync();

        var reservationsToday = await dbContext.Reservations
            .AsNoTracking()
            .CountAsync(r => r.CompanyId == companyId && r.Start >= todayStart && r.Start < tomorrowStart);

        var openDamageReports = await dbContext.DamageReports
            .AsNoTracking()
            .CountAsync(dr => dr.CompanyId == companyId && !dr.IsResolved);

        return new CompanyStatsDto(
            companyId,
            roomsCount,
            desksCount,
            occupiedDesksNow,
            activeReservationsNow,
            reservationsToday,
            openDamageReports
        );
    }

    public async Task<RoomStatsDto?> GetRoomStats(Guid companyId, Guid roomId, DateTime nowUtc)
    {
        var room = await dbContext.Rooms
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.CompanyId == companyId && r.Id == roomId);

        if (room is null) return null;

        var desksQuery = dbContext.Desks
            .AsNoTracking()
            .Where(d => d.CompanyId == companyId && d.RoomId == roomId);

        var desksCount = await desksQuery.CountAsync();

        var activeReservationsQuery = dbContext.Reservations
            .AsNoTracking()
            .Where(r => r.CompanyId == companyId && r.Start <= nowUtc && r.End > nowUtc)
            .Join(desksQuery, r => r.DeskId, d => d.Id, (r, d) => r);

        var activeReservationsNow = await activeReservationsQuery.CountAsync();
        var occupiedDesksNow = await activeReservationsQuery
            .Select(r => r.DeskId)
            .Distinct()
            .CountAsync();

        return new RoomStatsDto(
            companyId,
            roomId,
            room.ReadableId,
            desksCount,
            occupiedDesksNow,
            activeReservationsNow
        );
    }

    public async Task<DeskStatsDto?> GetDeskStats(Guid companyId, Guid deskId, DateTime nowUtc)
    {
        var desk = await dbContext.Desks
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.CompanyId == companyId && d.Id == deskId);

        if (desk is null) return null;

        var reservationsTotal = await dbContext.Reservations
            .AsNoTracking()
            .CountAsync(r => r.CompanyId == companyId && r.DeskId == deskId);

        var activeReservation = await dbContext.Reservations
            .AsNoTracking()
            .Where(r => r.CompanyId == companyId && r.DeskId == deskId && r.Start <= nowUtc && r.End > nowUtc)
            .OrderBy(r => r.Start)
            .Select(r => new DeskActiveReservationDto(r.Id, r.UserId, r.Start, r.End))
            .FirstOrDefaultAsync();

        return new DeskStatsDto(
            companyId,
            deskId,
            desk.ReadableId,
            desk.RoomId,
            desk.Height,
            desk.MinHeight,
            desk.MaxHeight,
            desk.Metadata?.Usage?.ActivationsCounter ?? 0,
            desk.Metadata?.Usage?.SitStandCounter ?? 0,
            reservationsTotal,
            activeReservation
        );
    }

    public async Task<UserStatsDto?> GetUserStats(Guid companyId, string userId, DateTime nowUtc)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null) return null;
        
        var reservationsQuery = dbContext.Reservations
            .AsNoTracking()
            .Where(r => r.CompanyId == companyId && r.UserId == userId);

        var reservationsTotal = await reservationsQuery.CountAsync();

        var activeReservationsNow = await reservationsQuery
            .CountAsync(r => r.Start <= nowUtc && r.End > nowUtc);

        var uniqueDesksReserved = await reservationsQuery
            .Select(r => r.DeskId)
            .Distinct()
            .CountAsync();

        return new UserStatsDto(
            companyId,
            userId,
            user.Email,
            user.FirstName,
            user.LastName,
            user.SittingHeight,
            user.StandingHeight,
            user.SittingTime,
            user.StandingTime,
            reservationsTotal,
            activeReservationsNow,
            uniqueDesksReserved
        );
    }
}