using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Data;

public class User : IdentityUser
{
    // TODO: Roles

    [MaxLength(100)] public string FirstName { get; set; } = "Not set";

    [MaxLength(100)] public string LastName { get; set; } = "Not set";

    public double StandingHeight { get; set; }

    public double SittingHeight { get; set; }

    public HealthRemindersFrequency HealthRemindersFrequency { get; set; }

    [JsonIgnore]
    public List<Reservation> Reservations { get; set; }

    public int SittingTime { get; set; }

    public int StandingTime { get; set; }

    public DateTime AccountCreation { get; set; } = new();

    // TODO: Implement time-series db for tracking user posture over time 
}