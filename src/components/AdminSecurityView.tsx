import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileDown,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AppRole, AuditEvent, LoginAttempt, SecuritySettings, UserAccount } from '../types';
import {
  ENCRYPTION_STATUS,
  FAILED_SIGN_IN_ALERT_AT,
  NOW,
  ROLE_LABELS,
  ROLE_ORDER,
  computeSignInAnomalies,
  stampSortKey,
} from '../data/musanzeData';
import { DatePicker } from './DatePicker';
import { PillSelect } from './PillSelect';
import {
  CARD_CLASS,
  ConfirmModal,
  CoopModal,
  EmptyState,
  IconCircle,
  NeutralChip,
  PageHeader,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SegmentedTabs,
  Toggle,
} from './coop/CoopUi';

type SecurityTab = 'audit' | 'logins' | 'access' | 'settings';
const PAGE_SIZE = 10;
const ACCESS_ACTIONS = ['Opened farmer report'];
const EXPORT_ACTIONS = ['Exported report', 'Exported data', 'Imported users', 'Uploaded data'];

const roleLabel = (r: AuditEvent['actorRole'] | undefined) => (!r ? '—' : r === 'system' ? 'System' : ROLE_LABELS[r]);

/** Newest first; same-minute events keep their recorded order. */
function newestFirst<T>(list: T[], stamp: (x: T) => string): T[] {
  return list
    .map((x, i) => ({ x, i }))
    .sort((a, b) => stampSortKey(stamp(b.x)) - stampSortKey(stamp(a.x)) || b.i - a.i)
    .map(({ x }) => x);
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface AdminSecurityViewProps {
  auditEvents: AuditEvent[];
  loginAttempts: LoginAttempt[];
  accounts: UserAccount[];
  securitySettings: SecuritySettings;
  onSaveSettings: (next: SecuritySettings) => void;
  onExport: (what: string) => void;
}

export const AdminSecurityView: React.FC<AdminSecurityViewProps> = ({
  auditEvents,
  loginAttempts,
  securitySettings,
  onSaveSettings,
  onExport,
}) => {
  const [tab, setTab] = useState<SecurityTab>('audit');
  const anomalies = useMemo(() => computeSignInAnomalies(loginAttempts), [loginAttempts]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & audit"
        subtitle={`${auditEvents.length} recorded events · ${anomalies.length} sign-in ${anomalies.length === 1 ? 'alert' : 'alerts'}`}
      />
      <SegmentedTabs<SecurityTab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'audit', label: 'Audit log', count: auditEvents.length },
          { id: 'logins', label: 'Login activity', count: loginAttempts.length },
          { id: 'access', label: 'Data access' },
          { id: 'settings', label: 'Security settings' },
        ]}
      />
      {tab === 'audit' && <AuditLogTab events={auditEvents} onExport={onExport} />}
      {tab === 'logins' && <LoginActivityTab attempts={loginAttempts} anomalies={anomalies} />}
      {tab === 'access' && <DataAccessTab events={auditEvents} />}
      {tab === 'settings' && <SettingsTab settings={securitySettings} onSave={onSaveSettings} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
const AuditLogTab: React.FC<{ events: AuditEvent[]; onExport: (what: string) => void }> = ({ events, onExport }) => {
  const [actor, setActor] = useState('all');
  const [action, setAction] = useState('all');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [timelineFor, setTimelineFor] = useState<string | null>(null);

  const actors = Array.from(new Set(events.map((e) => e.actor))).sort();
  const actions = Array.from(new Set(events.map((e) => e.action))).sort();
  const filtered = useMemo(
    () =>
      newestFirst(
        events.filter(
          (e) =>
            (actor === 'all' || e.actor === actor) &&
            (action === 'all' || e.action === action) &&
            (!date || e.at.startsWith(date))
        ),
        (e) => e.at
      ),
    [events, actor, action, date]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const timeline = timelineFor ? newestFirst(events.filter((e) => e.actor === timelineFor), (e) => e.at) : [];

  return (
    <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <PillSelect
          className="md:col-span-4"
          label="User"
          searchable
          value={actor}
          onChange={(v) => {
            setActor(v);
            setPage(1);
          }}
          options={[{ value: 'all', label: 'All users' }, ...actors.map((a) => ({ value: a, label: a }))]}
        />
        <PillSelect
          className="md:col-span-3"
          label="Action"
          value={action}
          onChange={(v) => {
            setAction(v);
            setPage(1);
          }}
          options={[{ value: 'all', label: 'All actions' }, ...actions.map((a) => ({ value: a, label: a }))]}
        />
        <div className="md:col-span-3">
          <DatePicker
            label="Date"
            value={date}
            onChange={(d) => {
              setDate(d);
              setPage(1);
            }}
            maxDate={NOW.dateFormatted}
            placeholder="Any date"
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          {date && (
            <button type="button" onClick={() => setDate('')} className={`${SECONDARY_BUTTON} h-11`} aria-label="Clear date">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={() => {
              downloadCsv('ihinga-audit-log.csv', [
                ['Time', 'User', 'Role', 'Action', 'Target'],
                ...filtered.map((e) => [e.at, e.actor, roleLabel(e.actorRole), e.action, e.target]),
              ]);
              onExport(`Audit log CSV · ${filtered.length} events`);
            }}
            className={`${PRIMARY_BUTTON} h-11 flex-1`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <p className="text-[12px] text-[#5B665E] tabular-nums">
        {filtered.length} of {events.length} events · click a name to see that user's timeline
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={Activity} text="No events match these filters." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                <th className="py-2.5 pr-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">User</th>
                <th className="py-2.5 px-3 font-semibold">Role</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 pl-3 font-semibold">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
              {rows.map((e) => (
                <tr key={e.id}>
                  <td className="py-2.5 pr-3 text-[#5B665E] whitespace-nowrap">{e.at}</td>
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => setTimelineFor(e.actor)}
                      className="font-semibold text-[#1F4A34] hover:underline cursor-pointer text-left"
                    >
                      {e.actor}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-[#5B665E]">{roleLabel(e.actorRole)}</td>
                  <td className="py-2.5 px-3 text-[#17271D]">{e.action}</td>
                  <td className="py-2.5 pl-3 text-[#17271D]">{e.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-1 pt-2 border-t border-[rgba(31,74,52,0.06)] text-[12px] text-[#5B665E]">
          <button
            type="button"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
            aria-label="Previous page"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <span className="px-2 tabular-nums">
            Page {current} of {pageCount}
          </span>
          <button
            type="button"
            disabled={current === pageCount}
            onClick={() => setPage(current + 1)}
            aria-label="Next page"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      <CoopModal
        isOpen={!!timelineFor}
        onClose={() => setTimelineFor(null)}
        title={timelineFor || ''}
        subtitle={`${timeline.length} recorded ${timeline.length === 1 ? 'action' : 'actions'}`}
        icon={Activity}
        footer={
          <button type="button" onClick={() => setTimelineFor(null)} className={SECONDARY_BUTTON}>
            Close
          </button>
        }
      >
        <ol className="relative border-l border-[rgba(31,74,52,0.15)] ml-2 space-y-4">
          {timeline.map((e) => (
            <li key={e.id} className="pl-4 relative">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#3E8E55]" />
              <span className="block text-[12px] text-[#5B665E] tabular-nums">{e.at}</span>
              <span className="block text-[13px] text-[#17271D]">
                <span className="font-semibold">{e.action}</span> · {e.target}
              </span>
            </li>
          ))}
        </ol>
      </CoopModal>
    </div>
  );
};

// ---------------------------------------------------------------------------
const LoginActivityTab: React.FC<{
  attempts: LoginAttempt[];
  anomalies: ReturnType<typeof computeSignInAnomalies>;
}> = ({ attempts, anomalies }) => {
  const [result, setResult] = useState('all');
  const sorted = newestFirst(
    attempts.filter((a) => result === 'all' || (result === 'ok' ? a.success : !a.success)),
    (a) => a.at
  );
  const today = attempts.filter((a) => a.at.startsWith(NOW.dateFormatted));
  const ok = today.filter((a) => a.success).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Check, label: 'Successful sign-ins today', value: ok },
          { icon: X, label: 'Failed sign-ins today', value: today.length - ok },
          { icon: AlertTriangle, label: 'Alerts', value: anomalies.length },
        ].map((k) => (
          <div key={k.label} className={`${CARD_CLASS} p-5 flex items-center gap-3`}>
            <IconCircle icon={k.icon} />
            <div>
              <span className="block text-[12px] text-[#5B665E]">{k.label}</span>
              <span className="block text-[22px] font-semibold text-[#17271D] tabular-nums">{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-3`}>
        <h3 className="text-[16px] font-semibold text-[#17271D]">Alerts</h3>
        {anomalies.length === 0 ? (
          <EmptyState icon={ShieldCheck} text={`No account has ${FAILED_SIGN_IN_ALERT_AT} or more failed sign-ins.`} />
        ) : (
          anomalies.map((a) => (
            <div key={a.identifier} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#17271D]/30">
              <AlertTriangle className="w-4 h-4 text-[#17271D] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div className="text-[12.5px] text-[#17271D]">
                <span className="block font-semibold">
                  {a.count} failed sign-ins for {a.accountName}
                </span>
                <span className="block text-[#5B665E] tabular-nums">
                  {a.first} – {a.last.slice(11)} · {a.location} · {a.identifier}
                </span>
                <span className="block text-[#5B665E]">Check with the user, then suspend the account in Users & access if needed.</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Sign-in attempts</h3>
          <PillSelect
            className="w-[200px]"
            value={result}
            onChange={setResult}
            options={[
              { value: 'all', label: 'All attempts' },
              { value: 'ok', label: 'Successful' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                <th className="py-2.5 pr-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">Account</th>
                <th className="py-2.5 px-3 font-semibold">Result</th>
                <th className="py-2.5 px-3 font-semibold">Device</th>
                <th className="py-2.5 pl-3 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
              {sorted.map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5 pr-3 text-[#5B665E] whitespace-nowrap">{a.at}</td>
                  <td className="py-2.5 px-3">
                    <span className="block font-semibold text-[#17271D]">{a.accountName || 'Unknown account'}</span>
                    <span className="block text-[11.5px] text-[#5B665E]">
                      {a.identifier}
                      {a.role ? ` · ${ROLE_LABELS[a.role]}` : ''}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <NeutralChip tone={a.success ? 'tint' : 'outline'}>
                      {a.success ? <Check className="w-3 h-3" strokeWidth={2} /> : <X className="w-3 h-3" strokeWidth={2} />}
                      {a.success ? 'Signed in' : a.reason || 'Failed'}
                    </NeutralChip>
                  </td>
                  <td className="py-2.5 px-3 text-[#17271D]">{a.device}</td>
                  <td className="py-2.5 pl-3 text-[#17271D]">{a.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const DataAccessTab: React.FC<{ events: AuditEvent[] }> = ({ events }) => {
  const access = newestFirst(events.filter((e) => ACCESS_ACTIONS.includes(e.action)), (e) => e.at);
  const exports = newestFirst(events.filter((e) => EXPORT_ACTIONS.includes(e.action)), (e) => e.at);
  const block = (title: string, hint: string, list: AuditEvent[], icon: typeof Eye, empty: string) => (
    <div className={`${CARD_CLASS} p-5 md:p-6 space-y-3`}>
      <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
        <h3 className="text-[16px] font-semibold text-[#17271D]">{title}</h3>
        <p className="text-[12px] text-[#5B665E]">{hint}</p>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={icon} text={empty} />
      ) : (
        <div className="divide-y divide-[rgba(31,74,52,0.06)]">
          {list.map((e) => (
            <div key={e.id} className="py-2.5 flex items-start justify-between gap-3 text-[12.5px]">
              <div>
                <span className="block text-[#17271D]">
                  <span className="font-semibold">{e.actor}</span> · {e.action.toLowerCase()}
                </span>
                <span className="block text-[#5B665E]">{e.target}</span>
              </div>
              <span className="text-[12px] text-[#5B665E] tabular-nums whitespace-nowrap">{e.at}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {block(
        "Farmer data opened",
        "Who opened which farmer's field report",
        access,
        Eye,
        'Nobody has opened a farmer report yet. It is recorded when an officer opens one.'
      )}
      {block('Exports and imports', 'Downloads, CSV exports, uploads and imports', exports, FileDown, 'No exports yet.')}
    </div>
  );
};

// ---------------------------------------------------------------------------
const TIMEOUT_OPTIONS = [5, 10, 15, 30, 60, 120];

const SettingsTab: React.FC<{ settings: SecuritySettings; onSave: (s: SecuritySettings) => void }> = ({
  settings,
  onSave,
}) => {
  const [draft, setDraft] = useState<SecuritySettings>(settings);
  const [confirm, setConfirm] = useState(false);
  const changed = JSON.stringify(draft) !== JSON.stringify(settings);
  const toggleTwoStep = (role: AppRole) =>
    setDraft((d) => ({
      ...d,
      twoStepRoles: d.twoStepRoles.includes(role) ? d.twoStepRoles.filter((r) => r !== role) : [...d.twoStepRoles, role],
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-5 lg:col-span-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#17271D]">Security settings</h3>
            <p className="text-[12px] text-[#5B665E]">Two-step and timeouts take effect at the next sign-in.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={!changed} onClick={() => setDraft(settings)} className={SECONDARY_BUTTON}>
              Discard
            </button>
            <button type="button" disabled={!changed} onClick={() => setConfirm(true)} className={PRIMARY_BUTTON}>
              Save settings
            </button>
          </div>
        </div>

        <div>
          <span className="block text-[13px] font-semibold text-[#17271D] mb-2">Two-step verification required for</span>
          <div className="flex flex-wrap gap-2">
            {ROLE_ORDER.map((r) => {
              const on = draft.twoStepRoles.includes(r);
              const locked = r === 'admin';
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={on}
                  disabled={locked}
                  title={locked ? 'Administrators always use two-step' : undefined}
                  onClick={() => toggleTwoStep(r)}
                  className={`px-3 h-9 rounded-full text-[12.5px] border flex items-center gap-1.5 ${
                    locked ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${on ? 'bg-[#1F4A34] text-white border-[#1F4A34]' : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'}`}
                >
                  {locked ? <Lock className="w-3.5 h-3.5" strokeWidth={2} /> : on && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                  {ROLE_LABELS[r]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-[13px] font-semibold text-[#17271D] mb-2">Sign out after inactivity</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLE_ORDER.map((r) => (
              <PillSelect
                key={r}
                label={ROLE_LABELS[r]}
                value={String(draft.timeoutMinutes[r])}
                onChange={(v) => setDraft((d) => ({ ...d, timeoutMinutes: { ...d.timeoutMinutes, [r]: Number(v) } }))}
                options={TIMEOUT_OPTIONS.map((m) => ({ value: String(m), label: `${m} minutes` }))}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PillSelect
            label="Password length"
            value={String(draft.passwordMinLength)}
            onChange={(v) => setDraft((d) => ({ ...d, passwordMinLength: Number(v) }))}
            options={[6, 8, 10, 12].map((n) => ({ value: String(n), label: `At least ${n} characters` }))}
          />
          <PillSelect
            label="Lock account after"
            value={String(draft.lockAfterFailed)}
            onChange={(v) => setDraft((d) => ({ ...d, lockAfterFailed: Number(v) }))}
            options={[3, 5, 10].map((n) => ({ value: String(n), label: `${n} failed sign-ins` }))}
          />
          <PillSelect
            label="Keep data for"
            value={String(draft.retentionMonths)}
            onChange={(v) => setDraft((d) => ({ ...d, retentionMonths: Number(v) }))}
            options={[6, 12, 24, 36].map((n) => ({ value: String(n), label: `${n} months` }))}
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.06)]">
          <div>
            <span className="block text-[13px] font-medium text-[#17271D]">Passwords must include a number</span>
            <span className="block text-[12px] text-[#5B665E]">Applies when a password is created or reset.</span>
          </div>
          <Toggle
            checked={draft.passwordNeedsNumber}
            onChange={(v) => setDraft((d) => ({ ...d, passwordNeedsNumber: v }))}
            label="Passwords must include a number"
          />
        </div>
      </div>

      <div className={`${CARD_CLASS} p-5 lg:col-span-4 space-y-3`}>
        <h3 className="text-[16px] font-semibold text-[#17271D]">Protection status</h3>
        {ENCRYPTION_STATUS.map((e) => (
          <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#F4F6EF]/60 border border-[rgba(31,74,52,0.06)]">
            <IconCircle icon={Lock} />
            <div>
              <span className="block text-[13px] font-medium text-[#17271D]">{e.label}</span>
              <span className="block text-[12px] text-[#5B665E]">{e.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={confirm}
        icon={ShieldCheck}
        title="Save security settings?"
        body="New two-step and timeout rules apply the next time each person signs in."
        confirmLabel="Save settings"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          onSave(draft);
          setConfirm(false);
        }}
      />
    </div>
  );
};
