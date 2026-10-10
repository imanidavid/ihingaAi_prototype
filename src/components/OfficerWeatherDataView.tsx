import React, { useMemo } from 'react';
import { CloudRain, FileSpreadsheet, Lock, Thermometer } from 'lucide-react';
import { DataSourceStatus, PermissionId, SectorRainForecast, StationReading } from '../types';
import { parseRainGaugeCsv, sourceCompleteness, stampSortKey } from '../data/musanzeData';
import { CARD_CLASS, EmptyState, IconCircle, NeutralChip, PageHeader } from './coop/CoopUi';
import { ForecastUploadCard, ManualUploadCard } from './officer/WeatherUploadCards';

const LATEST_READINGS_SHOWN = 10;

interface OfficerWeatherDataViewProps {
  permissions: PermissionId[];
  dataSources: DataSourceStatus[];
  stationReadings: StationReading[];
  rainForecasts: SectorRainForecast[];
  onUploadReadings: (rows: ReturnType<typeof parseRainGaugeCsv>['rows']) => void;
  onUploadForecast: (updates: { sector: string; dayIndex: number; rainMm: number }[]) => void;
}

/** The officer's manual data upload: station readings and rain forecast days. The administrator keeps the feed connections. */
export const OfficerWeatherDataView: React.FC<OfficerWeatherDataViewProps> = ({
  permissions,
  dataSources,
  stationReadings,
  rainForecasts,
  onUploadReadings,
  onUploadForecast,
}) => {
  const canUpload = permissions.includes('upload_weather_data');
  const manualSources = dataSources.filter((d) => d.kind === 'File upload');
  const latest = useMemo(
    () =>
      stationReadings
        .map((r, i) => ({ r, i }))
        .sort((a, b) => stampSortKey(`${b.r.date} ${b.r.time}`) - stampSortKey(`${a.r.date} ${a.r.time}`) || b.i - a.i)
        .slice(0, LATEST_READINGS_SHOWN)
        .map(({ r }) => r),
    [stationReadings]
  );
  const forecastSources = Array.from(new Set(rainForecasts.map((f) => f.source)));

  if (!canUpload) {
    return (
      <div className="space-y-6">
        <PageHeader title="Weather data" subtitle="Station readings and rain forecasts" />
        <div className={CARD_CLASS}>
          <EmptyState icon={Lock} text="Your role no longer has the “Upload weather data” permission. Ask the administrator." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weather data"
        subtitle="Upload station readings and rain forecasts. They update farmer weather and sector risk at once."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {manualSources.map((d) => (
          <div key={d.id} className={`${CARD_CLASS} p-5 flex items-center gap-4`}>
            <IconCircle icon={FileSpreadsheet} />
            <div className="min-w-0">
              <span className="block text-[12px] text-[#5B665E]">{d.name} · readings received</span>
              <span className="block text-[22px] font-semibold text-[#17271D] tabular-nums leading-tight">
                {d.recordsToday} of {d.expectedToday}
              </span>
              <span className="block text-[12px] text-[#5B665E] tabular-nums">
                {sourceCompleteness(d)}% · last upload {d.lastSync}
              </span>
            </div>
          </div>
        ))}
        <div className={`${CARD_CLASS} p-5 flex items-center gap-4`}>
          <IconCircle icon={Thermometer} />
          <div className="min-w-0">
            <span className="block text-[12px] text-[#5B665E]">Station readings stored</span>
            <span className="block text-[22px] font-semibold text-[#17271D] tabular-nums leading-tight">{stationReadings.length}</span>
            <span className="block text-[12px] text-[#5B665E] tabular-nums">
              {new Set(stationReadings.map((r) => r.station)).size} stations
            </span>
          </div>
        </div>
        <div className={`${CARD_CLASS} p-5 flex items-center gap-4`}>
          <IconCircle icon={CloudRain} />
          <div className="min-w-0">
            <span className="block text-[12px] text-[#5B665E]">Rain forecast in use</span>
            <span className="block text-[14px] font-semibold text-[#17271D]">{forecastSources.join(' · ')}</span>
            <span className="block text-[12px] text-[#5B665E] tabular-nums">{rainForecasts.length} sectors</span>
          </div>
        </div>
      </div>

      <ManualUploadCard onUpload={onUploadReadings} />
      <ForecastUploadCard forecasts={rainForecasts} onUpload={onUploadForecast} />

      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
        <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Latest station readings</h3>
          <p className="text-[12px] text-[#5B665E]">Newest first. The newest reading for a sector is the weather farmers there see.</p>
        </div>
        {latest.length === 0 ? (
          <EmptyState icon={Thermometer} text="No station readings yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                  <th className="py-2.5 pr-3 font-semibold">Station</th>
                  <th className="py-2.5 px-3 font-semibold">Sector</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Rain</th>
                  <th className="py-2.5 px-3 font-semibold">Temperature</th>
                  <th className="py-2.5 px-3 font-semibold">Humidity</th>
                  <th className="py-2.5 px-3 font-semibold">Wind</th>
                  <th className="py-2.5 pl-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                {latest.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 text-[#17271D]">{r.station}</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.sector}</td>
                    <td className="py-2.5 px-3 text-[#17271D] whitespace-nowrap">
                      {r.date} {r.time}
                    </td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.rainMm === undefined ? '—' : `${r.rainMm} mm`}</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.tempC}°C</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.humidityPct}%</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.windKmh === undefined ? '—' : `${r.windKmh} km/h`}</td>
                    <td className="py-2.5 pl-3">
                      <NeutralChip tone={r.source === 'Manual upload' ? 'tint' : 'outline'}>{r.source}</NeutralChip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
