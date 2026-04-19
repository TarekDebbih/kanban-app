using KanbanApi.Dtos;
using KanbanApi.Models;
using KanbanApi.Repositories;

namespace KanbanApi.Services;

public class KanbanColumnService : IKanbanColumnService
{
    private readonly IKanbanColumnRepository _kanbanColumnRepository;
    private readonly IUserRepository _userRepository;

    public KanbanColumnService(
        IKanbanColumnRepository kanbanColumnRepository,
        IUserRepository userRepository)
    {
        _kanbanColumnRepository = kanbanColumnRepository;
        _userRepository = userRepository;
    }

    public async Task<List<KanbanColumnResponseDto>> GetAllAsync()
    {
        var kanbanColumns = await _kanbanColumnRepository.GetAllAsync();

        return kanbanColumns.Select(MapToResponseDto).ToList();
    }

    public async Task<KanbanColumnResponseDto?> GetByIdAsync(int id)
    {
        var kanbanColumn = await _kanbanColumnRepository.GetByIdAsync(id);

        if (kanbanColumn == null)
        {
            return null;
        }

        return MapToResponseDto(kanbanColumn);
    }

    public async Task<KanbanColumnResponseDto?> CreateAsync(CreateKanbanColumnDto createKanbanColumnDto)
    {
        var user = await _userRepository.GetByIdAsync(createKanbanColumnDto.UserId);

        if (user == null)
        {
            return null;
        }

        var kanbanColumn = new KanbanColumn
        {
            Name = createKanbanColumnDto.Name,
            Position = createKanbanColumnDto.Position,
            UserId = createKanbanColumnDto.UserId
        };

        await _kanbanColumnRepository.AddAsync(kanbanColumn);

        return MapToResponseDto(kanbanColumn);
    }

    public async Task<KanbanColumnResponseDto?> UpdateAsync(int id, UpdateKanbanColumnDto updateKanbanColumnDto)
    {
        var existingKanbanColumn = await _kanbanColumnRepository.GetByIdAsync(id);

        if (existingKanbanColumn == null)
        {
            return null;
        }

        var user = await _userRepository.GetByIdAsync(updateKanbanColumnDto.UserId);

        if (user == null)
        {
            return null;
        }

        existingKanbanColumn.Name = updateKanbanColumnDto.Name;
        existingKanbanColumn.Position = updateKanbanColumnDto.Position;
        existingKanbanColumn.UserId = updateKanbanColumnDto.UserId;

        var updatedKanbanColumn = await _kanbanColumnRepository.UpdateAsync(id, existingKanbanColumn);

        if (updatedKanbanColumn == null)
        {
            return null;
        }

        return MapToResponseDto(updatedKanbanColumn);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _kanbanColumnRepository.DeleteAsync(id);
    }

    private static KanbanColumnResponseDto MapToResponseDto(KanbanColumn kanbanColumn)
    {
        return new KanbanColumnResponseDto
        {
            Id = kanbanColumn.Id,
            Name = kanbanColumn.Name,
            Position = kanbanColumn.Position,
            UserId = kanbanColumn.UserId
        };
    }
}