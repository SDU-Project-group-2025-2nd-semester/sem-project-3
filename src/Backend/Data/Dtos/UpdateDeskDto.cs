namespace Backend.Data;

public class UpdateDeskDto
{
    public int Height { get; set; }
    
    public int MaxHeight { get; set; }
    
    public int MinHeight { get; set; }
    
    public Guid RoomId { get; set; }
    
    public List<Guid> ReservationIds { get; set; } = [];
    
    public string? RpiMacAddress { get; set; }
}

