using KanbanApi.Models;

namespace KanbanApi.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<List<User>> GetAllAsync();
    Task<User> CreateUserAsync(User user);
}