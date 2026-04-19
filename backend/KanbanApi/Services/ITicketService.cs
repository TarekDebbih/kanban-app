public interface ITicketService
{
    Task<List<TicketResponseDto>> GetAllAsync();
    Task<TicketResponseDto?> GetByIdAsync(int id);
    Task<TicketResponseDto?> CreateAsync(CreateTicketDto createTicketDto);
    Task<TicketResponseDto?> UpdateAsync(int id, UpdateTicketDto updateTicketDto);
    Task<bool> DeleteAsync(int id);
}