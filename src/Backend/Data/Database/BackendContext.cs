using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace Backend.Data.Database;

public class BackendContext(DbContextOptions<BackendContext> options) : IdentityDbContext<User>(options)
{
    public DbSet<Company> Companies { get; set; }

    public DbSet<Room> Rooms { get; set; }

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

        // when user deleted - reservations cascade
        builder.Entity<Reservation>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // when user deleted - DamageReport SubmittedBy and ResolvedBy set to null
        builder.Entity<DamageReport>()
            .HasOne(dr => dr.SubmittedBy)
            .WithMany()
            .HasForeignKey(dr => dr.SubmittedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<DamageReport>()
            .HasOne(dr => dr.ResolvedBy)
            .WithMany()
            .HasForeignKey(dr => dr.ResolvedById)
            .OnDelete(DeleteBehavior.SetNull);


    }

}