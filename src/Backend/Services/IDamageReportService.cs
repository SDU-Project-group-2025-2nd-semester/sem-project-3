using Backend.Data;

namespace Backend.Services;

public interface IDamageReportService
{
    Task<List<DamageReport>> GetAllDamageReportsAsync(Guid companyId);
    Task<DamageReport?> GetDamageReportAsync(Guid damageReportId);
    Task DeleteDamageReport(DamageReport damageReport);
    Task<DamageReport> CreateDamageReport(CreateDamageReportDto damageReportDto, string userId, Guid companyId);
    Task UpdateReportStatusAsync(bool isResolved, Guid damageReportId, string userId);
}