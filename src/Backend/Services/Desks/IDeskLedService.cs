namespace Backend.Services.Desks
{
    public interface IDeskLedService
    {
        public Task Run(CancellationToken stoppingToken);
    }
}