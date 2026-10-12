import React, { useState } from 'react';
import { CalendarDays, Check, Clock, MapPin, Pencil, SprayCan, Sprout, Users } from 'lucide-react';
import { CoopGroupRecord, CoopMeeting, EquipmentBooking } from '../types';
import {
  MUSANZE_SEASON_CALENDAR_MONTHS,
  CROP_GROWTH_MODEL_LABEL,
  FarmerCropPhase,
  NOW,
  COOP_EQUIPMENT,
  COOPERATIVE_DATA,
  NOW_DATE,
  formatDayShort,
  meetingAudienceLabel,
  parseDMY,
  slotStart,
} from '../data/musanzeData';
import { DatePicker } from './DatePicker';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON } from './coop/CoopUi';

interface CropCalendarViewProps {
  /** Upcoming meetings for the farmer's cooperative group (shared by the cooperative leader). */
  cooperativeMeetings?: CoopMeeting[];
  /** Sprayer bookings for the farmer or their group. */
  cooperativeBookings?: EquipmentBooking[];
  memberName?: string;
  groupName?: string;
  groupRecords?: CoopGroupRecord[];
  /** The farmer's crops with their planting dates and the crop growth model's stage. */
  cropPhases: FarmerCropPhase[];
  onSavePlanting: (crop: string, plantedDate: string) => void;
}

