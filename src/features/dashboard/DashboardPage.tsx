import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  BarChart3,
  Users,
  Building2,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { CampusBadge } from '../../components/shared/CampusBadge';
import { InstitutionalLogo } from '../../components/shared/InstitutionalLogo';
import { ConnectionStatus } from '../../components/shared/ConnectionStatus';
import { usePolling } from '../../hooks/usePolling';
import { commitmentRepository } from '../../infrastructure/demo/demo-service';
import { Commitment, CommitmentFilters } from '../../domain/models/commitment';
import { EventStats } from '../../domain/models/stats';
import { CAMPUS_LIST } from '../../config/campuses';
import { OFFICIAL_EVENT_CONFIG } from '../../config/event';
import { CampusId } from '../../domain/models/campus';
import { cn } from '../../lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatDatePeru(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-PE');
  } catch {
    return iso;
  }
}

function formatTimePeru(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [allCommitments, setAllCommitments] = useState<Commitment[]>([]);
  const [activeTab, setActiveTab] = useState<'resumen' | 'registros' | 'campus' | 'areas' | 'exportar'>('resumen');
  const [filters, setFilters] = useState<CommitmentFilters & { areaIdFilter?: string }>({
    campus: undefined,
    areaId: undefined,
    search: '',
    areaIdFilter: undefined,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy] = useState<'fecha' | 'nombre' | 'campus'>('fecha');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [newStats, list] = await Promise.all([
        commitmentRepository.getStats(),
        commitmentRepository.getAll(),
      ]);
      setStats(newStats);
      setAllCommitments(list);
      setConnectionError(null);
      setIsConnected(true);
      setReconnecting(false);
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : 'Error desconocido');
      setIsConnected(false);
      setReconnecting(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Polling automático cada 5 segundos ──
  const { refetch } = usePolling({
    intervalMs: 5000,
    enabled: true,
    onFetch: loadData,
  });

  useEffect(() => {
    const unsub = commitmentRepository.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, [loadData]);

  const filteredData = useMemo(() => {
    let result = [...allCommitments];
    const areaFilter = filters.areaIdFilter || filters.areaId;
    if (filters.campus) {
      result = result.filter((c) => c.campus === filters.campus);
    }
    if (areaFilter) {
      result = result.filter((c) => c.areaId === areaFilter);
    }
    if (filters.search && filters.search.trim()) {
      const query = normalizeText(filters.search);
      result = result.filter((c) => {
        const fullName = normalizeText(`${c.nombres} ${c.apellidos}`);
        return fullName.includes(query);
      });
    }
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'fecha') {
        const diff = new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime();
        return sortOrder === 'desc' ? -diff : diff;
      }
      if (sortBy === 'nombre') {
        const nameA = normalizeText(`${a.nombres} ${a.apellidos}`);
        const nameB = normalizeText(`${b.nombres} ${b.apellidos}`);
        const diff = nameA.localeCompare(nameB);
        return sortOrder === 'asc' ? diff : -diff;
      }
      if (sortBy === 'campus') {
        const diff = a.campus.localeCompare(b.campus);
        return sortOrder === 'asc' ? diff : -diff;
      }
      return 0;
    });
    return result;
  }, [allCommitments, filters.campus, filters.areaIdFilter, filters.areaId, filters.search, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.campus, filters.areaIdFilter, filters.areaId, filters.search, pageSize]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Export filtered data
      const headers = ['ID Compromiso', 'Nombres', 'Apellidos', 'Nombre completo', 'Campus', 'Área', 'Fecha', 'Hora'];
      const escapeCSV = (val: unknown): string => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      const rows = filteredData.map((c) => [
        c.id,
        c.nombres,
        c.apellidos,
        `${c.nombres} ${c.apellidos}`,
        c.campus,
        c.areaNombre,
        formatDatePeru(c.fechaISO),
        formatTimePeru(c.fechaISO),
      ].map(escapeCSV).join(','));
      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `PEI_Compromisos_${new Date().toISOString().split('T')[0]}_${filteredData.length}_registros.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('¿Deseas vaciar todos los registros del almacenamiento local?')) {
      await commitmentRepository.clearAll();
      loadData();
    }
  };

  // Timeline registration chart data - real data
  const timelineData = useMemo(() => {
    if (allCommitments.length === 0) return [];
    // Group by hour
    const groups: Record<string, number> = {};
    [...allCommitments]
      .sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime())
      .forEach((c) => {
        const hour = new Date(c.fechaISO).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }).substring(0, 5);
        groups[hour] = (groups[hour] || 0) + 1;
      });
    // Cumulative
    let acc = 0;
    return Object.entries(groups).map(([time, count]) => {
      acc += count;
      return { time, registros: acc, nuevos: count };
    });
  }, [allCommitments]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-brand-light">
      {/* SIDEBAR NAVIGATION (Exact match to Mockup C) */}
      <aside className="w-full lg:w-60 bg-white border-r border-brand-border p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Sidebar Brand Header */}
          <div className="px-2 py-1">
            <InstitutionalLogo variant="dark" size="sm" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('resumen')}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left',
                activeTab === 'resumen'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-muted hover:text-brand-text hover:bg-slate-100',
              )}
            >
              <BarChart3 className="w-4 h-4 text-brand-primary" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => setActiveTab('registros')}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left',
                activeTab === 'registros'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-muted hover:text-brand-text hover:bg-slate-100',
              )}
            >
              <Users className="w-4 h-4" />
              <span>Registros</span>
            </button>

            <button
              onClick={() => setActiveTab('campus')}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left',
                activeTab === 'campus'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-muted hover:text-brand-text hover:bg-slate-100',
              )}
            >
              <Building2 className="w-4 h-4" />
              <span>Por campus</span>
            </button>

            <button
              onClick={() => setActiveTab('areas')}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left',
                activeTab === 'areas'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-muted hover:text-brand-text hover:bg-slate-100',
              )}
            >
              <Layers className="w-4 h-4" />
              <span>Por área</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('exportar');
                handleExportCSV();
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left',
                activeTab === 'exportar'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-muted hover:text-brand-text hover:bg-slate-100',
              )}
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-brand-border space-y-2">
          <button
            onClick={handleClearAll}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar registros</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN DASHBOARD CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-deep">
              Resumen en tiempo real
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Monitoreo y consolidación de adhesiones PEI {OFFICIAL_EVENT_CONFIG.peiPeriod}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="gap-1.5 shadow-sm text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exportando...' : 'Exportar CSV'}</span>
            </Button>

            <button
              onClick={refetch}
              title="Refrescar datos"
              className={cn(
                'p-2 rounded-lg bg-white border border-brand-border text-slate-500 hover:text-brand-text shadow-sm',
                loading && 'opacity-75',
              )}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin text-brand-primary')} />
            </button>
          </div>

          <ConnectionStatus
            isConnected={isConnected}
            reconnecting={reconnecting}
            lastError={connectionError}
          />
        </div>

        {/* 4 TOP KPI CARDS (Mockup C) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <Card className="border-brand-border bg-white shadow-card">
            <CardHeader className="p-4 pb-1">
              <span className="text-xs font-semibold text-brand-muted">
                Total de compromisos
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-extrabold text-brand-deep font-sans">
                {stats?.total ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Lima */}
          <Card className="border-brand-border bg-white shadow-card">
            <CardHeader className="p-4 pb-1">
              <span className="text-xs font-semibold text-brand-muted">
                Lima (LIM)
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-extrabold text-campus-lim font-sans">
                {stats?.byCampus.LIM.count ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Juliaca */}
          <Card className="border-brand-border bg-white shadow-card">
            <CardHeader className="p-4 pb-1">
              <span className="text-xs font-semibold text-brand-muted">
                Juliaca (JUL)
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-extrabold text-campus-jul font-sans">
                {stats?.byCampus.JUL.count ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Tarapoto */}
          <Card className="border-brand-border bg-white shadow-card">
            <CardHeader className="p-4 pb-1">
              <span className="text-xs font-semibold text-brand-muted">
                Tarapoto (TPP)
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-extrabold text-campus-tpp font-sans">
                {stats?.byCampus.TPP.count ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE SECTION: REGISTROS POR MINUTO CHART (Mockup C) */}
        <Card className="border-brand-border bg-white shadow-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-brand-deep">
              Registros por minuto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRegistros" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1769B3" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1769B3" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="registros"
                    stroke="#1769B3"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRegistros)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* TABLE SECTION: ÚLTIMOS REGISTROS (Mockup C) */}
        <Card className="border-brand-border bg-white shadow-card">
          <CardHeader className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold text-brand-deep flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
                <span>Últimos registros</span>
              </CardTitle>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Buscar participante..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-8 h-9 text-xs w-48 bg-slate-50"
                  />
                </div>

                <Select
                  value={filters.campus || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, campus: (e.target.value as CampusId) || undefined })
                  }
                  className="h-9 text-xs w-36 bg-slate-50"
                >
                  <option value="">Todos los Campus</option>
                  {CAMPUS_LIST.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-text">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-brand-border">
                <tr>
                  <th className="px-4 py-2.5">Hora</th>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Campus</th>
                  <th className="px-4 py-2.5">Área</th>
                  <th className="px-4 py-2.5">Mural</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No hay registros disponibles con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {new Date(c.fechaISO).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {c.nombres} {c.apellidos}
                      </td>
                      <td className="px-4 py-3">
                        <CampusBadge campusId={c.campus} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.areaNombre}
                      </td>
                      <td className="px-4 py-3">
                        {c.permisoPublicacion ? (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Visible
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Reservado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
