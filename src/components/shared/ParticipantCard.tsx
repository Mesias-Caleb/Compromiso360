import React from 'react';
import { Commitment } from '../../domain/models/commitment';
import { CAMPUSES } from '../../config/campuses';
import { cn } from '../../lib/utils';

interface ParticipantCardProps {
  commitment: Commitment;
  className?: string;
  variant?: 'light' | 'mural';
  compact?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  commitment,
  className,
  variant = 'mural',
  compact = false,
}) => {
  const campus = CAMPUSES[commitment.campus];

  // Get initials
  const firstInitial = commitment.nombres ? commitment.nombres.trim().charAt(0) : '';
  const lastInitial = commitment.apellidos ? commitment.apellidos.trim().charAt(0) : '';
  const initials = `${firstInitial}${lastInitial}`.toUpperCase() || 'UN';

  // Campus color theme for avatar
  const avatarColors = {
    LIM: 'bg-[#1769B3]/10 text-[#1769B3] border-[#1769B3]/20',
    JUL: 'bg-[#059669]/10 text-[#059669] border-[#059669]/20',
    TPP: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20',
  };

  return (
    <div
      className={cn(
        'rounded-xl flex items-center gap-2.5 transition-all select-none',
        compact ? 'p-1.5' : 'p-3.5',
        variant === 'mural'
          ? 'bg-white text-slate-800 shadow-md border border-slate-100 hover:shadow-lg'
          : 'bg-white text-brand-text shadow-subtle border border-brand-border',
        className,
      )}
    >
      {/* Avatar with Initials */}
      <div
        className={cn(
          compact ? 'w-8 h-8' : 'w-11 h-11',
          'rounded-full flex items-center justify-center font-bold border shrink-0',
          compact ? 'text-xs' : 'text-sm',
          avatarColors[commitment.campus] || 'bg-slate-100 text-slate-700 border-slate-200',
        )}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col text-left">
        <span className={cn(
          'font-bold truncate leading-tight',
          compact ? 'text-xs sm:text-sm' : 'text-[13px] sm:text-sm',
          'text-slate-900',
        )}>
          {commitment.nombres} {commitment.apellidos}
        </span>
        <span className={cn(
          'font-medium mt-0.5',
          compact ? 'text-[10px]' : 'text-[11px]',
          'text-slate-500',
        )}>
          {campus?.city || campus?.name || commitment.campus}
        </span>
        <span className={cn(
          'truncate mt-0.5',
          compact ? 'text-[10px]' : 'text-[11px]',
          'text-slate-400',
        )} title={commitment.areaNombre}>
          {commitment.areaNombre}
        </span>
      </div>
    </div>
  );
};
