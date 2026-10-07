import React, { useState } from 'react';
import { RAINFALL_10D, RAINFALL_MONTH_30D, MUSANZE_RECORD } from '../data/musanzeData';

type TimeRange = '7D' | '10D' | '30D';

export const RainfallChartCard: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('10D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const rawData =
    range === '7D'
      ? RAINFALL_10D.slice(0, 7)
      : range === '10D'
      ? RAINFALL_10D
      : RAINFALL_MONTH_30D;

  // Chart coordinates calculation with 12px minimum axis labels
  const width = 680;
  const height = 195;
  const paddingX = 42;
  const paddingTop = 26;
  const paddingBottom = 36;

  const maxRain = 50; // max scale 50mm
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  const points = rawData.map((d, i) => {
    const x = paddingX + (i / (rawData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.rainfallMm / maxRain) * chartHeight;
    return { x, y, data: d, index: i };
  });

  // Build SVG path smoothly using cubic bezier curves
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.y} ${midX},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

  const peakPoint = points.find((p) => p.data.isPeak) || points[1];

  // Normal line: flat seasonal average of 13 mm per day (never follows forecast shape per FIX 6)
  const normalMm = 13;
  const normalY = paddingTop + chartHeight - (normalMm / maxRain) * chartHeight;

  // Comparison chip computed from data shown: (forecast total ÷ normal total for selected range − 1)
  const forecastTotal = rawData.reduce((sum, d) => sum + d.rainfallMm, 0);
  const normalTotal = rawData.length * normalMm;
  const comparisonPct = Math.round(((forecastTotal / normalTotal) - 1) * 100);
  const comparisonText = comparisonPct >= 0 ? `+${comparisonPct}% vs normal` : `${comparisonPct}% vs normal`;

  return (
    <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Rainfall outlook</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-medium border border-[rgba(31,74,52,0.10)] tabular-nums">
            {comparisonText}
          </span>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#5B665E] ml-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#3E8E55] rounded-full inline-block" />
              <span>Forecast</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 border-b border-dashed border-[#5B665E] inline-block" />
              <span>Normal (13 mm)</span>
            </span>
          </div>
        </div>

        {/* Segmented Filter */}
        <div className="flex items-center bg-[#F4F6EF] p-1 rounded-full border border-[rgba(31,74,52,0.08)]">
          {(['7D', '10D', '30D'] as TimeRange[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setRange(tab)}
              className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                range === tab
                  ? 'bg-[#3E8E55] text-white shadow-xs'
                  : 'text-[#5B665E] hover:text-[#17271D]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3E8E55" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3E8E55" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Dotted horizontal gridlines (0, 10, 20, 30, 40, 50 mm) */}
          {[0, 10, 20, 30, 40, 50].map((val) => {
            const y = paddingTop + chartHeight - (val / maxRain) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(31,74,52,0.10)"
                  strokeDasharray={val === 0 ? undefined : '3 3'}
                />
                {/* 12px minimum muted axis label */}
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[12px] fill-[#5B665E] font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Soft gradient area fill */}
          <path d={areaPath} fill="url(#rainGradient)" />

          {/* Dashed muted line = Normal seasonal average (13 mm flat per FIX 6) */}
          <line
            x1={paddingX}
            y1={normalY}
            x2={width - paddingX}
            y2={normalY}
            stroke="#5B665E"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke="#3E8E55"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points / Hover Interactions */}
          {points.map((pt) => {
            const isHovered = hoveredIndex === pt.index;
            const isPeak = pt.data.isPeak;

            // 30-day x-axis labels every 5 days as dates (28/09, 03/10, 08/10, 13/10, 18/10, 23/10)
            const dateLabels30D: Record<number, string> = {
              0: '28/09',
              5: '03/10',
              10: '08/10',
              15: '13/10',
              20: '18/10',
              25: '23/10',
            };

            const shouldShowXLabel =
              range === '30D' ? pt.index in dateLabels30D : true;

            const xLabelText =
              range === '30D'
                ? dateLabels30D[pt.index]
                : range === '7D'
                ? pt.data.day
                : `${pt.data.day} ${pt.data.fullDate.split(' ')[1] || ''}`.trim();

            return (
              <g
                key={pt.index}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(pt.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={height - paddingBottom}
                    stroke="rgba(31,74,52,0.25)"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isPeak ? 5 : isHovered ? 4.5 : 2.5}
                  fill={isPeak ? '#D9772F' : isHovered ? '#1F4A34' : '#3E8E55'}
                  stroke="#FBFCF8"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* X axis labels: 12px minimum font size, no overlapping */}
                {shouldShowXLabel && (
                  <text
                    x={pt.x}
                    y={height - 12}
                    textAnchor="middle"
                    className={`text-[12px] ${
                      isPeak
                        ? 'fill-[#D9772F] font-semibold'
                        : isHovered
                        ? 'fill-[#17271D] font-medium'
                        : 'fill-[#5B665E]'
                    }`}
                  >
                    {xLabelText}
                  </text>
                )}
              </g>
            );
          })}

          {/* Peak Highlight Callout */}
          {peakPoint && (
            <g transform={`translate(${peakPoint.x}, ${peakPoint.y - 14})`}>
              <rect
                x={range === '30D' ? '-45' : '-40'}
                y="-18"
                width={range === '30D' ? '90' : '80'}
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
                {range === '30D' ? '300 mm total' : `Peak ${peakPoint.data.rainfallMm} mm`}
              </text>
            </g>
          )}
        </svg>

        {/* Floating Tooltip if user hovers any point */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-[#1F4A34] text-white text-[12px] shadow-md -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 8}%`,
            }}
          >
            <div className="font-semibold">
              {points[hoveredIndex].data.day} ({points[hoveredIndex].data.fullDate})
            </div>
            <div className="text-[#E4ECDB] flex items-center gap-2">
              <span>Rainfall: {points[hoveredIndex].data.rainfallMm} mm</span>
              <span>·</span>
              <span>Normal: 13 mm</span>
              <span>·</span>
              <span>{points[hoveredIndex].data.temp}°C</span>
            </div>
          </div>
        )}
      </div>

      {/* Axis Unit Sub-label */}
      <div className="flex items-center justify-between text-[12px] text-[#5B665E] pt-2.5 border-t border-[rgba(31,74,52,0.06)] mt-2">
        <span>Precipitation depth (mm)</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D9772F]" />
          <span>Tuesday downpour peak (48 mm)</span>
        </span>
      </div>
    </div>
  );
};
