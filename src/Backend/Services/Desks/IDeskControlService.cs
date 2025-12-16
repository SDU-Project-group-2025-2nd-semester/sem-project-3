namespace Backend.Services.Desks;

public interface IDeskControlService
{
    Task<bool> SetDeskHeightAsync(Guid deskId, int newHeight);
    Task<bool> SetRoomDesksHeightAsync(Guid roomId, int newHeight);
    Task<int?> GetCurrentDeskHeightAsync(string macAddress);
}