using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
[Authorize]
public class RoomsController(IRoomService roomService) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<Rooms>>> GetRooms(Guid companyId)
    {
        var rooms = await roomService.GetAllRoomsAsync(companyId);
        return Ok(rooms);
    }

    [HttpGet("{roomId}")]
    public async Task<ActionResult<Rooms>> GetRoom(Guid companyId, Guid roomId)
    {
        var room = await roomService.GetRoomAsync(companyId, roomId);
        if (room is null)
            return NotFound();
        
        return Ok(room);
    }

    [HttpPost]
    [RequireRole(UserRole.Admin)]
    public async Task<ActionResult<Rooms>> CreateRoom(Guid companyId, [FromBody] Rooms room)
    {
        var created = await roomService.CreateRoomAsync(companyId, room);
        return CreatedAtAction(nameof(GetRoom), new { companyId, room.Id }, created);
    }

    [HttpPut("{roomId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> UpdateRoom(Guid companyId, Guid roomId, [FromBody] Rooms updated)
    {
        var update = await roomService.UpdateRoomAsync(companyId, roomId, updated);
        if (!update)
            return NotFound();

        return NoContent();
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