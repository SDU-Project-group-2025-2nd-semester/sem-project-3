namespace Backend.Data.DeskJsonApi;

public class Usage
{
    [JsonPropertyName("activationsCounter")]
    public int ActivationsCounter { get; set; }

    [JsonPropertyName("sitStandCounter")]
    public int SitStandCounter { get; set; }
}