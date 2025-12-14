using Backend.Data.Database;
using Backend.Data.DeskJsonApi;
using Backend.Hubs;
using Backend.Services.Desks;
using Backend.Services.DeskApis;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace Backend.Tests;

[Collection("Database collection")]
public class DeskControlServiceTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private DeskControlService _deskControlService = null!;
    private Mock<IDeskApi> _mockDeskApi = null!;
    private Mock<IHubContext<DeskHub>> _mockHubContext = null!;
    private Company _testCompany = null!;
    private Room _testRoom = null!;
    private Desk _testDesk = null!;
    private Desk _testDesk1 = null!;

    public async Task InitializeAsync()
    {
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<DeskControlService>();
        _mockDeskApi = new Mock<IDeskApi>();
        _mockHubContext = new Mock<IHubContext<DeskHub>>();
        
        // Setup SignalR mock
        var mockClients = new Mock<IHubClients>();
        var mockClientProxy = new Mock<IClientProxy>();
        
        _mockHubContext.Setup(x => x.Clients).Returns(mockClients.Object);
        mockClients.Setup(x => x.Group(It.IsAny<string>())).Returns(mockClientProxy.Object);
        
        _deskControlService = new DeskControlService(
            fixture.DbContext, 
            logger, 
            _mockDeskApi.Object, 
            _mockHubContext.Object);

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

        _testDesk1 = new Desk
        {
            Id = Guid.NewGuid(),
            Height = 800,
            MaxHeight = 1320,
            MinHeight = 680,
            MacAddress = "AA:BB:CC:DD:EE:69",
            RpiMacAddress = "FF:FF:FF:FF:FF:69",
            RoomId = _testRoom.Id,
            CompanyId = _testCompany.Id,
            ReservationIds = [],
            Reservations = [],
            Room = _testRoom,
            Company = _testCompany,
            ReadableId = "D-102"
        };

        fixture.DbContext.Companies.Add(_testCompany);
        fixture.DbContext.Rooms.Add(_testRoom);
        fixture.DbContext.Desks.Add(_testDesk);
        fixture.DbContext.Desks.Add(_testDesk1);
        await fixture.DbContext.SaveChangesAsync();
    }

    public async Task DisposeAsync()
    {
        // Clean up test data to avoid interference with other tests
        fixture.DbContext.Desks.RemoveRange(
            fixture.DbContext.Desks.Where(d => d.CompanyId == _testCompany.Id));
        fixture.DbContext.Rooms.RemoveRange(
            fixture.DbContext.Rooms.Where(r => r.CompanyId == _testCompany.Id));
        fixture.DbContext.Companies.RemoveRange(
            fixture.DbContext.Companies.Where(c => c.Id == _testCompany.Id));
        await fixture.DbContext.SaveChangesAsync();
    }

    [Fact]
    public async Task GetCurrentDeskHeightAsync_ShouldReturnHeight_WhenDeskExists()
    {
        var mockDeskApi = new Mock<IDeskApi>();
        // Arrange
        var currentHeight = 950;
        var mockState = new State { PositionMm = currentHeight };

        mockDeskApi
            .Setup(x => x.GetDeskState(_testDesk1.MacAddress, It.IsAny<Guid>()))
            .ReturnsAsync(mockState);

        var deskControllerService = new DeskControlService(
            fixture.DbContext, 
            NullLogger<DeskControlService>.Instance, 
            mockDeskApi.Object, 
            _mockHubContext.Object);


        // Act
        var result = await deskControllerService.GetCurrentDeskHeightAsync(_testDesk1.MacAddress);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(currentHeight, result.Value);
        
        mockDeskApi.Verify(
            x => x.GetDeskState(_testDesk1.MacAddress, It.IsAny<Guid>()),
            Times.Once);
    }

    [Fact]
    public async Task SetDeskHeightAsync_ShouldSetHeight_WhenValid()
    {
        // Arrange
        var newHeight = 1000;
        var expectedState = new State { PositionMm = newHeight };

        _mockDeskApi
            .Setup(x => x.SetState(_testDesk.MacAddress, It.IsAny<State>(), _testCompany.Id))
            .ReturnsAsync(expectedState);

        // Act
        var result = await _deskControlService.SetDeskHeightAsync(_testDesk.Id, newHeight);

        // Assert
        Assert.True(result);
        
        var updatedDesk = await fixture.DbContext.Desks.FindAsync(_testDesk.Id);
        Assert.NotNull(updatedDesk);
        Assert.Equal(newHeight, updatedDesk.Height);
        
        _mockDeskApi.Verify(
            x => x.SetState(_testDesk.MacAddress, It.Is<State>(s => s.PositionMm == newHeight), _testCompany.Id),
            Times.Once);
    }

    [Fact]
    public async Task SetDeskHeightAsync_ShouldReturnFalse_WhenDeskNotExists()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var newHeight = 1000;

        // Act
        var result = await _deskControlService.SetDeskHeightAsync(nonExistentId, newHeight);

        // Assert
        Assert.False(result);
        _mockDeskApi.Verify(
            x => x.SetState(It.IsAny<string>(), It.IsAny<State>(), It.IsAny<Guid>()),
            Times.Never);
    }

    [Fact]
    public async Task SetDeskHeightAsync_ShouldReturnFalse_WhenHeightBelowMinimum()
    {
        // Arrange
        var invalidHeight = _testDesk.MinHeight - 1;

        // Act
        var result = await _deskControlService.SetDeskHeightAsync(_testDesk.Id, invalidHeight);

        // Assert
        Assert.False(result);
        _mockDeskApi.Verify(
            x => x.SetState(It.IsAny<string>(), It.IsAny<State>(), It.IsAny<Guid>()),
            Times.Never);
    }

    [Fact]
    public async Task SetDeskHeightAsync_ShouldReturnFalse_WhenHeightAboveMaximum()
    {
        // Arrange
        var invalidHeight = _testDesk.MaxHeight + 1;

        // Act
        var result = await _deskControlService.SetDeskHeightAsync(_testDesk.Id, invalidHeight);

        // Assert
        Assert.False(result);
        _mockDeskApi.Verify(
            x => x.SetState(It.IsAny<string>(), It.IsAny<State>(), It.IsAny<Guid>()),
            Times.Never);
    }

    [Fact]
    public async Task SetDeskHeightAsync_ShouldReturnFalse_WhenApiThrowsException()
    {
        // Arrange
        var newHeight = 1000;

        _mockDeskApi
            .Setup(x => x.SetState(_testDesk.MacAddress, It.IsAny<State>(), _testCompany.Id))
            .ThrowsAsync(new Exception("API error"));

        // Act
        var result = await _deskControlService.SetDeskHeightAsync(_testDesk.Id, newHeight);

        // Assert
        Assert.False(result);
        
        // Desk height should not be updated
        var desk = await fixture.DbContext.Desks.FindAsync(_testDesk.Id);
        Assert.NotNull(desk);
        Assert.Equal(800, desk.Height); // Original height
    }

    [Fact]
    public async Task SetDeskHeightAsync_ShouldNotifyClients_WhenSuccessful()
    {
        // Arrange
        var newHeight = 1000;
        var expectedState = new State { PositionMm = newHeight };

        _mockDeskApi
            .Setup(x => x.SetState(_testDesk.MacAddress, It.IsAny<State>(), _testCompany.Id))
            .ReturnsAsync(expectedState);

        var mockClients = new Mock<IHubClients>();
        var mockClientProxy = new Mock<IClientProxy>();
        
        _mockHubContext.Setup(x => x.Clients).Returns(mockClients.Object);
        mockClients.Setup(x => x.Group(It.IsAny<string>())).Returns(mockClientProxy.Object);

        // Act
        var result = await _deskControlService.SetDeskHeightAsync(_testDesk.Id, newHeight);

        // Assert
        Assert.True(result);
        
        // Verify SignalR notifications were sent
        mockClients.Verify(x => x.Group($"desk-{_testDesk.Id}"), Times.Once);
        mockClients.Verify(x => x.Group($"room-{_testRoom.Id}"), Times.Once);
    }

    [Fact]
    public async Task SetRoomDesksHeightAsync_ShouldSetHeightForAllDesks()
    {
        // Arrange
        var desk2 = new Desk
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
            Room = _testRoom,
            Company = _testCompany,
            ReadableId = "D-102"
        };
        fixture.DbContext.Desks.Add(desk2);
        await fixture.DbContext.SaveChangesAsync();

        var newHeight = 1000;
        var expectedState = new State { PositionMm = newHeight };

        _mockDeskApi
            .Setup(x => x.SetState(It.IsAny<string>(), It.IsAny<State>(), _testCompany.Id))
            .ReturnsAsync(expectedState);

        // Act
        var result = await _deskControlService.SetRoomDesksHeightAsync(_testRoom.Id, newHeight);

        // Assert
        Assert.True(result);
        
        var desk1Updated = await fixture.DbContext.Desks.FindAsync(_testDesk.Id);
        var desk2Updated = await fixture.DbContext.Desks.FindAsync(desk2.Id);
        
        Assert.NotNull(desk1Updated);
        Assert.NotNull(desk2Updated);
        Assert.Equal(newHeight, desk1Updated.Height);
        Assert.Equal(newHeight, desk2Updated.Height);
        
        _mockDeskApi.Verify(
            x => x.SetState(It.IsAny<string>(), It.Is<State>(s => s.PositionMm == newHeight), _testCompany.Id),
            Times.Exactly(3));
    }

    [Fact]
    public async Task SetRoomDesksHeightAsync_ShouldReturnFalse_WhenAnyDeskFails()
    {
        // Arrange
        var desk2 = new Desk
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
            Room = _testRoom,
            Company = _testCompany,
            ReadableId = "D-102"
        };
        fixture.DbContext.Desks.Add(desk2);
        await fixture.DbContext.SaveChangesAsync();

        var newHeight = 1000;
        var expectedState = new State { PositionMm = newHeight };

        // First desk succeeds, second fails
        _mockDeskApi
            .SetupSequence(x => x.SetState(It.IsAny<string>(), It.IsAny<State>(), _testCompany.Id))
            .ReturnsAsync(expectedState)
            .ThrowsAsync(new Exception("API error"));

        // Act
        var result = await _deskControlService.SetRoomDesksHeightAsync(_testRoom.Id, newHeight);

        // Assert
        Assert.False(result);
    }


    [Fact]
    public async Task GetCurrentDeskHeightAsync_ShouldReturnNull_WhenDeskNotExists()
    {
        // Arrange
        var nonExistentMac = "ZZ:ZZ:ZZ:ZZ:ZZ:ZZ";

        // Act
        var result = await _deskControlService.GetCurrentDeskHeightAsync(nonExistentMac);

        // Assert
        Assert.Null(result);
        
        _mockDeskApi.Verify(
            x => x.GetDeskState(It.IsAny<string>(), It.IsAny<Guid>()),
            Times.Never);
    }

    [Fact]
    public async Task GetCurrentDeskHeightAsync_ShouldReturnNull_WhenApiThrowsException()
    {
        // Arrange
        _mockDeskApi
            .Setup(x => x.GetDeskState(_testDesk.MacAddress, _testCompany.Id))
            .ThrowsAsync(new Exception("API error"));

        // Act
        var result = await _deskControlService.GetCurrentDeskHeightAsync(_testDesk.MacAddress);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task SetDeskHeightAsync_ShouldAcceptMinimumHeight()
    {
        // Arrange
        var newHeight = _testDesk.MinHeight;
        var expectedState = new State { PositionMm = newHeight };

        _mockDeskApi
            .Setup(x => x.SetState(_testDesk.MacAddress, It.IsAny<State>(), _testCompany.Id))
            .ReturnsAsync(expectedState);

        // Act
        var result = await _deskControlService.SetDeskHeightAsync(_testDesk.Id, newHeight);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task SetDeskHeightAsync_ShouldAcceptMaximumHeight()
    {
        // Arrange
        var newHeight = _testDesk.MaxHeight;
        var expectedState = new State { PositionMm = newHeight };

        _mockDeskApi
            .Setup(x => x.SetState(_testDesk.MacAddress, It.IsAny<State>(), _testCompany.Id))
            .ReturnsAsync(expectedState);

        // Act
        var result = await _deskControlService.SetDeskHeightAsync(_testDesk.Id, newHeight);

        // Assert
        Assert.True(result);
    }
}
