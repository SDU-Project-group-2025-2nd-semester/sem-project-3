using Backend.Data;
using Backend.Services;

namespace Backend.Tests;

[Collection("Database collection")]
public class DamageReportServiceTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private DamageReportService _damageReportService = null!;
    private Company _testCompany = null!;
    private User _testUser = null!;
    private User _testResolver = null!;
    private Desk _testDesk = null!;
    private Rooms _testRoom = null!;


    public async Task InitializeAsync()
    {
        _damageReportService = new DamageReportService(fixture.DbContext);

        // Setup test data
        _testCompany = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Test Company",
            Admins = [],
            Users = [],
            Rooms = []
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
            AccountCreation = DateTime.UtcNow
        };

        _testResolver = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "Admin",
            LastName = "User",
            UserName = "admin@test.com",
            Email = "admin@test.com",
            StandingHeight = 120,
            SittingHeight = 75,
            HealthRemindersFrequency = HealthRemindersFrequency.Low,
            SittingTime = 30,
            StandingTime = 30,
            AccountCreation = DateTime.UtcNow
        };

        _testRoom = new Rooms
        {
            Id = Guid.NewGuid(),
            DeskIds = [],
            CompanyId = _testCompany.Id,
            Company = _testCompany,
            Desks = [],
            OpeningHours = new OpeningHours()
        };

        _testDesk = new Desk
        {
            Id = Guid.NewGuid(),
            Height = 75,
            MaxHeight = 120,
            MinHeight = 60,
            MacAddress = "AA:BB:CC:DD:EE:02",
            RoomId = _testRoom.Id,
            CompanyId = _testCompany.Id,
            ReservationIds = [],
            Reservations = [],
            Room = _testRoom,
            Company = _testCompany
        };

        fixture.DbContext.Companies.Add(_testCompany);
        fixture.DbContext.Users.Add(_testUser);
        fixture.DbContext.Users.Add(_testResolver);
        fixture.DbContext.Rooms.Add(_testRoom);
        fixture.DbContext.Desks.Add(_testDesk);
        await fixture.DbContext.SaveChangesAsync();
    }

    [Fact]
    public async Task CreateDamageReport_ShouldCreateReport_WithCorrectData()
    {
        // Arrange
        var createDto = new CreateDamageReportDto
        {
            Description = "Desk height adjustment is broken",
            DeskId = _testDesk.Id
        };

        // Act
        var result = await _damageReportService.CreateDamageReport(createDto, _testUser.Id, _testCompany.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createDto.Description, result.Description);
        Assert.Equal(_testDesk.Id, result.DeskId);
        Assert.Equal(_testUser.Id, result.SubmittedById);
        Assert.Equal(_testCompany.Id, result.CompanyId);
        Assert.False(result.IsResolved);
        Assert.Null(result.ResolvedById);
        Assert.Null(result.ResolveTime);
        Assert.True(result.SubmitTime <= DateTime.UtcNow);
    }

    [Fact]
    public async Task GetDamageReportAsync_ShouldReturnReport_WhenExists()
    {
        // Arrange
        var damageReport = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Test damage",
            DeskId = _testDesk.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = false,
            SubmitTime = DateTime.UtcNow,
            Desk = _testDesk,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        fixture.DbContext.DamageReports.Add(damageReport);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _damageReportService.GetDamageReportAsync(damageReport.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(damageReport.Id, result.Id);
        Assert.Equal(damageReport.Description, result.Description);
        Assert.Equal(_testDesk.Id, result.DeskId);
    }

    [Fact]
    public async Task GetDamageReportAsync_ShouldReturnNull_WhenNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _damageReportService.GetDamageReportAsync(nonExistentId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllDamageReportsAsync_ShouldReturnAllReportsForCompany()
    {
        // Arrange
        var report1 = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Damage 1",
            DeskId = _testDesk.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = false,
            SubmitTime = DateTime.UtcNow,
            Desk = _testDesk,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        var report2 = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Damage 2",
            DeskId = _testDesk.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = true,
            SubmitTime = DateTime.UtcNow,
            Desk = _testDesk,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        fixture.DbContext.DamageReports.AddRange(report1, report2);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _damageReportService.GetAllDamageReportsAsync(_testCompany.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetAllDamageReportsAsync_ShouldNotReturnReportsFromOtherCompanies()
    {
        // Arrange
        var otherCompany = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Other Company",
            Admins = [],
            Users = [],
            Rooms = []
        };
        fixture.DbContext.Companies.Add(otherCompany);

        var report1 = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Test company damage",
            DeskId = _testDesk.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = false,
            SubmitTime = DateTime.UtcNow,
            Desk = _testDesk,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        var report2 = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Other company damage",
            DeskId = _testDesk.Id,
            CompanyId = otherCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = false,
            SubmitTime = DateTime.UtcNow,
            Desk = _testDesk,
            Company = otherCompany,
            SubmittedBy = _testUser
        };

        fixture.DbContext.DamageReports.AddRange(report1, report2);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _damageReportService.GetAllDamageReportsAsync(_testCompany.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal(_testCompany.Id, result[0].CompanyId);
    }

    [Fact]
    public async Task UpdateReportStatusAsync_ShouldMarkAsResolved_WhenIsResolvedIsTrue()
    {
        // Arrange
        var damageReport = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Broken desk",
            DeskId = _testDesk.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = false,
            SubmitTime = DateTime.UtcNow,
            Desk = _testDesk,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        fixture.DbContext.DamageReports.Add(damageReport);
        await fixture.DbContext.SaveChangesAsync();

        var beforeUpdate = DateTime.UtcNow;

        // Act
        await _damageReportService.UpdateReportStatusAsync(true, damageReport.Id, _testResolver.Id);

        // Assert
        var updated = await fixture.DbContext.DamageReports.FindAsync(damageReport.Id);
        Assert.NotNull(updated);
        Assert.True(updated.IsResolved);
        Assert.Equal(_testResolver.Id, updated.ResolvedById);
        Assert.NotNull(updated.ResolveTime);
        Assert.True(updated.ResolveTime >= beforeUpdate);
        Assert.True(updated.ResolveTime <= DateTime.UtcNow);
    }

    [Fact]
    public async Task UpdateReportStatusAsync_ShouldMarkAsUnresolved_WhenIsResolvedIsFalse()
    {
        // Arrange
        var damageReport = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Broken desk",
            DeskId = _testDesk.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = true,
            ResolvedById = _testResolver.Id,
            ResolveTime = DateTime.UtcNow,
            SubmitTime = DateTime.UtcNow.AddDays(-1),
            Desk = _testDesk,
            Company = _testCompany,
            SubmittedBy = _testUser,
            ResolvedBy = _testResolver
        };

        fixture.DbContext.DamageReports.Add(damageReport);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        await _damageReportService.UpdateReportStatusAsync(false, damageReport.Id, _testUser.Id);

        // Assert
        var updated = await fixture.DbContext.DamageReports.FindAsync(damageReport.Id);
        Assert.NotNull(updated);
        Assert.False(updated.IsResolved);
        Assert.Null(updated.ResolvedById);
        Assert.Null(updated.ResolveTime);
    }

    [Fact]
    public async Task UpdateReportStatusAsync_ShouldThrowException_WhenReportNotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            async () => await _damageReportService.UpdateReportStatusAsync(true, nonExistentId, _testResolver.Id)
        );

        Assert.Equal("Report was not found (Parameter 'damageReportId')", exception.Message);
    }

    [Fact]
    public async Task DeleteDamageReport_ShouldRemoveReport()
    {
        // Arrange
        var damageReport = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Test damage",
            DeskId = _testDesk.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = false,
            SubmitTime = DateTime.UtcNow,
            Desk = _testDesk,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        fixture.DbContext.DamageReports.Add(damageReport);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        await _damageReportService.DeleteDamageReport(damageReport);

        // Assert
        var result = await fixture.DbContext.DamageReports.FindAsync(damageReport.Id);
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateReportStatusAsync_ShouldToggleStatus_Repeatedly()
    {
        // Arrange
        var damageReport = new DamageReport
        {
            Id = Guid.NewGuid(),
            Description = "Test damage",
            DeskId = _testDesk.Id,
            CompanyId = _testCompany.Id,
            SubmittedById = _testUser.Id,
            IsResolved = false,
            SubmitTime = DateTime.UtcNow,
            Desk = _testDesk,
            Company = _testCompany,
            SubmittedBy = _testUser
        };

        fixture.DbContext.DamageReports.Add(damageReport);
        await fixture.DbContext.SaveChangesAsync();

        // Act - Resolve
        await _damageReportService.UpdateReportStatusAsync(true, damageReport.Id, _testResolver.Id);
        var resolved = await fixture.DbContext.DamageReports.FindAsync(damageReport.Id);

        // Assert - Resolved
        Assert.NotNull(resolved);
        Assert.True(resolved.IsResolved);
        Assert.NotNull(resolved.ResolveTime);

        // Act - Unresolve
        await _damageReportService.UpdateReportStatusAsync(false, damageReport.Id, _testUser.Id);
        var unresolved = await fixture.DbContext.DamageReports.FindAsync(damageReport.Id);

        // Assert - Unresolved
        Assert.NotNull(unresolved);
        Assert.False(unresolved.IsResolved);
        Assert.Null(unresolved.ResolveTime);

        // Act - Resolve again
        await _damageReportService.UpdateReportStatusAsync(true, damageReport.Id, _testResolver.Id);
        var resolvedAgain = await fixture.DbContext.DamageReports.FindAsync(damageReport.Id);

        // Assert - Resolved again
        Assert.NotNull(resolvedAgain);
        Assert.True(resolvedAgain.IsResolved);
        Assert.NotNull(resolvedAgain.ResolveTime);
    }

    public Task DisposeAsync() => Task.CompletedTask;
}
