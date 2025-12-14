using Backend.Data.Database;
using Backend.Services.Statistics;

namespace Backend.Tests;

[Collection("Database collection")]
public class StatisticsServiceTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private StatisticsService _statisticsService = null!;
    private Company _testCompany = null!;
    private User _testUser = null!;
    private Room _testRoom = null!;
    private Desk _testDesk1 = null!;
    private Desk _testDesk2 = null!;

    public async Task InitializeAsync()
    {
        _statisticsService = new StatisticsService(fixture.DbContext);

        // Setup test data
        _testCompany = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Test Company",
            UserMemberships = [],
            Rooms = [],
            SimulatorLink = null,
            SimulatorApiKey = null
        };

        _testUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "John",
            LastName = "Doe",
            UserName = "john.doe@test.com",
            Email = "john.doe@test.com",
            StandingHeight = 120,
            SittingHeight = 75,
            HealthRemindersFrequency = HealthRemindersFrequency.Low,
            SittingTime = 30,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow,
        };

        _testCompany.UserMemberships.Add(new UserCompany
        {
            UserId = _testUser.Id,
            User = _testUser,
            CompanyId = _testCompany.Id,
            Company = _testCompany,
            Role = UserRole.User
        });

        _testRoom = new Room
        {
            Id = Guid.NewGuid(),
            DeskIds = [],
            CompanyId = _testCompany.Id,
            Company = _testCompany,
            Desks = [],
            OpeningHours = new OpeningHours(),
            ReadableId = "R-1"
        };

        _testDesk1 = new Desk
        {
            Id = Guid.NewGuid(),
            Height = 75,
            MaxHeight = 120,
            MinHeight = 60,
            MacAddress = "AA:BB:CC:DD:EE:01",
            RpiMacAddress = "FF:FF:FF:FF:FF:01",
            RoomId = _testRoom.Id,
            CompanyId = _testCompany.Id,
            ReservationIds = [],
            Reservations = [],
            Room = _testRoom,
            Company = _testCompany,
            ReadableId = "D-101"
        };

        _testDesk2 = new Desk
        {
            Id = Guid.NewGuid(),
            Height = 75,
            MaxHeight = 120,
            MinHeight = 60,
            MacAddress = "AA:BB:CC:DD:EE:02",
            RpiMacAddress = "FF:FF:FF:FF:FF:02",
            RoomId = _testRoom.Id,
            CompanyId = _testCompany.Id,
            ReservationIds = [],
            Reservations = [],
            Room = _testRoom,
            Company = _testCompany,
            ReadableId = "D-102"
        };

        fixture.DbContext.Companies.Add(_testCompany);
        fixture.DbContext.Users.Add(_testUser);
        fixture.DbContext.Rooms.Add(_testRoom);
        fixture.DbContext.Desks.AddRange(_testDesk1, _testDesk2);
        await fixture.DbContext.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetCompanyStats_ShouldReturnNull_WhenCompanyNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        // Act
        var result = await _statisticsService.GetCompanyStats(nonExistentId, now);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetCompanyStats_ShouldReturnCorrectStats_WhenNoReservations()
    {
        // Arrange
        var now = DateTime.UtcNow;

        // Act
        var result = await _statisticsService.GetCompanyStats(_testCompany.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testCompany.Id, result.CompanyId);
        Assert.Equal(1, result.RoomsCount);
        Assert.Equal(2, result.DesksCount);
        Assert.Equal(0, result.OccupiedDesksNow);
        Assert.Equal(0, result.ActiveReservationsNow);
        Assert.Equal(0, result.ReservationsToday);
        Assert.Equal(0, result.OpenDamageReports);
    }

    [Fact]
    public async Task GetCompanyStats_ShouldCountActiveReservations()
    {
        // Arrange
        var now = DateTime.UtcNow;
        
        var activeReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddMinutes(-30),
            End = now.AddMinutes(30),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        fixture.DbContext.Reservations.Add(activeReservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _statisticsService.GetCompanyStats(_testCompany.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.ActiveReservationsNow);
        Assert.Equal(1, result.OccupiedDesksNow);
    }

    [Fact]
    public async Task GetCompanyStats_ShouldCountReservationsToday()
    {
        // Arrange
        var now = DateTime.UtcNow;
        var todayStart = now.Date;

        var todayReservation1 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = todayStart.AddHours(8),
            End = todayStart.AddHours(9),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        var todayReservation2 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk2.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = todayStart.AddHours(10),
            End = todayStart.AddHours(11),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk2
        };

        var yesterdayReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = todayStart.AddDays(-1).AddHours(8),
            End = todayStart.AddDays(-1).AddHours(9),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        fixture.DbContext.Reservations.AddRange(todayReservation1, todayReservation2, yesterdayReservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _statisticsService.GetCompanyStats(_testCompany.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.ReservationsToday);
    }

    [Fact]
    public async Task GetCompanyStats_ShouldCountOpenDamageReports()
    {
        // Arrange
        var now = DateTime.UtcNow;

        var openReport = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Broken desk",
            DeskId = _testDesk1.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = false,
            SubmitTime = now,
            Desk = _testDesk1,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        var resolvedReport = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Fixed desk",
            DeskId = _testDesk2.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = true,
            SubmitTime = now.AddDays(-1),
            ResolveTime = now,
            Desk = _testDesk2,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        fixture.DbContext.DamageReports.AddRange(openReport, resolvedReport);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _statisticsService.GetCompanyStats(_testCompany.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.OpenDamageReports);
    }

    [Fact]
    public async Task GetRoomStats_ShouldReturnNull_WhenRoomNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        // Act
        var result = await _statisticsService.GetRoomStats(_testCompany.Id, nonExistentId, now);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetRoomStats_ShouldReturnCorrectStats()
    {
        // Arrange
        var now = DateTime.UtcNow;

        var activeReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddMinutes(-30),
            End = now.AddMinutes(30),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        fixture.DbContext.Reservations.Add(activeReservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _statisticsService.GetRoomStats(_testCompany.Id, _testRoom.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testCompany.Id, result.CompanyId);
        Assert.Equal(_testRoom.Id, result.RoomId);
        Assert.Equal(_testRoom.ReadableId, result.RoomReadableId);
        Assert.Equal(2, result.DesksCount);
        Assert.Equal(1, result.OccupiedDesksNow);
        Assert.Equal(1, result.ActiveReservationsNow);
    }

    [Fact]
    public async Task GetDeskStats_ShouldReturnNull_WhenDeskNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        // Act
        var result = await _statisticsService.GetDeskStats(_testCompany.Id, nonExistentId, now);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetDeskStats_ShouldReturnCorrectStats_WithNoReservations()
    {
        // Arrange
        var now = DateTime.UtcNow;

        // Act
        var result = await _statisticsService.GetDeskStats(_testCompany.Id, _testDesk1.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testCompany.Id, result.CompanyId);
        Assert.Equal(_testDesk1.Id, result.DeskId);
        Assert.Equal(_testDesk1.ReadableId, result.DeskReadableId);
        Assert.Equal(_testRoom.Id, result.RoomId);
        Assert.Equal(_testDesk1.Height, result.Height);
        Assert.Equal(_testDesk1.MinHeight, result.MinHeight);
        Assert.Equal(_testDesk1.MaxHeight, result.MaxHeight);
        Assert.Equal(0, result.ActivationsCounter);
        Assert.Equal(0, result.SitStandCounter);
        Assert.Equal(0, result.ReservationsTotal);
        Assert.Null(result.ActiveReservationNow);
    }

    [Fact]
    public async Task GetDeskStats_ShouldReturnActiveReservation()
    {
        // Arrange
        var now = DateTime.UtcNow;

        var activeReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddMinutes(-30),
            End = now.AddMinutes(30),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        var futureReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddHours(2),
            End = now.AddHours(3),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        fixture.DbContext.Reservations.AddRange(activeReservation, futureReservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _statisticsService.GetDeskStats(_testCompany.Id, _testDesk1.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.ReservationsTotal);
        Assert.NotNull(result.ActiveReservationNow);
        Assert.Equal(activeReservation.Id, result.ActiveReservationNow.ReservationId);
        Assert.Equal(_testUser.Id, result.ActiveReservationNow.UserId);
    }

    [Fact]
    public async Task GetUserStats_ShouldReturnNull_WhenUserNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        // Act
        var result = await _statisticsService.GetUserStats(_testCompany.Id, nonExistentId, now);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetUserStats_ShouldReturnCorrectStats()
    {
        // Arrange
        var now = DateTime.UtcNow;

        var activeReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddMinutes(-30),
            End = now.AddMinutes(30),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        var pastReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk2.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddDays(-1),
            End = now.AddDays(-1).AddHours(1),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk2
        };

        fixture.DbContext.Reservations.AddRange(activeReservation, pastReservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _statisticsService.GetUserStats(_testCompany.Id, _testUser.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testCompany.Id, result.CompanyId);
        Assert.Equal(_testUser.Id, result.UserId);
        Assert.Equal(_testUser.Email, result.Email);
        Assert.Equal(_testUser.FirstName, result.FirstName);
        Assert.Equal(_testUser.LastName, result.LastName);
        Assert.Equal(_testUser.SittingHeight, result.SittingHeight);
        Assert.Equal(_testUser.StandingHeight, result.StandingHeight);
        Assert.Equal(_testUser.SittingTime, result.SittingTime);
        Assert.Equal(_testUser.StandingTime, result.StandingTime);
        Assert.Equal(2, result.ReservationsTotal);
        Assert.Equal(1, result.ActiveReservationsNow);
        Assert.Equal(2, result.UniqueDesksReserved);
    }

    [Fact]
    public async Task GetUserStats_ShouldCountUniqueDesks()
    {
        // Arrange
        var now = DateTime.UtcNow;

        var reservation1 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddDays(-3),
            End = now.AddDays(-3).AddHours(1),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        var reservation2 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddDays(-2),
            End = now.AddDays(-2).AddHours(1),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        fixture.DbContext.Reservations.AddRange(reservation1, reservation2);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _statisticsService.GetUserStats(_testCompany.Id, _testUser.Id, now);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.ReservationsTotal);
        Assert.Equal(1, result.UniqueDesksReserved); // Same desk, should count as 1
    }
}
