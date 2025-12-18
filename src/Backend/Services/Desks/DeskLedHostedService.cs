using Backend.Services.DeskApis;
using Backend.Services.Mqtt;

namespace Backend.Services.Desks;

public class DeskLedHostedService(IServiceProvider serviceProvider) : BackgroundService
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

            var deskLedService = scope.ServiceProvider.GetRequiredService<IDeskLedService>();

            await deskLedService.Run(stoppingToken);

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}