using Backend.Data;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Backend.Services;

public interface IDeskService
{
    public Task<List<Desk>> GetAllDesksAsync(Guid companyId);
    public Task<List<Desk>> GetDesksByRoomAsync(Guid companyId, Guid roomId);
    public Task<Desk?> GetDeskAsync(Guid companyId, Guid deskId);
    Task<Desk> CreateDeskAsync(Guid companyId, CreateDeskDto dto);
    Task<bool> UpdateDeskAsync(Guid companyId, Guid deskId, UpdateDeskDto updated);
    Task<bool> UpdateDeskHeightAsync(Guid companyId, Guid deskId, int newHeight);
    Task<bool> DeleteDeskAsync(Guid companyId, Guid deskId);

    Task<List<string>> GetNotAdoptedDesks(Guid companyId);
}

class DeskService(ILogger<DeskService> logger, BackendContext dbContext, IDeskApi deskApi, IDeskControlService deskControlService) : IDeskService
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
    
    public async Task<Desk> CreateDeskAsync(Guid companyId, CreateDeskDto dto)
    {
        if (dto.RoomId == Guid.Empty)
            throw new ArgumentException("Desk must have a valid room assigned.");

        var room = await dbContext.Rooms
            .FirstOrDefaultAsync(r => r.Id == dto.RoomId && r.CompanyId == companyId);

        if (room is null)
            throw new ArgumentException("Room not found.");
        
        // Sync with simulator first to get current desk state
        DeskMetadata metadata;
        // Default height limits (matching simulator defaults: 680-1320mm)
        const int defaultMinHeight = 680;
        const int defaultMaxHeight = 1320;
        int height = defaultMinHeight;
        int maxHeight = defaultMaxHeight;
        int minHeight = defaultMinHeight;

        try
        {
            // Fetch desk status from simulator (includes config, state, usage, lastErrors)
            var deskStatus = await deskApi.GetDeskStatus(dto.MacAddress, companyId);
            
            // Populate metadata from simulator
            metadata = new DeskMetadata
            {
                Config = deskStatus.Config ?? new Config(),
                Usage = deskStatus.Usage ?? new Usage(),
                LastErrors = deskStatus.LastErrors ?? [],
                Status = deskStatus.State?.Status ?? "",
                IsPositionLost = deskStatus.State?.IsPositionLost ?? false,
                IsOverloadProtectionUp = deskStatus.State?.IsOverloadProtectionUp ?? false,
                IsOverloadProtectionDown = deskStatus.State?.IsOverloadProtectionDown ?? false,
                IsAntiCollision = deskStatus.State?.IsAntiCollision ?? false
            };

            // Sync height from simulator - use actual position from simulator
            if (deskStatus.State != null)
            {
                height = deskStatus.State.PositionMm > 0 ? deskStatus.State.PositionMm : defaultMinHeight;
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to sync desk {MacAddress} with simulator, using default values", dto.MacAddress);
            // If sync fails, use default metadata
            metadata = new DeskMetadata();
        }
        
        var roomNumber = 1;

        if (room.ReadableId != null && room.ReadableId.StartsWith("R-") && int.TryParse(room.ReadableId.AsSpan(2), out var parsedNum))
        {
            roomNumber = parsedNum;
        }
        
        var desksCount = await dbContext.Desks
            .CountAsync(d => d.CompanyId == companyId && d.RoomId == dto.RoomId);

        var deskIndex = desksCount + 1;
        
        var desk = new Desk
        {
            MacAddress = dto.MacAddress,
            RpiMacAddress = dto.RpiMacAddress ?? string.Empty,
            RoomId = dto.RoomId,
            CompanyId = companyId,
            Height = height,
            MaxHeight = maxHeight,
            MinHeight = minHeight,
            ReadableId = $"D-{roomNumber}{deskIndex:00}",
            ReservationIds = [],
            Metadata = metadata
        };
        
        dbContext.Desks.Add(desk);
        await dbContext.SaveChangesAsync();
        return desk;
    }
    
    public async Task<bool> UpdateDeskAsync(Guid companyId, Guid deskId, UpdateDeskDto updated)
    {
        var existing = await dbContext.Desks.FirstOrDefaultAsync(d => d.CompanyId == companyId && d.Id == deskId);

        if (existing is null)
            return false;

        //existing.Height = updated.Height; It's updated via desk control service
        existing.MinHeight = updated.MinHeight;
        existing.MaxHeight = updated.MaxHeight;
        existing.RoomId = updated.RoomId;
        existing.ReservationIds = updated.ReservationIds;
        
        if (!string.IsNullOrEmpty(updated.RpiMacAddress))
        {
            existing.RpiMacAddress = updated.RpiMacAddress;
        }

        await dbContext.SaveChangesAsync();

        if (existing.Height != updated.Height)
        {
            await deskControlService.SetDeskHeightAsync(deskId, updated.Height);
        }

        return true;
    }

    public async Task<bool> UpdateDeskHeightAsync(Guid companyId, Guid deskId, int newHeight)
    {
        var existing = await dbContext.Desks.FirstOrDefaultAsync(d => d.CompanyId == companyId && d.Id == deskId);

        if (existing is null)
            return false;

        if (existing.Height != newHeight)
        {
            await deskControlService.SetDeskHeightAsync(deskId, newHeight);
        }

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
        // DeskApi will automatically get companyId from HttpContext route when called from controller
        // Pass null to let it auto-detect, or pass companyId explicitly for background services
        var desks = await deskApi.GetAllDesks(null);

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