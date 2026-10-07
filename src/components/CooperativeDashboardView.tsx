import React, { useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  FileText,
  MessageSquare,
  Calendar,
  ArrowRight,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Sprout,
  Smartphone,
  PhoneCall,
  Bell,
} from 'lucide-react';
import potatoImg from '../assets/images/irish_potato_crop_1790594286456.jpg';
import { CoopGroup, CoopMessage, WarningItem } from '../types';
import {
  COOPERATIVE_DATA,
  RISK_LEVEL_COLORS,
  computeCoopGroups,
  computeCoopSummary,
} from '../data/musanzeData';

interface CooperativeDashboardViewProps {
  onOpenMessageComposer: (
    prefillGroup?: string,
    prefillEn?: string,
    prefillRw?: string
  ) => void;
  onSelectGroup: (group: CoopGroup) => void;
  onSelectMessage: (message: CoopMessage) => void;
  onShowToast: (msg: string) => void;
  messages: CoopMessage[];
  warnings: WarningItem[];
}

export const CooperativeDashboardView: React.FC<CooperativeDashboardViewProps> = ({
  onOpenMessageComposer,
  onSelectGroup,
  onSelectMessage,
  onShowToast,
  messages,
  warnings,
}) => {
  const coop = COOPERATIVE_DATA;
  const groups = useMemo(() => computeCoopGroups(warnings), [warnings]);
  const summary = useMemo(() => computeCoopSummary(groups), [groups]);
  const joinNames = (names: string[]) =>
    names.length <= 1
      ? names.join('')
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  const underWarningPct =
    summary.totalMembers > 0
      ? Math.round((summary.membersUnderWarning / summary.totalMembers) * 100)
      : 0;
  const heroHeadline =
    summary.membersUnderWarning === 0
      ? 'No active warnings cover your members.'
      : summary.membersUnderWarning === summary.totalMembers
      ? `All ${summary.totalMembers} members are under an active warning.`
      : `${summary.membersUnderWarning} of ${summary.totalMembers} members are under an active warning.`;

  const scrollToGroupRisk = () => {
    const el = document.getElementById('risk-by-group-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* BAND 1 — HERO BANNER (Photo of potato fields fading into green) */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-[16px] overflow-hidden shadow-[0_2px_12px_rgba(31,74,52,0.08)] bg-gradient-to-r from-[#1F4A34] via-[#24543B] to-[#2C6343] min-h-[190px] flex items-center">
        {/* Right side photo of potato fields fading into the green gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-[45%] pointer-events-none select-none overflow-hidden">
          <img
            src={potatoImg}
            alt="Musanze potato fields"
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
              <Sprout className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={2} />
              <span>Musanze Potato Growers Cooperative</span>
            </div>

            {/* Heading */}
            <h1 className="text-[24px] md:text-[27px] font-normal text-white leading-tight tracking-tight max-w-xl">
              Good afternoon, Aline. {heroHeadline}
            </h1>

            {/* Status caption */}
            {summary.groupsUnderWarning.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-[12.5px] text-[#E4ECDB]/90">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: RISK_LEVEL_COLORS[summary.highestLevel] }}
                />
                <span>Active warnings for {joinNames(summary.groupsUnderWarning)} groups</span>
              </div>
            )}
          </div>

          {/* 3 Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={() => onOpenMessageComposer('All groups')}
              className="px-4 py-1.5 rounded-full bg-white text-[#17271D] text-[12px] font-semibold hover:bg-[#F4F6EF] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#1F4A34]" />
              <span>Message members</span>
            </button>
            <button
              onClick={scrollToGroupRisk}
              className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 hover:border-white transition-all cursor-pointer active:scale-98"
            >
              <span>Member risk</span>
            </button>
            <button
              onClick={() =>
                onShowToast('Meeting scheduler opened for upcoming general assembly')
              }
              className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 hover:border-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <Calendar className="w-3 h-3 text-[#E4ECDB]" strokeWidth={1.5} />
              <span>Schedule meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 2 — 4 KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Members */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#5B665E]">Members</span>
            <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[26px] font-bold text-[#17271D] tracking-tight">
              {summary.totalMembers}
            </span>
            <p className="text-[11px] text-[#5B665E] mt-0.5">
              {summary.groupCount} grower groups · {summary.groupSectors.join(', ')}
            </p>
          </div>
        </div>

        {/* KPI 2: Under active warnings */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#5B665E]">Under active warnings</span>
            <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[26px] font-bold text-[#17271D] tracking-tight">
              {summary.membersUnderWarning}{' '}
              <span className="text-[15px] font-normal text-[#5B665E]">of {summary.totalMembers}</span>
            </span>
            <p className="text-[11px] text-[#5B665E] mt-0.5">
              {underWarningPct}%
              {summary.activeWarningTitles.length > 0
                ? ` · ${summary.activeWarningTitles.join(' & ')}`
                : ' · No active warnings'}
            </p>
          </div>
        </div>

        {/* KPI 3: Acknowledged rain warning */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#5B665E]">Acknowledged rain warning</span>
            <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[26px] font-bold text-[#1F4A34] tracking-tight">
              {summary.rainPct === null ? '—' : `${summary.rainPct}%`}
            </span>
            <p className="text-[11px] text-[#5B665E] mt-0.5">
              {summary.rainPct === null
                ? 'No active rain warning'
                : `${summary.rainAcknowledged} of ${summary.rainTotal} target growers (${summary.rainSectors.join(' & ')})`}
            </p>
          </div>
        </div>

        {/* KPI 4: Member reports, last 7 days */}
        <div className="bg-[#FBFCF8] rounded-[16px] p-5 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#5B665E]">Member reports, last 7 days</span>
            <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[26px] font-bold text-[#17271D] tracking-tight">
              {summary.memberReports7d}
            </span>
            <p className="text-[11px] text-[#5B665E] mt-0.5">
              Field observations submitted by members
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 3 — 2/3 RISK BY GROUP TABLE + 1/3 COOPERATIVE ACTIONS */}
      {/* ========================================================================= */}
      <div id="risk-by-group-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 2/3: "Risk by group" table */}
        <div className="lg:col-span-8 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
              <div>
                <h3 className="text-[16px] font-bold text-[#17271D] leading-tight">
                  Risk by group
                </h3>
                <p className="text-[11.5px] text-[#5B665E] mt-0.5">
                  Click any group row to review warning coverage and remind unacknowledged members
                </p>
              </div>
              <span className="text-[11px] text-[#5B665E] hidden sm:inline-block">
                Season 2026/27 A
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(31,74,52,0.08)] text-[#5B665E] text-[11px] font-semibold">
                    <th className="py-2.5 pr-3 font-semibold">Group</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Members</th>
                    <th className="py-2.5 px-3 font-semibold">Active warnings</th>
                    <th className="py-2.5 px-3 font-semibold">Acknowledged</th>
                    <th className="py-2.5 pl-3 font-semibold text-right">Reports (7d)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                  {groups.map((group) => (
                    <tr
                      key={group.id}
                      onClick={() => onSelectGroup(group)}
                      className="hover:bg-[#E4ECDB]/40 cursor-pointer transition-colors group"
                    >
                      {/* Group Name & Sector */}
                      <td className="py-3.5 pr-3 font-semibold text-[#17271D] group-hover:text-[#1F4A34]">
                        <div className="flex items-center gap-1.5">
                          <span>{group.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#5B665E] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[10.5px] text-[#5B665E] font-normal block">
                          {group.sector} sector
                        </span>
                      </td>

                      {/* Members Count */}
                      <td className="py-3.5 px-3 text-center text-[#17271D] font-medium">
                        <span className="px-2 py-0.5 rounded-full bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)]">
                          {group.membersCount}
                        </span>
                      </td>

                      {/* Active Warnings (Level chips) */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {group.warnings.length === 0 && (
                            <span className="text-[11px] text-[#5B665E]">None</span>
                          )}
                          {group.warnings.map((w) => (
                            <span
                              key={w.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold text-[#17271D] border"
                              style={{
                                backgroundColor: `${RISK_LEVEL_COLORS[w.level]}1F`,
                                borderColor: `${RISK_LEVEL_COLORS[w.level]}4D`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: RISK_LEVEL_COLORS[w.level] }}
                              />
                              <span>{w.title}</span>
                              <span className="font-normal text-[#5B665E]">· {w.level}</span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Acknowledged (one value per warning, small level dot) */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          {group.acknowledgement.map((ack, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-[11px] text-[#17271D]"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: ack.dotColor }}
                              />
                              <span className="text-[#5B665E] truncate max-w-[90px]">
                                {ack.warningTitle.replace(' Threat', '').replace(' Influx', '')}:
                              </span>
                              <span className="font-semibold tabular-nums text-[#1F4A34]">
                                {ack.pct}%
                              </span>
                              <span className="text-[10px] text-[#5B665E]">
                                ({ack.acknowledgedCount}/{ack.totalCount})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Reports (7d) */}
                      <td className="py-3.5 pl-3 text-right font-medium text-[#17271D] tabular-nums">
                        {group.reports7Days}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(31,74,52,0.06)] flex items-center justify-between text-[11px] text-[#5B665E]">
            <span>Click any row to open group actions and unacknowledged list</span>
            <span>
              Total {summary.totalMembers} members in {summary.groupCount} sectors
            </span>
          </div>
        </div>

        {/* Right 1/3: "Cooperative actions" card */}
        <div className="lg:col-span-4 bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[rgba(31,74,52,0.08)]">
              <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
                <Sprout className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#17271D] leading-tight">
                  Cooperative actions
                </h3>
                <p className="text-[11px] text-[#5B665E]">
                  Recommended operational coordination
                </p>
              </div>
            </div>

            {/* 2 Items */}
            <div className="space-y-3.5 mt-4">
              {coop.actions.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.10)] space-y-3 shadow-xs"
                >
                  <p className="text-[12.5px] font-medium text-[#17271D] leading-snug">
                    {act.description}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenMessageComposer(
                        act.targetGroup,
                        act.prefillMessageEn,
                        act.prefillMessageRw
                      )
                    }
                    className="w-full py-2 px-3 rounded-full bg-[#1F4A34] text-white text-[11.5px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Send className="w-3 h-3" />
                    <span>{act.buttonLabel}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] text-[11px] text-[#5B665E] space-y-1">
            <span className="font-semibold text-[#17271D] block">Coordination note:</span>
            <span>
              Shared spraying reduces fungicide cost by 32% and protects bordering Kinigi plots.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAND 4 — "RECENT MESSAGES" CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34]">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#17271D] leading-tight">
                Recent messages
              </h3>
              <p className="text-[11.5px] text-[#5B665E]">
                Last broadcasts sent by Musanze Potato Growers Cooperative
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenMessageComposer('All groups')}
            className="px-3.5 py-1.5 rounded-full bg-[#1F4A34] text-white text-[11.5px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New message</span>
          </button>
        </div>

        {/* Messages List (Last 3) */}
        <div className="space-y-3">
          {messages.slice(0, 3).map((msg) => (
            <div
              key={msg.id}
              onClick={() => onSelectMessage(msg)}
              className="p-4 rounded-xl bg-white hover:bg-[#E4ECDB]/30 border border-[rgba(31,74,52,0.10)] transition-colors cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#1F4A34] bg-[#E4ECDB]/80 px-2.5 py-0.5 rounded-full">
                    {msg.groups.join(', ')}
                  </span>
                  <span className="text-[11.5px] font-medium text-[#17271D]">
                    Delivered to {msg.deliveredCount || msg.recipientCount} members
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#5B665E] tabular-nums">
                  <Clock className="w-3 h-3 text-[#5B665E]" />
                  <span>{msg.sentAt}</span>
                </div>
              </div>

              {/* Message text excerpt */}
              <p className="text-[12.5px] text-[#17271D] line-clamp-2 leading-relaxed">
                {msg.messageEn}
              </p>

              {/* Channel split info */}
              <div className="mt-2.5 pt-2 border-t border-[rgba(31,74,52,0.06)] flex flex-wrap items-center justify-between text-[11px] text-[#5B665E]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-[#1F4A34]" />
                    <span>SMS {msg.channelSplit.sms}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-[#1F4A34]" />
                    <span>Voice {msg.channelSplit.voice}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Bell className="w-3 h-3 text-[#1F4A34]" />
                    <span>In-app {msg.channelSplit.inApp}</span>
                  </span>
                </div>

                <span className="text-[#1F4A34] font-medium group-hover:underline flex items-center gap-0.5">
                  <span>View detail</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
