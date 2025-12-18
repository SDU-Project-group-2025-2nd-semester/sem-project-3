using Backend.Auth;
using Backend.Data.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CompanyController(BackendContext dbContext) : ControllerBase
{

    [HttpGet("{companyId}/users/")]
    [RequireRole(UserRole.Admin)]
    public async Task<ActionResult<List<UserWithRoleDto>>> GetUsers(Guid companyId)
    {
        return await dbContext.UserCompanies
            .Where(uc => uc.CompanyId == companyId)
            .Include(uc => uc.User)
            .Select(uc => new UserWithRoleDto
            {
                FirstName = uc.User.FirstName,
                LastName = uc.User.LastName,
                Email = uc.User.Email,
                Role = uc.Role
            })
            .ToListAsync();
    }

    [HttpPut("{companyId}/users/{userId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> ManageUsers(Guid companyId, string userId, UserRole userRole)
    {
        var userCompany = await dbContext.UserCompanies.Where(uc => uc.CompanyId == companyId && uc.UserId == userId).FirstOrDefaultAsync();

        if (userCompany is null)
        {
            return NotFound();
        }

        if (userRole == UserRole.Admin)
        {
            return BadRequest();
        }

        userCompany.Role = userRole;

        await dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("{companyId}/users/{userId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> AddUserToCompany(Guid companyId, string userId)
    {
        var company = await dbContext.Companies.FindAsync(companyId);
        if (company is null)
        {
            return NotFound();
        }
        var user = await dbContext.Users.FindAsync(userId);
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

    [HttpDelete("{companyId}/users/{userId}")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> KickUser(Guid companyId, string userId)
    {

        var companyMembership = await dbContext.UserCompanies.Where(uc => uc.CompanyId == companyId && uc.UserId == userId).FirstOrDefaultAsync();

        if (companyMembership is null)
        {
            return Conflict("User is not a member of this company.");
        }

        dbContext.UserCompanies.Remove(companyMembership);

        await dbContext.SaveChangesAsync();

        return Ok();
    }

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

    [HttpGet("{companyId:guid}/simulator")]
    [RequireRole(UserRole.Admin)]
    public async Task<IActionResult> GetSimulatorSettings(Guid companyId)
    {
        var company = await dbContext.Companies.FindAsync(companyId);

        if (company is null)
            return NotFound();

        return Ok(new { SimulatorLink = company.SimulatorLink });
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

public class UserWithRoleDto
{
    public UserRole Role { get; internal set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string Email { get; set; }
}
