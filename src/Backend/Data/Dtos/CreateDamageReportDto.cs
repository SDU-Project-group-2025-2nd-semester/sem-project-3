using System.ComponentModel.DataAnnotations;

namespace Backend.Data.Dtos;

public class CreateDamageReportDto
{
    [MaxLength(512)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Issue { get; set; } = string.Empty;

    [Required]
    public Guid DeskId { get; set; }

}