using System.Security.Claims;

namespace KanbanApi.Services.CurrentUser;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int UserId
    {
        get
        {
            var userId = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new UnauthorizedAccessException("User id not found in token.");
            }

            return int.Parse(userId);
        }
    }

    public string Role
    {
        get
        {
            var role = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrWhiteSpace(role))
            {
                throw new UnauthorizedAccessException("User role not found in token.");
            }

            return role;
        }
    }

    public bool IsAdmin => Role == "Admin";
}