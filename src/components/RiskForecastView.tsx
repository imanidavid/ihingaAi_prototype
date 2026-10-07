import React, { useState } from 'react';
import {
  CloudRain,
  Sun,
  Thermometer,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { CropAdvisory, AppRole, OfficerCropRiskDetail, RiskLevel, OfficerActiveWarning } from '../types';
import {
  CROP_ADVISORIES_DATA as CROP_ADVISORIES,
  FORECAST_HORIZONS,
  CROP_RISK_MATRIX,
  SECTORS_WATCH_LIST,
  SECTORS_LOW_LIST,
  MUSANZE_RECORD,
  OFFICER_CROP_RISK_MAP,
  computeSectorClimateRisk,
} from '../data/musanzeData';

type HorizonType = '10d' | 'month' | 'season';

interface RiskForecastViewProps {
  role?: AppRole;
  onSelectAdvisory?: (advisory: CropAdvisory) => void;
  hideUserSectorChip?: boolean;
  onOpenWarning?: (warningId?: string) => void;
  activeWarnings?: OfficerActiveWarning[];
}

export const RiskForecastView: React.FC<RiskForecastViewProps> = ({
  role = 'farmer',
  onSelectAdvisory,
  hideUserSectorChip = false,
  onOpenWarning,
  activeWarnings,
}) => {
  const [horizon, setHorizon] = useState<HorizonType>('10d');
  const [isLowRiskExpanded, setIsLowRiskExpanded] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedOfficerCropRisk, setSelectedOfficerCropRisk] = useState<OfficerCropRiskDetail | null>(null);

  const handleExportCsv = () => {
    setToastMessage('Forecast exported');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Horizon Package from shared data module
  const currentHorizonPkg = FORECAST_HORIZONS[horizon];
  const maxScaleMm = horizon === 'season' ? 250 : 50;
  const yGridValues = horizon === 'season' ? [0, 50, 100, 150, 200, 250] : [0, 10, 20, 30, 40, 50];

  const activeChartData = currentHorizonPkg.chartData.map((d, i) => {
    return {
      day: d.day,
      date: d.fullDate,
      xLabel: horizon === 'season' ? d.day : `${d.day} ${d.fullDate.split(' ')[1] || ''}`.trim(),
      forecast: d.rainfallMm,
      rangeMin: Math.max(0, Math.round(d.rainfallMm * 0.7)),
      rangeMax: Math.round(d.rainfallMm * 1.25),
      normal: horizon === 'season' ? 65 : 13, // Flat seasonal average of 12–14 mm/day (never follows forecast shape)
      isPeak: d.isPeak,
    };
  });

  // Chart coordinates
  const svgWidth = 860;
  const svgHeight = 240;
  const padLeft = 44;
  const padRight = 32;
  const padTop = 38;
  const padBottom = 34;

  const chartInnerW = svgWidth - padLeft - padRight;
  const chartInnerH = svgHeight - padTop - padBottom;

  const chartPoints = activeChartData.map((d, i) => {
    const x = padLeft + (i / (activeChartData.length - 1)) * chartInnerW;
    const yForecast = padTop + chartInnerH - (Math.min(d.forecast, maxScaleMm) / maxScaleMm) * chartInnerH;
    const yMin = padTop + chartInnerH - (Math.min(d.rangeMin, maxScaleMm) / maxScaleMm) * chartInnerH;
    const yMax = padTop + chartInnerH - (Math.min(d.rangeMax, maxScaleMm) / maxScaleMm) * chartInnerH;
    const yNormal = padTop + chartInnerH - (Math.min(d.normal, maxScaleMm) / maxScaleMm) * chartInnerH;
    return { ...d, index: i, x, yForecast, yMin, yMax, yNormal };
  });

  // Build forecast smooth curve
  const forecastPath = chartPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.yForecast}`;
    const prev = arr[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.yForecast} ${midX},${pt.yForecast} ${pt.x},${pt.yForecast}`;
  }, '');

  // Build confidence interval band path
  const bandTopPath = chartPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.yMax}`;
    const prev = arr[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.yMax} ${midX},${pt.yMax} ${pt.x},${pt.yMax}`;
  }, '');

  const bandBottomPath = [...chartPoints].reverse().reduce((acc, pt, i, arr) => {
    if (i === 0) return `L ${pt.x},${pt.yMin}`;
    const prev = arr[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.yMin} ${midX},${pt.yMin} ${pt.x},${pt.yMin}`;
  }, '');

  const confidenceBandD = `${bandTopPath} ${bandBottomPath} Z`;

  // Build normal line path
  const normalPath = chartPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.yNormal}`;
    const prev = arr[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.yNormal} ${midX},${pt.yNormal} ${pt.x},${pt.yNormal}`;
  }, '');

  const peakPoint = chartPoints.find((p) => p.isPeak);

  const watchSectors = SECTORS_WATCH_LIST;
  const lowSectors = SECTORS_LOW_LIST;

  const getLevelChip = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9772F]/20 text-[#B85718] border border-[#D9772F]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9772F]" />
            <span>High</span>
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C93B3B]/15 text-[#C93B3B] border border-[#C93B3B]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93B3B]" />
            <span>Critical</span>
          </span>
        );
      case 'Watch':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9A032]/20 text-[#9E6905] border border-[#D9A032]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9A032]" />
            <span>Watch</span>
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#3E8E55]/15 text-[#2E6B40] border border-[#3E8E55]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E8E55]" />
            <span>Low</span>
          </span>
        );
    }
  };

  const handleCellClick = (crop: string, hazard: string, cellLevel: string, advisoryId: string) => {
    if (role === 'officer') {
      const key = `${crop}-${hazard}`;
      const mapped = OFFICER_CROP_RISK_MAP[key] || {
        crop,
        risk: cellLevel as RiskLevel,
        hazard,
        affectedSectors: cellLevel === 'Low' ? 'None (optimal)' : 'Kinigi, Busogo, Remera',
        growersCount: crop === 'Irish Potato' ? 690 : 1640,
        linkedWarningTitle: cellLevel === 'High' ? 'Late Blight Threat' : cellLevel === 'Watch' ? 'Heavy Rain Influx' : 'None active',
        linkedWarningAckPct: cellLevel === 'High' ? 58 : cellLevel === 'Watch' ? 65 : 0,
        warningId: cellLevel === 'High' ? 'alert-blight' : cellLevel === 'Watch' ? 'alert-rain' : undefined,
      };
      setSelectedOfficerCropRisk(mapped);
    } else {
      if (onSelectAdvisory) {
        const matched = CROP_ADVISORIES.find((a) => a.id === advisoryId) || CROP_ADVISORIES[0];
        onSelectAdvisory(matched);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1F4A34] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#E4ECDB]" strokeWidth={2} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#17271D]">Risk Forecast</h1>
          <p className="text-[13px] text-[#5B665E] mt-0.5">
            Musanze · Season 2026/27 A
          </p>
        </div>

        {/* Right side: Horizon Segmented Control + Export CSV Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
            {(
              [
                { id: '10d', label: 'Next 10 days' },
                { id: 'month', label: 'This month' },
                { id: 'season', label: 'Season' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setHorizon(tab.id)}
                className={`px-3.5 py-1.5 text-[12px] font-medium rounded-full transition-all cursor-pointer ${
                  horizon === tab.id
                    ? 'bg-[#3E8E55] text-white shadow-xs'
                    : 'text-[#5B665E] hover:text-[#17271D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.18)] text-[12px] font-medium hover:bg-[#E4ECDB] transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 1 — RISK TYPE CARDS (4 across, equal height, values on one line, no sparklines) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Card 1: Excess rain */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#D9A032]/15 flex items-center justify-center">
                  <CloudRain className="w-3.5 h-3.5 text-[#D9A032]" strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-medium text-[#17271D]">
                  {currentHorizonPkg.cards.excessRain.label}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#D9A032]/20 text-[#9E6905]">
                {currentHorizonPkg.cards.excessRain.badge}
              </span>
            </div>

            <div className="text-[22px] font-semibold text-[#17271D] leading-tight mt-1 whitespace-nowrap">
              {currentHorizonPkg.cards.excessRain.value}
            </div>
            <p className="text-[12px] text-[#5B665E] mt-1 leading-snug whitespace-nowrap">
              {currentHorizonPkg.cards.excessRain.subtext}
            </p>
          </div>
        </div>

        {/* Card 2: Dry spell */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-medium text-[#17271D]">
                  {currentHorizonPkg.cards.drySpell.label}
                </span>
              </div>
              {currentHorizonPkg.cards.drySpell.badge === 'Watch' ? (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#D9A032]/20 text-[#9E6905]">
                  Watch
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#3E8E55]/15 text-[#3E8E55]">
                  Low
                </span>
              )}
            </div>

            <div className="text-[22px] font-semibold text-[#17271D] leading-tight mt-1 whitespace-nowrap">
              {currentHorizonPkg.cards.drySpell.value}
            </div>
            <p className="text-[12px] text-[#5B665E] mt-1 leading-snug whitespace-nowrap">
              {currentHorizonPkg.cards.drySpell.subtext}
            </p>
          </div>
        </div>

        {/* Card 3: Temperature */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center">
                  <Thermometer className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-medium text-[#17271D]">
                  {currentHorizonPkg.cards.temperature.label}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#3E8E55]/15 text-[#3E8E55]">
                {currentHorizonPkg.cards.temperature.badge}
              </span>
            </div>

            <div className="text-[22px] font-semibold text-[#17271D] leading-tight mt-1 whitespace-nowrap">
              {currentHorizonPkg.cards.temperature.value}
            </div>
            <p className="text-[12px] text-[#5B665E] mt-1 leading-snug whitespace-nowrap">
              {currentHorizonPkg.cards.temperature.subtext}
            </p>
          </div>
        </div>

        {/* Card 4: Season onset */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-medium text-[#17271D]">
                  {currentHorizonPkg.cards.seasonOnset.label}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#E4ECDB] text-[#1F4A34] border border-[rgba(31,74,52,0.10)]">
                Started
              </span>
            </div>

            <div className="text-[22px] font-semibold text-[#17271D] leading-tight mt-1 whitespace-nowrap">
              {currentHorizonPkg.cards.seasonOnset.value}
            </div>
            <p className="text-[12px] text-[#5B665E] mt-1 leading-snug whitespace-nowrap">
              {currentHorizonPkg.cards.seasonOnset.subtext}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 2 — RAINFALL CHART (Full width card with 82% confidence tint chip) */}
      {/* ========================================================================= */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
        {/* Header & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[16px] font-semibold text-[#17271D]">
              Rainfall forecast
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E4ECDB] text-[#1F4A34] border border-[rgba(31,74,52,0.12)]">
              82% confidence
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] text-[#5B665E]">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2.5px] bg-[#3E8E55] rounded-full inline-block" />
              <span className="font-medium text-[#17271D]">Forecast</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2.5 bg-[#E4ECDB] border border-[#3E8E55]/30 rounded-xs inline-block" />
              <span>Likely range</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2px] border-b border-dashed border-[#5B665E] inline-block" />
              <span>Normal</span>
            </span>
          </div>
        </div>

        {/* SVG Line & Area Chart */}
        <div className="relative w-full overflow-hidden select-none my-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E4ECDB" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#E4ECDB" stopOpacity="0.30" />
              </linearGradient>
            </defs>

            {/* Y-axis gridlines & labels (0, 10, 20, 30, 40, 50 mm for 10d/month, 0-250 for season) */}
            {yGridValues.map((val) => {
              const y = padTop + chartInnerH - (val / maxScaleMm) * chartInnerH;
              return (
                <g key={val}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="rgba(31,74,52,0.10)"
                    strokeDasharray={val === 0 ? undefined : '3 3'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[12px] fill-[#5B665E] font-medium"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Shaded tint band = likely range (confidence interval) */}
            <path d={confidenceBandD} fill="url(#bandGradient)" />

            {/* Dashed muted line = Normal */}
            <path
              d={normalPath}
              fill="none"
              stroke="#5B665E"
              strokeWidth="1.75"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* Solid mid-green line = Forecast */}
            <path
              d={forecastPath}
              fill="none"
              stroke="#3E8E55"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Data points & hover triggers */}
            {chartPoints.map((pt) => {
              const isHovered = hoveredPointIndex === pt.index;
              const isPeak = pt.isPeak;

              // 30-day x-axis labels every 5 days as dates (28/09, 03/10, 08/10, 13/10, 18/10, 23/10)
              const dateLabels30D: Record<number, string> = {
                0: '28/09',
                5: '03/10',
                10: '08/10',
                15: '13/10',
                20: '18/10',
                25: '23/10',
              };

              const shouldShowLabel =
                horizon === 'month' ? pt.index in dateLabels30D : true;

              const labelText =
                horizon === 'month' ? dateLabels30D[pt.index] : pt.xLabel;

              return (
                <g
                  key={pt.index}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(pt.index)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                >
                  {/* Hover vertical guide */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={padTop}
                      x2={pt.x}
                      y2={svgHeight - padBottom}
                      stroke="rgba(31,74,52,0.25)"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.yForecast}
                    r={isPeak ? 5.5 : isHovered ? 4.5 : 2.5}
                    fill={isPeak ? '#D9772F' : isHovered ? '#1F4A34' : '#3E8E55'}
                    stroke="#FBFCF8"
                    strokeWidth="2"
                  />

                  {/* X axis labels with dates */}
                  {shouldShowLabel && (
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className={`text-[12px] ${
                        isPeak
                          ? 'fill-[#D9772F] font-semibold'
                          : isHovered
                          ? 'fill-[#17271D] font-medium'
                          : 'fill-[#5B665E]'
                      }`}
                    >
                      {labelText}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Peak / Total Highlight Label */}
            {peakPoint && currentHorizonPkg.peakLabel && (
              <g transform={`translate(${peakPoint.x}, ${peakPoint.yForecast - 14})`}>
                <rect
                  x="-45"
                  y="-18"
                  width="90"
                  height="18"
                  rx="9"
                  fill="#1F4A34"
                  className="shadow-xs"
                />
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-white"
                >
                  {currentHorizonPkg.peakLabel}
                </text>
              </g>
            )}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPointIndex !== null && chartPoints[hoveredPointIndex] && (
            <div
              className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-[#1F4A34] text-white text-[12px] shadow-md -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(chartPoints[hoveredPointIndex].x / svgWidth) * 100}%`,
                top: `${(chartPoints[hoveredPointIndex].yForecast / svgHeight) * 100 - 10}%`,
              }}
            >
              <div className="font-semibold">
                {chartPoints[hoveredPointIndex].xLabel}
              </div>
              <div className="text-[#E4ECDB] text-[11px]">
                Forecast: {chartPoints[hoveredPointIndex].forecast} mm (range {chartPoints[hoveredPointIndex].rangeMin}–{chartPoints[hoveredPointIndex].rangeMax} mm)
              </div>
              <div className="text-[#E4ECDB]/80 text-[10px]">
                Normal: {chartPoints[hoveredPointIndex].normal} mm
              </div>
            </div>
          )}
        </div>

        {/* Caption below chart */}
        <div className="pt-3 border-t border-[rgba(31,74,52,0.06)] mt-2">
          <p className="text-[12px] text-[#5B665E]">
            Last season, our 10-day rain forecasts were right 8 out of 10 times · Based on Meteo Rwanda station data and satellite rainfall.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 3 — SECTOR RISK (2x2 grid of Watch sectors + collapsed 11 Low risk sectors) */}
      {/* ========================================================================= */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-[rgba(31,74,52,0.06)]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#17271D]">
              Sector Risk Ranking
            </h3>
            <p className="text-[12px] text-[#5B665E]">
              Musanze administrative sectors sorted by current climate risk vulnerability
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11.5px] text-[#5B665E]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9A032]" />
              <span>4 at Watch</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3E8E55]" />
              <span>11 at Low</span>
            </span>
          </div>
        </div>

        {/* Dynamic High risk sectors if active weather warning issued */}
        {activeWarnings && activeWarnings.length > 0 && (() => {
          const highSectors = MUSANZE_RECORD.allSectors
            .filter((sec) => computeSectorClimateRisk(sec, activeWarnings) === 'High')
            .map((name) => ({
              name,
              reason: `High risk: active weather broadcast issued for ${name} sector.`,
            }));
          if (highSectors.length === 0) return null;
          return (
            <div className="mb-3 space-y-2">
              <span className="text-[12px] font-semibold text-[#B85718] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D9772F]" />
                <span>High risk ({highSectors.length})</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {highSectors.map((sec) => (
                  <div
                    key={sec.name}
                    className="p-3.5 rounded-xl bg-white border border-[#D9772F]/40 shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-[#17271D]">
                        {sec.name} Sector
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#D9772F]/20 text-[#B85718]">
                        High
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5B665E] mt-1 leading-snug">
                      {sec.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 2x2 grid of compact cards for the 4 Watch sectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {watchSectors.map((sec) => (
            <div
              key={sec.name}
              className="p-3.5 rounded-xl bg-white border border-[#D9A032]/35 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[#17271D]">
                    {sec.name} Sector
                  </span>
                  {sec.isUserSector && !hideUserSectorChip && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[10.5px] font-medium border border-[rgba(31,74,52,0.12)]">
                      Your sector
                    </span>
                  )}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#D9A032]/20 text-[#9E6905]">
                  Watch
                </span>
              </div>
              <p className="text-[12px] text-[#5B665E] mt-1 leading-snug">
                {sec.reason}
              </p>
            </div>
          ))}
        </div>

        {/* Collapsed row for 11 Low risk sectors */}
        <div className="mt-4 pt-3 border-t border-[rgba(31,74,52,0.06)]">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.06)]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3E8E55]" />
              <span className="text-[13px] font-medium text-[#17271D]">
                11 sectors at Low risk
              </span>
              <span className="hidden sm:inline text-[11.5px] text-[#5B665E]">
                (Cyuve, Gacaca, Gashaki, Gataraga, Kimonyi, Muko, Musanze, Nkotsi, Nyange, Rwaza, Shingiro)
              </span>
            </div>

            <button
              onClick={() => setIsLowRiskExpanded(!isLowRiskExpanded)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.18)] text-[12px] font-medium hover:bg-[#E4ECDB] transition-all cursor-pointer"
            >
              <span>{isLowRiskExpanded ? 'Hide' : 'Show'}</span>
              {isLowRiskExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* Expanded 11 low risk sectors grid */}
          {isLowRiskExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3 animate-in fade-in">
              {lowSectors.map((sec) => (
                <div
                  key={sec.name}
                  className="p-2.5 rounded-lg bg-white border border-[rgba(31,74,52,0.08)] flex items-center justify-between"
                >
                  <div>
                    <span className="text-[13px] font-medium text-[#17271D] block">
                      {sec.name} Sector
                    </span>
                    <span className="text-[11px] text-[#5B665E] block">
                      {sec.reason}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3E8E55]/15 text-[#3E8E55]">
                    Low
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 4 — CROP RISK MATRIX (Directly below sector card) */}
      {/* ========================================================================= */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
        <div className="mb-4 pb-2 border-b border-[rgba(31,74,52,0.06)]">
          <h3 className="text-[16px] font-semibold text-[#17271D]">
            Crop Risk Matrix
          </h3>
          <p className="text-[12px] text-[#5B665E]">
            Hazard vulnerability breakdown across Musanze priority crops. Tap any cell to view mitigation advice.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                <th className="py-2.5 px-3 font-medium">Crop</th>
                <th className="py-2.5 px-3 font-medium">Excess rain</th>
                <th className="py-2.5 px-3 font-medium">Dry spell</th>
                <th className="py-2.5 px-3 font-medium">Temperature</th>
                <th className="py-2.5 px-3 font-medium">Disease / pest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,74,52,0.06)] text-[13px]">
              {CROP_RISK_MATRIX.map((row) => {
                const matchedAdvisory =
                  CROP_ADVISORIES.find((a) => a.id === row.advisoryId) || CROP_ADVISORIES[0];

                const getChipStyle = (level: string) => {
                  switch (level) {
                    case 'High':
                      return 'bg-[#D9772F]/15 text-[#D9772F]';
                    case 'Watch':
                      return 'bg-[#D9A032]/20 text-[#9E6905]';
                    case 'Critical':
                      return 'bg-[#C93B3B]/15 text-[#C93B3B]';
                    case 'Low':
                    default:
                      return 'bg-[#3E8E55]/15 text-[#3E8E55]';
                  }
                };

                return (
                  <tr key={row.crop} className="hover:bg-[rgba(31,74,52,0.02)] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#17271D]">
                      {row.crop}
                    </td>
                    <td
                      className="py-3 px-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCellClick(row.crop, 'Excess rain', row.excessRain.level, row.advisoryId)}
                    >
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getChipStyle(row.excessRain.level)}`}>
                        {row.excessRain.chipText}
                      </span>
                    </td>
                    <td
                      className="py-3 px-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCellClick(row.crop, 'Dry spell', row.drySpell.level, row.advisoryId)}
                    >
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getChipStyle(row.drySpell.level)}`}>
                        {row.drySpell.chipText}
                      </span>
                    </td>
                    <td
                      className="py-3 px-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCellClick(row.crop, 'Temperature', row.temperature.level, row.advisoryId)}
                    >
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getChipStyle(row.temperature.level)}`}>
                        {row.temperature.chipText}
                      </span>
                    </td>
                    <td
                      className="py-3 px-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCellClick(row.crop, 'Disease / pest', row.diseasePest.level, row.advisoryId)}
                    >
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getChipStyle(row.diseasePest.level)}`}>
                        {row.diseasePest.chipText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Caption below matrix */}
        <div className="pt-3 border-t border-[rgba(31,74,52,0.06)] mt-3 flex items-center gap-2 text-[12px] text-[#5B665E]">
          <Info className="w-4 h-4 text-[#D9772F] flex-shrink-0" strokeWidth={1.5} />
          <span className="font-medium text-[#17271D]">
            Late blight risk matches active High warning.
          </span>
          <span className="text-[#5B665E]">
            Tap any cell to open {role === 'officer' ? 'crop risk details' : 'field mitigation advisory'}.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICER CROP RISK DRAWER (FIX 5: Drawer title "Crop risk") */}
      {/* ========================================================================= */}
      {selectedOfficerCropRisk && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedOfficerCropRisk(null)}
        >
          <div
            className="w-full max-w-md bg-[#FBFCF8] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
                <div>
                  <h3 className="text-[20px] font-semibold text-[#17271D]">Crop risk</h3>
                  <p className="text-[12px] text-[#5B665E] mt-0.5">
                    {selectedOfficerCropRisk.crop} · Musanze District
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOfficerCropRisk(null)}
                  className="w-8 h-8 rounded-full bg-[#F4F6EF] flex items-center justify-center text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main detail content */}
              <div className="space-y-4">
                {/* Risk Level & Hazard */}
                <div className="p-4 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#5B665E] font-medium">Risk level</span>
                    {getLevelChip(selectedOfficerCropRisk.risk)}
                  </div>
                  <div className="text-[14px] font-semibold text-[#17271D]">
                    {selectedOfficerCropRisk.hazard}
                  </div>
                </div>

                {/* Affected sectors */}
                <div className="p-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.08)] space-y-1">
                  <span className="text-[11.5px] text-[#5B665E] block font-medium">
                    Affected sectors
                  </span>
                  <span className="text-[13.5px] font-semibold text-[#17271D] block">
                    {selectedOfficerCropRisk.affectedSectors}
                  </span>
                </div>

                {/* Number of growers */}
                <div className="p-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.08)] space-y-1">
                  <span className="text-[11.5px] text-[#5B665E] block font-medium">
                    Registered growers
                  </span>
                  <span className="text-[15px] font-semibold text-[#17271D] tabular-nums block">
                    {selectedOfficerCropRisk.growersCount.toLocaleString()} growers
                  </span>
                </div>

                {/* Linked active warning with acknowledged % */}
                <div className="p-3.5 rounded-xl bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.12)] space-y-1.5">
                  <span className="text-[11.5px] text-[#1F4A34] block font-semibold">
                    Linked active warning
                  </span>
                  <div className="text-[13.5px] font-semibold text-[#17271D]">
                    {selectedOfficerCropRisk.linkedWarningTitle}
                  </div>
                  {selectedOfficerCropRisk.linkedWarningAckPct > 0 ? (
                    <div className="text-[12px] text-[#2E6B40] font-medium">
                      {selectedOfficerCropRisk.linkedWarningAckPct}% acknowledged across target sectors
                    </div>
                  ) : (
                    <div className="text-[12px] text-[#5B665E]">
                      No active warning currently issued for this hazard.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons: [Open warning] (No farmer advisory, no "Save", no plot location) */}
            <div className="pt-4 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedOfficerCropRisk(null)}
                className="px-4 py-2 rounded-full bg-[#F4F6EF] text-[#5B665E] text-[12.5px] font-medium hover:text-[#17271D]"
              >
                Close
              </button>
              {selectedOfficerCropRisk.warningId && (
                <button
                  onClick={() => {
                    const wid = selectedOfficerCropRisk.warningId;
                    setSelectedOfficerCropRisk(null);
                    if (onOpenWarning) onOpenWarning(wid);
                  }}
                  className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-medium hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  Open warning
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
