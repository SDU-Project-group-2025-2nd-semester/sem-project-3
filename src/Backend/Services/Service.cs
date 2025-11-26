using Backend.Data;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http;
using System.Text.Json.Serialization;

namespace Backend.Services;

public interface IDeskControlService
{
    Task<bool> SetDeskHeightAsync(Guid deskId, int newHeight);
    Task<bool> SetRoomDesksHeightAsync(Guid roomId, int newHeight);
    Task<int?> GetCurrentDeskHeightAsync(string macAddress);
}

public class DeskHeightPullingService(ILogger<DeskHeightPullingService> logger, IHubContext<DeskHub> hubContext, IServiceProvider serviceProvider, IBackendMqttClient mqttClient) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (Bullshit.IsGeneratingOpenApiDocument())
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
                    var currentState = await deskApi.GetDeskState(desk.MacAddress);
                    if (currentState.PositionMm == desk.Height)
                    {
                        // Just for sake of testing - will be more complicated later
                        // Notify table

                         await mqttClient.SendMessage("buzz", $"{desk.RpiMacAddress}/buzzer");
                    }
                    else
                    {
                        var oldHeight = desk.Height;
                        desk.Height = currentState.PositionMm;
                        await dbContext.SaveChangesAsync(stoppingToken);
                        // Notify clients via SignalR
                        var update = new DeskHeightUpdate
                        {
                            DeskId = desk.Id,
                            RoomId = desk.RoomId,
                            OldHeight = oldHeight,
                            NewHeight = currentState.PositionMm,
                            Timestamp = DateTime.UtcNow
                        };
                        await hubContext.Clients
                            .Group($"desk-{desk.Id}")
                            .SendAsync("DeskHeightChanged", update, cancellationToken: stoppingToken);
                        await hubContext.Clients
                            .Group($"room-{desk.RoomId}")
                            .SendAsync("DeskHeightChanged", update, cancellationToken: stoppingToken);
                        logger.LogInformation("Pulled and updated height for desk {DeskId} to {Height}mm", desk.Id,
                            currentState.PositionMm);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error pulling height for desk {DeskId}", desk.Id);
                }
            }
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}

public class DeskControlService(BackendContext dbContext, ILogger<DeskControlService> logger, IDeskApi deskApi, IHubContext<DeskHub> hubContext) : IDeskControlService
{

    public async Task<bool> SetDeskHeightAsync(Guid deskId, int newHeight)
    {
        var desk = await dbContext.Desks
            .Include(d => d.Room)
            .FirstOrDefaultAsync(d => d.Id == deskId);

        if (desk == null)
        {
            logger.LogWarning("Desk {DeskId} not found", deskId);
            return false;
        }

        if (newHeight < desk.MinHeight || newHeight > desk.MaxHeight)
        {
            logger.LogWarning(
                "Invalid height {Height} for desk {DeskId}. Must be between {Min} and {Max}",
                newHeight, deskId, desk.MinHeight, desk.MaxHeight);
            return false;
        }

        try
        {
            var newState = await deskApi.SetState(desk.MacAddress, new State()
            {
                PositionMm = newHeight,
            });


            // Update database
            var oldHeight = desk.Height;
            desk.Height = newState.PositionMm;
            await dbContext.SaveChangesAsync();

            // Notify clients via SignalR
            await NotifyDeskHeightChanged(desk, oldHeight, newHeight);

            logger.LogInformation("Desk {DeskId} height changed to {Height}mm", deskId, newHeight);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error changing height for desk {DeskId}", deskId);
            return false;
        }
    }

    public async Task<bool> SetRoomDesksHeightAsync(Guid roomId, int newHeight)
    {
        var desks = await dbContext.Desks
            .Where(d => d.RoomId == roomId)
            .ToListAsync();

        var tasks = desks.Select(desk => SetDeskHeightAsync(desk.Id, newHeight));
        var results = await Task.WhenAll(tasks);

        return results.All(r => r);
    }

