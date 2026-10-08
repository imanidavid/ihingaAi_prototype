import React, { useEffect, useState } from 'react';
import { Check, Sprout } from 'lucide-react';
import { CropAdvisory, OfficerActiveWarning } from '../../types';
import { CROP_IMAGES } from '../../data/musanzeData';
import { PillSelect } from '../PillSelect';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON, TEXT_INPUT } from '../coop/CoopUi';

const MAX_TITLE_WORDS = 10;
const ADVICE_CROPS = Object.keys(CROP_IMAGES);
const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

/** Officer writes crop advice linked to one active warning; farmers see it while the warning is active. */
export const CropAdviceModal: React.FC<{
  warning: OfficerActiveWarning | null;
  authorName: string;
  onClose: () => void;
  onSave: (advice: CropAdvisory) => void;
}> = ({ warning, authorName, onClose, onSave }) => {
  const [crop, setCrop] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [timing, setTiming] = useState('');
  const [steps, setSteps] = useState<string[]>(['', '', '']);

  useEffect(() => {
    if (!warning) return;
    const crops = (warning.crops || []).filter((c) => ADVICE_CROPS.includes(c));
    setCrop(crops[0] || ADVICE_CROPS[0]);
    setSectors(warning.sectors || []);
    setTitle('');
    setWhy('');
    setTiming('');
    setSteps(['', '', '']);
  }, [warning]);

  if (!warning) return null;

  const warningSectors = warning.sectors || [];
  const words = wordCount(title);
  const filledSteps = steps.map((s) => s.trim()).filter(Boolean);
  const canSave = !!crop && sectors.length > 0 && words > 0 && words <= MAX_TITLE_WORDS && why.trim() !== '' && filledSteps.length > 0;

  const handleSave = () => {
    onSave({
      id: `adv-demo-${Date.now()}`,
      crop,
      category: 'Officer advice',
      badgeLabel: `${crop} · ${warning.title}`,
      title: title.trim(),
      oneLineAdvice: why.trim(),
      image: CROP_IMAGES[crop],
      stat1Value: warning.severity,
      stat1Label: 'Warning level',
      stat2Value: `${sectors.length}`,
      stat2Label: sectors.length === 1 ? 'Sector' : 'Sectors',
      windowStatusText: timing.trim() || `While ${warning.title} is active`,
      progressLabel: 'Active',
      progressPercent: 100,
      whyAdvice: why.trim(),
      location: sectors.join(', '),
      timing: timing.trim() || `While ${warning.title} is active`,
      riskSummary: `${warning.title}, ${warning.severity}`,
      mitigationSteps: filledSteps,
      linkedWarningId: warning.id,
      sectors,
      authorName,
      isDemo: true,
    });
  };

  return (
    <CoopModal
      isOpen
      onClose={onClose}
      title="Add crop advice"
      subtitle={`Linked to ${warning.title} · farmers see it only while this warning is active`}
      icon={Sprout}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button type="button" disabled={!canSave} onClick={handleSave} className={PRIMARY_BUTTON}>
            Publish advice
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PillSelect label="Crop" value={crop} onChange={setCrop} options={ADVICE_CROPS.map((c) => ({ value: c, label: c }))} />
        <label className="block">
          <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">When</span>
          <input value={timing} onChange={(e) => setTiming(e.target.value)} placeholder="e.g. Before Tue 14:00" className={TEXT_INPUT} />
        </label>
      </div>

      <div>
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Sectors</span>
        <div className="flex flex-wrap gap-2">
          {warningSectors.map((s) => {
            const on = sectors.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setSectors((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]))}
                className={`px-3 h-9 rounded-full text-[12.5px] border flex items-center gap-1 cursor-pointer ${
                  on ? 'bg-[#1F4A34] text-white border-[#1F4A34]' : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
                }`}
              >
                {on && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-[#17271D]">What to do (plain words)</span>
          <span className={`text-[11.5px] tabular-nums ${words > MAX_TITLE_WORDS ? 'text-[#17271D] font-semibold' : 'text-[#5B665E]'}`}>
            {words}/{MAX_TITLE_WORDS} words
          </span>
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cover seed potatoes before the rain" className={TEXT_INPUT} />
      </label>

      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Why (one line)</span>
        <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. Wet seed rots in two days." className={TEXT_INPUT} />
      </label>

      <div>
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Steps (up to 3)</span>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <input
              key={i}
              value={step}
              onChange={(e) => setSteps((prev) => prev.map((s, j) => (j === i ? e.target.value : s)))}
              placeholder={`Step ${i + 1}`}
              aria-label={`Step ${i + 1}`}
              className={TEXT_INPUT}
            />
          ))}
        </div>
      </div>
    </CoopModal>
  );
};
