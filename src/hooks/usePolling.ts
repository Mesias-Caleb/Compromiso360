import { useEffect, useRef, useState } from 'react';

interface UsePollingOptions {
  intervalMs?: number;
  enabled?: boolean;
  onFetch: () => Promise<void>;
}

/**
 * Hook de polling eficiente que evita solicitudes superpuestas.
 * Utiliza AbortController para cancelar la petición anterior si se dispara un nuevo ciclo.
 * No ejecuta polling cuando el componente está desmontado o la pestaña no es visible.
 */
export function usePolling({
  intervalMs = 2000,
  enabled = true,
  onFetch,
}: UsePollingOptions) {
  const isFetching = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  const cancelPending = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  };

  const fetchWithGuard = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    cancelPending();
    controllerRef.current = new AbortController();

    try {
      await onFetch();
      setLastError(null);
      if (!isConnected) {
        setIsConnected(true);
        setReconnecting(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      if (message === 'AbortError') return;
      setLastError(message);
      setIsConnected(false);
      setReconnecting(true);
    } finally {
      isFetching.current = false;
      controllerRef.current = null;
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Ejecutar inmediatamente al montar
    fetchWithGuard();

    const timer = setInterval(fetchWithGuard, intervalMs);

    // Pausar polling cuando la pestaña no es visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelPending();
        clearInterval(timer);
      } else {
        clearInterval(timer);
        fetchWithGuard();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelPending();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs, fetchWithGuard]);

  return { lastError, isConnected, reconnecting, refetch: fetchWithGuard };
}
