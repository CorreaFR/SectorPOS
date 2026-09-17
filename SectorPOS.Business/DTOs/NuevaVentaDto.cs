namespace SectorPOS.Business.DTOs
{
    public class NuevaVentaDto
    {
        public int UsuarioId { get; set; }
        public List<DetalleVentaDto> Detalles { get; set; } = new();
    }

    public class DetalleVentaDto
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
    }
}
