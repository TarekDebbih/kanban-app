using System.ComponentModel.DataAnnotations;

namespace KanbanApi.Dtos;

public class CreateKanbanColumnDto
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Position { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int UserId { get; set; }
}