using KanbanApi.Models;

namespace KanbanApi.Repositories;

    public interface IKanbanColumnRepository
{
    Task<List<KanbanColumn>> GetAllAsync();
        Task<KanbanColumn?> GetByIdAsync(int id);
        Task<KanbanColumn> CreateAsync(KanbanColumn kanbanColumn);
        Task<KanbanColumn?> UpdateAsync(int id, KanbanColumn kanbanColumn);
        Task<bool> DeleteAsync(int id);
}
