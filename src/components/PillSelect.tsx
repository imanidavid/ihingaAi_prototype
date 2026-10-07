import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface PillSelectOption {
  value: string;
  label: string;
  /** Muted second line or right-hand hint (e.g. member count). */
  hint?: string;
  disabled?: boolean;
}

interface PillSelectProps {
  value: string;
  options: PillSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Visible label above the pill. */
  label?: string;
  /** Show a search box inside the list (long lists such as members). */
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Custom pill dropdown (Design System v3). Replaces the native <select>:
 * 44px pill trigger, card-style list, keyboard support (arrows, Enter, Escape).
 */
export const PillSelect: React.FC<PillSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Choose',
  label,
  searchable = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const visible = searchable && query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    }
  }, [isOpen]);

  const choose = (option: PillSelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(visible.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visible[activeIndex]) choose(visible[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {label && (
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">{label}</span>
      )}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((o) => !o)}
        className={`w-full h-11 px-4 rounded-full border bg-white flex items-center justify-between gap-2 text-left text-[13px] transition-colors ${
          disabled
            ? 'border-[rgba(31,74,52,0.10)] text-[#5B665E] cursor-not-allowed opacity-70'
            : isOpen
            ? 'border-[#1F4A34] ring-1 ring-[#1F4A34] cursor-pointer'
            : 'border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34] cursor-pointer'
        }`}
      >
        <span className={`truncate ${selected ? 'text-[#17271D]' : 'text-[#5B665E]'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#5B665E] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1.5 w-full min-w-[220px] bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_8px_24px_rgba(31,74,52,0.12)] overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-[rgba(31,74,52,0.08)]">
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search"
                className="w-full h-9 px-3 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[12.5px] text-[#17271D] placeholder:text-[#5B665E] focus:outline-none focus:border-[#1F4A34]"
              />
            </div>
          )}
          <ul id={listId} role="listbox" className="max-h-60 overflow-y-auto py-1">
            {visible.length === 0 && (
              <li className="px-4 py-3 text-[12.5px] text-[#5B665E]">No matches</li>
            )}
            {visible.map((option, idx) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => choose(option)}
                  className={`mx-1 px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-[13px] ${
                    option.disabled
                      ? 'text-[#5B665E] opacity-60 cursor-not-allowed'
                      : idx === activeIndex
                      ? 'bg-[#E4ECDB] text-[#17271D] cursor-pointer'
                      : 'text-[#17271D] cursor-pointer'
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`block ${isSelected ? 'font-semibold' : ''}`}>{option.label}</span>
                    {option.hint && (
                      <span className="block text-[11.5px] text-[#5B665E]">{option.hint}</span>
                    )}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#1F4A34] flex-shrink-0" strokeWidth={2} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
