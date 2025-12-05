using System.Text.Json.Serialization;

namespace Backend.Data;

public class UserCompany
{
    public string UserId { get; set; } = default!;
    
    public User User { get; set; } = default!;

    public Guid CompanyId { get; set; }
    
    public Company Company { get; set; } = default!;
    
    
    public UserRole Role { get; set; }
}