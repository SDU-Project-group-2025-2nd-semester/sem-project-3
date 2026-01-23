using Backend.Data.Dtos;

namespace Backend.Data.Database;

public class Reservation
{
    public Guid Id { get; set; }

    public DateTime Start { get; set; }

    public DateTime End { get; set; }

    public string? UserId { get; set; }

    public Guid DeskId { get; set; }

    public Guid CompanyId { get; set; }

    #region Navigation Properties - Ignored in JSON

    [JsonIgnore] 
    public Company Company { get; set; }

    [JsonIgnore]
    public User? User { get; set; }

    [JsonIgnore]
    public Desk Desk { get; set; }

    /// <summary>
    /// Automatic height adjustment job ID
    /// </summary>
    public string? JobId { get; set; }

    #endregion

    public static implicit operator Reservation(CreateReservationDto dto) =>
        new()
        {
            Start = dto.Start,
            End = dto.End,
            DeskId = dto.DeskId
        };
}