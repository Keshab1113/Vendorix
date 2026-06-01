import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className,
  id,
  ...props
}) {
  const handleId = id || `switch-${React.useId()}`;

  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <button
        id={handleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-accent-blue' : 'bg-background-tertiary border border-border',
          sizeConfig.track,
          className
        )}
        {...props}
      >
        <motion.div
          className={cn(
            'rounded-full bg-white shadow-lg flex items-center justify-center',
            sizeConfig.thumb
          )}
          animate={{
            x: checked ? 0 : 0
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.div
            animate={{ x: checked ? 0 : 0 }}
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'rounded-full bg-white shadow-lg',
              sizeConfig.thumb,
              checked ? sizeConfig.translate : 'translate-x-0.5'
            )}
          />
        </motion.div>
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={handleId}
              className="text-sm font-medium text-text-primary cursor-pointer"
              onClick={() => !disabled && onChange?.(!checked)}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version without label
export function SwitchCompact({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  className,
  ...props
}) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'translate-x-7' }
  };

  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        'relative inline-flex flex-shrink-0 cursor-pointer rounded-full',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-accent-blue' : 'bg-background-tertiary border border-border',
        sizes[size].track,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 rounded-full bg-white shadow-lg',
          'transition-transform duration-200 ease-in-out',
          sizes[size].thumb,
          checked && 'translate-x-full'
        )}
      />
    </button>
  );
}