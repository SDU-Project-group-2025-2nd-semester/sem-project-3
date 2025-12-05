namespace Backend.Data;

public record ReservationViewDto(
    Guid Id,
    DateTime Start,
    DateTime End,
    Guid DeskId,
    string? DeskLabel, // not in the model yet
    Guid RoomId,
    string? RoomLabel // not in the model yet
);
