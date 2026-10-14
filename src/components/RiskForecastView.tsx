import React, { useMemo, useState } from 'react';
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
import { CropAdvisory, AppRole, RiskLevel, OfficerActiveWarning, SectorRainForecast, ThresholdRuleItem } from '../types';
import { PillSelect } from './PillSelect';
import {
  FORECAST_HORIZONS,
  CROP_HAZARDS,
  computeHazardCards,
  computeForecastSkill,
  FORECAST_VS_OBSERVED,
  forecastDays,
  CROP_RISK_MODEL_LABEL,
  CropHazard,
  CropRiskMatrixRow,
  cropRiskChipText,
  SECTOR_RISK_NOTES,
  RISK_LEVEL_COLORS,
  RISK_LEVEL_WEIGHT,
  MUSANZE_RECORD,
  computeSectorClimateRisk,
  RAINFALL_NORMAL_MM_PER_DAY,
  RAINFALL_NORMAL_MM_PER_MONTH_SEASON_CHART,
} from '../data/musanzeData';

type HorizonType = '10d' | 'month' | 'season';

interface RiskForecastViewProps {
  role?: AppRole;
  onSelectAdvisory?: (advisory: CropAdvisory) => void;
  hideUserSectorChip?: boolean;
  onOpenWarning?: (warningId?: string) => void;
  activeWarnings?: OfficerActiveWarning[];
  /** Each sector's forecast risk (forecast series + the officer's threshold rules). */
  forecastRisk: Record<string, RiskLevel>;
  /** The signed-in farmer's sector ("Your sector" chip). */
  userSector?: string;
  /** Every sector's forecast and the officer's rules (cards and charts are computed from them). */
  rainForecasts: SectorRainForecast[];
  thresholdRules: ThresholdRuleItem[];
  /** Crop risk matrix from the crop risk model (farmer: their sector and crops; others: the district). */
  cropRisk: CropRiskMatrixRow[];
  /** Officer advice the viewer can open from a matrix cell (farmer: only advice visible to them). */
  advisories: CropAdvisory[];
  /** Permission matrix: may export data. */
  canExport?: boolean;
}

