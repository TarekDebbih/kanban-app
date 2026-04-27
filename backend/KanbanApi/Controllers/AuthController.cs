using KanbanApi.Dtos;
using KanbanApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace KanbanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }
    
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto loginRequest)
    {
        var authResponse = await _authService.LoginAsync(loginRequest);

        if (authResponse == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        return Ok(authResponse);
    }
}