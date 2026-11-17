import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, PlusCircle, Layers, FileCheck, Users, User, LogOut, X, LayoutDashboard, Settings, BookOpen, Barcode, Users2, Scan } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'dashboard', label: 'Dashboard Ejecutivo (Métricas & Ley REP)', icon: LayoutDashboard, category: 'Resumen', view: 'dashboard' },
    { id: 'iniciar', label: 'Iniciar Producción', icon: PlusCircle, category: 'Operaciones', view: 'iniciar' },
    { id: 'produccion', label: 'Ver Sábana de Producción', icon: Layers, category: 'Operaciones', view: 'produccion' },
    { id: 'gestion-estados', label: 'Gestión de Estados (Lector QR / Pistola & Cámara)', icon: Scan, category: 'Operaciones', view: 'gestion-estados' },
    { id: 'codigos-internos', label: 'Códigos Internos SAP & Artículos', icon: Barcode, category: 'Maestros', view: 'codigos-internos' },
    { id: 'operadores', label: 'Operadores de Planta', icon: Users2, category: 'Maestros', view: 'operadores' },
    { id: 'certificados', label: 'Certificados de Calidad (Liberados)', icon: FileCheck, category: 'Calidad', view: 'certificados' },
    ...(isAdmin ? [
      { id: 'usuarios', label: 'Gestión de Usuarios & Roles', icon: Users, category: 'Administración', view: 'usuarios' },
      { id: 'configuracion', label: 'Configuración del Sistema (Ajustes de Sesión)', icon: Settings, category: 'Administración', view: 'configuracion' }
    ] : []),
    { id: 'faq', label: 'Manual de Operaciones & FAQ (MAN-SGI-01)', icon: BookOpen, category: 'Ayuda', view: 'faq' },
    { id: 'perfil', label: 'Mi Perfil & Contraseña', icon: User, category: 'Cuenta', view: 'perfil' },
    { id: 'logout', label: 'Cerrar Sesión', icon: LogOut, category: 'Cuenta', action: logout },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5ECE6] overflow-hidden z-10"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-[#E5ECE6] gap-3">
            <Search className="w-5 h-5 text-neutral-400" />
            <input
              autoFocus
              type="text"
              placeholder="Escribe una acción, folio o comando... (Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm outline-none text-[#0F1F16] placeholder-neutral-400 font-sans"
            />
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-neutral-400">
                No se encontraron comandos para "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.view) {
                          onNavigate(item.view);
                        }
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#EEF6F0] text-left transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-[#15803D] group-hover:text-white transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#0F1F16]">{item.label}</div>
                          <div className="text-xs text-neutral-400">{item.category}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">↵ Enter</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#F7FAF7] px-4 py-2 border-t border-[#E5ECE6] flex justify-between items-center text-[11px] text-neutral-500">
            <span>Usuario activo: <strong className="text-[#0D3B22]">{user?.nombre_completo}</strong></span>
            <span className="font-mono">ESC para cerrar</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
