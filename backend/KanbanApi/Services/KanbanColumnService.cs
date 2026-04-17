using KanbanApi.Models;
using KanbanApi.Repositories;

namespace KanbanApi.Services;

public class KanbanColumnService : IKanbanColumnService
{
    private readonly IKanbanColumnRepository _kanbanColumnRepository;

    public KanbanColumnService(IKanbanColumnRepository kanbanColumnRepository)
    {
        _kanbanColumnRepository = kanbanColumnRepository;
    }

    public async Task<KanbanColumn?> GetByIdAsync(int id)
    {
        return await _kanbanColumnRepository.GetByIdAsync(id);
    }

    public async Task<List<KanbanColumn>> GetAllAsync()
    {
        return await _kanbanColumnRepository.GetAllAsync();
    }

    public async Task<KanbanColumn?> AddAsync(KanbanColumn kanbanColumn)
    {
        var user = await _kanbanColumnRepository.GetByIdAsync(kanbanColumn.UserId);

        if (user == null)
        {
            return null;
        }

        await _kanbanColumnRepository.AddAsync(kanbanColumn);
        return kanbanColumn;
    }

    public async Task<KanbanColumn?> UpdateAsync(int id, KanbanColumn kanbanColumn)
    {
        var user = await _kanbanColumnRepository.GetByIdAsync(kanbanColumn.UserId);

        if (user == null)
        {
            return null;
        }

        return await _kanbanColumnRepository.UpdateAsync(id, kanbanColumn);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _kanbanColumnRepository.DeleteAsync(id);
    }
}