using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IDeskService
{
    public Task<List<Desk>> GetAllDesksAsync(Guid companyId);
    public Task<List<Desk>> GetDesksByRoomAsync(Guid companyId, Guid roomId);
    public Task<Desk?> GetDeskAsync(Guid companyId, Guid deskId);
    Task<Desk> CreateDeskAsync(Guid companyId, Desk desk);
    Task<bool> UpdateDeskAsync(Guid companyId, Guid deskId, UpdateDeskDto updated);
    Task<bool> DeleteDeskAsync(Guid companyId, Guid deskId);

    Task<List<string>> GetNotAdoptedDesks(Guid companyId);
}

class DeskService(ILogger<DeskService> logger, BackendContext dbContext, IDeskApi deskApi) : IDeskService
{
    public async Task<List<Desk>> GetAllDesksAsync(Guid companyId)
    {
        return await dbContext.Desks.Include(d => d.Room).Where(d => d.CompanyId == companyId).ToListAsync();
    }
    
    public async Task<List<Desk>> GetDesksByRoomAsync(Guid companyId, Guid roomId)
    {
        return await dbContext.Desks.Where(d => d.CompanyId == companyId && d.RoomId == roomId).ToListAsync();
    }

    public async Task<Desk?> GetDeskAsync(Guid companyId, Guid deskId)
    {
        return await dbContext.Desks.Include(d => d.Room).FirstOrDefaultAsync(d => d.CompanyId == companyId && d.Id == deskId);
    }
    
    public async Task<Desk> CreateDeskAsync(Guid companyId, Desk desk)
    {
        if (desk.RoomId == Guid.Empty)
            throw new ArgumentException("Desk must have a valid room assigned.");

        desk.CompanyId = companyId;
        
        var room = await dbContext.Rooms
            .FirstOrDefaultAsync(r => r.Id == desk.RoomId && r.CompanyId == companyId);

        if (room is null)
            throw new ArgumentException("Room not found.");
        
        var roomNumber = 1;

        if (room.ReadableId != null && room.ReadableId.StartsWith("R-") && int.TryParse(room.ReadableId.AsSpan(2), out var parsedNum))
        {
            roomNumber = parsedNum;
        }
        
        var desksCount = await dbContext.Desks
            .CountAsync(d => d.CompanyId == companyId && d.RoomId == desk.RoomId);

        var deskIndex = desksCount + 1;
        
        desk.ReadableId = $"D-{roomNumber}{deskIndex:00}";
        
        dbContext.Desks.Add(desk);
        await dbContext.SaveChangesAsync();
        return desk;
    }
    
    public async Task<bool> UpdateDeskAsync(Guid companyId, Guid deskId, UpdateDeskDto updated)
    {
        var existing = await dbContext.Desks.FirstOrDefaultAsync(d => d.CompanyId == companyId && d.Id == deskId);

        if (existing is null)
            return false;

        existing.Height = updated.Height;
        existing.MinHeight = updated.MinHeight;
        existing.MaxHeight = updated.MaxHeight;
        existing.RoomId = updated.RoomId;
        existing.ReservationIds = updated.ReservationIds;

        await dbContext.SaveChangesAsync();
        return true;
    }
    
    public async Task<bool> DeleteDeskAsync(Guid companyId, Guid deskId)
    {
        var desk = await dbContext.Desks.FirstOrDefaultAsync(d => d.CompanyId == companyId && d.Id == deskId);

        if (desk is null)
            return false;

        dbContext.Desks.Remove(desk);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<List<string>> GetNotAdoptedDesks(Guid companyId)
    {
        var desks = await deskApi.GetAllDesks();

        List<string> notAdoptedDesks = [];

        foreach (var macAddress in desks)
        {
            var deskInDb = await dbContext.Desks.AnyAsync(d => d.MacAddress == macAddress && d.CompanyId == companyId);

            if (!deskInDb)
            {
                notAdoptedDesks.Add(macAddress);
            }
        }

        return notAdoptedDesks;
    }
}    