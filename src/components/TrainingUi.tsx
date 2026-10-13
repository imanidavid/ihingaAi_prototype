import React, { useState } from 'react';
import { BookOpen, Headphones, Info, PlayCircle } from 'lucide-react';
import { TrainingMaterial } from '../types';
import { CoopModal, SECONDARY_BUTTON } from './coop/CoopUi';

export const FORMAT_ICON = { Audio: Headphones, Video: PlayCircle, Guide: BookOpen };

/** Lesson picture (planned media) with the format icon as fallback. */
export const MaterialThumb: React.FC<{ material: TrainingMaterial; large?: boolean }> = ({ material, large }) => {
  const [failed, setFailed] = useState(!material.thumbnail);
  const Icon = FORMAT_ICON[material.format];
  return (
    <div className={`relative w-full ${large ? 'aspect-[16/9]' : 'aspect-[16/10]'} rounded-[12px] overflow-hidden bg-[#E4ECDB]`}>
      {!failed && material.thumbnail && (
        <img src={material.thumbnail} alt={material.title} onError={() => setFailed(true)} className="w-full h-full object-cover" />
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-8 h-8 text-[#1F4A34]" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
};

/** The lesson itself: summary, numbered steps and, for audio/video, a note until the file is added. */
export const LessonBody: React.FC<{ material: TrainingMaterial }> = ({ material }) => {
  const steps = material.content.split('\n').map((s) => s.trim()).filter(Boolean);
  return (
    <div className="space-y-3">
      <MaterialThumb material={material} large />
      <p className="text-[13px] text-[#17271D] leading-relaxed">{material.summary}</p>
      {steps.length > 0 && (
        <ol className="space-y-1.5">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] text-[#17271D]">
              <span className="w-5 h-5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="leading-snug pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      )}
      {material.format !== 'Guide' && (
        <p className="flex items-start gap-2 text-[12.5px] text-[#5B665E]">
          <Info className="w-4 h-4 text-[#1F4A34] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          The {material.format.toLowerCase()} recording is not added yet. The steps above are its script.
        </p>
      )}
      {material.authorName && <p className="text-[12px] text-[#5B665E]">By {material.authorName}, agricultural officer</p>}
    </div>
  );
};

/** Read a lesson (farmer). */
export const LessonModal: React.FC<{ material: TrainingMaterial | null; onClose: () => void; footer?: React.ReactNode }> = ({
  material,
  onClose,
  footer,
}) => (
  <CoopModal
    isOpen={!!material}
    onClose={onClose}
    title={material?.title || ''}
    subtitle={material ? `${material.format} · ${material.language} · ${material.length}` : ''}
    icon={material ? FORMAT_ICON[material.format] : BookOpen}
    footer={
      footer || (
        <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
          Close
        </button>
      )
    }
  >
    {material && <LessonBody material={material} />}
  </CoopModal>
);
