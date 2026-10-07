import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquare,
  SprayCan,
  Sprout,
  Users,
} from 'lucide-react';
import { CoopGroupRecord, CoopMeeting, CoopMember, EquipmentBooking } from '../types';
import {
  COOP_CROP_WINDOWS,
  COOP_EQUIPMENT,
  MONTH_NAMES,
  NOW_DATE,
  bookedForLabel,
  formatDMY,
  formatDayShort,
  meetingAudienceLabel,
  meetingInviteeCount,
  parseDMY,
  slotStart,
  sortMeetings,
} from '../data/musanzeData';
import { CARD_CLASS, EmptyState, NeutralChip, PageHeader, PRIMARY_BUTTON } from './coop/CoopUi';

type CalendarItem =
  | { kind: 'meeting'; key: string; time: string; label: string; meta: string }
  | { kind: 'booking'; key: string; time: string; label: string; meta: string }
  | { kind: 'crop'; key: string; time: string; label: string; meta: string };

const KIND_STYLE: Record<CalendarItem['kind'], string> = {
  meeting: 'bg-[#1F4A34] text-white',
  booking: 'bg-[#E4ECDB] text-[#1F4A34]',
  crop: 'bg-white text-[#17271D] border border-[rgba(31,74,52,0.22)]',
};
const KIND_ICON = { meeting: Users, booking: SprayCan, crop: Sprout };
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CooperativeMeetingsViewProps {
  meetings: CoopMeeting[];
  bookings: EquipmentBooking[];
  members: CoopMember[];
  groupRecords: CoopGroupRecord[];
  onScheduleMeeting: () => void;
}

