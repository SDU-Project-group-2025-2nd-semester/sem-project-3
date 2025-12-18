using Backend.Data.Database;
using Backend.Services.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Backend.Tests;

[Collection("Database collection")]
public class UserServiceTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private UserService _userService = null!;
    private Company _testCompany = null!;
    private Company _otherCompany = null!;
    private User _testUser = null!;
    private User _adminUser = null!;
    private User _otherUser = null!;

    public async Task InitializeAsync()
    {
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<UserService>();
        _userService = new UserService(logger, fixture.DbContext);

        // Setup test companies
        _testCompany = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Test Company",
            UserMemberships = [],
            Rooms = [],
            SimulatorLink = null,
            SimulatorApiKey = null
        };

        _otherCompany = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Other Company",
            UserMemberships = [],
            Rooms = [],
            SimulatorLink = null,
            SimulatorApiKey = null
        };

        // Setup test users
        _testUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "John",
            LastName = "Doe",
            UserName = "john.doe@test.com",
            Email = "john.doe@test.com",
            NormalizedEmail = "JOHN.DOE@TEST.COM",
            StandingHeight = 120,
            SittingHeight = 75,
            HealthRemindersFrequency = HealthRemindersFrequency.Low,
            SittingTime = 30,
            StandingTime = 30,
            AccountCreation = DateTime.UtcNow,
        };

        _adminUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "Admin",
            LastName = "User",
            UserName = "admin@test.com",
            Email = "admin@test.com",
            NormalizedEmail = "ADMIN@TEST.COM",
            StandingHeight = 110,
            SittingHeight = 70,
            HealthRemindersFrequency = HealthRemindersFrequency.Medium,
            SittingTime = 45,
            StandingTime = 15,
            AccountCreation = DateTime.UtcNow,
        };

        _otherUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "Jane",
            LastName = "Smith",
            UserName = "jane.smith@test.com",
            Email = "jane.smith@test.com",
            NormalizedEmail = "JANE.SMITH@TEST.COM",
            AccountCreation = DateTime.UtcNow,
        };

        // Add memberships
        _testCompany.UserMemberships.Add(new UserCompany
        {
            UserId = _testUser.Id,
            User = _testUser,
            CompanyId = _testCompany.Id,
            Company = _testCompany,
            Role = UserRole.User
        });

        _testCompany.UserMemberships.Add(new UserCompany
        {
            UserId = _adminUser.Id,
            User = _adminUser,
            CompanyId = _testCompany.Id,
            Company = _testCompany,
            Role = UserRole.Admin
        });

        _otherCompany.UserMemberships.Add(new UserCompany
        {
            UserId = _otherUser.Id,
            User = _otherUser,
            CompanyId = _otherCompany.Id,
            Company = _otherCompany,
            Role = UserRole.User
        });

        fixture.DbContext.Companies.AddRange(_testCompany, _otherCompany);
        fixture.DbContext.Users.AddRange(_testUser, _adminUser, _otherUser);
        await fixture.DbContext.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetUserAsync_ShouldReturnUser_WhenExists()
    {
        // Act
        var result = await _userService.GetUserAsync(_testUser.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testUser.Id, result.Id);
        Assert.Equal(_testUser.Email, result.Email);
        Assert.Equal(_testUser.FirstName, result.FirstName);
        Assert.NotNull(result.CompanyMemberships);
        Assert.Single(result.CompanyMemberships);
    }

    [Fact]
    public async Task GetUserAsync_ShouldReturnNull_WhenNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid().ToString();

        // Act
        var result = await _userService.GetUserAsync(nonExistentId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllUsersAsync_ShouldReturnAllUsers()
    {
        // Act
        var result = await _userService.GetAllUsersAsync();

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count >= 3);
        Assert.Contains(result, u => u.Id == _testUser.Id);
        Assert.Contains(result, u => u.Id == _adminUser.Id);
        Assert.Contains(result, u => u.Id == _otherUser.Id);
    }

    [Fact]
    public async Task DeleteUserAsync_ShouldDeleteUser_WhenExists()
    {
        // Arrange
        var userToDelete = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "Delete",
            LastName = "Me",
            UserName = "delete@test.com",
            Email = "delete@test.com",
            AccountCreation = DateTime.UtcNow
        };
        fixture.DbContext.Users.Add(userToDelete);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _userService.DeleteUserAsync(userToDelete.Id);

        // Assert
        Assert.True(result);
        var deleted = await fixture.DbContext.Users.FindAsync(userToDelete.Id);
        Assert.Null(deleted);
    }

    [Fact]
    public async Task DeleteUserAsync_ShouldReturnFalse_WhenNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid().ToString();

        // Act
        var result = await _userService.DeleteUserAsync(nonExistentId);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UpdateUserAsync_ShouldUpdateUser_WhenExists()
    {
        // Arrange
        var updatedUser = new User
        {
            FirstName = "Updated",
            LastName = "Name",
            SittingHeight = 80,
            StandingHeight = 125,
            HealthRemindersFrequency = HealthRemindersFrequency.High
        };

        // Act
        var result = await _userService.UpdateUserAsync(_testUser.Id, updatedUser);

        // Assert
        Assert.True(result);
        var updated = await fixture.DbContext.Users.FindAsync(_testUser.Id);
        Assert.NotNull(updated);
        Assert.Equal("Updated", updated.FirstName);
        Assert.Equal("Name", updated.LastName);
        Assert.Equal(80, updated.SittingHeight);
        Assert.Equal(125, updated.StandingHeight);
        Assert.Equal(HealthRemindersFrequency.High, updated.HealthRemindersFrequency);
    }

    [Fact]
    public async Task UpdateUserAsync_ShouldReturnFalse_WhenNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid().ToString();
        var updatedUser = new User
        {
            FirstName = "Updated",
            LastName = "Name"
        };

        // Act
        var result = await _userService.UpdateUserAsync(nonExistentId, updatedUser);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UpdateMyInfoAsync_ShouldUpdateUserInfo()
    {
        // Arrange
        var updatedUser = new User
        {
            FirstName = "NewFirst",
            LastName = "NewLast",
            Email = "newemail@test.com",
            SittingHeight = 85,
            StandingHeight = 130,
            HealthRemindersFrequency = HealthRemindersFrequency.High
        };

        // Act
        var result = await _userService.UpdateMyInfoAsync(_testUser.Id, updatedUser);

        // Assert
        Assert.True(result);
        var updated = await fixture.DbContext.Users.FindAsync(_testUser.Id);
        Assert.NotNull(updated);
        Assert.Equal("NewFirst", updated.FirstName);
        Assert.Equal("NewLast", updated.LastName);
        Assert.Equal("newemail@test.com", updated.Email);
        Assert.Equal("NEWEMAIL@TEST.COM", updated.NormalizedEmail);
        Assert.Equal(85, updated.SittingHeight);
        Assert.Equal(130, updated.StandingHeight);
    }

    [Fact]
    public async Task UpdateMyInfoAsync_ShouldUpdatePassword_WhenProvided()
    {
        // Arrange
        var updatedUser = new User
        {
            FirstName = _testUser.FirstName,
            LastName = _testUser.LastName,
            PasswordHash = "NewPassword123!"
        };

        var oldPasswordHash = _testUser.PasswordHash;

        // Act
        var result = await _userService.UpdateMyInfoAsync(_testUser.Id, updatedUser);

        // Assert
        Assert.True(result);
        var updated = await fixture.DbContext.Users.FindAsync(_testUser.Id);
        Assert.NotNull(updated);
        Assert.NotEqual(oldPasswordHash, updated.PasswordHash);
        Assert.NotNull(updated.PasswordHash);
    }

    [Fact]
    public async Task GetUserCompaniesAsync_ShouldReturnUserCompanies()
    {
        // Act
        var result = await _userService.GetUserCompaniesAsync(_testUser.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        var company = result.First();
        var companyType = company.GetType();
        var companyIdProp = companyType.GetProperty("CompanyId");
        var companyNameProp = companyType.GetProperty("CompanyName");
        
        Assert.NotNull(companyIdProp);
        Assert.NotNull(companyNameProp);
        Assert.Equal(_testCompany.Id, companyIdProp.GetValue(company));
        Assert.Equal(_testCompany.Name, companyNameProp.GetValue(company));
    }

    [Fact]
    public async Task GetUsersByCompanyAsync_ShouldReturnUsersForCompany_WhenAdminHasAccess()
    {
        // Act
        var result = await _userService.GetUsersByCompanyAsync(_adminUser.Id, _testCompany.Id);

        // Assert
        Assert.NotNull(result);
        var users = result.ToList();
        Assert.Equal(2, users.Count);
    }

    [Fact]
    public async Task GetUsersByCompanyAsync_ShouldUseDefaultCompany_WhenCompanyIdIsNull()
    {
        // Act
        var result = await _userService.GetUsersByCompanyAsync(_adminUser.Id, null);

        // Assert
        Assert.NotNull(result);
        var users = result.ToList();
        Assert.Equal(2, users.Count);
    }

    [Fact]
    public async Task GetUsersByCompanyAsync_ShouldThrowUnauthorizedException_WhenUserIsNotAdmin()
    {
        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await _userService.GetUsersByCompanyAsync(_testUser.Id, _testCompany.Id)
        );
    }

    [Fact]
    public async Task GetUsersByCompanyAsync_ShouldThrowUnauthorizedException_WhenAdminDoesNotHaveAccessToCompany()
    {
        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await _userService.GetUsersByCompanyAsync(_adminUser.Id, _otherCompany.Id)
        );
    }

    [Fact]
    public async Task GetUsersByCompanyAsync_ShouldThrowInvalidOperationException_WhenAdminHasNoCompany()
    {
        // Arrange
        var orphanAdmin = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "Orphan",
            LastName = "Admin",
            UserName = "orphan@test.com",
            Email = "orphan@test.com",
            AccountCreation = DateTime.UtcNow
        };
        fixture.DbContext.Users.Add(orphanAdmin);
        await fixture.DbContext.SaveChangesAsync();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _userService.GetUsersByCompanyAsync(orphanAdmin.Id, null)
        );
    }
}
