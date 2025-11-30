using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
[Authorize]
public class ReservationController(IReservationService reservationService, BackendContext dbContext) : ControllerBase
{
    // Return ReservationViewDto for consistency ?
    [HttpGet]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<List<Reservation>>> GetReservations(
        Guid companyId,
        [FromQuery] string? userId = null,
        [FromQuery] Guid? deskId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        return Ok(await reservationService.GetReservations(companyId, userId, deskId, startDate, endDate));
    }

    /* [HttpGet("me")]
    public async Task<ActionResult<List<Reservation>>> GetMyReservations(Guid companyId)
    {

        var userId = User.GetUserId();

        return Ok(await reservationService.GetReservations(companyId, userId));
    } */
 
    [HttpGet("me")]
    public async Task<ActionResult<List<ReservationViewDto>>> GetMyReservations(Guid companyId)
    {
        var userId = User.GetUserId();

        var reservations = await dbContext.Reservations
            .Include(r => r.Desk)
            .ThenInclude(d => d.Room)
            .Where(r => r.CompanyId == companyId && r.UserId == userId)
            .Select(r => new ReservationViewDto(
                r.Id,
                r.Start,
                r.End,
                r.DeskId,
                r.Desk != null ? r.Desk.MacAddress : null, // TODO: Replace MacAddress with Label, once it exists in the Desk model
                r.Desk != null ? r.Desk.RoomId : Guid.Empty,
                r.Desk != null && r.Desk.Room != null ? r.Desk.Room.Id.ToString() : null // TODO: Replace Id.ToString() with Label, once it exists in the Room model
            ))
            .ToListAsync();

        return Ok(reservations);
    }

    // Return ReservationViewDto for consistency ?
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
    [RequireRole(UserRole.User, UserRole.Admin)]
    public async Task<ActionResult<Reservation>> CreateReservation(CreateReservationDto createReservationDto, Guid companyId)
    {
        var userId = User.GetUserId();

        var reservation = await reservationService.CreateReservation(createReservationDto, userId, companyId);
        
        if (reservation is null)
        {
            return Conflict("Requested time is already occupied!");
        }

        return Ok(reservation);
    }

    [HttpDelete("{reservationId}")]
    [RequireRole(UserRole.User, UserRole.Admin, UserRole.Janitor)]
    public async Task<ActionResult> DeleteReservation(Guid reservationId, Guid companyId)
    {
        var reservation = await reservationService.GetReservation(reservationId);

        if (reservation is null)
        {
            return NotFound();
        }

        var currentUserId = User.GetUserId();
        var currentUser = await dbContext.Users.FindAsync(currentUserId);

        if (currentUser is null)
        {
            return Unauthorized();
        }

        var isAdmin = currentUser.Role == UserRole.Admin;
        
        var isJanitor = currentUser.Role == UserRole.Janitor;
        
        if (!isAdmin && reservation.UserId != currentUserId)
        {
            return Forbid();
        }

        await reservationService.DeleteReservation(reservation);

        return Ok();
    }
}