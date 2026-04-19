using KanbanApi.Dtos;

namespace KanbanApi.Services;

public interface IKanbanColumnService
{
    Task<List<KanbanColumnResponseDto>> GetAllAsync();
    Task<KanbanColumnResponseDto?> GetByIdAsync(int id);
    Task<KanbanColumnResponseDto?> CreateAsync(CreateKanbanColumnDto createKanbanColumnDto);
    Task<KanbanColumnResponseDto?> UpdateAsync(int id, UpdateKanbanColumnDto updateKanbanColumnDto);
    Task<bool> DeleteAsync(int id);
}