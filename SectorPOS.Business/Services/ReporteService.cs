using System.Globalization;
using Microsoft.EntityFrameworkCore;
using SectorPOS.Business.DTOs;
using SectorPOS.Business.Interfaces;
using SectorPOS.Data.Context;

namespace SectorPOS.Business.Services
{
    public class ReporteService : IReporteService
    {
        private readonly SectorPOSDbContext _context;

        public ReporteService(SectorPOSDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardReporteDto> ObtenerDashboardReporteAsync()
        {
            var ahora = DateTime.UtcNow;
            var inicioHoy = new DateTime(ahora.Year, ahora.Month, ahora.Day, 0, 0, 0, DateTimeKind.Utc);
            var finHoy = inicioHoy.AddDays(1);

            // 1. Ventas de Hoy
            var ventasHoy = await _context.Ventas
                .Where(v => v.FechaEmision >= inicioHoy && v.FechaEmision < finHoy && v.Estado == "Pagada")
                .ToListAsync();

            var totalVentasHoy = ventasHoy.Sum(v => v.Total);
            var cantidadVentasHoy = ventasHoy.Count;
            var ticketPromedio = cantidadVentasHoy > 0 ? totalVentasHoy / cantidadVentasHoy : 0;

            // 2. Ventas Históricas Totales
            var totalVentasHistorico = (await _context.Ventas
                .Where(v => v.Estado == "Pagada")
                .Select(v => v.Total)
                .ToListAsync())
                .Sum();

            var cantidadVentasHistorico = await _context.Ventas
                .Where(v => v.Estado == "Pagada")
                .CountAsync();

            // 3. Top Productos Más Vendidos
            var detalles = await _context.DetallesVenta
                .Include(d => d.Producto)
                .ToListAsync();

            var topProductos = detalles
                .GroupBy(d => new { d.ProductoId, Nombre = d.Producto?.Nombre ?? "Sin nombre", Codigo = d.Producto?.CodigoBarras ?? "" })
                .Select(g => new TopProductoDto
                {
                    ProductoId = g.Key.ProductoId,
                    Nombre = g.Key.Nombre,
                    CodigoBarras = g.Key.Codigo,
                    UnidadesVendidas = g.Sum(x => x.Cantidad),
                    TotalRecaudado = g.Sum(x => x.Subtotal)
                })
                .OrderByDescending(p => p.UnidadesVendidas)
                .Take(5)
                .ToList();

            // 4. Productos con Stock Bajo / Crítico
            var productosBajoStock = await _context.Productos
                .Where(p => p.Activo && p.StockActual <= p.LimiteStockCritico)
                .OrderBy(p => p.StockActual)
                .Select(p => new ProductoBajoStockDto
                {
                    ProductoId = p.Id,
                    Nombre = p.Nombre,
                    CodigoBarras = p.CodigoBarras,
                    StockActual = p.StockActual,
                    LimiteStockCritico = p.LimiteStockCritico
                })
                .ToListAsync();

            // 5. Ventas de los últimos 7 días (para gráficos y tendencias)
            var hace7Dias = inicioHoy.AddDays(-6);
            var ventas7Dias = await _context.Ventas
                .Where(v => v.FechaEmision >= hace7Dias && v.Estado == "Pagada")
                .ToListAsync();

            var diasEspanol = new CultureInfo("es-AR");
            var ventasUltimosDias = new List<VentaPorDiaDto>();

            for (int i = 0; i < 7; i++)
            {
                var fechaDia = hace7Dias.AddDays(i);
                var fechaDiaFin = fechaDia.AddDays(1);

                var ventasDelDia = ventas7Dias
                    .Where(v => v.FechaEmision >= fechaDia && v.FechaEmision < fechaDiaFin)
                    .ToList();

                ventasUltimosDias.Add(new VentaPorDiaDto
                {
                    Fecha = fechaDia.ToString("yyyy-MM-dd"),
                    DiaNombre = fechaDia.ToString("ddd d", diasEspanol),
                    Total = ventasDelDia.Sum(v => v.Total),
                    CantidadVentas = ventasDelDia.Count
                });
            }

            return new DashboardReporteDto
            {
                TotalVentasHoy = totalVentasHoy,
                CantidadVentasHoy = cantidadVentasHoy,
                TicketPromedio = ticketPromedio,
                TotalVentasHistorico = totalVentasHistorico,
                CantidadVentasHistorico = cantidadVentasHistorico,
                TopProductos = topProductos,
                ProductosBajoStock = productosBajoStock,
                VentasUltimosDias = ventasUltimosDias
            };
        }
    }
}
