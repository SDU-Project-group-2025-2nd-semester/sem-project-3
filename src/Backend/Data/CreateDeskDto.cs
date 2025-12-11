using System.ComponentModel.DataAnnotations;

namespace Backend.Data;

public class CreateDeskDto
{
    [Required]
    [MaxLength(17)]
    public string MacAddress { get; set; } = string.Empty;
    
    [MaxLength(17)]
    public string? RpiMacAddress { get; set; }
    
    [Required]
    public Guid RoomId { get; set; }
    
    public int Height { get; set; }
    
    public int MaxHeight { get; set; }
    
    public int MinHeight { get; set; }
}
