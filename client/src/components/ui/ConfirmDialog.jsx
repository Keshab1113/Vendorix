import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './index';

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isLoading && onOpenChange(false)}
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background-secondary border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'flex-shrink-0 p-3 rounded-full',
                    variant === 'danger' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                  )}>
                    <AlertTriangle className={cn(
                      'w-6 h-6',
                      variant === 'danger' ? 'text-red-400' : 'text-yellow-400'
                    )} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {title}
                    </h3>
                    <p className="text-text-secondary mt-2">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-background-tertiary/50 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={variant === 'danger' ? 'danger' : 'primary'}
                  onClick={() => onOpenChange(true)}
                  isLoading={isLoading}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}