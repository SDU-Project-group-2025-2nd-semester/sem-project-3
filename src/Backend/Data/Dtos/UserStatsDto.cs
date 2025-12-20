namespace Backend.Data.Dtos;

public record UserStatsDto(
    Guid CompanyId,
    string UserId,
    string? Email,
    string FirstName,
    string LastName,
    int SittingHeight,
    int StandingHeight,
    int SittingTime,
    int StandingTime,
    int ReservationsTotal,
    int ActiveReservationsNow,
    int UniqueDesksReserved
);