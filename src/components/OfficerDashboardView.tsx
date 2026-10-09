import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  Eye,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  X,
  MapPin,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { NavView, OfficerActiveWarning, ReportItem, RiskLevel, SectorRegisterEntry } from '../types';
import {
  OFFICER_DATA,
  NOW_DATE,
  LOW_RESPONSE_PCT,
  RISK_LEVEL_COLORS,
  FIELD_REPORT_WINDOW_DAYS,
  computeDistrictClimateRisk,
  computeSectorOverview,
  computeOfficerAttention,
  reportsInLastDays,
  totalRegisteredFarmers,
} from '../data/musanzeData';

interface OfficerDashboardViewProps {
  /** Active warnings with delivery totals computed from `warningDeliveries`. */
  activeWarnings: OfficerActiveWarning[];
  reports: ReportItem[];
  /** Registered farmers per sector (administrator's sector register). */
  sectorRegister: SectorRegisterEntry[];
  firstName: string;
  onNavigateView: (view: NavView) => void;
  onShowToast: (message: string) => void;
  /** Each sector's forecast risk (forecast series + threshold rules). */
  forecastRisk: Record<string, RiskLevel>;
}

const LEVELS_HIGH_FIRST: RiskLevel[] = ['Critical', 'High', 'Watch', 'Low'];

