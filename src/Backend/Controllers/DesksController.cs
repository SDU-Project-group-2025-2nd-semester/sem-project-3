using Backend.Auth;
using Backend.Data.Database;
using Backend.Services.DeskApis;
using Backend.Services.Desks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
[Authorize]
public class DesksController(IDeskService deskService) : ControllerBase
{

    [HttpGet]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<List<Desk>>> GetAll(Guid companyId)
    {
        var desks = await deskService.GetAllDesksAsync(companyId);
        return Ok(desks);
    }

    [HttpGet("room/{roomId:guid}")]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<List<Desk>>> GetDesks(Guid companyId, Guid roomId)
    {
        var desks = await deskService.GetDesksByRoomAsync(companyId, roomId);

        if (desks.Count == 0)
            return NotFound();

        return Ok(desks);
    }


    [HttpGet("{deskId}")]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<Desk>> GetDesk(Guid companyId, Guid deskId)
    {
        var desk = await deskService.GetDeskAsync(companyId, deskId);
        if (desk is null)
            return NotFound();

        return Ok(desk);
    }



    [HttpPost]
    [RequireRole(UserRole.Admin)]
    public async Task<ActionResult<Desk>> CreateDesk(Guid companyId, [FromBody] CreateDeskDto dto)
    {
        var createdDesk = await deskService.CreateDeskAsync(companyId, dto);
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

    [HttpPut("{deskId}/height")]
    [RequireRole(UserRole.User, UserRole.Admin, UserRole.Janitor)]
    public async Task<IActionResult> UpdateHeightDesk(Guid companyId, Guid deskId, [FromBody] int newHeight)
    {
        var updatedSuccessfully = await deskService.UpdateDeskHeightAsync(companyId, deskId, newHeight);

        if (!updatedSuccessfully)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Un-adopts a desk, removing it from the database but keeping it available in the simulator.
    /// The desk will appear in the "not-adopted" list after this operation.
    /// </summary>
    [HttpDelete("unadopt/{deskId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> UnadoptDesk(Guid companyId, Guid deskId)
    {
        var unadoptedSuccessfully = await deskService.UnadoptDeskAsync(companyId, deskId);

        if (!unadoptedSuccessfully)
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
        try
        {
            var desks = await deskService.GetNotAdoptedDesks(companyId);
            return Ok(desks);
        }
        catch (SimulatorConfigurationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (SimulatorConnectionException ex)
        {
            return StatusCode(502, new { error = ex.Message });
        }
    }

    [HttpGet("from-mac/{macAddress}")]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<Guid>> GetDeskIdByMac(Guid companyId, string macAddress)
    {
        var desk = await deskService.GetDeskByMacAsync(companyId, macAddress);

        if (desk is null)
            return NotFound();

        return Ok(desk.Id);
    }
}