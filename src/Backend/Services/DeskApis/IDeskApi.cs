using Backend.Data.DeskJsonApi;

namespace Backend.Services.DeskApis;

public interface IDeskApi
{
    Task<List<string>> GetAllDesks(Guid? companyId = null);
    Task<DeskJsonElement> GetDeskStatus(string macAddress, Guid? companyId = null);
    Task<Config> GetDeskConfig(string macAddress, Guid? companyId = null);
    Task<State> GetDeskState(string macAddress, Guid? companyId = null);
    Task<Usage> GetDeskUsage(string macAddress, Guid? companyId = null);
    Task<List<LastError>> GetDeskLastErrors(string macAddress, Guid? companyId = null);
    Task<Config> SetConfig(string macAddress, Config config, Guid? companyId = null);
    Task<State> SetState(string macAddress, State state, Guid? companyId = null);
    Task<Usage> SetUsage(string macAddress, Usage usage, Guid? companyId = null);
    Task<List<LastError>> SetLastErrors(string macAddress, List<LastError> lastErrors, Guid? companyId = null);
}