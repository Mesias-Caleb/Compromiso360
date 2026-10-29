import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  LayoutGrid,
  PieChart,
  Cloud,
  Award,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { InstitutionalLogo } from '../../components/shared/InstitutionalLogo';
import { AnimatedCounter } from '../../components/shared/AnimatedCounter';
import { ParticipantCard } from '../../components/shared/ParticipantCard';
import { WordCloud } from '../../components/shared/WordCloud';
import { ConnectionStatus } from '../../components/shared/ConnectionStatus';
import { usePolling } from '../../hooks/usePolling';
import { commitmentRepository } from '../../infrastructure/demo/demo-service';
import { Commitment } from '../../domain/models/commitment';
import { EventStats } from '../../domain/models/stats';
import { OFFICIAL_EVENT_CONFIG } from '../../config/event';
import { cn } from '../../lib/utils';

type CeremonialView = 'mural' | 'distribution' | 'wordcloud' | 'closing';

const MILESTONES = [100, 500, 1000];

export const MuralPage: React.FC = () => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [activeView, setActiveView] = useState<CeremonialView>('mural');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  // Rastrear hitos ya celebrados para no repetir animaciones al recargar
  const celebratedMilestonesRef = useRef<Set<number>>(new Set());
  // Rastrear IDs previos para detectar nuevos registros y animar su entrada
  const previousCommitmentIdsRef = useRef<Set<string>>(new Set());

  // Estado del cierre final: instantánea congelada y control de polling
  const [isClosingFrozen, setIsClosingFrozen] = useState(false);
  const [frozenStats, setFrozenStats] = useState<EventStats | null>(null);

  // ── Carga de datos ──
  const loadData = useCallback(async () => {
    // Si estamos en cierre congelado, no actualizar datos
    if (isClosingFrozen) return;

    setIsRefreshing(true);
    try {
      const [newStats, list] = await Promise.all([
        commitmentRepository.getStats(),
        commitmentRepository.getRecentConsenting(8),
      ]);
      setStats(newStats);
      setCommitments(list);
      setConnectionError(null);
      setIsConnected(true);
      setReconnecting(false);
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : 'Error desconocido');
      setIsConnected(false);
      setReconnecting(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [isClosingFrozen]);

  // ── Polling automático cada 3 segundos ──
  const { refetch } = usePolling({
    intervalMs: 3000,
    enabled: true && !isClosingFrozen,
    onFetch: loadData,
  });

  // Carga inicial y reloj (usePolling ya ejecuta fetchWithGuard al montar)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) +
          ' | ' +
          now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);

    return () => clearInterval(timer);
  }, [loadData]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  // ── Datos derivados ──
  const displayStats = isClosingFrozen && frozenStats ? frozenStats : stats;
  const totalCount = displayStats?.total ?? commitments.length;

  const limCount = displayStats?.byCampus.LIM.count ?? 0;
  const julCount = displayStats?.byCampus.JUL.count ?? 0;
  const tppCount = displayStats?.byCampus.TPP.count ?? 0;

  const limPct = totalCount > 0 ? Math.round((limCount / totalCount) * 100) : 0;
  const julPct = totalCount > 0 ? Math.round((julCount / totalCount) * 100) : 0;
  const tppPct = totalCount > 0 ? Math.max(0, 100 - limPct - julPct) : 0;

  // Últimos 8 participantes autorizados para publicación, ordenados por fecha desc
  const topEightCommitments = useMemo(() => {
    return [...commitments]
      .sort((a, b) => {
        const dateDiff = new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.id.localeCompare(a.id);
      })
      .slice(0, 8);
  }, [commitments]);

  // Detectar nuevos registros para animar entrada
  useEffect(() => {
    const currentIds = new Set(commitments.map((c) => c.id));
    const prevIds = previousCommitmentIdsRef.current;

    const newIds = [...currentIds].filter((id) => !prevIds.has(id));

    if (newIds.length > 0 && prevIds.size > 0) {
      // Hay registros nuevos; se animarán vía CSS por el cambio de array
    }

    previousCommitmentIdsRef.current = currentIds;
  }, [commitments]);

  // ── Animaciones de hitos ──
  const [celebration, setCelebration] = useState<{ milestone: number; active: boolean } | null>(
    null
  );

  useEffect(() => {
    if (isClosingFrozen) return;

    const nextMilestone = MILESTONES.find((m) => totalCount >= m && !celebratedMilestonesRef.current.has(m));

    if (nextMilestone) {
      celebratedMilestonesRef.current.add(nextMilestone);
      setCelebration({ milestone: nextMilestone, active: true });
      setTimeout(() => setCelebration(null), 4000);
    }
  }, [totalCount, isClosingFrozen]);

  // ── Cierre final: obtener snapshot y congelar ──
  const handleEnterClosing = async () => {
    try {
      const newStats = await commitmentRepository.getStats();
      setFrozenStats(newStats);
      setIsClosingFrozen(true);
    } catch {
      setIsClosingFrozen(true);
    }
  };

  // ── Salir de cierre final: reanudar polling y sincronizar ──
  const handleLeaveClosing = () => {
    setIsClosingFrozen(false);
    setFrozenStats(null);
    refetch();
  };

  return (
    <div
      className={cn(
        'w-full min-h-screen bg-brand-deep text-white flex flex-col justify-between overflow-x-hidden relative select-none',
        celebration && 'animate-pulse-milestone'
      )}
    >
      {/* Animación de hito alcanzado */}
      {celebration && !isClosingFrozen && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-brand-gold/20 border-4 border-brand-gold flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-brand-gold" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-brand-gold uppercase tracking-tight drop-shadow">
            ¡{celebration.milestone} compromisos!
          </h2>
        </div>
      )}

      {/* Background Subtle University Neoclassical Silhouette */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 1200 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-7xl h-auto"
        >
          <line x1="50" y1="360" x2="1150" y2="360" stroke="#FFFFFF" strokeWidth="2" />
          <polygon points="450,200 600,100 750,200" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="470" y="200" width="20" height="160" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="520" y="200" width="20" height="160" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="570" y="200" width="20" height="160" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="620" y="200" width="20" height="160" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="670" y="200" width="20" height="160" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="720" y="200" width="20" height="160" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="150" y="230" width="300" height="130" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect x="750" y="230" width="300" height="130" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Estado de conexión (oculto en cierre congelado) */}
      {!isClosingFrozen && (
        <ConnectionStatus
          isConnected={isConnected}
          reconnecting={reconnecting}
          lastError={connectionError}
        />
      )}

      {/* TOP CEREMONIAL HEADER */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-brand-primary/40 gap-4">

        <div className="flex items-center gap-3 shrink-0 z-10">
          <InstitutionalLogo variant="light" size="lg" />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-0.5 w-full max-w-[60%] pointer-events-none">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
            YO ME COMPROMETO CON EL PEI
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-brand-gold tracking-widest uppercase">
            {OFFICIAL_EVENT_CONFIG.motto}
          </p>
        </div>

        <div className="flex items-center gap-4 text-right shrink-0 z-10">
          <div className="hidden lg:flex flex-col text-xs text-slate-300">
            <span className="font-semibold text-white">
              Plan Estratégico {OFFICIAL_EVENT_CONFIG.peiPeriod}
            </span>
            <span className="text-[11px] text-brand-gold/90 font-mono flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 inline" />
              {currentTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-brand-primary/40 rounded-lg p-1 border border-white/10">
            {!isClosingFrozen && (
              <>
                <button
                  onClick={refetch}
                  title="Refrescar datos"
                  className={cn(
                    'p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors',
                    isRefreshing && 'opacity-75',
                  )}
                >
                  <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin text-brand-gold')} />
                </button>
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa para auditorio'}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </>
            )}
            {isClosingFrozen && (
              <button
                onClick={handleLeaveClosing}
                title="Volver al mural en vivo"
                className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-8 py-4 max-w-7xl mx-auto w-full">

        {/* VIEW 1: MURAL EN VIVO */}
        {activeView === 'mural' && !isClosingFrozen && (
          <div className="space-y-6 sm:space-y-8 my-auto">
            {/* HERO COUNTER SECTION */}
            <div className="text-center space-y-1">
              <div className="inline-block">
                <AnimatedCounter
                  value={totalCount}
                  className="text-6xl sm:text-7xl md:text-8xl font-black text-brand-gold tracking-tight drop-shadow-sm font-sans"
                />
              </div>
              <p className="text-sm sm:text-base md:text-lg font-medium text-slate-200 uppercase tracking-widest">
                compromisos registrados
              </p>
            </div>

            {/* THREE CAMPUS COUNTER BARS */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto w-full">
              <div className="text-center space-y-1">
                <span className="text-xs sm:text-sm font-bold text-slate-300 block">
                  LIMA (LIM)
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white block">
                  <AnimatedCounter value={limCount} />
                </span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-campus-lim rounded-full w-full" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <span className="text-xs sm:text-sm font-bold text-slate-300 block">
                  JULIACA (JUL)
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white block">
                  <AnimatedCounter value={julCount} />
                </span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-campus-jul rounded-full w-full" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <span className="text-xs sm:text-sm font-bold text-slate-300 block">
                  TARAPOTO (TPP)
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white block">
                  <AnimatedCounter value={tppCount} />
                </span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-campus-tpp rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* ÚLTIMOS 8 PARTICIPANTES COMPACTOS (4×2 en desktop) */}
            <div className="pt-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                Últimas adhesiones
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-7xl mx-auto">
                {topEightCommitments.map((commitment) => (
                  <ParticipantCard
                    key={commitment.id}
                    commitment={commitment}
                    variant="mural"
                    className="animate-fade-in-up border-l-2 border-brand-gold p-2.5"
                  />
                ))}
                {topEightCommitments.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                    Sin registros de participantes aún.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: PARTICIPACIÓN POR CAMPUS */}
        {activeView === 'distribution' && !isClosingFrozen && (
          <div className="flex flex-col items-center justify-center my-auto space-y-8 text-center py-6">
            <div className="space-y-1">
              <div className="text-5xl sm:text-6xl font-black text-white font-sans">
                <AnimatedCounter value={totalCount} />
              </div>
              <p className="text-sm sm:text-base font-semibold text-brand-gold uppercase tracking-wider">
                compromisos registrados
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 max-w-3xl w-full mx-auto">
              <div className="bg-brand-primary/30 rounded-2xl p-6 border border-white/10 flex flex-col items-center space-y-3">
                <div className="w-28 h-28 rounded-full border-4 border-campus-lim flex items-center justify-center bg-brand-deep/80 shadow-lg">
                  <span className="text-3xl font-black text-white">{limPct}%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-base font-bold text-white block">Lima</span>
                  <span className="text-sm font-semibold text-campus-lim block">
                    <AnimatedCounter value={limCount} /> firmas
                  </span>
                </div>
              </div>
              <div className="bg-brand-primary/30 rounded-2xl p-6 border border-white/10 flex flex-col items-center space-y-3">
                <div className="w-28 h-28 rounded-full border-4 border-campus-jul flex items-center justify-center bg-brand-deep/80 shadow-lg">
                  <span className="text-3xl font-black text-white">{julPct}%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-base font-bold text-white block">Juliaca</span>
                  <span className="text-sm font-semibold text-campus-jul block">
                    <AnimatedCounter value={julCount} /> firmas
                  </span>
                </div>
              </div>
              <div className="bg-brand-primary/30 rounded-2xl p-6 border border-white/10 flex flex-col items-center space-y-3">
                <div className="w-28 h-28 rounded-full border-4 border-campus-tpp flex items-center justify-center bg-brand-deep/80 shadow-lg">
                  <span className="text-3xl font-black text-white">{tppPct}%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-base font-bold text-white block">Tarapoto</span>
                  <span className="text-sm font-semibold text-campus-tpp block">
                    <AnimatedCounter value={tppCount} /> firmas
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: NUBE DINÁMICA DE ÁREAS */}
        {activeView === 'wordcloud' && !isClosingFrozen && (
          <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center py-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-brand-gold font-bold">
                Participación por Dependencias
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Nube de Áreas Institucionales
              </h2>
            </div>

            <div className="w-full max-w-5xl p-8 rounded-3xl bg-brand-primary/20 border border-white/10">
              <WordCloud areas={stats?.byArea ?? []} />
            </div>

            {stats?.byArea.length === 0 && (
              <p className="text-slate-400 text-sm italic">
                No hay registros de áreas aún.
              </p>
            )}
          </div>
        )}

        {/* VIEW 5: CIERRE FINAL CEREMONIAL */}
        {activeView === 'closing' && (
          <div
            className={cn(
              'flex flex-col items-center justify-center my-auto space-y-6 text-center py-8',
              isClosingFrozen ? 'animate-fade-in-up' : ''
            )}
          >
            {/* Botón para obtener snapshot y congelar (solo la primera vez) */}
            {!isClosingFrozen && (
              <button
                onClick={handleEnterClosing}
                className="px-6 py-3 rounded-xl bg-brand-gold text-brand-deep font-black uppercase tracking-wider text-sm hover:bg-brand-primary transition-colors shadow-lg"
              >
                Congelar instantánea del cierre
              </button>
            )}

            <div className="mx-auto">
              <InstitutionalLogo variant="light" size="lg" />
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-black text-white">
                ¡Gracias!
              </h2>
              <div className="text-5xl sm:text-7xl font-black text-brand-gold font-sans pt-2">
                <AnimatedCounter value={totalCount} />
              </div>
              <p className="text-base sm:text-lg font-semibold text-slate-300 uppercase tracking-widest">
                compromisos registrados
              </p>
            </div>

            {/* Totales por campus */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mt-4">
              <div className="rounded-2xl bg-brand-primary/10 border border-brand-primary/30 p-3 text-center">
                <span className="block text-xs font-bold text-brand-gold uppercase tracking-wider">
                  Lima
                </span>
                <span className="block text-2xl font-black text-white">{limCount}</span>
              </div>
              <div className="rounded-2xl bg-brand-primary/10 border border-brand-primary/30 p-3 text-center">
                <span className="block text-xs font-bold text-brand-gold uppercase tracking-wider">
                  Juliaca
                </span>
                <span className="block text-2xl font-black text-white">{julCount}</span>
              </div>
              <div className="rounded-2xl bg-brand-primary/10 border border-brand-primary/30 p-3 text-center">
                <span className="block text-xs font-bold text-brand-gold uppercase tracking-wider">
                  Tarapoto
                </span>
                <span className="block text-2xl font-black text-white">{tppCount}</span>
              </div>
            </div>

            <p className="text-lg sm:text-xl font-medium text-slate-200 max-w-xl mt-2">
              Nuestro compromiso, nuestro futuro.
            </p>
            <div className="pt-4 text-xs text-brand-gold font-semibold uppercase tracking-widest">
              {OFFICIAL_EVENT_CONFIG.motto}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM VIEW SWITCHER (sin Mosaico PEI) */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-brand-primary/40 flex flex-wrap items-center gap-3 bg-brand-deep/95">
        <div className="flex items-center gap-1.5 overflow-x-auto justify-center w-full">
          <button
            onClick={() => setActiveView('mural')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5',
              activeView === 'mural'
                ? 'bg-brand-gold text-brand-deep shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10',
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Mural Principal</span>
          </button>

          <button
            onClick={() => setActiveView('distribution')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5',
              activeView === 'distribution'
                ? 'bg-brand-gold text-brand-deep shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10',
            )}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Participación Campus</span>
          </button>

          <button
            onClick={() => setActiveView('wordcloud')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5',
              activeView === 'wordcloud'
                ? 'bg-brand-gold text-brand-deep shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10',
            )}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Nube de Áreas</span>
          </button>

          <button
            onClick={isClosingFrozen ? handleLeaveClosing : () => setActiveView('closing')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5',
              activeView === 'closing' || isClosingFrozen
                ? 'bg-brand-gold text-brand-deep shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10',
            )}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isClosingFrozen ? 'Volver' : 'Cierre Final'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
