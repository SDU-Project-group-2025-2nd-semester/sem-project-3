//using Backend.Data;
//using Backend.Hubs;
//using Microsoft.AspNetCore.SignalR;
//using Microsoft.EntityFrameworkCore;

//namespace Backend.Services;

//public class DeskControlService(
//    BackendContext context,
//    IHttpClientFactory httpClientFactory,
//    ILogger<DeskControlService> logger,
//    IHubContext<DeskHub> hubContext)
//    : IDeskControlService
//{
//    public async Task<bool> SetDeskHeightAsync(Guid deskId, double newHeight)
//    {
//        var desk = await context.Desks
//            .Include(d => d.Room)
//            .Include(d => d.Company)
//            .FirstOrDefaultAsync(d => d.Id == deskId);

//        if (desk == null)
//        {
//            logger.LogWarning("Desk {DeskId} not found", deskId);
//            return false;
//        }

//        if (newHeight < desk.MinHeight || newHeight > desk.MaxHeight)
//        {
//            logger.LogWarning(
//                "Invalid height {Height} for desk {DeskId}. Must be between {Min} and {Max}",
//                newHeight, deskId, desk.MinHeight, desk.MaxHeight);
//            return false;
//        }

//        try
//        {
//            // Call external API
//            var success = await CallExternalDeskApiAsync(deskId, newHeight);

//            if (!success)
//            {
//                logger.LogError("External API call failed for desk {DeskId}", deskId);
//                return false;
//            }

//            // Update database
//            var oldHeight = desk.Height;
//            desk.Height = newHeight;
//            await context.SaveChangesAsync();

//            // Notify clients via SignalR
//            await NotifyDeskHeightChanged(desk, oldHeight, newHeight);

//            logger.LogInformation("Desk {DeskId} height changed to {Height}cm", deskId, newHeight);
//            return true;
//        }
//        catch (Exception ex)
//        {
//            logger.LogError(ex, "Error changing height for desk {DeskId}", deskId);
//            return false;
//        }
//    }

//    public async Task<bool> SetRoomDesksHeightAsync(Guid roomId, double newHeight)
//    {
//        var desks = await context.Desks
//            .Where(d => d.RoomId == roomId)
//            .ToListAsync();

//        var tasks = desks.Select(desk => SetDeskHeightAsync(desk.Id, newHeight));
//        var results = await Task.WhenAll(tasks);

//        return results.All(r => r);
//    }

//    public async Task<double?> GetCurrentDeskHeightAsync(Guid deskId)
//    {
//        var httpClient = httpClientFactory.CreateClient("DeskApi");

//        try
//        {
//            var response = await httpClient.GetAsync($"/api/desk/{deskId}/height");

//            if (!response.IsSuccessStatusCode)
//                return null;

//            var result = await response.Content.ReadFromJsonAsync<DeskHeightResponse>();
//            return result?.Height;
//        }
//        catch (Exception ex)
//        {
//            logger.LogError(ex, "Error getting height for desk {DeskId}", deskId);
//            return null;
//        }
//    }

//    public async Task SyncDeskHeightAsync(Guid deskId)
//    {
//        var currentHeight = await GetCurrentDeskHeightAsync(deskId);

//        if (currentHeight == null)
//            return;

//        var desk = await context.Desks
//            .Include(d => d.Room)
//            .Include(d => d.Company)
//            .FirstOrDefaultAsync(d => d.Id == deskId);

//        if (desk == null)
//            return;

//        var oldHeight = desk.Height;

//        // Only update if height has changed
//        if (Math.Abs(desk.Height - currentHeight.Value) > 0.1) // Tolerance for floating point comparison
//        {
//            desk.Height = currentHeight.Value;
//            await context.SaveChangesAsync();

//            // Notify clients
//            await NotifyDeskHeightChanged(desk, oldHeight, currentHeight.Value);

//            logger.LogInformation(
//                "Desk {DeskId} height synced from {OldHeight}cm to {NewHeight}cm",
//                deskId, oldHeight, currentHeight.Value);
//        }
//    }

//    private async Task<bool> CallExternalDeskApiAsync(Guid deskId, double height)
//    {
//        var httpClient = httpClientFactory.CreateClient("DeskApi");

//        var request = new
//        {
//            deskId = deskId.ToString(),
//            height = height
//        };

//        try
//        {
//            var response = await httpClient.PostAsJsonAsync("/api/desk/set-height", request);
//            return response.IsSuccessStatusCode;
//        }
//        catch (HttpRequestException ex)
//        {
//            logger.LogError(ex, "HTTP error calling desk API for {DeskId}", deskId);
//            return false;
//        }
//    }

