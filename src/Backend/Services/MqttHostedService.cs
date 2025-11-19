using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Extensions.ManagedClient;
using MQTTnet.Protocol;

namespace Backend.Services
{
    public class MqttHostedService(ILogger<MqttHostedService> logger, ILoggerFactory loggerFactory) : IHostedService, IDisposable
    {

        private IManagedMqttClient _mqttClient;

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            if (IsGeneratingOpenApiDocument())
            {
                return;
            }

            logger.LogInformation("Starting MqttClient and connecting to the broker...");

            // Setup and start a managed MQTT client.
            var options = new ManagedMqttClientOptionsBuilder()
                .WithAutoReconnectDelay(TimeSpan.FromSeconds(5))
                .WithClientOptions(new MqttClientOptionsBuilder()
                    .WithClientId("Server")
                    .WithTcpServer("mqtt",1883)
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
            await _mqttClient.StopAsync();
        }

        public void Dispose()
        {
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
}