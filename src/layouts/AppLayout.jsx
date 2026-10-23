import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  LayoutDashboard,
  Tag,
  ArrowLeftRight,
  ShoppingCart,
  BarChart3,
  Users,
  LogOut,
  Building2,
  Menu,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, organization, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Productos', path: '/products', icon: Package },
    { name: 'Categorías', path: '/categories', icon: Tag },
    { name: 'Inventario', path: '/inventory', icon: ArrowLeftRight },
    { name: 'Punto de Venta', path: '/sales', icon: ShoppingCart },
    { name: 'Reportes', path: '/reports', icon: BarChart3 },
    ...(role === 'OWNER' ? [{ name: 'Usuarios', path: '/settings/users', icon: Users }] : []),
  ];

  const location = useLocation();
  const getSectionTitle = () => {
    if (location.pathname.startsWith('/products')) return 'Catálogo de Productos';
    if (location.pathname.startsWith('/categories')) return 'Categorías';
    if (location.pathname.startsWith('/inventory')) return 'Inventario y Stock';
    if (location.pathname.startsWith('/sales')) return 'Punto de Venta';
    if (location.pathname.startsWith('/reports')) return 'Reportes y Analíticas';
    if (location.pathname.startsWith('/settings')) return 'Usuarios y Permisos';
    return 'Panel de Control';
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col md:flex-row selection:bg-emerald-500 selection:text-black">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0C0F16] border-b border-[#1B212D]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#141A23] border border-[#252E3E] flex items-center justify-center">
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            Stock<span className="text-emerald-400">Flow</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#141A23] border border-[#252E3E]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-[#0A0D14] border-r border-[#161B26] flex flex-col justify-between transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#161B26]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-emerald-400/5 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Package className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">Stock<span className="text-emerald-400">Flow</span></span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>

            {/* Active Organization Badge */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F131C] border border-[#1A212E]">
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-200 truncate">
                  {organization?.name || 'Mi Negocio'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                {organization?.currency || 'GTQ'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#121622] border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Session Footer */}
          <div className="p-3 border-t border-[#161B26]">
            <div className="p-2.5 rounded-xl bg-[#0F131C] border border-[#1A212E] flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate leading-tight">{user?.name}</p>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {role === 'OWNER' ? 'PROPIETARIO' : 'CAJERO'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-14 border-b border-[#161B26] bg-[#0A0D14]/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">{organization?.name || 'StockFlow'}</span>
            <span>/</span>
            <span className="text-emerald-400 font-mono">{getSectionTitle()}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Tenant DB</span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
