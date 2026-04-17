using KanbanApi.Models;
using KanbanApi.Repositories;

namespace KanbanApi.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IKanbanColumnRepository _kanbanColumnRepository;

    public TicketService(
        ITicketRepository ticketRepository,
        IKanbanColumnRepository kanbanColumnRepository)
    {
        _ticketRepository = ticketRepository;
        _kanbanColumnRepository = kanbanColumnRepository;
    }

    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _ticketRepository.GetByIdAsync(id);
    }

    public async Task<List<Ticket>> GetAllAsync()
    {
        return await _ticketRepository.GetAllAsync();
    }

    public async Task<Ticket?> AddAsync(Ticket ticket)
    {
        var kanbanColumn = await _kanbanColumnRepository.GetByIdAsync(ticket.KanbanColumnId);

        if (kanbanColumn == null)
        {
            return null;
        }

        ticket.CreatedAt = DateTime.UtcNow;

        await _ticketRepository.AddAsync(ticket);

        return ticket;
    }

    public async Task<Ticket?> UpdateAsync(int id, Ticket ticket)
    {
        var kanbanColumn = await _kanbanColumnRepository.GetByIdAsync(ticket.KanbanColumnId);

        if (kanbanColumn == null)
        {
            return null;
        }

        return await _ticketRepository.UpdateAsync(id, ticket);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _ticketRepository.DeleteAsync(id);
    }
}