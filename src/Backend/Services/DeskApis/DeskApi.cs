using Backend.Data.Database;
using Backend.Data.DeskJsonApi;
using System.Net;

namespace Backend.Services.DeskApis;

public class DeskApi(IHttpClientFactory httpClientFactory, BackendContext dbContext, IHttpContextAccessor httpContextAccessor) : IDeskApi
{

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