//    private async Task NotifyDeskHeightChanged(Desk desk, double oldHeight, double newHeight)
//    {
//        var update = new DeskHeightUpdate
//        {
//            DeskId = desk.Id,
//            RoomId = desk.RoomId,
//            CompanyId = desk.CompanyId,
//            OldHeight = oldHeight,
//            NewHeight = newHeight,
//            Timestamp = DateTime.UtcNow
//        };

//        // Send to all clients watching this specific desk
//        await hubContext.Clients
//            .Group($"desk-{desk.Id}")
//            .SendAsync("DeskHeightChanged", update);

//        // Send to all clients watching this room
//        await hubContext.Clients
//            .Group($"room-{desk.RoomId}")
//            .SendAsync("DeskHeightChanged", update);

//        // Send to all clients watching this company
//        await hubContext.Clients
//            .Group($"company-{desk.CompanyId}")
//            .SendAsync("DeskHeightChanged", update);
//    }
//}

//public record DeskHeightResponse(double Height);

//public class DeskHeightUpdate
//{
//    public Guid DeskId { get; set; }
//    public Guid RoomId { get; set; }
//    public Guid CompanyId { get; set; }
//    public double OldHeight { get; set; }
//    public double NewHeight { get; set; }
//    public DateTime Timestamp { get; set; }
//}
//public interface IDeskControlService
//{
//    /// <summary>
//    /// Changes the desk height both in the database and via the external API
//    /// </summary>
//    Task<bool> SetDeskHeightAsync(Guid deskId, double newHeight);

//    /// <summary>
//    /// Changes height for all desks in a room
//    /// </summary>
//    Task<bool> SetRoomDesksHeightAsync(Guid roomId, double newHeight);

//    /// <summary>
//    /// Gets current desk height from external API
//    /// </summary>
//    Task<double?> GetCurrentDeskHeightAsync(Guid deskId);

//    /// <summary>
//    /// Synchronizes desk height from external API to database
//    /// </summary>
//    Task SyncDeskHeightAsync(Guid deskId);
//}

namespace Backend.Services;

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

public class DeskApi(HttpClient httpClient) : IDeskApi
{
    public async Task<List<string>> GetAllDesks()
    {
        var result = await httpClient.GetAsync("desks");

        result.EnsureSuccessStatusCode();

        var desks = await result.Content.ReadFromJsonAsync<List<string>>();

        return desks ?? [];
    }

    public async Task<DeskJsonElement> GetDeskStatus(string macAddress)
    {
        var result = await httpClient.GetAsync($"desk/{macAddress}/status");

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
        var result = await httpClient.GetAsync($"desk/{macAddress}/config");
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
        var result = await httpClient.GetAsync($"desk/{macAddress}/state");
        result.EnsureSuccessStatusCode();
        var state = await result.Content.ReadFromJsonAsync<State>();
        if (state == null)
        {
            throw new Exception("Failed to parse desk state");
        }

        return state;
    }

    public async Task<Usage> GetDeskUsage(string macAddress)
    {
        var result = await httpClient.GetAsync($"desk/{macAddress}/usage");
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
        var result = await httpClient.GetAsync($"desk/{macAddress}/lastErrors");
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
        var result = await httpClient.PostAsJsonAsync($"desk/{macAddress}/config", config);
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
        var result = await httpClient.PostAsJsonAsync($"desk/{macAddress}/state", state);
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
        var result = await httpClient.PostAsJsonAsync($"desk/{macAddress}/usage", usage);
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
        var result = await httpClient.PostAsJsonAsync($"desk/{macAddress}/lastErrors", lastErrors);
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
    public Config Config { get; set; }
    public State State { get; set; }
    public Usage Usage { get; set; }
    public List<LastError> LastErrors { get; set; }
}

public class Config
{
    public string Name { get; set; }
    public string Manufacturer { get; set; }
}

public class State
{
    public int PositionMm { get; set; }
    public int SpeedMms { get; set; }
    public string Status { get; set; }
    public bool IsPositionLost { get; set; }
    public bool IsOverloadProtectionUp { get; set; }
    public bool IsOverloadProtectionDown { get; set; }
    public bool IsAntiCollision { get; set; }
}

public class Usage
{
    public int ActivationsCounter { get; set; }
    public int SitStandCounter { get; set; }
}

public class LastError
{
    public int TimeS { get; set; }
    public int ErrorCode { get; set; }
}