using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Data;

public class Company
{
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    
    //List od Users and Admins deleted

    public List<Rooms> Rooms { get; set; }

    /// <summary>
    /// Allows user to join the co-working space
    /// </summary>
    /// <remarks>
    /// Is optional. If not set, users need to have correct email address.
    /// </remarks>
    public string? SecretInviteCode { get; set; }
    
    [JsonIgnore]
    public List<UserCompany> UserMemberships { get; set; } = [];
    
    public string? SimulatorLink { get; set; }
    
    public string? SimulatorApiKey { get; set; }

}