using KanbanApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace KanbanApi.Data;

public static class AdminSeeder
{
    public static async Task SeedAdminAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

        var admin = await context.Users
            .FirstOrDefaultAsync(user => user.Email == "admin@test.com");

        if (admin == null)
        {
            admin = new User
            {
                Email = "admin@test.com",
                Role = "Admin"
            };

            admin.PasswordHash = passwordHasher.HashPassword(admin, "admin123");

            context.Users.Add(admin);
            await context.SaveChangesAsync();

            return;
        }

        admin.Role = "Admin";
        admin.PasswordHash = passwordHasher.HashPassword(admin, "admin123");

        await context.SaveChangesAsync();
    }
}