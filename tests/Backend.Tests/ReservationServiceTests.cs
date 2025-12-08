using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Tests;

[Collection("Database collection")]
public class ReservationServiceTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private ReservationService _reservationService = null!;
    private Company _testCompany = null!;
    private User _testUser = null!;
    private Desk _testDesk = null!;
    private Rooms _testRoom = null!;

    public async Task InitializeAsync()
    {
        _reservationService = new ReservationService(fixture.DbContext);

        // Setup test data
        _testCompany = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Test Company",
            UserMemberships = new List<UserCompany>(),
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
            StandingTime = 30,
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

        _testRoom = new Rooms
        {
            Id = Guid.NewGuid(),
            DeskIds = [],
            CompanyId = _testCompany.Id,
            Company = _testCompany,
            Desks = [],
            OpeningHours = new OpeningHours(),
            ReadableId = "R-1"
        };

        _testDesk = new Desk
        {
            Id = Guid.NewGuid(),
            Height = 75,
            MaxHeight = 120,
            MinHeight = 60,
            MacAddress = "AA:BB:CC:DD:EE:01",
            RoomId = _testRoom.Id,
            CompanyId = _testCompany.Id,
            ReservationIds = [],
            Reservations = [],
            Room = _testRoom,
            Company = _testCompany,
            ReadableId = "D-101"
        };

        fixture.DbContext.Companies.Add(_testCompany);
        fixture.DbContext.Users.Add(_testUser);
        fixture.DbContext.Rooms.Add(_testRoom);
        fixture.DbContext.Desks.Add(_testDesk);
        await fixture.DbContext.SaveChangesAsync();
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }

    [Fact]
    public async Task CreateReservation_ShouldCreateReservation_WhenNoConflicts()
    {
        // Arrange
        var createDto = new CreateReservationDto
        {
            DeskId = _testDesk.Id,
            Start = DateTime.UtcNow.AddHours(1),
            End = DateTime.UtcNow.AddHours(2)
        };

        // Act
        var result = await _reservationService.CreateReservation(createDto, _testUser.Id, _testCompany.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testDesk.Id, result.DeskId);
        Assert.Equal(_testUser.Id, result.UserId);
        Assert.Equal(_testCompany.Id, result.CompanyId);
        Assert.Equal(createDto.Start, result.Start);
        Assert.Equal(createDto.End, result.End);
    }

    [Fact]
    public async Task CreateReservation_ShouldReturnNull_WhenReservationConflicts()
    {
        // Arrange
        var existingReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddHours(1),
            End = DateTime.UtcNow.AddHours(3),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.Add(existingReservation);
        await fixture.DbContext.SaveChangesAsync();

        var createDto = new CreateReservationDto
        {
            DeskId = _testDesk.Id,
            Start = DateTime.UtcNow.AddHours(2), // Overlaps with existing
            End = DateTime.UtcNow.AddHours(4)
        };

        // Act
        var result = await _reservationService.CreateReservation(createDto, _testUser.Id, _testCompany.Id);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateReservation_ShouldCreateReservation_WhenReservationsDoNotOverlap()
    {
        // Arrange
        var existingReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddHours(1),
            End = DateTime.UtcNow.AddHours(2),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.Add(existingReservation);
        await fixture.DbContext.SaveChangesAsync();

        var createDto = new CreateReservationDto
        {
            DeskId = _testDesk.Id,
            Start = DateTime.UtcNow.AddHours(3), // After existing reservation
            End = DateTime.UtcNow.AddHours(4)
        };

        // Act
        var result = await _reservationService.CreateReservation(createDto, _testUser.Id, _testCompany.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testDesk.Id, result.DeskId);
    }

    [Fact]
    public async Task GetReservation_ShouldReturnReservation_WhenExists()
    {
        // Arrange
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddHours(1),
            End = DateTime.UtcNow.AddHours(2),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.Add(reservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _reservationService.GetReservation(reservation.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(reservation.Id, result.Id);
        Assert.Equal(_testDesk.Id, result.DeskId);
    }

    [Fact]
    public async Task GetReservation_ShouldReturnNull_WhenNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _reservationService.GetReservation(nonExistentId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetReservations_ShouldReturnAllReservationsForCompany()
    {
        // Arrange
        var reservation1 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddHours(1),
            End = DateTime.UtcNow.AddHours(2),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        var reservation2 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddHours(3),
            End = DateTime.UtcNow.AddHours(4),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.AddRange(reservation1, reservation2);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _reservationService.GetReservations(_testCompany.Id, null);

        // Assert
        var reservations = result as List<Reservation>;
        Assert.NotNull(reservations);
        Assert.Equal(2, reservations.Count);
    }

    [Fact]
    public async Task GetReservations_ShouldFilterByUserId()
    {
        // Arrange
        var otherUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "Jane",
            LastName = "Smith",
            UserName = "jane.smith@test.com",
            Email = "jane.smith@test.com",
            AccountCreation = DateTime.UtcNow
        };
        fixture.DbContext.Users.Add(otherUser);
        
        _testCompany.UserMemberships.Add(new UserCompany
        {
            UserId = otherUser.Id,
            User = otherUser,
            CompanyId = _testCompany.Id,
            Company = _testCompany,
            Role = UserRole.User
        });

        var reservation1 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddHours(1),
            End = DateTime.UtcNow.AddHours(2),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        var reservation2 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = otherUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddHours(3),
            End = DateTime.UtcNow.AddHours(4),
            Company = _testCompany,
            User = otherUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.AddRange(reservation1, reservation2);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _reservationService.GetReservations(_testCompany.Id, _testUser.Id);

        // Assert
        var reservations = result as List<Reservation>;
        Assert.NotNull(reservations);
        Assert.Single(reservations);
        Assert.Equal(_testUser.Id, reservations[0].UserId);
    }

    [Fact]
    public async Task GetReservations_ShouldFilterByDateRange()
    {
        // Arrange
        var baseDate = DateTime.UtcNow;

        var reservation1 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = baseDate.AddDays(1),
            End = baseDate.AddDays(1).AddHours(1),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        var reservation2 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = baseDate.AddDays(5),
            End = baseDate.AddDays(5).AddHours(1),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.AddRange(reservation1, reservation2);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _reservationService.GetReservations(
            _testCompany.Id,
            null,
            null,
            baseDate,
            baseDate.AddDays(2));

        // Assert
        var reservations = result as List<Reservation>;
        Assert.NotNull(reservations);
        Assert.Single(reservations);
        Assert.Equal(reservation1.Id, reservations[0].Id);
    }

    [Fact]
    public async Task DeleteReservation_ShouldRemoveReservation()
    {
        // Arrange
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddHours(1),
            End = DateTime.UtcNow.AddHours(2),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.Add(reservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        await _reservationService.DeleteReservation(reservation);

        // Assert
        var result = await fixture.DbContext.Reservations.FindAsync(reservation.Id);
        Assert.Null(result);
    }
}
