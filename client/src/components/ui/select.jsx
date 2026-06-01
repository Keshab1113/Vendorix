import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SelectContext = React.createContext(null);

export function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('useSelect must be used within a Select');
  }
  return context;
}

export function Select({ children, value, onChange, disabled = false, className }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value || '');
  const selectValue = value !== undefined ? value : internalValue;

  const currentValue = React.useMemo(() => {
    // Find the selected option from children
    const findSelected = (children) => {
      if (!children) return null;
      if (Array.isArray(children)) {
        for (const child of children) {
          const found = findSelected(child);
          if (found) return found;
        }
        return null;
      }
      if (children.props?.value === selectValue) {
        return children.props?.children;
      }
      return findSelected(children.props?.children);
    };
    return findSelected(children);
  }, [children, selectValue]);

  const handleSelect = (optionValue) => {
    setInternalValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value: selectValue, onChange: handleSelect, isOpen, setIsOpen, disabled }}>
      <div className={cn('relative', className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className, placeholder = 'Select an option' }) {
  const { value, isOpen, setIsOpen, disabled } = useSelect();
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      className={cn(
        'flex items-center justify-between w-full px-4 py-3 rounded-xl',
        'bg-background-tertiary border border-border',
        'text-left text-sm',
        'transition-colors hover:border-border/80',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue/50',
        disabled && 'opacity-50 cursor-not-allowed',
        !value && 'text-text-muted',
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <span>{value ? children : placeholder}</span>
      <ChevronDown
        className={cn(
          'w-4 h-4 text-text-muted transition-transform',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  );
}

export function SelectValue({ children }) {
  const { value } = useSelect();
  return children || value;
}

export function SelectContent({ children, className }) {
  const { isOpen, setIsOpen } = useSelect();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'absolute z-50 w-full mt-2 py-2 rounded-xl',
          'bg-background-secondary border border-border shadow-xl',
          'max-h-60 overflow-y-auto',
          className
        )}
        role="listbox"
      >
        {children}
      </motion.div>
    </>
  );
}

export function SelectItem({ value, children, className }) {
  const { value: selectedValue, onChange } = useSelect();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        'flex items-center justify-between w-full px-4 py-2.5 text-sm',
        'transition-colors',
        isSelected
          ? 'bg-accent-blue/10 text-accent-blue'
          : 'text-text-primary hover:bg-background-tertiary',
        className
      )}
      role="option"
      aria-selected={isSelected}
    >
      <span>{children}</span>
      {isSelected && <Check className="w-4 h-4" />}
    </button>
  );
}

export function SelectSeparator({ className }) {
  return <div className={cn('h-px bg-border my-1', className)} />;
}

export function SelectLabel({ children, className }) {
  return (
    <div className={cn('px-4 py-2 text-xs font-medium text-text-muted', className)}>
      {children}
    </div>
  );
}