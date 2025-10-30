using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Data;

public class BackendContext(DbContextOptions<BackendContext> options) : IdentityDbContext<User>(options)
{
    public DbSet<Company> Companies { get; set; }

    public DbSet<Rooms> Rooms { get; set; }

    public DbSet<Desk> Desks { get; set; }

    public DbSet<Reservation> Reservations { get; set; }

    public DbSet<DamageReport> DamageReports { get; set; }



}

public class User : IdentityUser
{
    // TODO: Roles

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; }

    [MaxLength(100)]
    public string LastName { get; set; }

    public double StandingHeight { get; set; }

    public double SittingHeight { get; set; }

    public HealthRemindersFrequency HealthRemindersFrequency { get; set; }

    [JsonIgnore]
    public List<Reservation> Reservations { get; set; }

    public int SittingTime { get; set; }

    public int StandingTime { get; set; }

    // TODO: Implement time-series db for tracking user posture over time 
}


public enum HealthRemindersFrequency
{
    Low,
    Medium,
    High
}

public class Company
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    public List<User> Admins { get; set; }

    public List<User> Users { get; set; }

    public List<Rooms> Rooms { get; set; }

    /// <summary>
    /// Allows user to join the co-working space
    /// </summary>
    /// <remarks>
    /// Is optional. If not set, users need to have correct email address.
    /// </remarks>
    public string? SecretInviteCode { get; set; }

}

public class Rooms
{
    public Guid Id { get; set; }

    public List<Guid> DeskIds { get; set; }

    public List<Desk> Desks { get; set; }

    public OpeningHours OpeningHours { get; set; }

    public Guid CompanyId { get; set; }
}

public class OpeningHours
{
    public TimeOnly OpeningTime { get; set; }
    public TimeOnly ClosingTime { get; set; }

    public DaysOfTheWeek DaysOfTheWeek { get; set; }
}

[Flags]
public enum DaysOfTheWeek : short
{
    None = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 4,
    Thursday = 8,
    Friday = 16,
    Saturday = 32,
    Sunday = 64
}

public class Desk
{
    public Guid Id { get; set; }

    public List<Reservation> Reservations { get; set; }

    public double Height { get; set; } // in cm

    public double MaxHeight { get; set; }

    public double MinHeight { get; set; }
}

public class Reservation
{
    public Guid Id { get; set; }

    public DateTime Start { get; set; }

    public DateTime End { get; set; }

    public User User { get; set; }

}

public class DamageReport
{
    public Guid Id { get; set; }

    [MaxLength(512)]
    public string Description { get; set; }

    public DateTime SubmitTime { get; set; }

    public User SubmittedBy { get; set; }

    public DateTime ResolveTime { get; set; }

    public User ResolvedBy { get; set; }

    public bool IsResolved { get; set; }

    public Desk Desk { get; set; }
}

[Route("api/[controller]")]
[ApiController]
public class CompanyController : ControllerBase
{
    [HttpPost("{companyId}/access/")]
    public bool AccessCompany(string companyId, [FromBody] string accessCode)
    {
        return false;
    }
}


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


[Route("api/{companyId}/[controller]")]
[ApiController]
public class DesksController(string companyId) : ControllerBase
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



[Route("api/{companyId}/[controller]")]
[ApiController]
public class ReservationController(string companyId) : ControllerBase
{

    [HttpGet]
    public List<Desk> GetReservations(
        [FromQuery] string? userId = null,
        [FromQuery] Guid? deskId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null
        )
    {
        return null!;
    }

    [HttpGet("me")]
    public List<Reservation> GetMyReservations()
    {
        // Get reservations for the authenticated user
        // Requires authentication middleware
        return null!;
    }

    [HttpGet("{reservationId}")]
    public Rooms GetReservation(Guid reservationId)
    {
        return null!;
    }

    [HttpPost]
    public Rooms CreateReservation(Reservation room)
    {
        return null!;
    }

    [HttpPut]
    public Rooms UpdateReservation(Reservation room)
    {
        return null!;
    }

    [HttpDelete("{reservationId}")]
    public void DeleteReservation(Guid reservationId)
    {
    }
}


[Route("api/{companyId}/[controller]")]
[ApiController]
public class DamageReportController(string companyId) : ControllerBase
{

    [HttpGet]
    public List<DamageReport> GetDamageReports()
    {
        return null!;
    }

    [HttpGet("{damageReportId}")]
    public DamageReport GetDamageReport(Guid damageReportId)
    {
        return null!;
    }

    [HttpPost]
    public DamageReport CreateDamageReport(DamageReport room)
    {
        return null!;
    }

    [HttpPut]
    public DamageReport UpdateReservation(DamageReport room)
    {
        return null!;
    }

    [HttpDelete("{damageReportId}")]
    public void DeleteDamageReport(Guid damageReportId)
    {
    }
}

