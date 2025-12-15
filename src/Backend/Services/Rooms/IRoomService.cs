using Backend.Data.Database;

namespace Backend.Services.Rooms;

public interface IRoomService
{
    public Task<List<Room>> GetAllRoomsAsync(Guid companyId);
    public Task<Room?> GetRoomAsync(Guid companyId, Guid roomId);
    Task<Room> CreateRoomAsync(Guid companyId, Room room);
    Task<bool> UpdateRoomAsync(Guid companyId, Guid roomId, Room updated);
    Task<bool> DeleteRoomAsync(Guid companyId, Guid roomId);
    Task<bool> SetRoomHeightAsync(Guid companyId, Guid roomId, int newHeight);
}