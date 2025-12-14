using Microsoft.AspNetCore.Http;
using System.Net.Http;

namespace Backend.Services.DeskApis;

// Custom exceptions for simulator-related errors
public class SimulatorConfigurationException : Exception
{
    public SimulatorConfigurationException(string message) : base(message) { }
}