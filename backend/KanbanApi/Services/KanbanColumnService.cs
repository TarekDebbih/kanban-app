using KanbanApi.Dtos;
using KanbanApi.Models;
using KanbanApi.Repositories;
using KanbanApi.Services.CurrentUser;

namespace KanbanApi.Services;

public class KanbanColumnService : IKanbanColumnService
{
    private readonly IKanbanColumnRepository _kanbanColumnRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    
    public KanbanColumnService(
    IKanbanColumnRepository kanbanColumnRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService)
{
    _kanbanColumnRepository = kanbanColumnRepository;
    _userRepository = userRepository;
    _currentUserService = currentUserService;
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
        if (!CanAccessKanbanColumn(kanbanColumn))
        {
            throw new UnauthorizedAccessException("You are not allowed to access this kanban column.");
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

        if (!CanAccessKanbanColumn(existingKanbanColumn))
        {
            throw new UnauthorizedAccessException("You are not allowed to update this kanban column.");
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
        var kanbanColumn = await _kanbanColumnRepository.GetByIdAsync(id);

        if (kanbanColumn == null)
        {
            return false;
        }

        if (!CanAccessKanbanColumn(kanbanColumn))
        {
            throw new UnauthorizedAccessException("You are not allowed to delete this kanban column.");
        }

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

    private bool CanAccessKanbanColumn(KanbanColumn kanbanColumn)
    {
    return _currentUserService.IsAdmin || kanbanColumn.UserId == _currentUserService.UserId;
    }
}