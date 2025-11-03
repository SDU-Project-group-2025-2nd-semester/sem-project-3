using System.ComponentModel.DataAnnotations;

namespace Backend.Data;

public class Company
{
    public Guid Id { get; set; }

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