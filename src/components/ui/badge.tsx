import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'gold' | 'lim' | 'jul' | 'tpp';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground border-transparent',
    secondary: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'text-slate-300 border-slate-700',
    gold: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    lim: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    jul: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    tpp: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
