import React from 'react';
import { Calendar, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { MUSANZE_SEASON_CALENDAR } from '../data/musanzeData';

interface SeasonalCalendarCardProps {
  onViewFullCalendar?: () => void;
}

export const SeasonalCalendarCard: React.FC<SeasonalCalendarCardProps> = ({
  onViewFullCalendar,
}) => {
  return (
    <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(31,74,52,0.06)]">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-[#17271D]">Seasonal Calendar</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10px] font-medium">
              Season 26/27 A
            </span>
          </div>
          <button
            onClick={onViewFullCalendar}
            className="text-[12px] font-medium text-[#1F4A34] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View full calendar</span>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Current Month & Timeline Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[13px] mb-2">
            <span className="font-semibold text-[#17271D] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
              <span>Current Month: {MUSANZE_SEASON_CALENDAR.currentMonth}</span>
            </span>
            <span className="text-[11px] font-medium text-[#3E8E55] bg-[#E4ECDB] px-2 py-0.5 rounded-full">
              Day {MUSANZE_SEASON_CALENDAR.currentDay}
            </span>
          </div>

          {/* Dual Window Horizontal Bar */}
          <div className="space-y-2 mt-3 bg-[#F4F6EF] p-3 rounded-xl border border-[rgba(31,74,52,0.06)]">
            {/* Planting Window */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-[#17271D] mb-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#3E8E55]" />
                  <span>{MUSANZE_SEASON_CALENDAR.plantingWindow.label}: {MUSANZE_SEASON_CALENDAR.plantingWindow.dates}</span>
                </span>
                <span className="text-[#3E8E55] font-semibold">
                  {MUSANZE_SEASON_CALENDAR.plantingWindow.status} ({MUSANZE_SEASON_CALENDAR.plantingWindow.progress}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#FBFCF8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3E8E55] rounded-full"
                  style={{ width: `${MUSANZE_SEASON_CALENDAR.plantingWindow.progress}%` }}
                />
              </div>
            </div>

            {/* Harvest Window */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#5B665E] mb-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#5B665E]/40" />
                  <span>{MUSANZE_SEASON_CALENDAR.harvestWindow.label}: {MUSANZE_SEASON_CALENDAR.harvestWindow.dates}</span>
                </span>
                <span className="text-[10px]">{MUSANZE_SEASON_CALENDAR.harvestWindow.status}</span>
              </div>
              <div className="w-full h-2 bg-[#FBFCF8] rounded-full overflow-hidden">
                <div className="h-full bg-[#1F4A34]/20 rounded-full w-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Phase List Preview */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#5B665E] block">
            Musanze agronomic milestones
          </span>
          <div className="space-y-1.5">
            {MUSANZE_SEASON_CALENDAR.phases.slice(0, 3).map((phase, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[12px] py-1 border-b border-[rgba(31,74,52,0.04)] last:border-0"
              >
                <div className="flex items-center gap-2">
                  {phase.status.includes('Completed') ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3E8E55]" strokeWidth={1.5} />
                  ) : phase.status.includes('Active') ? (
                    <Clock className="w-3.5 h-3.5 text-[#D9A032]" strokeWidth={1.5} />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-[#5B665E]/40 inline-block" />
                  )}
                  <span
                    className={
                      phase.status.includes('Active')
                        ? 'font-semibold text-[#17271D]'
                        : 'text-[#5B665E]'
                    }
                  >
                    {phase.name}
                  </span>
                </div>
                <span className="text-[11px] text-[#5B665E]">{phase.dates}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer advice note */}
      <div className="pt-3 border-t border-[rgba(31,74,52,0.06)] mt-3 text-[11px] text-[#5B665E]">
        <span>Optimal moisture for climbing bean germination this week</span>
      </div>
    </div>
  );
};
