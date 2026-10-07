import React, { useEffect, useState } from 'react';
import { AlertCircle, Info, SprayCan } from 'lucide-react';
import { CoopGroupRecord, CoopMember, EquipmentBooking } from '../../types';
import {
  BOOKING_SLOTS,
  COOP_CROP_WINDOWS,
  COOP_EQUIPMENT,
  NOW_DATE,
  bookedForLabel,
  findBookingConflict,
  formatDMY,
  formatDayShort,
  isSlotInPast,
  parseDMY,
  slotStart,
} from '../../data/musanzeData';
import { DatePicker } from '../DatePicker';
import { PillSelect } from '../PillSelect';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON, SegmentedTabs } from './CoopUi';

const SPRAY_WINDOW = COOP_CROP_WINDOWS.find((w) => w.id === 'cw-spray-window')!;

export const BookEquipmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialEquipmentId?: string;
  bookings: EquipmentBooking[];
  members: CoopMember[];
  groupRecords: CoopGroupRecord[];
  onBook: (booking: EquipmentBooking) => void;
}> = ({ isOpen, onClose, initialEquipmentId, bookings, members, groupRecords, onBook }) => {
  const [equipmentId, setEquipmentId] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [forType, setForType] = useState<'group' | 'member'>('group');
  const [forId, setForId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEquipmentId(initialEquipmentId || COOP_EQUIPMENT[0].id);
      setDate('');
      setSlot('');
      setForType('group');
      setForId('');
    }
  }, [isOpen, initialEquipmentId]);

  const conflict = equipmentId && date && slot ? findBookingConflict(bookings, equipmentId, date, slot) : undefined;
  const isPast = !!date && !!slot && isSlotInPast(date, slot);
  const beforeSprayWindow =
    !!date && !!slot && parseDMY(date, slotStart(slot)).getTime() < parseDMY(SPRAY_WINDOW.date, SPRAY_WINDOW.time).getTime();
  const freeSprayers =
    date && slot ? COOP_EQUIPMENT.filter((e) => !findBookingConflict(bookings, e.id, date, slot)) : [];
  const equipmentName = COOP_EQUIPMENT.find((e) => e.id === equipmentId)?.name;
  const canSave = !!equipmentId && !!date && !!slot && !!forId && !conflict && !isPast;

  return (
    <CoopModal
      isOpen={isOpen}
      onClose={onClose}
      title="Book a sprayer"
      subtitle="One booking per sprayer and time slot"
      icon={SprayCan}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onBook({
                id: `bk-demo-${Date.now()}`,
                equipmentId,
                date,
                slot,
                bookedFor: { type: forType, id: forId },
                isDemo: true,
              })
            }
            className={PRIMARY_BUTTON}
          >
            Book sprayer
          </button>
        </>
      }
    >
      <PillSelect
        label="Sprayer"
        value={equipmentId}
        onChange={setEquipmentId}
        options={COOP_EQUIPMENT.map((e) => ({ value: e.id, label: e.name, hint: e.kind }))}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DatePicker label="Date" value={date} onChange={setDate} minDate={formatDMY(NOW_DATE)} />
        <PillSelect
          label="Time slot"
          value={slot}
          onChange={setSlot}
          placeholder="Choose a slot"
          options={BOOKING_SLOTS.map((s) => {
            const taken = date && equipmentId ? findBookingConflict(bookings, equipmentId, date, s) : undefined;
            const past = !!date && isSlotInPast(date, s);
            return {
              value: s,
              label: s,
              hint: past ? 'Already passed' : taken ? `Booked by ${bookedForLabel(taken, members, groupRecords)}` : 'Free',
            };
          })}
        />
      </div>

      {conflict && (
        <div role="alert" className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#17271D]/40 text-[12.5px] text-[#17271D]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>
            {equipmentName} is already booked for {bookedForLabel(conflict, members, groupRecords)} on{' '}
            {formatDayShort(date)}, {slot}.{' '}
            {freeSprayers.length > 0
              ? `${freeSprayers.map((e) => e.name).join(' and ')} ${freeSprayers.length === 1 ? 'is' : 'are'} free then.`
              : 'All sprayers are booked then. Choose another slot.'}
          </span>
        </div>
      )}
      {isPast && !conflict && (
        <p className="text-[12.5px] text-[#17271D]">This slot has already started. Choose a later one.</p>
      )}
      {beforeSprayWindow && !isPast && !conflict && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] text-[12.5px] text-[#17271D]">
          <Info className="w-4 h-4 text-[#1F4A34] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>Rain until {formatDayShort(SPRAY_WINDOW.date)} {SPRAY_WINDOW.time}. Spray after that, or it washes off.</span>
        </div>
      )}

      <div>
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Booked for</span>
        <SegmentedTabs<'group' | 'member'>
          value={forType}
          onChange={(v) => {
            setForType(v);
            setForId('');
          }}
          tabs={[
            { id: 'group', label: 'Group' },
            { id: 'member', label: 'Member' },
          ]}
        />
        <PillSelect
          className="mt-2"
          value={forId}
          onChange={setForId}
          searchable={forType === 'member'}
          placeholder={forType === 'group' ? 'Choose a group' : 'Choose a member'}
          options={
            forType === 'group'
              ? groupRecords.map((g) => ({ value: g.id, label: g.name }))
              : members.map((m) => ({
                  value: m.id,
                  label: m.fullName,
                  hint: `${groupRecords.find((g) => g.id === m.groupId)?.name} · ${m.cell}`,
                }))
          }
        />
      </div>
    </CoopModal>
  );
};
