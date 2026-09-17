import React from 'react';
import type { Producto } from '../types';
import { Tag, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProductCardProps {
  producto: Producto;
  onAdd: (producto: Producto) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto, onAdd }) => {
  const isOutOfStock = producto.stockActual <= 0;
  const isLowStock = producto.stockActual > 0 && producto.stockActual <= producto.limiteStockCritico;

  // Formato de moneda ARS
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(producto.precio);

  return (
    <div
      onClick={() => !isOutOfStock && onAdd(producto)}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl transition-all duration-200 select-none ${
        isOutOfStock
          ? 'bg-slate-100 border border-slate-200 opacity-60 cursor-not-allowed'
          : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:shadow-md hover:shadow-[#1985A1]/10 hover:border-[#1985A1] hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]'
      }`}
    >
      {/* Top row: Stock badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide bg-slate-100 text-slate-600 font-mono border border-slate-200">
          <Tag size={12} className="text-slate-400" />
          {producto.codigoBarras}
        </span>

        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Agotado
          </span>
        ) : isLowStock ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <AlertTriangle size={12} />
            Quedan {producto.stockActual}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} />
            Stock {producto.stockActual}
          </span>
        )}
      </div>

      {/* Middle: Product Name */}
      <div className="my-2 min-h-[44px] flex flex-col justify-center">
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#1985A1] transition-colors">
          {producto.nombre}
        </h3>
        <span className="text-[11px] text-slate-400 font-medium mt-0.5">Unidad</span>
      </div>

      {/* Bottom row: Price */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Precio</span>
          <span className="text-lg font-black text-[#1985A1] tracking-tight font-mono">
            {precioFormateado}
          </span>
        </div>
      </div>
    </div>
  );
};
