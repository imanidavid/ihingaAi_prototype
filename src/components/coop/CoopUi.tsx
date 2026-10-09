import React from 'react';
import { X } from 'lucide-react';

/** Shared building blocks for the cooperative pages (Design System v3 tokens only). */

export const CARD_CLASS =
  'bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]';

export const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-1.5 px-4 h-9 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-semibold hover:bg-[#2C6343] transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

export const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-1.5 px-4 h-9 rounded-full bg-white text-[#1F4A34] border border-[#1F4A34]/40 text-[12.5px] font-semibold hover:bg-[#E4ECDB] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

export const TEXT_INPUT =
  'w-full h-11 px-4 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[13px] text-[#17271D] placeholder:text-[#5B665E] focus:outline-none focus:border-[#1F4A34] focus:ring-1 focus:ring-[#1F4A34]';

export const PageHeader: React.FC<{
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
    <div>
      <h1 className="text-[24px] font-semibold text-[#17271D] leading-tight">{title}</h1>
      <p className="text-[13px] text-[#5B665E] mt-1">{subtitle}</p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const SegmentedTabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) => (
  <div role="tablist" className="inline-flex flex-wrap gap-1 p-1 rounded-full bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.08)]">
    {tabs.map((t) => (
      <button
        key={t.id}
        type="button"
        role="tab"
        aria-selected={value === t.id}
        onClick={() => onChange(t.id)}
        className={`px-4 h-8 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
          value === t.id ? 'bg-[#FBFCF8] text-[#17271D] shadow-xs font-semibold' : 'text-[#5B665E] hover:text-[#17271D]'
        }`}
      >
        <span>{t.label}</span>
        {t.count !== undefined && <span className="tabular-nums text-[11px] text-[#5B665E]">{t.count}</span>}
      </button>
    ))}
  </div>
);

export const IconCircle: React.FC<{ icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = ({
  icon: Icon,
}) => (
  <div className="w-10 h-10 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center text-[#1F4A34] flex-shrink-0">
    <Icon className="w-4 h-4" strokeWidth={1.5} />
  </div>
);

/** Neutral status chip (never a risk colour). */
export const NeutralChip: React.FC<{ children: React.ReactNode; tone?: 'tint' | 'outline' }> = ({
  children,
  tone = 'tint',
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
      tone === 'tint'
        ? 'bg-[#E4ECDB] text-[#1F4A34] border border-[rgba(31,74,52,0.12)]'
        : 'bg-white text-[#5B665E] border border-[rgba(31,74,52,0.22)]'
    }`}
  >
    {children}
  </span>
);

export const EmptyState: React.FC<{
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  text: string;
  action?: React.ReactNode;
}> = ({ icon, text, action }) => (
  <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
    <IconCircle icon={icon} />
    <p className="text-[13px] text-[#5B665E]">{text}</p>
    {action}
  </div>
);

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${
      checked ? 'bg-[#3E8E55]' : 'bg-[#5B665E]/30'
    }`}
  >
    <span
      className={`absolute top-1 left-0 inline-block w-4 h-4 rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export const CoopModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  footer: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, subtitle, icon: Icon, children, footer, maxWidth = 'max-w-[560px]' }) => {
  if (!isOpen) return null;
  return (
    // The backdrop scrolls (not the dialog body) so dropdowns and the date picker are never clipped
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs animate-in fade-in"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="min-h-full flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-[#FBFCF8] rounded-[24px] ${maxWidth} w-full border border-[rgba(31,74,52,0.15)] shadow-2xl flex flex-col`}
      >
        <div className="p-5 md:p-6 pb-4 border-b border-[rgba(31,74,52,0.10)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
              <Icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-[#17271D] leading-tight">{title}</h2>
              {subtitle && <p className="text-[12px] text-[#5B665E]">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-[#F4F6EF] flex items-center justify-center text-[#5B665E] hover:text-[#17271D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 md:p-6 flex-1 space-y-4 text-[13px]">{children}</div>
        <div className="p-4 md:p-5 border-t border-[rgba(31,74,52,0.10)] bg-[#F4F6EF]/50 flex items-center justify-end gap-2 rounded-b-[24px]">
          {footer}
        </div>
      </div>
      </div>
    </div>
  );
};

/** "Remove X?" confirmation. */
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ isOpen, title, body, confirmLabel, icon, onConfirm, onClose }) => (
  <CoopModal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    icon={icon}
    maxWidth="max-w-[440px]"
    footer={
      <>
        <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={PRIMARY_BUTTON}>
          {confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-[13px] text-[#17271D] leading-relaxed">{body}</p>
  </CoopModal>
);
