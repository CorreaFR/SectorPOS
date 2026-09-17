using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SectorPOS.Business.DTOs;
using SectorPOS.Data.Context;
using SectorPOS.Data.Entities;

namespace SectorPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly SectorPOSDbContext _context;

        public ProductosController(SectorPOSDbContext context)
        {
            _context = context;
        }

        // GET: api/productos (Solo activos - Para la caja registradora)
        [HttpGet]
        public async Task<IActionResult> GetProductos()
        {
            var productos = await _context.Productos
                .Where(p => p.Activo)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
            return Ok(productos);
        }

        // GET: api/productos/todos (Todos los productos - Para administración de inventario)
        [HttpGet("todos")]
        public async Task<IActionResult> GetTodosProductos()
        {
            var productos = await _context.Productos
                .OrderByDescending(p => p.Activo)
                .ThenBy(p => p.Nombre)
                .ToListAsync();
            return Ok(productos);
        }

        // GET: api/productos/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductoPorId(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                return NotFound(new { Mensaje = $"Producto con ID {id} no encontrado." });

            return Ok(producto);
        }

        // POST: api/productos (Crear nuevo producto)
        [HttpPost]
        public async Task<IActionResult> CrearProducto([FromBody] CrearProductoDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.CodigoBarras))
                return BadRequest(new { Mensaje = "El nombre y el código de barras son obligatorios." });

            if (dto.Precio <= 0)
                return BadRequest(new { Mensaje = "El precio debe ser mayor a 0." });

            if (dto.StockInicial < 0)
                return BadRequest(new { Mensaje = "El stock inicial no puede ser negativo." });

            // Validar que el código de barras no esté duplicado
            var codigoExiste = await _context.Productos.AnyAsync(p => p.CodigoBarras == dto.CodigoBarras.Trim());
            if (codigoExiste)
                return BadRequest(new { Mensaje = $"Ya existe un producto registrado con el código de barras '{dto.CodigoBarras}'." });

            var nuevoProducto = new Producto
            {
                Nombre = dto.Nombre.Trim(),
                CodigoBarras = dto.CodigoBarras.Trim(),
                Precio = dto.Precio,
                StockActual = dto.StockInicial,
                LimiteStockCritico = dto.LimiteStockCritico > 0 ? dto.LimiteStockCritico : 5,
                Activo = true
            };

            _context.Productos.Add(nuevoProducto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProductoPorId), new { id = nuevoProducto.Id }, nuevoProducto);
        }

        // PUT: api/productos/{id} (Actualizar datos del producto)
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarProducto(int id, [FromBody] ActualizarProductoDto dto)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                return NotFound(new { Mensaje = $"Producto con ID {id} no encontrado." });

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                return BadRequest(new { Mensaje = "El nombre no puede estar vacío." });

            if (dto.Precio <= 0)
                return BadRequest(new { Mensaje = "El precio debe ser mayor a 0." });

            producto.Nombre = dto.Nombre.Trim();
            producto.Precio = dto.Precio;
            producto.LimiteStockCritico = dto.LimiteStockCritico;
            producto.Activo = dto.Activo;

            await _context.SaveChangesAsync();
            return Ok(producto);
        }

        // POST: api/productos/{id}/reponer-stock (Ingreso de mercadería)
        [HttpPost("{id}/reponer-stock")]
        public async Task<IActionResult> ReponerStock(int id, [FromBody] ReponerStockDto dto)
        {
            if (dto.Cantidad <= 0)
                return BadRequest(new { Mensaje = "La cantidad a reponer debe ser mayor a 0." });

            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                return NotFound(new { Mensaje = $"Producto con ID {id} no encontrado." });

            producto.StockActual += dto.Cantidad;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Mensaje = $"Se añadieron {dto.Cantidad} unidades a '{producto.Nombre}'.",
                ProductoId = producto.Id,
                StockActual = producto.StockActual
            });
        }

        // DELETE: api/productos/{id} (Baja lógica / Desactivar producto)
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                return NotFound(new { Mensaje = $"Producto con ID {id} no encontrado." });

            // Baja lógica para preservar el histórico de ventas
            producto.Activo = !producto.Activo;
            await _context.SaveChangesAsync();

            var accion = producto.Activo ? "activado" : "desactivado";
            return Ok(new { Mensaje = $"Producto '{producto.Nombre}' ha sido {accion} con éxito.", Activo = producto.Activo });
        }
    }
}
