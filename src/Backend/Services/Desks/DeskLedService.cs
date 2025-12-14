using Backend.Data.Database;
using Backend.Services.Mqtt;

namespace Backend.Services.Desks
{
    public class DeskLedService(ILogger<DeskLedService> logger, BackendContext dbContext, IBackendMqttClient mqttClient) : IDeskLedService
    {
        public async Task Run(CancellationToken stoppingToken)
        {
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
        }
    }
}