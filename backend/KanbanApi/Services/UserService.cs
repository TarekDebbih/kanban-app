using KanbanApi.Dtos;
using KanbanApi.Models;
using KanbanApi.Repositories;
using Microsoft.AspNetCore.Identity;

namespace KanbanApi.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(IUserRepository userRepository, IPasswordHasher<User> passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<UserResponseDto?> GetByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);

        if (user == null)
        {
            return null;
        }

        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _userRepository.GetAllAsync();
    }

    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        var existingUser = await _userRepository.GetByEmailAsync(createUserDto.Email);

        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already used.");
        }
        
        var user = new User
        {
            Email = createUserDto.Email,
            Role = "Standard"
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, createUserDto.Password);

        await _userRepository.AddAsync(user);

        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role
        };
    }
}