import React, { useMemo } from 'react';
import {
  ArrowRight,
  Check,
  CloudRain,
  Database,
  FileText,
  FlaskConical,
  Info,
  LineChart,
  ShieldCheck,
  Table2,
  Target,
  X,
} from 'lucide-react';
import { DataSourceStatus, NavView, ReportItem, UserAccount, WarningItem } from '../types';
import {
  FORECAST_VS_OBSERVED,
  anonymisedReportId,
  computeDistrictClimateRisk,
  computeForecastSkill,
  computeReportValidation,
  computeWarningHitRate,
  heroImg,
  stampSortKey,
} from '../data/musanzeData';
import { MUSANZE_SECTORS } from '../data/rwandaAdminData';
import { CARD_CLASS, EmptyState, IconCircle, NeutralChip } from './coop/CoopUi';
import { ForecastObservedChart } from './research/ForecastObservedChart';

interface ResearcherDashboardViewProps {
  warnings: WarningItem[];
  reports: ReportItem[];
  dataSources: DataSourceStatus[];
  currentAccount?: UserAccount;
  onNavigateView: (view: NavView) => void;
}

/** 'DD/MM HH:MM' (2026) -> sortable */
const reportKey = (d: string) => stampSortKey(`${d.slice(0, 5)}/2026 ${d.slice(6, 11) || '00:00'}`);

