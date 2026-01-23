namespace Backend.Data.Dtos;

public record RoomStatsDto(
    Guid CompanyId,
    Guid RoomId,
    string? RoomReadableId,
    int DesksCount,
    int OccupiedDesksNow,
    int ActiveReservationsNow
);