using System.ComponentModel.DataAnnotations;

namespace Backend.Data.Dtos;

public class CreateDeskDto
{
    [Required]
    [MaxLength(17)]
    public string MacAddress { get; set; } = string.Empty;
    
    [MaxLength(17)]
    public string? RpiMacAddress { get; set; }
    
    [Required]
    public Guid RoomId { get; set; }
}