export const ResearcherDashboardView: React.FC<ResearcherDashboardViewProps> = ({
  warnings,
  reports,
  dataSources,
  currentAccount,
  onNavigateView,
}) => {
  const firstName = currentAccount?.fullName.split(' ')[0];
  const skill = useMemo(() => computeForecastSkill(FORECAST_VS_OBSERVED), []);
  const hitRate = useMemo(() => computeWarningHitRate(warnings), [warnings]);
  const validation = useMemo(() => computeReportValidation(reports), [reports]);
  const districtRisk = computeDistrictClimateRisk([...MUSANZE_SECTORS], warnings);
  const healthy = dataSources.filter((d) => d.status === 'Healthy').length;
  const latest = [...validation.reports].sort((a, b) => reportKey(b.date) - reportKey(a.date)).slice(0, 5);

  const kpis = [
    { icon: Target, label: 'Rain forecast hits, 10 days', value: `${skill.pct}%`, caption: `${skill.hits} of ${skill.days} days within 3 mm or 20%` },
    { icon: ShieldCheck, label: 'Warnings confirmed', value: `${hitRate.confirmed} of ${hitRate.total}`, caption: `${hitRate.pct}% confirmed by field reports` },
    { icon: Check, label: 'Reports matching forecast', value: `${validation.pct}%`, caption: `${validation.matched} of ${validation.used} weather reports` },
    { icon: Database, label: 'Data sources healthy', value: `${healthy} of ${dataSources.length}`, caption: `District risk now: ${districtRisk}` },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative w-full rounded-[16px] overflow-hidden shadow-[0_2px_12px_rgba(31,74,52,0.08)] bg-gradient-to-r from-[#1F4A34] to-[#2C6343] min-h-[190px] flex items-center">
        <div className="absolute right-0 top-0 bottom-0 w-[40%] pointer-events-none select-none overflow-hidden">
          <img src={heroImg} alt="Terraced fields in Musanze" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F4A34] via-[#1F4A34]/60 to-transparent" />
        </div>
        <div className="relative z-10 p-6 md:p-8 max-w-2xl text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[12px] font-medium mb-2.5">
            <FlaskConical className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
            <span>Research desk · prototype results, simulated data</span>
          </div>
          <h1 className="text-[28px] font-normal leading-tight">
            Good afternoon{firstName ? `, ${firstName}` : ''}. The rain forecast hit {skill.hits} of the last {skill.days} days.
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              type="button"
              onClick={() => onNavigateView('model_performance')}
              className="px-4 py-1.5 rounded-full bg-white text-[#17271D] text-[12px] font-semibold hover:bg-[#F4F6EF] cursor-pointer flex items-center gap-1.5"
            >
              <LineChart className="w-3.5 h-3.5 text-[#1F4A34]" />
              <span>Model performance</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateView('field_data')}
              className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 cursor-pointer"
            >
              Field data
            </button>
            <button
              type="button"
              onClick={() => onNavigateView('forecast')}
              className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 cursor-pointer"
            >
              Risk forecast
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${CARD_CLASS} p-5 flex items-start gap-3`}>
            <IconCircle icon={k.icon} />
            <div className="min-w-0">
              <span className="block text-[12px] text-[#5B665E]">{k.label}</span>
              <span className="block text-[22px] font-semibold text-[#17271D] tabular-nums leading-tight mt-0.5">{k.value}</span>
              <span className="block text-[12px] text-[#5B665E] mt-0.5">{k.caption}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Forecast vs observed */}
        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-8 space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <div>
              <h3 className="text-[16px] font-semibold text-[#17271D]">Forecast vs observed rain · Kinigi</h3>
              <p className="text-[12px] text-[#5B665E] tabular-nums">
                Last {FORECAST_VS_OBSERVED.length} days · forecast {skill.forecastTotal} mm, observed {skill.observedTotal} mm
              </p>
            </div>
            <NeutralChip tone="outline">Simulated results</NeutralChip>
          </div>
          <ForecastObservedChart data={FORECAST_VS_OBSERVED} compact />
        </div>

        {/* Latest validated reports (anonymised) */}
        <div className={`${CARD_CLASS} p-5 lg:col-span-4 space-y-3`}>
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <div>
              <h3 className="text-[16px] font-semibold text-[#17271D]">Latest field checks</h3>
              <p className="text-[12px] text-[#5B665E]">Anonymised · no farmer names</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateView('field_data')}
              aria-label="Open field data"
              className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
          {latest.length === 0 ? (
            <EmptyState icon={Table2} text="No weather reports yet." />
          ) : (
            <div className="divide-y divide-[rgba(31,74,52,0.06)]">
              {latest.map((r) => (
                <div key={r.id} className="py-2.5 flex items-start justify-between gap-2 text-[12.5px]">
                  <div>
                    <span className="block font-semibold text-[#17271D] tabular-nums">
                      {anonymisedReportId(r.id)} · {r.sector}
                    </span>
                    <span className="block text-[#5B665E] tabular-nums">
                      {r.type} · {r.date}
                    </span>
                  </div>
                  <NeutralChip tone={r.isConsistent ? 'tint' : 'outline'}>
                    {r.isConsistent ? <Check className="w-3 h-3" strokeWidth={2} /> : <X className="w-3 h-3" strokeWidth={2} />}
                    {r.isConsistent ? 'Matches' : 'Differs'}
                  </NeutralChip>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: CloudRain, title: 'Risk forecast', text: 'Sector risk, rainfall and crop risk for Musanze.', view: 'forecast' as NavView },
          { icon: Table2, title: 'Field data', text: `${reports.length} field reports, anonymised, ready to export.`, view: 'field_data' as NavView },
          { icon: FileText, title: 'Reports', text: 'Build, preview and export research reports.', view: 'reports' as NavView },
        ].map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onNavigateView(s.view)}
            className={`${CARD_CLASS} p-5 text-left flex items-start gap-3 hover:bg-white transition-colors cursor-pointer`}
          >
            <IconCircle icon={s.icon} />
            <div className="flex-1">
              <span className="block text-[14px] font-semibold text-[#17271D]">{s.title}</span>
              <span className="block text-[12.5px] text-[#5B665E]">{s.text}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#1F4A34] mt-1" strokeWidth={1.5} />
          </button>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-[12px] text-[#5B665E]">
        <Info className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
        All model results on this desk are prototype results from simulated data.
      </p>
    </div>
  );
};
