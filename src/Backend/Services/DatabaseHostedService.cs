using Backend.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

        await applicationDbContext.Database.EnsureDeletedAsync(cancellationToken);

        await applicationDbContext.Database.EnsureCreatedAsync(cancellationToken);

        logger.LogInformation("Database migrations completed successfully.");

        if (environment.IsDevelopment())
        {
            await SeedDatabaseAsync(applicationDbContext, scope.ServiceProvider);
        }
    }

    private async Task SeedDatabaseAsync(BackendContext context, IServiceProvider sp)
    {
        var userManager = sp.GetRequiredService<UserManager<User>>();

        // Check if database is already seeded
        if (await context.Companies.AnyAsync())
        {
            logger.LogInformation("Database already seeded. Skipping seed data creation.");
            return;
        }

        logger.LogInformation("Starting database seeding...");

        // Create Companies
        var techCoWorkingCompany = new Company
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Tech Co-Working Space",
            SecretInviteCode = "TECH2024",
            Rooms = []
        };

        var innovationHubCompany = new Company
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Innovation Hub",
            SecretInviteCode = "INNOVATE",
            Rooms = []
        };

        var startupCenterCompany = new Company
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Startup Center",
            SecretInviteCode = null, // Email verification required
            Rooms = []
        };

        context.Companies.AddRange(techCoWorkingCompany, innovationHubCompany, startupCenterCompany);
        await context.SaveChangesAsync();

        // Create Users
        var adminUser = new User
        {
            Id = "a1111111-1111-1111-1111-111111111111",
            UserName = "admin@techcoworking.com",
            Email = "admin@techcoworking.com",
            EmailConfirmed = true,
            FirstName = "Admin",
            LastName = "User",
            StandingHeight = 750.0,
            SittingHeight = 650.0,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-6),
            Reservations = []
        };
        await userManager.CreateAsync(adminUser, "Admin123!");

        var johnDoe = new User
        {
            Id = "b1111111-1111-1111-1111-111111111111",
            UserName = "john.doe@techcoworking.com",
            Email = "john.doe@techcoworking.com",
            EmailConfirmed = true,
            FirstName = "John",
            LastName = "Doe",
            StandingHeight = 720.0,
            SittingHeight = 630.0,
            HealthRemindersFrequency = HealthRemindersFrequency.High,
            SittingTime = 25,
            StandingTime = 10,
            AccountCreation = DateTime.UtcNow.AddMonths(-3),
            Reservations = []
        };
        await userManager.CreateAsync(johnDoe, "JohnDoe123!");

        var janeDoe = new User
        {
            Id = "c1111111-1111-1111-1111-111111111111",
            UserName = "jane.doe@techcoworking.com",
            Email = "jane.doe@techcoworking.com",
            EmailConfirmed = true,
            FirstName = "Jane",
            LastName = "Doe",
            StandingHeight = 680.0,
            SittingHeight = 600.0,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-2),
            Reservations = []
        };
        await userManager.CreateAsync(janeDoe, "JaneDoe123!");

        var bobSmith = new User
        {
            Id = "d1111111-1111-1111-1111-111111111111",
            UserName = "bob.smith@innovationhub.com",
            Email = "bob.smith@innovationhub.com",
            EmailConfirmed = true,
            FirstName = "Bob",
            LastName = "Smith",
            StandingHeight = 740.0,
            SittingHeight = 650.0,
            HealthRemindersFrequency = HealthRemindersFrequency.Low,
            SittingTime = 45,
            StandingTime = 20,
            AccountCreation = DateTime.UtcNow.AddMonths(-4),
            Reservations = []
        };
        await userManager.CreateAsync(bobSmith, "BobSmith123!");

        var aliceJohnson = new User
        {
            Id = "e1111111-1111-1111-1111-111111111111",
            UserName = "alice.johnson@startupcenter.com",
            Email = "alice.johnson@startupcenter.com",
            EmailConfirmed = true,
            FirstName = "Alice",
            LastName = "Johnson",
            StandingHeight = 700.0,
            SittingHeight = 620.0,
            HealthRemindersFrequency = HealthRemindersFrequency.High,
            SittingTime = 20,
            StandingTime = 10,
            AccountCreation = DateTime.UtcNow.AddMonths(-1),
            Reservations = []
        };
        await userManager.CreateAsync(aliceJohnson, "AliceJohnson123!");

        var staffUser = new User
        {
            Id = "f1111111-1111-1111-1111-111111111111",
            UserName = "staff@techcoworking.com",
            Email = "staff@techcoworking.com",
            EmailConfirmed = true,
            FirstName = "Staff",
            LastName = "Staffy",
            StandingHeight = 750.0,
            SittingHeight = 650.0,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-6),
            Reservations = []
        };
        await userManager.CreateAsync(staffUser, "Staff123!");

        await context.SaveChangesAsync();

        // Create Users-Company Relations

        context.UserCompanies.AddRange(
            new UserCompany
            {
                UserId = adminUser.Id,
                CompanyId = techCoWorkingCompany.Id,
                Role = UserRole.Admin
            },
            new UserCompany
            {
                UserId = staffUser.Id,
                CompanyId = techCoWorkingCompany.Id,
                Role = UserRole.Janitor
            },
            new UserCompany
            {
                UserId = johnDoe.Id,
                CompanyId = techCoWorkingCompany.Id,
                Role = UserRole.User
            },
            new UserCompany
            {
                UserId = janeDoe.Id,
                CompanyId = techCoWorkingCompany.Id,
                Role = UserRole.User
            },
            new UserCompany
            {
                UserId = bobSmith.Id,
                CompanyId = innovationHubCompany.Id,
                Role = UserRole.User
            },
            new UserCompany
            {
                UserId = aliceJohnson.Id,
                CompanyId = startupCenterCompany.Id,
                Role = UserRole.User
            }
        );

        await context.SaveChangesAsync();

        // Create Rooms
        var room1Company1 = new Rooms
        {
            Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
            CompanyId = techCoWorkingCompany.Id,
            OpeningHours = new OpeningHours
            {
                OpeningTime = new TimeOnly(8, 0),
                ClosingTime = new TimeOnly(18, 0),
                DaysOfTheWeek = DaysOfTheWeek.Monday | DaysOfTheWeek.Tuesday | DaysOfTheWeek.Wednesday |
                                DaysOfTheWeek.Thursday | DaysOfTheWeek.Friday
            },
            DeskIds = [],
            Desks = [],
            ReadableId = "R-1"
        };

        var room2Company1 = new Rooms
        {
            Id = Guid.Parse("a2222222-2222-2222-2222-222222222222"),
            CompanyId = techCoWorkingCompany.Id,
            OpeningHours = new OpeningHours
            {
                OpeningTime = new TimeOnly(7, 0),
                ClosingTime = new TimeOnly(20, 0),
                DaysOfTheWeek = DaysOfTheWeek.Monday | DaysOfTheWeek.Tuesday | DaysOfTheWeek.Wednesday |
                                DaysOfTheWeek.Thursday | DaysOfTheWeek.Friday | DaysOfTheWeek.Saturday
            },
            DeskIds = [],
            Desks = [],
            ReadableId = "R-2"
        };

        var room1Company2 = new Rooms
        {
            Id = Guid.Parse("b1111111-1111-1111-1111-111111111111"),
            CompanyId = innovationHubCompany.Id,
            OpeningHours = new OpeningHours
            {
                OpeningTime = new TimeOnly(9, 0),
                ClosingTime = new TimeOnly(17, 0),
                DaysOfTheWeek = DaysOfTheWeek.Monday | DaysOfTheWeek.Tuesday | DaysOfTheWeek.Wednesday |
                                DaysOfTheWeek.Thursday | DaysOfTheWeek.Friday
            },
            DeskIds = [],
            Desks = [],
            ReadableId = "R-1"
        };

        var room1Company3 = new Rooms
        {
            Id = Guid.Parse("c1111111-1111-1111-1111-111111111111"),
            CompanyId = startupCenterCompany.Id,
            OpeningHours = new OpeningHours
            {
                OpeningTime = new TimeOnly(0, 0),
                ClosingTime = new TimeOnly(23, 59),
                DaysOfTheWeek = DaysOfTheWeek.Monday | DaysOfTheWeek.Tuesday | DaysOfTheWeek.Wednesday |
                                DaysOfTheWeek.Thursday | DaysOfTheWeek.Friday | DaysOfTheWeek.Saturday | DaysOfTheWeek.Sunday
            },
            DeskIds = [],
            Desks = [],
            ReadableId = "R-1"
        };

        context.Rooms.AddRange(room1Company1, room2Company1, room1Company2, room1Company3);
        await context.SaveChangesAsync();

        // Create Desks
        var desks = new List<Desk>
        {
            // Tech Co-Working Space - Room 1
            new Desk
            {
                Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
                Height = 700,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "AA:BB:CC:DD:EE:01",
                RoomId = room1Company1.Id,
                CompanyId = techCoWorkingCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-101"
            },
            new Desk
            {
                Id = Guid.Parse("d1111111-2222-2222-2222-222222222222"),
                Height = 650,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "AA:BB:CC:DD:EE:02",
                RoomId = room1Company1.Id,
                CompanyId = techCoWorkingCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-102"
            },
            new Desk
            {
                Id = Guid.Parse("d1111111-3333-3333-3333-333333333333"),
                Height = 720,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "AA:BB:CC:DD:EE:03",
                RoomId = room1Company1.Id,
                CompanyId = techCoWorkingCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-103"
            },
            // Tech Co-Working Space - Room 2
            new Desk
            {
                Id = Guid.Parse("d2222222-1111-1111-1111-111111111111"),
                Height = 680,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "AA:BB:CC:DD:EE:04",
                RoomId = room2Company1.Id,
                CompanyId = techCoWorkingCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-201"
            },
            new Desk
            {
                Id = Guid.Parse("d2222222-2222-2222-2222-222222222222"),
                Height = 710,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "AA:BB:CC:DD:EE:05",
                RoomId = room2Company1.Id,
                CompanyId = techCoWorkingCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-202"
            },
            // Innovation Hub - Room 1
            new Desk
            {
                Id = Guid.Parse("db111111-1111-1111-1111-111111111111"),
                Height = 700,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "BB:CC:DD:EE:FF:01",
                RoomId = room1Company2.Id,
                CompanyId = innovationHubCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-101"
            },
            new Desk
            {
                Id = Guid.Parse("db111111-2222-2222-2222-222222222222"),
                Height = 730,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "BB:CC:DD:EE:FF:02",
                RoomId = room1Company2.Id,
                CompanyId = innovationHubCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-102"
            },
            // Startup Center - Room 1
            new Desk
            {
                Id = Guid.Parse("dc111111-1111-1111-1111-111111111111"),
                Height = 690,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "CC:DD:EE:FF:AA:01",
                RoomId = room1Company3.Id,
                CompanyId = startupCenterCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-101"
            },
            new Desk
            {
                Id = Guid.Parse("dc111111-2222-2222-2222-222222222222"),
                Height = 705,
                MinHeight = 600,
                MaxHeight = 1200,
                MacAddress = "CC:DD:EE:FF:AA:02",
                RoomId = room1Company3.Id,
                CompanyId = startupCenterCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-102"
            }
        };

        context.Desks.AddRange(desks);
        await context.SaveChangesAsync();

        // Create Reservations
        var now = DateTime.UtcNow;
        var reservations = new List<Reservation>
        {
            // Past reservation
            new Reservation
            {
                Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
                Start = now.AddDays(-7).Date.AddHours(9),
                End = now.AddDays(-7).Date.AddHours(17),
                UserId = johnDoe.Id,
                DeskId = desks[0].Id,
                CompanyId = techCoWorkingCompany.Id
            },
            // Current/Today reservation
            new Reservation
            {
                Id = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
                Start = now.Date.AddHours(8),
                End = now.Date.AddHours(16),
                UserId = johnDoe.Id,
                DeskId = desks[0].Id,
                CompanyId = techCoWorkingCompany.Id
            },
            // Future reservations
            new Reservation
            {
                Id = Guid.Parse("c3333333-3333-3333-3333-333333333333"),
                Start = now.AddDays(1).Date.AddHours(9),
                End = now.AddDays(1).Date.AddHours(17),
                UserId = janeDoe.Id,
                DeskId = desks[1].Id,
                CompanyId = techCoWorkingCompany.Id
            },
            new Reservation
            {
                Id = Guid.Parse("d4444444-4444-4444-4444-444444444444"),
                Start = now.AddDays(2).Date.AddHours(10),
                End = now.AddDays(2).Date.AddHours(15),
                UserId = johnDoe.Id,
                DeskId = desks[2].Id,
                CompanyId = techCoWorkingCompany.Id
            },
            new Reservation
            {
                Id = Guid.Parse("e5555555-5555-5555-5555-555555555555"),
                Start = now.AddDays(3).Date.AddHours(9),
                End = now.AddDays(3).Date.AddHours(18),
                UserId = bobSmith.Id,
                DeskId = desks[5].Id,
                CompanyId = innovationHubCompany.Id
            },
            new Reservation
            {
                Id = Guid.Parse("f6666666-6666-6666-6666-666666666666"),
                Start = now.AddDays(5).Date.AddHours(8),
                End = now.AddDays(5).Date.AddHours(12),
                UserId = aliceJohnson.Id,
                DeskId = desks[7].Id,
                CompanyId = startupCenterCompany.Id
            },
            new Reservation
            {
                Id = Guid.Parse("a6666666-6666-6666-6666-666666666666"),
                Start = now.AddDays(2).Date.AddHours(8),
                End = now.AddDays(2).Date.AddHours(12),
                UserId = johnDoe.Id,
                DeskId = desks[1].Id,
                CompanyId = techCoWorkingCompany.Id
            }
        };

        context.Reservations.AddRange(reservations);
        await context.SaveChangesAsync();

        // Create Damage Reports
        var damageReports = new List<DamageReport>
        {
            // Unresolved damage report
            new DamageReport
            {
                Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
                Description = "The desk height adjustment button is stuck and won't respond to presses.",
                SubmitTime = now.AddDays(-5),
                IsResolved = false,
                SubmittedById = johnDoe.Id,
                DeskId = desks[0].Id,
                CompanyId = techCoWorkingCompany.Id
            },
            // Resolved damage report
            new DamageReport
            {
                Id = Guid.Parse("b1111111-1111-1111-1111-111111111111"),
                Description = "Desk surface has a scratch on the left side.",
                SubmitTime = now.AddDays(-10),
                ResolveTime = now.AddDays(-3),
                IsResolved = true,
                SubmittedById = janeDoe.Id,
                ResolvedById = adminUser.Id,
                DeskId = desks[1].Id,
                CompanyId = techCoWorkingCompany.Id
            },
            // Another unresolved issue
            new DamageReport
            {
                Id = Guid.Parse("c1111111-1111-1111-1111-111111111111"),
                Description = "BLE connection keeps disconnecting. Might need battery replacement.",
                SubmitTime = now.AddDays(-2),
                IsResolved = false,
                SubmittedById = bobSmith.Id,
                DeskId = desks[5].Id,
                CompanyId = innovationHubCompany.Id
            },
            // Resolved report
            new DamageReport
            {
                Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
                Description = "Power outlet near desk not working.",
                SubmitTime = now.AddDays(-15),
                ResolveTime = now.AddDays(-14),
                IsResolved = true,
                SubmittedById = aliceJohnson.Id,
                ResolvedById = adminUser.Id,
                DeskId = desks[7].Id,
                CompanyId = startupCenterCompany.Id
            }
        };

        context.DamageReports.AddRange(damageReports);
        await context.SaveChangesAsync();

        logger.LogInformation("Database seeding completed successfully!");
        logger.LogInformation("Seeded {CompanyCount} companies, {UserCount} users, {RoomCount} rooms, {DeskCount} desks, {ReservationCount} reservations, {DamageReportCount} damage reports",
            3, 5, 4, desks.Count, reservations.Count, damageReports.Count);
    }

    private static bool IsGeneratingOpenApiDocument()
    {
        // Check if running in a context that suggests OpenAPI generation
        return Environment.GetCommandLineArgs().Any(arg =>
            arg.Contains("swagger", StringComparison.OrdinalIgnoreCase) ||
            arg.Contains("openapi", StringComparison.OrdinalIgnoreCase));
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}