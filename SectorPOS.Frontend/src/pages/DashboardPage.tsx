import React, { useState, useEffect } from 'react';
import { getDashboardReporte } from '../services/api';
import type { DashboardReporte } from '../types';
import { 
  TrendingUp, 
  Receipt, 
  Calculator, 
  Wallet, 
  AlertTriangle, 
  Package, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [reporte, setReporte] = useState<DashboardReporte | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReporte = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardReporte();
      setReporte(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard reports:', err);
      setError('No se pudieron cargar los datos de reportes. Verifica que la API esté activa.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReporte();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  // Calcular el valor máximo para escalar las barras del gráfico de 7 días
  const maxVentaDia = Math.max(...(reporte?.ventasUltimosDias.map(d => d.total) || [1000]), 1000);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 text-slate-800 overflow-y-auto font-sans p-6 space-y-6">
      
      {/* Header del Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="text-[#1985A1]" size={28} />
            Reportes e Indicadores de Gestión
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Métricas de ventas, análisis de rotación de productos y alertas de inventario en tiempo real (Punto 13).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 shadow-xs">
            <Calendar size={14} className="text-[#1985A1]" />
            <span>Datos actualizados a hoy</span>
          </div>
          <button
            onClick={fetchReporte}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1985A1] hover:bg-[#146b82] text-white text-xs font-semibold shadow-md shadow-[#1985A1]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && !reporte ? (
        <div className="h-96 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="animate-spin text-[#1985A1]" size={48} />
          <p className="text-sm font-semibold text-slate-600">Generando métricas y consolidando datos...</p>
        </div>
      ) : reporte ? (
        <>
          {/* Tarjetas KPI Superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Ventas Hoy */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500/60 transition-all group">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Recaudación de Hoy</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight text-emerald-700">
                {formatCurrency(reporte.totalVentasHoy)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <span className="text-emerald-700 font-bold">{reporte.cantidadVentasHoy} tickets</span>
                <span>procesados en la jornada</span>
              </div>
            </div>

            {/* KPI 2: Tickets Emitidos */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#1985A1]/60 transition-all group">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Tickets de Hoy</span>
                <div className="w-10 h-10 rounded-xl bg-[#1985A1]/10 text-[#1985A1] flex items-center justify-center border border-[#1985A1]/30 group-hover:scale-110 transition-transform">
                  <Receipt size={20} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight text-[#1985A1]">
                {reporte.cantidadVentasHoy} <span className="text-sm font-medium text-slate-500">ventas</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <span className="text-[#1985A1] font-bold">{reporte.cantidadVentasHistorico} en total</span>
                <span>histórico en la base</span>
              </div>
            </div>

            {/* KPI 3: Ticket Promedio */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-cyan-500/60 transition-all group">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-200 group-hover:scale-110 transition-transform">
                  <Calculator size={20} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight text-cyan-800">
                {formatCurrency(reporte.ticketPromedio)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <span>Gasto promedio por transacción</span>
              </div>
            </div>

            {/* KPI 4: Total Histórico */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#1985A1]/60 transition-all group">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Facturación Total</span>
                <div className="w-10 h-10 rounded-xl bg-[#1985A1]/10 text-[#1985A1] flex items-center justify-center border border-[#1985A1]/30 group-hover:scale-110 transition-transform">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight text-sky-800">
                {formatCurrency(reporte.totalVentasHistorico)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <span>Acumulado desde inicio</span>
              </div>
            </div>

          </div>

          {/* Grilla Principal del Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna Izquierda (2/3): Gráfico de Tendencia + Top Productos */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Gráfico de Barras: Ventas Últimos 7 Días */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#1985A1]" />
                      Evolución de Ventas (Últimos 7 Días)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ingresos diarios consolidados</p>
                  </div>
                </div>

                {/* Contenedor de Gráfico de Barras */}
                <div className="h-48 pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 px-2">
                  {reporte.ventasUltimosDias.map((dia, idx) => {
                    const heightPercent = dia.total > 0 ? Math.max((dia.total / maxVentaDia) * 100, 12) : 4;
                    const isToday = idx === reporte.ventasUltimosDias.length - 1;

                    return (
                      <div key={dia.fecha} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        {/* Tooltip con valor sobre la barra */}
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-900 font-bold transition-colors">
                          {dia.total > 0 ? `$${(dia.total / 1000).toFixed(1)}k` : '$0'}
                        </span>

                        {/* Barra */}
                        <div 
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 ${
                            isToday
                              ? 'bg-gradient-to-t from-[#1985A1] to-sky-400 shadow-md shadow-[#1985A1]/20 group-hover:from-[#146b82] group-hover:to-sky-500'
                              : dia.total > 0
                              ? 'bg-gradient-to-t from-slate-400 to-slate-300 group-hover:from-slate-500 group-hover:to-slate-400'
                              : 'bg-slate-200'
                          }`}
                        />

                        {/* Etiqueta del día */}
                        <span className={`text-[11px] font-medium capitalize mt-1 ${isToday ? 'text-[#1985A1] font-bold' : 'text-slate-500'}`}>
                          {dia.diaNombre}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ranking: Top 5 Productos Más Vendidos */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers size={16} className="text-[#1985A1]" />
                      Top 5 Productos con Mayor Rotación
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ranking por volumen de unidades y recaudación</p>
                  </div>
                </div>

                {reporte.topProductos.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No hay suficientes ventas registradas para generar el ranking de productos.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reporte.topProductos.map((prod, index) => {
                      const maxUnits = reporte.topProductos[0].unidadesVendidas || 1;
                      const percent = Math.round((prod.unidadesVendidas / maxUnits) * 100);

                      return (
                        <div 
                          key={prod.productoId}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                index === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                index === 1 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                                index === 2 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                                'bg-slate-200 text-slate-600'
                              }`}>
                                #{index + 1}
                              </span>
                              <span className="font-semibold text-slate-800 truncate">{prod.nombre}</span>
                              <span className="font-mono text-slate-400 text-[10px] hidden sm:inline">({prod.codigoBarras})</span>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-slate-600 font-bold font-mono">
                                {prod.unidadesVendidas} {prod.unidadesVendidas === 1 ? 'ud.' : 'uds.'}
                              </span>
                              <span className="text-[#1985A1] font-bold font-mono">
                                {formatCurrency(prod.totalRecaudado)}
                              </span>
                            </div>
                          </div>

                          {/* Barra de progreso de rotación */}
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div 
                              style={{ width: `${percent}%` }}
                              className="h-full bg-[#1985A1] rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Columna Derecha (1/3): Alertas de Stock Crítico */}
            <div className="space-y-6">
              
              {/* Alertas de Stock */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Alertas de Stock Crítico
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    reporte.productosBajoStock.length > 0 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {reporte.productosBajoStock.length} alertas
                  </span>
                </div>

                {reporte.productosBajoStock.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 flex flex-col items-center space-y-2">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                    <p className="text-xs font-semibold text-slate-800">Inventario Saludable</p>
                    <p className="text-[11px] text-slate-500">Todos los productos activos cuentan con stock por encima de su umbral crítico.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {reporte.productosBajoStock.map((prod) => {
                      const isAgotado = prod.stockActual <= 0;

                      return (
                        <div 
                          key={prod.productoId}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                            isAgotado
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold truncate text-slate-900">{prod.nombre}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: {prod.codigoBarras}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-black font-mono ${
                              isAgotado ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isAgotado ? 'Agotado (0)' : `Stock: ${prod.stockActual}`}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">Mín: {prod.limiteStockCritico}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ficha Resumen de Arquitectura */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs space-y-3">
                <div className="flex items-center gap-2 text-[#1985A1] font-bold">
                  <Package size={16} />
                  <span>Estado de la Terminal</span>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Motor de Base de Datos:</span>
                    <span className="font-mono font-bold text-slate-800">SQLite (EF Core)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Control de Concurrencia:</span>
                    <span className="font-semibold text-emerald-700">Transacciones ACID</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modo de Operación:</span>
                    <span className="font-semibold text-[#1985A1]">Cloud Web / SaaS</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </>
      ) : null}

    </div>
  );
};
