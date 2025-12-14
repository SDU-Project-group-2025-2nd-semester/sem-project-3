namespace Backend.Services.Mqtt;

public class MqttHostedService(ILogger<MqttHostedService> logger, IBackendMqttClient mqttClient) : IHostedService, IDisposable
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

//public class MessageProcessor(BackendContext context, ILogger<MessageProcessor> logger)
//{
//    public async Task ProcessMessageAsync(string topic, string message)
//    {
//        var topicParts = topic.Split('/'); // "desks/{deskMacAddress}/buzzer"

//        if (topicParts.Length != 3)
//        {
//            logger.LogWarning("Invalid topic format: {topic}", topic);
//            return;
//        }

//        var macAddress = topicParts[1];

//        if (topicParts[2] is not "height")
//        {
//            logger.LogWarning("Only allowed topic ends with height");
//            return;
//        }
//        // Implement your message processing logic here
//        return Task.CompletedTask;
//    }
//}