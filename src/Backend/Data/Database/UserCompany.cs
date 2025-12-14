using System.ComponentModel.DataAnnotations;

namespace Backend.Data.Database;

public class UserCompany
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public User User { get; set; }

    [Required]
    public Guid CompanyId { get; set; }
    
    [Required]
    public Company Company { get; set; }
    
    [Required]
    public UserRole Role { get; set; }
}