using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class BackendContext(DbContextOptions<BackendContext> options) : IdentityDbContext<User>(options)
{
    public DbSet<Company> Companies { get; set; }

    public DbSet<Rooms> Rooms { get; set; }

    public DbSet<Desk> Desks { get; set; }

    public DbSet<Reservation> Reservations { get; set; }

    public DbSet<DamageReport> DamageReports { get; set; }

}