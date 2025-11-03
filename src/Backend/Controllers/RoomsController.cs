using Backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
public class RoomsController(string companyId) : ControllerBase
{

    [HttpGet]
    public List<Rooms> GetRooms()
    {
        return null!;
    }

    [HttpGet("{roomId}")]
    public Rooms GetRoom(Guid roomId)
    {
        return null!;
    }

    [HttpPost]
    public Rooms CreateRoom(Rooms room)
    {
        return null!;
    }

    [HttpPut]
    public Rooms UpdateRoom(Rooms room) // Just for room changes
    {
        return null!;
    }

    [HttpDelete("{roomId}")]
    public void DeleteRoom(Guid roomId)
    {
    }


}