using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Data;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CompanyController(BackendContext dbContext) : ControllerBase
{
    [HttpPost("{companyId}/access/")]
    public bool AccessCompany(string companyId, [FromBody] string accessCode)
    {
        return false;
    }
    
    [HttpGet("{companyId:guid}/simulator")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> GetSimulatorSettings(Guid companyId)
    {
        var company = await dbContext.Companies.FindAsync(companyId);

        if (company is null)
            return NotFound();

        return Ok(new { SimulatorLink = company.SimulatorLink });
    }
    
    [HttpPut("{companyId:guid}/simulator")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> UpdateSimulatorSettings(
        Guid companyId, [FromBody] CompanySimulatorSettingsDto dto)
    {
        var company = await dbContext.Companies.FindAsync(companyId);

        if (company is null)
            return NotFound();

        company.SimulatorLink = dto.SimulatorLink;
        company.SimulatorApiKey = dto.SimulatorApiKey;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}