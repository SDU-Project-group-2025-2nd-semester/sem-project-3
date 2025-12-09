using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ReservationService(BackendContext dbContext, IReservationScheduler scheduler) : IReservationService
{
    public async Task<object> GetReservations(Guid companyId, string? userId, Guid? deskId = null,
        DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = dbContext.Reservations
            .Where(r => r.CompanyId == companyId);

        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(r => r.User.Id == userId);
        }

        if (deskId.HasValue)
        {
            query = query.Where(r => r.Id == deskId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(r => r.Start >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(r => r.End <= endDate.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<Reservation?> GetReservation(Guid reservationId)
    {
        return await dbContext.Reservations.FindAsync(reservationId);
    }

    public async Task DeleteReservation(Reservation reservation)
    {
        await scheduler.CancelScheduledAdjustment(reservation.Id);

        dbContext.Reservations.Remove(reservation);

        await dbContext.SaveChangesAsync();
    }

    public async Task<Reservation?> CreateReservation(CreateReservationDto createReservationDto, string userId,
        Guid companyId)
    {
        var reservations = await dbContext.Reservations
            .Where(r => r.Desk.Id == createReservationDto.DeskId)
            .Where(r => r.Start < createReservationDto.End && r.End > createReservationDto.Start)
            .ToListAsync();

        if (reservations.Any())
        {
            return null;
        }

        Reservation reservation = createReservationDto;

        reservation.CompanyId = companyId;
        reservation.UserId = userId;

        dbContext.Reservations.Add(reservation);

        await scheduler.ScheduleDeskAdjustment(reservation);

        await dbContext.SaveChangesAsync();

        return reservation; 
    }
}