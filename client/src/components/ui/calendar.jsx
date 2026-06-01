import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';

export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  showHeader = true,
  showDaysOfWeek = true
}) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date) => {
    // Check if date is disabled
    if (minDate && isBefore(date, startOfDay(minDate))) return;
    if (maxDate && isBefore(date, startOfDay(maxDate))) return;
    onSelect?.(date);
  };

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <span className="text-base font-semibold text-text-primary">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    if (!showDaysOfWeek) return null;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="grid grid-cols-7 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-text-muted py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isDisabled =
          (minDate && isBefore(day, startOfDay(minDate))) ||
          (maxDate && isBefore(day, startOfDay(maxDate)));
        const isSelected = selected && isSameDay(day, selected);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isTodayDate = isToday(day);

        days.push(
          <button
            key={day.toString()}
            onClick={() => handleDateClick(currentDay)}
            disabled={isDisabled}
            className={cn(
              'relative p-2 text-sm font-medium rounded-lg transition-all',
              'hover:bg-background-tertiary',
              !isCurrentMonth && 'text-text-muted',
              isCurrentMonth && !isSelected && 'text-text-primary',
              isSelected && 'bg-accent-blue text-white hover:bg-accent-blue/90',
              isTodayDate && !isSelected && 'ring-2 ring-accent-blue/50',
              isDisabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
            )}
            aria-label={format(day, 'MMMM d, yyyy')}
            aria-selected={isSelected}
          >
            {format(day, 'd')}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div
      className={cn('bg-background-secondary border border-border rounded-2xl p-4', className)}
      role="application"
      aria-label="Calendar"
    >
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderDays()}
    </div>
  );
}

export function CalendarHeader({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CalendarBody({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CalendarFooter({ children, className }) {
  return (
    <div className={cn('pt-4 border-t border-border mt-4', className)}>
      {children}
    </div>
  );
}