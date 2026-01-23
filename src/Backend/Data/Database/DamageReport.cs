using Backend.Data.Dtos;
using System.ComponentModel.DataAnnotations;

namespace Backend.Data.Database;

public class DamageReport
{
    public Guid Id { get; set; }

    [MaxLength(512)]
    public string Description { get; set; } = string.Empty;

    public string Issue { get; set; } = string.Empty;

    public DateTime SubmitTime { get; set; } = DateTime.UtcNow;

    public DateTime? ResolveTime { get; set; }

    public bool IsResolved { get; set; }

    public string? SubmittedById { get; set; }

    public string? ResolvedById { get; set; }

    public Guid DeskId { get; set; }

    public Guid CompanyId { get; set; }

    #region Navigation Properties - Ignored in JSON

    [JsonIgnore]
    public User SubmittedBy { get; set; }

    [JsonIgnore]
    public User? ResolvedBy { get; set; }

    [JsonIgnore]
    public Desk Desk { get; set; }

    [JsonIgnore]
    public Company Company { get; set; }

    #endregion

    public static implicit operator DamageReport(CreateDamageReportDto dto) =>
        new()
        {
            Description = dto.Description,
            Issue = dto.Issue,
            DeskId = dto.DeskId,
            IsResolved = false
        };
}