import React, { useState, useEffect, useMemo } from 'react';
import { 
  getTodosProductos, 
  crearProducto, 
  actualizarProducto, 
  reponerStock, 
  alternarEstadoProducto 
} from '../services/api';
import type { Producto, CrearProductoRequest, ActualizarProductoRequest } from '../types';
import { 
  Package, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  PlusCircle, 
  ToggleLeft, 
  ToggleRight, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Loader2,
  Boxes,
  Barcode
} from 'lucide-react';

export const InventarioPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'criticos' | 'inactivos'>('todos');
  
  // Feedback alerts
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [reponerProduct, setReponerProduct] = useState<Producto | null>(null);
  const [cantidadReponer, setCantidadReponer] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for Create
  const [newProduct, setNewProduct] = useState<CrearProductoRequest>({
    nombre: '',
    codigoBarras: '',
    precio: 1000,
    stockInicial: 20,
    limiteStockCritico: 5
  });

  // Form state for Edit
  const [editForm, setEditForm] = useState<ActualizarProductoRequest>({
    nombre: '',
    precio: 0,
    limiteStockCritico: 5,
    activo: true
  });

  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      const data = await getTodosProductos();
      setProductos(data);
      setMensajeError(null);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setMensajeError('No se pudo conectar con el catálogo de inventario.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  const showSuccess = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.codigoBarras.includes(searchQuery);
      
      if (!matchSearch) return false;

      if (filterStatus === 'activos') return p.activo;
      if (filterStatus === 'inactivos') return !p.activo;
      if (filterStatus === 'criticos') return p.activo && p.stockActual <= p.limiteStockCritico;
      return true;
    });
  }, [productos, searchQuery, filterStatus]);

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.nombre.trim() || !newProduct.codigoBarras.trim()) {
      setMensajeError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setIsSubmitting(true);
      setMensajeError(null);
      await crearProducto(newProduct);
      showSuccess(`¡Producto "${newProduct.nombre}" creado exitosamente!`);
      setIsCreateModalOpen(false);
      setNewProduct({
        nombre: '',
        codigoBarras: '',
        precio: 1000,
        stockInicial: 20,
        limiteStockCritico: 5
      });
      await fetchProductos();
    } catch (err: any) {
      setMensajeError(err.response?.data?.mensaje || err.message || 'Error al crear producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (producto: Producto) => {
    setEditingProduct(producto);
    setEditForm({
      nombre: producto.nombre,
      precio: producto.precio,
      limiteStockCritico: producto.limiteStockCritico,
      activo: producto.activo
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      setMensajeError(null);
      await actualizarProducto(editingProduct.id, editForm);
      showSuccess(`¡Producto "${editForm.nombre}" actualizado con éxito!`);
      setEditingProduct(null);
      await fetchProductos();
    } catch (err: any) {
      setMensajeError(err.response?.data?.mensaje || err.message || 'Error al actualizar producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Replenish Submit
  const handleReponerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reponerProduct || cantidadReponer <= 0) return;

    try {
      setIsSubmitting(true);
      setMensajeError(null);
      await reponerStock(reponerProduct.id, cantidadReponer);
      showSuccess(`Se ingresaron +${cantidadReponer} unidades a "${reponerProduct.nombre}".`);
      setReponerProduct(null);
      setCantidadReponer(10);
      await fetchProductos();
    } catch (err: any) {
      setMensajeError(err.response?.data?.mensaje || err.message || 'Error al reponer stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleEstado = async (producto: Producto) => {
    try {
      const res = await alternarEstadoProducto(producto.id);
      showSuccess(res.mensaje || 'Estado del producto actualizado.');
      await fetchProductos();
    } catch (err: any) {
      setMensajeError(err.response?.data?.mensaje || err.message || 'Error al cambiar estado.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 text-slate-800 overflow-y-auto font-sans p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Boxes className="text-[#1985A1]" size={28} />
            Gestión de Inventario y Catálogo
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Altas de nuevos artículos, actualización de listas de precios y reposición de stock en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProductos}
            title="Refrescar catálogo"
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1985A1] hover:bg-[#146b82] text-white text-xs font-bold shadow-md shadow-[#1985A1]/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {mensajeError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span>{mensajeError}</span>
          </div>
          <button onClick={() => setMensajeError(null)} className="text-rose-600 hover:text-rose-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Buscador y Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="flex-1 min-w-[240px] max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1985A1] focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'activos', label: 'Activos' },
            { id: 'criticos', label: 'Stock Crítico' },
            { id: 'inactivos', label: 'Inactivos' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#1985A1] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Total: <strong className="text-slate-900">{filteredProducts.length}</strong> productos
        </span>
      </div>

      {/* Tabla de Productos */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="animate-spin text-[#1985A1]" size={36} />
            <p className="text-xs font-semibold text-slate-600">Cargando catálogo...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Package size={40} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron productos</p>
            <p className="text-xs text-slate-500">Prueba con otro término de búsqueda o crea un nuevo producto.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Nombre del Producto</th>
                  <th className="py-3.5 px-4">Precio Venta</th>
                  <th className="py-3.5 px-4">Stock Disponible</th>
                  <th className="py-3.5 px-4">Umbral Crítico</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stockActual <= 0;
                  const isLowStock = prod.stockActual > 0 && prod.stockActual <= prod.limiteStockCritico;

                  return (
                    <tr 
                      key={prod.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${!prod.activo ? 'opacity-60 bg-slate-50/50' : ''}`}
                    >
                      {/* Código */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Barcode size={12} className="text-slate-400" />
                          {prod.codigoBarras}
                        </span>
                      </td>

                      {/* Nombre */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {prod.nombre}
                      </td>

                      {/* Precio */}
                      <td className="py-3.5 px-4 font-bold font-mono text-[#1985A1]">
                        {formatCurrency(prod.precio)}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Agotado (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                            <AlertTriangle size={11} />
                            {prod.stockActual} uds. (Bajo)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                            {prod.stockActual} uds.
                          </span>
                        )}
                      </td>

                      {/* Límite Crítico */}
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {prod.limiteStockCritico} uds.
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          prod.activo 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${prod.activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {prod.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Reponer Stock */}
                          <button
                            type="button"
                            onClick={() => {
                              setReponerProduct(prod);
                              setCantidadReponer(10);
                            }}
                            title="Ingreso de mercadería (Reponer stock)"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                          >
                            <PlusCircle size={15} />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            title="Editar datos del producto"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Alternar Activo */}
                          <button
                            type="button"
                            onClick={() => handleToggleEstado(prod)}
                            title={prod.activo ? 'Desactivar del catálogo' : 'Activar producto'}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              prod.activo 
                                ? 'bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200 hover:border-rose-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {prod.activo ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREAR NUEVO PRODUCTO */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 animate-scale-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1985A1]/15 text-[#1985A1] border border-[#1985A1]/30 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Nuevo Producto</h3>
                  <p className="text-xs text-slate-500">Ingresa los datos para dar de alta en catálogo</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Alfajor de Dulce de Leche 60g"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1985A1] focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Código de Barras *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 779123456789"
                    value={newProduct.codigoBarras}
                    onChange={(e) => setNewProduct({ ...newProduct, codigoBarras: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1985A1] focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Precio de Venta ($) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={newProduct.precio}
                    onChange={(e) => setNewProduct({ ...newProduct, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1985A1] focus:bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Stock Inicial (Unidades)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.stockInicial}
                    onChange={(e) => setNewProduct({ ...newProduct, stockInicial: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1985A1] focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Límite Stock Crítico
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProduct.limiteStockCritico}
                    onChange={(e) => setNewProduct({ ...newProduct, limiteStockCritico: parseInt(e.target.value) || 5 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1985A1] focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1985A1] hover:bg-[#146b82] text-white text-xs font-bold shadow-md shadow-[#1985A1]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR PRODUCTO */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 animate-scale-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1985A1]/15 text-[#1985A1] border border-[#1985A1]/30 flex items-center justify-center">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Editar Producto</h3>
                  <p className="text-xs text-slate-500">Código: {editingProduct.codigoBarras}</p>
                </div>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1985A1] focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Precio de Venta ($)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={editForm.precio}
                    onChange={(e) => setEditForm({ ...editForm, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1985A1] focus:bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Límite Stock Crítico
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.limiteStockCritico}
                    onChange={(e) => setEditForm({ ...editForm, limiteStockCritico: parseInt(e.target.value) || 5 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1985A1] focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Estado del Producto</span>
                  <span className="text-[11px] text-slate-500">Si está inactivo, no aparecerá en la caja registradora.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, activo: !editForm.activo })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editForm.activo
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {editForm.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1985A1] hover:bg-[#146b82] text-white text-xs font-bold shadow-md shadow-[#1985A1]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REPONER STOCK (INGRESO DE MERCADERÍA) */}
      {/* ========================================================================= */}
      {reponerProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 animate-scale-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1985A1]/15 text-[#1985A1] border border-[#1985A1]/30 flex items-center justify-center">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ingreso de Mercadería</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">{reponerProduct.nombre}</p>
                </div>
              </div>
              <button onClick={() => setReponerProduct(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReponerSubmit} className="mt-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">Stock Actual en Base:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{reponerProduct.stockActual} unidades</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cantidad de Unidades a Añadir:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadReponer}
                  onChange={(e) => setCantidadReponer(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-lg text-center text-slate-900 font-mono font-bold focus:outline-none focus:border-[#1985A1] focus:bg-white"
                />
              </div>

              {/* Botones Rápidos de incremento */}
              <div className="flex gap-2 justify-center">
                {[5, 10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCantidadReponer(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      cantidadReponer === preset
                        ? 'bg-[#1985A1] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReponerProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || cantidadReponer <= 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Confirmar Ingreso (+{cantidadReponer})</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
