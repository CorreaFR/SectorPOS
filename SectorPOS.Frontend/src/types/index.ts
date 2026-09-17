export interface Producto {
  id: number;
  nombre: string;
  codigoBarras: string;
  precio: number;
  stockActual: number;
  limiteStockCritico: number;
  activo: boolean;
}

export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface VentaRequest {
  usuarioId: number;
  detalles: DetalleVentaRequest[];
}

export interface CartItem extends Producto {
  cantidad: number;
}

export interface CrearProductoRequest {
  nombre: string;
  codigoBarras: string;
  precio: number;
  stockInicial: number;
  limiteStockCritico: number;
}

export interface ActualizarProductoRequest {
  nombre: string;
  precio: number;
  limiteStockCritico: number;
  activo: boolean;
}

export interface TopProducto {
  productoId: number;
  nombre: string;
  codigoBarras: string;
  unidadesVendidas: number;
  totalRecaudado: number;
}

export interface ProductoBajoStock {
  productoId: number;
  nombre: string;
  codigoBarras: string;
  stockActual: number;
  limiteStockCritico: number;
}

export interface VentaPorDia {
  fecha: string;
  diaNombre: string;
  total: number;
  cantidadVentas: number;
}

export interface DashboardReporte {
  totalVentasHoy: number;
  cantidadVentasHoy: number;
  ticketPromedio: number;
  totalVentasHistorico: number;
  cantidadVentasHistorico: number;
  topProductos: TopProducto[];
  productosBajoStock: ProductoBajoStock[];
  ventasUltimosDias: VentaPorDia[];
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Vendedor' | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
