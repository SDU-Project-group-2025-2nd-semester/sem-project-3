using Backend.Data;
using Backend.Hubs;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http;
using System.Text.Json.Serialization;

namespace Backend.Services;

// Custom exceptions for simulator-related errors
public class SimulatorConfigurationException : Exception
{
    public SimulatorConfigurationException(string message) : base(message) { }
}

public class SimulatorConnectionException : Exception
{
    public SimulatorConnectionException(string message, Exception? innerException = null) 
        : base(message, innerException) { }
}

public interface IReservationScheduler
{
    Task ScheduleDeskAdjustment(Reservation reservation);
    Task CancelScheduledAdjustment(Guid reservationId);
}

public interface IDeskControlService
{
    Task<bool> SetDeskHeightAsync(Guid deskId, int newHeight);
    Task<bool> SetRoomDesksHeightAsync(Guid roomId, int newHeight);
    Task<int?> GetCurrentDeskHeightAsync(string macAddress);
}

public class ReservationScheduler(
    ILogger<ReservationScheduler> logger,
    IBackgroundJobClient backgroundJobClient,
    BackendContext context) : IReservationScheduler
{
    public async Task ScheduleDeskAdjustment(Reservation reservation)
    {
        var triggerTime = reservation.Start;
        

        if (triggerTime <= DateTime.UtcNow)
        {
            // If reservation starts soon, trigger immediately
            backgroundJobClient.Enqueue<DeskAdjustmentJob>(job => 
                job.AdjustDeskForReservation(reservation.Id));
        }
        else
        {
            // Schedule for future
            string jobId = backgroundJobClient.Schedule<DeskAdjustmentJob>(
                job => job.AdjustDeskForReservation(reservation.Id),
                triggerTime);

            reservation.JobId = jobId;

            await context.SaveChangesAsync();

            logger.LogInformation(
                "Scheduled desk adjustment for reservation {ReservationId} at {TriggerTime} (JobId: {JobId})",
                reservation.Id, triggerTime, jobId);
        }
    }

    public async Task CancelScheduledAdjustment(Guid reservationId)
    {

        var reservation = await context.Reservations.FindAsync(reservationId);

        if (reservation == null || string.IsNullOrEmpty(reservation.JobId))
        {
            logger.LogWarning("No scheduled job found for reservation {ReservationId}", reservationId);
            return;
        }

        BackgroundJob.Delete(reservation.JobId);

        reservation.JobId = null;

        await context.SaveChangesAsync();

        logger.LogInformation("Cancelling scheduled adjustment for reservation {ReservationId}", reservationId);
    }
}


public class DeskAdjustmentJob(
    ILogger<DeskAdjustmentJob> logger,
    IServiceProvider serviceProvider)
{
    public async Task AdjustDeskForReservation(Guid reservationId)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BackendContext>();
        var deskControlService = scope.ServiceProvider.GetRequiredService<IDeskControlService>();

        var reservation = await dbContext.Reservations
            .Include(r => r.User)
            .Include(r => r.Desk)
            .FirstOrDefaultAsync(r => r.Id == reservationId);

        if (reservation == null)
        {
            logger.LogWarning("Reservation {ReservationId} not found", reservationId);
            return;
        }

        try
        {
            int targetHeight = (int)reservation.User.SittingHeight;

            var success = await deskControlService.SetDeskHeightAsync(
                reservation.Desk.Id, 
                targetHeight);

            if (success)
            {
                logger.LogInformation(
                    "Auto-adjusted desk {DeskId} to {Height}mm for reservation {ReservationId}",
                    reservation.Desk.Id, targetHeight, reservationId);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, 
                "Error auto-adjusting desk for reservation {ReservationId}", reservationId);
        }
    }
}

