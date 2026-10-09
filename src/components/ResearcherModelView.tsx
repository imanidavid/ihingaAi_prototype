import React, { useMemo } from 'react';
import { Check, Info, Ruler, Scale, ShieldCheck, Target, X } from 'lucide-react';
import { ReportItem, WarningItem } from '../types';
import {
  FORECAST_VS_OBSERVED,
  LONG_HORIZON_ACCURACY,
  RISK_LEVEL_COLORS,
  computeForecastSkill,
  computeReportValidation,
  computeWarningHitRate,
} from '../data/musanzeData';
import { CARD_CLASS, IconCircle, NeutralChip, PageHeader } from './coop/CoopUi';
import { ForecastObservedChart } from './research/ForecastObservedChart';

interface ResearcherModelViewProps {
  warnings: WarningItem[];
  reports: ReportItem[];
}

export const ResearcherModelView: React.FC<ResearcherModelViewProps> = ({ warnings, reports }) => {
  const skill = useMemo(() => computeForecastSkill(FORECAST_VS_OBSERVED), []);
  const hitRate = useMemo(() => computeWarningHitRate(warnings), [warnings]);
  const validation = useMemo(() => computeReportValidation(reports), [reports]);

  // Error band: 90% of days fall within ± this many mm (simple confidence range)
  const errorBand = useMemo(() => {
    const errs = FORECAST_VS_OBSERVED.map((d) => Math.abs(d.forecastMm - d.observedMm)).sort((a, b) => a - b);
    return errs[Math.min(errs.length - 1, Math.ceil(errs.length * 0.9) - 1)];
  }, []);

  const bySector = useMemo(() => {
    const map = new Map<string, { used: number; matched: number }>();
    validation.reports.forEach((r) => {
      const row = map.get(r.sector) || { used: 0, matched: 0 };
      row.used += 1;
      if (r.isConsistent) row.matched += 1;
      map.set(r.sector, row);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].used - a[1].used);
  }, [validation]);

  const horizons = [
    { horizon: '10 days', pct: skill.pct, basis: `${skill.hits} of ${skill.days} days within 3 mm or 20% (Kinigi gauge)`, illustrative: false },
    ...LONG_HORIZON_ACCURACY,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Model performance"
        subtitle="How well forecasts and warnings matched what happened · prototype results, simulated data"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Rain forecast hits, 10 days', value: `${skill.pct}%`, caption: `${skill.hits} of ${skill.days} days` },
          { icon: Ruler, label: 'Average error', value: `${skill.meanAbsErrorMm} mm`, caption: `90% of days within ±${errorBand} mm` },
          { icon: Scale, label: 'Bias', value: `${skill.biasMm > 0 ? '+' : ''}${skill.biasMm} mm/day`, caption: skill.biasMm < 0 ? 'Forecast a little too dry' : skill.biasMm > 0 ? 'Forecast a little too wet' : 'No bias' },
          { icon: ShieldCheck, label: 'Warning hit rate', value: `${hitRate.confirmed} of ${hitRate.total}`, caption: `${hitRate.pct}% confirmed by field reports` },
        ].map((k) => (
          <div key={k.label} className={`${CARD_CLASS} p-5 flex items-start gap-3`}>
            <IconCircle icon={k.icon} />
            <div>
              <span className="block text-[12px] text-[#5B665E]">{k.label}</span>
              <span className="block text-[22px] font-semibold text-[#17271D] tabular-nums leading-tight mt-0.5">{k.value}</span>
              <span className="block text-[12px] text-[#5B665E] mt-0.5">{k.caption}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#17271D]">Forecast vs observed rainfall · Kinigi</h3>
            <p className="text-[12px] text-[#5B665E] tabular-nums">
              {FORECAST_VS_OBSERVED[0].date} – {FORECAST_VS_OBSERVED[FORECAST_VS_OBSERVED.length - 1].date} · forecast total{' '}
              {skill.forecastTotal} mm, observed {skill.observedTotal} mm
            </p>
          </div>
          <NeutralChip tone="outline">Simulated results</NeutralChip>
        </div>
        <ForecastObservedChart data={FORECAST_VS_OBSERVED} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Accuracy by horizon */}
        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-5 space-y-4`}>
          <h3 className="text-[16px] font-semibold text-[#17271D] pb-3 border-b border-[rgba(31,74,52,0.08)]">Accuracy by horizon</h3>
          {horizons.map((h) => (
            <div key={h.horizon} className="space-y-1">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="font-medium text-[#17271D] flex items-center gap-2">
                  {h.horizon}
                  {h.illustrative && <NeutralChip tone="outline">Illustrative</NeutralChip>}
                </span>
                <span className="font-semibold text-[#17271D] tabular-nums">{h.pct}%</span>
              </div>
              <div className="w-full h-2 bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
                <div className="h-full bg-[#3E8E55] rounded-full" style={{ width: `${h.pct}%` }} />
              </div>
              <span className="block text-[12px] text-[#5B665E]">{h.basis}</span>
            </div>
          ))}
          <p className="flex items-start gap-1.5 text-[12px] text-[#5B665E]">
            <Info className="w-3.5 h-3.5 text-[#1F4A34] mt-0.5" strokeWidth={1.5} />
            Month and season need past seasons the prototype does not hold, so they are illustrative.
          </p>
        </div>

        {/* Warning hit rate */}
        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-7 space-y-3`}>
          <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <h3 className="text-[16px] font-semibold text-[#17271D]">Warning hit rate</h3>
            <p className="text-[12px] text-[#5B665E]">A warning is confirmed when farmers' field reports show the hazard happened.</p>
          </div>
          <div className="divide-y divide-[rgba(31,74,52,0.06)]">
            {warnings.map((w) => (
              <div key={w.id} className="py-2.5 flex items-center justify-between gap-3 text-[12.5px]">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: RISK_LEVEL_COLORS[w.severity] }} />
                  <div>
                    <span className="block font-semibold text-[#17271D]">
                      {w.title} · {w.severity}
                    </span>
                    <span className="block text-[#5B665E]">
                      {w.affectedArea} · {w.status === 'Active' ? 'Active' : `Ended ${w.endedDate || ''}`}
                    </span>
                  </div>
                </div>
                <NeutralChip tone={w.confirmedByReports ? 'tint' : 'outline'}>
                  {w.confirmedByReports ? <Check className="w-3 h-3" strokeWidth={2} /> : <X className="w-3 h-3" strokeWidth={2} />}
                  {w.confirmedByReports ? 'Confirmed' : 'Not confirmed'}
                </NeutralChip>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report-based validation */}
      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#17271D]">Report-based validation</h3>
            <p className="text-[12px] text-[#5B665E]">
              Rainfall and flood reports that reached an officer, checked against the forecast for that day and sector.
            </p>
          </div>
          <span className="text-[13px] font-semibold text-[#17271D] tabular-nums">
            {validation.matched} of {validation.used} matched · {validation.pct}%
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                <th className="py-2.5 pr-3 font-semibold">Sector</th>
                <th className="py-2.5 px-3 font-semibold text-right">Reports used</th>
                <th className="py-2.5 px-3 font-semibold text-right">Matched</th>
                <th className="py-2.5 pl-3 font-semibold">Match rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
              {bySector.map(([sector, row]) => {
                const pct = Math.round((row.matched / row.used) * 100);
                return (
                  <tr key={sector}>
                    <td className="py-2.5 pr-3 text-[#17271D] font-medium">{sector}</td>
                    <td className="py-2.5 px-3 text-right text-[#17271D]">{row.used}</td>
                    <td className="py-2.5 px-3 text-right text-[#17271D]">{row.matched}</td>
                    <td className="py-2.5 pl-3">
                      <div className="flex items-center gap-2">
                        <div className="w-28 h-2 bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
                          <div className="h-full bg-[#3E8E55] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[#17271D]">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
