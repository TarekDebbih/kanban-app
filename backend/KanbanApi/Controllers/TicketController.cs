using KanbanApi.Dtos;
using KanbanApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanbanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TicketResponseDto>>> GetAll()
    {
        var tickets = await _ticketService.GetAllAsync();
        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketResponseDto>> GetById(int id)
    {
        var ticket = await _ticketService.GetByIdAsync(id);

        if (ticket == null)
        {
            return NotFound("Ticket not found.");
        }

        return Ok(ticket);
    }

    [HttpPost]
    public async Task<ActionResult<TicketResponseDto>> Create([FromBody] CreateTicketDto createTicketDto)
    {
        var createdTicket = await _ticketService.CreateAsync(createTicketDto);

        if (createdTicket == null)
        {
            return BadRequest("Kanban column not found.");
        }

        return CreatedAtAction(nameof(GetById), new { id = createdTicket.Id }, createdTicket);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketResponseDto>> Update(int id, [FromBody] UpdateTicketDto updateTicketDto)
    {
        var updatedTicket = await _ticketService.UpdateAsync(id, updateTicketDto);

        if (updatedTicket == null)
        {
            return NotFound("Ticket not found.");
        }

        return Ok(updatedTicket);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _ticketService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound("Ticket not found.");
        }

        return NoContent();
    }
}