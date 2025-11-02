namespace Backend.Data;

public class OpeningHours
{
    public TimeOnly OpeningTime { get; set; }
    public TimeOnly ClosingTime { get; set; }

    public DaysOfTheWeek DaysOfTheWeek { get; set; }
}