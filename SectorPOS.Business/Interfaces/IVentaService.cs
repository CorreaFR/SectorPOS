using SectorPOS.Business.DTOs;
using SectorPOS.Data.Entities;

namespace SectorPOS.Business.Interfaces
{
    public interface IVentaService
    {
        Task<Venta> RegistrarVentaAsync(NuevaVentaDto nuevaVenta);
    }
}
