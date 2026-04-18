using KanbanApi.Models;
using KanbanApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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
    public async Task<ActionResult<List<Ticket>>> GetAll()
    {
        var tickets = await _ticketService.GetAllAsync();
        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Ticket>> GetById(int id)
    {
        var ticket = await _ticketService.GetByIdAsync(id);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(ticket);
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> Create([FromBody] Ticket ticket)
    {
        var createdTicket = await _ticketService.AddAsync(ticket);

        if (createdTicket == null)
        {
            return BadRequest("Kanban column not found.");
        }

        return CreatedAtAction(nameof(GetById), new { id = createdTicket.Id }, createdTicket);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Ticket>> Update(int id, [FromBody] Ticket ticket)
    {
        var updatedTicket = await _ticketService.UpdateAsync(id, ticket);

        if (updatedTicket == null)
        {
            return BadRequest("Kanban column not found or ticket not found.");
        }

        return Ok(updatedTicket);
    }

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
}