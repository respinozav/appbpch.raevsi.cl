import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { IniciarProduccionView } from './views/IniciarProduccionView';
import { ProduccionView } from './views/ProduccionView';
import { CertificadosView } from './views/CertificadosView';
import { UsuariosView } from './views/UsuariosView';
import { PerfilView } from './views/PerfilView';
import { ConfiguracionView } from './views/ConfiguracionView';
import { FaqManualView } from './views/FaqManualView';
import { CodigosInternosView } from './views/CodigosInternosView';
import { PublicTrazabilidadView } from './views/PublicTrazabilidadView';
import { InactivityModal } from './components/InactivityModal';
import { RefreshCw, Search } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading, showWarning, secondsRemaining, extendSession, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [commandOpen, setCommandOpen] = useState(false);
  const [jumpToBatchCodigo, setJumpToBatchCodigo] = useState<number | undefined>(undefined);

  // Check if current URL is the public traceability QR scan route:
  // e.g. /trazabilidad/UUID or ?trazabilidad=UUID or ?uid=UUID
  const path = window.location.pathname;
  const trazMatch = path.match(/\/trazabilidad\/([0-9a-fA-F-]+)/);
  const urlParams = new URLSearchParams(window.location.search);
  const queryUid = urlParams.get('uid') || urlParams.get('trazabilidad');
  const publicUid = trazMatch ? trazMatch[1] : queryUid ? queryUid : null;

  if (publicUid) {
    return <PublicTrazabilidadView uid={publicUid} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#15803D]" />
        <span className="text-xs font-semibold text-neutral-500 mt-3 font-mono">
          Cargando entorno Bioplast Chile...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const handleNavigateToBatch = (codigo: number) => {
    setJumpToBatchCodigo(codigo);
    setCurrentView('produccion');
  };

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Ejecutivo', subtitle: 'Inteligencia operativa y economía circular' },
    iniciar: { title: 'Iniciar Producción', subtitle: 'Emisión de tickets térmicos' },
    produccion: { title: 'Sábana de Producción', subtitle: 'Trazabilidad y gestión de lotes' },
    'codigos-internos': { title: 'Códigos Internos SAP', subtitle: 'Catálogo de artículos y embalaje estándar' },
    certificados: { title: 'Certificados de Calidad', subtitle: 'Emisión oficial R-CAL-07' },
    usuarios: { title: 'Administración de Usuarios', subtitle: 'Control de accesos y roles' },
    configuracion: { title: 'Configuración del Sistema', subtitle: 'Ajustes de sesión y políticas de seguridad' },
    faq: { title: 'Manual de Operaciones & FAQ', subtitle: 'Documento controlado MAN-SGI-01 · Base de conocimiento' },
    perfil: { title: 'Mi Perfil de Usuario', subtitle: 'Configuración personal y contraseña' },
  };

  const currentInfo = viewTitles[currentView] || { title: 'Bioplast Chile', subtitle: 'Plataforma B2B' };

  return (
    <div className="min-h-screen bg-[#F7FAF7] bg-botanical-dots flex flex-col">
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => {
          setJumpToBatchCodigo(undefined);
          setCurrentView(v);
        }}
        onOpenCommand={() => setCommandOpen(true)}
      />

      <div className="md:pl-64 lg:pl-72 flex flex-col flex-1 min-w-0 transition-all">
        <header className="hidden md:flex sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-[#E5ECE6] px-6 lg:px-8 items-center justify-between no-print">
          <div>
            <h2 className="text-sm font-display font-extrabold text-[#0D3B22] leading-tight">
              {currentInfo.title}
            </h2>
            <p className="text-[11px] text-neutral-400">
              {currentInfo.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-500 bg-[#F7FAF7] hover:bg-[#EEF6F0] hover:text-[#0D3B22] border border-[#E5ECE6] rounded-xl transition"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span>Acceso rápido</span>
              <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#E5ECE6] text-neutral-600">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 pl-3 border-l border-[#E5ECE6]">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              <span>appbpch.raevsi.cl</span>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {currentView === 'dashboard' && (
            <DashboardView onNavigate={(v) => setCurrentView(v)} />
          )}
          {currentView === 'iniciar' && (
            <IniciarProduccionView onNavigateToBatch={handleNavigateToBatch} />
          )}
          {currentView === 'produccion' && (
            <ProduccionView initialCodigoInterno={jumpToBatchCodigo} />
          )}
          {currentView === 'codigos-internos' && <CodigosInternosView />}
          {currentView === 'certificados' && <CertificadosView />}
          {currentView === 'usuarios' && <UsuariosView />}
          {currentView === 'configuracion' && <ConfiguracionView />}
          {currentView === 'faq' && <FaqManualView />}
          {currentView === 'perfil' && <PerfilView />}
        </main>
      </div>

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={(v) => {
          setJumpToBatchCodigo(undefined);
          setCurrentView(v);
        }}
      />

      <InactivityModal
        show={showWarning}
        secondsRemaining={secondsRemaining}
        onExtend={extendSession}
        onLogout={() => logout('Sesión cerrada por el usuario')}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
