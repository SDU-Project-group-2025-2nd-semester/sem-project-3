using Backend.Data.Database;
using Backend.Services.Desks;

namespace Backend.Services.Rooms;

public class RoomService(ILogger<RoomService> logger, BackendContext dbContext, IDeskControlService deskControlService) : IRoomService
{
    public async Task<List<Room>> GetAllRoomsAsync(Guid companyId)
    {
        return await dbContext.Rooms.Where(r => r.CompanyId == companyId).ToListAsync();
    }

    public async Task<Room?> GetRoomAsync(Guid companyId, Guid roomId)
    {
        return await dbContext.Rooms.Include(r => r.Desks).FirstOrDefaultAsync(r => r.CompanyId == companyId && r.Id == roomId);
    }

    public async Task<Room> CreateRoomAsync(Guid companyId, Room room)
    {
        room.CompanyId = companyId;

        var existingIds = await dbContext.Rooms
            .Where(r => r.CompanyId == companyId && r.ReadableId != null)
            .Select(r => r.ReadableId)
            .ToListAsync();

        var nextNumber = 1;

        foreach (var rid in existingIds)
        {
            if (rid != null && rid.StartsWith("R-") &&
                int.TryParse(rid.AsSpan(2), out var num) &&
                num >= nextNumber)
            {
                nextNumber = num + 1;
            }
        }

        room.ReadableId = $"R-{nextNumber}";

        dbContext.Rooms.Add(room);
        await dbContext.SaveChangesAsync();
        return room;
    }

    public async Task<bool> UpdateRoomAsync(Guid companyId, Guid roomId, Room updated)
    {
        var existing = await dbContext.Rooms.FirstOrDefaultAsync(r => r.CompanyId == companyId && r.Id == roomId);
        if (existing is null) return false;

        existing.DeskIds = updated.DeskIds;
        existing.OpeningHours = updated.OpeningHours;

        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteRoomAsync(Guid companyId, Guid roomId)
    {
        var room = await dbContext.Rooms.FirstOrDefaultAsync(r => r.CompanyId == companyId && r.Id == roomId);
        if (room is null) return false;

        dbContext.Rooms.Remove(room);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetRoomHeightAsync(Guid companyId, Guid roomId, int newHeight)
    {

        var existing = await dbContext.Rooms.FirstOrDefaultAsync(d => d.CompanyId == companyId && d.Id == roomId);

        if (existing is null)
        {
            return false;
        }

        return await deskControlService.SetRoomDesksHeightAsync(roomId, newHeight);
    }
}