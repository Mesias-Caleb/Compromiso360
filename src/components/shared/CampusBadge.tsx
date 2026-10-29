import React from 'react';
import { CampusId } from '../../domain/models/campus';
import { CAMPUSES } from '../../config/campuses';
import { cn } from '../../lib/utils';

interface CampusBadgeProps {
  campusId: CampusId;
  className?: string;
  size?: 'sm' | 'md';
}

export const CampusBadge: React.FC<CampusBadgeProps> = ({
  campusId,
  className,
  size = 'sm',
}) => {
  const campus = CAMPUSES[campusId];
  if (!campus) return null;

  const styles = {
    LIM: 'bg-[#EBF3FB] text-[#1769B3] border-[#1769B3]/30',
    JUL: 'bg-[#ECFDF5] text-[#059669] border-[#059669]/30',
    TPP: 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/30',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-md font-semibold border',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 select-none', styles[campusId], sizes[size], className)}>
      <span>{campus.name}</span>
    </span>
  );
};
