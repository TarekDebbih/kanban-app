using KanbanApi.Dtos;
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

    public async Task<List<TicketResponseDto>> GetAllAsync()
    {
        var tickets = await _ticketRepository.GetAllAsync();

        return tickets.Select(MapToResponseDto).ToList();
    }

    public async Task<TicketResponseDto?> GetByIdAsync(int id)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket == null)
        {
            return null;
        }

        return MapToResponseDto(ticket);
    }

    public async Task<TicketResponseDto?> CreateAsync(CreateTicketDto createTicketDto)
    {
        var kanbanColumn = await _kanbanColumnRepository.GetByIdAsync(createTicketDto.KanbanColumnId);

        if (kanbanColumn == null)
        {
            return null;
        }

        var ticket = new Ticket
        {
            Title = createTicketDto.Title,
            Description = createTicketDto.Description,
            TimeSpentHours = createTicketDto.TimeSpentHours,
            Position = createTicketDto.Position,
            KanbanColumnId = createTicketDto.KanbanColumnId,
            CreatedAt = DateTime.UtcNow
        };

        await _ticketRepository.AddAsync(ticket);

        return MapToResponseDto(ticket);
    }

    public async Task<TicketResponseDto?> UpdateAsync(int id, UpdateTicketDto updateTicketDto)
    {
        var existingTicket = await _ticketRepository.GetByIdAsync(id);

        if (existingTicket == null)
        {
            return null;
        }

        var kanbanColumn = await _kanbanColumnRepository.GetByIdAsync(updateTicketDto.KanbanColumnId);

        if (kanbanColumn == null)
        {
            return null;
        }

        existingTicket.Title = updateTicketDto.Title;
        existingTicket.Description = updateTicketDto.Description;
        existingTicket.TimeSpentHours = updateTicketDto.TimeSpentHours;
        existingTicket.Position = updateTicketDto.Position;
        existingTicket.KanbanColumnId = updateTicketDto.KanbanColumnId;

        await _ticketRepository.UpdateAsync(existingTicket);

        return MapToResponseDto(existingTicket);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _ticketRepository.DeleteAsync(id);
    }

    private static TicketResponseDto MapToResponseDto(Ticket ticket)
    {
        return new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            TimeSpentHours = ticket.TimeSpentHours,
            CreatedAt = ticket.CreatedAt,
            Position = ticket.Position,
            KanbanColumnId = ticket.KanbanColumnId
        };
    }
}