using System.ComponentModel.DataAnnotations;

namespace KanbanApi.Models;

public class Ticket
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal TimeSpentHours { get; set; }

    public DateTime CreatedAt { get; set; }

    public int Position { get; set; }

    public int KanbanColumnId { get; set; }
    public KanbanColumn? KanbanColumn { get; set; }
}