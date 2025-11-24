using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CompanyController : ControllerBase
{
    [HttpPost("{companyId}/access/")]
    public bool AccessCompany(string companyId, [FromBody] string accessCode)
    {
        return false;
    }
}