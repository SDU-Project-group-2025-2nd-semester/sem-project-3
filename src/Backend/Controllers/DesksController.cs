using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
[Authorize]
public class DesksController(IDeskService deskService) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<Desk>>> GetAll(Guid companyId)
    {
        var desks = await deskService.GetAllDesksAsync(companyId);
        return Ok(desks);
    }

    [HttpGet("room/{roomId:guid}")]
    public async Task<ActionResult<List<Desk>>> GetDesks(Guid companyId, Guid roomId)
    {
        var desks = await deskService.GetDesksByRoomAsync(companyId, roomId);

        if (desks.Count == 0)
            return NotFound();

        return Ok(desks);
    }
    
    
    [HttpGet("{deskId}")]
    public async Task<ActionResult<Desk>> GetDesk(Guid companyId, Guid deskId)
    {
        var desk = await deskService.GetDeskAsync(companyId, deskId);
        if (desk is null)
            return NotFound();

        return Ok(desk);
    }

    [HttpPost]
    [RequireRole(UserRole.Admin)]
    public async Task<ActionResult<Desk>> CreateDesk(Guid companyId, [FromBody] Desk desk)
    {
        var createdDesk = await deskService.CreateDeskAsync(companyId, desk);
        return CreatedAtAction(nameof(GetDesk), new { companyId, deskId = createdDesk.Id }, createdDesk);
    }

    [HttpPut("{deskId}")]
    [RequireRole(UserRole.Admin, UserRole.Janitor)]
    public async Task<IActionResult> UpdateDesk(Guid companyId, Guid deskId, [FromBody] UpdateDeskDto updated)
    {
        var updatedSuccessfully = await deskService.UpdateDeskAsync(companyId, deskId, updated);

        if (!updatedSuccessfully)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{deskId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> DeleteDesk(Guid companyId, Guid deskId)
    {
        var deletedSuccessfully = await deskService.DeleteDeskAsync(companyId, deskId);

        if (!deletedSuccessfully)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Gets a list of MAC addresses of desks that have not been adopted yet.
    /// </summary>
    /// <param name="companyId"></param>
    /// <returns>A list of MAC Address of desk not yet adopted</returns>
    [HttpGet("not-adopted")]
    [RequireRole(UserRole.Admin, UserRole.Janitor)]
    public async Task<ActionResult<List<string>>> GetNotAdoptedDesks(Guid companyId)
    {
        var desks = await deskService.GetNotAdoptedDesks(companyId);
        return Ok(desks);
    }
}