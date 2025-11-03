using Backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
public class DesksController : ControllerBase
{

    [HttpGet]
    public List<Desk> GetDesks()
    {
        return null!;
    }

    [HttpGet("{roomId}")]
    public Rooms GetDesks(Guid roomId)
    {
        return null!;
    }

    [HttpPost]
    public Rooms CreateDesks(Rooms room)
    {
        return null!;
    }

    [HttpPut]
    public Rooms UpdateDesks(Rooms room)
    {
        return null!;
    }

    [HttpDelete("{roomId}")]
    public void DeleteDesks(Guid roomId)
    {
    }
}