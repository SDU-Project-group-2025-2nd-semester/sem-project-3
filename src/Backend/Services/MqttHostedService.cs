using Backend.Data;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Extensions.ManagedClient;
using MQTTnet.Protocol;
using MQTTnet.Server;

namespace Backend.Services;

public interface IBackendMqttClient : IDisposable
{
    Task StartAsync(CancellationToken cancellationToken);
    Task SendMessage(string message, string topic);
    Task StopAsync(CancellationToken cancellationToken);
}

public class BackendMqttClient(ILogger<MqttHostedService> logger, IConfiguration configuration) : IBackendMqttClient
{
    private IManagedMqttClient _mqttClient;

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Starting MqttClient and connecting to the broker...");

        var mqttHost = configuration["Mqtt:Host"] ?? "mqtt";
        var mqttPort = int.Parse(configuration["Mqtt:Port"] ?? "1883");

        logger.LogInformation("Connecting to MQTT broker at {Host}:{Port}", mqttHost, mqttPort);

        // Setup and start a managed MQTT client.
        var options = new ManagedMqttClientOptionsBuilder()
            .WithAutoReconnectDelay(TimeSpan.FromSeconds(5))
            .WithClientOptions(new MqttClientOptionsBuilder()
                .WithClientId("Server")
                .WithTcpServer(mqttHost, mqttPort)
                .Build())
            .Build();

        _mqttClient = new MqttFactory().CreateManagedMqttClient();

        await _mqttClient.SubscribeAsync("desks/#");
        await _mqttClient.StartAsync(options);

        _mqttClient.ApplicationMessageReceivedAsync += MqttClient_ApplicationMessageReceivedAsync;

        int i = 0;

        do // Wait till the client is connected
        {
            await Task.Delay(TimeSpan.FromMilliseconds(5), cancellationToken);
            i++;

            if (i > 20)
            {
                logger.LogError("Wasn't able to connect to MQTT server after more than 20 tries! Continuing without it...");
                return;
            }

        } while (!_mqttClient.IsConnected);

        logger.LogInformation("MqttClient connected to the broker after {attempts} attempts.", i);


    }

    public Task SendMessage(string message, string topic)
    {
        var mqttMessage = new MqttApplicationMessageBuilder()
            .WithTopic(topic)
            .WithPayload(message)
            .WithRetainFlag(false)
            .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtLeastOnce)
            .Build();

        return _mqttClient.EnqueueAsync(mqttMessage);
    }

    private async Task MqttClient_ApplicationMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs arg)
    {
        var topic = arg.ApplicationMessage.Topic;
        var message = arg.ApplicationMessage.ConvertPayloadToString();

        logger.LogInformation("Message received: {message} from topic: {topic}", message, topic);

        //using var scope = serviceProvider.CreateScope();

        // Here you can resolve services from the scope and process the message as needed.

    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        await _mqttClient.StopAsync();

        if (IsGeneratingOpenApiDocument())
        {
            return;
        }

    }

    public void Dispose()
    {
        if (IsGeneratingOpenApiDocument())
        {
            return;
        }

        _mqttClient.Dispose();
    }

    
    private static bool IsGeneratingOpenApiDocument()
    {
        // Check if running in a context that suggests OpenAPI generation
        return Environment.GetCommandLineArgs().Any(arg =>
            arg.Contains("swagger", StringComparison.OrdinalIgnoreCase) ||
            arg.Contains("openapi", StringComparison.OrdinalIgnoreCase));
    }

}

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