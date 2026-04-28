using KanbanApi.Models;
using Microsoft.EntityFrameworkCore;

namespace KanbanApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<KanbanColumn> KanbanColumns { get; set; }
    public DbSet<Ticket> Tickets { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        //explique la relation entre kanbanColumn et user, un kanbanColumn appartient à un user, un user peut avoir plusieurs kanbanColumn
        modelBuilder.Entity<KanbanColumn>()
            .HasOne(kc => kc.User)
            .WithMany(u => u.KanbanColumns)
            .HasForeignKey(kc => kc.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        //explique la relation entre ticket et kanbanColumn, un ticket appartient à un kanbanColumn, un kanbanColumn peut avoir plusieurs ticket
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.KanbanColumn)
            .WithMany(kc => kc.Tickets)
            .HasForeignKey(t => t.KanbanColumnId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
        .HasIndex(user => user.Email)
        .IsUnique();
    }

    
    
}