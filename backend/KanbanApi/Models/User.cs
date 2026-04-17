using System.ComponentModel.DataAnnotations;

namespace KanbanApi.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;

    public List<KanbanColumn> KanbanColumns { get; set; } = new();
}