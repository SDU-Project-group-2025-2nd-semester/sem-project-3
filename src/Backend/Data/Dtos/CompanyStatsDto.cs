namespace Backend.Data.Dtos;

public record CompanyStatsDto(
    Guid CompanyId,
    int RoomsCount,
    int DesksCount,
    int OccupiedDesksNow,
    int ActiveReservationsNow,
    int ReservationsToday,
    int OpenDamageReports
);