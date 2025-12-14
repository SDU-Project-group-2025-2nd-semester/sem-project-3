using Backend.Auth;
using Backend.Data.Database;
using Backend.Services.Reservations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
 
    [HttpGet("me")]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
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
                r.Desk != null ? r.Desk.ReadableId : null,
                r.Desk != null ? r.Desk.RoomId : Guid.Empty,
                r.Desk != null && r.Desk.Room != null ? r.Desk.Room.ReadableId : null
            ))
            .ToListAsync();

        return Ok(reservations);
    }

    // Return ReservationViewDto for consistency ?
    [HttpGet("{reservationId}")]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
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

        var membership = currentUser.CompanyMemberships
            .FirstOrDefault(cm => cm.CompanyId == companyId);

        if (membership == null)
            return Forbid();
        
        var isAdmin = membership.Role == UserRole.Admin;
        var isJanitor = membership.Role == UserRole.Janitor;
        
        if (!isAdmin && reservation.UserId != currentUserId)
        {
            return Forbid();
        }

        await reservationService.DeleteReservation(reservation);

        return Ok();
    }
}