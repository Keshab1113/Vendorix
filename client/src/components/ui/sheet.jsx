import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SheetContext = React.createContext(null);

export function useSheet() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('useSheet must be used within a Sheet');
  }
  return context;
}

export function Sheet({ children, open, onOpenChange }) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      <AnimatePresence mode="wait">
        {open && <SheetOverlay />}
      </AnimatePresence>
      {children}
    </SheetContext.Provider>
  );
}

function SheetOverlay() {
  const { onOpenChange } = useSheet();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
    </>
  );
}

const sheetVariants = {
  left: {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  right: {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  top: {
    hidden: { y: '-100%', opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  bottom: {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }
};

export function SheetContent({
  children,
  side = 'right',
  className,
  showClose = true,
  onClose
}) {
  const { onOpenChange } = useSheet();

  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  const sizeClasses = {
    left: 'h-full max-w-xs',
    right: 'h-full max-w-xs',
    top: 'w-full max-h-64',
    bottom: 'w-full max-h-64'
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sheetVariants[side]}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={cn(
        'fixed z-50 bg-background-secondary border-border shadow-2xl',
        side === 'left' && 'inset-y-0 left-0 border-r',
        side === 'right' && 'inset-y-0 right-0 border-l',
        side === 'top' && 'inset-x-0 top-0 border-b',
        side === 'bottom' && 'inset-x-0 bottom-0 border-t',
        sizeClasses[side],
        className
      )}
      role="dialog"
      aria-modal="true"
    >
      {showClose && (
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-background-tertiary transition-colors z-10"
          aria-label="Close sheet"
        >
          <X className="w-5 h-5 text-text-muted" />
        </button>
      )}
      <div className="h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

export function SheetHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-b border-border', className)}>
      {children}
    </div>
  );
}

export function SheetTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)}>
      {children}
    </h3>
  );
}

export function SheetDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-text-secondary mt-1', className)}>
      {children}
    </p>
  );
}

export function SheetBody({ children, className }) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-6', className)}>
      {children}
    </div>
  );
}

export function SheetFooter({ children, className }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-border bg-background-tertiary/50 flex items-center justify-end gap-3',
        className
      )}
    >
      {children}
    </div>
  );
}