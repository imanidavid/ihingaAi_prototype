import React, { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { PlanAheadCategory, PlanAheadDue, PlanAheadItem } from '../../types';
import {
  HALF_HOUR_TIMES,
  NOW,
  PLAN_ALL_CROPS,
  PLAN_CATEGORIES,
  PLAN_SEASON_OPTIONS,
  formatPlanDue,
} from '../../data/musanzeData';
import { CROP_OPTIONS } from '../../data/rwandaAdminData';
import { DatePicker } from '../DatePicker';
import { PillSelect } from '../PillSelect';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON, TEXT_INPUT } from '../coop/CoopUi';

const MAX_TITLE_WORDS = 10;
const ANY_TIME = '';
const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

const DUE_KINDS: { id: PlanAheadDue['kind']; label: string }[] = [
  { id: 'by', label: 'Due by' },
  { id: 'after', label: 'Not before' },
  { id: 'season', label: 'Season' },
];

const chipClass = (on: boolean) =>
  `px-3 h-9 rounded-full text-[12.5px] border flex items-center cursor-pointer transition-colors ${
    on ? 'bg-[#1F4A34] text-white border-[#1F4A34]' : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
  }`;

/** Officer adds or edits one plan-ahead item; farmers who grow the crop see it under Plan ahead. */
export const PlanAheadModal: React.FC<{
  /** null = closed; 'new' = add; an item = edit it. */
  item: PlanAheadItem | 'new' | null;
  authorName: string;
  onClose: () => void;
  onSave: (item: PlanAheadItem) => void;
}> = ({ item, authorName, onClose, onSave }) => {
  const [crop, setCrop] = useState(PLAN_ALL_CROPS);
  const [category, setCategory] = useState<PlanAheadCategory>('Soil');
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [dueKind, setDueKind] = useState<PlanAheadDue['kind']>('by');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(ANY_TIME);
  const [season, setSeason] = useState(PLAN_SEASON_OPTIONS[0]);

  useEffect(() => {
    if (!item) return;
    const existing = item === 'new' ? null : item;
    setCrop(existing?.crop || PLAN_ALL_CROPS);
    setCategory(existing?.category || 'Soil');
    setTitle(existing?.title || '');
    setReason(existing?.reason || '');
    const due = existing?.due;
    setDueKind(due?.kind || 'by');
    setDate(due && due.kind !== 'season' ? due.date : '');
    setTime(due && due.kind !== 'season' ? due.time || ANY_TIME : ANY_TIME);
    setSeason(due && due.kind === 'season' ? due.season : PLAN_SEASON_OPTIONS[0]);
  }, [item]);

  if (!item) return null;
  const isEdit = item !== 'new';

  const words = wordCount(title);
  const due: PlanAheadDue | null =
    dueKind === 'season'
      ? { kind: 'season', season }
      : date
        ? { kind: dueKind, date, ...(time ? { time } : {}) }
        : null;
  const canSave = words > 0 && words <= MAX_TITLE_WORDS && reason.trim() !== '' && !!due;

  const handleSave = () => {
    if (!due) return;
    onSave({
      id: isEdit ? item.id : `plan-demo-${Date.now()}`,
      crop,
      category,
      title: title.trim(),
      reason: reason.trim(),
      due,
      authorName: isEdit ? item.authorName || authorName : authorName,
    });
  };

  return (
    <CoopModal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit plan-ahead item' : 'Add plan-ahead item'}
      subtitle="Farmers who grow this crop see it under Plan ahead"
      icon={CalendarClock}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button type="button" disabled={!canSave} onClick={handleSave} className={PRIMARY_BUTTON}>
            {isEdit ? 'Save changes' : 'Share with farmers'}
          </button>
        </>
      }
    >
      <PillSelect
        label="Crop"
        value={crop}
        onChange={setCrop}
        options={[PLAN_ALL_CROPS, ...CROP_OPTIONS].map((c) => ({ value: c, label: c }))}
      />

      <div>
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Category</span>
        <div className="flex flex-wrap gap-2">
          {PLAN_CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={chipClass(category === c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-[#17271D]">What to do (plain words)</span>
          <span className={`text-[11.5px] tabular-nums ${words > MAX_TITLE_WORDS ? 'text-[#17271D] font-semibold' : 'text-[#5B665E]'}`}>
            {words}/{MAX_TITLE_WORDS} words
          </span>
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Order clean seed for next season" className={TEXT_INPUT} />
      </label>

      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Why (one line)</span>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Clean seed carries less disease." className={TEXT_INPUT} />
      </label>

      <div className="space-y-2">
        <span className="block text-[12px] font-semibold text-[#17271D]">When</span>
        <div className="flex flex-wrap gap-2">
          {DUE_KINDS.map((k) => (
            <button key={k.id} type="button" aria-pressed={dueKind === k.id} onClick={() => setDueKind(k.id)} className={chipClass(dueKind === k.id)}>
              {k.label}
            </button>
          ))}
        </div>
        {dueKind === 'season' ? (
          <PillSelect value={season} onChange={setSeason} options={PLAN_SEASON_OPTIONS.map((s) => ({ value: s, label: s }))} />
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-2">
            <DatePicker value={date} onChange={setDate} minDate={NOW.dateFormatted} />
            <PillSelect
              value={time}
              onChange={setTime}
              placeholder="Any time"
              options={[{ value: ANY_TIME, label: 'Any time' }, ...HALF_HOUR_TIMES.map((t) => ({ value: t, label: t }))]}
            />
          </div>
        )}
        {due && <p className="text-[12px] text-[#5B665E]">Farmers see: {formatPlanDue(due)}</p>}
      </div>
    </CoopModal>
  );
};
