import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, Layers, FileCheck, Users, User, LogOut, 
  Search, Leaf, Shield, BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCommand: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenCommand }) => {
  const { user, isAdmin, isJefatura, logout } = useAuth();

  const navItems = [
    { id: 'iniciar', label: 'Iniciar Producción', icon: PlusCircle },
    { id: 'produccion', label: 'Producción & Sábana', icon: Layers },
    { id: 'certificados', label: 'Certificados (Liberados)', icon: FileCheck },
    ...(isAdmin ? [{ id: 'usuarios', label: 'Usuarios & Roles', icon: Users }] : []),
    { id: 'faq', label: 'Manual & FAQ', icon: BookOpen },
    { id: 'perfil', label: 'Mi Perfil', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#E5ECE6] transition no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('produccion')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#15803D] to-[#22C55E] flex items-center justify-center text-white shadow-sm shadow-[#15803D]/25 group-hover:scale-105 transition">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-black text-base tracking-tight text-[#0D3B22] block leading-none">
                  BIOPLAST
                </span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-0.5">
                  Trazabilidad B2B
                </span>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`relative px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
                      isActive
                        ? 'text-[#0D3B22] bg-[#EEF6F0]'
                        : 'text-neutral-600 hover:text-[#0F1F16] hover:bg-neutral-100/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#15803D]' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#15803D] rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Command Palette Trigger & User Profile */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommand}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-500 bg-neutral-100/80 hover:bg-neutral-200/70 border border-[#E5ECE6] rounded-xl transition"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span>Buscar o comandos</span>
              <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-600">
                ⌘K
              </kbd>
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E5ECE6]">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-[#0F1F16] leading-none">
                  {user?.nombre_completo}
                </div>
                <div className="text-[10px] font-mono text-[#15803D] font-bold mt-0.5">
                  {user?.rol?.nombre || 'Colaborador'}
                </div>
              </div>

              <button
                onClick={() => logout()}
                title="Cerrar sesión"
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-[#E5ECE6]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                  isActive ? 'bg-[#EEF6F0] text-[#0D3B22]' : 'text-neutral-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
