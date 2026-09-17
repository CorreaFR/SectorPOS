using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SectorPOS.Business.DTOs;
using SectorPOS.Data.Context;

namespace SectorPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SectorPOSDbContext _context;

        public AuthController(SectorPOSDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { Mensaje = "El email y la contraseña son requeridos." });

            var emailLimpio = dto.Email.Trim().ToLower();
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailLimpio);

            if (usuario == null || usuario.PasswordHash != dto.Password.Trim())
            {
                return Unauthorized(new { Mensaje = "Credenciales incorrectas. Verifique email y contraseña." });
            }

            var sesion = new UsuarioSesionDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                Rol = usuario.Rol
            };

            return Ok(sesion);
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Select(u => new UsuarioSesionDto
                {
                    Id = u.Id,
                    Nombre = u.Nombre,
                    Email = u.Email,
                    Rol = u.Rol
                })
                .ToListAsync();

            return Ok(usuarios);
        }
    }
}
