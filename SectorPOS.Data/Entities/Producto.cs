namespace SectorPOS.Data.Entities
{
    public class Producto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string CodigoBarras { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public int StockActual { get; set; }
        public int LimiteStockCritico { get; set; }
        public bool Activo { get; set; } = true;
    }
}