    public async Task<int?> GetCurrentDeskHeightAsync(string macAddress)
    {
        try
        {
            var response = await deskApi.GetDeskState(macAddress);


            return response.PositionMm;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting height for desk {macAddress}", macAddress);
            return null;
        }
    }

    private async Task NotifyDeskHeightChanged(Desk desk, int oldHeight, int newHeight)
    {
        var update = new DeskHeightUpdate
        {
            DeskId = desk.Id,
            RoomId = desk.RoomId,
            OldHeight = oldHeight,
            NewHeight = newHeight,
            Timestamp = DateTime.UtcNow
        };

        // Send to all clients watching this specific desk
        await hubContext.Clients
            .Group($"desk-{desk.Id}")
            .SendAsync("DeskHeightChanged", update);

        // Send to all clients watching this room
        await hubContext.Clients
            .Group($"room-{desk.RoomId}")
            .SendAsync("DeskHeightChanged", update);

    }

}

/// <summary>
/// Provides utility methods for determining the current application environment or configuration state.
/// </summary>
/// <remarks>This class contains methods that assist in identifying specific runtime conditions, such as whether
/// the application is generating an OpenAPI document. Because the FUCKING openApi document generator can't generate docs without building and running the whole app. What a stupid tool...</remarks>
public static class Bullshit
{
    public static bool IsGeneratingOpenApiDocument()
    {

        // Check if running in a context that suggests OpenAPI generation
        return Environment.GetCommandLineArgs().Any(arg =>
            arg.Contains("swagger", StringComparison.OrdinalIgnoreCase) ||
            arg.Contains("openapi", StringComparison.OrdinalIgnoreCase));

    }
}

public interface IDeskApi
{
    Task<List<string>> GetAllDesks();
    Task<DeskJsonElement> GetDeskStatus(string macAddress);
    Task<Config> GetDeskConfig(string macAddress);
    Task<State> GetDeskState(string macAddress);
    Task<Usage> GetDeskUsage(string macAddress);
    Task<List<LastError>> GetDeskLastErrors(string macAddress);
    Task<Config> SetConfig(string macAddress, Config config);
    Task<State> SetState(string macAddress, State state);
    Task<Usage> SetUsage(string macAddress, Usage usage);
    Task<List<LastError>> SetLastErrors(string macAddress, List<LastError> lastErrors);
}

public class DeskApi(IHttpClientFactory httpClientFactory) : IDeskApi
{
    private readonly HttpClient httpClient = httpClientFactory.CreateClient("DeskApi");

    public async Task<List<string>> GetAllDesks()
    {

        var result = await httpClient.GetAsync("desks");

        result.EnsureSuccessStatusCode();

        var desks = await result.Content.ReadFromJsonAsync<List<string>>();

        return desks ?? [];
    }

    public async Task<DeskJsonElement> GetDeskStatus(string macAddress)
    {
        var result = await httpClient.GetAsync($"desks/{macAddress}/status");

        result.EnsureSuccessStatusCode();

        var desk = await result.Content.ReadFromJsonAsync<DeskJsonElement>();

        if (desk == null)
        {
            throw new Exception("Failed to parse desk status");
        }

        return desk;
    }

    public async Task<Config> GetDeskConfig(string macAddress)
    {
        var result = await httpClient.GetAsync($"desks/{macAddress}/config");
        result.EnsureSuccessStatusCode();
        var config = await result.Content.ReadFromJsonAsync<Config>();
        if (config == null)
        {
            throw new Exception("Failed to parse desk config");
        }

        return config;
    }

    public async Task<State> GetDeskState(string macAddress)
    {
        var result = await httpClient.GetAsync($"desks/{macAddress}/state");
        result.EnsureSuccessStatusCode();

        var content = await result.Content.ReadAsStringAsync();

        var state = await result.Content.ReadFromJsonAsync<State>();
        if (state == null)
        {
            throw new Exception("Failed to parse desk state");
        }

        return state;
    }

