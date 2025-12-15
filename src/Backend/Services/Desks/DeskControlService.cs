using Backend.Data.Database;
using Backend.Data.DeskJsonApi;
using Backend.Hubs;
using Backend.Services.DeskApis;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services.Desks;

public class DeskControlService(BackendContext dbContext, ILogger<DeskControlService> logger, IDeskApi deskApi, IHubContext<DeskHub> hubContext) : IDeskControlService
{

    public async Task<bool> SetDeskHeightAsync(Guid deskId, int newHeight)
    {
        var desk = await dbContext.Desks
            .Include(d => d.Room)
            .FirstOrDefaultAsync(d => d.Id == deskId);

        if (desk == null)
        {
            logger.LogWarning("Desk {DeskId} not found", deskId);
            return false;
        }

        if (newHeight < desk.MinHeight || newHeight > desk.MaxHeight)
        {
            logger.LogWarning(
                "Invalid height {Height} for desk {DeskId}. Must be between {Min} and {Max}",
                newHeight, deskId, desk.MinHeight, desk.MaxHeight);
            return false;
        }

        try
        {
            // Pass companyId to DeskApi, which will fetch simulator settings from DB
            var newState = await deskApi.SetState(desk.MacAddress, new State()
            {
                PositionMm = newHeight,
            }, desk.CompanyId);


            // Update database
            var oldHeight = desk.Height;
            desk.Height = newState.PositionMm;
            await dbContext.SaveChangesAsync();

            // Notify clients via SignalR
            await NotifyDeskHeightChanged(desk, oldHeight, newHeight);

            logger.LogInformation("Desk {DeskId} height changed to {Height}mm", deskId, newHeight);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error changing height for desk {DeskId}", deskId);
            return false;
        }
    }

    public async Task<bool> SetRoomDesksHeightAsync(Guid roomId, int newHeight)
    {
        var desks = await dbContext.Desks
            .Where(d => d.RoomId == roomId)
            .ToListAsync();


        foreach (Desk desk in desks)
        {
            if (!await SetDeskHeightAsync(desk.Id, newHeight))
            {
                return false;
            }
        }

        return true;
    }

    public async Task<int?> GetCurrentDeskHeightAsync(string macAddress)
    {
        try
        {
            // Find desk to get companyId
            var desk = await dbContext.Desks
                .FirstOrDefaultAsync(d => d.MacAddress == macAddress);

            if (desk == null)
            {
                logger.LogWarning("Desk with MAC address {MacAddress} not found", macAddress);
                return null;
            }

            // Pass companyId to DeskApi, which will fetch simulator settings from DB
            var response = await deskApi.GetDeskState(macAddress, desk.CompanyId);

            return response.PositionMm;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting height for desk {macAddress}", macAddress);
            return null;
        }
    }

    private async Task NotifyDeskHeightChanged(Desk desk, int oldHeight, int newHeight)
    {
        var update = new DeskHeightUpdate
        {
            DeskId = desk.Id,
            RoomId = desk.RoomId,
            OldHeight = oldHeight,
            NewHeight = newHeight,
            Timestamp = DateTime.UtcNow
        };

        // Send to all clients watching this specific desk
        await hubContext.Clients
            .Group($"desk-{desk.Id}")
            .SendAsync("DeskHeightChanged", update);

        // Send to all clients watching this room
        await hubContext.Clients
            .Group($"room-{desk.RoomId}")
            .SendAsync("DeskHeightChanged", update);

    }

}