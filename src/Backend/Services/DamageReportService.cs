using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class DamageReportService(BackendContext dbContext) : IDamageReportService
{
    public async Task<List<DamageReport>> GetAllDamageReportsAsync(Guid companyId)
    {
        var reports = await dbContext.DamageReports.Where(r => r.Company.Id == companyId).ToListAsync();

        return reports;
    }

    public async Task<DamageReport?> GetDamageReportAsync(Guid damageReportId)
    {
        var report = await dbContext.DamageReports.FindAsync(damageReportId);

        return report;
    }

    public async Task DeleteDamageReport(DamageReport damageReport)
    {
        dbContext.DamageReports.Remove(damageReport);

        await dbContext.SaveChangesAsync();
    }

    public async Task<DamageReport> CreateDamageReport(CreateDamageReportDto damageReportDto, string userId,
        Guid companyId)
    {
        DamageReport damageReport = damageReportDto;

        damageReport.CompanyId = companyId;
        damageReport.SubmittedById = userId;

        dbContext.DamageReports.Add(damageReport);

        await dbContext.SaveChangesAsync();

        return damageReport;
    }

    public async Task UpdateReportStatusAsync(bool isResolved, Guid damageReportId, string userId)
    {
        var report = await dbContext.DamageReports.FindAsync(damageReportId);

        if (report is null)
        {
            throw new ArgumentException("Report was not found", nameof(damageReportId));
        }

        if (isResolved)
        {
            report.IsResolved = true;

            report.ResolveTime = DateTime.UtcNow;

            report.ResolvedById = userId;
        }
        else
        {
            report.IsResolved = false;

            report.ResolveTime = null;

            report.ResolvedById = null;
        }

        await dbContext.SaveChangesAsync();
    }
}