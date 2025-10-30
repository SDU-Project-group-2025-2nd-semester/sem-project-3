using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public interface IRoomService
    {
        public Task<List<Rooms>> GetAllRoomsAsync(Guid companyId);
    }

    class RoomService(ILogger<RoomService> logger, BackendContext dbContext) : IRoomService
    {
        public async Task<List<Rooms>> GetAllRoomsAsync(Guid companyId)
        {
            return await dbContext.Rooms.Where(r => r.CompanyId == companyId).ToListAsync();
        }
    }
}
