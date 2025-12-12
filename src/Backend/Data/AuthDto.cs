namespace Backend.Data;

public class RegisterDto
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;

    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    
}

public class LoginDto
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
}


public class PublicCompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
}