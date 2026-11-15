import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, Layers, FileCheck, Users, User, LogOut, 
  Search, Leaf, Menu, X, Shield, ChevronRight, Sparkles, Factory,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCommand: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onOpenCommand }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      desc: 'Métricas & Ley REP', 
      icon: LayoutDashboard 
    },
    { 
      id: 'iniciar', 
      label: 'Iniciar Producción', 
      desc: 'Emisión de tickets Zebra', 
      icon: PlusCircle 
    },
    { 
      id: 'produccion', 
      label: 'Producción & Sábana', 
      desc: 'Trazabilidad y lotes', 
      icon: Layers 
    },
    { 
      id: 'certificados', 
      label: 'Certificados', 
      desc: 'Documento R-CAL-07 PDF', 
      icon: FileCheck 
    },
    ...(isAdmin ? [{ 
      id: 'usuarios', 
      label: 'Usuarios & Permisos', 
      desc: 'Usuarios y permisos', 
      icon: Users 
    }] : []),
    { 
      id: 'perfil', 
      label: 'Mi Perfil', 
      desc: 'Nombre y credenciales', 
      icon: User 
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const roleName = user?.rol?.nombre || 'Colaborador';
  const roleBadgeColor =
    roleName === 'Administrador'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : roleName === 'Jefatura'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  // Navigation Links List Content (Shared between Desktop Sidebar and Mobile Drawer)
  const navContent = (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E5ECE6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#15803D] to-[#22C55E] flex items-center justify-center text-white shadow-md shadow-[#15803D]/25">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight text-[#0D3B22] block leading-none">
                BIOPLAST
              </span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-0.5">
                Trazabilidad B2B
              </span>
            </div>
          </div>

          {/* Plant status pill */}
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF6F0] border border-[#15803D]/20 text-[11px] font-medium text-[#0D3B22]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
            <span>Planta Quilicura · En Línea</span>
          </div>
        </div>

        {/* Command Palette Button */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => {
              onOpenCommand();
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-xl border border-[#E5ECE6] bg-[#F7FAF7] text-neutral-600 hover:bg-[#EEF6F0] hover:text-[#0D3B22] transition group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-neutral-400 group-hover:text-[#15803D] transition" />
              <span>Buscar o comando</span>
            </div>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#E5ECE6] bg-white text-neutral-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Módulos del Sistema
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition group ${
                  isActive
                    ? 'bg-[#EEF6F0] text-[#0D3B22] font-bold shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100/70 hover:text-[#0F1F16] font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                      isActive
                        ? 'bg-[#0D3B22] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 group-hover:bg-[#15803D]/10 group-hover:text-[#15803D]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-neutral-400 font-normal">{item.desc}</div>
                  </div>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-4 bg-[#15803D] rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: User Profile Info & Logout */}
      <div className="p-3 border-t border-[#E5ECE6]">
        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-white border border-[#E5ECE6] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0D3B22] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.nombre_completo?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#0F1F16] truncate">
                {user?.nombre_completo}
              </div>
              <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${roleBadgeColor}`}>
                {roleName}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP FIXED SIDEBAR (Notebooks and PC screens) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col md:fixed md:inset-y-0 z-30 bg-white border-r border-[#E5ECE6] shadow-xs">
        {navContent}
      </aside>

      {/* 2. MOBILE TOP BAR WITH HAMBURGER BUTTON (Mobile / Tablet) */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5ECE6] px-4 py-3 flex items-center justify-between no-print">
        {/* Hamburger Trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6 text-[#0D3B22]" />
        </button>

        {/* Mobile Brand Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#15803D] to-[#22C55E] flex items-center justify-center text-white shadow-xs">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-display font-extrabold text-base text-[#0D3B22]">
            BIOPLAST
          </span>
        </div>

        {/* User shortcut */}
        <button
          onClick={() => onNavigate('perfil')}
          className="w-8 h-8 rounded-full bg-[#EEF6F0] border border-[#15803D]/30 text-[#0D3B22] font-bold text-xs flex items-center justify-center"
        >
          {user?.nombre_completo?.charAt(0) || 'U'}
        </button>
      </div>

      {/* 3. MOBILE SLIDE-OUT DRAWER (Smooth Sheet from Left) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />

            {/* Slide-in Sheet */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Close Button top-right inside drawer */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition z-20"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>

              {navContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
