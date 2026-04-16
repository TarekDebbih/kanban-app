using KanbanApi.Models;

namespace KanbanApi.Services;

public interface IUserService
{
    Task<User?> GetUserByEmailAsync(string email);
    Task<User> CreateUserAsync(User user);
}