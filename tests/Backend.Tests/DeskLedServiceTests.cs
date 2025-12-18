using Backend.Data.Database;
using Backend.Services.Desks;
using Backend.Services.Mqtt;
using Microsoft.Extensions.Logging;
using Moq;

namespace Backend.Tests;

[Collection("Database collection")]
public class DeskLedServiceTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private DeskLedService _deskLedService = null!;
    private Mock<IBackendMqttClient> _mockMqttClient = null!;
    private Company _testCompany = null!;
    private Room _testRoom = null!;
    private Desk _testDesk1 = null!;
    private Desk _testDesk2 = null!;
    private User _testUser = null!;

    public async Task InitializeAsync()
    {
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<DeskLedService>();
        _mockMqttClient = new Mock<IBackendMqttClient>();
        _deskLedService = new DeskLedService(logger, fixture.DbContext, _mockMqttClient.Object);

        // Setup test data
        _testCompany = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Test Company",
            UserMemberships = [],
            Rooms = [],
            SimulatorLink = "http://simulator.test",
            SimulatorApiKey = "test-key"
        };

        _testUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "John",
            LastName = "Doe",
            UserName = "john.doe@test.com",
            Email = "john.doe@test.com",
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
            Height = 800,
            MaxHeight = 1320,
            MinHeight = 680,
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
            Height = 750,
            MaxHeight = 1320,
            MinHeight = 680,
            MacAddress = "BB:BB:CC:DD:EE:02",
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

    public async Task DisposeAsync()
    {
        // Clean up test data to avoid interference with other tests
        fixture.DbContext.Reservations.RemoveRange(
            fixture.DbContext.Reservations.Where(r => r.CompanyId == _testCompany.Id));
        fixture.DbContext.Desks.RemoveRange(
            fixture.DbContext.Desks.Where(d => d.CompanyId == _testCompany.Id));
        fixture.DbContext.Rooms.RemoveRange(
            fixture.DbContext.Rooms.Where(r => r.CompanyId == _testCompany.Id));
        fixture.DbContext.UserCompanies.RemoveRange(
            fixture.DbContext.UserCompanies.Where(uc => uc.CompanyId == _testCompany.Id));
        fixture.DbContext.Users.RemoveRange(
            fixture.DbContext.Users.Where(u => u.Id == _testUser.Id));
        fixture.DbContext.Companies.RemoveRange(
            fixture.DbContext.Companies.Where(c => c.Id == _testCompany.Id));
        await fixture.DbContext.SaveChangesAsync();
    }

    [Fact]
    public async Task Run_ShouldSendGreenLed_WhenDeskIsNotOccupied()
    {
        // Arrange
        var cancellationToken = new CancellationToken();

        // Act
        await _deskLedService.Run(cancellationToken);

        // Assert - Verify our specific desks got the green signal
        _mockMqttClient.Verify(
            x => x.SendMessage("green", $"{_testDesk1.RpiMacAddress}/led"),
            Times.AtLeastOnce);
        _mockMqttClient.Verify(
            x => x.SendMessage("green", $"{_testDesk2.RpiMacAddress}/led"),
            Times.AtLeastOnce);
    }

    [Fact]
    public async Task Run_ShouldSendRedLed_WhenDeskIsOccupied()
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

        var cancellationToken = new CancellationToken();

        // Act
        await _deskLedService.Run(cancellationToken);

        // Assert
        // Desk 1 is occupied - should be red
        _mockMqttClient.Verify(
            x => x.SendMessage("red", $"{_testDesk1.RpiMacAddress}/led"),
            Times.AtLeastOnce);
        
        // Desk 2 is not occupied - should be green
        _mockMqttClient.Verify(
            x => x.SendMessage("green", $"{_testDesk2.RpiMacAddress}/led"),
            Times.AtLeastOnce);
    }

    [Fact]
    public async Task Run_ShouldSendRedLed_WhenMultipleDesksAreOccupied()
    {
        // Arrange
        var now = DateTime.UtcNow;
        var reservation1 = new Reservation
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

        var reservation2 = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk2.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddMinutes(-15),
            End = now.AddMinutes(45),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk2
        };

        fixture.DbContext.Reservations.AddRange(reservation1, reservation2);
        await fixture.DbContext.SaveChangesAsync();

        var cancellationToken = new CancellationToken();

        // Act
        await _deskLedService.Run(cancellationToken);

        // Assert
        _mockMqttClient.Verify(
            x => x.SendMessage("red", $"{_testDesk1.RpiMacAddress}/led"),
            Times.AtLeastOnce);
        _mockMqttClient.Verify(
            x => x.SendMessage("red", $"{_testDesk2.RpiMacAddress}/led"),
            Times.AtLeastOnce);
    }

    [Fact]
    public async Task Run_ShouldSendGreenLed_WhenReservationIsInFuture()
    {
        // Arrange
        var now = DateTime.UtcNow;
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

        fixture.DbContext.Reservations.Add(futureReservation);
        await fixture.DbContext.SaveChangesAsync();

        var cancellationToken = new CancellationToken();

        // Act
        await _deskLedService.Run(cancellationToken);

        // Assert
        // Future reservation shouldn't affect LED - should be green
        _mockMqttClient.Verify(
            x => x.SendMessage("green", $"{_testDesk1.RpiMacAddress}/led"),
            Times.AtLeastOnce);
    }

    [Fact]
    public async Task Run_ShouldSendGreenLed_WhenReservationIsInPast()
    {
        // Arrange
        var now = DateTime.UtcNow;
        var pastReservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk1.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = now.AddHours(-3),
            End = now.AddHours(-2),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk1
        };

        fixture.DbContext.Reservations.Add(pastReservation);
        await fixture.DbContext.SaveChangesAsync();

        var cancellationToken = new CancellationToken();

        // Act
        await _deskLedService.Run(cancellationToken);

        // Assert
        // Past reservation shouldn't affect LED - should be green
        _mockMqttClient.Verify(
            x => x.SendMessage("green", $"{_testDesk1.RpiMacAddress}/led"),
            Times.AtLeastOnce);
    }

    [Fact]
    public async Task Run_ShouldHandleException_AndContinueProcessingOtherDesks()
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

        // Setup mock to throw exception for first desk, but succeed for second
        _mockMqttClient
            .Setup(x => x.SendMessage(It.IsAny<string>(), $"{_testDesk1.RpiMacAddress}/led"))
            .ThrowsAsync(new Exception("MQTT error"));

        var cancellationToken = new CancellationToken();

        // Act
        await _deskLedService.Run(cancellationToken);

        // Assert
        // Should still process desk2 even though desk1 failed
        _mockMqttClient.Verify(
            x => x.SendMessage("green", $"{_testDesk2.RpiMacAddress}/led"),
            Times.AtLeastOnce);
    }
}
