namespace Backend.Data;

public class CreateReservationDto
{
    public DateTime Start { get; set; }

    public DateTime End { get; set; }

    public Guid DeskId { get; set; }
}