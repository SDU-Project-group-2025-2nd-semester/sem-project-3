namespace Backend.Data.Database;

public struct OpeningHours
{
    public TimeOnly OpeningTime { get; set; }
    public TimeOnly ClosingTime { get; set; }

    public DaysOfTheWeek DaysOfTheWeek { get; set; }
}