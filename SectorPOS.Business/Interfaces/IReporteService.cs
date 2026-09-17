using SectorPOS.Business.DTOs;

namespace SectorPOS.Business.Interfaces
{
    public interface IReporteService
    {
        Task<DashboardReporteDto> ObtenerDashboardReporteAsync();
    }
}
