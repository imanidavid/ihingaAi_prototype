import React, { useMemo, useState } from 'react';
import { Calendar, ChevronRight, MessageSquare, Send, Sprout, UserPlus, Users, Check } from 'lucide-react';
import potatoImg from '../assets/images/irish_potato_crop_1790594286456.jpg';
import {
  CoopGroup,
  CoopGroupRecord,
  CoopJoinRequest,
  CoopMeeting,
  CoopMember,
  CoopMessage,
  CropAdvisory,
  PlanAheadItem,
} from '../types';
import {
  COOPERATIVE_DATA,
  NOW,
  RISK_LEVEL_COLORS,
  computeCoopSummary,
  formatDayShort,
  formatPlanDue,
  memberAcknowledged,
  suggestGroupFor,
} from '../data/musanzeData';
import { PillSelect } from './PillSelect';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON } from './coop/CoopUi';

type NavTarget = 'messages' | 'meetings' | 'members';

interface CooperativeDashboardViewProps {
  onOpenMessageComposer: (prefillGroup?: string, prefillEn?: string, prefillRw?: string) => void;
  onSelectGroup: (group: CoopGroup) => void;
  onShowToast: (msg: string) => void;
  onScheduleMeeting: () => void;
  onNavigateView: (view: NavTarget) => void;
  messages: CoopMessage[];
  /** Groups computed from the store (members, warnings, acknowledgement, reports). */
  groups: CoopGroup[];
  groupRecords: CoopGroupRecord[];
  members: CoopMember[];
  /** Farmers asking to join this cooperative. */
  joinRequests: CoopJoinRequest[];
  onAcceptJoin: (requestId: string, groupId: string) => void;
  onDeclineJoin: (requestId: string) => void;
  onMarkToldInPerson: (memberIds: string[], warningId: string) => void;
  /** The officer's active advice and near plan-ahead items for the cooperative's sectors and crops. */
  adviceToPassOn: CropAdvisory[];
  planToPassOn: PlanAheadItem[];
  nextMeeting?: CoopMeeting;
}

/** One "needs you today" row: what happened and the one or two things the leader can do about it. */
const NeedRow: React.FC<{ icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; children: React.ReactNode; actions: React.ReactNode }> = ({
  icon: Icon,
  children,
  actions,
}) => (
  <div className="py-3 flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-start gap-3 min-w-0 flex-1">
      <span className="w-8 h-8 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
      </span>
      <div className="min-w-0 text-[13px] text-[#17271D] leading-snug pt-1.5">{children}</div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
  </div>
);

const SMALL_PRIMARY =
  'px-3.5 h-8 rounded-full bg-[#1F4A34] text-white text-[12px] font-medium hover:bg-[#2C6343] cursor-pointer flex items-center gap-1.5';
const SMALL_SECONDARY =
  'px-3.5 h-8 rounded-full bg-white text-[#1F4A34] border border-[rgba(31,74,52,0.20)] text-[12px] font-medium hover:bg-[#E4ECDB] cursor-pointer';

/**
 * Cooperative leader's dashboard, answering one question: which of my members need me today?
 * "Needs you today" (join requests, members who have not acknowledged a warning, officer advice to
 * pass on) · "My groups" · one line for the last message and next meeting.
 */
