import React from 'react';
import { Sprout } from 'lucide-react';
import { MUSANZE_SEASON_CALENDAR_MONTHS, CROP_RECORD } from '../data/musanzeData';

export const CropCalendarView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[24px] font-semibold text-[#17271D]">Crop Calendar</h1>
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

      {/* Crop Phases Section restored below cards */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.06)] mb-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
            <h3 className="text-[16px] font-semibold text-[#17271D]">Crop phases</h3>
          </div>
          <span className="text-[12px] text-[#5B665E]">Season 2026/27 A Progress</span>
        </div>

        {/* One row per crop with name, current stage chip, one-line next action, and progress bar */}
        <div className="space-y-4">
          {CROP_RECORD.map((crop) => (
            <div
              key={crop.id}
              className="p-4 bg-[#F4F6EF]/60 rounded-xl border border-[rgba(31,74,52,0.06)] space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px] font-semibold text-[#17271D]">
                    {crop.crop}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-medium border border-[rgba(31,74,52,0.12)]">
                    {crop.currentStage}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-[#5B665E]">Planted {crop.plantedDate}</span>
                  <span>·</span>
                  <span className="font-semibold text-[#1F4A34]">
                    {crop.seasonProgressPercent}% of season elapsed
                  </span>
                </div>
              </div>

              {/* One-line next action */}
              <p className="text-[12px] text-[#5B665E]">
                Next action: <span className="text-[#17271D] font-medium">{crop.nextAction}</span> · Harvest expected: <span className="font-medium text-[#17271D]">{crop.harvestWindow}</span>
              </p>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
                <div
                  className="h-full bg-[#3E8E55] rounded-full transition-all duration-500"
                  style={{ width: `${crop.seasonProgressPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
