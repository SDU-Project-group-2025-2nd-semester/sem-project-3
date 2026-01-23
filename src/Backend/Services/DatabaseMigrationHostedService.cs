using Backend.Data.Database;
using Backend.Data.Dtos;
using Backend.Services.Reservations;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

public class DatabaseMigrationHostedService(
    IServiceProvider serviceProvider,
    ILogger<DatabaseMigrationHostedService> logger,
    IHostEnvironment environment) : IHostedService
{
    private Task _dbMigrationTask;

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

        _dbMigrationTask = ScheduleTestReservationsAsync();


        async Task ScheduleTestReservationsAsync()
        {
            await Task.Delay(TimeSpan.FromMinutes(1.1), cancellationToken); // A bit of a dirty hack to make sure jobs work

            try
            {

                using var scope = serviceProvider.CreateScope();

                await using var applicationDbContext = scope.ServiceProvider.GetRequiredService<BackendContext>();

                var reservationService = scope.ServiceProvider.GetRequiredService<IReservationService>();

                var user = await applicationDbContext.Users.Include(u => u.CompanyMemberships).FirstAsync();

                var company = await applicationDbContext.Companies.Include(t => t.Rooms).Where(c => c.Id == user.CompanyMemberships.First().CompanyId).FirstAsync();

                var desk = await applicationDbContext.Desks.Where(d => d.RoomId == company.Rooms.First().Id)
                    .FirstOrDefaultAsync(cancellationToken: cancellationToken)!;


                var now = DateTime.UtcNow;
                var reservationDto = new CreateReservationDto()
                {
                    DeskId = desk.Id,
                    Start = now.AddMinutes(0.5),
                    End = now.AddHours(1)
                };

                await reservationService.CreateReservation(reservationDto, user.Id, company.Id);

                now = now.AddDays(1);

                reservationDto = new CreateReservationDto()
                {
                    DeskId = desk.Id,
                    Start = now.AddMinutes(0.5),
                    End = now.AddHours(1)
                };

                var reservation = await reservationService.CreateReservation(reservationDto, user.Id, company.Id);

                await Task.Delay(100, cancellationToken);

                await reservationService.DeleteReservation(reservation);
            }
            catch (Exception e)
            {
                logger.LogError(e, "Something went wrong!");
                throw;
            }
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
            Rooms = [],
            SimulatorLink = "https://s3-sproj-techcowork.michalvalko.eu",
            SimulatorApiKey = "E9Y2LxT4g1hQZ7aD8nR3mWx5P0qK6pV7"
        };

        var innovationHubCompany = new Company
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Innovation Hub",
            SecretInviteCode = "INNOVATE",
            Rooms = [],
            SimulatorLink = "https://s3-sproj-innovationhub.michalvalko.eu",
            SimulatorApiKey = "F7H1vM3kQ5rW8zT9xG2pJ6nY4dL0aZ3K"
        };

        var startupCenterCompany = new Company
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Startup Center",
            SecretInviteCode = null, // Email verification required
            Rooms = [],
            SimulatorLink = "https://s3-sproj-startupcenter.michalvalko.eu",
            SimulatorApiKey = "A3B5C7D9E1F2G4H6I8J0K2L4M6N8O0P2"
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
            StandingHeight = 750,
            SittingHeight = 650,
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
            StandingHeight = 720,
            SittingHeight = 630,
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
            StandingHeight = 680,
            SittingHeight = 600,
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
            StandingHeight = 740,
            SittingHeight = 650,
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
            StandingHeight = 700,
            SittingHeight = 620,
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
            StandingHeight = 750,
            SittingHeight = 650,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-6),
            Reservations = []
        };
        await userManager.CreateAsync(staffUser, "Staff123!");

        // Create admin users for each company
        var adminInnovationHub = new User
        {
            Id = "g1111111-1111-1111-1111-111111111111",
            UserName = "admin@innovationhub.com",
            Email = "admin@innovationhub.com",
            EmailConfirmed = true,
            FirstName = "Admin",
            LastName = "Innovation",
            StandingHeight = 750,
            SittingHeight = 650,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-6),
            Reservations = []
        };
        await userManager.CreateAsync(adminInnovationHub, "Admin123!");

        var adminStartupCenter = new User
        {
            Id = "h1111111-1111-1111-1111-111111111111",
            UserName = "admin@startupcenter.com",
            Email = "admin@startupcenter.com",
            EmailConfirmed = true,
            FirstName = "Admin",
            LastName = "Startup",
            StandingHeight = 750,
            SittingHeight = 650,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-6),
            Reservations = []
        };
        await userManager.CreateAsync(adminStartupCenter, "Admin123!");

        // Create staff (Janitor) users for each company
        var staffInnovationHub = new User
        {
            Id = "i1111111-1111-1111-1111-111111111111",
            UserName = "staff@innovationhub.com",
            Email = "staff@innovationhub.com",
            EmailConfirmed = true,
            FirstName = "Staff",
            LastName = "Innovation",
            StandingHeight = 750,
            SittingHeight = 650,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-6),
            Reservations = []
        };
        await userManager.CreateAsync(staffInnovationHub, "Staff123!");

        var staffStartupCenter = new User
        {
            Id = "j1111111-1111-1111-1111-111111111111",
            UserName = "staff@startupcenter.com",
            Email = "staff@startupcenter.com",
            EmailConfirmed = true,
            FirstName = "Staff",
            LastName = "Startup",
            StandingHeight = 750,
            SittingHeight = 650,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-6),
            Reservations = []
        };
        await userManager.CreateAsync(staffStartupCenter, "Staff123!");

        // Create users that belong to multiple companies
        var multiCompanyUser1 = new User
        {
            Id = "k1111111-1111-1111-1111-111111111111",
            UserName = "multiuser1@example.com",
            Email = "multiuser1@example.com",
            EmailConfirmed = true,
            FirstName = "Multi",
            LastName = "User1",
            StandingHeight = 720,
            SittingHeight = 630,
            HealthRemindersFrequency = HealthRemindersFrequency.High,
            SittingTime = 25,
            StandingTime = 10,
            AccountCreation = DateTime.UtcNow.AddMonths(-2),
            Reservations = []
        };
        await userManager.CreateAsync(multiCompanyUser1, "MultiUser123!");

        var multiCompanyUser2 = new User
        {
            Id = "l1111111-1111-1111-1111-111111111111",
            UserName = "multiuser2@example.com",
            Email = "multiuser2@example.com",
            EmailConfirmed = true,
            FirstName = "Multi",
            LastName = "User2",
            StandingHeight = 700,
            SittingHeight = 620,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow.AddMonths(-3),
            Reservations = []
        };
        await userManager.CreateAsync(multiCompanyUser2, "MultiUser123!");

        var multiCompanyUser3 = new User
        {
            Id = "m1111111-1111-1111-1111-111111111111",
            UserName = "multiuser3@example.com",
            Email = "multiuser3@example.com",
            EmailConfirmed = true,
            FirstName = "Multi",
            LastName = "User3",
            StandingHeight = 680,
            SittingHeight = 600,
            HealthRemindersFrequency = HealthRemindersFrequency.Low,
            SittingTime = 45,
            StandingTime = 20,
            AccountCreation = DateTime.UtcNow.AddMonths(-1),
            Reservations = []
        };
        await userManager.CreateAsync(multiCompanyUser3, "MultiUser123!");

        await context.SaveChangesAsync();

        // Create Users-Company Relations

        context.UserCompanies.AddRange(
            // Tech Co-Working Space users
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
            // Innovation Hub users
            new UserCompany
            {
                UserId = adminInnovationHub.Id,
                CompanyId = innovationHubCompany.Id,
                Role = UserRole.Admin
            },
            new UserCompany
            {
                UserId = staffInnovationHub.Id,
                CompanyId = innovationHubCompany.Id,
                Role = UserRole.Janitor
            },
            new UserCompany
            {
                UserId = bobSmith.Id,
                CompanyId = innovationHubCompany.Id,
                Role = UserRole.User
            },
            // Startup Center users
            new UserCompany
            {
                UserId = adminStartupCenter.Id,
                CompanyId = startupCenterCompany.Id,
                Role = UserRole.Admin
            },
            new UserCompany
            {
                UserId = staffStartupCenter.Id,
                CompanyId = startupCenterCompany.Id,
                Role = UserRole.Janitor
            },
            new UserCompany
            {
                UserId = aliceJohnson.Id,
                CompanyId = startupCenterCompany.Id,
                Role = UserRole.User
            },
            // Multi-company users - User1 belongs to Tech Co-Working and Innovation Hub
            new UserCompany
            {
                UserId = multiCompanyUser1.Id,
                CompanyId = techCoWorkingCompany.Id,
                Role = UserRole.User
            },
            new UserCompany
            {
                UserId = multiCompanyUser1.Id,
                CompanyId = innovationHubCompany.Id,
                Role = UserRole.User
            },
            // Multi-company users - User2 belongs to Innovation Hub and Startup Center
            new UserCompany
            {
                UserId = multiCompanyUser2.Id,
                CompanyId = innovationHubCompany.Id,
                Role = UserRole.User
            },
            new UserCompany
            {
                UserId = multiCompanyUser2.Id,
                CompanyId = startupCenterCompany.Id,
                Role = UserRole.User
            },
            // Multi-company users - User3 belongs to all three companies
            new UserCompany
            {
                UserId = multiCompanyUser3.Id,
                CompanyId = techCoWorkingCompany.Id,
                Role = UserRole.User
            },
            new UserCompany
            {
                UserId = multiCompanyUser3.Id,
                CompanyId = innovationHubCompany.Id,
                Role = UserRole.User
            },
            new UserCompany
            {
                UserId = multiCompanyUser3.Id,
                CompanyId = startupCenterCompany.Id,
                Role = UserRole.User
            }
        );

        await context.SaveChangesAsync();

        // Create Room
        var room1Company1 = new Room
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

        var room2Company1 = new Room
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

        var room1Company2 = new Room
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

        var room1Company3 = new Room
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
                MacAddress = "cd:fb:1a:53:fb:e6",
                RpiMacAddress = "cd:fb:1a:53:fb:e6",
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
                MacAddress = "ee:62:5b:b8:73:1d",
                RpiMacAddress = "ee:62:5b:b8:73:1d",
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
                MacAddress = "70:9e:d5:e7:8c:98",
                RpiMacAddress = "70:9e:d5:e7:8c:98",
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
                MacAddress = "00:ec:eb:50:c2:c8",
                RpiMacAddress = "00:ec:eb:50:c2:c8",
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
                MacAddress = "f1:50:c2:b8:bf:22",
                RpiMacAddress = "f1:50:c2:b8:bf:22",
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
                MacAddress = "ce:38:a6:30:af:1d",
                RpiMacAddress = "ce:38:a6:30:af:1d",
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
                MacAddress = "91:17:a4:3b:f4:4d",
                RpiMacAddress = "91:17:a4:3b:f4:4d",
                RoomId = room1Company2.Id,
                CompanyId = innovationHubCompany.Id,
                ReservationIds = [],
                Reservations = [],
                ReadableId = "D-102"
            },
            //// Startup Center - Room 1
            //new Desk
            //{
            //    Id = Guid.Parse("dc111111-1111-1111-1111-111111111111"),
            //    Height = 690,
            //    MinHeight = 600,
            //    MaxHeight = 1200,
            //    MacAddress = "CC:DD:EE:FF:AA:01",
            //    RoomId = room1Company3.Id,
            //    CompanyId = startupCenterCompany.Id,
            //    ReservationIds = [],
            //    Reservations = []
            //},
            //new Desk
            //{
            //    Id = Guid.Parse("dc111111-2222-2222-2222-222222222222"),
            //    Height = 705,
            //    MinHeight = 600,
            //    MaxHeight = 1200,
            //    MacAddress = "CC:DD:EE:FF:AA:02",
            //    RoomId = room1Company3.Id,
            //    CompanyId = startupCenterCompany.Id,
            //    ReservationIds = [],
            //    Reservations = []
            //}
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
                Start = now.AddHours(-3),
                End = now.AddHours(3),
                UserId = johnDoe.Id,
                DeskId = desks[1].Id,
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
            // NEW: Health reminder test reservation
            // Jane Doe (Medium frequency = 30 min) has been at desk D-103 for 35+ minutes without changing height
            new Reservation
            {
                Id = Guid.Parse("f6666666-6666-6666-6666-666666666666"),
                Start = now.AddMinutes(-35), // Started 35 minutes ago
                End = now.AddHours(2), // Ends in 2 hours
                UserId = janeDoe.Id,
                DeskId = desks[2].Id, // D-103
                CompanyId = techCoWorkingCompany.Id
            }
        };

        context.Reservations.AddRange(reservations);
        await context.SaveChangesAsync();
        
        // Set LastHeightChangeTime for the desk with active health reminder test reservation
        // Jane Doe has Medium frequency (30 min), so set it to 35 minutes ago to trigger reminder on next check
        desks[2].LastHeightChangeTime = now.AddMinutes(-35);
        desks[2].NeedsHealthReminder = false; // Not yet sent, will be sent on next check
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
            //new DamageReport
            //{
            //    Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
            //    Description = "Power outlet near desk not working.",
            //    SubmitTime = now.AddDays(-15),
            //    ResolveTime = now.AddDays(-14),
            //    IsResolved = true,
            //    SubmittedById = aliceJohnson.Id,
            //    ResolvedById = adminUser.Id,
            //    DeskId = desks[7].Id,
            //    CompanyId = startupCenterCompany.Id
            //}
        };

        context.DamageReports.AddRange(damageReports);
        await context.SaveChangesAsync();

        logger.LogInformation("Database seeding completed successfully!");
        logger.LogInformation("Seeded {CompanyCount} companies, {UserCount} users, {RoomCount} rooms, {DeskCount} desks, {ReservationCount} reservations, {DamageReportCount} damage reports",
            3, 13, 4, desks.Count, reservations.Count, damageReports.Count);
    }

    private static bool IsGeneratingOpenApiDocument()
    {
        // Check if running in a context that suggests OpenAPI generation
        return Environment.GetCommandLineArgs().Any(arg =>
            arg.Contains("swagger", StringComparison.OrdinalIgnoreCase) ||
            arg.Contains("openapi", StringComparison.OrdinalIgnoreCase));
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_dbMigrationTask != null)
        {
            await _dbMigrationTask;
        }
        // else: nothing to await, just return
    }
}