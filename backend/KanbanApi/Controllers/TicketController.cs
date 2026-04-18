using KanbanApi.Dtos;
using KanbanApi.Models;
using KanbanApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanbanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<TicketResponseDto>>> GetAll()
    {
        var tickets = await _ticketService.GetAllAsync();
        var response = tickets.Select(MapToResponseDto).ToList();

        return Ok(response);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<TicketResponseDto>> GetById(int id)
    {
        var ticket = await _ticketService.GetByIdAsync(id);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(MapToResponseDto(ticket));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<TicketResponseDto>> Create([FromBody] CreateTicketDto createTicketDto)
    {
        var ticket = new Ticket
        {
            Title = createTicketDto.Title,
            Description = createTicketDto.Description,
            TimeSpentHours = createTicketDto.TimeSpentHours,
            Position = createTicketDto.Position,
            KanbanColumnId = createTicketDto.KanbanColumnId
        };

        var createdTicket = await _ticketService.AddAsync(ticket);

        if (createdTicket == null)
        {
            return BadRequest("Kanban column not found.");
        }

        var response = MapToResponseDto(createdTicket);

        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<TicketResponseDto>> Update(int id, [FromBody] UpdateTicketDto updateTicketDto)
    {
        var ticket = new Ticket
        {
            Title = updateTicketDto.Title,
            Description = updateTicketDto.Description,
            TimeSpentHours = updateTicketDto.TimeSpentHours,
            Position = updateTicketDto.Position,
            KanbanColumnId = updateTicketDto.KanbanColumnId
        };

        var updatedTicket = await _ticketService.UpdateAsync(id, ticket);

        if (updatedTicket == null)
        {
            return BadRequest("Kanban column not found or ticket not found.");
        }

        return Ok(MapToResponseDto(updatedTicket));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _ticketService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
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