public class DeskLedService(ILogger<DeskHeightPullingService> logger, IHubContext<DeskHub> hubContext, IServiceProvider serviceProvider, IBackendMqttClient mqttClient) : BackgroundService
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
                    bool isOccupied = await dbContext.Reservations
                        .AnyAsync(r => r.DeskId == desk.Id &&
                                       r.Start <= DateTime.UtcNow &&
                                       r.End >= DateTime.UtcNow, stoppingToken);

                    if (isOccupied)
                    {
                        await mqttClient.SendMessage("red", $"{desk.RpiMacAddress}/led");
                    }
                    else
                    {
                        await mqttClient.SendMessage("green", $"{desk.RpiMacAddress}/led");
                    }

                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error setting LED for desk {DeskId}", desk.Id);
                }
            }
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
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
                    // Pass companyId to DeskApi, which will fetch simulator settings from DB
                    var currentState = await deskApi.GetDeskState(desk.MacAddress, desk.CompanyId);

                    desk.Metadata.IsOverloadProtectionDown = currentState.IsOverloadProtectionDown;
                    desk.Metadata.IsAntiCollision = currentState.IsAntiCollision;
                    desk.Metadata.IsOverloadProtectionUp = currentState.IsOverloadProtectionUp;
                    desk.Metadata.Status = currentState.Status;
                    desk.Metadata.IsPositionLost = currentState.IsPositionLost;

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


        foreach (Desk desk in desks)
        {
            if (!await SetDeskHeightAsync(desk.Id, newHeight))
            {
                return false;
            }
        }

        return true;
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

        // If still no companyId, throw error
        if (companyId == null)
        {
            throw new InvalidOperationException(
                "CompanyId is required but could not be determined. " +
                "Either provide companyId as a parameter or ensure the request is made from a controller with companyId in the route.");
        }

        // Fetch company to get simulator settings
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(c => c.Id == companyId);

        // If company not found, throw error
        if (company == null)
        {
            throw new InvalidOperationException(
                $"Company with ID {companyId} was not found in the database.");
        }

        // If company has no simulator settings, throw error
        if (string.IsNullOrEmpty(company.SimulatorLink))
        {
            throw new SimulatorConfigurationException(
                $"Company '{company.Name}' does not have a WiFi2BLE link configured. " +
                "Please configure the simulator settings via the Company settings page.");
        }

        // If company has no API key, throw error
        if (string.IsNullOrEmpty(company.SimulatorApiKey))
        {
            throw new SimulatorConfigurationException(
                $"Company '{company.Name}' does not have a WiFi2BLE API key configured. " +
                "Please configure the simulator settings via the Company settings page.");
        }

        // Create a new HttpClient with company-specific settings
        var client = httpClientFactory.CreateClient();
        
        // Build base URL with API path prefix: <simulator_link>/api/v2/<api_key>/
        // Simulator API expects: /api/v2/<api_key>/<endpoint>
        var baseUrl = company.SimulatorLink.TrimEnd('/');
        var fullBaseUrl = $"{baseUrl}/api/v2/{company.SimulatorApiKey}/";
        client.BaseAddress = new Uri(fullBaseUrl);
        client.Timeout = TimeSpan.FromSeconds(10);
        
        return client;
    }

    public async Task<List<string>> GetAllDesks(Guid? companyId = null)
    {
        try
        {
            var httpClient = await GetHttpClientAsync(companyId);
            var result = await httpClient.GetAsync("desks");

            if (!result.IsSuccessStatusCode)
            {
                await HandleHttpError(result, "Failed to retrieve desks from WiFi2BLE Box");
            }

            result.EnsureSuccessStatusCode();

            var desks = await result.Content.ReadFromJsonAsync<List<string>>();

            return desks ?? [];
        }
        catch (HttpRequestException ex) when (ex.InnerException is System.Net.Sockets.SocketException)
        {
            throw new SimulatorConnectionException(
                "Unable to connect to the WiFi2BLE Box. Please check that the WiFi2BLE Box link is correct and the WiFi2BLE Box is running.",
                ex);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            throw new SimulatorConnectionException(
                "Connection to the WiFi2BLE Box timed out. Please check that the WiFi2BLE Box is running and accessible.",
                ex);
        }
    }

    private async Task HandleHttpError(HttpResponseMessage response, string baseMessage)
    {
        var statusCode = response.StatusCode;
        var content = await response.Content.ReadAsStringAsync();
        
        string errorMessage = statusCode switch
        {
            HttpStatusCode.Unauthorized => "Invalid API key. Please check your WiFi2BLE Box API key configuration.",
            HttpStatusCode.Forbidden => "Access denied by the WiFi2BLE Box. Please check your API key permissions.",
            HttpStatusCode.NotFound => "WiFi2BLE Box endpoint not found. Please check that the WiFi2BLE Box link is correct.",
            HttpStatusCode.BadGateway => "Bad gateway to WiFi2BLE Box. The WiFi2BLE Box may be unreachable.",
            HttpStatusCode.ServiceUnavailable => "WiFi2BLE Box service is unavailable. Please check that the WiFi2BLE Box is running.",
            _ => $"{baseMessage}. Status: {statusCode}, Response: {content}"
        };
        
        throw new SimulatorConnectionException(errorMessage);
    }

    public async Task<DeskJsonElement> GetDeskStatus(string macAddress, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.GetAsync($"desks/{macAddress}/status");

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
        var result = await httpClient.GetAsync($"desks/{macAddress}/config");
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
        try
        {
            var httpClient = await GetHttpClientAsync(companyId);
            var result = await httpClient.GetAsync($"desks/{macAddress}/state");
            
            if (!result.IsSuccessStatusCode)
            {
                await HandleHttpError(result, $"Failed to retrieve desk state for {macAddress}");
            }
            
            result.EnsureSuccessStatusCode();
            var state = await result.Content.ReadFromJsonAsync<State>();
            if (state == null)
            {
                throw new Exception("Failed to parse desk state");
            }

            return state;
        }
        catch (HttpRequestException ex) when (ex.InnerException is System.Net.Sockets.SocketException)
        {
            throw new SimulatorConnectionException(
                "Unable to connect to the simulator. Please check that the simulator link is correct and the simulator is running.",
                ex);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            throw new SimulatorConnectionException(
                "Connection to the simulator timed out. Please check that the simulator is running and accessible.",
                ex);
        }
    }

    public async Task<Usage> GetDeskUsage(string macAddress, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.GetAsync($"desks/{macAddress}/usage");
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
        var result = await httpClient.GetAsync($"desks/{macAddress}/lastErrors");
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
        var result = await httpClient.PutAsJsonAsync($"desks/{macAddress}/config", config);
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
        try
        {
            var httpClient = await GetHttpClientAsync(companyId);
            var result = await httpClient.PutAsJsonAsync($"desks/{macAddress}/state", state);
            
            if (!result.IsSuccessStatusCode)
            {
                await HandleHttpError(result, $"Failed to set desk state for {macAddress}");
            }
            
            result.EnsureSuccessStatusCode();
            var updatedState = await result.Content.ReadFromJsonAsync<State>();
            if (updatedState == null)
            {
                throw new Exception("Failed to parse updated desk state");
            }
            return updatedState;
        }
        catch (HttpRequestException ex) when (ex.InnerException is System.Net.Sockets.SocketException)
        {
            throw new SimulatorConnectionException(
                "Unable to connect to the simulator. Please check that the simulator link is correct and the simulator is running.",
                ex);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            throw new SimulatorConnectionException(
                "Connection to the simulator timed out. Please check that the simulator is running and accessible.",
                ex);
        }
    }

    public async Task<Usage> SetUsage(string macAddress, Usage usage, Guid? companyId = null)
    {
        var httpClient = await GetHttpClientAsync(companyId);
        var result = await httpClient.PutAsJsonAsync($"desks/{macAddress}/usage", usage);
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
        var result = await httpClient.PutAsJsonAsync($"desks/{macAddress}/lastErrors", lastErrors);
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

public class DeskMetadata
{
    public Config Config { get; set; }

    public Usage Usage { get; set; }

    public List<LastError> LastErrors { get; set; }

    public string Status { get; set; }

    public bool IsPositionLost { get; set; }

    public bool IsOverloadProtectionUp { get; set; }
    
    public bool IsOverloadProtectionDown { get; set; }

    public bool IsAntiCollision { get; set; }
}