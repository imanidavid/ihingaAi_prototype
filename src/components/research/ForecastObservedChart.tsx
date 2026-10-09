import React from 'react';
import { forecastDayHit } from '../../data/musanzeData';

/** Two smooth lines: forecast (mid green) and observed (forest), with even y steps and dotted grid. */
export const ForecastObservedChart: React.FC<{
  data: { date: string; forecastMm: number; observedMm: number }[];
  compact?: boolean;
}> = ({ data, compact }) => {
  const width = 640;
  const height = compact ? 190 : 240;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 34;
  const step = 10;
  const maxY = Math.max(step, Math.ceil(Math.max(...data.flatMap((d) => [d.forecastMm, d.observedMm])) / step) * step);
  const ticks = Array.from({ length: maxY / step + 1 }, (_, i) => i * step);
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const x = (i: number) => padL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
  const y = (v: number) => padT + chartH - (v / maxY) * chartH;
  const path = (key: 'forecastMm' | 'observedMm') =>
    data.reduce((acc, d, i) => {
      if (i === 0) return `M ${x(i)},${y(d[key])}`;
      const mid = (x(i - 1) + x(i)) / 2;
      return `${acc} C ${mid},${y(data[i - 1][key])} ${mid},${y(d[key])} ${x(i)},${y(d[key])}`;
    }, '');
  const observed = path('observedMm');
  const area = `${observed} L ${x(data.length - 1)},${padT + chartH} L ${x(0)},${padT + chartH} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Forecast and observed rainfall">
        <defs>
          <linearGradient id="observedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F4A34" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#1F4A34" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke="rgba(31,74,52,0.12)" strokeDasharray="3 4" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#5B665E">
              {t}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#observedFill)" />
        <path d={observed} fill="none" stroke="#1F4A34" strokeWidth="2.5" strokeLinecap="round" />
        <path d={path('forecastMm')} fill="none" stroke="#3E8E55" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={d.date}>
            <circle cx={x(i)} cy={y(d.observedMm)} r="3.5" fill={forecastDayHit(d) ? '#1F4A34' : '#FBFCF8'} stroke="#1F4A34" strokeWidth="1.5">
              <title>
                {d.date}: forecast {d.forecastMm} mm, observed {d.observedMm} mm
              </title>
            </circle>
            {/* Labels counted back from the last day so the newest date is always shown, evenly spaced */}
            {(data.length - 1 - i) % (compact ? 3 : 2) === 0 && (
              <text x={x(i)} y={height - 12} textAnchor="middle" fontSize="12" fill="#5B665E">
                {d.date.slice(0, 5)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#5B665E] mt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 bg-[#1F4A34]" /> Observed (gauge)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-[#3E8E55]" /> Forecast (day before)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-[#1F4A34] bg-[#FBFCF8]" /> Open dot = missed by more than 3 mm / 20%
        </span>
      </div>
    </div>
  );
};
