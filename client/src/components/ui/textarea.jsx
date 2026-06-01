import * as React from 'react';
import { cn } from '@/lib/utils';

export function Textarea({
  label,
  error,
  className,
  maxLength,
  showCount = false,
  rows = 4,
  resize = 'vertical',
  ...props
}) {
  const [charCount, setCharCount] = React.useState(0);
  const textareaRef = React.useRef(null);

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    props.onChange?.(e);
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={textareaRef}
          rows={rows}
          maxLength={maxLength}
          onChange={handleChange}
          className={cn(
            'input-field min-h-[120px]',
            resizeClasses[resize],
            error && 'border-red-500 focus:border-red-500 ring-red-500/20',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {showCount && maxLength && (
          <div className="absolute bottom-3 right-3 text-xs text-text-muted">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      {error && (
        <p id={`${props.id}-error`} className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaCounter({ value, maxLength, className }) {
  return (
    <div className={cn('text-xs text-text-muted', className)}>
      {value.length}/{maxLength}
    </div>
  );
}