export const RiskForecastView: React.FC<RiskForecastViewProps> = ({
  role = 'farmer',
  onSelectAdvisory,
  hideUserSectorChip = false,
  onOpenWarning,
  activeWarnings,
  forecastRisk,
  userSector,
  rainForecasts,
  thresholdRules,
  cropRisk,
  advisories,
  canExport = true,
}) => {
  const [horizon, setHorizon] = useState<HorizonType>('10d');
  // Farmers see their own sector; others pick a sector (the highest-risk one first)
  const defaultSector =
    userSector ||
    [...MUSANZE_RECORD.allSectors].sort(
      (a, b) => RISK_LEVEL_WEIGHT[forecastRisk[b] || 'Low'] - RISK_LEVEL_WEIGHT[forecastRisk[a] || 'Low']
    )[0];
  const [chartSector, setChartSector] = useState(defaultSector);
  const skill = useMemo(() => computeForecastSkill(FORECAST_VS_OBSERVED), []);
  const forecastSeries = useMemo(() => forecastDays(rainForecasts, chartSector), [rainForecasts, chartSector]);
  const hazardCards = useMemo(
    () => computeHazardCards(chartSector, thresholdRules, rainForecasts, horizon === '10d' ? 10 : 30),
    [chartSector, thresholdRules, rainForecasts, horizon]
  );
  const [isLowRiskExpanded, setIsLowRiskExpanded] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  // Selected matrix cell: officers get the crop risk drawer, farmers a short "why" panel under the matrix
  const [selectedCell, setSelectedCell] = useState<{ crop: string; hazard: CropHazard } | null>(null);
  const selectedRow = selectedCell ? cropRisk.find((r) => r.crop === selectedCell.crop) : undefined;
  const selectedCellData = selectedRow && selectedCell ? selectedRow.cells[selectedCell.hazard] : undefined;
  const selectedHazardLabel = CROP_HAZARDS.find((h) => h.id === selectedCell?.hazard)?.label || '';
  const selectedWarning = selectedCellData?.warningId
    ? (activeWarnings || []).find((w) => w.id === selectedCellData.warningId)
    : undefined;
  const selectedAdvice = selectedCell
    ? advisories.find((a) => a.crop === selectedCell.crop && (!selectedCellData?.warningId || a.linkedWarningId === selectedCellData.warningId)) ||
      advisories.find((a) => a.crop === selectedCell.crop)
    : undefined;
  const isOfficer = role === 'officer';

  const handleExportCsv = () => {
    if (!canExport) {
      setToastMessage('Your role does not have the “Export data” permission');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    setToastMessage('Forecast exported');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Horizon Package from shared data module
  // 10-day and month charts read the forecast series in the store; the season chart stays monthly totals
  const basePkg = FORECAST_HORIZONS[horizon];
  const currentHorizonPkg =
    forecastSeries && forecastSeries.length > 0 && horizon !== 'season'
      ? { ...basePkg, chartData: horizon === '10d' ? forecastSeries.slice(0, 10) : forecastSeries }
      : basePkg;
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
      // Flat seasonal average from musanzeData (never follows forecast shape)
      normal: horizon === 'season' ? RAINFALL_NORMAL_MM_PER_MONTH_SEASON_CHART : RAINFALL_NORMAL_MM_PER_DAY,
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

  // Sector lists computed from the forecast risk (highest level first)
  const watchSectors = MUSANZE_RECORD.allSectors
    .filter((name) => (forecastRisk[name] || 'Low') !== 'Low')
    .sort((a, b) => RISK_LEVEL_WEIGHT[forecastRisk[b]] - RISK_LEVEL_WEIGHT[forecastRisk[a]])
    .map((name) => ({ name, level: forecastRisk[name], isUserSector: name === userSector, reason: SECTOR_RISK_NOTES[name] || '' }));
  const lowSectors = MUSANZE_RECORD.allSectors
    .filter((name) => (forecastRisk[name] || 'Low') === 'Low')
    .map((name) => ({ name, reason: SECTOR_RISK_NOTES[name] || '' }));

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

  const getChipStyle = (level: RiskLevel) => {
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

  const handleCellClick = (crop: string, hazard: CropHazard) => {
    setSelectedCell((prev) => (prev && prev.crop === crop && prev.hazard === hazard ? null : { crop, hazard }));
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
          <h1 className="text-[24px] font-semibold text-[#17271D]">Risk forecast</h1>
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
      {!userSector && (
        <div className="max-w-xs">
          <PillSelect
            label="Sector"
            value={chartSector}
            onChange={setChartSector}
            options={MUSANZE_RECORD.allSectors.map((n) => ({ value: n, label: `${n} · ${forecastRisk[n] || 'Low'}` }))}
          />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {hazardCards.map((card) => {
          const Icon = card.id === 'rain' ? CloudRain : card.id === 'dry' ? Sun : card.id === 'temp' ? Thermometer : Calendar;
          return (
            <div
              key={card.id}
              className="bg-[#FBFCF8] rounded-[16px] p-4 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-medium text-[#17271D]">{card.label}</span>
                </div>
                {card.level && getLevelChip(card.level)}
              </div>
              <div className="text-[22px] font-semibold text-[#17271D] leading-tight mt-1 whitespace-nowrap tabular-nums">{card.value}</div>
              <p className="text-[12px] text-[#5B665E] mt-1 leading-snug">{card.subtext}</p>
            </div>
          );
        })}
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
            <span className="text-[12px] text-[#5B665E]">{chartSector}</span>
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
            Over the last {skill.days} days, the forecast was close to the rain gauge on {skill.hits} of {skill.days} days (Kinigi gauge, simulated data).
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
              Sector risk ranking
            </h3>
            <p className="text-[12px] text-[#5B665E]">
              Musanze administrative sectors sorted by current climate risk vulnerability
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11.5px] text-[#5B665E]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9A032]" />
              <span>{watchSectors.length} at Watch or above</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3E8E55]" />
              <span>{lowSectors.length} at Low</span>
            </span>
          </div>
        </div>

        {/* Dynamic High risk sectors if active weather warning issued */}
        {activeWarnings && activeWarnings.length > 0 && (() => {
          const highSectors = MUSANZE_RECORD.allSectors
            .filter((sec) => computeSectorClimateRisk(sec, activeWarnings, forecastRisk) === 'High')
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

        {/* Compact cards for the sectors whose forecast reaches Watch or above */}
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
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold text-[#17271D] border"
                  style={{ backgroundColor: `${RISK_LEVEL_COLORS[sec.level]}33`, borderColor: `${RISK_LEVEL_COLORS[sec.level]}66` }}
                >
                  {sec.level}
                </span>
              </div>
              <p className="text-[12px] text-[#5B665E] mt-1 leading-snug">
                {sec.reason}
              </p>
            </div>
          ))}
        </div>

        {/* Collapsed row for the Low risk sectors */}
        <div className="mt-4 pt-3 border-t border-[rgba(31,74,52,0.06)]">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.06)]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3E8E55]" />
              <span className="text-[13px] font-medium text-[#17271D]">
                {lowSectors.length} sectors at Low risk
              </span>
              <span className="hidden sm:inline text-[11.5px] text-[#5B665E]">
                ({lowSectors.map((sec) => sec.name).join(', ')})
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
            Crop risk matrix
          </h3>
          <p className="text-[12px] text-[#5B665E]">
            {userSector
              ? `Your crops in ${userSector} over the next 10 days.`
              : 'Musanze priority crops over the next 10 days (highest sector shown).'}
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
              {cropRisk.map((row) => (
                <tr key={row.crop} className="hover:bg-[rgba(31,74,52,0.02)] transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#17271D]">{row.crop}</td>
                  {CROP_HAZARDS.map((h) => {
                    const cell = row.cells[h.id];
                    const isSelected = selectedCell?.crop === row.crop && selectedCell.hazard === h.id;
                    return (
                      <td key={h.id} className="py-3 px-3">
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleCellClick(row.crop, h.id)}
                          title={cell.reasons.join(' ')}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer hover:opacity-80 transition-opacity ${getChipStyle(cell.level)} ${
                            isSelected ? 'ring-2 ring-[#1F4A34]/40' : ''
                          }`}
                        >
                          {cropRiskChipText(cell)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Farmer: why the model gave this level, and the officer's advice if there is one */}
        {!isOfficer && selectedCell && selectedCellData && (
          <div className="mt-3 p-3.5 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-[#17271D]">
                {selectedCell.crop} · {selectedHazardLabel}
              </span>
              {getLevelChip(selectedCellData.level)}
            </div>
            <ul className="space-y-1">
              {selectedCellData.reasons.map((r) => (
                <li key={r} className="text-[12px] text-[#5B665E] leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
            {selectedAdvice && onSelectAdvisory ? (
              <button
                type="button"
                onClick={() => onSelectAdvisory(selectedAdvice)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1F4A34] hover:underline cursor-pointer"
              >
                <span>Advice: {selectedAdvice.title}</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            ) : (
              <p className="text-[12px] text-[#5B665E]">No advice from your officer for this crop right now.</p>
            )}
          </div>
        )}

        {/* Caption below matrix */}
        <div className="pt-3 border-t border-[rgba(31,74,52,0.06)] mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[#5B665E]">
          <Info className="w-4 h-4 text-[#1F4A34] flex-shrink-0" strokeWidth={1.5} />
          <span className="font-medium text-[#17271D]">{CROP_RISK_MODEL_LABEL}.</span>
          <span>
            Uses the 10-day forecast, the warning rules and active warnings. Tap a cell to see{' '}
            {isOfficer ? 'crop risk details' : 'why'}.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICER CROP RISK DRAWER (FIX 5: Drawer title "Crop risk") */}
      {/* ========================================================================= */}
      {isOfficer && selectedCell && selectedCellData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedCell(null)}
        >
          <div
            className="w-full max-w-md bg-[#FBFCF8] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
                <div>
                  <h3 className="text-[20px] font-semibold text-[#17271D]">Crop risk</h3>
                  <p className="text-[12px] text-[#5B665E] mt-0.5">{selectedCell.crop} · Musanze District</p>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-[#F4F6EF] flex items-center justify-center text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#5B665E] font-medium">Risk level</span>
                    {getLevelChip(selectedCellData.level)}
                  </div>
                  <div className="text-[14px] font-semibold text-[#17271D]">{selectedHazardLabel}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.08)] space-y-1">
                  <span className="text-[11.5px] text-[#5B665E] block font-medium">Affected sectors</span>
                  <span className="text-[13.5px] font-semibold text-[#17271D] block">
                    {selectedCellData.sectors.length ? selectedCellData.sectors.join(', ') : 'None at Watch or above'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.08)] space-y-1.5">
                  <span className="text-[11.5px] text-[#5B665E] block font-medium">Why · {CROP_RISK_MODEL_LABEL}</span>
                  <ul className="space-y-1">
                    {selectedCellData.reasons.map((r) => (
                      <li key={r} className="text-[12.5px] text-[#17271D] leading-relaxed">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.12)] space-y-1.5">
                  <span className="text-[11.5px] text-[#1F4A34] block font-semibold">Linked active warning</span>
                  {selectedWarning ? (
                    <>
                      <div className="text-[13.5px] font-semibold text-[#17271D]">{selectedWarning.title}</div>
                      <div className="text-[12px] text-[#5B665E] tabular-nums">
                        {(selectedWarning.totalSent ?? 0).toLocaleString()} farmers sent ·{' '}
                        {selectedWarning.acknowledgedPct ?? 0}% acknowledged
                      </div>
                    </>
                  ) : (
                    <div className="text-[12px] text-[#5B665E]">No active warning for this hazard and crop.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-full bg-[#F4F6EF] text-[#5B665E] text-[12.5px] font-medium hover:text-[#17271D]"
              >
                Close
              </button>
              {selectedWarning && (
                <button
                  onClick={() => {
                    const wid = selectedWarning.id;
                    setSelectedCell(null);
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
