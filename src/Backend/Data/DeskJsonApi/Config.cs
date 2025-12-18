namespace Backend.Data.DeskJsonApi;

public class Config
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("manufacturer")]
    public string Manufacturer { get; set; }
}