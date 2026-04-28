import * as React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'default' | 'outline' | 'ghost';

function classesByVariant(variant: Variant) {
  if (variant === 'outline') {
    return 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
  }
  if (variant === 'ghost') {
    return 'border border-transparent bg-transparent text-slate-600 hover:bg-slate-100';
  }
  return 'border border-pink-300 bg-pink-500 text-white hover:bg-pink-600';
}

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { variant?: Variant }
>(({ className, variant = 'default', type = 'button', ...props }, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60',
        classesByVariant(variant),
        className,
      )}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };
