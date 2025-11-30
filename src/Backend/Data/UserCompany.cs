using System.Text.Json.Serialization;

namespace Backend.Data;

public class UserCompany
{
    public string UserId { get; set; } = default!;
    [JsonIgnore]
    public User User { get; set; } = default!;

    public Guid CompanyId { get; set; }
    [JsonIgnore]
    public Company Company { get; set; } = default!;
}