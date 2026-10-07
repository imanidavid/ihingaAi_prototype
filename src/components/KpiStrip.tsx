import React from 'react';
import {
  AlertTriangle,
  CloudSun,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { MUSANZE_RECORD } from '../data/musanzeData';
import { RiskLevel } from '../types';

interface KpiStripProps {
  activeWarningsCount?: number;
  riskLevel?: RiskLevel;
  onSelectWarningKpi?: () => void;
  onSelectRiskKpi?: () => void;
}

export const KpiStrip: React.FC<KpiStripProps> = ({
  activeWarningsCount,
  riskLevel,
  onSelectWarningKpi,
  onSelectRiskKpi,
}) => {
  const displayActiveWarnings =
    activeWarningsCount !== undefined ? activeWarningsCount : MUSANZE_RECORD.activeWarningsCount;
  const displayRiskLevel = riskLevel || MUSANZE_RECORD.riskLevel;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Current Risk Level (FIX 1: Kinigi sector) */}
      <div
        onClick={onSelectRiskKpi}
        className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex items-center gap-3.5 hover:border-[rgba(31,74,52,0.25)] transition-all cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-[#D9A032]/15 border border-[#D9A032]/30 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#D9A032]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-normal text-[#5B665E]">Current Risk Level</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[22px] font-semibold text-[#17271D] leading-tight">
              {displayRiskLevel}
            </span>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                displayRiskLevel === 'Critical'
                  ? 'bg-[#C93B3B]'
                  : displayRiskLevel === 'High'
                  ? 'bg-[#D9772F]'
                  : displayRiskLevel === 'Watch'
                  ? 'bg-[#D9A032]'
                  : 'bg-[#3E8E55]'
              }`}
            />
          </div>
          {/* Caption: Kinigi sector per FIX 1 */}
          <span className="text-[12px] text-[#5B665E] font-medium mt-0.5">
            Kinigi sector
          </span>
        </div>
      </div>

      {/* 2. Upcoming Weather */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0">
          <CloudSun className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-normal text-[#5B665E]">Upcoming Weather</span>
          <span className="text-[22px] font-semibold text-[#17271D] leading-tight mt-0.5">
            {MUSANZE_RECORD.temp} / {MUSANZE_RECORD.humidity}
          </span>
          <span className="text-[12px] text-[#5B665E] mt-0.5 font-medium">
            {MUSANZE_RECORD.weatherSummary}
          </span>
        </div>
      </div>

      {/* 3. Active Warnings */}
      <div
        onClick={onSelectWarningKpi}
        className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex items-center gap-3.5 hover:border-[rgba(31,74,52,0.25)] transition-all cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-normal text-[#5B665E]">Active Warnings</span>
          <span className="text-[22px] font-semibold text-[#17271D] leading-tight mt-0.5">
            {displayActiveWarnings}
          </span>
          {/* Warning notice color */}
          <span className="text-[12px] text-[#D9772F] mt-0.5 font-medium">
            {displayActiveWarnings} require action
          </span>
        </div>
      </div>

      {/* 4. Affected Sectors */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-normal text-[#5B665E]">Affected Sectors</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[22px] font-semibold text-[#17271D] leading-tight">
              {MUSANZE_RECORD.affectedSectorsCount}
            </span>
            <span className="text-[14px] text-[#5B665E]">/ {MUSANZE_RECORD.totalSectorsCount}</span>
          </div>
          <span className="text-[11.5px] text-[#5B665E] leading-tight mt-0.5">
            {MUSANZE_RECORD.affectedSectorsList.join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
};
