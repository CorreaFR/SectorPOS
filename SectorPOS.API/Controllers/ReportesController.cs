using Microsoft.AspNetCore.Mvc;
using SectorPOS.Business.Interfaces;

namespace SectorPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportesController : ControllerBase
    {
        private readonly IReporteService _reporteService;

        public ReportesController(IReporteService reporteService)
        {
            _reporteService = reporteService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardReporte()
        {
            try
            {
                var reporte = await _reporteService.ObtenerDashboardReporteAsync();
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Mensaje = $"Error al generar el reporte: {ex.Message}" });
            }
        }
    }
}
