import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DialogContext = React.createContext(null);

export function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a Dialog');
  }
  return context;
}

export function Dialog({ children, open, onOpenChange }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <AnimatePresence mode="wait">
        {open && <DialogOverlay>{children}</DialogOverlay>}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}

function DialogOverlay({ children }) {
  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-h-[85vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function DialogContent({ children, className, showClose = true, onClose }) {
  const { onOpenChange } = useDialog();

  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  return (
    <div
      className={cn(
        'bg-background-secondary border border-border rounded-2xl shadow-2xl overflow-hidden',
        className
      )}
    >
      {showClose && (
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-background-tertiary transition-colors z-10"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-text-muted" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ children, className }) {
  return (
    <div className={cn('px-6 pt-6 pb-4', className)}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className }) {
  return (
    <h2 className={cn('text-xl font-semibold text-text-primary', className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-text-secondary mt-1.5', className)}>
      {children}
    </p>
  );
}

export function DialogBody({ children, className }) {
  return (
    <div className={cn('px-6 py-4 overflow-y-auto max-h-[60vh]', className)}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className }) {
  return (
    <div
      className={cn(
        'px-6 py-4 bg-background-tertiary/50 border-t border-border flex items-center justify-end gap-3',
        className
      )}
    >
      {children}
    </div>
  );
}