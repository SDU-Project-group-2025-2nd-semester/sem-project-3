using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Extensions.ManagedClient;
using MQTTnet.Protocol;

namespace Backend.Services.Mqtt;

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

    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (IsGeneratingOpenApiDocument())
        {
            return;
        }

        await _mqttClient.StopAsync();

    }

    public void Dispose()
    {
        if (IsGeneratingOpenApiDocument())
        {
            return;
        }

        _mqttClient.Dispose();
    }
}