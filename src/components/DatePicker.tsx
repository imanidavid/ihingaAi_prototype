import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES, NOW_DATE, formatDMY, parseDMY } from '../data/musanzeData';

interface DatePickerProps {
  /** DD/MM/YYYY, or '' for no date yet. */
  value: string;
  onChange: (dmy: string) => void;
  label?: string;
  placeholder?: string;
  /** Earliest selectable date, DD/MM/YYYY. */
  minDate?: string;
  /** Latest selectable date, DD/MM/YYYY. */
  maxDate?: string;
  className?: string;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Custom date picker (Design System v3). Shows and returns DD/MM/YYYY — never the native
 * date input. "Today" is NOW (Mon 28/09/2026).
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'DD/MM/YYYY',
  minDate,
  maxDate,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const start = value ? parseDMY(value) : NOW_DATE;
  const [viewYear, setViewYear] = useState(start.getFullYear());
  const [viewMonth, setViewMonth] = useState(start.getMonth());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const d = value ? parseDMY(value) : NOW_DATE;
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const min = minDate ? parseDMY(minDate).getTime() : -Infinity;
  const max = maxDate ? parseDMY(maxDate).getTime() : Infinity;
  const todayDMY = formatDMY(NOW_DATE);

  // Monday-first grid
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const canGoBack = new Date(viewYear, viewMonth, 0).getTime() >= min;
  const canGoForward = new Date(viewYear, viewMonth + 1, 1).getTime() <= max;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && (
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">{label}</span>
      )}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        className={`w-full h-11 px-4 rounded-full border bg-white flex items-center justify-between gap-2 text-left text-[13px] tabular-nums cursor-pointer transition-colors ${
          isOpen ? 'border-[#1F4A34] ring-1 ring-[#1F4A34]' : 'border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
        }`}
      >
        <span className={value ? 'text-[#17271D]' : 'text-[#5B665E]'}>{value || placeholder}</span>
        <CalendarDays className="w-4 h-4 text-[#1F4A34] flex-shrink-0" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose a date"
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
          className="absolute z-30 mt-1.5 w-[280px] bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_8px_24px_rgba(31,74,52,0.12)] p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <span className="text-[13px] font-semibold text-[#17271D]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              disabled={!canGoForward}
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-[11px] font-medium text-[#5B665E] py-1">
                {d}
              </span>
            ))}
            {cells.map((date, idx) => {
              if (!date) return <span key={`blank-${idx}`} />;
              const dmy = formatDMY(date);
              const isDisabled = date.getTime() < min || date.getTime() > max;
              const isSelected = dmy === value;
              const isToday = dmy === todayDMY;
              return (
                <button
                  key={dmy}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(dmy);
                    setIsOpen(false);
                  }}
                  aria-label={dmy}
                  aria-pressed={isSelected}
                  className={`h-8 rounded-full text-[12.5px] tabular-nums transition-colors ${
                    isSelected
                      ? 'bg-[#1F4A34] text-white font-semibold'
                      : isDisabled
                      ? 'text-[#5B665E] opacity-40 cursor-not-allowed'
                      : isToday
                      ? 'border border-[#1F4A34] text-[#1F4A34] font-semibold hover:bg-[#E4ECDB] cursor-pointer'
                      : 'text-[#17271D] hover:bg-[#E4ECDB] cursor-pointer'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-[#5B665E]">Today is {todayDMY}</p>
        </div>
      )}
    </div>
  );
};
