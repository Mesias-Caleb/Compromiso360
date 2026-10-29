import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-interactive focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm cursor-pointer',
          error && 'border-rose-500 focus-visible:ring-rose-500',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';

export { Select };
