using Microsoft.AspNetCore.Mvc;
using SectorPOS.Business.DTOs;
using SectorPOS.Business.Interfaces;

namespace SectorPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentasController : ControllerBase
    {
        private readonly IVentaService _ventaService;

        public VentasController(IVentaService ventaService)
        {
            _ventaService = ventaService;
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarVenta([FromBody] NuevaVentaDto nuevaVenta)
        {
            try
            {
                var venta = await _ventaService.RegistrarVentaAsync(nuevaVenta);
                
                // Devolvemos DTO limpio para evitar referencias circulares
                return Ok(new
                {
                    venta.Id,
                    venta.FechaEmision,
                    venta.Total,
                    venta.Estado,
                    venta.UsuarioId
                });
            }
            catch (Exception ex)
            {
                var mensaje = ex.InnerException != null ? $"{ex.Message} ({ex.InnerException.Message})" : ex.Message;
                return BadRequest(new { Mensaje = mensaje });
            }
        }
    }
}
