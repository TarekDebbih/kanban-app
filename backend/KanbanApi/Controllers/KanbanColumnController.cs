using KanbanApi.Models;
using KanbanApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace KanbanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KanbanColumnController : ControllerBase
{
    private readonly IKanbanColumnService _kanbanColumnService;

    public KanbanColumnController(IKanbanColumnService kanbanColumnService)
    {
        _kanbanColumnService = kanbanColumnService;
    }

    [HttpGet]
    public async Task<ActionResult<List<KanbanColumn>>> GetAll()
    {
        var kanbanColumns = await _kanbanColumnService.GetAllAsync();
        return Ok(kanbanColumns);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<KanbanColumn>> GetById(int id)
    {
        var kanbanColumn = await _kanbanColumnService.GetByIdAsync(id);

        if (kanbanColumn == null)
        {
            return NotFound();
        }

        return Ok(kanbanColumn);
    }

    [HttpPost]
    public async Task<ActionResult<KanbanColumn>> Create([FromBody] KanbanColumn kanbanColumn)
    {
        var createdKanbanColumn = await _kanbanColumnService.AddAsync(kanbanColumn);

        if (createdKanbanColumn == null)
        {
            return BadRequest("User not found.");
        }

        return CreatedAtAction(nameof(GetById), new { id = createdKanbanColumn.Id }, createdKanbanColumn);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<KanbanColumn>> Update(int id, [FromBody] KanbanColumn kanbanColumn)
    {
        var updatedKanbanColumn = await _kanbanColumnService.UpdateAsync(id, kanbanColumn);

        if (updatedKanbanColumn == null)
        {
            return BadRequest("User not found or Kanban column not found.");
        }

        return Ok(updatedKanbanColumn);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _kanbanColumnService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}