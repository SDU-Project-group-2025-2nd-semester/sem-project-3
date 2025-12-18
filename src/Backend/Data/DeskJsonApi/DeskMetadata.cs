namespace Backend.Data.DeskJsonApi;

public class DeskMetadata
{
    public Config Config { get; set; }

    public Usage Usage { get; set; }

    public List<LastError> LastErrors { get; set; }

    public string Status { get; set; }

    public bool IsPositionLost { get; set; }

    public bool IsOverloadProtectionUp { get; set; }
    
    public bool IsOverloadProtectionDown { get; set; }

    public bool IsAntiCollision { get; set; }
}