export const CooperativeMeetingsView: React.FC<CooperativeMeetingsViewProps> = ({
  meetings,
  bookings,
  members,
  groupRecords,
  onScheduleMeeting,
}) => {
  const [viewYear, setViewYear] = useState(NOW_DATE.getFullYear());
  const [viewMonth, setViewMonth] = useState(NOW_DATE.getMonth());
  const [selectedDay, setSelectedDay] = useState(formatDMY(NOW_DATE));
  const todayDMY = formatDMY(NOW_DATE);

  /** Everything on the shared calendar, by DD/MM/YYYY. */
  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    const add = (date: string, item: CalendarItem) => map.set(date, [...(map.get(date) || []), item]);
    meetings.forEach((m) =>
      add(m.date, {
        kind: 'meeting',
        key: m.id,
        time: m.time,
        label: m.title,
        meta: `${m.time} · ${m.place} · ${meetingAudienceLabel(m, groupRecords)}`,
      })
    );
    bookings.forEach((b) => {
      const eq = COOP_EQUIPMENT.find((e) => e.id === b.equipmentId);
      add(b.date, {
        kind: 'booking',
        key: b.id,
        time: slotStart(b.slot),
        label: `${eq?.name} booked`,
        meta: `${b.slot} · ${bookedForLabel(b, members, groupRecords)}`,
      });
    });
    COOP_CROP_WINDOWS.forEach((w) =>
      add(w.date, { kind: 'crop', key: w.id, time: w.time || '00:00', label: w.title, meta: w.time ? `${w.time} · ${w.note}` : w.note })
    );
    map.forEach((items, key) => map.set(key, [...items].sort((a, b) => a.time.localeCompare(b.time))));
    return map;
  }, [meetings, bookings, members, groupRecords]);

  const upcoming = useMemo(
    () => sortMeetings(meetings).filter((m) => parseDMY(m.date, m.time).getTime() >= NOW_DATE.getTime()),
    [meetings]
  );

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => formatDMY(new Date(viewYear, viewMonth, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const selectedItems = itemsByDay.get(selectedDay) || [];
  const monthItemCount = cells.reduce((sum, c) => sum + (c ? (itemsByDay.get(c)?.length ?? 0) : 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        subtitle="Shared calendar for meetings, sprayer bookings and crop dates"
        actions={
          <button type="button" onClick={onScheduleMeeting} className={PRIMARY_BUTTON}>
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Schedule meeting</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Month calendar */}
        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-8 space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="w-8 h-8 rounded-full border border-[rgba(31,74,52,0.12)] bg-white flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <h3 className="text-[16px] font-semibold text-[#17271D] min-w-[150px] text-center">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="w-8 h-8 rounded-full border border-[rgba(31,74,52,0.12)] bg-white flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#5B665E]">
              {(['meeting', 'booking', 'crop'] as const).map((k) => {
                const Icon = KIND_ICON[k];
                return (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${KIND_STYLE[k]}`}>
                      <Icon className="w-3 h-3" strokeWidth={1.5} />
                    </span>
                    {k === 'meeting' ? 'Meeting' : k === 'booking' ? 'Sprayer booking' : 'Crop date'}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-[12px] font-medium text-[#5B665E] text-center py-1">
                {d}
              </span>
            ))}
            {cells.map((dmy, idx) => {
              if (!dmy) return <div key={`blank-${idx}`} className="min-h-[88px]" />;
              const items = itemsByDay.get(dmy) || [];
              const isToday = dmy === todayDMY;
              const isSelected = dmy === selectedDay;
              return (
                <button
                  key={dmy}
                  type="button"
                  onClick={() => setSelectedDay(dmy)}
                  aria-label={`${dmy}, ${items.length} items`}
                  aria-pressed={isSelected}
                  className={`min-h-[88px] p-1.5 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-[#1F4A34] ring-1 ring-[#1F4A34] bg-white'
                      : 'border-[rgba(31,74,52,0.08)] bg-white/60 hover:bg-white'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] tabular-nums ${
                      isToday ? 'bg-[#1F4A34] text-white font-semibold' : 'text-[#17271D]'
                    }`}
                  >
                    {parseDMY(dmy).getDate()}
                  </span>
                  {items.slice(0, 2).map((item) => (
                    <span
                      key={item.key}
                      className={`block w-full px-1.5 py-0.5 rounded-md text-[11px] leading-tight break-words ${KIND_STYLE[item.kind]}`}
                      title={`${item.label} · ${item.meta}`}
                    >
                      {item.label}
                    </span>
                  ))}
                  {items.length > 2 && (
                    <span className="text-[11px] text-[#5B665E] px-1">+{items.length - 2} more</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[12px] text-[#5B665E] tabular-nums">
            {monthItemCount} items in {MONTH_NAMES[viewMonth]}
          </p>
        </div>

        {/* Right column: selected day + upcoming meetings */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`${CARD_CLASS} p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#17271D]">{formatDayShort(selectedDay)}</h3>
              {selectedDay === todayDMY && <NeutralChip>Today</NeutralChip>}
            </div>
            {selectedItems.length === 0 ? (
              <EmptyState icon={CalendarDays} text="Nothing planned on this day." />
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item) => {
                  const Icon = KIND_ICON[item.kind];
                  return (
                    <div key={item.key} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.06)]">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${KIND_STYLE[item.kind]}`}>
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[13px] font-semibold text-[#17271D]">{item.label}</span>
                        <span className="block text-[12px] text-[#5B665E]">{item.meta}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`${CARD_CLASS} p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#17271D]">Upcoming meetings</h3>
              <span className="text-[12px] text-[#5B665E] tabular-nums">{upcoming.length}</span>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={Users}
                text="No meetings planned."
                action={
                  <button type="button" onClick={onScheduleMeeting} className={PRIMARY_BUTTON}>
                    Schedule meeting
                  </button>
                }
              />
            ) : (
              <div className="divide-y divide-[rgba(31,74,52,0.06)]">
                {upcoming.map((m) => {
                  const d = parseDMY(m.date);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setViewYear(d.getFullYear());
                        setViewMonth(d.getMonth());
                        setSelectedDay(m.date);
                      }}
                      className="w-full text-left py-3 first:pt-0 last:pb-0 flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-12 flex-shrink-0 rounded-xl bg-[#E4ECDB] border border-[rgba(31,74,52,0.10)] text-center py-1.5">
                        <span className="block text-[11px] text-[#1F4A34]">{formatDayShort(m.date).slice(0, 3)}</span>
                        <span className="block text-[16px] font-semibold text-[#17271D] tabular-nums leading-tight">
                          {m.date.slice(0, 5)}
                        </span>
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <span className="block text-[13px] font-semibold text-[#17271D] group-hover:text-[#1F4A34]">{m.title}</span>
                        <span className="flex items-center gap-1 text-[12px] text-[#5B665E]">
                          <Clock className="w-3 h-3" strokeWidth={1.5} /> {m.time}
                          <MapPin className="w-3 h-3 ml-1" strokeWidth={1.5} /> {m.place}
                        </span>
                        <span className="flex flex-wrap items-center gap-1.5 pt-1">
                          <NeutralChip>
                            {meetingAudienceLabel(m, groupRecords)} · {meetingInviteeCount(m, members)}
                          </NeutralChip>
                          {m.smsInvite && (
                            <NeutralChip tone="outline">
                              <MessageSquare className="w-3 h-3" strokeWidth={1.5} /> SMS invitation
                            </NeutralChip>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
