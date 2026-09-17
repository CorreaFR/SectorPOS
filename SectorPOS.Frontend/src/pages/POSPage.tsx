import React, { useState, useEffect, useMemo } from 'react';
import { getProductos, registrarVenta } from '../services/api';
import type { Producto, CartItem, VentaRequest, UsuarioSesion } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { 
  Store, 
  Search, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Printer, 
  X, 
  Clock, 
  Layers, 
  PlusCircle, 
  GripVertical
} from 'lucide-react';

interface POSPageProps {
  usuario?: UsuarioSesion | null;
}

export const POSPage: React.FC<POSPageProps> = ({ usuario }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingVenta, setIsProcessingVenta] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Anchura regulable del ticket / sidebar
  const [cartWidth, setCartWidth] = useState<number>(380);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Estado para el modal de Ticket emitido
  const [lastSaleReceipt, setLastSaleReceipt] = useState<{
    id: number;
    fecha: string;
    fechaHora: string;
    cajero: string;
    items: CartItem[];
    total: number;
    metodoPago: string;
    montoRecibido: number;
    vuelto: number;
  } | null>(null);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lógica para redimensionar el panel del ticket arrastrando
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Ancho calculado desde el borde derecho de la ventana
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setCartWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      const data = await getProductos();
      setProductos(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('No se pudo conectar con el servidor backend (API .NET en puerto 5129). Verifica que la API esté iniciada.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Filtrado de productos por búsqueda y categoría
  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.codigoBarras.includes(searchQuery);
      return matchSearch;
    });
  }, [productos, searchQuery]);

  const handleAddToCart = (producto: Producto) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === producto.id);
      if (existing) {
        if (existing.cantidad >= producto.stockActual) return prev;
        return prev.map(item => 
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const handleUpdateQuantity = (productoId: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productoId) {
        const newQty = item.cantidad + delta;
        if (newQty < 1 || newQty > item.stockActual) return item;
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productoId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productoId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCheckout = async (metodoPago: string, _montoRecibido: number, vuelto: number) => {
    if (cartItems.length === 0) return;
    
    setIsProcessingVenta(true);
    setError(null);
    
    try {
      const request: VentaRequest = {
        usuarioId: usuario?.id || 1,
        detalles: cartItems.map(item => ({
          productoId: item.id,
          cantidad: item.cantidad,
          precioUnitario: item.precio
        }))
      };

      const response = await registrarVenta(request);
      
      const totalVenta = cartItems.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
      const now = new Date();

      // Guardar ticket para el modal profesional
      setLastSaleReceipt({
        id: response?.id || Math.floor(1000 + Math.random() * 9000),
        fecha: now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        fechaHora: `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
        cajero: usuario?.nombre || 'Cajero de Turno',
        items: [...cartItems],
        total: totalVenta,
        metodoPago: metodoPago.toUpperCase(),
        montoRecibido: _montoRecibido || totalVenta,
        vuelto
      });

      setCartItems([]);
      await fetchProductos(); // Refrescar stock en tiempo real

    } catch (err: any) {
      console.error('Error procesando venta:', err);
      const msg = err.response?.data?.mensaje || err.response?.data?.Mensaje || err.response?.data?.message || err.message || 'Error al procesar la venta. Verifique el stock.';
      setError(msg);
    } finally {
      setIsProcessingVenta(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100 text-slate-800 overflow-hidden font-sans">
      
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        
        <header className="px-4 sm:px-6 py-2.5 bg-white border-b border-slate-200 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1985A1]/15 text-[#1985A1] border border-[#1985A1]/30 flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-tight">Caja Registradora</span>
              <p className="text-[11px] text-slate-500">Terminal #01 • Turno Activo</p>
            </div>
          </div>

          <div className="flex-1 min-w-[220px] max-w-lg relative order-3 md:order-2 w-full md:w-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Buscar por nombre o escanear código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1985A1] focus:bg-white focus:ring-2 focus:ring-[#1985A1]/20 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 order-2 md:order-3 ml-auto md:ml-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-600 hidden sm:inline">En línea</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <Clock size={13} className="text-slate-400" />
              <span className="font-mono text-slate-700 font-semibold">
                {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <button
              onClick={fetchProductos}
              title="Recargar catálogo de productos"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        <div className="px-4 sm:px-6 py-2.5 bg-white/70 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
              <Layers size={13} />
              Filtros:
            </span>
            {['todos', 'bebidas', 'snacks', 'almacen'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1985A1] text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 shrink-0">
            Mostrando <strong className="text-slate-800">{filteredProducts.length}</strong> de {productos.length}
          </span>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700">
              <X size={14} />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="animate-spin text-[#1985A1]" size={40} />
              <p className="text-sm font-semibold text-slate-600">Cargando catálogo en tiempo real...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
                <Search size={24} className="text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-800">No se encontraron productos</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                No hay resultados para "{searchQuery}". Intenta con otro término o limpia los filtros.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todos');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <div
        onMouseDown={() => setIsResizing(true)}
        className="hidden lg:flex w-1 bg-slate-200 hover:bg-[#1985A1] transition-colors cursor-col-resize items-center justify-center relative group select-none z-20"
        title="Arrastrar para redimensionar el panel del ticket"
      >
        <div className="absolute -left-1.5 -right-1.5 top-0 bottom-0"></div>
        <div className="w-4 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-[#1985A1] transition-all shadow-xs">
          <GripVertical size={12} />
        </div>
      </div>

      <div 
        style={{ width: `${cartWidth}px` }}
        className="w-full lg:shrink-0 h-[450px] lg:h-full z-10"
      >
        <Cart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          isProcessing={isProcessingVenta}
        />
      </div>

      {lastSaleReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-[420px] my-auto bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col overflow-hidden">
            
            {/* Modal Header Actions (No print) */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Comprobante Oficial Emitido
                </span>
              </div>
              <button
                onClick={() => setLastSaleReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Receipt Paper Container */}
            <div 
              id="printable-receipt"
              className="p-6 bg-white text-slate-900 font-mono text-[11px] leading-relaxed max-h-[70vh] overflow-y-auto select-text"
            >
              {/* Encabezado Comercial / Datos Fiscales */}
              <div className="text-center pb-3 border-b border-slate-900/40 space-y-1">
                <div className="text-base font-black tracking-wider uppercase font-sans text-slate-950">
                  SECTORPOS S.A.
                </div>
                <div className="text-[10px] text-slate-600 font-sans">
                  SISTEMA DE GESTIÓN COMERCIAL Y FACTURACIÓN
                </div>
                <div className="text-[10px] text-slate-700">
                  CUIT: 30-71829450-4 • IVA RESPONSABLE INSCRIPTO
                </div>
                <div className="text-[10px] text-slate-600">
                  Av. Corrientes 1234, CABA • Tel: (011) 4890-1200
                </div>

                {/* Recuadro de Tipo de Comprobante */}
                <div className="pt-2 pb-1">
                  <div className="inline-block border border-slate-900 px-3 py-1 font-bold text-xs bg-slate-50 text-slate-950">
                    FACTURA "B" • N° 0001-{String(lastSaleReceipt.id).padStart(8, '0')}
                  </div>
                </div>
              </div>

              {/* Metadatos de la Transacción */}
              <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">FECHA/HORA:</span>
                  <span className="font-bold text-slate-900">{lastSaleReceipt.fechaHora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TERMINAL:</span>
                  <span className="text-slate-800">CAJA #01 (POS-LOCAL)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">OPERADOR:</span>
                  <span className="text-slate-800 uppercase">{lastSaleReceipt.cajero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CLIENTE:</span>
                  <span className="text-slate-800">CONSUMIDOR FINAL (DNI: S/D)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">COND. VENTA:</span>
                  <span className="font-bold text-slate-900">{lastSaleReceipt.metodoPago}</span>
                </div>
              </div>

              {/* Detalle de Artículos */}
              <div className="py-2.5 border-b border-slate-900/40">
                {/* Cabecera de columnas */}
                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                  <span className="w-10">CANT</span>
                  <span className="flex-1 px-1">DESCRIPCIÓN</span>
                  <span className="w-16 text-right">P.UNIT</span>
                  <span className="w-18 text-right">TOTAL</span>
                </div>

                {/* Filas de Artículos */}
                <div className="divide-y divide-dashed divide-slate-200 py-1">
                  {lastSaleReceipt.items.map((item) => (
                    <div key={item.id} className="py-1.5 flex justify-between items-start text-[10.5px]">
                      <span className="w-10 font-bold text-slate-800">
                        {item.cantidad}x
                      </span>
                      <div className="flex-1 px-1 min-w-0">
                        <div className="font-semibold text-slate-950 truncate">
                          {item.nombre}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          Cod: {item.codigoBarras}
                        </div>
                      </div>
                      <span className="w-16 text-right text-slate-600">
                        ${item.precio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="w-18 text-right font-bold text-slate-950">
                        ${(item.precio * item.cantidad).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liquidación e Importes */}
              <div className="py-2.5 border-b border-slate-900/40 space-y-1.5 text-[10.5px]">
                {/* Desglose impositivo estándar */}
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Gravado (Neto):</span>
                  <span>
                    ${(lastSaleReceipt.total / 1.21).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA Débito Fiscal (21%):</span>
                  <span>
                    ${(lastSaleReceipt.total - (lastSaleReceipt.total / 1.21)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Gran Total */}
                <div className="pt-2 border-t border-slate-900/80 flex justify-between items-baseline font-sans">
                  <span className="text-sm font-black text-slate-950 uppercase tracking-tight">
                    TOTAL GENERAL
                  </span>
                  <span className="text-xl font-black font-mono text-slate-950 tracking-tight">
                    ${lastSaleReceipt.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Detalle del Pago y Vuelto si aplica */}
                {lastSaleReceipt.metodoPago === 'EFECTIVO' && (
                  <div className="pt-1.5 border-t border-dashed border-slate-300 text-[10px] space-y-0.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Importe Abonado:</span>
                      <span className="font-semibold text-slate-800">
                        ${(lastSaleReceipt.montoRecibido || lastSaleReceipt.total).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    {lastSaleReceipt.vuelto > 0 && (
                      <div className="flex justify-between font-bold text-slate-950">
                        <span>Su Vuelto:</span>
                        <span>
                          ${lastSaleReceipt.vuelto.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pie Fiscal / CAE y Leyendas */}
              <div className="pt-4 text-center space-y-2 text-[9px] text-slate-500">
                <div className="font-bold text-slate-700 tracking-wider">
                  CAE N°: 74920482910482 • VTO. CAE: {new Date(Date.now() + 10 * 86400000).toLocaleDateString('es-AR')}
                </div>
                
                {/* Código de barras simulado / estilo fiscal */}
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="h-9 w-52 bg-slate-900/80 flex items-center justify-around px-2 py-1">
                    {[...Array(38)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`h-full bg-white ${i % 3 === 0 ? 'w-[2px]' : i % 2 === 0 ? 'w-[1px]' : 'w-[3px]'}`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[8px] text-slate-400 mt-0.5 tracking-widest">
                    3071829450406{String(lastSaleReceipt.id).padStart(8, '0')}74920482910482
                  </span>
                </div>

                <div className="text-[9px] text-slate-400 uppercase pt-1 border-t border-dashed border-slate-300">
                  Comprobante Autorizado por AFIP / ARCA
                </div>
                <div className="font-medium text-slate-600">
                  ¡Gracias por su compra! Conserve este ticket como garantía.
                </div>
              </div>
            </div>

            {/* Modal Bottom Buttons (No print) */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <Printer size={15} className="text-slate-600" />
                <span>Imprimir Ticket (80mm)</span>
              </button>
              <button
                type="button"
                onClick={() => setLastSaleReceipt(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1985A1] text-white font-bold text-xs hover:bg-[#146b82] shadow-md shadow-[#1985A1]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <PlusCircle size={15} />
                <span>Nueva Venta</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
