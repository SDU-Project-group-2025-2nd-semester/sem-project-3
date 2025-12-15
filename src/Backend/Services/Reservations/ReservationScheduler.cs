using Backend.Data.Database;
using Backend.Services.Desks;
using Hangfire;
using Hangfire.States;

namespace Backend.Services.Reservations;

public class ReservationScheduler(
    ILogger<ReservationScheduler> logger,
    IBackgroundJobClient backgroundJobClient,
    BackendContext context) : IReservationScheduler
{
    public async Task ScheduleDeskAdjustment(Reservation reservation)
    {
        var triggerTime = reservation.Start;
        

        if (triggerTime <= DateTime.UtcNow)
        {
            // If reservation starts soon, trigger immediately
            backgroundJobClient.Enqueue<DeskAdjustmentJob>(job => 
                job.AdjustDeskForReservation(reservation.Id));
        }
        else
        {
            // Schedule for future
            string jobId = backgroundJobClient.Schedule<DeskAdjustmentJob>(
                job => job.AdjustDeskForReservation(reservation.Id),
                triggerTime);

            reservation.JobId = jobId;

            await context.SaveChangesAsync();

            logger.LogInformation(
                "Scheduled desk adjustment for reservation {ReservationId} at {TriggerTime} (JobId: {JobId})",
                reservation.Id, triggerTime, jobId);
        }
    }

    public async Task CancelScheduledAdjustment(Guid reservationId)
    {

        var reservation = await context.Reservations.FindAsync(reservationId);

        if (reservation == null || string.IsNullOrEmpty(reservation.JobId))
        {
            logger.LogWarning("No scheduled job found for reservation {ReservationId}", reservationId);
            return;
        }

        backgroundJobClient.ChangeState(reservation.JobId, new DeletedState());

        reservation.JobId = null;

        await context.SaveChangesAsync();

        logger.LogInformation("Cancelling scheduled adjustment for reservation {ReservationId}", reservationId);
    }
}