    public async Task<Usage> GetDeskUsage(string macAddress)
    {
        var result = await httpClient.GetAsync($"desks/{macAddress}/usage");
        result.EnsureSuccessStatusCode();
        var usage = await result.Content.ReadFromJsonAsync<Usage>();
        if (usage == null)
        {
            throw new Exception("Failed to parse desk usage");
        }

        return usage;
    }

    public async Task<List<LastError>> GetDeskLastErrors(string macAddress)
    {
        var result = await httpClient.GetAsync($"desks/{macAddress}/lastErrors");
        result.EnsureSuccessStatusCode();
        var lastErrors = await result.Content.ReadFromJsonAsync<List<LastError>>();
        if (lastErrors == null)
        {
            throw new Exception("Failed to parse desk last errors");
        }

        return lastErrors;
    }

    public async Task<Config> SetConfig(string macAddress, Config config)
    {
        var result = await httpClient.PostAsJsonAsync($"desks/{macAddress}/config", config);
        result.EnsureSuccessStatusCode();
        var updatedConfig = await result.Content.ReadFromJsonAsync<Config>();
        if (updatedConfig == null)
        {
            throw new Exception("Failed to parse updated desk config");
        }
        return updatedConfig;
    }

    public async Task<State> SetState(string macAddress, State state)
    {
        var result = await httpClient.PostAsJsonAsync($"desks/{macAddress}/state", state);
        result.EnsureSuccessStatusCode();
        var updatedState = await result.Content.ReadFromJsonAsync<State>();
        if (updatedState == null)
        {
            throw new Exception("Failed to parse updated desk state");
        }
        return updatedState;
    }

    public async Task<Usage> SetUsage(string macAddress, Usage usage)
    {
        var result = await httpClient.PostAsJsonAsync($"desks/{macAddress}/usage", usage);
        result.EnsureSuccessStatusCode();
        var updatedUsage = await result.Content.ReadFromJsonAsync<Usage>();
        if (updatedUsage == null)
        {
            throw new Exception("Failed to parse updated desk usage");
        }
        return updatedUsage;
    }

    public async Task<List<LastError>> SetLastErrors(string macAddress, List<LastError> lastErrors)
    {
        var result = await httpClient.PostAsJsonAsync($"desks/{macAddress}/lastErrors", lastErrors);
        result.EnsureSuccessStatusCode();
        var updatedLastErrors = await result.Content.ReadFromJsonAsync<List<LastError>>();
        if (updatedLastErrors == null)
        {
            throw new Exception("Failed to parse updated desk last errors");
        }
        return updatedLastErrors;
    }
}


public class DeskJsonElement
{
    [JsonPropertyName("config")]
    public Config Config { get; set; }

    [JsonPropertyName("state")]
    public State State { get; set; }

    [JsonPropertyName("usage")]
    public Usage Usage { get; set; }

    [JsonPropertyName("lastErrors")]
    public List<LastError> LastErrors { get; set; }
}

public class Config
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("manufacturer")]
    public string Manufacturer { get; set; }
}

public class State
{
    [JsonPropertyName("position_mm")]
    public int PositionMm { get; set; }

    [JsonPropertyName("speed_mms")]
    public int SpeedMms { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("isPositionLost")]
    public bool IsPositionLost { get; set; }

    [JsonPropertyName("isOverloadProtectionUp")]
    public bool IsOverloadProtectionUp { get; set; }
    
    [JsonPropertyName("isOverloadProtectionDown")]
    public bool IsOverloadProtectionDown { get; set; }

    [JsonPropertyName("isAntiCollision")]
    public bool IsAntiCollision { get; set; }
}

public class Usage
{
    [JsonPropertyName("activationsCounter")]
    public int ActivationsCounter { get; set; }

    [JsonPropertyName("sitStandCounter")]
    public int SitStandCounter { get; set; }
}

public class LastError
{
    [JsonPropertyName("timeS")]
    public int TimeS { get; set; }
    [JsonPropertyName("errorCode")]
    public int ErrorCode { get; set; }
}