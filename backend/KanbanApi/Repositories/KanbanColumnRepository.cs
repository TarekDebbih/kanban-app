using KanbanApi.Data;
using KanbanApi.Models;
using Microsoft.EntityFrameworkCore;

namespace KanbanApi.Repositories;

public class KanbanColumnRepository : IKanbanColumnRepository
{
    private readonly AppDbContext _context;

    public KanbanColumnRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<KanbanColumn?> GetByIdAsync(int id)
    {
        return await _context.KanbanColumns.FirstOrDefaultAsync(kc => kc.Id == id);
    }

    public async task<List<KanbanColumn>> GetAllAsync()
    {
        return await _context.KanbanColumns.ToListAsync();
    }
     public async Task AddAsync(KanbanColumn kanbanColumn)
    {
        await _context.KanbanColumns.AddAsync(kanbanColumn);
        await _context.SaveChangesAsync();
    }

    public async Task<KanbanColumn?> UpdateAsync(int id, KanbanColumn kanbanColumn)
    {
        var existingKanbanColumn = await _context.KanbanColumns.FirstOrDefaultAsync(kc => kc.Id == id);

        if (existingKanbanColumn == null)
        {
            return null;
        }

        existingKanbanColumn.Name = kanbanColumn.Name;
        existingKanbanColumn.Position = kanbanColumn.Position;
        existingKanbanColumn.UserId = kanbanColumn.UserId;

        await _context.SaveChangesAsync();

        return existingKanbanColumn;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var kanbanColumn = await _context.KanbanColumns.FirstOrDefaultAsync(kc => kc.Id == id);

        if (kanbanColumn == null)
        {
            return false;
        }

        _context.KanbanColumns.Remove(kanbanColumn);
        await _context.SaveChangesAsync();

        return true;
    }
}