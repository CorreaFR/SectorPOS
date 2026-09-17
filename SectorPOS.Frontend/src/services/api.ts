import axios from 'axios';
import type { 
  Producto, 
  VentaRequest, 
  DashboardReporte, 
  CrearProductoRequest, 
  ActualizarProductoRequest,
  LoginRequest,
  UsuarioSesion
} from '../types';

// En un proyecto real, esto iría en variables de entorno (.env)
const API_BASE_URL = 'http://localhost:5129/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Autenticación & Seguridad
export const login = async (credentials: LoginRequest): Promise<UsuarioSesion> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Productos (Caja)
export const getProductos = async (): Promise<Producto[]> => {
  const response = await api.get('/productos');
  return response.data;
};

// Productos (Inventario completo)
export const getTodosProductos = async (): Promise<Producto[]> => {
  const response = await api.get('/productos/todos');
  return response.data;
};

export const crearProducto = async (data: CrearProductoRequest): Promise<Producto> => {
  const response = await api.post('/productos', data);
  return response.data;
};

export const actualizarProducto = async (id: number, data: ActualizarProductoRequest): Promise<Producto> => {
  const response = await api.put(`/productos/${id}`, data);
  return response.data;
};

export const reponerStock = async (id: number, cantidad: number): Promise<any> => {
  const response = await api.post(`/productos/${id}/reponer-stock`, { cantidad });
  return response.data;
};

export const alternarEstadoProducto = async (id: number): Promise<any> => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

// Ventas
export const registrarVenta = async (venta: VentaRequest): Promise<any> => {
  const response = await api.post('/ventas', venta);
  return response.data;
};

// Reportes
export const getDashboardReporte = async (): Promise<DashboardReporte> => {
  const response = await api.get('/reportes/dashboard');
  return response.data;
};
