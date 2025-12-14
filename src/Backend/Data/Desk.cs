using Backend.Services;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Data;

public class Desk
{
    public Guid Id { get; set; }

    /// <summary>
    /// Current desk height
    /// </summary>
    /// <remarks>
    /// Value is in millimeters
    /// </remarks>
    
    public string ReadableId { get; set; } = default!;
    public int Height { get; set; } 

    /// <summary>
    /// Maximal desk height
    /// </summary>
    /// <remarks>
    /// Value is in millimeters
    /// </remarks>
    public int MaxHeight { get; set; }

    /// <summary>
    /// Minimal desk height
    /// </summary>
    /// <remarks>
    /// Value is in millimeters
    /// </remarks>
    public int MinHeight { get; set; }

    /// <summary>
    /// MacAddress of the desk's BLE unit
    /// </summary>
    /// <remarks>
    /// In the format XX:XX:XX:XX:XX:XX
    /// </remarks>
    [Required]
    [MaxLength(17)] // TODO: Add Regex validation for MAC address format
    public string MacAddress { get; set; }

    [MaxLength(17)] // TODO: Add Regex validation for MAC address format
    public string RpiMacAddress { get; set; }

    [Column(TypeName = "jsonb")]
    public DeskMetadata Metadata { get; set; } = new();

    /// <summary>
    /// Last time the desk height was changed significantly (for health reminder tracking)
    /// </summary>
    public DateTime? LastHeightChangeTime { get; set; }

    /// <summary>
    /// Indicates if a health reminder has been sent and user hasn't responded yet
    /// </summary>
    public bool NeedsHealthReminder { get; set; }

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