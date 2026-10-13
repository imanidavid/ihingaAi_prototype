import React, { useEffect, useState } from 'react';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { TrainingMaterial, TrainingShare } from '../../types';
import { TRAINING_FORMATS, formatDayShort } from '../../data/musanzeData';
import { FORMAT_ICON, LessonModal } from '../TrainingUi';
import {
  CARD_CLASS,
  ConfirmModal,
  CoopModal,
  EmptyState,
  NeutralChip,
  PageHeader,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  TEXT_INPUT,
} from '../coop/CoopUi';

const MAX_TITLE_WORDS = 10;
const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

const chip = (on: boolean) =>
  `px-3 h-9 rounded-full text-[12.5px] border cursor-pointer transition-colors ${
    on ? 'bg-[#1F4A34] text-white border-[#1F4A34]' : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
  }`;

/** Officer writes lessons; cooperative leaders share them with their groups (Training). */
export const OfficerTrainingView: React.FC<{
  materials: TrainingMaterial[];
  shares: TrainingShare[];
  authorName: string;
  onSave: (material: TrainingMaterial) => void;
  onRemove: (id: string) => void;
}> = ({ materials, shares, authorName, onSave, onRemove }) => {
  const [editing, setEditing] = useState<TrainingMaterial | 'new' | null>(null);
  const [reading, setReading] = useState<TrainingMaterial | null>(null);
  const [toRemove, setToRemove] = useState<TrainingMaterial | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training"
        subtitle="Short lessons for farmers. Cooperative leaders share them with their groups."
        actions={
          <button type="button" onClick={() => setEditing('new')} className={PRIMARY_BUTTON}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add lesson</span>
          </button>
        }
      />

      <div className={`${CARD_CLASS} divide-y divide-[rgba(31,74,52,0.06)] overflow-hidden`}>
        {materials.length === 0 ? (
          <EmptyState icon={BookOpen} text="No lessons yet." />
        ) : (
          materials.map((m) => {
            const Icon = FORMAT_ICON[m.format];
            const timesShared = shares.filter((s) => s.materialId === m.id).length;
            return (
              <div key={m.id} className="p-4 flex flex-wrap items-start justify-between gap-3">
                <button type="button" onClick={() => setReading(m)} className="min-w-0 flex-1 text-left space-y-1 cursor-pointer">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <NeutralChip>
                      <Icon className="w-3 h-3" strokeWidth={1.5} />
                      {m.format}
                    </NeutralChip>
                    <span className="text-[12px] text-[#5B665E]">
                      {m.language} · {m.length}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-semibold text-[#17271D] hover:text-[#1F4A34]">{m.title}</h4>
                  <p className="text-[12.5px] text-[#5B665E]">{m.summary}</p>
                  <p className="text-[11.5px] text-[#5B665E]">
                    {timesShared === 0 ? 'Not shared by a cooperative yet' : `Shared ${timesShared} ${timesShared === 1 ? 'time' : 'times'}`}
                    {m.authorName ? ` · by ${m.authorName}` : ''}
                  </p>
                </button>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditing(m)}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[12px] font-medium text-[#1F4A34] hover:bg-[#E4ECDB] cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setToRemove(m)}
                    aria-label={`Remove ${m.title}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <LessonEditor
        item={editing}
        authorName={authorName}
        onClose={() => setEditing(null)}
        onSave={(m) => {
          onSave(m);
          setEditing(null);
        }}
      />
      <LessonModal material={reading} onClose={() => setReading(null)} />
      <ConfirmModal
        isOpen={!!toRemove}
        title="Remove lesson?"
        body={
          toRemove
            ? `Farmers will no longer be able to open "${toRemove.title}".${
                shares.some((s) => s.materialId === toRemove.id)
                  ? ` It was shared on ${formatDayShort(shares.find((s) => s.materialId === toRemove.id)!.sharedOn)}.`
                  : ''
              }`
            : ''
        }
        confirmLabel="Remove"
        icon={Trash2}
        onConfirm={() => {
          if (toRemove) onRemove(toRemove.id);
          setToRemove(null);
        }}
        onClose={() => setToRemove(null)}
      />
    </div>
  );
};

const LessonEditor: React.FC<{
  item: TrainingMaterial | 'new' | null;
  authorName: string;
  onClose: () => void;
  onSave: (m: TrainingMaterial) => void;
}> = ({ item, authorName, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<TrainingMaterial['format']>('Guide');
  const [language, setLanguage] = useState<TrainingMaterial['language']>('Kinyarwanda');
  const [length, setLength] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!item) return;
    const m = item === 'new' ? null : item;
    setTitle(m?.title || '');
    setFormat(m?.format || 'Guide');
    setLanguage(m?.language || 'Kinyarwanda');
    setLength(m?.length || '');
    setSummary(m?.summary || '');
    setContent(m?.content || '');
  }, [item]);

  if (!item) return null;
  const isEdit = item !== 'new';
  const words = wordCount(title);
  const canSave = words > 0 && words <= MAX_TITLE_WORDS && summary.trim() !== '' && content.trim() !== '' && length.trim() !== '';

  return (
    <CoopModal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit lesson' : 'Add lesson'}
      subtitle="Short and plain: farmers read it on a phone"
      icon={BookOpen}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave({
                ...(isEdit ? item : {}),
                id: isEdit ? item.id : `tm-demo-${Date.now()}`,
                title: title.trim(),
                format,
                language,
                length: length.trim(),
                summary: summary.trim(),
                content: content.trim(),
                authorName: isEdit ? item.authorName || authorName : authorName,
              })
            }
            className={`${PRIMARY_BUTTON} disabled:opacity-50`}
          >
            {isEdit ? 'Save changes' : 'Add lesson'}
          </button>
        </>
      }
    >
      <label className="block">
        <span className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-[#17271D]">Title</span>
          <span className="text-[11.5px] text-[#5B665E] tabular-nums">
            {words}/{MAX_TITLE_WORDS} words
          </span>
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Storing seed potatoes" className={TEXT_INPUT} />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Format</span>
          <div className="flex flex-wrap gap-2">
            {TRAINING_FORMATS.map((f) => (
              <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)} className={chip(format === f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Language</span>
          <div className="flex flex-wrap gap-2">
            {(['Kinyarwanda', 'English'] as const).map((l) => (
              <button key={l} type="button" aria-pressed={language === l} onClick={() => setLanguage(l)} className={chip(language === l)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Length</span>
        <input value={length} onChange={(e) => setLength(e.target.value)} placeholder={format === 'Guide' ? 'e.g. 2 pages' : 'e.g. 4 min'} className={TEXT_INPUT} />
      </label>
      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">What farmers learn (one line)</span>
        <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="e.g. Keep seed dry and dark so it sprouts well." className={TEXT_INPUT} />
      </label>
      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">
          Steps (one per line{format === 'Guide' ? '' : '; also the script of the recording'})
        </span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder={'Choose healthy tubers.\nStore them in a dry, dark place.'}
          className="w-full px-4 py-3 rounded-[16px] bg-white border border-[rgba(31,74,52,0.18)] text-[13px] text-[#17271D] placeholder:text-[#5B665E] focus:outline-none focus:border-[#1F4A34]"
        />
      </label>
    </CoopModal>
  );
};
