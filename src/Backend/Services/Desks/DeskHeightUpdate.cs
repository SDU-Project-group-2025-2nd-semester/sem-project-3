namespace Backend.Services.Desks;

internal record DeskHeightUpdate
{
    public Guid DeskId { get; set; }
    public Guid RoomId { get; set; }
    public Guid CompanyId { get; set; }
    public int OldHeight { get; set; }
    public int NewHeight { get; set; }
    public DateTime Timestamp { get; set; }
}