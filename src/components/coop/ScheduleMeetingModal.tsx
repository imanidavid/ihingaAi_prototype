import React, { useEffect, useState } from 'react';
import { CalendarPlus, Check, MessageSquare } from 'lucide-react';
import { CoopGroupRecord, CoopMeeting, CoopMember } from '../../types';
import { NOW_DATE, formatDMY, meetingInviteeCount, parseDMY } from '../../data/musanzeData';
import { DatePicker } from '../DatePicker';
import { PillSelect } from '../PillSelect';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON, TEXT_INPUT, Toggle } from './CoopUi';

const MEETING_TIMES = Array.from({ length: 23 }, (_, i) => {
  const minutes = 7 * 60 + i * 30; // 07:00 to 18:00
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

export const ScheduleMeetingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  groupRecords: CoopGroupRecord[];
  members: CoopMember[];
  onSchedule: (meeting: CoopMeeting) => void;
}> = ({ isOpen, onClose, groupRecords, members, onSchedule }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [place, setPlace] = useState('');
  const [audience, setAudience] = useState<'all' | string[]>('all');
  const [smsInvite, setSmsInvite] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDate('');
      setTime('14:00');
      setPlace('');
      setAudience('all');
      setSmsInvite(true);
    }
  }, [isOpen]);

  const toggleGroup = (id: string) => {
    const current = audience === 'all' ? [] : audience;
    const next = current.includes(id) ? current.filter((g) => g !== id) : [...current, id];
    setAudience(next.length === 0 || next.length === groupRecords.length ? 'all' : next);
  };

  const draft: CoopMeeting = { id: '', title, date, time, place, audience, smsInvite };
  const invitees = meetingInviteeCount(draft, members);
  const isPast = !!date && parseDMY(date, time).getTime() <= NOW_DATE.getTime();
  const canSave = title.trim() !== '' && place.trim() !== '' && !!date && !isPast && invitees > 0;

  return (
    <CoopModal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule meeting"
      subtitle="Members see it on their crop calendar"
      icon={CalendarPlus}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSchedule({
                ...draft,
                id: `mtg-demo-${Date.now()}`,
                title: title.trim(),
                place: place.trim(),
                isDemo: true,
              })
            }
            className={PRIMARY_BUTTON}
          >
            Schedule meeting
          </button>
        </>
      }
    >
      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spraying plan for Busogo" className={TEXT_INPUT} />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DatePicker label="Date" value={date} onChange={setDate} minDate={formatDMY(NOW_DATE)} />
        <PillSelect label="Time" value={time} onChange={setTime} options={MEETING_TIMES.map((t) => ({ value: t, label: t }))} />
      </div>
      {isPast && <p className="text-[12px] text-[#17271D]">This time has already passed. Choose a later time.</p>}

      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Place</span>
        <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Busogo sector office" className={TEXT_INPUT} />
      </label>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-[#17271D]">Groups</span>
          <span className="text-[12px] text-[#5B665E] tabular-nums">{invitees} members invited</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ id: 'all', name: 'All members' }, ...groupRecords].map((g) => {
            const isSelected = g.id === 'all' ? audience === 'all' : audience !== 'all' && audience.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => (g.id === 'all' ? setAudience('all') : toggleGroup(g.id))}
                className={`px-3 h-9 rounded-full text-[12.5px] font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                    : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.06)]">
        <div className="flex items-start gap-2.5 pr-4">
          <MessageSquare className="w-4 h-4 text-[#1F4A34] mt-0.5" strokeWidth={1.5} />
          <div>
            <span className="block text-[13px] font-medium text-[#17271D]">Send SMS invitation</span>
            <span className="block text-[12px] text-[#5B665E]">Invited members also get an SMS, in Kinyarwanda.</span>
          </div>
        </div>
        <Toggle checked={smsInvite} onChange={setSmsInvite} label="Send SMS invitation" />
      </div>
    </CoopModal>
  );
};
