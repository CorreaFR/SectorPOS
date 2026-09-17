namespace SectorPOS.Business.DTOs
{
    public class DashboardReporteDto
    {
        public decimal TotalVentasHoy { get; set; }
        public int CantidadVentasHoy { get; set; }
        public decimal TicketPromedio { get; set; }
        public decimal TotalVentasHistorico { get; set; }
        public int CantidadVentasHistorico { get; set; }
        public List<TopProductoDto> TopProductos { get; set; } = new();
        public List<ProductoBajoStockDto> ProductosBajoStock { get; set; } = new();
        public List<VentaPorDiaDto> VentasUltimosDias { get; set; } = new();
    }

    public class TopProductoDto
    {
        public int ProductoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string CodigoBarras { get; set; } = string.Empty;
        public int UnidadesVendidas { get; set; }
        public decimal TotalRecaudado { get; set; }
    }

    public class ProductoBajoStockDto
    {
        public int ProductoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string CodigoBarras { get; set; } = string.Empty;
        public int StockActual { get; set; }
        public int LimiteStockCritico { get; set; }
    }

    public class VentaPorDiaDto
    {
        public string Fecha { get; set; } = string.Empty; // YYYY-MM-DD
        public string DiaNombre { get; set; } = string.Empty; // Ej: Lun, Mar...
        public decimal Total { get; set; }
        public int CantidadVentas { get; set; }
    }
}
