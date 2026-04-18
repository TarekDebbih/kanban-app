using KanbanApi.Dtos;

namespace KanbanApi.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto loginRequest);
}