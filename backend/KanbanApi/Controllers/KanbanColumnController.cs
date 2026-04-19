using KanbanApi.Dtos;
using KanbanApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanbanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KanbanColumnController : ControllerBase
{
    private readonly IKanbanColumnService _kanbanColumnService;

    public KanbanColumnController(IKanbanColumnService kanbanColumnService)
    {
        _kanbanColumnService = kanbanColumnService;
    }

    [HttpGet]
    public async Task<ActionResult<List<KanbanColumnResponseDto>>> GetAll()
    {
        var kanbanColumns = await _kanbanColumnService.GetAllAsync();
        return Ok(kanbanColumns);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<KanbanColumnResponseDto>> GetById(int id)
    {
        var kanbanColumn = await _kanbanColumnService.GetByIdAsync(id);

        if (kanbanColumn == null)
        {
            return NotFound("Kanban column not found.");
        }

        return Ok(kanbanColumn);
    }

    [HttpPost]
    public async Task<ActionResult<KanbanColumnResponseDto>> Create([FromBody] CreateKanbanColumnDto createKanbanColumnDto)
    {
        var createdKanbanColumn = await _kanbanColumnService.CreateAsync(createKanbanColumnDto);

        if (createdKanbanColumn == null)
        {
            return BadRequest("User not found.");
        }

        return CreatedAtAction(nameof(GetById), new { id = createdKanbanColumn.Id }, createdKanbanColumn);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<KanbanColumnResponseDto>> Update(int id, [FromBody] UpdateKanbanColumnDto updateKanbanColumnDto)
    {
        var updatedKanbanColumn = await _kanbanColumnService.UpdateAsync(id, updateKanbanColumnDto);

        if (updatedKanbanColumn == null)
        {
            return NotFound("Kanban column not found.");
        }

        return Ok(updatedKanbanColumn);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _kanbanColumnService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound("Kanban column not found.");
        }

        return NoContent();
    }
}