using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // Ensure the company has a SecretInviteCode set before allowing access
        if (string.IsNullOrEmpty(company.SecretInviteCode) || company.SecretInviteCode != accessCode)
        {
            return Unauthorized();
        }

        var currentUserId = User.GetUserId();
        var user = await dbContext.Users.FindAsync(currentUserId);

        if (user is null)
        {
            return NotFound();
        }

        // Check if the user is already a member of the company
        bool alreadyMember = await dbContext.UserCompanies
            .AnyAsync(uc => uc.Company.Id == company.Id && uc.User.Id == user.Id);
        if (alreadyMember)
        {
            return Conflict("User is already a member of this company.");
        }

        var uc = new UserCompany() { Company = company, User = user, Role = UserRole.User };
        dbContext.UserCompanies.Add(uc);
        await dbContext.SaveChangesAsync();

        return Ok();


    }

    [HttpGet("publiclyAccessible")]
    public async Task<ActionResult<List<PublicCompanyDto>>> GetPubliclyAccessibleCompanies()
    {
        var companies = await dbContext.Companies
            .Where(c => c.SecretInviteCode != null)
            .Select(c => new PublicCompanyDto()
            {
                Id = c.Id,
                Name = c.Name,
            })
            .ToListAsync();
        return Ok(companies);
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
