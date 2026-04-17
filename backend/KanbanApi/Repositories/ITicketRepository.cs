using KanbanApi.Models;

namespace KanbanApi.Repositories;

public interface ITicketRepository
{
    Task<Ticket?> GetByIdAsync(int id);
    Task<List<Ticket>> GetAllAsync();
    Task AddAsync(Ticket ticket);
    Task<Ticket?> UpdateAsync(int id, Ticket ticket);
    Task<bool> DeleteAsync(int id);
}