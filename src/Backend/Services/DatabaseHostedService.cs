using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Numerics;

namespace Backend.Services;

public class DatabaseMigrationHostedService(
    IServiceProvider serviceProvider,
    ILogger<DatabaseMigrationHostedService> logger,
    IHostEnvironment environment) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {

        // Skip migrations during OpenAPI document generation
        if (IsGeneratingOpenApiDocument())
        {
            logger.LogInformation("Skipping database migrations during OpenAPI document generation.");
            return;
        }

        using var scope = serviceProvider.CreateScope();

        var applicationDbContext = scope.ServiceProvider.GetRequiredService<BackendContext>();

        await applicationDbContext.Database.MigrateAsync(cancellationToken);

        logger.LogInformation("Database migrations completed successfully.");

        if (environment.IsDevelopment())
        {
            //await MockDatabaseAsync(giglDbContext);
        }
    }

    private static bool IsGeneratingOpenApiDocument()
    {
        var aspnetcoreEnvironment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        var isSwaggerGen = Environment.GetEnvironmentVariable("ASPNETCORE_HOSTINGSTARTUPASSEMBLIES")
            ?.Contains("Microsoft.AspNetCore.OpenApi") == true;
            
        // Check if running in a context that suggests OpenAPI generation
        return Environment.GetCommandLineArgs().Any(arg => 
            arg.Contains("swagger", StringComparison.OrdinalIgnoreCase) ||
            arg.Contains("openapi", StringComparison.OrdinalIgnoreCase));
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}