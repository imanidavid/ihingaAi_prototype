import React, { useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  Eye,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  RotateCcw,
  Check,
  X,
  MapPin,
  Users,
  FileText,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';
import { NavView, SectorOverviewItem, OfficerActiveWarning, ReportItem } from '../types';
import {
  OFFICER_DATA,
  computeSectorClimateRisk,
  computeDistrictClimateRisk,
} from '../data/musanzeData';

interface OfficerDashboardViewProps {
  activeWarningsCount?: number;
  activeWarnings?: OfficerActiveWarning[];
  reportsToReviewCount?: number;
  reports?: ReportItem[];
  onNavigateView: (view: NavView) => void;
  onShowToast: (message: string) => void;
}

export const OfficerDashboardView: React.FC<OfficerDashboardViewProps> = ({
  activeWarningsCount = 2,
  activeWarnings,
  reportsToReviewCount = 3,
  reports,
  onNavigateView,
  onShowToast,
}) => {
  const [selectedSector, setSelectedSector] = useState<SectorOverviewItem | null>(null);

  const reportsWaitingList = reports
    ? reports.filter((r) => r.status === 'Under review')
    : OFFICER_DATA.reportsWaitingForReview;
  const effectiveReportsToReviewCount = reports ? reportsWaitingList.length : reportsToReviewCount;

  // Compute District Climate Risk dynamically from active weather warnings (FIX 1)
  const computedDistrictRisk = activeWarnings
    ? computeDistrictClimateRisk(
        OFFICER_DATA.sectorOverviews.map((s) => s.name),
        activeWarnings
      )
    : OFFICER_DATA.districtRiskLevel;

  const getRiskChip = (risk: string) => {
    if (risk === 'Watch') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9A032]/20 text-[#9E6905] border border-[#D9A032]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D9A032]" />
          <span>Watch</span>
        </span>
      );
    }
    if (risk === 'High') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9772F]/20 text-[#B85718] border border-[#D9772F]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D9772F]" />
          <span>High</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#3E8E55]/15 text-[#2E6B40] border border-[#3E8E55]/25">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3E8E55]" />
        <span>Low</span>
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
              Good afternoon, Claudine. {activeWarningsCount} active warnings across 4 sectors.
            </h1>
          </div>

          {/* Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={() => onNavigateView('observations')}
              className="px-4 py-1.5 rounded-full bg-white text-[#17271D] text-[12px] font-medium hover:bg-[#F4F6EF] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <Eye className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
              <span>Review observations ({reportsToReviewCount})</span>
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
                computedDistrictRisk === 'Critical'
                  ? 'bg-[#C93B3B]'
                  : computedDistrictRisk === 'High'
                  ? 'bg-[#D9772F]'
                  : computedDistrictRisk === 'Watch'
                  ? 'bg-[#D9A032]'
                  : 'bg-[#3E8E55]'
              }`}
            />
          </div>
          <div>
            <div className="text-[26px] font-semibold text-[#17271D]">
              {computedDistrictRisk}
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
            <AlertTriangle className="w-3.5 h-3.5 text-[#D9772F]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[26px] font-semibold text-[#17271D]">
              {activeWarningsCount}
            </div>
            <p className="text-[11.5px] text-[#5B665E] mt-1">
              Rain influx & Late blight
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
              {OFFICER_DATA.affectedFarmersTotal.toLocaleString()} of {OFFICER_DATA.totalRegisteredFarmers.toLocaleString()}
            </div>
            <p className="text-[11.5px] text-[#5B665E] mt-1">
              Across 4 priority sectors
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
              {reportsToReviewCount}
            </span>
          </div>
          <div>
            <div className="text-[26px] font-semibold text-[#17271D]">
              {reportsToReviewCount}
            </div>
            <p className="text-[11.5px] text-[#5B665E] mt-1">
              {OFFICER_DATA.districtFieldReports7Days} total in last 7 days
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
                15 sectors in Musanze sorted by risk status · Click a row for sector reports
              </p>
            </div>
            <span className="text-[12px] font-medium text-[#1F4A34] bg-[#E4ECDB] px-3 py-1 rounded-full border border-[rgba(31,74,52,0.10)]">
              4 Watch · 11 Low
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
                {OFFICER_DATA.sectorOverviews.map((sec) => {
                  // FIX 1: Sector climate risk = highest level among active WEATHER warnings covering that sector (Low if none)
                  const secClimateRisk = activeWarnings
                    ? computeSectorClimateRisk(sec.name, activeWarnings)
                    : sec.risk;

                  return (
                    <tr
                      key={sec.id}
                      onClick={() => setSelectedSector(sec)}
                      className="hover:bg-[#F4F6EF]/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 pl-2 font-medium text-[#17271D] flex items-center gap-1.5">
                        <span className="group-hover:text-[#1F4A34] transition-colors">
                          {sec.name}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#5B665E]/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                      <td className="py-3">{getRiskChip(secClimateRisk)}</td>
                      <td className="py-3 text-[#17271D]">
                        {sec.activeWarningsCount > 0 ? (
                          <span className="font-semibold text-[#B85718]">
                            {sec.activeWarningsCount} active
                          </span>
                        ) : (
                          <span className="text-[#5B665E]">—</span>
                        )}
                      </td>
                      {/* FIX 6: Tabular figures, no monospace font */}
                      <td className="py-3 text-[#17271D] tabular-nums text-[12.5px]">
                        {sec.farmersCount.toLocaleString()}
                      </td>
                      <td className="py-3 text-[#17271D] tabular-nums text-[12.5px]">
                        {sec.reports7Days}
                      </td>
                      <td className="py-3 pr-2 text-right font-medium">
                        {/* FIX 3: Stacked values with colored level dots */}
                        {sec.acknowledgedItems && sec.acknowledgedItems.length > 0 ? (
                          <div className="flex flex-col items-end gap-1">
                            {sec.acknowledgedItems.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#17271D] tabular-nums"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.dotColor }}
                                />
                                <span>{item.label}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#5B665E]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 1/3 Width: Needs Your Attention Card */}
        <div className="lg:col-span-4 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#17271D]">Needs your attention</h2>
            <p className="text-[12.5px] text-[#5B665E]">2 priority actions in Musanze</p>
          </div>

          <div className="space-y-3.5">
            {/* Item 1: Busogo */}
            <div className="p-4 rounded-xl bg-[#F4F6EF]/70 border border-[#D9A032]/35 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#D9A032]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#9E6905]" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[13.5px] font-semibold text-[#17271D] leading-snug">
                    Busogo: only 41% acknowledged the rain warning
                  </h4>
                  <p className="text-[11.5px] text-[#5B665E]">
                    318 farmers have not confirmed delivery via SMS
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onShowToast('Voice message queued for 318 farmers')}
                  className="w-full py-2 px-3 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
                  <span>Resend by voice call</span>
                </button>
              </div>
            </div>

            {/* Item 2: Muhoza */}
            <div className="p-4 rounded-xl bg-[#F4F6EF]/70 border border-[#D9772F]/35 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#D9772F]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Eye className="w-3.5 h-3.5 text-[#B85718]" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[13.5px] font-semibold text-[#17271D] leading-snug">
                    Muhoza: new report of dark spots on potato leaves
                  </h4>
                  <p className="text-[11.5px] text-[#5B665E]">
                    Reported by Eric H. at 12:15 · Kigombe cell
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onNavigateView('observations')}
                  className="w-full py-2 px-3 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.20)] text-[12px] font-medium hover:bg-[#E4ECDB] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
                  <span>Review report</span>
                </button>
              </div>
            </div>
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
          {OFFICER_DATA.warningDeliveries.map((warn) => (
            <div
              key={warn.id}
              className="p-4 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.08)] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left meta */}
              <div className="space-y-1.5 max-w-sm">
                <div className="flex items-center gap-2">
                  {getRiskChip(warn.level)}
                  <h3 className="text-[15px] font-semibold text-[#17271D]">{warn.title}</h3>
                </div>
                <div className="text-[12px] text-[#5B665E] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1F4A34]" />
                  <span>{warn.area}</span>
                </div>
              </div>

              {/* Delivery stats and progress bar */}
              <div className="flex-1 max-w-md space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#5B665E]">
                    Sent: <strong className="text-[#17271D]">{warn.sent.toLocaleString()}</strong> · Delivered:{' '}
                    <strong className="text-[#17271D]">{warn.delivered.toLocaleString()}</strong>
                  </span>
                  <span className="font-semibold text-[#1F4A34]">
                    {warn.acknowledged.toLocaleString()} acknowledged ({warn.acknowledgedPct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[rgba(31,74,52,0.12)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      warn.acknowledgedPct < 60 ? 'bg-[#D9772F]' : 'bg-[#3E8E55]'
                    }`}
                    style={{ width: `${warn.acknowledgedPct}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() =>
                    onShowToast(
                      `Voice & SMS reminder queued for ${warn.unacknowledgedCount} unacknowledged farmers`
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full bg-white text-[#17271D] border border-[rgba(31,74,52,0.22)] text-[12px] font-medium hover:bg-[#E4ECDB] transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  Resend to farmers who haven't acknowledged
                </button>
              </div>
            </div>
          ))}
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
                {effectiveReportsToReviewCount}
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
                    <span className="text-[#1F4A34] font-medium">{'time' in rep ? (rep as any).time : (rep as any).date}</span>
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
          onClick={() => setSelectedSector(null)}
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
                      {selectedSector.name} Sector
                    </h3>
                    {getRiskChip(selectedSector.risk)}
                  </div>
                  <p className="text-[12px] text-[#5B665E] mt-0.5">
                    Musanze District · Agricultural overview
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSector(null)}
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
                    {selectedSector.activeWarningsCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6EF]/80 border border-[rgba(31,74,52,0.06)] text-center">
                  <span className="block text-[11px] text-[#5B665E]">Acknowledged</span>
                  <span className="text-[14px] font-semibold text-[#17271D]">
                    {selectedSector.acknowledgedItems && selectedSector.acknowledgedItems.length > 0
                      ? selectedSector.acknowledgedItems.map((a) => a.label.split(' ')[0]).join(' / ')
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Warnings List (FIX 4: Late Blight row uses High #D9772F) */}
              <div className="space-y-2">
                <h4 className="text-[13px] font-semibold text-[#17271D]">Active warnings</h4>
                {selectedSector.warnings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSector.warnings.map((w, idx) => {
                      const isHigh = w.level === 'High';
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-[13px] text-[#17271D] ${
                            isHigh
                              ? 'bg-[#D9772F]/10 border-[#D9772F]/30'
                              : 'bg-[#D9A032]/10 border-[#D9A032]/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <AlertTriangle
                              className={`w-4 h-4 flex-shrink-0 ${
                                isHigh ? 'text-[#D9772F]' : 'text-[#D9A032]'
                              }`}
                            />
                            <span className="font-medium">{w.title}</span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                              isHigh
                                ? 'bg-[#D9772F]/20 text-[#B85718]'
                                : 'bg-[#D9A032]/20 text-[#9E6905]'
                            }`}
                          >
                            {w.level}
                          </span>
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
                    Recent reports (last 7 days)
                  </h4>
                  <span className="text-[11.5px] text-[#5B665E]">
                    {selectedSector.reports7Days} reported
                  </span>
                </div>

                <div className="divide-y divide-[rgba(31,74,52,0.06)] border border-[rgba(31,74,52,0.08)] rounded-xl overflow-hidden bg-white">
                  {selectedSector.recentReports.length > 0 ? (
                    selectedSector.recentReports.map((r) => (
                      <div key={r.id} className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-medium text-[#17271D]">
                            {r.title}
                          </span>
                          <span className="text-[11px] text-[#5B665E] tabular-nums">{r.time}</span>
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
                onClick={() => setSelectedSector(null)}
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
