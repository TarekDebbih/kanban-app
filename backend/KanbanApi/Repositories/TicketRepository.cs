using KanbanApi.Data;
using KanbanApi.Models;
using Microsoft.EntityFrameworkCore;

namespace KanbanApi.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly AppDbContext _context;

    public TicketRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<Ticket>> GetAllAsync()
    {
        return await _context.Tickets.ToListAsync();
    }

    public async Task AddAsync(Ticket ticket)
    {
        await _context.Tickets.AddAsync(ticket);
        await _context.SaveChangesAsync();
    }

    public async Task<Ticket?> UpdateAsync(int id, Ticket ticket)
    {
        var existingTicket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);

        if (existingTicket == null)
        {
            return null;
        }

        existingTicket.Title = ticket.Title;
        existingTicket.Description = ticket.Description;
        existingTicket.TimeSpentHours = ticket.TimeSpentHours;
        existingTicket.Position = ticket.Position;
        existingTicket.KanbanColumnId = ticket.KanbanColumnId;

        await _context.SaveChangesAsync();

        return existingTicket;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return false;
        }

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();

        return true;
    }
}