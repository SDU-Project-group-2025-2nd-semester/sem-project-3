using Backend.Data.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Testcontainers.PostgreSql;

namespace Backend.Tests;

// Collection definition for sharing the database container
[CollectionDefinition("Database collection")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture>
{
}

// Shared fixture that creates a single PostgreSQL container
public class DatabaseFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgreSqlContainer = new PostgreSqlBuilder()
        .WithImage("postgres:latest")
        .Build();

    public string ConnectionString { get; private set; } = string.Empty;
    private bool _isDatabaseCreated = false;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public BackendContext DbContext { get; private set; } = null!;

    public BackendDbContextFactory DbContextFactory { get; private set; } = null!;

    public ILoggerFactory LoggerFactory { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await _postgreSqlContainer.StartAsync();
        ConnectionString = _postgreSqlContainer.GetConnectionString();

        var dbContextOptions = new DbContextOptionsBuilder<BackendContext>()
            .UseNpgsql(ConnectionString, o =>
            {
                o.ConfigureDataSource(o =>
                {
                    o.EnableDynamicJson();
                });
            })
            .Options;

        DbContextFactory = new BackendDbContextFactory(dbContextOptions);
        DbContext = DbContextFactory.CreateDbContext();

        LoggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder =>
        {
            builder.AddConsole();
        });

        await EnsureDatabaseCreatedAsync(DbContext);
    }

    public async Task DisposeAsync()
    {
        LoggerFactory?.Dispose();
        await _postgreSqlContainer.StopAsync();
    }

    public async Task EnsureDatabaseCreatedAsync(BackendContext context)
    {
        if (!_isDatabaseCreated)
        {
            await _lock.WaitAsync();
            try
            {
                if (!_isDatabaseCreated)
                {
                    await context.Database.EnsureCreatedAsync();
                    _isDatabaseCreated = true;
                }
            }
            finally
            {
                _lock.Release();
            }
        }
    }
}


public class BackendDbContextFactory(DbContextOptions<BackendContext> options) : IDbContextFactory<BackendContext>
{
    public BackendContext CreateDbContext() => new(options);
}
