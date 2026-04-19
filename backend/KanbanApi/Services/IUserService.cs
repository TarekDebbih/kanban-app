using KanbanApi.Dtos;
using KanbanApi.Models;

namespace KanbanApi.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(int id);
    Task<UserResponseDto?> GetByEmailAsync(string email);
    Task<List<User>> GetAllAsync();
    Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto);
}