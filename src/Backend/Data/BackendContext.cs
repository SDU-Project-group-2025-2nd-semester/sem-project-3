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
    
    public DbSet<UserCompany> UserCompanies { get; set; }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<UserCompany>()
            .HasKey(uc => new { uc.UserId, uc.CompanyId });

        builder.Entity<UserCompany>()
            .HasOne(uc => uc.User)
            .WithMany(u => u.CompanyMemberships)
            .HasForeignKey(uc => uc.UserId);

        builder.Entity<UserCompany>()
            .HasOne(uc => uc.Company)
            .WithMany(c => c.UserMemberships)
            .HasForeignKey(uc => uc.CompanyId);
    }

}