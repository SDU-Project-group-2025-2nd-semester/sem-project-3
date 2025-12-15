using Backend.Data.Database;
using Backend.Services.Desks;
using Backend.Services.Reservations;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Microsoft.Extensions.Logging;
using Moq;

namespace Backend.Tests;

[Collection("Database collection")]
public class ReservationSchedulerTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private ReservationScheduler _reservationScheduler = null!;
    private Mock<IBackgroundJobClient> _mockBackgroundJobClient = null!;
    private Company _testCompany = null!;
    private Room _testRoom = null!;
    private Desk _testDesk = null!;
    private User _testUser = null!;

    public async Task InitializeAsync()
    {
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<ReservationScheduler>();
        _mockBackgroundJobClient = new Mock<IBackgroundJobClient>();
        _reservationScheduler = new ReservationScheduler(logger, _mockBackgroundJobClient.Object, fixture.DbContext);

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
            SittingHeight = 75,
            StandingHeight = 120,
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

        _testDesk = new Desk
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

        fixture.DbContext.Companies.Add(_testCompany);
        fixture.DbContext.Users.Add(_testUser);
        fixture.DbContext.Rooms.Add(_testRoom);
        fixture.DbContext.Desks.Add(_testDesk);
        await fixture.DbContext.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task ScheduleDeskAdjustment_ShouldEnqueueImmediately_WhenReservationStartsNow()
    {
        // Arrange
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow,
            End = DateTime.UtcNow.AddHours(1),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.Add(reservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        await _reservationScheduler.ScheduleDeskAdjustment(reservation);

        // Assert
        _mockBackgroundJobClient.Verify(
            x => x.Create(
                It.Is<Job>(job => 
                    job.Type == typeof(DeskAdjustmentJob) && 
                    job.Method.Name == "AdjustDeskForReservation"),
                It.IsAny<EnqueuedState>()),
            Times.Once);
    }

    [Fact]
    public async Task ScheduleDeskAdjustment_ShouldEnqueueImmediately_WhenReservationStartsInPast()
    {
        // Arrange
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = DateTime.UtcNow.AddMinutes(-5),
            End = DateTime.UtcNow.AddHours(1),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.Add(reservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        await _reservationScheduler.ScheduleDeskAdjustment(reservation);

        // Assert
        _mockBackgroundJobClient.Verify(
            x => x.Create(
                It.Is<Job>(job => 
                    job.Type == typeof(DeskAdjustmentJob) && 
                    job.Method.Name == "AdjustDeskForReservation"),
                It.IsAny<EnqueuedState>()),
            Times.Once);
    }

    [Fact]
    public async Task ScheduleDeskAdjustment_ShouldScheduleForFuture_WhenReservationStartsLater()
    {
        // Arrange
        var futureStart = DateTime.UtcNow.AddHours(2);
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            DeskId = _testDesk.Id,
            UserId = _testUser.Id,
            CompanyId = _testCompany.Id,
            Start = futureStart,
            End = futureStart.AddHours(1),
            Company = _testCompany,
            User = _testUser,
            Desk = _testDesk
        };

        fixture.DbContext.Reservations.Add(reservation);
        await fixture.DbContext.SaveChangesAsync();

        var testJobId = "test-job-id-123";
        _mockBackgroundJobClient
            .Setup(x => x.Create(
                It.IsAny<Job>(),
                It.IsAny<ScheduledState>()))
            .Returns(testJobId);

        // Act
        await _reservationScheduler.ScheduleDeskAdjustment(reservation);

        // Assert
        _mockBackgroundJobClient.Verify(
            x => x.Create(
                It.Is<Job>(job => 
                    job.Type == typeof(DeskAdjustmentJob) && 
                    job.Method.Name == "AdjustDeskForReservation"),
                It.Is<ScheduledState>(state => state.EnqueueAt > DateTime.UtcNow)),
            Times.Once);

        // Verify JobId was saved to reservation
        var updatedReservation = await fixture.DbContext.Reservations.FindAsync(reservation.Id);
        Assert.NotNull(updatedReservation);
        Assert.Equal(testJobId, updatedReservation.JobId);
    }


    [Fact]
    public async Task CancelScheduledAdjustment_ShouldDoNothing_WhenReservationNotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        await _reservationScheduler.CancelScheduledAdjustment(nonExistentId);

        // Assert
        _mockBackgroundJobClient.Verify(
            x => x.ChangeState(It.IsAny<string>(), It.IsAny<IState>(), It.IsAny<string>()),
            Times.Never);
    }

    [Fact]
    public async Task CancelScheduledAdjustment_ShouldDoNothing_WhenJobIdIsNull()
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
            Desk = _testDesk,
            JobId = null
        };

        fixture.DbContext.Reservations.Add(reservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        await _reservationScheduler.CancelScheduledAdjustment(reservation.Id);

        // Assert
        _mockBackgroundJobClient.Verify(
            x => x.ChangeState(It.IsAny<string>(), It.IsAny<IState>(), It.IsAny<string>()),
            Times.Never);
    }

    [Fact]
    public async Task CancelScheduledAdjustment_ShouldDoNothing_WhenJobIdIsEmpty()
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
            Desk = _testDesk,
            JobId = ""
        };

        fixture.DbContext.Reservations.Add(reservation);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        await _reservationScheduler.CancelScheduledAdjustment(reservation.Id);

        // Assert
        _mockBackgroundJobClient.Verify(
            x => x.ChangeState(It.IsAny<string>(), It.IsAny<IState>(), It.IsAny<string>()),
            Times.Never);
    }
}
