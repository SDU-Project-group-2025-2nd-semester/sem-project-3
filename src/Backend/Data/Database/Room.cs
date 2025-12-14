using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Data.Database;

public class Room
{
    public Guid Id { get; set; }

    public string ReadableId { get; set; } = string.Empty;

    public List<Guid> DeskIds { get; set; } = [];

    [Column(TypeName = "jsonb")] public OpeningHours OpeningHours { get; set; } = default;

    public Guid CompanyId { get; set; }

    #region Navigation Properties - Ignored in JSON

    [JsonIgnore]
    public Company? Company { get; set; }

    [JsonIgnore]
    public List<Desk>? Desks { get; set; }

    #endregion
}