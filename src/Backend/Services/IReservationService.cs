using Backend.Data;

namespace Backend.Services;

public interface IReservationService
{
    Task<object> GetReservations(Guid companyId, string? userId = null, Guid? deskId = null, DateTime? startDate = null,
        DateTime? endDate = null);
    Task<Reservation?> GetReservation(Guid reservationId);
    Task DeleteReservation(Reservation reservation);
    Task<Reservation?> CreateReservation(CreateReservationDto createReservationDto, string userId, Guid companyId);
}