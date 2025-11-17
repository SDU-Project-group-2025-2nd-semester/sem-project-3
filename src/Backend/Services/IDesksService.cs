using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IDeskService
{
    public Task<List<Desk>> GetAllDesksAsync(Guid companyId);
    public Task<List<Desk>> GetDesksByRoomAsync(Guid companyId, Guid roomId);
    public Task<Desk?> GetDeskAsync(Guid companyId, Guid deskId);
    Task<Desk> CreateDeskAsync(Guid companyId, Desk desk);
    Task<bool> UpdateDeskAsync(Guid companyId, Guid deskId, Desk updated);
    Task<bool> DeleteDeskAsync(Guid companyId, Guid deskId);
}

class DeskService(ILogger<DeskService> logger, BackendContext dbContext) : IDeskService
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
            throw new ArgumentException("Desk must have a valid room assigned."); //I think it's necessary.

        desk.CompanyId = companyId;
        dbContext.Desks.Add(desk);
        await dbContext.SaveChangesAsync();
        return desk;
    }
    
    public async Task<bool> UpdateDeskAsync(Guid companyId, Guid deskId, Desk updated)
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
}    