using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/{companyId}/[controller]")]
[ApiController]
[Authorize]
public class DamageReportController(IDamageReportService reportService) : ControllerBase
{

    [HttpGet]
    [RequireRole(UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<List<DamageReport>>> GetDamageReports([FromRoute] Guid companyId)
    {
        var reports = await reportService.GetAllDamageReportsAsync(companyId);

        return Ok(reports);
    }

    [HttpGet("{damageReportId}")]
    [RequireRole(UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<DamageReport>> GetDamageReport(Guid damageReportId)
    {
        var report = await reportService.GetDamageReportAsync(damageReportId);

        if (report is null)
        {
            return NotFound();
        }

        return Ok(report);
    }

    [HttpPost()]
    [RequireRole(UserRole.User, UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<DamageReport>> CreateDamageReport([FromBody] CreateDamageReportDto damageReportDto, [FromRoute] Guid companyId)
    {
        var userId = User.GetUserId();

        var report = await reportService.CreateDamageReport(damageReportDto, userId, companyId);

        return report;
    }
    
    [HttpPut("{damageReportId}")]
    [RequireRole(UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult<DamageReport>> UpdateDamageReport([FromRoute] Guid damageReportId, [FromBody] bool isResolved, [FromRoute] Guid companyId)
    {
        var userId = User.GetUserId();

        var report = await reportService.GetDamageReportAsync(damageReportId);

        if (report is null)
        {
            return NotFound();
        }

        await reportService.UpdateReportStatusAsync(isResolved, damageReportId, userId);

        return report;
    }

    [HttpDelete("{damageReportId}")]
    [RequireRole(UserRole.Janitor, UserRole.Admin)]
    public async Task<ActionResult> DeleteDamageReport(Guid damageReportId)
    {

        var damageReport = await reportService.GetDamageReportAsync(damageReportId);

        if (damageReport is null)
        {
            return NotFound();
        }

        await reportService.DeleteDamageReport(damageReport);

        return Ok();
    }
}