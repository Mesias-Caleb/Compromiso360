import React from 'react';
import { cn } from '../../lib/utils';

import logoHorizontal from '../../images/logo-upeu-horizontal.png';
import logoColorSvg from '../../images/logo_upeu_color.svg';
import logoNegativo from '../../images/Logo_upeu_negativo.png';

interface InstitutionalLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'gold';
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  useSvg?: boolean;
  loading?: 'eager' | 'lazy';
}

const sizeMap = {
  sm: 'h-6 sm:h-7',
  md: 'h-8 sm:h-9',
  lg: 'h-10 sm:h-12',
};

export const InstitutionalLogo: React.FC<InstitutionalLogoProps> = ({
  className,
  variant = 'dark',
  subtitle,
  size = 'md',
  useSvg = false,
  loading,
}) => {
  // Use horizontal color logo by default for light backgrounds; negative for dark backgrounds
  let src = logoHorizontal;
  if (variant === 'light') {
    src = logoNegativo;
  } else if (useSvg) {
    src = logoColorSvg;
  }

  const isEager = loading === 'eager' || loading === undefined ? true : false;

  return (
    <div className={cn('inline-flex items-center gap-2 select-none', className)}>
      <img
        src={src}
        alt="Universidad Peruana Unión"
        className={cn(sizeMap[size], 'w-auto object-contain shrink-0')}
        loading={isEager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {subtitle && (
        <div className="flex flex-col text-left">
          <span
            className={cn(
              'text-[10px] tracking-normal font-normal',
              variant === 'light' ? 'text-white/80' : 'text-brand-muted',
            )}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export { logoHorizontal, logoColorSvg, logoNegativo };
