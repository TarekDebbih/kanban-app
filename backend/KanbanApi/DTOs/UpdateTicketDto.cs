using System.ComponentModel.DataAnnotations;

namespace KanbanApi.Dtos;

public class UpdateTicketDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal TimeSpentHours { get; set; }

    public int Position { get; set; }

    public int KanbanColumnId { get; set; }
}