import React, { useState } from 'react';
import { Cloud, CloudDrizzle, CloudRain, CloudRainWind, CloudSun, Sun } from 'lucide-react';
import { RiskLevel, StationReading, ThresholdRuleItem, WeatherForecastDay } from '../types';
import { FORECAST_RISK_DAYS, RISK_LEVEL_COLORS, RainCondition, rainCondition, rainThresholds, riskForRain } from '../data/musanzeData';

type Metric = 'rain' | 'temp';

/** Days shown in the row under the chart. */
const DAY_ROW_COUNT = 8;

const CONDITION_ICON: Record<RainCondition, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Dry: Sun,
  'Mostly dry': CloudSun,
  'Light rain': CloudDrizzle,
  Rain: CloudRain,
  'Heavy rain': CloudRainWind,
};

interface WeatherForecastCardProps {
  /** The farmer's sector forecast from the store (30 days from today). */
  days: WeatherForecastDay[];
  /** Latest station reading for the farmer's sector. */
  reading?: StationReading;
  sector: string;
  rules: ThresholdRuleItem[];
  /** Who or what produced the forecast now in the store. */
  forecastSource: string;
}

/** Farmer dashboard weather card: now (station reading), next 10 days chart (rain or temperature), 8-day row. */
export const WeatherForecastCard: React.FC<WeatherForecastCardProps> = ({ days, reading, sector, rules, forecastSource }) => {
  const [metric, setMetric] = useState<Metric>('rain');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const thresholds = rainThresholds(rules);
  const watch = thresholds[0];
  const chartDays = days.slice(0, FORECAST_RISK_DAYS);
  const rowDays = days.slice(0, DAY_ROW_COUNT);
  const today = days[0];
  const todayCondition = today ? rainCondition(today.rainfallMm, rules) : null;
  const TodayIcon = todayCondition ? CONDITION_ICON[todayCondition] : Cloud;

  const rainTotal = chartDays.reduce((sum, d) => sum + d.rainfallMm, 0);
  const highs = chartDays.map((d) => d.temp);
  const lows = chartDays.map((d) => d.tempMin ?? d.temp);

  // Chart geometry
  const width = 680;
  const height = 200;
  const paddingX = 42;
  const paddingTop = 30;
  const paddingBottom = 36;
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  // Even y-axis steps: rain 10 mm (at least 50 and above the Watch line), temperature 5 °C
  const values = metric === 'rain' ? chartDays.map((d) => d.rainfallMm) : highs;
  const step = metric === 'rain' ? 10 : 5;
  const yMin = metric === 'rain' ? 0 : Math.floor((Math.min(...values) - 1) / step) * step;
  const yMax =
    metric === 'rain'
      ? Math.max(50, Math.ceil(Math.max(0, ...values, watch ? watch.value : 0) / step) * step)
      : Math.ceil((Math.max(...values) + 1) / step) * step;
  const yFor = (v: number) => paddingTop + chartHeight - ((v - yMin) / (yMax - yMin || 1)) * chartHeight;
  const ticks = Array.from({ length: Math.round((yMax - yMin) / step) + 1 }, (_, i) => yMin + i * step);

  const points = values.map((v, i) => ({
    x: paddingX + (chartDays.length > 1 ? (i / (chartDays.length - 1)) * chartWidth : chartWidth / 2),
    y: yFor(v),
    value: v,
    day: chartDays[i],
    index: i,
  }));

  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.y} ${midX},${pt.y} ${pt.x},${pt.y}`;
  }, '');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`
      : '';

  const levelFor = (mm: number): RiskLevel => riskForRain(mm, thresholds);
  // Rain values are plain mm (the legend names the unit) so labels stay short
  const unit = metric === 'rain' ? '' : '°';
  const chip =
    metric === 'rain'
      ? `${rainTotal} mm in ${chartDays.length} days`
      : `${Math.min(...lows)}° to ${Math.max(...highs)}°C`;

  if (days.length === 0) {
    return (
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] h-full flex flex-col items-center justify-center gap-2 text-center">
        <Cloud className="w-6 h-6 text-[#5B665E]" strokeWidth={1.5} />
        <p className="text-[13px] text-[#5B665E]">No forecast for {sector} yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col gap-4 h-full">
      {/* Now: latest station reading + today's forecast rain */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#E4ECDB] border border-[rgba(31,74,52,0.12)] flex items-center justify-center text-[#1F4A34] flex-shrink-0">
            <TodayIcon className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div className="text-[28px] font-semibold text-[#17271D] tabular-nums leading-none">
            {reading ? `${reading.tempC}°C` : '—'}
          </div>
          <div className="text-[12.5px] text-[#5B665E] tabular-nums leading-relaxed">
            <div>Rain today: {today.rainfallMm} mm</div>
            <div>Humidity: {reading ? `${reading.humidityPct}%` : '—'}</div>
            <div>Wind: {reading?.windKmh !== undefined ? `${reading.windKmh} km/h` : '—'}</div>
          </div>
        </div>
        <div className="sm:text-right">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Weather forecast</h3>
          <p className="text-[12.5px] text-[#5B665E]">
            {sector} · {todayCondition}
          </p>
          <p className="text-[12px] text-[#5B665E] tabular-nums">
            {reading ? `${reading.station} · ${reading.date.slice(0, 5)} ${reading.time}` : 'No station reading yet'}
          </p>
        </div>
      </div>

      {/* Metric switch + computed chip + legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-medium border border-[rgba(31,74,52,0.10)] tabular-nums">
            {chip}
          </span>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#5B665E]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#3E8E55] rounded-full inline-block" />
              <span>{metric === 'rain' ? 'Rain per day' : 'Day high'}</span>
            </span>
            {metric === 'rain' && watch && (
              <span className="flex items-center gap-1">
                <span className="w-3 border-b border-dashed border-[#D9A032] inline-block" />
                <span>Heavy rain ({watch.value} mm)</span>
              </span>
            )}
          </div>
        </div>
        <div role="tablist" className="flex items-center bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
          {(
            [
              { id: 'rain', label: 'Rain' },
              { id: 'temp', label: 'Temperature' },
            ] as { id: Metric; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={metric === tab.id}
              onClick={() => setMetric(tab.id)}
              className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                metric === tab.id ? 'bg-[#3E8E55] text-white shadow-xs' : 'text-[#5B665E] hover:text-[#17271D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart: next FORECAST_RISK_DAYS days */}
      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3E8E55" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3E8E55" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {ticks.map((val) => {
            const y = yFor(val);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(31,74,52,0.10)"
                  strokeDasharray={val === yMin ? undefined : '3 3'}
                />
                <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[12px] fill-[#5B665E] font-medium">
                  {val}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#forecastGradient)" />

          {/* Watch level of the officer's rain rule: the line a warning is measured against */}
          {metric === 'rain' && watch && (
            <line
              x1={paddingX}
              y1={yFor(watch.value)}
              x2={width - paddingX}
              y2={yFor(watch.value)}
              stroke="#D9A032"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}

          <path d={linePath} fill="none" stroke="#3E8E55" strokeWidth="2.5" strokeLinecap="round" />

          {points.map((pt) => {
            const isHovered = hoveredIndex === pt.index;
            const level = levelFor(pt.day.rainfallMm);
            const atRisk = metric === 'rain' && level !== 'Low';
            return (
              <g
                key={pt.index}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(pt.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Wide invisible hit area */}
                <rect
                  x={pt.x - chartWidth / (2 * Math.max(1, chartDays.length - 1))}
                  y={paddingTop}
                  width={chartWidth / Math.max(1, chartDays.length - 1)}
                  height={chartHeight}
                  fill="transparent"
                />
                {isHovered && (
                  <line x1={pt.x} y1={paddingTop} x2={pt.x} y2={height - paddingBottom} stroke="rgba(31,74,52,0.25)" strokeDasharray="2 2" />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={atRisk ? 5 : isHovered ? 4.5 : 3}
                  fill={atRisk ? RISK_LEVEL_COLORS[level] : isHovered ? '#1F4A34' : '#3E8E55'}
                  stroke="#FBFCF8"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  className={`text-[12px] tabular-nums ${isHovered || atRisk ? 'fill-[#17271D] font-semibold' : 'fill-[#5B665E]'}`}
                >
                  {pt.value}
                  {unit}
                </text>
                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[12px] ${isHovered ? 'fill-[#17271D] font-medium' : 'fill-[#5B665E]'}`}
                >
                  {`${pt.day.day} ${pt.day.fullDate.split(' ')[1] || ''}`.trim()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Day row */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {rowDays.map((d, i) => {
          const condition = rainCondition(d.rainfallMm, rules);
          const Icon = CONDITION_ICON[condition];
          const level = levelFor(d.rainfallMm);
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              title={`${condition}, ${d.rainfallMm} mm`}
              className={`flex flex-col items-center gap-1 py-2 rounded-[12px] border transition-colors ${
                isHovered || i === 0 ? 'bg-[#E4ECDB]/60 border-[rgba(31,74,52,0.12)]' : 'border-transparent'
              }`}
            >
              <span className="text-[12px] font-semibold text-[#17271D]">{i === 0 ? 'Today' : d.day}</span>
              <Icon className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
              <span className="text-[12px] tabular-nums">
                <span className="font-semibold text-[#17271D]">{d.temp}°</span>{' '}
                <span className="text-[#5B665E]">{d.tempMin !== undefined ? `${d.tempMin}°` : ''}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#5B665E] tabular-nums">
                {level !== 'Low' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: RISK_LEVEL_COLORS[level] }}
                    aria-label={`${level} level rain`}
                  />
                )}
                {d.rainfallMm} mm
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[#5B665E]">Forecast: {forecastSource}</p>
    </div>
  );
};
