using KanbanApi.Models;
using KanbanApi.Services;
using Microsoft.AspNetCore.Mvc;
namespace KanbanApi.Controllers;

using KanbanApi.Models;
using KanbanApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace KanbanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        try
        {
            var createdUser = await _userService.CreateUserAsync(user);
            return Ok(createdUser);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{email}")]
    public async Task<IActionResult> GetUserByEmail(string email)
    {
        var user = await _userService.GetUserByEmailAsync(email);

        if (user == null)
        {
            return NotFound("User not found");
        }

        return Ok(user);
    }
}