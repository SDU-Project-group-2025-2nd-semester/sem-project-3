using System.Text.Json.Serialization;

namespace Backend.Data;

public class Desk
{
    public Guid Id { get; set; }

    /// <summary>
    /// Current desk height
    /// </summary>
    /// <remarks>
    /// Value is in centimeters
    /// </remarks>
    public double Height { get; set; } // in cm

    /// <summary>
    /// Maximal desk height
    /// </summary>
    /// <remarks>
    /// Value is in centimeters
    /// </remarks>
    public double MaxHeight { get; set; }

    /// <summary>
    /// Minimal desk height
    /// </summary>
    /// <remarks>
    /// Value is in centimeters
    /// </remarks>
    public double MinHeight { get; set; }

    public Guid RoomId { get; set; }

    public Guid CompanyId { get; set; }

    public List<Guid> ReservationIds { get; set; }

    #region Navigation Properties - Ignored in JSON

    [JsonIgnore]
    public List<Reservation> Reservations { get; set; } = [];

    [JsonIgnore]
    public Rooms Room { get; set; }

    [JsonIgnore] 
    public Company Company { get; set; }

    #endregion
}