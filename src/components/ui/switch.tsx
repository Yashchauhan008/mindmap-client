import { cn } from '../../lib/utils';

function Switch({
  checked,
  onCheckedChange,
  className,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        'relative inline-flex items-center',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          onCheckedChange(event.target.checked);
        }}
      />
      <div
        className={cn(
          'relative h-5 w-10 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500',
          "after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-5",
        )}
      />
    </label>
  );
}

export { Switch };