export const CropCalendarView: React.FC<CropCalendarViewProps> = ({
  cooperativeMeetings = [],
  cooperativeBookings = [],
  memberName,
  groupName,
  groupRecords = [],
  cropPhases,
  onSavePlanting,
}) => {
  // Planting date being entered or changed: crop + picked date
  const [plantingEdit, setPlantingEdit] = useState<{ crop: string; date: string } | null>(null);

  const upcomingBookings = cooperativeBookings
    .filter((b) => parseDMY(b.date, b.slot.split('–')[1]).getTime() > NOW_DATE.getTime())
    .sort((a, b) => parseDMY(a.date, slotStart(a.slot)).getTime() - parseDMY(b.date, slotStart(b.slot)).getTime());
  const events = [
    ...cooperativeMeetings.map((m) => ({
      id: m.id,
      at: parseDMY(m.date, m.time).getTime(),
      date: m.date,
      icon: Users,
      title: m.title,
      line1: `${m.time} · ${m.place}`,
      line2: `Meeting for ${meetingAudienceLabel(m, groupRecords).replace('All members', 'all members')}`,
    })),
    ...upcomingBookings.map((b) => ({
      id: b.id,
      at: parseDMY(b.date, slotStart(b.slot)).getTime(),
      date: b.date,
      icon: SprayCan,
      title: `${COOP_EQUIPMENT.find((e) => e.id === b.equipmentId)?.name} booked`,
      line1: b.slot,
      line2: b.bookedFor.type === 'member' ? 'Booked for you' : `Booked for ${groupName}`,
    })),
  ].sort((a, b) => a.at - b.at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[24px] font-semibold text-[#17271D]">Crop calendar</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-medium border border-[rgba(31,74,52,0.10)]">
            Musanze District · Season 2026/27 A
          </span>
        </div>
        <p className="text-[13px] text-[#5B665E] mt-1">
          Seasonal agronomic schedule aligned with active potato, bean, and maize planting dates.
        </p>
      </div>

      {/* 6 Month Cards Row: Sep, Oct, Nov, Dec, Jan, Feb (September highlighted) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {MUSANZE_SEASON_CALENDAR_MONTHS.map((item) => {
          const isCurrent = item.isCurrent;
          return (
            <div
              key={item.id}
              className={`rounded-[16px] p-4 flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-[#FBFCF8] border-2 border-[#1F4A34] shadow-[0_4px_16px_rgba(31,74,52,0.12)] ring-1 ring-[#1F4A34]'
                  : 'bg-[#FBFCF8] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]'
              }`}
            >
              <div>
                {/* Month title */}
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(31,74,52,0.06)] mb-3">
                  <span
                    className={`text-[16px] font-semibold ${
                      isCurrent ? 'text-[#1F4A34]' : 'text-[#17271D]'
                    }`}
                  >
                    {item.shortMonth}
                  </span>
                  <span className="text-[11px] text-[#5B665E]">{item.year}</span>
                </div>

                {/* Activity title following CROP RECORD */}
                <h4 className="text-[13px] font-semibold text-[#17271D] leading-snug mb-1">
                  {item.activityTitle}
                </h4>
                <p className="text-[11px] text-[#5B665E] mb-3">
                  {item.crops}
                </p>

                {/* Moisture line kept, Favorable days removed */}
                <div className="text-[11px] text-[#5B665E] bg-[#F4F6EF]/60 p-2.5 rounded-xl border border-[rgba(31,74,52,0.06)]">
                  <span className="text-[#5B665E]">Moisture: </span>
                  <span
                    className={`font-medium ${
                      isCurrent ? 'text-[#D9A032] font-semibold' : 'text-[#17271D]'
                    }`}
                  >
                    {item.moistureStatus}
                  </span>
                </div>
              </div>

              {/* Action Advice note */}
              <div className="mt-3 pt-2.5 border-t border-[rgba(31,74,52,0.06)] text-[11px] text-[#5B665E] leading-tight">
                {item.actionAdvice}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cooperative events: meetings and sprayer bookings shared by the cooperative */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(31,74,52,0.06)] mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
            <h3 className="text-[16px] font-semibold text-[#17271D]">Cooperative events</h3>
          </div>
          {memberName && groupName && (
            <span className="text-[12px] text-[#5B665E]">
              {COOPERATIVE_DATA.cooperativeName} · {groupName}
            </span>
          )}
        </div>
        {!memberName ? (
          <p className="text-[13px] text-[#5B665E] py-4 text-center">You are not in a cooperative group yet.</p>
        ) : events.length === 0 ? (
          <p className="text-[13px] text-[#5B665E] py-4 text-center">No cooperative events coming up.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {events.map((e) => {
              const Icon = e.icon;
              return (
                <div key={e.id} className="p-3.5 bg-[#F4F6EF]/60 rounded-xl border border-[rgba(31,74,52,0.06)] flex items-start gap-3">
                  <div className="w-12 flex-shrink-0 rounded-xl bg-[#E4ECDB] border border-[rgba(31,74,52,0.10)] text-center py-1.5">
                    <span className="block text-[11px] text-[#1F4A34]">{formatDayShort(e.date).slice(0, 3)}</span>
                    <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums leading-tight">
                      {e.date.slice(0, 5)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#17271D]">
                      <Icon className="w-3.5 h-3.5 text-[#1F4A34] flex-shrink-0" strokeWidth={1.5} />
                      {e.title}
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-[#5B665E] mt-0.5">
                      {e.icon === Users ? <MapPin className="w-3 h-3" strokeWidth={1.5} /> : <Clock className="w-3 h-3" strokeWidth={1.5} />}
                      {e.line1}
                    </span>
                    <span className="block text-[12px] text-[#5B665E]">{e.line2}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Crop phases: planting dates from the farmer, stages from the crop growth model */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(31,74,52,0.06)] mb-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
            <h3 className="text-[16px] font-semibold text-[#17271D]">Crop phases</h3>
          </div>
          <span className="text-[12px] text-[#5B665E]">{CROP_GROWTH_MODEL_LABEL} · from your planting dates</span>
        </div>

        {cropPhases.length === 0 ? (
          <p className="text-[13px] text-[#5B665E] py-4 text-center">Add the crops you grow in Settings to see their phases.</p>
        ) : (
          <div className="space-y-4">
            {cropPhases.map(({ crop, planting, phase, nextTodo }) => (
              <div key={crop} className="p-4 bg-[#F4F6EF]/60 rounded-xl border border-[rgba(31,74,52,0.06)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[14px] font-semibold text-[#17271D]">{crop}</span>
                    {phase && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-medium border border-[rgba(31,74,52,0.12)]">
                        {phase.day >= 0 ? `${phase.stage} · day ${phase.day}` : `Planting in ${-phase.day} days`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    {planting && <span className="text-[#5B665E] tabular-nums">Planted {formatDayShort(planting.plantedDate)}</span>}
                    <button
                      type="button"
                      onClick={() => setPlantingEdit({ crop, date: planting?.plantedDate || '' })}
                      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[12px] font-medium text-[#1F4A34] hover:bg-[#E4ECDB] cursor-pointer"
                    >
                      {planting ? <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} /> : <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.75} />}
                      <span>{planting ? 'Change date' : 'Add planting date'}</span>
                    </button>
                  </div>
                </div>

                {!planting ? (
                  <p className="text-[12px] text-[#5B665E]">Add the day you planted to see this crop's phases.</p>
                ) : !phase ? (
                  <p className="text-[12px] text-[#5B665E]">No growth model for this crop yet.</p>
                ) : (
                  <>
                    {/* Stage steps */}
                    <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {phase.stages.map((st) => (
                        <li
                          key={st.name}
                          className={`px-2.5 py-2 rounded-xl border text-[11.5px] ${
                            st.status === 'now'
                              ? 'bg-white border-[#1F4A34] text-[#17271D]'
                              : 'bg-[#FBFCF8] border-[rgba(31,74,52,0.08)] text-[#5B665E]'
                          }`}
                        >
                          <span className="flex items-center gap-1 font-semibold">
                            {st.status === 'done' && <Check className="w-3 h-3 text-[#3E8E55]" strokeWidth={2} />}
                            {st.name}
                          </span>
                          <span className="block tabular-nums">
                            {st.status === 'now' ? 'Now' : st.status === 'done' ? 'Done' : `From ${formatDayShort(st.startDate)}`}
                          </span>
                        </li>
                      ))}
                    </ol>

                    <p className="text-[12px] text-[#5B665E]">
                      {phase.nextStage && (
                        <>
                          Next: <span className="text-[#17271D] font-medium">{phase.nextStage.name}</span> from{' '}
                          {formatDayShort(phase.nextStage.date)} ·{' '}
                        </>
                      )}
                      {phase.isHarvestTime ? 'Harvest now: ' : 'Harvest: '}
                      <span className="font-medium text-[#17271D] tabular-nums">
                        {formatDayShort(phase.harvestFrom)} – {formatDayShort(phase.harvestTo)}
                      </span>
                    </p>
                    {nextTodo && (
                      <p className="text-[12px] text-[#5B665E]">
                        From your officer: <span className="text-[#17271D] font-medium">{nextTodo}</span>
                      </p>
                    )}

                    {/* Season progress: planting to first harvest day */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
                        <div className="h-full bg-[#3E8E55] rounded-full transition-all duration-500" style={{ width: `${phase.progressPct}%` }} />
                      </div>
                      <span className="text-[12px] font-semibold text-[#1F4A34] tabular-nums">{phase.progressPct}% to harvest</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CoopModal
        isOpen={!!plantingEdit}
        onClose={() => setPlantingEdit(null)}
        title={plantingEdit ? `${plantingEdit.crop} planting date` : ''}
        subtitle="The day you planted. Phases and harvest are counted from it."
        icon={CalendarDays}
        footer={
          <>
            <button type="button" onClick={() => setPlantingEdit(null)} className={SECONDARY_BUTTON}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!plantingEdit?.date}
              onClick={() => {
                if (plantingEdit?.date) onSavePlanting(plantingEdit.crop, plantingEdit.date);
                setPlantingEdit(null);
              }}
              className={PRIMARY_BUTTON}
            >
              Save date
            </button>
          </>
        }
      >
        {plantingEdit && (
          <DatePicker
            label="Planted on"
            value={plantingEdit.date}
            maxDate={NOW.dateFormatted}
            onChange={(date) => setPlantingEdit({ ...plantingEdit, date })}
          />
        )}
      </CoopModal>
    </div>
  );
};
