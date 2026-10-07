import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { CropAdvisory } from '../types';
import { CROP_ADVISORIES_DATA as CROP_ADVISORIES } from '../data/musanzeData';

interface CropAdvisoriesSectionProps {
  onSelectAdvisory: (advisory: CropAdvisory) => void;
  onViewAll?: () => void;
}

export const CropAdvisoriesSection: React.FC<CropAdvisoriesSectionProps> = ({
  onSelectAdvisory,
  onViewAll,
}) => {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[#17271D]">Crop Advisories</h2>
          <p className="text-[12px] text-[#5B665E]">
            Hyperlocal action windows based on Tuesday rain forecast
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-[12px] font-medium text-[#1F4A34] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* 3 Photo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CROP_ADVISORIES.map((advisory) => (
          <div
            key={advisory.id}
            onClick={() => onSelectAdvisory(advisory)}
            className="bg-[#FBFCF8] rounded-[16px] p-3.5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between hover:border-[rgba(31,74,52,0.22)] transition-all group cursor-pointer"
          >
            <div>
              {/* Photo Inset Top with 12px radius */}
              <div className="relative w-full h-[150px] rounded-[12px] overflow-hidden mb-3.5 bg-[#E4ECDB]/40">
                <img
                  src={advisory.image}
                  alt={advisory.crop}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                {/* Soft gradient overlay at bottom of photo for chip contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Cream chip over photo bottom-left */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#FBFCF8]/95 backdrop-blur-xs text-[11px] font-medium text-[#17271D] border border-[rgba(31,74,52,0.12)] shadow-xs">
                  {advisory.badgeLabel}
                </div>
              </div>

              {/* Title row with circular 32px dark green arrow button */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-[15px] font-semibold text-[#17271D] group-hover:text-[#1F4A34] transition-colors leading-snug">
                  {advisory.title}
                </h3>
                <button
                  type="button"
                  aria-label="Open detail"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAdvisory(advisory);
                  }}
                  className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] transition-colors flex-shrink-0 shadow-xs group-hover:scale-105"
                >
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              {/* One line advice */}
              <p className="text-[12px] text-[#5B665E] leading-relaxed mb-3">
                {advisory.oneLineAdvice}
              </p>

              {/* Two Stats: value bold 14px, label muted 12px */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(31,74,52,0.06)] mb-3">
                <div>
                  <span className="text-[14px] font-semibold text-[#17271D] block">
                    {advisory.stat1Value}
                  </span>
                  <span className="text-[11px] text-[#5B665E]">
                    {advisory.stat1Label}
                  </span>
                </div>
                <div>
                  <span className="text-[14px] font-semibold text-[#17271D] block">
                    {advisory.stat2Value}
                  </span>
                  <span className="text-[11px] text-[#5B665E]">
                    {advisory.stat2Label}
                  </span>
                </div>
              </div>
            </div>

            {/* Tinted footer strip with "text / text" left and a green progress bar */}
            <div className="bg-[#E4ECDB]/60 rounded-xl p-2.5 border border-[rgba(31,74,52,0.08)]">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#17271D] mb-1.5">
                <span>{advisory.windowStatusText}</span>
                <span className="text-[#3E8E55] font-semibold">
                  {advisory.progressLabel || `${advisory.progressPercent}%`}
                </span>
              </div>
              {/* Green Progress Bar */}
              <div className="w-full h-1.5 bg-[#FBFCF8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3E8E55] rounded-full transition-all duration-500"
                  style={{ width: `${advisory.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
