using Backend.Auth;
using Backend.Data.Database;
using Backend.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController(IUserService userService) : ControllerBase
{

    [HttpGet("{userId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<ActionResult<User>> GetUser(string userId)
    {
        var user = await userService.GetUserAsync(userId);

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [HttpGet]
    [RequireRole(UserRole.Admin)]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers([FromQuery] Guid? companyId)
    {
        try
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId == null) return Unauthorized();

            var users = await userService.GetUsersByCompanyAsync(currentUserId, companyId);
            return Ok(users);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{userId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var deleted = await userService.DeleteUserAsync(userId);
        if (!deleted)
            return NotFound();

        return NoContent();
    }


    [HttpPut("{userId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDto updated)
    {
        var success = await userService.UpdateUserAsync(userId, updated);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpGet("me")]
    public async Task<ActionResult<User>> GetMyInfo()
    {
        var currentUserId = User.GetUserId();
        var user = await userService.GetUserAsync(currentUserId);

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [HttpGet("me/companies")]
    public async Task<ActionResult> GetMyCompanies()
    {
        var currentUserId = User.GetUserId();
        var companies = await userService.GetUserCompaniesAsync(currentUserId);

        return Ok(companies);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyInfo([FromBody] UpdateUserDto updated)
    {
        var currentUserId = User.GetUserId();

        var success = await userService.UpdateMyInfoAsync(currentUserId, updated);

        if (!success)
            return NotFound();

        return NoContent();
    }
}