using Backend.Data.Database;

namespace Backend.Services.Reservations;

public interface IReservationScheduler
{
    Task ScheduleDeskAdjustment(Reservation reservation);
    Task CancelScheduledAdjustment(Guid reservationId);
}