export const CooperativeDashboardView: React.FC<CooperativeDashboardViewProps> = ({
  onOpenMessageComposer,
  onSelectGroup,
  onScheduleMeeting,
  onNavigateView,
  messages,
  groups,
  groupRecords,
  members,
  joinRequests,
  onAcceptJoin,
  onDeclineJoin,
  onMarkToldInPerson,
  adviceToPassOn,
  planToPassOn,
  nextMeeting,
}) => {
  const coop = COOPERATIVE_DATA;
  const summary = useMemo(() => computeCoopSummary(groups), [groups]);
  const joinNames = (names: string[]) =>
    names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  const heroHeadline =
    summary.membersUnderWarning === 0
      ? 'No active warnings cover your members.'
      : summary.membersUnderWarning === summary.totalMembers
        ? `All ${summary.totalMembers} members are under an active warning.`
        : `${summary.membersUnderWarning} of ${summary.totalMembers} members are under an active warning.`;
  const scrollToGroupRisk = () => document.getElementById('risk-by-group-section')?.scrollIntoView({ behavior: 'smooth' });

  // Needs you today
  const pending = joinRequests.filter((r) => r.status === 'pending' && r.cooperative === coop.cooperativeName);
  // One row per group: each active warning with the members who have not acknowledged it
  const notAcknowledged = groups
    .map((g) => ({
      group: g,
      byWarning: g.warnings
        .map((w) => ({ warning: w, members: members.filter((m) => m.groupId === g.id && !memberAcknowledged(m, w.id)) }))
        .filter((x) => x.members.length > 0),
    }))
    .filter((x) => x.byWarning.length > 0);
  const passOnCount = adviceToPassOn.length + planToPassOn.length;
  const [showPassOn, setShowPassOn] = useState(false);
  const lastMessage = messages[0];

  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [toldFor, setToldFor] = useState<{
    groupName: string;
    byWarning: { warning: CoopGroup['warnings'][number]; members: CoopMember[] }[];
  } | null>(null);
  const [toldWarningId, setToldWarningId] = useState('');
  const toldList = toldFor?.byWarning.find((x) => x.warning.id === toldWarningId);
  const [toldIds, setToldIds] = useState<string[]>([]);

  const openJoin = () => {
    setPlacement(Object.fromEntries(pending.map((r) => [r.id, suggestGroupFor(r, groupRecords)])));
    setIsJoinOpen(true);
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
              <span>{coop.cooperativeName}</span>
            </div>

            {/* Heading */}
            <h1 className="text-[24px] md:text-[27px] font-normal text-white leading-tight tracking-tight max-w-xl">
              Good afternoon, {coop.leader.name.split(' ')[0]}. {heroHeadline}
            </h1>

            {/* Status caption */}
            {summary.groupsUnderWarning.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-[12.5px] text-[#E4ECDB]/90">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: RISK_LEVEL_COLORS[summary.highestLevel] }}
                />
                <span>Active warnings for {joinNames(summary.groupsUnderWarning)}</span>
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
              onClick={onScheduleMeeting}
              className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 hover:border-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <Calendar className="w-3 h-3 text-[#E4ECDB]" strokeWidth={1.5} />
              <span>Schedule meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* NEEDS YOU TODAY */}
      <div className="bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
        <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Needs you today</h3>
          <p className="text-[12px] text-[#5B665E] mt-0.5">Members to welcome, remind, and advice to pass on.</p>
        </div>
        <div className="divide-y divide-[rgba(31,74,52,0.06)]">
          {pending.length > 0 && (
            <NeedRow icon={UserPlus} actions={<button type="button" onClick={openJoin} className={SMALL_PRIMARY}>Review</button>}>
              <span className="font-semibold">
                {pending.length} {pending.length === 1 ? 'farmer wants' : 'farmers want'} to join
              </span>
              <span className="block text-[12px] text-[#5B665E]">{pending.map((r) => `${r.fullName} (${r.sector})`).join(' · ')}</span>
            </NeedRow>
          )}

          {notAcknowledged.map(({ group, byWarning }) => (
            <NeedRow
              key={group.id}
              icon={Users}
              actions={
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMessageComposer(
                        group.name,
                        `Reminder for ${group.name}: please read and acknowledge ${byWarning.map((x) => x.warning.title).join(' and ')}.`
                      )
                    }
                    className={SMALL_PRIMARY}
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Remind
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setToldFor({ groupName: group.name, byWarning });
                      setToldWarningId(byWarning[0].warning.id);
                      setToldIds([]);
                    }}
                    className={SMALL_SECONDARY}
                  >
                    Told in person
                  </button>
                </>
              }
            >
              <span className="font-semibold">{group.name}</span> · not acknowledged yet
              <span className="block text-[12px] text-[#5B665E]">
                {byWarning.map(({ warning, members: missing }) => (
                  <span key={warning.id} className="inline-flex items-center gap-1 mr-3 tabular-nums">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RISK_LEVEL_COLORS[warning.level] }} />
                    {warning.title}: {missing.length} of {group.membersCount}
                  </span>
                ))}
              </span>
            </NeedRow>
          ))}

          {passOnCount > 0 && (
            <NeedRow
              icon={Sprout}
              actions={
                <button type="button" onClick={() => setShowPassOn((v) => !v)} className={SMALL_SECONDARY} aria-expanded={showPassOn}>
                  {showPassOn ? 'Hide' : 'Show'}
                </button>
              }
            >
              <span className="font-semibold">
                {passOnCount} {passOnCount === 1 ? 'piece' : 'pieces'} of advice from your officer to pass on
              </span>
              <span className="block text-[12px] text-[#5B665E]">For your members' crops, this week</span>
            </NeedRow>
          )}
          {showPassOn && (
            <div className="pl-11 pb-2 divide-y divide-[rgba(31,74,52,0.06)]">
              {adviceToPassOn.map((a) => (
                <div key={a.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11.5px] text-[#5B665E] block">{a.crop} · while the warning lasts</span>
                    <span className="text-[13px] font-medium text-[#17271D]">{a.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenMessageComposer('All groups', `${a.crop}: ${a.title}. ${a.oneLineAdvice}`)}
                    className={SMALL_PRIMARY}
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Send to members
                  </button>
                </div>
              ))}
              {planToPassOn.map((p) => (
                <div key={p.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11.5px] text-[#5B665E] block">
                      {p.crop} · {formatPlanDue(p.due)}
                    </span>
                    <span className="text-[13px] font-medium text-[#17271D]">{p.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenMessageComposer('All groups', `${p.title} (${formatPlanDue(p.due)}). ${p.reason}`)}
                    className={SMALL_PRIMARY}
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Send to members
                  </button>
                </div>
              ))}
            </div>
          )}

          {pending.length + notAcknowledged.length + passOnCount === 0 && (
            <p className="py-6 text-center text-[13px] text-[#5B665E]">Nothing needs you right now.</p>
          )}
        </div>
      </div>

      {/* MY GROUPS */}
      <div id="risk-by-group-section" className="bg-[#FBFCF8] rounded-[16px] p-5 md:p-6 border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)]">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#17271D]">My groups</h3>
            <p className="text-[12px] text-[#5B665E] mt-0.5">
              {summary.totalMembers} members in {summary.groupCount} groups · tap a group to open it
            </p>
          </div>
          <span className="text-[11px] text-[#5B665E] hidden sm:inline-block">{NOW.season}</span>
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

      {/* One line: last message and next meeting */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-[#5B665E] px-1">
        <span className="flex items-center gap-1.5 min-w-0">
          <MessageSquare className="w-4 h-4 text-[#1F4A34] flex-shrink-0" strokeWidth={1.5} />
          {lastMessage ? (
            <span className="truncate max-w-[420px]">
              Last message ({lastMessage.sentAt}): <span className="text-[#17271D]">{lastMessage.messageEn}</span>
            </span>
          ) : (
            <span>No messages sent yet</span>
          )}
          <button type="button" onClick={() => onNavigateView('messages')} className="text-[#1F4A34] font-medium hover:underline cursor-pointer flex-shrink-0">
            See all
          </button>
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
          {nextMeeting ? (
            <span>
              Next meeting: <span className="text-[#17271D]">{formatDayShort(nextMeeting.date)} {nextMeeting.time} · {nextMeeting.title}</span>
            </span>
          ) : (
            <span>No meeting planned</span>
          )}
          <button type="button" onClick={() => onNavigateView('meetings')} className="text-[#1F4A34] font-medium hover:underline cursor-pointer">
            Meetings
          </button>
        </span>
      </div>

      {/* Join requests */}
      <CoopModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        title="Farmers who want to join"
        subtitle="Accept and choose their group, or decline"
        icon={UserPlus}
        footer={
          <button type="button" onClick={() => setIsJoinOpen(false)} className={SECONDARY_BUTTON}>
            Done
          </button>
        }
      >
        {pending.length === 0 ? (
          <p className="text-[13px] text-[#5B665E]">No requests waiting.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-2.5">
                <div>
                  <span className="text-[14px] font-semibold text-[#17271D]">{r.fullName}</span>
                  <span className="block text-[12px] text-[#5B665E]">
                    {r.sector} · {r.cell} · {r.crops.join(', ') || 'No crops yet'} · asked {formatDayShort(r.requestedOn)}
                  </span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 items-center">
                  <PillSelect
                    value={placement[r.id] || ''}
                    onChange={(g) => setPlacement((prev) => ({ ...prev, [r.id]: g }))}
                    placeholder="Choose group"
                    options={groupRecords.map((g) => ({ value: g.id, label: `${g.name} (${g.sector})` }))}
                  />
                  <button
                    type="button"
                    disabled={!placement[r.id]}
                    onClick={() => onAcceptJoin(r.id, placement[r.id])}
                    className={`${PRIMARY_BUTTON} disabled:opacity-50`}
                  >
                    Accept
                  </button>
                  <button type="button" onClick={() => onDeclineJoin(r.id)} className={SECONDARY_BUTTON}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CoopModal>

      {/* Told in person */}
      <CoopModal
        isOpen={!!toldFor}
        onClose={() => setToldFor(null)}
        title="Told in person"
        subtitle={toldFor ? `${toldFor.groupName} · tick who you told about the warning yourself` : ''}
        icon={Check}
        footer={
          <>
            <button type="button" onClick={() => setToldFor(null)} className={SECONDARY_BUTTON}>
              Cancel
            </button>
            <button
              type="button"
              disabled={toldIds.length === 0}
              onClick={() => {
                if (toldFor) onMarkToldInPerson(toldIds, toldWarningId);
                setToldFor(null);
              }}
              className={`${PRIMARY_BUTTON} disabled:opacity-50`}
            >
              Mark {toldIds.length || ''} as told
            </button>
          </>
        }
      >
        {toldFor && toldFor.byWarning.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {toldFor.byWarning.map(({ warning }) => (
              <button
                key={warning.id}
                type="button"
                aria-pressed={toldWarningId === warning.id}
                onClick={() => {
                  setToldWarningId(warning.id);
                  setToldIds([]);
                }}
                className={`px-3 h-8 rounded-full text-[12px] border cursor-pointer ${
                  toldWarningId === warning.id
                    ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                    : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
                }`}
              >
                {warning.title}
              </button>
            ))}
          </div>
        )}
        {toldList && (
          <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[rgba(31,74,52,0.08)] divide-y divide-[rgba(31,74,52,0.06)] bg-white">
            {toldList.members.map((m) => {
              const on = toldIds.includes(m.id);
              return (
                <label key={m.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-[#F4F6EF]/60">
                  <span className="text-[13px] text-[#17271D]">
                    {m.fullName} <span className="text-[#5B665E]">· {m.cell}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setToldIds((prev) => (on ? prev.filter((x) => x !== m.id) : [...prev, m.id]))}
                    className="w-4 h-4 accent-[#1F4A34]"
                  />
                </label>
              );
            })}
          </div>
        )}
      </CoopModal>
    </div>
  );
};
