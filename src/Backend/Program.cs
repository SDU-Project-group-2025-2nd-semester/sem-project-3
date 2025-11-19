using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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

builder.Services
    .AddTransient<IDamageReportService, DamageReportService>()
    .AddTransient<IReservationService, ReservationService>()
    .AddTransient<IDeskApi, DeskApi>();

builder.Services.AddHttpClient("DeskApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["DeskApi:BaseUrl"] ?? "http://box-simulator:8000/api/v2/<API-KEY>/");
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddControllers();

builder.Services.AddDbContextPool<BackendContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), o =>
    {
        o.ConfigureDataSource(o => o.EnableDynamicJson());
    }));

builder.Services.AddAuthorization();

builder.Services.AddIdentityApiEndpoints<User>()
    .AddEntityFrameworkStores<BackendContext>();

builder.Services.AddHostedService<DatabaseMigrationHostedService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
