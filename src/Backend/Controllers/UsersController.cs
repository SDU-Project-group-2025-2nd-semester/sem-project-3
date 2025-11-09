using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
public class UsersController(IUserService userService) : ControllerBase
{

    [HttpGet("{userId}")]
    public async Task<ActionResult<User>> GetUser(Guid companyId, string userId)
    {
        var user = await userService.GetUserAsync(companyId, userId);

        if (user is null)
            return NotFound();

        return Ok(user);
    }


    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateUser(Guid companyId, string userId, [FromBody] User updated)
    {
        var success = await userService.UpdateUserAsync(companyId, userId, updated);

        if (!success)
            return NotFound();

        return NoContent();
    }
}