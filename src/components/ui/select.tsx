import * as React from 'react';
import { cn } from '../../lib/utils';

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-200',
          className,
        )}
        {...props}
      />
    );
  },
);

Select.displayName = 'Select';

export { Select };
