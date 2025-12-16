using Backend.Auth;
using Backend.Data.Database;
using Backend.Services.Rooms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
[Authorize]
public class RoomsController(IRoomService roomService) : ControllerBase
{

    [HttpGet]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<List<Room>>> GetRooms(Guid companyId)
    {
        var rooms = await roomService.GetAllRoomsAsync(companyId);
        return Ok(rooms);
    }

    [HttpGet("{roomId}")]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<Room>> GetRoom(Guid companyId, Guid roomId)
    {
        var room = await roomService.GetRoomAsync(companyId, roomId);
        if (room is null)
            return NotFound();

        return Ok(room);
    }

    [HttpPost]
    [RequireRole(UserRole.Admin)]
    public async Task<ActionResult<Room>> CreateRoom(Guid companyId, [FromBody] Room room)
    {
        var created = await roomService.CreateRoomAsync(companyId, room);
        return CreatedAtAction(nameof(GetRoom), new { companyId, roomId = created.Id }, created);
    }

    [HttpPut("{roomId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> UpdateRoom(Guid companyId, Guid roomId, [FromBody] Room updated)
    {
        var update = await roomService.UpdateRoomAsync(companyId, roomId, updated);
        if (!update)
            return NotFound();

        return NoContent();
    }

    [HttpPut("{roomId}/height")]
    [RequireRole(UserRole.Admin, UserRole.Janitor)]
    public async Task<IActionResult> SetRoomHeight(Guid companyId, Guid roomId, [FromBody] int newHeight)
    {
        var update = await roomService.SetRoomHeightAsync(companyId, roomId, newHeight);
        if (!update)
            return NotFound();

        return Ok();
    }

    [HttpDelete("{roomId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> DeleteRoom(Guid companyId, Guid roomId)
    {
        var delete = await roomService.DeleteRoomAsync(companyId, roomId);
        if (!delete)
            return NotFound();

        return NoContent();
    }



}