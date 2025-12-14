using Backend.Data.Database;
using Backend.Hubs;
using Backend.Services.DeskApis;
using Backend.Services.Mqtt;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services.Desks;

public class DeskLedService(ILogger<DeskHeightPullingService> logger, IServiceProvider serviceProvider, IBackendMqttClient mqttClient) : BackgroundService
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
                    bool isOccupied = await dbContext.Reservations
                        .AnyAsync(r => r.DeskId == desk.Id &&
                                       r.Start <= DateTime.UtcNow &&
                                       r.End >= DateTime.UtcNow, stoppingToken);

                    if (isOccupied)
                    {
                        await mqttClient.SendMessage("red", $"{desk.RpiMacAddress}/led");
                    }
                    else
                    {
                        await mqttClient.SendMessage("green", $"{desk.RpiMacAddress}/led");
                    }

                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error setting LED for desk {DeskId}", desk.Id);
                }
            }
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}