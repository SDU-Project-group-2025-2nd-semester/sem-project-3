using Backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{

    [HttpGet("{userId}")]
    public User GetUser(string userId)
    {
        return null!;
    }

    [HttpPut]
    public User UpdateUser(User company)
    {
        return null!;
    }
}