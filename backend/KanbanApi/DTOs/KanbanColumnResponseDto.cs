namespace KanbanApi.Dtos;

public class KanbanColumnResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
    public int UserId { get; set; }
}