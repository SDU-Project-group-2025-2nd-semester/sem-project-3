using Backend.Data.Database;

namespace Backend.Services.Desks;

public class DeskAdjustmentJob(
    ILogger<DeskAdjustmentJob> logger,
    IServiceProvider serviceProvider)
{
    public async Task AdjustDeskForReservation(Guid reservationId)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BackendContext>();
        var deskControlService = scope.ServiceProvider.GetRequiredService<IDeskControlService>();

        var reservation = await dbContext.Reservations
            .Include(r => r.User)
            .Include(r => r.Desk)
            .FirstOrDefaultAsync(r => r.Id == reservationId);

        if (reservation == null)
        {
            logger.LogWarning("Reservation {ReservationId} not found", reservationId);
            return;
        }

        try
        {
            int targetHeight = reservation.User.SittingHeight;

            var success = await deskControlService.SetDeskHeightAsync(
                reservation.Desk.Id, 
                targetHeight);

            if (success)
            {
                logger.LogInformation(
                    "Auto-adjusted desk {DeskId} to {Height}mm for reservation {ReservationId}",
                    reservation.Desk.Id, targetHeight, reservationId);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, 
                "Error auto-adjusting desk for reservation {ReservationId}", reservationId);
        }
    }
}