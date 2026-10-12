import React from 'react';
import { Calendar, ChevronRight, CheckCircle2, CircleDot } from 'lucide-react';
import {
  FarmerCropPhase,
  MONTH_NAMES,
  MUSANZE_SEASON_CALENDAR,
  NOW_DATE,
  formatDayMonthRange,
  seasonPhaseStatus,
  windowProgress,
} from '../data/musanzeData';

interface SeasonalCalendarCardProps {
  onViewFullCalendar?: () => void;
  /** The farmer's crops with the crop growth model's stage (footer line). */
  cropPhases: FarmerCropPhase[];
}

const WINDOW_STATUS = { Done: 'Closed', Now: 'Open', Coming: 'Coming' } as const;

export const SeasonalCalendarCard: React.FC<SeasonalCalendarCardProps> = ({ onViewFullCalendar, cropPhases }) => {
  const cal = MUSANZE_SEASON_CALENDAR;
  const windows = [cal.plantingWindow, cal.harvestWindow].map((w) => ({
    ...w,
    status: seasonPhaseStatus(w.start, w.end),
    progress: windowProgress(w.start, w.end),
  }));
  // The season phase happening now, plus the one before and after it
  const phases = cal.phases.map((p) => ({ ...p, status: seasonPhaseStatus(p.start, p.end) }));
  const nowIdx = Math.max(0, phases.findIndex((p) => p.status !== 'Done'));
  const from = Math.min(Math.max(0, nowIdx - 1), Math.max(0, phases.length - 3));
  const shown = phases.slice(from, from + 3);
  const firstCrop = cropPhases.find((c) => c.phase && c.phase.day >= 0);

  return (
    <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(31,74,52,0.06)]">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-[#17271D]">Seasonal calendar</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10px] font-medium">
              {cal.seasonName}
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

        {/* This month and the two season windows */}
        <div className="mb-4">
          <div className="flex items-center text-[13px] mb-2">
            <span className="font-semibold text-[#17271D] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
              <span>
                {MONTH_NAMES[NOW_DATE.getMonth()]} {NOW_DATE.getFullYear()}
              </span>
            </span>
          </div>

          <div className="space-y-2 mt-3 bg-[#F4F6EF] p-3 rounded-xl border border-[rgba(31,74,52,0.06)]">
            {windows.map((w) => (
              <div key={w.label}>
                <div
                  className={`flex items-center justify-between text-[11px] font-medium mb-1 ${
                    w.status === 'Now' ? 'text-[#17271D]' : 'text-[#5B665E]'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${w.status === 'Now' ? 'bg-[#3E8E55]' : 'bg-[#5B665E]/40'}`} />
                    <span className="tabular-nums">
                      {w.label}: {formatDayMonthRange(w.start, w.end)}
                    </span>
                  </span>
                  <span className={w.status === 'Now' ? 'text-[#3E8E55] font-semibold' : ''}>
                    {WINDOW_STATUS[w.status]}
                    {w.status === 'Now' ? ` (${w.progress}% passed)` : ''}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#FBFCF8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3E8E55] rounded-full" style={{ width: `${w.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Season phases around today */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#5B665E] block">Season phases in Musanze</span>
          <div className="space-y-1.5">
            {shown.map((phase) => (
              <div
                key={phase.name}
                className="flex items-center justify-between text-[12px] py-1 border-b border-[rgba(31,74,52,0.04)] last:border-0"
              >
                <div className="flex items-center gap-2">
                  {phase.status === 'Done' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3E8E55]" strokeWidth={1.5} />
                  ) : phase.status === 'Now' ? (
                    <CircleDot className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.75} />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-[#5B665E]/40 inline-block" />
                  )}
                  <span className={phase.status === 'Now' ? 'font-semibold text-[#17271D]' : 'text-[#5B665E]'}>
                    {phase.name}
                  </span>
                </div>
                <span className="text-[11px] text-[#5B665E] tabular-nums">{formatDayMonthRange(phase.start, phase.end)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: the farmer's first planted crop, from the crop growth model */}
      <div className="pt-3 border-t border-[rgba(31,74,52,0.06)] mt-3 text-[11px] text-[#5B665E]">
        {firstCrop && firstCrop.phase ? (
          <span>
            Your {firstCrop.crop}: <span className="font-medium text-[#17271D]">{firstCrop.phase.stage}</span>, day{' '}
            {firstCrop.phase.day}
            {firstCrop.phase.nextStage ? ` · ${firstCrop.phase.nextStage.name.toLowerCase()} next` : ''}
          </span>
        ) : (
          <span>Add your planting dates in the crop calendar.</span>
        )}
      </div>
    </div>
  );
};
