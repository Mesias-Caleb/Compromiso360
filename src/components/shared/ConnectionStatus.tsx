import React from 'react';
import { WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnecting: boolean;
  lastError: string | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  reconnecting,
  lastError,
}) => {
  if (isConnected) return null;

  return (
    <div
      className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium backdrop-blur-sm"
    >
      {reconnecting ? (
        <>
          <WifiOff className="w-3 h-3 animate-pulse" />
          <span>Reconectando…</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Sin conexión al servidor</span>
        </>
      )}
      {lastError && (
        <span className="text-amber-300/80 ml-2">({lastError})</span>
      )}
    </div>
  );
};
