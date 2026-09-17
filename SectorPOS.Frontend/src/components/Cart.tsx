import React, { useState } from 'react';
import type { CartItem } from '../types';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  User, 
  ReceiptText, 
  ArrowRight,
  Loader2
} from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productoId: number, delta: number) => void;
  onRemoveItem: (productoId: number) => void;
  onClearCart: () => void;
  onCheckout: (metodoPago: string, montoRecibido: number, vuelto: number) => void;
  isProcessing: boolean;
}

export const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  onCheckout, 
  isProcessing 
}) => {
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'qr'>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState<string>('');

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

  const parsedMontoRecibido = parseFloat(montoRecibido) || 0;
  const vuelto = metodoPago === 'efectivo' && parsedMontoRecibido > total ? parsedMontoRecibido - total : 0;

  const handleQuickAmount = (amount: number) => {
    setMontoRecibido(amount.toString());
  };

  const handlePagar = () => {
    if (items.length === 0 || isProcessing) return;
    onCheckout(metodoPago, parsedMontoRecibido || total, vuelto);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 text-slate-800 select-none shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1985A1]/15 text-[#1985A1] flex items-center justify-center border border-[#1985A1]/30">
            <ReceiptText size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Ticket Actual
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1985A1]/15 text-[#1985A1] font-bold">
                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
              </span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User size={12} />
              <span>Consumidor Final</span>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            title="Vaciar ticket"
            className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/40">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-400 shadow-xs">
              <ShoppingCart size={28} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600">Ticket vacío</p>
          </div>
        ) : (
          items.map((item) => {
            const subtotal = item.precio * item.cantidad;
            return (
              <div 
                key={item.id} 
                className="group p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                      {item.nombre}
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">
                      {formatCurrency(item.precio)} c/u
                    </span>
                  </div>

                  <span className="text-sm font-bold text-[#1985A1] font-mono">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30 cursor-pointer"
                      disabled={item.cantidad <= 1}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-slate-800 font-mono">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30 cursor-pointer"
                      disabled={item.cantidad >= item.stockActual}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment and Checkout Section */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {/* Payment method selector tabs */}
        <div className="mb-3">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
            Método de Pago
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMetodoPago('efectivo')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                metodoPago === 'efectivo'
                  ? 'bg-[#1985A1] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Banknote size={14} />
              <span>Efectivo</span>
            </button>
            <button
              type="button"
              onClick={() => setMetodoPago('tarjeta')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                metodoPago === 'tarjeta'
                  ? 'bg-[#1985A1] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <CreditCard size={14} />
              <span>Tarjeta</span>
            </button>
            <button
              type="button"
              onClick={() => setMetodoPago('qr')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                metodoPago === 'qr'
                  ? 'bg-[#1985A1] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <QrCode size={14} />
              <span>QR / Transf.</span>
            </button>
          </div>
        </div>

        {/* Cash calculator (only if cash selected) */}
        {metodoPago === 'efectivo' && items.length > 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Paga con:</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder={total.toString()}
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  className="w-24 px-2 py-1 text-right text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#1985A1] font-mono shadow-xs"
                />
              </div>
            </div>

            {/* Quick cash pills */}
            <div className="flex gap-1.5 justify-end">
              <button
                type="button"
                onClick={() => handleQuickAmount(total)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono font-semibold cursor-pointer"
              >
                Exacto
              </button>
              {[2000, 5000, 10000, 20000].filter(a => a >= total).slice(0, 2).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono font-semibold cursor-pointer"
                >
                  ${amt}
                </button>
              ))}
            </div>

            {vuelto > 0 && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-xs">
                <span className="text-emerald-700 font-medium">Vuelto a entregar:</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  {formatCurrency(vuelto)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Totals Breakdown */}
        <div className="space-y-1.5 mb-3 pt-1">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono text-slate-700">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Impuestos (IVA incl.)</span>
            <span className="font-mono text-slate-700">$0,00</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
            <span className="text-sm font-bold text-slate-800">Total a Pagar</span>
            <span className="text-2xl font-black tracking-tight font-mono text-[#1985A1]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Big CTA Checkout button */}
        <button
          onClick={handlePagar}
          disabled={items.length === 0 || isProcessing}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
            items.length === 0 || isProcessing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-[#1985A1] hover:bg-[#146b82] text-white shadow-[#1985A1]/20 hover:shadow-[#1985A1]/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-white" />
              Procesando Venta...
            </span>
          ) : (
            <>
              <span>Cobrar {formatCurrency(total)}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
