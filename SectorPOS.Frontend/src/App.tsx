import { useState, useEffect, useRef } from 'react';
import { POSPage } from './pages/POSPage';
import { InventarioPage } from './pages/InventarioPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import type { UsuarioSesion } from './types';
import { 
  Store, 
  Boxes, 
  BarChart3, 
  ShieldCheck, 
  User, 
  LogOut, 
  Lock,
  ChevronDown
} from 'lucide-react';

function App() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
    try {
      const saved = localStorage.getItem('sectorpos_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<'pos' | 'inventario' | 'dashboard'>('pos');
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = usuario?.rol === 'Administrador';

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setIsNavMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Si el usuario es cajero/vendedor y estuviese en otra pestaña, reorientar al POS
  useEffect(() => {
    if (usuario && !isAdmin && currentTab !== 'pos') {
      setCurrentTab('pos');
    }
  }, [usuario, isAdmin, currentTab]);

  const handleLoginSuccess = (sesion: UsuarioSesion) => {
    setUsuario(sesion);
    localStorage.setItem('sectorpos_session', JSON.stringify(sesion));
    setCurrentTab('pos');
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setIsNavMenuOpen(false);
    localStorage.removeItem('sectorpos_session');
    setUsuario(null);
    setCurrentTab('pos');
  };

  // Opciones del selector de navegación
  const navOptions = [
    {
      id: 'pos' as const,
      label: 'Punto de Venta',
      description: 'Facturación & Caja rápida',
      icon: Store,
      disabled: false
    },
    {
      id: 'inventario' as const,
      label: 'Inventario & ABM',
      description: 'Gestión de productos y stock',
      icon: Boxes,
      disabled: !isAdmin
    },
    {
      id: 'dashboard' as const,
      label: 'Reportes & Métricas',
      description: 'Estadísticas e ingresos',
      icon: BarChart3,
      disabled: !isAdmin
    }
  ];

  const currentOption = navOptions.find(o => o.id === currentTab) || navOptions[0];
  const CurrentIcon = currentOption.icon;

  // Si no hay sesión activa, renderizar la pantalla de Login (Control de Acceso RBAC)
  if (!usuario) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      
      {/* Global Navigation Top Header */}
      <nav className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 select-none z-30 shadow-xs">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1985A1] flex items-center justify-center text-white font-bold shadow-md shadow-[#1985A1]/20">
            <Store size={18} className="text-white stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">SectorPOS</span>
        </div>

        {/* View Navigation Custom Combobox */}
        <div className="relative" ref={navMenuRef}>
          <button
            type="button"
            onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isNavMenuOpen
                ? 'bg-slate-50 border-[#1985A1] text-slate-900 shadow-md ring-2 ring-[#1985A1]/20'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#1985A1]/60 text-slate-700 shadow-xs'
            }`}
          >
            <div className="p-1 rounded-lg bg-[#1985A1]/15 text-[#1985A1]">
              <CurrentIcon size={15} className="text-[#1985A1] stroke-[2.2]" />
            </div>

            <span className="text-xs font-bold tracking-tight">
              {currentOption.label}
            </span>

            <ChevronDown 
              size={14} 
              className={`text-slate-400 transition-transform duration-200 ${isNavMenuOpen ? 'rotate-180 text-[#1985A1]' : ''}`} 
            />
          </button>

          {/* Menú Desplegable Custom del Combobox */}
          {isNavMenuOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
              {navOptions.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = currentTab === option.id;

                if (option.disabled) {
                  return (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-2.5 rounded-xl opacity-50 bg-slate-50 cursor-not-allowed border border-transparent"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-400">
                          <OptionIcon size={16} />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-semibold text-slate-400 block leading-tight">
                            {option.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {option.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Lock size={10} />
                        <span>Admin</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setCurrentTab(option.id);
                      setIsNavMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1985A1]/10 border border-[#1985A1]/30 text-[#1985A1] shadow-xs font-bold'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#1985A1] text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
                        <OptionIcon size={16} />
                      </div>
                      <div className="text-left">
                        <span className={`text-xs font-bold block leading-tight ${isSelected ? 'text-[#1985A1]' : 'text-slate-800'}`}>
                          {option.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {option.description}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#1985A1] shadow-xs shadow-[#1985A1]"></span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Session Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border transition-all cursor-pointer ${
              isUserMenuOpen
                ? 'bg-slate-50 border-[#1985A1] text-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                {isAdmin ? <ShieldCheck size={16} className="text-[#1985A1]" /> : <User size={16} className="text-sky-600" />}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#1985A1] border-2 border-white"></div>
            </div>

            <span className="text-xs font-bold tracking-tight">
              {usuario.nombre}
            </span>

            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-[#1985A1]' : ''}`} />
          </button>

          {/* Menú Desplegable con la Información y Cerrar Sesión */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
              <div className="space-y-1.5 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{usuario.nombre}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isAdmin 
                      ? 'bg-[#1985A1]/10 text-[#1985A1] border-[#1985A1]/30' 
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    {usuario.rol}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate" title={usuario.email}>
                  {usuario.email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut size={15} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>

      </nav>

      {/* Active View Content */}
      <div className="flex-1 min-h-0 overflow-hidden bg-slate-100">
        {currentTab === 'pos' && <POSPage usuario={usuario} />}
        {currentTab === 'inventario' && isAdmin && <InventarioPage />}
        {currentTab === 'dashboard' && isAdmin && <DashboardPage />}
      </div>

    </div>
  );
}

export default App;
