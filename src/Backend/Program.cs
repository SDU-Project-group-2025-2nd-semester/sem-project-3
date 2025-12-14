using Backend;
using Backend.Auth;
using Backend.Data.Database;
using Backend.Hubs;
using Backend.Services;
using Backend.Services.DamageReports;
using Backend.Services.DeskApis;
using Backend.Services.Desks;
using Backend.Services.Mqtt;
using Backend.Services.Reservations;
using Backend.Services.Rooms;
using Backend.Services.Statistics;
using Backend.Services.Users;
using Hangfire;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System.Reflection.Metadata;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "Backend API";
        document.Info.Version = "v1";
        document.Info.Description = "API for desk reservation system";

        document.Servers?.Clear();

        // Add cookie authentication security scheme
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes.Add("cookieAuth", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.ApiKey,
            In = ParameterLocation.Cookie,
            Name = IdentityConstants.ApplicationScheme,
            Description = "Cookie-based authentication. Login via /api/auth/login to receive authentication cookie."
        });

        // Apply security globally
        document.SecurityRequirements.Add(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "cookieAuth"
                    }
                },
                Array.Empty<string>()
            }
        });

        return Task.CompletedTask;
    });
});

builder.Services.AddHttpContextAccessor();

// Add Hangfire services
if (IsGeneratingOpenApiDocument())
{
    builder.Services.AddHangfire(config => config
        .UseSimpleAssemblyNameTypeSerializer()
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseRecommendedSerializerSettings()
        .UseInMemoryStorage()
    );

    builder.Services.AddHangfireServer();
}

builder.Services
    .AddTransient<IDamageReportService, DamageReportService>()
    .AddTransient<IReservationService, ReservationService>()
    .AddTransient<IDeskApi, DeskApi>()
    .AddSingleton<IBackendMqttClient, BackendMqttClient>()
    .AddTransient<IRoomService, RoomService>()
    .AddTransient<IDeskControlService, DeskControlService>()
    .AddTransient<IDeskService, DeskService>()
    .AddTransient<IUserService, UserService>()
    .AddTransient<IStatisticsService, StatisticsService>()
    .AddTransient<IReservationScheduler, ReservationScheduler>()
    .AddSignalR(); ;

builder.Services.AddHostedService<MqttHostedService>()
    .AddHostedService<DeskHeightPullingService>()
    .AddHostedService<DeskLedService>();

builder.Services.AddHttpClient("DeskApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["DeskApi:BaseUrl"] ?? "http://box-simulator:8000/api/v2/E9Y2LxT4g1hQZ7aD8nR3mWx5P0qK6pV7/");
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Handle circular references by ignoring cycles
        // This prevents infinite loops when serializing objects with bidirectional relationships
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Really permissive defaults, need to restrict later on
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Get allowed origins from configuration (environment variables)
        var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? ["https://s3-fe-main.michalvalko.eu", "https://s3-fe-int.michalvalko.eu", "https://s3-fe-dev.michalvalko.eu", "http://localhost:5173"
            ];

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddDbContextPool<BackendContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), o =>
    {
        o.ConfigureDataSource(o => o.EnableDynamicJson());
    }));

builder.Services.AddAuthorization();

builder.Services.AddIdentityApiEndpoints<User>()
    .AddEntityFrameworkStores<BackendContext>();

if (builder.Environment.IsDevelopment())
{
    builder.Services.ConfigureApplicationCookie(options =>
    {
        // Allow identity cookie to flow in cross-site contexts (local FE vs hosted BE)
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    });
}

builder.Services.AddHostedService<DatabaseMigrationHostedService>();

var app = builder.Build();

if (IsGeneratingOpenApiDocument())
{
    // Add Hangfire dashboard (optional, for monitoring)
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = [new AllowAllAuthorizationFilter()]
    });

    BackgroundJob.Enqueue(() => Console.WriteLine("Simple!"));
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
    });
}



app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapHub<DeskHub>("/deskHub");

app.Run();