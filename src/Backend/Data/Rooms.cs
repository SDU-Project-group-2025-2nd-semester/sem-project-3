using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Data;

public class Rooms
{
    public Guid Id { get; set; }
    
    public string ReadableId { get; set; } = default!;

    public List<Guid> DeskIds { get; set; }

    [Column(TypeName = "jsonb")]
    public OpeningHours OpeningHours { get; set; }

    public Guid CompanyId { get; set; }

    #region Navigation Properties - Ignored in JSON

    [JsonIgnore]
    public Company Company { get; set; }

    [JsonIgnore]
    public List<Desk> Desks { get; set; }

    #endregion
}