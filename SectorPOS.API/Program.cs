using Microsoft.EntityFrameworkCore;
using SectorPOS.Data.Context;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Entity Framework Core with SQLite
builder.Services.AddDbContext<SectorPOSDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registro de Servicios de la Capa de Negocio
builder.Services.AddScoped<SectorPOS.Business.Interfaces.IVentaService, SectorPOS.Business.Services.VentaService>();
builder.Services.AddScoped<SectorPOS.Business.Interfaces.IReporteService, SectorPOS.Business.Services.ReporteService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Inicialización de la Base de Datos y Datos de Prueba (Seeding)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SectorPOSDbContext>();
    // Asegurarse de que la base está creada y actualizada
    context.Database.Migrate();

    // Crear usuarios iniciales si no existen
    if (!context.Usuarios.Any(u => u.Rol == "Vendedor"))
    {
        context.Usuarios.Add(new SectorPOS.Data.Entities.Usuario
        {
            Nombre = "Cajero Principal",
            Email = "caja@sectorpos.com",
            PasswordHash = "admin123",
            Rol = "Vendedor"
        });
        context.SaveChanges();
    }

    if (!context.Usuarios.Any(u => u.Rol == "Administrador"))
    {
        context.Usuarios.Add(new SectorPOS.Data.Entities.Usuario
        {
            Nombre = "Administrador del Sistema",
            Email = "admin@sectorpos.com",
            PasswordHash = "admin123",
            Rol = "Administrador"
        });
        context.SaveChanges();
    }

    // Crear datos de prueba si la tabla está vacía
    if (!context.Productos.Any())
    {
        context.Productos.AddRange(
            new SectorPOS.Data.Entities.Producto { Nombre = "Gaseosa Cola 1L", CodigoBarras = "123456789", Precio = 1500, StockActual = 50, LimiteStockCritico = 10, Activo = true },
            new SectorPOS.Data.Entities.Producto { Nombre = "Alfajor de Chocolate", CodigoBarras = "987654321", Precio = 800, StockActual = 20, LimiteStockCritico = 5, Activo = true },
            new SectorPOS.Data.Entities.Producto { Nombre = "Cerveza Lata 473ml", CodigoBarras = "111222333", Precio = 2200, StockActual = 3, LimiteStockCritico = 12, Activo = true }
        );
        context.SaveChanges();
    }
}

app.Run();
