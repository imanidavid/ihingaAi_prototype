import React, { useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, CloudRain, FileSpreadsheet, Upload } from 'lucide-react';
import { SectorRainForecast } from '../../types';
import { SAMPLE_FORECAST_CSV, SAMPLE_RAIN_GAUGE_CSV, parseForecastCsv, parseRainGaugeCsv } from '../../data/musanzeData';
import { CARD_CLASS, EmptyState, NeutralChip, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../coop/CoopUi';

/** Officer weather-data uploads: station readings and rain forecast days (CSV, checked row by row). */

// ---------------------------------------------------------------------------
export const ManualUploadCard: React.FC<{ onUpload: (rows: ReturnType<typeof parseRainGaugeCsv>['rows']) => void }> = ({ onUpload }) => {
  const [csv, setCsv] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => (csv === null ? null : parseRainGaugeCsv(csv)), [csv]);
  const valid = parsed ? parsed.rows.filter((r) => r.errors.length === 0) : [];

  return (
    <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(31,74,52,0.08)]">
        <div>
          <h3 className="text-[16px] font-semibold text-[#17271D]">Manual upload</h3>
          <p className="text-[12px] text-[#5B665E]">Station readings as CSV: station, date (DD/MM/YYYY), time (HH:MM), rain_mm, temp_c, humidity_pct. The newest reading for a farmer's sector is the weather on their dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              e.target.files?.[0]?.text().then(setCsv);
              e.target.value = '';
            }}
          />
          <button type="button" onClick={() => fileRef.current?.click()} className={SECONDARY_BUTTON}>
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
          <button type="button" onClick={() => setCsv(SAMPLE_RAIN_GAUGE_CSV)} className={SECONDARY_BUTTON}>
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Use sample file</span>
          </button>
          <button
            type="button"
            disabled={valid.length === 0}
            onClick={() => {
              onUpload(valid);
              setCsv(null);
            }}
            className={PRIMARY_BUTTON}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{valid.length === 0 ? 'Import valid rows' : `Import ${valid.length} valid rows`}</span>
          </button>
        </div>
      </div>
      {!parsed ? (
        <EmptyState icon={FileSpreadsheet} text="No file chosen yet." />
      ) : parsed.headerError ? (
        <p role="alert" className="text-[12.5px] text-[#17271D]">{parsed.headerError}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                <th className="py-2.5 pr-3 font-semibold">Line</th>
                <th className="py-2.5 px-3 font-semibold">Station</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Rain</th>
                <th className="py-2.5 px-3 font-semibold">Temperature</th>
                <th className="py-2.5 px-3 font-semibold">Humidity</th>
                <th className="py-2.5 pl-3 font-semibold">Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
              {parsed.rows.map((r) => (
                <tr key={r.line}>
                  <td className="py-2.5 pr-3 text-[#5B665E]">{r.line}</td>
                  <td className="py-2.5 px-3 text-[#17271D]">{r.station}</td>
                  <td className="py-2.5 px-3 text-[#17271D] whitespace-nowrap">
                    {r.date} {r.time}
                  </td>
                  <td className="py-2.5 px-3 text-[#17271D]">{Number.isNaN(r.rainMm) ? '—' : `${r.rainMm} mm`}</td>
                  <td className="py-2.5 px-3 text-[#17271D]">{Number.isNaN(r.tempC) ? '—' : `${r.tempC}°C`}</td>
                  <td className="py-2.5 px-3 text-[#17271D]">{Number.isNaN(r.humidityPct) ? '—' : `${r.humidityPct}%`}</td>
                  <td className="py-2.5 pl-3">
                    {r.errors.length === 0 ? (
                      <NeutralChip>
                        <Check className="w-3 h-3" strokeWidth={2} />
                        Ready
                      </NeutralChip>
                    ) : (
                      <span className="flex items-start gap-1.5 text-[12px] text-[#17271D]">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5" strokeWidth={1.5} />
                        {r.errors.join(' · ')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
/** Forecast upload: replaces days of the 30-day series in the store (rainfall outlook + sector forecast risk). */
export const ForecastUploadCard: React.FC<{
  forecasts: SectorRainForecast[];
  onUpload: (updates: { sector: string; dayIndex: number; rainMm: number }[]) => void;
}> = ({ forecasts, onUpload }) => {
  const [csv, setCsv] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => (csv === null ? null : parseForecastCsv(csv, forecasts)), [csv, forecasts]);
  const valid = parsed ? parsed.rows.filter((r) => r.errors.length === 0) : [];
  const sources = Array.from(new Set(forecasts.map((f) => f.source)));

  return (
    <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(31,74,52,0.08)]">
        <div>
          <h3 className="text-[16px] font-semibold text-[#17271D]">Rain forecast upload</h3>
          <p className="text-[12px] text-[#5B665E]">
            CSV: sector, date (DD/MM/YYYY), rain_mm. Replaces those days in the 30-day forecast; sector risk updates at once.
          </p>
          <p className="text-[12px] text-[#5B665E]">Current forecast: {sources.join(' · ')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              e.target.files?.[0]?.text().then(setCsv);
              e.target.value = '';
            }}
          />
          <button type="button" onClick={() => fileRef.current?.click()} className={SECONDARY_BUTTON}>
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
          <button type="button" onClick={() => setCsv(SAMPLE_FORECAST_CSV)} className={SECONDARY_BUTTON}>
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Use sample file</span>
          </button>
          <button
            type="button"
            disabled={valid.length === 0}
            onClick={() => {
              onUpload(valid.map((r) => ({ sector: r.sector, dayIndex: r.dayIndex, rainMm: r.rainMm })));
              setCsv(null);
            }}
            className={PRIMARY_BUTTON}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{valid.length === 0 ? 'Replace forecast days' : `Replace ${valid.length} forecast days`}</span>
          </button>
        </div>
      </div>
      {!parsed ? (
        <EmptyState icon={CloudRain} text="No file chosen yet." />
      ) : parsed.headerError ? (
        <p role="alert" className="text-[12.5px] text-[#17271D]">{parsed.headerError}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                <th className="py-2.5 pr-3 font-semibold">Line</th>
                <th className="py-2.5 px-3 font-semibold">Sector</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Now</th>
                <th className="py-2.5 px-3 font-semibold">New</th>
                <th className="py-2.5 pl-3 font-semibold">Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
              {parsed.rows.map((r) => {
                const current = forecasts.find((f) => f.sector === r.sector)?.dailyMm[r.dayIndex];
                return (
                  <tr key={r.line}>
                    <td className="py-2.5 pr-3 text-[#5B665E]">{r.line}</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.sector}</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.date}</td>
                    <td className="py-2.5 px-3 text-[#5B665E]">{current === undefined ? '—' : `${current} mm`}</td>
                    <td className="py-2.5 px-3 text-[#17271D] font-semibold">{Number.isNaN(r.rainMm) ? '—' : `${r.rainMm} mm`}</td>
                    <td className="py-2.5 pl-3">
                      {r.errors.length === 0 ? (
                        <NeutralChip>
                          <Check className="w-3 h-3" strokeWidth={2} />
                          Ready
                        </NeutralChip>
                      ) : (
                        <span className="flex items-start gap-1.5 text-[12px] text-[#17271D]">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5" strokeWidth={1.5} />
                          {r.errors.join(' · ')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
