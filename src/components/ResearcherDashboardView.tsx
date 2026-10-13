import React, { useMemo } from 'react';
import { ArrowRight, Check, Download, FlaskConical, LineChart, Lock, ShieldCheck, Table2, Target, Users } from 'lucide-react';
import { NavView, PermissionId, ReportItem, SectorRainForecast, UserAccount, WarningItem } from '../types';
import {
  FORECAST_VS_OBSERVED,
  computeForecastSkill,
  computeReportValidation,
  computeWarningHitRate,
  forecastsToCsv,
  heroImg,
} from '../data/musanzeData';
import { CARD_CLASS, IconCircle, PRIMARY_BUTTON, SECONDARY_BUTTON } from './coop/CoopUi';

interface ResearcherDashboardViewProps {
  /** Warnings with delivery totals (sent / acknowledged). */
  warnings: WarningItem[];
  reports: ReportItem[];
  rainForecasts: SectorRainForecast[];
  permissions: PermissionId[];
  currentAccount?: UserAccount;
  onNavigateView: (view: NavView) => void;
  onExport: (what: string) => void;
}

/**
 * Research desk: one question — is the system working? Four answers (forecast, warnings, farmers
 * reached, farmer reports), each opening its detail page, and the data to download.
 */
export const ResearcherDashboardView: React.FC<ResearcherDashboardViewProps> = ({
  warnings,
  reports,
  rainForecasts,
  permissions,
  currentAccount,
  onNavigateView,
  onExport,
}) => {
  const firstName = currentAccount?.fullName.split(' ')[0];
  const skill = useMemo(() => computeForecastSkill(FORECAST_VS_OBSERVED), []);
  const hitRate = useMemo(() => computeWarningHitRate(warnings), [warnings]);
  const validation = useMemo(() => computeReportValidation(reports), [reports]);
  const active = warnings.filter((w) => w.status === 'Active');
  const sent = active.reduce((s, w) => s + (w.totalSent || 0), 0);
  const acknowledged = active.reduce((s, w) => s + (w.totalAcknowledged || 0), 0);
  const reachedPct = sent > 0 ? Math.round((acknowledged / sent) * 100) : 0;
  const canExport = permissions.includes('export_data');

  const answers = [
    {
      icon: Target,
      label: 'Rain forecast was right',
      value: `${skill.hits} of ${skill.days} days`,
      caption: 'Within 3 mm or 20% of the rain gauge',
      view: 'model_performance' as NavView,
    },
    {
      icon: ShieldCheck,
      label: 'Warnings that really happened',
      value: `${hitRate.confirmed} of ${hitRate.total}`,
      caption: "Farmers' reports confirmed the hazard",
      view: 'model_performance' as NavView,
    },
    {
      icon: Users,
      label: 'Farmers who saw the warnings',
      value: `${reachedPct}%`,
      caption: `${acknowledged.toLocaleString()} of ${sent.toLocaleString()} farmers acknowledged the active warnings`,
      view: 'model_performance' as NavView,
    },
    {
      icon: Check,
      label: 'Farmer reports that agree',
      value: `${validation.matched} of ${validation.used}`,
      caption: 'Rain and flood reports that match the forecast',
      view: 'field_data' as NavView,
    },
  ];

  const downloadForecasts = () => {
    const blob = new Blob([forecastsToCsv(rainForecasts)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ihinga-forecast-musanze.csv';
    a.click();
    URL.revokeObjectURL(url);
    onExport(`Forecast data CSV · ${rainForecasts.length} sectors`);
  };

  return (
    <div className="space-y-6">
      <div className="relative w-full rounded-[16px] overflow-hidden shadow-[0_2px_12px_rgba(31,74,52,0.08)] bg-gradient-to-r from-[#1F4A34] to-[#2C6343] min-h-[170px] flex items-center">
        <div className="absolute right-0 top-0 bottom-0 w-[40%] pointer-events-none select-none overflow-hidden">
          <img src={heroImg} alt="Terraced fields in Musanze" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F4A34] via-[#1F4A34]/60 to-transparent" />
        </div>
        <div className="relative z-10 p-6 md:p-8 max-w-2xl text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[12px] font-medium mb-2.5">
            <FlaskConical className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
            <span>Research desk · prototype results from simulated data</span>
          </div>
          <h1 className="text-[26px] font-normal leading-tight">
            Good afternoon{firstName ? `, ${firstName}` : ''}. Is IHINGA AI getting it right?
          </h1>
        </div>
      </div>

      {/* Four answers, each opens its detail page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {answers.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => onNavigateView(k.view)}
            className={`${CARD_CLASS} p-5 flex items-start gap-3 text-left hover:bg-white transition-colors cursor-pointer`}
          >
            <IconCircle icon={k.icon} />
            <span className="min-w-0">
              <span className="block text-[12.5px] text-[#5B665E]">{k.label}</span>
              <span className="block text-[22px] font-semibold text-[#17271D] tabular-nums leading-tight mt-0.5">{k.value}</span>
              <span className="block text-[12px] text-[#5B665E] mt-0.5">{k.caption}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Data to download */}
      <div className={`${CARD_CLASS} p-5 md:p-6`}>
        <h3 className="text-[16px] font-semibold text-[#17271D] pb-3 border-b border-[rgba(31,74,52,0.08)]">Data for your research</h3>
        <div className="divide-y divide-[rgba(31,74,52,0.06)]">
          <div className="py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <IconCircle icon={LineChart} />
              <div className="text-[12.5px]">
                <span className="block text-[14px] font-semibold text-[#17271D]">Forecast data</span>
                <span className="block text-[#5B665E]">
                  Rain and day high / low for {rainForecasts.length} sectors, {rainForecasts[0]?.dailyMm.length || 0} days · CSV
                </span>
              </div>
            </div>
            {canExport ? (
              <button type="button" onClick={downloadForecasts} className={PRIMARY_BUTTON}>
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-[12px] text-[#5B665E]">
                <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
                Needs the “Export data” permission
              </span>
            )}
          </div>
          <div className="py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <IconCircle icon={Table2} />
              <div className="text-[12.5px]">
                <span className="block text-[14px] font-semibold text-[#17271D]">Farmer field reports</span>
                <span className="block text-[#5B665E]">{reports.length} reports, no names or phone numbers · filter and download</span>
              </div>
            </div>
            <button type="button" onClick={() => onNavigateView('field_data')} className={SECONDARY_BUTTON}>
              <span>Open field data</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
