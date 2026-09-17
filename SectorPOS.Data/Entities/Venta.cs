namespace SectorPOS.Data.Entities
{
    public class Venta
    {
        public int Id { get; set; }
        public DateTime FechaEmision { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } = "Pendiente"; // Estados: Pendiente, Pagada, Cancelada

        // Relación con Usuario (Vendedor)
        public int UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        // Relación con DetalleVenta
        public List<DetalleVenta> Detalles { get; set; } = new List<DetalleVenta>();
    }
}
