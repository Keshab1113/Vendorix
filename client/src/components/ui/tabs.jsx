import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TabsContext = React.createContext(null);

export function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within Tabs');
  }
  return context;
}

export function Tabs({ children, defaultValue, value, onValueChange, className }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1.5 bg-background-tertiary rounded-xl',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, disabled = false }) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        'relative px-4 py-2 text-sm font-medium rounded-lg transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isSelected
          ? 'text-text-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50',
        className
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-background-secondary rounded-lg shadow-sm"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({ value, children, className, forceRender = false }) {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;

  if (!isSelected && !forceRender) return null;

  return (
    <div
      role="tabpanel"
      aria-labelledby={value}
      hidden={!isSelected}
      className={className}
    >
      {isSelected && children}
    </div>
  );
}

// Alternative: Vertical Tabs
export function TabsVertical({ children, defaultValue, value, onValueChange, className }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('flex gap-6', className)}>
        <TabsList className="flex-col items-stretch">{children}</TabsList>
      </div>
    </TabsContext.Provider>
  );
}