using Backend.Data;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http;

namespace Backend.Services;

public interface IDeskControlService
{
    Task<bool> SetDeskHeightAsync(Guid deskId, int newHeight);
    Task<bool> SetRoomDesksHeightAsync(Guid roomId, int newHeight);
    Task<int?> GetCurrentDeskHeightAsync(string macAddress);
}

public class DeskHeightPullingService(ILogger<DeskHeightPullingService> logger, IHubContext<DeskHub> hubContext, IServiceProvider serviceProvider) : BackgroundService
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
                    // Pass companyId to DeskApi, which will fetch simulator settings from DB
                    var currentState = await deskApi.GetDeskState(desk.MacAddress, desk.CompanyId);
                    if (currentState.PositionMm != desk.Height)
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
                        logger.LogInformation("Pulled and updated height for desk {DeskId} to {Height}mm", desk.Id, currentState.PositionMm);
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
            // Pass companyId to DeskApi, which will fetch simulator settings from DB
            var newState = await deskApi.SetState(desk.MacAddress, new State()
            {
                PositionMm = newHeight,
            }, desk.CompanyId);


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
            // Find desk to get companyId
            var desk = await dbContext.Desks
                .FirstOrDefaultAsync(d => d.MacAddress == macAddress);

            if (desk == null)
            {
                logger.LogWarning("Desk with MAC address {MacAddress} not found", macAddress);
                return null;
            }

            // Pass companyId to DeskApi, which will fetch simulator settings from DB
            var response = await deskApi.GetDeskState(macAddress, desk.CompanyId);

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
    Task<List<string>> GetAllDesks(Guid? companyId = null);
    Task<DeskJsonElement> GetDeskStatus(string macAddress, Guid? companyId = null);
    Task<Config> GetDeskConfig(string macAddress, Guid? companyId = null);
    Task<State> GetDeskState(string macAddress, Guid? companyId = null);
    Task<Usage> GetDeskUsage(string macAddress, Guid? companyId = null);
    Task<List<LastError>> GetDeskLastErrors(string macAddress, Guid? companyId = null);
    Task<Config> SetConfig(string macAddress, Config config, Guid? companyId = null);
    Task<State> SetState(string macAddress, State state, Guid? companyId = null);
    Task<Usage> SetUsage(string macAddress, Usage usage, Guid? companyId = null);
    Task<List<LastError>> SetLastErrors(string macAddress, List<LastError> lastErrors, Guid? companyId = null);
}

public class DeskApi(IHttpClientFactory httpClientFactory, BackendContext dbContext, IHttpContextAccessor httpContextAccessor) : IDeskApi
{
    private readonly HttpClient defaultHttpClient = httpClientFactory.CreateClient("DeskApi");

    private Guid? GetCompanyIdFromContext()
    {
        // Try to get companyId from route data if available (controller calls)
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext?.Request.RouteValues.TryGetValue("companyId", out var routeValue) == true)
        {
            if (Guid.TryParse(routeValue?.ToString(), out var companyId))
            {
                return companyId;
            }
        }
        return null;
    }

    private async Task<HttpClient> GetHttpClientAsync(Guid? companyId)
    {
        // If no companyId provided, try to get it from HttpContext (for controller calls)
        if (companyId == null)
        {
            companyId = GetCompanyIdFromContext();
        }

        // If still no companyId, use default
        if (companyId == null)
        {
            return defaultHttpClient;
        }

        // Fetch company to get simulator settings
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(c => c.Id == companyId);

        // If company not found or no simulator settings, use default
        if (company == null || string.IsNullOrEmpty(company.SimulatorLink))
        {
            return defaultHttpClient;
        }

        // Create a new HttpClient with company-specific settings
        var client = httpClientFactory.CreateClient();
        
        // Ensure the URL ends with / if it doesn't already
        var baseUrl = company.SimulatorLink.EndsWith("/") ? company.SimulatorLink : company.SimulatorLink + "/";
        client.BaseAddress = new Uri(baseUrl);
        client.Timeout = TimeSpan.FromSeconds(10);
        
        // Add API key as header if provided
        if (!string.IsNullOrEmpty(company.SimulatorApiKey))
        {
            client.DefaultRequestHeaders.Add("X-API-Key", company.SimulatorApiKey);
        }
        
        return client;
    }

    public async Task<List<string>> GetAllDesks(Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.GetAsync("desks");

        result.EnsureSuccessStatusCode();

        var desks = await result.Content.ReadFromJsonAsync<List<string>>();

        return desks ?? [];
    }

    public async Task<DeskJsonElement> GetDeskStatus(string macAddress, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.GetAsync($"desk/{macAddress}/status");

        result.EnsureSuccessStatusCode();

        var desk = await result.Content.ReadFromJsonAsync<DeskJsonElement>();

        if (desk == null)
        {
            throw new Exception("Failed to parse desk status");
        }

        return desk;
    }

    public async Task<Config> GetDeskConfig(string macAddress, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.GetAsync($"desk/{macAddress}/config");
        result.EnsureSuccessStatusCode();
        var config = await result.Content.ReadFromJsonAsync<Config>();
        if (config == null)
        {
            throw new Exception("Failed to parse desk config");
        }

        return config;
    }

    public async Task<State> GetDeskState(string macAddress, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.GetAsync($"desk/{macAddress}/state");
        result.EnsureSuccessStatusCode();
        var state = await result.Content.ReadFromJsonAsync<State>();
        if (state == null)
        {
            throw new Exception("Failed to parse desk state");
        }

        return state;
    }

    public async Task<Usage> GetDeskUsage(string macAddress, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.GetAsync($"desk/{macAddress}/usage");
        result.EnsureSuccessStatusCode();
        var usage = await result.Content.ReadFromJsonAsync<Usage>();
        if (usage == null)
        {
            throw new Exception("Failed to parse desk usage");
        }

        return usage;
    }

    public async Task<List<LastError>> GetDeskLastErrors(string macAddress, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.GetAsync($"desk/{macAddress}/lastErrors");
        result.EnsureSuccessStatusCode();
        var lastErrors = await result.Content.ReadFromJsonAsync<List<LastError>>();
        if (lastErrors == null)
        {
            throw new Exception("Failed to parse desk last errors");
        }

        return lastErrors;
    }

    public async Task<Config> SetConfig(string macAddress, Config config, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.PostAsJsonAsync($"desk/{macAddress}/config", config);
        result.EnsureSuccessStatusCode();
        var updatedConfig = await result.Content.ReadFromJsonAsync<Config>();
        if (updatedConfig == null)
        {
            throw new Exception("Failed to parse updated desk config");
        }
        return updatedConfig;
    }

    public async Task<State> SetState(string macAddress, State state, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.PostAsJsonAsync($"desk/{macAddress}/state", state);
        result.EnsureSuccessStatusCode();
        var updatedState = await result.Content.ReadFromJsonAsync<State>();
        if (updatedState == null)
        {
            throw new Exception("Failed to parse updated desk state");
        }
        return updatedState;
    }

    public async Task<Usage> SetUsage(string macAddress, Usage usage, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.PostAsJsonAsync($"desk/{macAddress}/usage", usage);
        result.EnsureSuccessStatusCode();
        var updatedUsage = await result.Content.ReadFromJsonAsync<Usage>();
        if (updatedUsage == null)
        {
            throw new Exception("Failed to parse updated desk usage");
        }
        return updatedUsage;
    }

    public async Task<List<LastError>> SetLastErrors(string macAddress, List<LastError> lastErrors, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
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