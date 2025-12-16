namespace Backend.Services.DeskApis;

public class SimulatorConnectionException : Exception
{
    public SimulatorConnectionException(string message, Exception? innerException = null) 
        : base(message, innerException) { }
}