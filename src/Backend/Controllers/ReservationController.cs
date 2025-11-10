using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
public class ReservationController(IReservationService reservationService) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<Reservation>>> GetReservations(
        Guid companyId,
        [FromQuery] string? userId = null,
        [FromQuery] Guid? deskId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        return Ok(await reservationService.GetReservations(companyId, userId, deskId, startDate, endDate));
    }

    [HttpGet("me")]
    public async Task<ActionResult<List<Reservation>>> GetMyReservations(Guid companyId)
    {

        var userId = User.GetUserId();

        return Ok(await reservationService.GetReservations(companyId, userId));
    }

    [HttpGet("{reservationId}")]
    public async Task<ActionResult<Reservation>> GetReservation(Guid reservationId)
    {
        var reservation = await reservationService.GetReservation(reservationId);

        if (reservation is null)
        {
            return NotFound();
        }

        return Ok(reservation);
    }

    [HttpPost]
    public async Task<ActionResult<Reservation>> CreateReservation(CreateReservationDto createReservationDto, Guid companyId)
    {

        var userId = User.GetUserId();

        // TODO: Check for permissions here

        var reservation = await reservationService.CreateReservation(createReservationDto, userId, companyId);

        if (reservation is null)
        {
            return Conflict("Requested time is already occupied!");
        }

        return Ok(reservation);
    }

    [HttpDelete("{reservationId}")]
    public async Task<ActionResult> DeleteReservation(Guid reservationId, Guid companyId)
    {
        var reservation = await reservationService.GetReservation(reservationId);

        if (reservation is null)
        {
            return NotFound();
        }

        // Check for permissions here

        await reservationService.DeleteReservation(reservation);

        return Ok();
    }
}