namespace Backend.Data;

public record DeskActiveReservationDto(
    Guid ReservationId,
    string UserId,
    DateTime Start,
    DateTime End
);