using KanbanApi.Models;
using KanbanApi.Repositories;

namespace KanbanApi.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _userRepository.GetByEmailAsync(email);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        var existingUser = await _userRepository.GetByEmailAsync(user.Email);

        if (existingUser != null)
        {
            throw new Exception("User already exists");
        }

        await _userRepository.AddAsync(user);

        return user;
    }
}