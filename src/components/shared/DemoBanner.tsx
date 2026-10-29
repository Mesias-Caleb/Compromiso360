import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Database, Sparkles, Trash2, Info, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { seedDemoData, clearDemoData } from '../../infrastructure/demo/demo-service';

export const DemoBanner: React.FC = () => {
  // Ocultar completamente en modo remoto/producción (D1).
  const isRemoteMode = (import.meta.env.VITE_REPOSITORY_MODE || 'local') === 'remote';
  if (isRemoteMode) {
    return null;
  }

  const location = useLocation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(location.pathname === '/mural');

  const handleSeed = async () => {
    setLoading(true);
    try {
      const count = await seedDemoData();
      setFeedback(`Se cargaron ${count} registros simulados.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback('Error al sembrar datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      await clearDemoData();
      setFeedback('Se limpiaron todos los registros locales.');
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback('Error al limpiar datos.');
    } finally {
      setLoading(false);
    }
  };

  if (collapsed) {
    return (
      <div className="fixed bottom-3 right-3 z-50">
        <button
          onClick={() => setCollapsed(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-deep text-white text-xs font-semibold shadow-lg border border-brand-gold/40 hover:bg-brand-primary transition-all opacity-80 hover:opacity-100"
          title="Abrir controles de demostración local"
        >
          <Info className="w-3.5 h-3.5 text-brand-gold" />
          <span>Modo Demo</span>
          <ChevronUp className="w-3 h-3 text-slate-300" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Aviso de entorno de demostración local"
      className="bg-brand-deep border-b border-brand-primary/40 px-4 py-1.5 text-xs text-slate-200 select-none relative z-50"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-brand-gold bg-brand-primary/40 px-2 py-0.5 rounded border border-brand-gold/30">
            <Info className="w-3 h-3" />
            MODO DEMOSTRACIÓN LOCAL
          </span>
          <span className="hidden md:inline text-slate-300 text-[11px]">
            Persistencia en LocalStorage. Dispositivos remotos no sincronizados.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <span className="text-brand-gold font-semibold inline-flex items-center gap-1 animate-pulse text-[11px]">
              <AlertCircle className="w-3 h-3" />
              {feedback}
            </span>
          )}

          <button
            onClick={handleSeed}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-primary hover:bg-brand-interactive text-white font-medium text-[11px] transition-colors disabled:opacity-50"
            title="Cargar registros de prueba para el mural y estadísticas"
          >
            <Sparkles className="w-3 h-3 text-brand-gold" />
            <span>Cargar datos demo</span>
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-200 text-[11px] transition-colors disabled:opacity-50"
            title="Borrar registros locales"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Limpiar</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 text-[11px] pl-2 border-l border-brand-primary/60">
            <Database className="w-3 h-3 text-brand-gold" />
            LocalStorage
          </span>

          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-brand-primary/60 rounded text-slate-400 hover:text-white ml-1"
            title="Minimizar barra"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
