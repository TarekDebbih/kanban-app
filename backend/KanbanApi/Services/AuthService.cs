using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KanbanApi.Dtos;
using KanbanApi.Models;
using KanbanApi.Repositories;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;

namespace KanbanApi.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthService(
        IUserRepository userRepository,
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        var user = await _userRepository.GetByEmailAsync(loginRequest.Email);

        if (user == null)
        {
            return null;
        }

        var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            loginRequest.Password
        );

        if (passwordVerificationResult == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var expireMinutes = _configuration.GetValue<int>("Jwt:expireMinutes");
        var rememberMeExpireDays = _configuration.GetValue<int>("Jwt:rememberMeExpireDays");

        var expiration = loginRequest.RememberMe
            ? DateTime.UtcNow.AddDays(rememberMeExpireDays)
            : DateTime.UtcNow.AddMinutes(expireMinutes);

        var token = GenerateJwtToken(user, expiration);

        return new AuthResponseDto
        {
            Token = token,
            Expiration = expiration,
            Email = user.Email,
            Role = user.Role
        };
    }
    private string GenerateJwtToken(User user, DateTime expiration)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException("JWT key is not configured.");
        }

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expiration,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}