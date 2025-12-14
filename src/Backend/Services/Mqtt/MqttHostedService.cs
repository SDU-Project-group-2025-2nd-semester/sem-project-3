namespace Backend.Services.Mqtt;

public class MqttHostedService( IBackendMqttClient mqttClient) : IHostedService, IDisposable
{

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (IsGeneratingOpenApiDocument())
        {
            return;
        }

        await mqttClient.StartAsync(cancellationToken);
    }


    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (IsGeneratingOpenApiDocument())
        {
            return;
        }


        await mqttClient.StopAsync(cancellationToken);
    }

    public void Dispose()
    {
        if (IsGeneratingOpenApiDocument())
        {
            return;
        }

        mqttClient.Dispose();
    }

    private static bool IsGeneratingOpenApiDocument()
    {
        // Check if running in a context that suggests OpenAPI generation
        return Environment.GetCommandLineArgs().Any(arg =>
            arg.Contains("swagger", StringComparison.OrdinalIgnoreCase) ||
            arg.Contains("openapi", StringComparison.OrdinalIgnoreCase));
    }
}