import React, { useMemo } from 'react';
import { AreaStats } from '../../domain/models/stats';
import { cn } from '../../lib/utils';

interface WordCloudProps {
  areas: AreaStats[];
  className?: string;
}


/**
 * Calcula el tamaño de fuente proporcional a la frecuencia con escala suavizada.
 * Usa una raíz cuadrada para comprimir el rango y evitar palabras gigantes.
 */
function computeFontSize(count: number, maxCount: number): string {
  if (maxCount === 0) return 'text-base';
  // Raíz cuadrada para suavizar diferencias extremas
  const scaled = Math.sqrt(count) / Math.sqrt(maxCount);
  // Mapear a un rango de tamaños: 0.875rem (14px) a 3rem (48px)
  const remSize = 1 + scaled * 2.5;
  return `text-[${remSize.toFixed(2)}rem]`;
}

const CONTRAST_COLORS = [
  'text-white',
  'text-brand-gold',
  'text-sky-300',
  'text-emerald-300',
];

export const WordCloud: React.FC<WordCloudProps> = ({ areas, className }) => {
  // Filtrar solo áreas con compromisos reales (count > 0)
  const visibleAreas = (areas || []).filter((a) => a.count > 0);

  if (!visibleAreas || visibleAreas.length === 0) {
    return (
      <div className={className}>
        <p className="text-slate-300 text-sm italic">
          Esperando los primeros compromisos.
        </p>
      </div>
    );
  }

  const maxCount = useMemo(
    () => Math.max(...visibleAreas.map((a) => a.count)),
    [visibleAreas]
  );

  const sortedAreas = useMemo(
    () => [...visibleAreas].sort((a, b) => b.count - a.count),
    [visibleAreas]
  );

  return (
    <div
      className={cn(
        'min-h-[200px] p-6 rounded-3xl bg-[#17436C] border border-[#37638B] flex flex-wrap justify-center gap-1.5',
        className,
      )}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}
    >
      {sortedAreas.map((area, index) => {
        const fontSize = computeFontSize(area.count, maxCount);
        const color = CONTRAST_COLORS[index % CONTRAST_COLORS.length];

        return (
          <span
            key={area.areaId}
            className={cn(
              'font-bold whitespace-nowrap transition-all duration-300 ease-out hover:scale-105 cursor-default select-none',
              fontSize,
              color,
            )}
            title={`${area.areaNombre}: ${area.count} compromisos`}
          >
            {area.areaNombre}
          </span>
        );
      })}
    </div>
  );
};
