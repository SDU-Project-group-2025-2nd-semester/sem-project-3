namespace Backend.Data.DeskJsonApi;

public class State
{
    [JsonPropertyName("position_mm")]
    public int PositionMm { get; set; }

    [JsonPropertyName("speed_mms")]
    public int SpeedMms { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("isPositionLost")]
    public bool IsPositionLost { get; set; }

    [JsonPropertyName("isOverloadProtectionUp")]
    public bool IsOverloadProtectionUp { get; set; }
    
    [JsonPropertyName("isOverloadProtectionDown")]
    public bool IsOverloadProtectionDown { get; set; }

    [JsonPropertyName("isAntiCollision")]
    public bool IsAntiCollision { get; set; }
}