namespace Backend.Data.DeskJsonApi;

public class DeskJsonElement
{
    [JsonPropertyName("config")]
    public Config Config { get; set; }

    [JsonPropertyName("state")]
    public State State { get; set; }

    [JsonPropertyName("usage")]
    public Usage Usage { get; set; }

    [JsonPropertyName("lastErrors")]
    public List<LastError> LastErrors { get; set; }
}