namespace Backend.Data;

public record CompanyStatsDto(
    Guid CompanyId,
    int RoomsCount,
    int DesksCount,
    int OccupiedDesksNow,
    int ActiveReservationsNow,
    int ReservationsToday,
    int OpenDamageReports
);

public record RoomStatsDto(
    Guid CompanyId,
    Guid RoomId,
    string? RoomReadableId,
    int DesksCount,
    int OccupiedDesksNow,
    int ActiveReservationsNow
);

public record DeskActiveReservationDto(
    Guid ReservationId,
    string UserId,
    DateTime Start,
    DateTime End
);

public record DeskStatsDto(
    Guid CompanyId,
    Guid DeskId,
    string? DeskReadableId,
    Guid RoomId,
    int Height,
    int MinHeight,
    int MaxHeight,
    int ActivationsCounter,
    int SitStandCounter,
    int ReservationsTotal,
    DeskActiveReservationDto? ActiveReservationNow
);

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