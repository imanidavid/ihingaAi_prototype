import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Check,
  Clock,
  Database,
  Info,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { AccessRequest, AuditEvent, DataSourceStatus, NavView, ProcessingRun, UserAccount } from '../types';
import {
  PROCESSING_SCHEDULE,
  ROLE_LABELS,
  ROLE_ORDER,
  officerHeroImg,
  stampSortKey,
} from '../data/musanzeData';
import { CARD_CLASS, EmptyState, IconCircle, NeutralChip, PRIMARY_BUTTON, SECONDARY_BUTTON } from './coop/CoopUi';
import { RejectRequestModal } from './admin/RejectRequestModal';

interface AdminDashboardViewProps {
  dataSources: DataSourceStatus[];
  lastRun?: ProcessingRun;
  accounts: UserAccount[];
  accessRequests: AccessRequest[];
  auditEvents: AuditEvent[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onNavigateView: (view: NavView) => void;
  /** The signed-in administrator. */
  currentAccount?: UserAccount;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  dataSources,
  lastRun,
  accounts,
  accessRequests,
  auditEvents,
  onApprove,
  onReject,
  onNavigateView,
  currentAccount,
}) => {
  const firstName = currentAccount?.fullName.split(' ')[0];
  const [rejecting, setRejecting] = useState<AccessRequest | null>(null);

  const usersByRole = useMemo(
    () =>
      ROLE_ORDER.map((role) => ({
        role,
        count: accounts.filter((a) => a.role === role && (a.status === 'active' || a.status === 'suspended')).length,
      })),
    [accounts]
  );
  const totalUsers = usersByRole.reduce((sum, r) => sum + r.count, 0);
  const suspended = accounts.filter((a) => a.status === 'suspended').length;
  const pending = accessRequests.filter((r) => r.status === 'pending');
  const healthy = dataSources.filter((d) => d.status === 'Healthy').length;
  // Newest first; events in the same minute keep the order they happened in (later = higher)
  const latestEvents = auditEvents
    .map((e, i) => ({ e, i }))
    .sort((a, b) => stampSortKey(b.e.at) - stampSortKey(a.e.at) || b.i - a.i)
    .slice(0, 5)
    .map(({ e }) => e);
  const maxRoleCount = Math.max(1, ...usersByRole.map((r) => r.count));

  const kpis = [
    {
      icon: Users,
      label: 'Users',
      value: `${totalUsers}`,
      caption: `${totalUsers - suspended} active · ${suspended} suspended · ${ROLE_ORDER.length} roles`,
    },
    {
      icon: UserCheck,
      label: 'Access requests waiting',
      value: `${pending.length}`,
      caption: pending.length === 0 ? 'Nothing to review' : 'Officers, researchers and cooperative leaders',
    },
    {
      icon: Database,
      label: 'Data sources healthy',
      value: `${healthy} of ${dataSources.length}`,
      caption: dataSources.filter((d) => d.status !== 'Healthy').map((d) => `${d.name}: ${d.status.toLowerCase()}`).join(' · ') || 'All feeds on time',
    },
    {
      icon: Workflow,
      label: 'Last processing run',
      value: lastRun ? lastRun.startedAt.slice(11) : '—',
      caption: lastRun
        ? `${lastRun.status} · next ${PROCESSING_SCHEDULE.nextAt.slice(11)} · ${PROCESSING_SCHEDULE.every.toLowerCase()}`
        : 'No run yet',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative w-full rounded-[16px] overflow-hidden shadow-[0_2px_12px_rgba(31,74,52,0.08)] bg-gradient-to-r from-[#1F4A34] to-[#2C6343] min-h-[190px] flex items-center">
        <div className="absolute right-0 top-0 bottom-0 w-[40%] pointer-events-none select-none overflow-hidden">
          <img src={officerHeroImg} alt="Musanze farmland from above" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F4A34] via-[#1F4A34]/60 to-transparent" />
        </div>
        <div className="relative z-10 p-6 md:p-8 max-w-2xl text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[12px] font-medium mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E4ECDB]" strokeWidth={1.5} />
            <span>IHINGA AI admin console · Musanze</span>
          </div>
          <h1 className="text-[28px] font-normal leading-tight">
            Good afternoon{firstName ? `, ${firstName}` : ''}.{' '}
            {pending.length === 0
              ? 'No access requests are waiting.'
              : `${pending.length} access ${pending.length === 1 ? 'request is' : 'requests are'} waiting.`}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              type="button"
              onClick={() => onNavigateView('users')}
              className="px-4 py-1.5 rounded-full bg-white text-[#17271D] text-[12px] font-semibold hover:bg-[#F4F6EF] cursor-pointer flex items-center gap-1.5"
            >
              <UserCog className="w-3.5 h-3.5 text-[#1F4A34]" />
              <span>Users & access</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateView('reports')}
              className="px-4 py-1.5 rounded-full bg-transparent text-white border border-white/40 text-[12px] font-medium hover:bg-white/10 cursor-pointer"
            >
              Reports
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

      {/* Pending approvals + data source health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-8`}>
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <div>
              <h3 className="text-[16px] font-semibold text-[#17271D]">Pending approvals</h3>
              <p className="text-[12px] text-[#5B665E]">Approved staff can sign in straight away</p>
            </div>
            <button type="button" onClick={() => onNavigateView('users')} className={SECONDARY_BUTTON}>
              All requests
            </button>
          </div>
          {pending.length === 0 ? (
            <EmptyState icon={UserCheck} text="No access requests are waiting." />
          ) : (
            <div className="divide-y divide-[rgba(31,74,52,0.06)]">
              {pending.map((r) => (
                <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#17271D]">{r.fullName}</span>
                    <span className="block text-[12px] text-[#5B665E]">
                      {ROLE_LABELS[r.role]} · {r.organizationOrArea}
                    </span>
                    <span className="block text-[12px] text-[#5B665E] tabular-nums">
                      {r.email || r.phone} · sent {r.submittedAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onClick={() => setRejecting(r)} className={SECONDARY_BUTTON}>
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button type="button" onClick={() => onApprove(r.id)} className={PRIMARY_BUTTON}>
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${CARD_CLASS} p-5 lg:col-span-4`}>
          <div className="pb-3 border-b border-[rgba(31,74,52,0.08)] flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[#17271D]">Data source health</h3>
            <span className="flex items-center gap-1 text-[12px] text-[#5B665E]">
              <Info className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
              Simulated feeds
            </span>
          </div>
          <div className="divide-y divide-[rgba(31,74,52,0.06)]">
            {dataSources.map((d) => (
              <div key={d.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[13px] font-medium text-[#17271D]">{d.name}</span>
                  <span className="block text-[12px] text-[#5B665E] tabular-nums">
                    {d.lastSync} · {d.note}
                  </span>
                </div>
                <NeutralChip tone={d.status === 'Healthy' ? 'tint' : 'outline'}>
                  {d.status === 'Healthy' ? <Check className="w-3 h-3" strokeWidth={2} /> : <Clock className="w-3 h-3" strokeWidth={1.5} />}
                  {d.status}
                </NeutralChip>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users by role + latest audit events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`${CARD_CLASS} p-5 lg:col-span-4`}>
          <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <h3 className="text-[16px] font-semibold text-[#17271D]">Users by role</h3>
            <p className="text-[12px] text-[#5B665E] tabular-nums">
              {totalUsers} accounts{suspended > 0 ? ` · ${suspended} suspended` : ''}
            </p>
          </div>
          <div className="space-y-3 mt-3">
            {usersByRole.map((r) => (
              <div key={r.role} className="space-y-1">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-[#17271D]">{ROLE_LABELS[r.role]}</span>
                  <span className="font-semibold text-[#17271D] tabular-nums">{r.count}</span>
                </div>
                <div className="w-full h-2 bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
                  <div className="h-full bg-[#3E8E55] rounded-full" style={{ width: `${(r.count / maxRoleCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-8`}>
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <div>
              <h3 className="text-[16px] font-semibold text-[#17271D]">Latest audit events</h3>
              <p className="text-[12px] text-[#5B665E]">Sign-ins, warnings, approvals and changes</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateView('security')}
              aria-label="Open security & audit"
              className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
          {latestEvents.length === 0 ? (
            <EmptyState icon={Activity} text="No events yet." />
          ) : (
            <div className="divide-y divide-[rgba(31,74,52,0.06)]">
              {latestEvents.map((e) => (
                <div key={e.id} className="py-2.5 flex items-start justify-between gap-3 text-[12.5px]">
                  <div className="min-w-0">
                    <span className="block text-[#17271D]">
                      <span className="font-semibold">{e.action}</span> · {e.target}
                    </span>
                    <span className="block text-[12px] text-[#5B665E]">
                      {e.actor} · {e.actorRole === 'system' ? 'System' : ROLE_LABELS[e.actorRole]}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#5B665E] tabular-nums whitespace-nowrap">{e.at}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RejectRequestModal
        request={rejecting}
        onClose={() => setRejecting(null)}
        onReject={(id, reason) => {
          onReject(id, reason);
          setRejecting(null);
        }}
      />
    </div>
  );
};
