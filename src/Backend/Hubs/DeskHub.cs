using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs;

public class DeskHub : Hub
{
    /// <summary>
    /// Subscribe to updates for a specific desk
    /// </summary>
    public async Task SubscribeToDesk(string deskId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"desk-{deskId}");
    }

    /// <summary>
    /// Unsubscribe from desk updates
    /// </summary>
    public async Task UnsubscribeFromDesk(string deskId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"desk-{deskId}");
    }

    /// <summary>
    /// Subscribe to all desks in a room
    /// </summary>
    public async Task SubscribeToRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"room-{roomId}");
    }

    /// <summary>
    /// Unsubscribe from room updates
    /// </summary>
    public async Task UnsubscribeFromRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"room-{roomId}");
    }

    /// <summary>
    /// Subscribe to all desks in a company
    /// </summary>
    public async Task SubscribeToCompany(string companyId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"company-{companyId}");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}