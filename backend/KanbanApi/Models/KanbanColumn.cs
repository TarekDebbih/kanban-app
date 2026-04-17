namespace KanbanApi.Models
{
    public class KanbanColumn
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Position { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public List<Ticket> Tickets { get; set; } = new();
    }
}