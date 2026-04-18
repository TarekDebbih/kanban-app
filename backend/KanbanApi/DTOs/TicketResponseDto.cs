namespace KanbanApi.Dtos;

public class TicketResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TimeSpentHours { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Position { get; set; }
    public int KanbanColumnId { get; set; }
}