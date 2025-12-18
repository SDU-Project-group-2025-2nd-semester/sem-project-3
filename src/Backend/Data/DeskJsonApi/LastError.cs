namespace Backend.Data.DeskJsonApi;

public class LastError
{
    [JsonPropertyName("timeS")]
    public int TimeS { get; set; }
    [JsonPropertyName("errorCode")]
    public int ErrorCode { get; set; }
}