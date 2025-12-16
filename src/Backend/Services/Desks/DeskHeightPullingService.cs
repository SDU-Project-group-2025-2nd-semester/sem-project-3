using Backend.Data.Database;
using Backend.Hubs;
using Backend.Services.DeskApis;
using Backend.Services.Mqtt;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services.Desks;

public class DeskHeightPullingService(ILogger<DeskHeightPullingService> logger, IHubContext<DeskHub> hubContext, IServiceProvider serviceProvider, IBackendMqttClient mqttClient) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (IsGeneratingOpenApiDocument())
        {
            return;
        }

        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // HACK: Wait a minute before starting to allow db migrations to complete

        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = serviceProvider.CreateScope();

            var deskApi = scope.ServiceProvider.GetRequiredService<IDeskApi>();
            var dbContext = scope.ServiceProvider.GetRequiredService<BackendContext>();

            var desks = await dbContext.Desks.ToListAsync(stoppingToken);
            foreach (var desk in desks)
            {
                try
                {
                    // Pass companyId to DeskApi, which will fetch simulator settings from DB
                    var currentState = await deskApi.GetDeskState(desk.MacAddress, desk.CompanyId);

                    desk.Metadata.IsOverloadProtectionDown = currentState.IsOverloadProtectionDown;
                    desk.Metadata.IsAntiCollision = currentState.IsAntiCollision;
                    desk.Metadata.IsOverloadProtectionUp = currentState.IsOverloadProtectionUp;
                    desk.Metadata.Status = currentState.Status;
                    desk.Metadata.IsPositionLost = currentState.IsPositionLost;

                    //currentState.PositionMm = desk.Height; // HACK: To see if health reminders work

                    if (currentState.PositionMm != desk.Height)
                    {
                        // Height changed - update and clear reminder state
                        var oldHeight = desk.Height;
                        desk.Height = currentState.PositionMm;
                        desk.LastHeightChangeTime = DateTime.UtcNow;
                        desk.NeedsHealthReminder = false;
                        
                        await dbContext.SaveChangesAsync(stoppingToken);
                        
                        // Notify clients via SignalR
                        var update = new DeskHeightUpdate
                        {
                            DeskId = desk.Id,
                            RoomId = desk.RoomId,
                            OldHeight = oldHeight,
                            NewHeight = currentState.PositionMm,
                            Timestamp = DateTime.UtcNow
                        };
                        await hubContext.Clients
                            .Group($"desk-{desk.Id}")
                            .SendAsync("DeskHeightChanged", update, cancellationToken: stoppingToken);
                        await hubContext.Clients
                            .Group($"room-{desk.RoomId}")
                            .SendAsync("DeskHeightChanged", update, cancellationToken: stoppingToken);
                        logger.LogInformation("Pulled and updated height for desk {DeskId} to {Height}mm", desk.Id,
                            currentState.PositionMm);
                    }
                    else
                    {
                        // Height hasn't changed - check if we need to send health reminder
                        await CheckAndSendHealthReminder(desk, dbContext, mqttClient, stoppingToken);
                        await dbContext.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error pulling height for desk {DeskId}", desk.Id);
                }
            }
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task CheckAndSendHealthReminder(Desk desk, BackendContext dbContext, IBackendMqttClient mqttClient, CancellationToken stoppingToken)
    {
        // Get current reservation for this desk
        var currentReservation = await dbContext.Reservations
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => 
                r.DeskId == desk.Id &&
                r.Start <= DateTime.UtcNow &&
                r.End >= DateTime.UtcNow, stoppingToken);

        // If no active reservation, no need to send reminders
        if (currentReservation == null)
        {
            return;
        }

        // If we haven't tracked when the desk height was last changed, start tracking now
        if (desk.LastHeightChangeTime == null)
        {
            desk.LastHeightChangeTime = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(stoppingToken);
            return;
        }

        // Get time interval based on user's health reminder frequency
        var reminderInterval = GetReminderInterval(currentReservation.User.HealthRemindersFrequency);
        var timeSinceLastChange = DateTime.UtcNow - desk.LastHeightChangeTime.Value;

        // Check if it's time to send a reminder
        if (timeSinceLastChange >= reminderInterval)
        {
            // Send buzz reminder via MQTT
            await mqttClient.SendMessage("buzz", $"{desk.RpiMacAddress}/buzzer");
            
            // Mark that reminder has been sent
            desk.NeedsHealthReminder = true;
            await dbContext.SaveChangesAsync(stoppingToken);
            
            logger.LogInformation(
                "Sent health reminder (buzz) to desk {DeskId} for user {UserId}. Time since last change: {Minutes} minutes",
                desk.Id, currentReservation.UserId, timeSinceLastChange.TotalMinutes);
        }
    }

    private TimeSpan GetReminderInterval(HealthRemindersFrequency frequency)
    {
        return frequency switch
        {
            HealthRemindersFrequency.High => TimeSpan.FromMinutes(15),
            HealthRemindersFrequency.Medium => TimeSpan.FromMinutes(30),
            HealthRemindersFrequency.Low => TimeSpan.FromMinutes(60),
            _ => TimeSpan.FromMinutes(30) // Default to Medium
        };
    }
}