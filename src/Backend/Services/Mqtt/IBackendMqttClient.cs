namespace Backend.Services.Mqtt;

public interface IBackendMqttClient : IDisposable
{
    Task StartAsync(CancellationToken cancellationToken);
    Task SendMessage(string message, string topic);
    Task StopAsync(CancellationToken cancellationToken);
}