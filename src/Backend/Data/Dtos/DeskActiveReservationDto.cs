namespace Backend.Data.Dtos;

public record DeskActiveReservationDto(
    Guid ReservationId,
    string UserId,
    DateTime Start,
    DateTime End
);