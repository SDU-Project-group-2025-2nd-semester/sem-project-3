using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CompanyController : ControllerBase
{
    [HttpPost("{companyId}/access/")]
    public bool AccessCompany(string companyId, [FromBody] string accessCode)
    {
        return false;
    }
}