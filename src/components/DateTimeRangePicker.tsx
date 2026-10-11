import React from 'react';
import { CalendarClock } from 'lucide-react';
import {
  HALF_HOUR_TIMES,
  NOW_STAMP,
  formatTimeframe,
  isRangeValid,
  stampHoursFromNow,
} from '../data/musanzeData';
import { DatePicker } from './DatePicker';
import { PillSelect } from './PillSelect';

const QUICK_HOURS = [24, 48, 72];

interface DateTimeRangePickerProps {
  /** 'DD/MM/YYYY HH:MM' (or 'DD/MM/YYYY' when withTime is false); '' = not chosen yet. */
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  /** Show half-hour time pills next to each date (default true). */
  withTime?: boolean;
  /** Show "Next 24 h / 48 h / 72 h" chips counted from NOW (default true when withTime). */
  quickChips?: boolean;
  minDate?: string;
  maxDate?: string;
  startLabel?: string;
  endLabel?: string;
  /** Allow end = start (e.g. a one-day report period). */
  allowSame?: boolean;
}

/**
 * Starts / Ends picker: each is our DatePicker (DD/MM/YYYY) plus, with time, a half-hour pill.
 * The caller stores the two values and builds any display text with formatTimeframe().
 */
export const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  start,
  end,
  onChange,
  withTime = true,
  quickChips = withTime,
  minDate,
  maxDate,
  startLabel = 'Starts',
  endLabel = 'Ends',
  allowSame = false,
}) => {
  const split = (v: string) => {
    const [date = '', time = ''] = v.split(' ');
    return { date, time };
  };
  const s = split(start);
  const e = split(end);
  const join = (date: string, time: string) => (withTime ? (date ? `${date} ${time || '00:00'}` : '') : date);
  const invalid = !!start && !!end && !isRangeValid(start, end) && !(allowSame && start === end);
  const activeChip = QUICK_HOURS.find((h) => start === NOW_STAMP && end === stampHoursFromNow(h));

  const side = (label: string, part: { date: string; time: string }, set: (date: string, time: string) => void) => (
    <div className="space-y-1.5">
      <span className="block text-[12px] font-semibold text-[#17271D]">{label}</span>
      <div className={withTime ? 'grid grid-cols-[1fr_120px] gap-2' : ''}>
        <DatePicker value={part.date} onChange={(d) => set(d, part.time)} minDate={minDate} maxDate={maxDate} />
        {withTime && (
          <PillSelect
            value={part.time}
            onChange={(t) => set(part.date, t)}
            placeholder="Time"
            options={HALF_HOUR_TIMES.map((t) => ({ value: t, label: t }))}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2.5">
      {quickChips && (
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_HOURS.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={activeChip === h}
              onClick={() => onChange(NOW_STAMP, stampHoursFromNow(h))}
              className={`px-3 h-8 rounded-full text-[12px] font-medium border cursor-pointer transition-colors ${
                activeChip === h
                  ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                  : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
              }`}
            >
              Next {h} h
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {side(startLabel, s, (date, time) => onChange(join(date, time), end))}
        {side(endLabel, e, (date, time) => onChange(start, join(date, time)))}
      </div>
      {invalid ? (
        <p role="alert" className="text-[12px] font-medium text-[#17271D]">
          {endLabel} must be {allowSame ? 'on or after' : 'after'} {startLabel.toLowerCase()}.
        </p>
      ) : start && end ? (
        <p className="flex items-center gap-1.5 text-[12px] text-[#5B665E] tabular-nums">
          <CalendarClock className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
          {formatTimeframe(start, end)}
        </p>
      ) : null}
    </div>
  );
};
