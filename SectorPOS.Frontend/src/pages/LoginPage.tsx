import React, { useState } from 'react';
import { login } from '../services/api';
import type { UsuarioSesion } from '../types';
import { 
  Store, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (usuario: UsuarioSesion) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('caja@sectorpos.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu email y contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const sesion = await login({ email, password });
      onLoginSuccess(sesion);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Credenciales inválidas. Verifica los datos ingresados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-100 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1985A1]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1985A1] flex items-center justify-center text-white shadow-lg shadow-[#1985A1]/25 mx-auto mb-3">
            <Store size={28} className="text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">SectorPOS</h1>
          <p className="text-xs text-slate-500 font-medium">
            Iniciar sesión
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                required
                placeholder="caja@sectorpos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1985A1] focus:bg-white focus:ring-2 focus:ring-[#1985A1]/20 font-medium transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1985A1] focus:bg-white focus:ring-2 focus:ring-[#1985A1]/20 font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#1985A1] hover:bg-[#146b82] text-white text-xs font-bold shadow-lg shadow-[#1985A1]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-white font-bold">
                <Loader2 size={15} className="animate-spin text-white" />
                Verificando credenciales...
              </span>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight size={15} className="stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Cuentas de Acceso Rápido / Roles Demo */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">
              Perfiles Demo:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Botón Cajero */}
            <button
              type="button"
              onClick={() => handleQuickFill('caja@sectorpos.com', 'admin123')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                email === 'caja@sectorpos.com'
                  ? 'bg-[#1985A1]/10 border-[#1985A1] text-slate-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <UserCheck size={14} className="text-[#1985A1]" />
                <span>Cajero</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Punto de venta.</p>
            </button>

            {/* Botón Administrador */}
            <button
              type="button"
              onClick={() => handleQuickFill('admin@sectorpos.com', 'admin123')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                email === 'admin@sectorpos.com'
                  ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <ShieldCheck size={14} className="text-sky-600" />
                <span>Administrador</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Acceso total (ABM + Reportes)</p>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
