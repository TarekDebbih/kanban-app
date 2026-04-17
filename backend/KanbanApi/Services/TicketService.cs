using KanbanApi.Models;
using KanbanApi.Repositories;

namespace KanbanApi.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;

    public TicketService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _ticketRepository.GetByIdAsync(id);
    }

    public async Task<List<Ticket>> GetAllAsync()
    {
        return await _ticketRepository.GetAllAsync();
    }

    public async Task AddAsync(Ticket ticket)
    {
        await _ticketRepository.AddAsync(ticket);
    }

    public async Task<Ticket?> UpdateAsync(int id, Ticket ticket)
    {
        return await _ticketRepository.UpdateAsync(id, ticket);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _ticketRepository.DeleteAsync(id);
    }
}