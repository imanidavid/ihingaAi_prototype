import React from 'react';
import { Leaf, Eye } from 'lucide-react';
import { heroImg, MUSANZE_RECORD } from '../data/musanzeData';
import { RiskLevel } from '../types';

interface HeroBannerProps {
  onViewForecast: () => void;
  onGetRecommendations: () => void;
  onReportObservation: () => void;
  riskLevel?: RiskLevel;
  /** Farmer's first name and sector, and the weather line computed from the forecast. */
  firstName: string;
  sector: string;
  weatherSummary: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onViewForecast,
  onGetRecommendations,
  onReportObservation,
  riskLevel,
  firstName,
  sector,
  weatherSummary,
}) => {
  return (
    <div className="relative w-full rounded-[16px] overflow-hidden shadow-[0_2px_12px_rgba(31,74,52,0.08)] bg-gradient-to-r from-[#1F4A34] via-[#24543B] to-[#2C6343] min-h-[190px] flex items-center">
      {/* Right side photo fading into the green gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] pointer-events-none select-none overflow-hidden">
        <img
          src={heroImg}
          alt="Musanze volcanic terraced farmland"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft gradient blend masks */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#24543B] via-[#24543B]/60 to-transparent" />
        <div className="absolute inset-0 bg-[#1F4A34]/20 mix-blend-multiply" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full max-w-2xl text-white">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[12px] font-medium text-white mb-2.5">
            <Leaf className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={2} />
            <span>
              {MUSANZE_RECORD.districtName} · {MUSANZE_RECORD.season}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[26px] md:text-[28px] font-normal text-white leading-tight tracking-tight line-clamp-2 max-w-xl">
            Good afternoon, {firstName}. {weatherSummary}
          </h1>

          {/* Subtitle (FIX 1: Current risk level, caption Kinigi sector) */}
          {(() => {
            const lvl = riskLevel || MUSANZE_RECORD.riskLevel;
            const chipClass =
              lvl === 'Critical'
                ? 'bg-[#C93B3B] text-white'
                : lvl === 'High'
                ? 'bg-[#D9772F] text-white'
                : lvl === 'Watch'
                ? 'bg-[#D9A032] text-[#17271D]'
                : 'bg-[#3E8E55] text-white';
            return (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[13px] text-white/80 font-normal">Current risk level:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${chipClass}`}>
                  {lvl}
                </span>
                <span className="text-[12px] text-white/70">{sector} sector</span>
              </div>
            );
          })()}
        </div>

        {/* 3 Action Pills */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5">
          <button
            onClick={onViewForecast}
            className="px-4 py-1.5 rounded-full bg-white text-[#17271D] text-[12px] font-medium hover:bg-[#F4F6EF] transition-all shadow-xs cursor-pointer active:scale-98"
          >
            View forecast
          </button>
          <button
            onClick={onGetRecommendations}
            className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 hover:border-white transition-all cursor-pointer active:scale-98"
          >
            Get recommendations
          </button>
          <button
            onClick={onReportObservation}
            className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 hover:border-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
          >
            <Eye className="w-3 h-3 text-[#E4ECDB]" strokeWidth={1.5} />
            <span>Report observation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
