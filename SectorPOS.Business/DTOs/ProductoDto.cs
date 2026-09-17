namespace SectorPOS.Business.DTOs
{
    public class CrearProductoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string CodigoBarras { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public int StockInicial { get; set; }
        public int LimiteStockCritico { get; set; } = 5;
    }

    public class ActualizarProductoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public int LimiteStockCritico { get; set; }
        public bool Activo { get; set; } = true;
    }

    public class ReponerStockDto
    {
        public int Cantidad { get; set; }
    }
}
