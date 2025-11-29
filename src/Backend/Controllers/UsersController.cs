using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;

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
    public async Task<ActionResult<List<User>>> GetAllUsers()
    {
        var users = await userService.GetAllUsersAsync();
        return Ok(users);
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
    public async Task<IActionResult> UpdateUser(string userId, [FromBody] User updated)
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

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyInfo([FromBody] User updated)
    {
        var currentUserId = User.GetUserId();

        var success = await userService.UpdateUserAsync(currentUserId, updated);

        if (!success)
            return NotFound();

        return NoContent();
    }
}