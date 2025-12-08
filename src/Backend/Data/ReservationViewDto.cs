namespace Backend.Data;

public record ReservationViewDto(
    Guid Id,
    DateTime Start,
    DateTime End,
    Guid DeskId,
    string? DeskLabel,
    Guid RoomId,
    string? RoomLabel
);
