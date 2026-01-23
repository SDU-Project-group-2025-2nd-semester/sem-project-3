using Backend.Data;
using Backend.Data.Database;
using Backend.Data.DeskJsonApi;
using Backend.Data.Dtos;
using Backend.Services.Desks;
using Backend.Services.DeskApis;
using Moq;
using Microsoft.Extensions.Logging;

namespace Backend.Tests;

[Collection("Database collection")]
public class DeskServiceTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private DeskService _deskService = null!;
    private Mock<IDeskApi> _mockDeskApi = null!;
    private Mock<IDeskControlService> _mockDeskControlService = null!;
    private Company _testCompany = null!;
    private Room _testRoom = null!;
    private Desk _testDesk = null!;

    public async Task InitializeAsync()
    {
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<DeskService>();
        _mockDeskApi = new Mock<IDeskApi>();
        _mockDeskControlService = new Mock<IDeskControlService>();
        _deskService = new DeskService(logger, fixture.DbContext, _mockDeskApi.Object, _mockDeskControlService.Object);

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
            Height = 750,
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
        fixture.DbContext.Rooms.Add(_testRoom);
        fixture.DbContext.Desks.Add(_testDesk);
        await fixture.DbContext.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetAllDesksAsync_ShouldReturnDesksForCompany()
    {
        // Act
        var result = await _deskService.GetAllDesksAsync(_testCompany.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal(_testDesk.Id, result[0].Id);
        Assert.NotNull(result[0].Room);
    }

    [Fact]
    public async Task GetDesksByRoomAsync_ShouldReturnDesksForRoom()
    {
        // Act
        var result = await _deskService.GetDesksByRoomAsync(_testCompany.Id, _testRoom.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal(_testDesk.Id, result[0].Id);
    }

    [Fact]
    public async Task GetDeskAsync_ShouldReturnDesk_WhenExists()
    {
        // Act
        var result = await _deskService.GetDeskAsync(_testCompany.Id, _testDesk.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testDesk.Id, result.Id);
        Assert.NotNull(result.Room);
    }

    [Fact]
    public async Task GetDeskAsync_ShouldReturnNull_WhenNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _deskService.GetDeskAsync(_testCompany.Id, nonExistentId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateDeskAsync_ShouldCreateDesk_WithSimulatorSync()
    {
        // Arrange
        var createDto = new CreateDeskDto
        {
            MacAddress = "BB:BB:CC:DD:EE:02",
            RpiMacAddress = "FF:FF:FF:FF:FF:02",
            RoomId = _testRoom.Id
        };

        var mockDeskStatus = new DeskJsonElement
        {
            Config = new Config(),
            State = new State { PositionMm = 800 },
            Usage = new Usage(),
            LastErrors = []
        };

        _mockDeskApi
            .Setup(x => x.GetDeskStatus(createDto.MacAddress, _testCompany.Id))
            .ReturnsAsync(mockDeskStatus);

        // Act
        var result = await _deskService.CreateDeskAsync(_testCompany.Id, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createDto.MacAddress, result.MacAddress);
        Assert.Equal(createDto.RpiMacAddress, result.RpiMacAddress);
        Assert.Equal(_testRoom.Id, result.RoomId);
        Assert.Equal(800, result.Height);
        Assert.NotNull(result.ReadableId);
        Assert.StartsWith("D-1", result.ReadableId);
    }

    [Fact]
    public async Task CreateDeskAsync_ShouldUseDefaultValues_WhenSimulatorSyncFails()
    {
        // Arrange
        var createDto = new CreateDeskDto
        {
            MacAddress = "CC:CC:CC:DD:EE:03",
            RpiMacAddress = "FF:FF:FF:FF:FF:03",
            RoomId = _testRoom.Id
        };

        _mockDeskApi
            .Setup(x => x.GetDeskStatus(createDto.MacAddress, _testCompany.Id))
            .ThrowsAsync(new Exception("Simulator error"));

        // Act
        var result = await _deskService.CreateDeskAsync(_testCompany.Id, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(680, result.Height); // Default min height
        Assert.Equal(1320, result.MaxHeight);
        Assert.Equal(680, result.MinHeight);
    }

    [Fact]
    public async Task CreateDeskAsync_ShouldThrowException_WhenRoomIdIsEmpty()
    {
        // Arrange
        var createDto = new CreateDeskDto
        {
            MacAddress = "DD:DD:DD:DD:EE:04",
            RpiMacAddress = "FF:FF:FF:FF:FF:04",
            RoomId = Guid.Empty
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            async () => await _deskService.CreateDeskAsync(_testCompany.Id, createDto)
        );
    }

    [Fact]
    public async Task CreateDeskAsync_ShouldThrowException_WhenRoomNotExists()
    {
        // Arrange
        var createDto = new CreateDeskDto
        {
            MacAddress = "EE:EE:EE:EE:EE:05",
            RpiMacAddress = "FF:FF:FF:FF:FF:05",
            RoomId = Guid.NewGuid()
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            async () => await _deskService.CreateDeskAsync(_testCompany.Id, createDto)
        );
    }

    [Fact]
    public async Task UpdateDeskAsync_ShouldUpdateDesk_WhenExists()
    {
        // Arrange
        var updateDto = new UpdateDeskDto
        {
            Height = 900,
            MinHeight = 700,
            MaxHeight = 1300,
            RoomId = _testRoom.Id,
            ReservationIds = [Guid.NewGuid()],
            RpiMacAddress = "GG:GG:GG:GG:GG:07"
        };

        _mockDeskControlService
            .Setup(x => x.SetDeskHeightAsync(_testDesk.Id, updateDto.Height))
            .ReturnsAsync(true);

        // Act
        var result = await _deskService.UpdateDeskAsync(_testCompany.Id, _testDesk.Id, updateDto);

        // Assert
        Assert.True(result);
        var updated = await fixture.DbContext.Desks.FindAsync(_testDesk.Id);
        Assert.NotNull(updated);
        Assert.Equal(700, updated.MinHeight);
        Assert.Equal(1300, updated.MaxHeight);
        Assert.Equal("GG:GG:GG:GG:GG:07", updated.RpiMacAddress);
        _mockDeskControlService.Verify(x => x.SetDeskHeightAsync(_testDesk.Id, 900), Times.Once);
    }

    [Fact]
    public async Task UpdateDeskAsync_ShouldReturnFalse_WhenNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var updateDto = new UpdateDeskDto
        {
            Height = 900,
            MinHeight = 700,
            MaxHeight = 1300,
            RoomId = _testRoom.Id,
            ReservationIds = []
        };

        // Act
        var result = await _deskService.UpdateDeskAsync(_testCompany.Id, nonExistentId, updateDto);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UpdateDeskHeightAsync_ShouldCallDeskControlService()
    {
        // Arrange
        var newHeight = 1000;
        _mockDeskControlService
            .Setup(x => x.SetDeskHeightAsync(_testDesk.Id, newHeight))
            .ReturnsAsync(true);

        // Act
        var result = await _deskService.UpdateDeskHeightAsync(_testCompany.Id, _testDesk.Id, newHeight);

        // Assert
        Assert.True(result);
        _mockDeskControlService.Verify(x => x.SetDeskHeightAsync(_testDesk.Id, newHeight), Times.Once);
    }

    [Fact]
    public async Task UnadoptDeskAsync_ShouldDeleteDesk_WhenExists()
    {
        // Arrange
        var deskToDelete = new Desk
        {
            Id = Guid.NewGuid(),
            Height = 750,
            MaxHeight = 1320,
            MinHeight = 680,
            MacAddress = "FF:FF:FF:FF:FF:FF",
            RpiMacAddress = "AA:AA:AA:AA:AA:AA",
            RoomId = _testRoom.Id,
            CompanyId = _testCompany.Id,
            ReservationIds = [],
            Room = _testRoom,
            Company = _testCompany,
            ReadableId = "D-999"
        };
        fixture.DbContext.Desks.Add(deskToDelete);
        await fixture.DbContext.SaveChangesAsync();

        // Act
        var result = await _deskService.UnadoptDeskAsync(_testCompany.Id, deskToDelete.Id);

        // Assert
        Assert.True(result);
        var deleted = await fixture.DbContext.Desks.FindAsync(deskToDelete.Id);
        Assert.Null(deleted);
    }

    [Fact]
    public async Task UnadoptDeskAsync_ShouldReturnFalse_WhenNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _deskService.UnadoptDeskAsync(_testCompany.Id, nonExistentId);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task GetNotAdoptedDesks_ShouldReturnDesksNotInDatabase()
    {
        // Arrange
        var allDesks = new List<string>
        {
            _testDesk.MacAddress,
            "11:22:33:44:55:66",
            "77:88:99:AA:BB:CC"
        };

        _mockDeskApi
            .Setup(x => x.GetAllDesks(null))
            .ReturnsAsync(allDesks);

        // Act
        var result = await _deskService.GetNotAdoptedDesks(_testCompany.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Contains("11:22:33:44:55:66", result);
        Assert.Contains("77:88:99:AA:BB:CC", result);
        Assert.DoesNotContain(_testDesk.MacAddress, result);
    }

    [Fact]
    public async Task GetDeskByMacAsync_ShouldReturnDesk_WhenExists()
    {
        // Act
        var result = await _deskService.GetDeskByMacAsync(_testCompany.Id, _testDesk.RpiMacAddress);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_testDesk.Id, result.Id);
        Assert.Equal(_testDesk.RpiMacAddress, result.RpiMacAddress);
    }

    [Fact]
    public async Task GetDeskByMacAsync_ShouldReturnNull_WhenNotExists()
    {
        // Arrange
        var nonExistentMac = "ZZ:ZZ:ZZ:ZZ:ZZ:ZZ";

        // Act
        var result = await _deskService.GetDeskByMacAsync(_testCompany.Id, nonExistentMac);

        // Assert
        Assert.Null(result);
    }
}
