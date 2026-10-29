import React from 'react';
import { cn } from '../../lib/utils';

interface UniversitySilhouetteProps {
  className?: string;
  variant?: 'light' | 'dark' | 'subtle';
}

export const UniversitySilhouette: React.FC<UniversitySilhouetteProps> = ({
  className,
  variant = 'subtle',
}) => {
  const strokeColors = {
    subtle: '#CBD5E1',
    light: '#1E3A5F',
    dark: '#94A3B8',
  };

  return (
    <div className={cn('w-full overflow-hidden flex justify-center pointer-events-none select-none', className)}>
      <svg
        viewBox="0 0 600 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-lg h-auto opacity-70"
      >
        {/* Ground line */}
        <line x1="10" y1="75" x2="590" y2="75" stroke={strokeColors[variant]} strokeWidth="1.5" />
        
        {/* Left Wing */}
        <rect x="50" y="45" width="160" height="30" stroke={strokeColors[variant]} strokeWidth="1.2" />
        <line x1="80" y1="52" x2="80" y2="68" stroke={strokeColors[variant]} strokeWidth="1" />
        <line x1="110" y1="52" x2="110" y2="68" stroke={strokeColors[variant]} strokeWidth="1" />
        <line x1="140" y1="52" x2="140" y2="68" stroke={strokeColors[variant]} strokeWidth="1" />
        <line x1="170" y1="52" x2="170" y2="68" stroke={strokeColors[variant]} strokeWidth="1" />

        {/* Central Portico with Pediment & Columns */}
        <polygon points="210,40 300,18 390,40" stroke={strokeColors[variant]} strokeWidth="1.5" />
        <circle cx="300" cy="30" r="5" stroke={strokeColors[variant]} strokeWidth="1" />
        
        {/* Columns */}
        <rect x="220" y="40" width="10" height="35" stroke={strokeColors[variant]} strokeWidth="1.2" />
        <rect x="250" y="40" width="10" height="35" stroke={strokeColors[variant]} strokeWidth="1.2" />
        <rect x="280" y="40" width="10" height="35" stroke={strokeColors[variant]} strokeWidth="1.2" />
        <rect x="310" y="40" width="10" height="35" stroke={strokeColors[variant]} strokeWidth="1.2" />
        <rect x="340" y="40" width="10" height="35" stroke={strokeColors[variant]} strokeWidth="1.2" />
        <rect x="370" y="40" width="10" height="35" stroke={strokeColors[variant]} strokeWidth="1.2" />
        
        {/* Main Portal Door */}
        <path d="M 285 75 L 285 55 Q 300 48 315 55 L 315 75 Z" stroke={strokeColors[variant]} strokeWidth="1.2" />

        {/* Right Wing */}
        <rect x="390" y="45" width="160" height="30" stroke={strokeColors[variant]} strokeWidth="1.2" />
        <line x1="420" y1="52" x2="420" y2="68" stroke={strokeColors[variant]} strokeWidth="1" />
        <line x1="450" y1="52" x2="450" y2="68" stroke={strokeColors[variant]} strokeWidth="1" />
        <line x1="480" y1="52" x2="480" y2="68" stroke={strokeColors[variant]} strokeWidth="1" />
        <line x1="510" y1="52" x2="510" y2="68" stroke={strokeColors[variant]} strokeWidth="1" />

        {/* Trees / Greenery symbols */}
        <circle cx="35" cy="62" r="12" stroke={strokeColors[variant]} strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="565" cy="62" r="12" stroke={strokeColors[variant]} strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    </div>
  );
};
