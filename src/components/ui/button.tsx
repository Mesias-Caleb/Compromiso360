import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'default';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-interactive disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.99]';

    const variants = {
      default: 'bg-brand-primary text-white hover:bg-[#0E3B6A] shadow-sm',
      primary: 'bg-brand-deep text-white hover:bg-brand-primary shadow-sm hover:shadow',
      gold: 'bg-brand-gold text-brand-deep hover:bg-[#C99E52] shadow-sm font-bold',
      outline: 'border border-brand-border bg-white text-brand-text hover:bg-brand-light',
      secondary: 'bg-slate-100 text-brand-text hover:bg-slate-200',
      ghost: 'hover:bg-slate-100 text-brand-text',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700',
    };

    const sizes = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-13 rounded-lg px-8 text-base font-bold',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