const joinAnd = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} & ${items[items.length - 1]}`;

export const OfficerDashboardView: React.FC<OfficerDashboardViewProps> = ({
  activeWarnings,
  reports,
  sectorRegister,
  firstName,
  onNavigateView,
  onShowToast,
  forecastRisk,
}) => {
  const [selectedSectorName, setSelectedSectorName] = useState<string | null>(null);

  // Every number on this page is computed from the store: warnings + delivery records, reports,
  // the sector register and the forecast risk.
  const sectors = useMemo(
    () => computeSectorOverview(sectorRegister, activeWarnings, reports, forecastRisk),
    [sectorRegister, activeWarnings, reports, forecastRisk]
  );
  const selectedSector = sectors.find((s) => s.name === selectedSectorName) || null;
  const districtRisk = computeDistrictClimateRisk(
    sectors.map((s) => s.name),
    activeWarnings,
    forecastRisk
  );
  const riskCountLine = LEVELS_HIGH_FIRST.map((lvl) => ({ lvl, n: sectors.filter((s) => s.risk === lvl).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.n} ${x.lvl}`)
    .join(' · ');
  const sectorsUnderWarning = sectors.filter((s) => s.warnings.length > 0);
  const affectedSectors = sectors.filter((s) => s.risk !== 'Low');
  const affectedFarmers = affectedSectors.reduce((sum, s) => sum + s.farmersCount, 0);
  const totalFarmers = totalRegisteredFarmers(sectorRegister);
  const reportsWaitingList = reports.filter((r) => r.status === 'Under review');
  const reports7Days = reportsInLastDays(reports).length;
  const attention = useMemo(() => computeOfficerAttention(activeWarnings, reports), [activeWarnings, reports]);
  const reportSortKey = (d: string) => `${d.slice(3, 5)}${d.slice(0, 2)}${d.slice(6)}`;
  const sectorRecentReports = selectedSector
    ? reportsInLastDays(reports)
        .filter((r) => r.sector === selectedSector.name)
        .sort((x, y) => reportSortKey(y.date).localeCompare(reportSortKey(x.date)))
    : [];
  const hour = NOW_DATE.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const heroHeading =
    activeWarnings.length === 0
      ? `${greeting}, ${firstName}. No active warnings in Musanze.`
      : `${greeting}, ${firstName}. ${activeWarnings.length} active ${activeWarnings.length === 1 ? 'warning' : 'warnings'} across ${sectorsUnderWarning.length} ${sectorsUnderWarning.length === 1 ? 'sector' : 'sectors'}.`;

  const getRiskChip = (risk: RiskLevel) => {
    const styles: Record<RiskLevel, string> = {
      Critical: 'bg-[#C93B3B]/15 text-[#C93B3B] border-[#C93B3B]/30',
      High: 'bg-[#D9772F]/20 text-[#B85718] border-[#D9772F]/30',
      Watch: 'bg-[#D9A032]/20 text-[#9E6905] border-[#D9A032]/30',
      Low: 'bg-[#3E8E55]/15 text-[#2E6B40] border-[#3E8E55]/25',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[risk]}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RISK_LEVEL_COLORS[risk] }} />
        <span>{risk}</span>
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Rainfall':
        return <CloudRain className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />;
      case 'Flood / damage':
        return <AlertTriangle className="w-4 h-4 text-[#D9A032]" strokeWidth={1.5} />;
      case 'Crop condition':
        return <Eye className="w-4 h-4 text-[#3E8E55]" strokeWidth={1.5} />;
      case 'Pest / disease':
      default:
        return <AlertTriangle className="w-4 h-4 text-[#D9772F]" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* BAND 1 — HERO BANNER (SAME COMPONENT STRUCTURE AS FARMER HERO) */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-[16px] overflow-hidden shadow-[0_2px_12px_rgba(31,74,52,0.08)] bg-gradient-to-r from-[#1F4A34] via-[#24543B] to-[#2C6343] min-h-[190px] flex items-center">
        {/* Right side photo fading into the green gradient (40% width) */}
        <div className="absolute right-0 top-0 bottom-0 w-[40%] pointer-events-none select-none overflow-hidden">
          <img
            src={OFFICER_DATA.heroPhoto}
            alt="Aerial view of terraced farmland around Musanze"
            className="w-full h-full object-cover object-center"
          />
          {/* Soft gradient blend masks */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#24543B] via-[#24543B]/60 to-transparent" />
          <div className="absolute inset-0 bg-[#1F4A34]/20 mix-blend-multiply" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full max-w-2xl text-white">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[12px] font-medium text-white mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={2} />
              <span>{OFFICER_DATA.heroBadge}</span>
            </div>

            {/* Heading: 28px font-normal (weight 400) */}
            <h1 className="text-[26px] md:text-[28px] font-normal text-white leading-tight tracking-tight line-clamp-2 max-w-xl">
              {heroHeading}
            </h1>
          </div>

          {/* Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={() => onNavigateView('observations')}
              className="px-4 py-1.5 rounded-full bg-white text-[#17271D] text-[12px] font-medium hover:bg-[#F4F6EF] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <Eye className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
              <span>Review observations ({reportsWaitingList.length})</span>
            </button>

            <button
              onClick={() => onNavigateView('warnings')}
              className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 hover:border-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
              <span>Open warnings</span>
            </button>

            <button
              onClick={() => onNavigateView('forecast')}
              className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 hover:border-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <CloudRain className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
              <span>Open risk forecast</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 2 — 4 KPI CARDS */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* KPI 1: District risk level (Active chip removed per FIX 2, computed per FIX 1) */}
        <div
          onClick={() => onNavigateView('forecast')}
          className="bg-[#FBFCF8] rounded-[16px] p-4 md:p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] hover:border-[rgba(31,74,52,0.25)] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#5B665E] text-[12.5px] mb-2">
            <span>District risk level</span>
            <span
              className={`w-2 h-2 rounded-full ${
                districtRisk === 'Critical'
                  ? 'bg-[#C93B3B]'
                  : districtRisk === 'High'
                  ? 'bg-[#D9772F]'
                  : districtRisk === 'Watch'
                  ? 'bg-[#D9A032]'
                  : 'bg-[#3E8E55]'
              }`}
            />
          </div>
          <div>
            <div className="text-[26px] font-semibold text-[#17271D]">
              {districtRisk}
            </div>
            <p className="text-[11.5px] text-[#5B665E] mt-1">
              Musanze District climate risk
            </p>
          </div>
        </div>

        {/* KPI 2: Active warnings */}
        <div
          onClick={() => onNavigateView('warnings')}
          className="bg-[#FBFCF8] rounded-[16px] p-4 md:p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] hover:border-[rgba(31,74,52,0.25)] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#5B665E] text-[12.5px] mb-2">
            <span>Active warnings</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[26px] font-semibold text-[#17271D]">
              {activeWarnings.length}
            </div>
            <p className="text-[11.5px] text-[#5B665E] mt-1">
              {activeWarnings.length === 0 ? 'No active warnings' : joinAnd(activeWarnings.map((w) => w.title))}
            </p>
          </div>
        </div>

        {/* KPI 3: Farmers in affected sectors */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-4 md:p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B665E] text-[12.5px] mb-2">
            <span>Farmers in affected sectors</span>
            <Users className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[26px] font-semibold text-[#17271D] tabular-nums">
              {affectedFarmers.toLocaleString()} of {totalFarmers.toLocaleString()}
            </div>
            <p className="text-[11.5px] text-[#5B665E] mt-1">
              {affectedSectors.length === 0
                ? 'No sector at Watch or above'
                : `${affectedSectors.length} ${affectedSectors.length === 1 ? 'sector' : 'sectors'} at Watch or above`}
            </p>
          </div>
        </div>

        {/* KPI 4: Reports to review */}
        <div
          onClick={() => onNavigateView('observations')}
          className="bg-[#FBFCF8] rounded-[16px] p-4 md:p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] hover:border-[rgba(31,74,52,0.25)] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#5B665E] text-[12.5px] mb-2">
            <span>Reports to review</span>
            <span className="w-5 h-5 rounded-full bg-[#1F4A34] text-white text-[11px] font-semibold flex items-center justify-center">
              {reportsWaitingList.length}
            </span>
          </div>
          <div>
            <div className="text-[26px] font-semibold text-[#17271D]">
              {reportsWaitingList.length}
            </div>
            <p className="text-[11.5px] text-[#5B665E] mt-1">
              {reports7Days} total in last {FIELD_REPORT_WINDOW_DAYS} days
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BAND 3 — 2/3 SECTOR OVERVIEW + 1/3 NEEDS YOUR ATTENTION */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 2/3 Width: Sector Overview Table (15 sectors sorted by risk) */}
        <div className="lg:col-span-8 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-[#17271D]">Sector overview</h2>
              <p className="text-[12.5px] text-[#5B665E]">
                {sectors.length} sectors in Musanze sorted by risk status · Click a row for sector reports
              </p>
            </div>
            <span className="text-[12px] font-medium text-[#1F4A34] bg-[#E4ECDB] px-3 py-1 rounded-full border border-[rgba(31,74,52,0.10)]">
              {riskCountLine}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(31,74,52,0.08)] text-[11.5px] font-semibold text-[#5B665E]">
                  <th className="pb-2.5 pl-2">Sector</th>
                  {/* FIX 1: Column header label: 'Climate risk' */}
                  <th className="pb-2.5">Climate risk</th>
                  <th className="pb-2.5">Active warnings</th>
                  <th className="pb-2.5">Farmers</th>
                  <th className="pb-2.5">Reports (7d)</th>
                  <th className="pb-2.5 pr-2 text-right">Acknowledged %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,74,52,0.06)] text-[13px]">
                {sectors.map((sec) => (
                  <tr
                    key={sec.name}
                    onClick={() => setSelectedSectorName(sec.name)}
                    className="hover:bg-[#F4F6EF]/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pl-2 font-medium text-[#17271D] flex items-center gap-1.5">
                      <span className="group-hover:text-[#1F4A34] transition-colors">{sec.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#5B665E]/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="py-3">{getRiskChip(sec.risk)}</td>
                    <td className="py-3 text-[#17271D] tabular-nums">
                      {sec.warnings.length > 0 ? (
                        <span className="font-semibold">{sec.warnings.length} active</span>
                      ) : (
                        <span className="text-[#5B665E]">—</span>
                      )}
                    </td>
                    <td className="py-3 text-[#17271D] tabular-nums text-[12.5px]">
                      {sec.farmersCount.toLocaleString()}
                    </td>
                    <td className="py-3 text-[#17271D] tabular-nums text-[12.5px]">{sec.reports7Days}</td>
                    <td className="py-3 pr-2 text-right font-medium">
                      {sec.acknowledgement.length > 0 ? (
                        <div className="flex flex-col items-end gap-1">
                          {sec.acknowledgement.map((a) => (
                            <span
                              key={a.warningId}
                              title={`${a.warningTitle}: ${a.acknowledged.toLocaleString()} of ${a.sent.toLocaleString()}`}
                              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#17271D] tabular-nums"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: RISK_LEVEL_COLORS[a.level] }}
                              />
                              <span>
                                {a.pct}% {a.warningTitle}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#5B665E]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 1/3 Width: Needs Your Attention Card */}
        <div className="lg:col-span-4 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#17271D]">Needs your attention</h2>
            <p className="text-[12.5px] text-[#5B665E]">
              {attention.length === 0
                ? 'Nothing waiting in Musanze'
                : `${attention.length} priority ${attention.length === 1 ? 'action' : 'actions'} in Musanze`}
            </p>
          </div>

          <div className="space-y-3.5">
            {attention.length === 0 && (
              <div className="p-4 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] flex items-center gap-2.5 text-[12.5px] text-[#5B665E]">
                <CheckCircle2 className="w-4 h-4 text-[#3E8E55] flex-shrink-0" strokeWidth={1.5} />
                <span>Every sector is above {LOW_RESPONSE_PCT}% and no pest report is waiting.</span>
              </div>
            )}
            {attention.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#F4F6EF]/70 border space-y-3"
                style={{
                  borderColor:
                    item.level === 'Low' ? 'rgba(31,74,52,0.10)' : `${RISK_LEVEL_COLORS[item.level]}59`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.kind === 'low_response' ? (
                      <PhoneCall className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.75} />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.75} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[13.5px] font-semibold text-[#17271D] leading-snug">{item.title}</h4>
                    <p className="text-[11.5px] text-[#5B665E]">{item.caption}</p>
                  </div>
                </div>

                <div className="pt-1">
                  {item.kind === 'low_response' ? (
                    <button
                      onClick={() =>
                        onShowToast(`Voice message queued for ${(item.unacknowledged || 0).toLocaleString()} farmers`)
                      }
                      className="w-full py-2 px-3 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
                      <span>Resend by voice call</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateView('observations')}
                      className="w-full py-2 px-3 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.20)] text-[12px] font-medium hover:bg-[#E4ECDB] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                      <span>Review report</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BAND 4 — WARNING DELIVERY CARD (FULL WIDTH) */}
      {/* ========================================================================= */}
      <section className="bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[rgba(31,74,52,0.06)]">
          <div>
            <h2 className="text-[18px] font-semibold text-[#17271D]">Warning delivery</h2>
            <p className="text-[12.5px] text-[#5B665E]">
              SMS and voice confirmation tracking across target sectors in Musanze
            </p>
          </div>
          <button
            onClick={() => onNavigateView('warnings')}
            className="text-[12.5px] font-medium text-[#1F4A34] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View all warnings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {activeWarnings.length === 0 && (
            <p className="text-[12.5px] text-[#5B665E]">No active warnings to track.</p>
          )}
          {activeWarnings.map((warn) => {
            const pct = warn.acknowledgedPct ?? 0;
            return (
              <div
                key={warn.id}
                className="p-4 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.08)] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left meta */}
                <div className="space-y-1.5 max-w-sm">
                  <div className="flex items-center gap-2">
                    {getRiskChip(warn.severity)}
                    <h3 className="text-[15px] font-semibold text-[#17271D]">{warn.title}</h3>
                  </div>
                  <div className="text-[12px] text-[#5B665E] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1F4A34]" />
                    <span>{warn.affectedArea}</span>
                  </div>
                </div>

                {/* Delivery stats and progress bar (from the delivery records) */}
                <div className="flex-1 max-w-md space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="text-[#5B665E]">
                      Sent: <strong className="text-[#17271D] tabular-nums">{(warn.totalSent ?? 0).toLocaleString()}</strong> ·
                      Delivered:{' '}
                      <strong className="text-[#17271D] tabular-nums">{(warn.totalDelivered ?? 0).toLocaleString()}</strong>
                    </span>
                    <span className="font-semibold text-[#1F4A34] tabular-nums">
                      {(warn.totalAcknowledged ?? 0).toLocaleString()} acknowledged ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[rgba(31,74,52,0.12)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3E8E55] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {(warn.totalAcknowledged ?? 0) > 0 && pct < LOW_RESPONSE_PCT && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border border-[rgba(31,74,52,0.25)] text-[#17271D] bg-[#FBFCF8]">
                      <AlertTriangle className="w-3 h-3 text-[#5B665E]" strokeWidth={1.5} />
                      <span>Low response</span>
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() =>
                      onShowToast(
                        `Voice & SMS reminder queued for ${(warn.unacknowledgedCount ?? 0).toLocaleString()} unacknowledged farmers`
                      )
                    }
                    className="px-3.5 py-1.5 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.22)] text-[12px] font-medium hover:bg-[#E4ECDB] transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    Resend to farmers who haven't acknowledged
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BAND 5 — REPORTS WAITING FOR REVIEW (FULL WIDTH) */}
      {/* ========================================================================= */}
      <section className="bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(31,74,52,0.06)]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold text-[#17271D]">Reports waiting for review</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#1F4A34] text-white text-[11px] font-semibold">
                {reportsWaitingList.length}
              </span>
            </div>
            <p className="text-[12.5px] text-[#5B665E]">
              Fresh community observations pending verification and advisory updates
            </p>
          </div>
          <button
            onClick={() => onNavigateView('observations')}
            className="text-[12.5px] font-medium text-[#1F4A34] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Observations log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[rgba(31,74,52,0.06)] border border-[rgba(31,74,52,0.08)] rounded-xl overflow-hidden bg-white">
          {reportsWaitingList.length === 0 && (
            <div className="p-4 text-center text-[12.5px] text-[#5B665E]">No reports are waiting for review.</div>
          )}
          {reportsWaitingList.map((rep) => (
            <div
              key={rep.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4F6EF]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F4F6EF] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getTypeIcon(rep.type)}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[14px] font-semibold text-[#17271D]">{rep.title}</h3>
                  <div className="text-[12px] text-[#5B665E] flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[#17271D]">{rep.farmer}</span>
                    <span>·</span>
                    <span>
                      {rep.sector} · {rep.cell}
                    </span>
                    <span>·</span>
                    <span className="text-[#1F4A34] font-medium tabular-nums">{rep.date}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateView('observations')}
                className="px-4 py-1.5 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer self-start sm:self-auto active:scale-98"
              >
                <span>Review</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTOR DETAIL DRAWER (FIX 4: Late Blight uses High #D9772F, real cell names) */}
      {/* ========================================================================= */}
      {selectedSector && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedSectorName(null)}
        >
          <div
            className="w-full max-w-md bg-[#FBFCF8] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[20px] font-semibold text-[#17271D]">
                      {selectedSector.name} sector
                    </h3>
                    {getRiskChip(selectedSector.risk)}
                  </div>
                  <p className="text-[12px] text-[#5B665E] mt-0.5">
                    Musanze District · Agricultural overview
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSectorName(null)}
                  className="w-8 h-8 rounded-full bg-[#F4F6EF] flex items-center justify-center text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)] text-center">
                  <span className="block text-[11px] text-[#5B665E]">Farmers</span>
                  <span className="text-[16px] font-semibold text-[#17271D]">
                    {selectedSector.farmersCount.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)] text-center">
                  <span className="block text-[11px] text-[#5B665E]">Active warnings</span>
                  <span className="text-[16px] font-semibold text-[#17271D]">
                    {selectedSector.warnings.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)] text-center">
                  <span className="block text-[11px] text-[#5B665E]">Acknowledged</span>
                  <span className="text-[14px] font-semibold text-[#17271D]">
                    {selectedSector.acknowledgement.length > 0
                      ? selectedSector.acknowledgement.map((a) => `${a.pct}%`).join(' / ')
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Warnings List (FIX 4: Late Blight row uses High #D9772F) */}
              <div className="space-y-2">
                <h4 className="text-[13px] font-semibold text-[#17271D]">Active warnings</h4>
                {selectedSector.warnings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSector.warnings.map((w) => {
                      const ack = selectedSector.acknowledgement.find((a) => a.warningId === w.id);
                      return (
                        <div
                          key={w.id}
                          className="p-3 rounded-xl border bg-[#F4F6EF]/70 border-[rgba(31,74,52,0.10)] flex items-center justify-between gap-2 text-[13px] text-[#17271D]"
                        >
                          <div className="space-y-0.5">
                            <span className="font-medium block">{w.title}</span>
                            {ack && (
                              <span className="text-[11.5px] text-[#5B665E] tabular-nums">
                                {ack.acknowledged.toLocaleString()} of {ack.sent.toLocaleString()} acknowledged ({ack.pct}%)
                              </span>
                            )}
                          </div>
                          {getRiskChip(w.level)}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#F4F6EF] text-[12.5px] text-[#5B665E]">
                    No active warnings for this sector.
                  </div>
                )}
              </div>

              {/* Recent Field Reports (FIX 4: Jean-Baptiste reports attributed to Bisoke cell) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-semibold text-[#17271D]">
                    Recent reports (last {FIELD_REPORT_WINDOW_DAYS} days)
                  </h4>
                  <span className="text-[11.5px] text-[#5B665E]">
                    {selectedSector.reports7Days} reported
                  </span>
                </div>

                <div className="divide-y divide-[rgba(31,74,52,0.06)] border border-[rgba(31,74,52,0.08)] rounded-xl overflow-hidden bg-white">
                  {sectorRecentReports.length > 0 ? (
                    sectorRecentReports.map((r) => (
                      <div key={r.id} className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-medium text-[#17271D]">{r.title}</span>
                          <span className="text-[11px] text-[#5B665E] tabular-nums">{r.date}</span>
                        </div>
                        <div className="text-[11.5px] text-[#5B665E] flex items-center gap-1.5">
                          <span className="font-medium text-[#17271D]">{r.farmer}</span>
                          <span>·</span>
                          <span>{r.cell}</span>
                          <span>·</span>
                          <span>{r.type}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[12px] text-[#5B665E]">
                      No reports in the last 7 days.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer (Sentence case) */}
            <div className="pt-4 border-t border-[rgba(31,74,52,0.08)] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedSectorName(null)}
                className="px-5 py-2 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-medium hover:bg-[#2C6343] transition-colors shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
