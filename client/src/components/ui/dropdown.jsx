import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} className="relative inline-block" {...props} />
));
DropdownMenu.displayName = 'DropdownMenu';

const DropdownMenuTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
));
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef(({ children, className, align = 'end', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-background-secondary shadow-xl',
      'border border-border',
      align === 'end' ? 'right-0' : 'left-0',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef(({ children, className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-text-secondary',
      'hover:bg-background-tertiary hover:text-text-primary transition-colors',
      className
    )}
    {...props}
  >
    {children}
  </button>
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuLabel = React.forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-4 py-2 text-xs font-medium text-text-muted', className)}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
};