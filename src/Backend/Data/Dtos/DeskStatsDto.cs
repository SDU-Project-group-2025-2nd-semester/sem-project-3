namespace Backend.Data;

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