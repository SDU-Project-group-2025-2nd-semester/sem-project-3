using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CompanyController(BackendContext dbContext) : ControllerBase
{
    [HttpPost("{companyId}/access/")]
    public async Task<IActionResult> EnterCompany(Guid companyId, [FromBody] string accessCode)
    {
        var company = await dbContext.Companies.FindAsync(companyId);

        if (company is null)
        {
            return NotFound();
        }

        if (company.SecretInviteCode != accessCode)
        {
            return Unauthorized();
        }

        var currentUserId = User.GetUserId();
        var user = await dbContext.Users.FindAsync(currentUserId);

        if (user is null)
        {
            return NotFound();
        }

        var uc = new UserCompany() { Company = company, User = user, Role = UserRole.User };

        dbContext.UserCompanies.Add(uc);

        return Ok();
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