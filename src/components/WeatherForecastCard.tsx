import React from 'react';
import { Cloud, CloudDrizzle, CloudRain, CloudRainWind, CloudSun, Sun } from 'lucide-react';
import { RiskLevel, StationReading, ThresholdRuleItem, WeatherForecastDay } from '../types';
import { FORECAST_RISK_DAYS, RISK_LEVEL_COLORS, RainCondition, rainCondition, rainThresholds, riskForRain } from '../data/musanzeData';



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

/** Farmer dashboard weather card: now (station reading) and one small card per day, with rain as the main number. */
export const WeatherForecastCard: React.FC<WeatherForecastCardProps> = ({ days, reading, sector, rules, forecastSource }) => {
  const thresholds = rainThresholds(rules);
  const watch = thresholds[0];
  const dayCards = days.slice(0, FORECAST_RISK_DAYS);
  const today = days[0];
  const todayCondition = today ? rainCondition(today.rainfallMm, rules) : null;
  const TodayIcon = todayCondition ? CONDITION_ICON[todayCondition] : Cloud;
  const rainTotal = dayCards.reduce((sum, d) => sum + d.rainfallMm, 0);
  const levelFor = (mm: number): RiskLevel => riskForRain(mm, thresholds);

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
          <div>
            <div className="text-[28px] font-semibold text-[#17271D] tabular-nums leading-none">{today.rainfallMm} mm</div>
            <div className="text-[12px] text-[#5B665E] mt-1">Rain today</div>
          </div>
          <div className="text-[12.5px] text-[#5B665E] tabular-nums leading-relaxed">
            <div>Now: {reading ? `${reading.tempC}°C` : '—'}</div>
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

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="px-2.5 py-0.5 rounded-full bg-[#E4ECDB] text-[#1F4A34] text-[11px] font-medium border border-[rgba(31,74,52,0.10)] tabular-nums">
          {rainTotal} mm in {dayCards.length} days
        </span>
        {watch && <span className="text-[11px] text-[#5B665E]">Heavy rain from {watch.value} mm a day</span>}
      </div>

      {/* One small card per day: rain first, temperatures small */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
        {dayCards.map((d, i) => {
          const condition = rainCondition(d.rainfallMm, rules);
          const Icon = CONDITION_ICON[condition];
          const level = levelFor(d.rainfallMm);
          return (
            <div
              key={i}
              title={`${condition}, ${d.rainfallMm} mm${level !== 'Low' ? ` · ${level}` : ''}`}
              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-[12px] border ${
                i === 0 ? 'bg-[#E4ECDB]/60 border-[rgba(31,74,52,0.12)]' : 'bg-white border-[rgba(31,74,52,0.08)]'
              }`}
              style={level !== 'Low' ? { borderColor: `${RISK_LEVEL_COLORS[level]}80` } : undefined}
            >
              <span className="text-[12px] font-semibold text-[#17271D]">{i === 0 ? 'Today' : d.day}</span>
              <span className="text-[11px] text-[#5B665E] tabular-nums">{d.fullDate.split(' ')[1]}</span>
              <Icon className="w-5 h-5 text-[#1F4A34]" strokeWidth={1.5} />
              <span className="text-[17px] font-semibold text-[#17271D] tabular-nums leading-none">{d.rainfallMm}</span>
              <span className="text-[11px] text-[#5B665E] -mt-0.5">mm</span>
              {level !== 'Low' ? (
                <span className="flex items-center gap-1 text-[10.5px] font-semibold text-[#17271D]">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: RISK_LEVEL_COLORS[level] }} />
                  {level}
                </span>
              ) : (
                <span className="text-[10.5px] text-transparent select-none" aria-hidden="true">
                  ·
                </span>
              )}
              <span className="text-[11px] text-[#5B665E] tabular-nums">
                {d.temp}°{d.tempMin !== undefined ? ` / ${d.tempMin}°` : ''}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[#5B665E]">Forecast: {forecastSource}</p>
    </div>
  );
};
