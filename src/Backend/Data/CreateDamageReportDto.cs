using System.ComponentModel.DataAnnotations;

namespace Backend.Data;

public class CreateDamageReportDto
{
    [MaxLength(512)]
    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public Guid DeskId { get; set; }

}