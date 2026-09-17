using Microsoft.EntityFrameworkCore;
using SectorPOS.Business.DTOs;
using SectorPOS.Business.Interfaces;
using SectorPOS.Data.Context;
using SectorPOS.Data.Entities;

namespace SectorPOS.Business.Services
{
    public class VentaService : IVentaService
    {
        private readonly SectorPOSDbContext _context;

        public VentaService(SectorPOSDbContext context)
        {
            _context = context;
        }

        public async Task<Venta> RegistrarVentaAsync(NuevaVentaDto nuevaVenta)
        {
            // Iniciamos una transacción para asegurar integridad (ACID)
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var venta = new Venta
                {
                    FechaEmision = DateTime.UtcNow,
                    UsuarioId = nuevaVenta.UsuarioId,
                    Estado = "Pagada", 
                    Total = 0
                };

                _context.Ventas.Add(venta);

                foreach (var detalle in nuevaVenta.Detalles)
                {
                    var producto = await _context.Productos.FindAsync(detalle.ProductoId);
                    
                    if (producto == null)
                        throw new Exception($"El producto con ID {detalle.ProductoId} no existe.");

                    // 1. REGLA DE NEGOCIO: Validar Stock
                    if (producto.StockActual < detalle.Cantidad)
                        throw new Exception($"No hay stock suficiente para el producto '{producto.Nombre}'. Stock actual: {producto.StockActual}.");

                    // 2. REGLA DE NEGOCIO: Descontar Inventario
                    producto.StockActual -= detalle.Cantidad;

                    var subtotal = producto.Precio * detalle.Cantidad;
                    venta.Total += subtotal;

                    var nuevoDetalle = new DetalleVenta
                    {
                        ProductoId = producto.Id,
                        Cantidad = detalle.Cantidad,
                        PrecioUnitario = producto.Precio,
                        Subtotal = subtotal,
                        Venta = venta
                    };

                    _context.DetallesVenta.Add(nuevoDetalle);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return venta;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw; // El middleware de la API atrapará esto y devolverá HTTP 400 o 500
            }
        }
    }
}
