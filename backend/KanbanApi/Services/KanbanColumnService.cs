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

    public async Task AddAsync(KanbanColumn kanbanColumn)
    {
        await _kanbanColumnRepository.AddAsync(kanbanColumn);
    }

    public async Task<KanbanColumn?> UpdateAsync(int id, KanbanColumn kanbanColumn)
    {
        return await _kanbanColumnRepository.UpdateAsync(id, kanbanColumn);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _kanbanColumnRepository.DeleteAsync(id);
    }
}