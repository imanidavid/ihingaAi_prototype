import React, { useState } from 'react';
import {
  MapPin,
  RotateCcw,
  ExternalLink,
  Droplets,
  AlertTriangle,
} from 'lucide-react';
import { DistrictData, RiskLevel } from '../types';
import { RWANDA_DISTRICTS } from '../data/musanzeData';

interface RwandaRiskMapCardProps {
  onViewFullMap?: () => void;
  musanzeRiskLevel?: RiskLevel;
}

export const RwandaRiskMapCard: React.FC<RwandaRiskMapCardProps> = ({
  onViewFullMap,
  musanzeRiskLevel,
}) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('musanze');
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);

  const rawSelected =
    RWANDA_DISTRICTS.find((d) => d.id === selectedDistrictId) || RWANDA_DISTRICTS[0];
  const selectedDistrict =
    rawSelected.id === 'musanze' && musanzeRiskLevel
      ? { ...rawSelected, risk: musanzeRiskLevel }
      : rawSelected;

  const rawMusanze = RWANDA_DISTRICTS.find((d) => d.id === 'musanze')!;
  const musanzeDistrict = musanzeRiskLevel
    ? { ...rawMusanze, risk: musanzeRiskLevel }
    : rawMusanze;

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'Critical':
        return '#C93B3B';
      case 'High':
        return '#D9772F';
      case 'Watch':
        return '#D9A032';
      case 'Low':
      default:
        return '#3E8E55';
    }
  };

  const getRiskBg = (risk: RiskLevel) => {
    switch (risk) {
      case 'Critical':
        return 'rgba(201, 59, 59, 0.22)';
      case 'High':
        return 'rgba(217, 119, 47, 0.22)';
      case 'Watch':
        return 'rgba(217, 160, 50, 0.22)';
      case 'Low':
      default:
        return 'rgba(62, 142, 85, 0.18)';
    }
  };

  return (
    <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(31,74,52,0.06)]">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Rwanda Risk Map</h3>
          <span className="text-[12px] text-[#5B665E]">All 30 Districts</span>
        </div>
        <button
          onClick={onViewFullMap}
          className="text-[12px] font-medium text-[#1F4A34] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View full map</span>
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Main Grid: Interactive Map (left) + District Detail Panel (right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch min-h-[340px]">
        {/* SVG Map Container (7 cols) */}
        <div className="md:col-span-7 relative bg-[#F4F6EF]/70 rounded-xl p-3 border border-[rgba(31,74,52,0.08)] flex flex-col justify-between">
          <div className="relative w-full h-[280px]">
            <svg
              viewBox="0 0 570 510"
              className="w-full h-full object-contain filter drop-shadow-xs"
            >
              {/* Lake Kivu subtle water shape for authentic geography */}
              <path
                d="M 50,110 Q 75,170 85,250 T 60,380 T 40,460 L 30,500 L 10,480 L 15,100 Z"
                fill="#D8E5DC"
                opacity="0.6"
              />
              <text x="25" y="270" className="text-[10px] fill-[#5B665E]/60 rotate-[-90deg]">
                Lake Kivu
              </text>

              {/* All 30 Districts Polygons */}
              {RWANDA_DISTRICTS.map((district) => {
                const isSelected = district.id === selectedDistrict.id;
                const isMusanze = district.id === 'musanze';
                const isHovered = hoveredDistrict?.id === district.id;

                const effectiveRisk = isMusanze && musanzeRiskLevel ? musanzeRiskLevel : district.risk;
                const fillColor = getRiskBg(effectiveRisk);
                const strokeColor = isSelected
                  ? '#1F4A34'
                  : isMusanze
                  ? '#1F4A34'
                  : getRiskColor(effectiveRisk);

                return (
                  <g
                    key={district.id}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedDistrictId(district.id)}
                    onMouseEnter={() => setHoveredDistrict(district)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                  >
                    <path
                      d={district.svgPath}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '2.8' : isMusanze ? '2' : '1.2'}
                      strokeDasharray={isMusanze && !isSelected ? '3 1' : 'none'}
                      className={`transition-all duration-150 ${
                        isHovered ? 'filter brightness-95 opacity-90' : 'opacity-85'
                      }`}
                    />
                    {/* District name label */}
                    <text
                      x={district.labelCoord.x}
                      y={district.labelCoord.y}
                      textAnchor="middle"
                      className={`pointer-events-none select-none ${
                        isMusanze
                          ? 'text-[11px] font-bold fill-[#1F4A34]'
                          : isSelected
                          ? 'text-[10px] font-bold fill-[#17271D]'
                          : 'text-[9px] font-medium fill-[#5B665E]'
                      }`}
                    >
                      {district.name}
                    </text>
                  </g>
                );
              })}

              {/* "Your District" Pin & Floating Tag on Musanze */}
              <g transform={`translate(${musanzeDistrict.labelCoord.x}, ${musanzeDistrict.labelCoord.y - 18})`}>
                <rect
                  x="-35"
                  y="-14"
                  width="70"
                  height="16"
                  rx="8"
                  fill="#1F4A34"
                  stroke="#E4ECDB"
                  strokeWidth="1"
                  className="shadow-sm pointer-events-none"
                />
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  className="text-[8.5px] font-semibold fill-white pointer-events-none"
                >
                  Your district
                </text>
              </g>
            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[rgba(31,74,52,0.06)] text-[11px] text-[#5B665E]">
            <span className="font-medium text-[#17271D]">Risk Legend:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3E8E55]" />
                <span>Low</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9A032]" />
                <span>Watch</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9772F]" />
                <span>High</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C93B3B]" />
                <span>Critical</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Detail Panel (5 cols) */}
        <div className="md:col-span-5 bg-[#FBFCF8] rounded-xl p-4 border border-[rgba(31,74,52,0.10)] flex flex-col justify-between">
          <div>
            {/* Top Bar with "Back to my district" if another district is selected */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-[#5B665E]">
                {selectedDistrict.province}
              </span>
              {selectedDistrict.id !== 'musanze' && (
                <button
                  onClick={() => setSelectedDistrictId('musanze')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F4A34] hover:underline bg-[#E4ECDB] px-2 py-0.5 rounded-full cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                  <span>Back to my district</span>
                </button>
              )}
            </div>

            {/* District Title & Status */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[18px] font-semibold text-[#17271D]">
                    {selectedDistrict.name} District
                  </h4>
                  {selectedDistrict.isUserDistrict && (
                    <span className="px-2 py-0.5 rounded-full bg-[#1F4A34] text-white text-[10px] font-medium">
                      Your home
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-[#5B665E]">
                  Rwanda Agro-Climatic Zone
                </span>
              </div>

              {/* Risk Badge */}
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  selectedDistrict.risk === 'Critical'
                    ? 'bg-[#C93B3B]/15 text-[#C93B3B]'
                    : selectedDistrict.risk === 'High'
                    ? 'bg-[#D9772F]/15 text-[#D9772F]'
                    : selectedDistrict.risk === 'Watch'
                    ? 'bg-[#D9A032]/20 text-[#9E6905]'
                    : 'bg-[#3E8E55]/15 text-[#3E8E55]'
                }`}
              >
                {selectedDistrict.risk} Risk
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-[#F4F6EF] p-2.5 rounded-lg border border-[rgba(31,74,52,0.06)]">
                <div className="flex items-center gap-1 text-[11px] text-[#5B665E] mb-0.5">
                  <Droplets className="w-3.5 h-3.5 text-[#3E8E55]" strokeWidth={1.5} />
                  <span>Expected 24h Rain</span>
                </div>
                <div className="text-[16px] font-semibold text-[#17271D]">
                  {selectedDistrict.rainfall24h} mm
                </div>
              </div>

              <div className="bg-[#F4F6EF] p-2.5 rounded-lg border border-[rgba(31,74,52,0.06)]">
                <div className="flex items-center gap-1 text-[11px] text-[#5B665E] mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D9A032]" strokeWidth={1.5} />
                  <span>Soil Saturation</span>
                </div>
                <div className="text-[16px] font-semibold text-[#17271D]">
                  {selectedDistrict.soilSaturation}%
                </div>
              </div>
            </div>

            {/* Affected Sectors Breakdown */}
            <div>
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="font-medium text-[#17271D]">Affected Sectors</span>
                <span className="text-[#5B665E] font-medium">
                  {selectedDistrict.affectedSectorsCount} of {selectedDistrict.totalSectors} sectors
                </span>
              </div>

              {selectedDistrict.affectedSectorsList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedDistrict.affectedSectorsList.map((sector) => (
                    <span
                      key={sector}
                      className="px-2 py-0.5 rounded-md bg-[#E4ECDB]/70 text-[#17271D] text-[11px] font-medium border border-[rgba(31,74,52,0.08)] flex items-center gap-1"
                    >
                      <MapPin className="w-2.5 h-2.5 text-[#1F4A34]" strokeWidth={1.5} />
                      {sector}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#5B665E] italic">
                  No active sector advisories in {selectedDistrict.name}. Conditions normal.
                </p>
              )}
            </div>
          </div>

          {/* District Status Prompt */}
          <div className="mt-4 pt-3 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[11px] text-[#5B665E]">
            <span>Weather station feed: Synced</span>
            <span className="text-[#17271D] font-medium">
              {selectedDistrict.temp} · {selectedDistrict.humidity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
