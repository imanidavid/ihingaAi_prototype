import React, { useMemo, useState } from 'react';
import { CalendarDays, Eye, Plus, Send, SprayCan } from 'lucide-react';
import { CoopGroupRecord, CoopMember, EquipmentBooking, TrainingMaterial, TrainingShare } from '../types';
import {
  COOP_EQUIPMENT,
  NOW_DATE,
  bookedForLabel,
  formatDayShort,
  parseDMY,
  slotStart,
} from '../data/musanzeData';
import {
  CARD_CLASS,
  CoopModal,
  EmptyState,
  IconCircle,
  NeutralChip,
  PageHeader,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SegmentedTabs,
} from './coop/CoopUi';
import { BookEquipmentModal } from './coop/BookEquipmentModal';
import { FORMAT_ICON, LessonBody, MaterialThumb } from './TrainingUi';

type TrainingTab = 'materials' | 'equipment';

interface CooperativeTrainingViewProps {
  bookings: EquipmentBooking[];
  members: CoopMember[];
  groupRecords: CoopGroupRecord[];
  onBook: (booking: EquipmentBooking) => void;
  onShareMaterial: (material: TrainingMaterial) => void;
  /** Lessons written by the agricultural officer, and the ones already shared. */
  materials: TrainingMaterial[];
  shares: TrainingShare[];
}

export const CooperativeTrainingView: React.FC<CooperativeTrainingViewProps> = ({
  bookings,
  members,
  groupRecords,
  onBook,
  onShareMaterial,
  materials,
  shares,
}) => {
  const lastShare = (id: string) =>
    shares
      .filter((s) => s.materialId === id)
      .sort((a, b) => parseDMY(b.sharedOn).getTime() - parseDMY(a.sharedOn).getTime())[0];
  const [tab, setTab] = useState<TrainingTab>('materials');
  const [preview, setPreview] = useState<TrainingMaterial | null>(null);
  const [bookFor, setBookFor] = useState<string | null>(null);

  const upcomingByEquipment = useMemo(
    () =>
      new Map(
        COOP_EQUIPMENT.map((e) => [
          e.id,
          bookings
            .filter((b) => b.equipmentId === e.id)
            .filter((b) => parseDMY(b.date, b.slot.split('–')[1]).getTime() > NOW_DATE.getTime())
            .sort(
              (a, b) =>
                parseDMY(a.date, slotStart(a.slot)).getTime() - parseDMY(b.date, slotStart(b.slot)).getTime()
            ),
        ])
      ),
    [bookings]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training"
        subtitle="Lessons from your agricultural officer to share with members, and the cooperative's shared sprayers"
        actions={
          tab === 'equipment' ? (
            <button type="button" onClick={() => setBookFor('')} className={PRIMARY_BUTTON}>
              <Plus className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>
          ) : undefined
        }
      />

      <SegmentedTabs<TrainingTab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'materials', label: 'Lessons', count: materials.length },
          { id: 'equipment', label: 'Shared equipment', count: COOP_EQUIPMENT.length },
        ]}
      />

      {tab === 'materials' && (
        <div className="space-y-4">
          {materials.length === 0 && <EmptyState icon={Eye} text="No lessons yet. Your agricultural officer adds them." />}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {materials.map((m) => {
              const shared = lastShare(m.id);
              const Icon = FORMAT_ICON[m.format];
              return (
                <div key={m.id} className={`${CARD_CLASS} p-3 flex flex-col gap-3`}>
                  <MaterialThumb material={m} />
                  <div className="px-1 space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <NeutralChip>
                        <Icon className="w-3 h-3" strokeWidth={1.5} />
                        {m.format}
                      </NeutralChip>
                      <span className="text-[12px] text-[#5B665E]">
                        {m.language} · {m.length}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-semibold text-[#17271D] leading-snug">{m.title}</h3>
                    <p className="text-[12.5px] text-[#5B665E] leading-snug">{m.summary}</p>
                    {shared && (
                      <p className="text-[11.5px] text-[#1F4A34] font-medium">
                        Shared with {shared.audience === 'all' ? 'all members' : shared.audience.map((id) => groupRecords.find((g) => g.id === id)?.name).filter(Boolean).join(', ')} ·{' '}
                        {formatDayShort(shared.sharedOn)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-1 pb-1">
                    <button type="button" onClick={() => setPreview(m)} className={`${SECONDARY_BUTTON} flex-1`}>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button type="button" onClick={() => onShareMaterial(m)} className={`${PRIMARY_BUTTON} flex-1`}>
                      <Send className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'equipment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {COOP_EQUIPMENT.map((e) => {
            const list = upcomingByEquipment.get(e.id) || [];
            return (
              <div key={e.id} className={`${CARD_CLASS} p-5 flex flex-col gap-4`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconCircle icon={SprayCan} />
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#17271D]">{e.name}</h3>
                      <p className="text-[12px] text-[#5B665E]">{e.kind}</p>
                    </div>
                  </div>
                  <NeutralChip tone="outline">
                    {list.length} {list.length === 1 ? 'booking' : 'bookings'}
                  </NeutralChip>
                </div>

                {list.length === 0 ? (
                  <EmptyState icon={CalendarDays} text="No bookings yet." />
                ) : (
                  <div className="divide-y divide-[rgba(31,74,52,0.06)] flex-1">
                    {list.map((b) => (
                      <div key={b.id} className="py-2.5 first:pt-0 flex items-center justify-between gap-3 text-[12.5px]">
                        <div>
                          <span className="block font-semibold text-[#17271D] tabular-nums">
                            {formatDayShort(b.date)} · {b.slot}
                          </span>
                          <span className="block text-[12px] text-[#5B665E]">
                            {bookedForLabel(b, members, groupRecords)}
                          </span>
                        </div>
                        {b.isDemo && <NeutralChip>New</NeutralChip>}
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" onClick={() => setBookFor(e.id)} className={SECONDARY_BUTTON}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book {e.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview */}
      <CoopModal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.title || ''}
        subtitle={preview ? `${preview.format} · ${preview.language} · ${preview.length}` : ''}
        icon={preview ? FORMAT_ICON[preview.format] : Eye}
        footer={
          <>
            <button type="button" onClick={() => setPreview(null)} className={SECONDARY_BUTTON}>
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                if (preview) onShareMaterial(preview);
                setPreview(null);
              }}
              className={PRIMARY_BUTTON}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share with members</span>
            </button>
          </>
        }
      >
        {preview && <LessonBody material={preview} />}
      </CoopModal>

      <BookEquipmentModal
        isOpen={bookFor !== null}
        onClose={() => setBookFor(null)}
        initialEquipmentId={bookFor || undefined}
        bookings={bookings}
        members={members}
        groupRecords={groupRecords}
        onBook={(booking) => {
          onBook(booking);
          setBookFor(null);
        }}
      />
    </div>
  );
};

/** Photo from the media manifest, with a tint + icon fallback until the file exists. */
