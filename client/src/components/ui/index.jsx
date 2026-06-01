import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store';

// Toast Provider
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  return (
    <ToastContext.Provider value={useToastStore()}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const borderColors = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    warning: 'border-yellow-500/30',
    info: 'border-blue-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={cn(
        'glass flex items-start gap-3 p-4 rounded-xl min-w-[320px] max-w-md',
        borderColors[toast.type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{toast.title}</p>
        <p className="text-sm text-text-secondary mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-background-tertiary transition-colors"
      >
        <X className="w-4 h-4 text-text-muted" />
      </button>
    </motion.div>
  );
}

// Button Component
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 rounded-xl',
    lg: 'px-8 py-4 rounded-xl text-lg'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'btn font-medium',
        variants[variant],
        sizes[size],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

// Input Component
export function Input({
  label,
  error,
  className,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={cn(
          'input-field',
          error && 'border-red-500 focus:border-red-500 ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

// Card Component
export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-background-secondary border border-border rounded-2xl p-6',
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Badge Component
export function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-background-tertiary text-text-secondary border-border',
    pending: 'badge-pending',
    contacted: 'badge-contacted',
    confirmed: 'badge-confirmed',
    rejected: 'badge-rejected',
    completed: 'badge-completed',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
  };

  return (
    <span className={cn('badge', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

// Skeleton Component
export function Skeleton({ className, ...props }) {
  return <div className={cn('skeleton', className)} {...props} />;
}

// Avatar Component
export function Avatar({ src, alt, fallback, className, size = 'md' }) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl'
  };

  if (!src || imageError) {
    return (
      <div className={cn(
        'rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center font-semibold text-white',
        sizes[size],
        className
      )}>
        {fallback || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImageError(true)}
      className={cn('rounded-full object-cover', sizes[size], className)}
    />
  );
}

// Empty State Component
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-background-tertiary flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-6">{description}</p>
      {action && action}
    </div>
  );
}

// Dialog Component (enhanced)
export function Dialog({ children, open, onOpenChange }) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Dialog sub-components
export function DialogPanel({ children, className }) {
  return (
    <div className={cn(
      'bg-background-secondary border border-border rounded-2xl shadow-2xl overflow-hidden',
      className
    )}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className }) {
  return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>;
}

export function DialogTitle({ children, className }) {
  return <h2 className={cn('text-xl font-semibold text-text-primary', className)}>{children}</h2>;
}

export function DialogDescription({ children, className }) {
  return <p className={cn('text-sm text-text-secondary mt-1.5', className)}>{children}</p>;
}

export function DialogBody({ children, className }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function DialogFooter({ children, className }) {
  return (
    <div className={cn('px-6 py-4 bg-background-tertiary/50 border-t border-border flex justify-end gap-3', className)}>
      {children}
    </div>
  );
}

// Re-export UI components
export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  useSheet
} from './sheet';

export {
  Calendar,
  CalendarHeader,
  CalendarBody,
  CalendarFooter
} from './calendar';

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsVertical,
  useTabs
} from './tabs';

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectLabel,
  useSelect
} from './select';

export {
  Textarea,
  TextareaCounter
} from './textarea';

export {
  Switch,
  SwitchCompact
} from './switch';

// Dropdown exports
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './dropdown';