using KanbanApi.Dtos;
using KanbanApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace KanbanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        var createdUser = await _userService.CreateUserAsync(createUserDto);
        return CreatedAtAction(nameof(GetUserByEmail), new { email = createdUser.Email }, createdUser);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<List<UserResponseDto>>> GetAll()
    {
        var users = await _userService.GetAllAsync();
        var response = users
            .Select(u => new UserResponseDto { Id = u.Id, Email = u.Email, Role = u.Role })
            .ToList();
        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{email}")]
    public async Task<ActionResult<UserResponseDto>> GetUserByEmail(string email)
    {
        var user = await _userService.GetByEmailAsync(email);

        if (user == null)
        {
            return NotFound("User not found");
        }

        return Ok(user);
    }
}