using KanbanApi.Models;

namespace KanbanApi.Services;

public interface IKanbanColumnService
{
    Task<KanbanColumn?> GetByIdAsync(int id);
    Task<List<KanbanColumn>> GetAllAsync();
    Task AddAsync(KanbanColumn kanbanColumn);
    Task<KanbanColumn?> UpdateAsync(int id, KanbanColumn kanbanColumn);
    Task<bool> DeleteAsync(int id);
}