import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  CloudRain,
  Database,
  FileSpreadsheet,
  Info,
  Lock,
  Plug,
  RefreshCw,
  Satellite,
  UserRound,
  XCircle,
} from 'lucide-react';
import { DataSourceStatus, PermissionId } from '../types';
import { NOW, sourceCompleteness } from '../data/musanzeData';
import { PillSelect } from './PillSelect';
import {
  CARD_CLASS,
  CoopModal,
  EmptyState,
  IconCircle,
  NeutralChip,
  PageHeader,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  TEXT_INPUT,
} from './coop/CoopUi';

const KIND_ICON: Record<DataSourceStatus['kind'], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  'Station network': CloudRain,
  Satellite: Satellite,
  'Forecast model': Database,
  'File upload': FileSpreadsheet,
};

const StatusChip: React.FC<{ status: DataSourceStatus['status'] }> = ({ status }) => (
  <NeutralChip tone={status === 'Healthy' ? 'tint' : 'outline'}>
    {status === 'Healthy' ? (
      <Check className="w-3 h-3" strokeWidth={2} />
    ) : status === 'Delayed' ? (
      <Clock className="w-3 h-3" strokeWidth={1.5} />
    ) : (
      <XCircle className="w-3 h-3" strokeWidth={1.5} />
    )}
    {status}
  </NeutralChip>
);

interface AdminDataSourcesViewProps {
  dataSources: DataSourceStatus[];
  permissions: PermissionId[];
  onRefresh: (sourceId: string) => void;
  onAddSource: (source: DataSourceStatus) => void;
}

export const AdminDataSourcesView: React.FC<AdminDataSourcesViewProps> = ({
  dataSources,
  permissions,
  onRefresh,
  onAddSource,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const canManage = permissions.includes('manage_data_sources');
  const alerts = dataSources.filter((d) => d.status !== 'Healthy' || sourceCompleteness(d) < 100);
  const healthy = dataSources.filter((d) => d.status === 'Healthy').length;

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader title="Data sources" subtitle="Feeds behind the forecasts" />
        <div className={CARD_CLASS}>
          <EmptyState icon={Lock} text="Your role does not have the “Manage data sources” permission." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data sources"
        subtitle={`${healthy} of ${dataSources.length} feeds healthy · all feeds are simulated in the prototype · officers upload station readings and rain forecasts`}
        actions={
          <button type="button" onClick={() => setIsWizardOpen(true)} className={PRIMARY_BUTTON}>
            <Plug className="w-3.5 h-3.5" />
            <span>Connect a source</span>
          </button>
        }
      />

      {/* Missing-data alerts */}
      <div className={`${CARD_CLASS} p-5 space-y-3`}>
        <h3 className="text-[16px] font-semibold text-[#17271D]">Missing-data alerts</h3>
        {alerts.length === 0 ? (
          <EmptyState icon={Check} text="Every feed is on time and complete today." />
        ) : (
          alerts.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-[#17271D]/30">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#17271D] mt-0.5" strokeWidth={1.5} />
                <div className="text-[12.5px]">
                  <span className="block font-semibold text-[#17271D]">
                    {d.name}: {d.recordsToday} of {d.expectedToday} records today ({sourceCompleteness(d)}%)
                  </span>
                  <span className="block text-[#5B665E] tabular-nums">
                    Last sync {d.lastSync} · {d.note}
                  </span>
                </div>
              </div>
              {d.kind === 'File upload' ? (
                <NeutralChip tone="outline">
                  <UserRound className="w-3 h-3" strokeWidth={1.5} />
                  Uploaded by the agricultural officer
                </NeutralChip>
              ) : (
                <button type="button" onClick={() => onRefresh(d.id)} className={SECONDARY_BUTTON}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync now</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {dataSources.map((d) => {
          const pct = sourceCompleteness(d);
          return (
            <div key={d.id} className={`${CARD_CLASS} p-5 flex flex-col gap-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <IconCircle icon={KIND_ICON[d.kind]} />
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#17271D] leading-tight">{d.name}</h3>
                    <span className="text-[12px] text-[#5B665E]">{d.kind} · Simulated feed</span>
                  </div>
                </div>
                <StatusChip status={d.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)]">
                  <span className="block text-[#5B665E]">Last sync</span>
                  <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">{d.lastSync}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)]">
                  <span className="block text-[#5B665E]">Records today</span>
                  <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">
                    {d.recordsToday} of {d.expectedToday}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#5B665E]">Completeness</span>
                  <span className="font-semibold text-[#17271D] tabular-nums">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
                  <div className="h-full bg-[#3E8E55] rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="text-[12px] text-[#5B665E] space-y-0.5">
                <span className="block">Refresh: {d.schedule}</span>
                <span className="block break-all">Source: {d.endpoint}</span>
                <span className="block">{d.note}</span>
              </div>
              {d.kind !== 'File upload' && (
                <button type="button" onClick={() => onRefresh(d.id)} className={SECONDARY_BUTTON}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync now</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <ConnectionWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        existingNames={dataSources.map((d) => d.name.toLowerCase())}
        onSave={(source) => {
          onAddSource(source);
          setIsWizardOpen(false);
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
const WIZARD_STEPS = ['Type', 'Address', 'Sign-in', 'Schedule', 'Test'] as const;
const KINDS: DataSourceStatus['kind'][] = ['Station network', 'Satellite', 'Forecast model', 'File upload'];
const SCHEDULES = ['Every 15 minutes', 'Every hour', 'Every 6 hours', 'Daily at 12:00', 'Weekly on Sunday'];

const ConnectionWizard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  existingNames: string[];
  onSave: (source: DataSourceStatus) => void;
}> = ({ isOpen, onClose, existingNames, onSave }) => {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<DataSourceStatus['kind']>('Station network');
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [schedule, setSchedule] = useState(SCHEDULES[1]);
  const [tested, setTested] = useState<'idle' | 'testing' | 'ok'>('idle');

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setKind('Station network');
      setName('');
      setEndpoint('');
      setUsername('');
      setSecret('');
      setSchedule(SCHEDULES[1]);
      setTested('idle');
    }
  }, [isOpen]);

  useEffect(() => {
    if (tested !== 'testing') return;
    const t = setTimeout(() => setTested('ok'), 900);
    return () => clearTimeout(t);
  }, [tested]);

  const nameTaken = existingNames.includes(name.trim().toLowerCase());
  const canNext =
    step === 0
      ? name.trim() !== '' && !nameTaken
      : step === 1
      ? endpoint.trim() !== ''
      : step === 2
      ? kind === 'File upload' || (username.trim() !== '' && secret.trim() !== '')
      : step === 3
      ? true
      : tested === 'ok';

  return (
    <CoopModal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect a data source"
      subtitle={`Step ${step + 1} of ${WIZARD_STEPS.length}: ${WIZARD_STEPS[step]} · simulated connection`}
      icon={Plug}
      footer={
        <>
          <button type="button" onClick={step === 0 ? onClose : () => setStep(step - 1)} className={SECONDARY_BUTTON}>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < WIZARD_STEPS.length - 1 ? (
            <button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className={PRIMARY_BUTTON}>
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext}
              onClick={() =>
                onSave({
                  id: `ds-demo-${Date.now()}`,
                  name: name.trim(),
                  kind,
                  status: 'Healthy',
                  lastSync: `${NOW.dateFormatted.slice(0, 5)} ${NOW.timeFormatted}`,
                  note: 'Connected just now',
                  endpoint: endpoint.trim(),
                  schedule,
                  recordsToday: 0,
                  expectedToday: 0,
                  isDemo: true,
                })
              }
              className={PRIMARY_BUTTON}
            >
              Save source
            </button>
          )}
        </>
      }
    >
      <div className="flex gap-1.5">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#3E8E55]' : 'bg-[#E4ECDB]'}`} />
        ))}
      </div>

      {step === 0 && (
        <>
          <PillSelect label="Source type" value={kind} onChange={(v) => setKind(v as DataSourceStatus['kind'])} options={KINDS.map((k) => ({ value: k, label: k }))} />
          <label className="block">
            <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cyuve rain gauges" className={TEXT_INPUT} />
            {nameTaken && <span className="block mt-1 text-[12px] text-[#17271D]">A source with this name already exists.</span>}
          </label>
        </>
      )}
      {step === 1 && (
        <label className="block">
          <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Address of the feed</span>
          <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="e.g. gauges.ihinga.demo/cyuve" className={TEXT_INPUT} />
          <span className="block mt-1 text-[12px] text-[#5B665E]">In the prototype no real connection is made.</span>
        </label>
      )}
      {step === 2 &&
        (kind === 'File upload' ? (
          <p className="text-[12.5px] text-[#5B665E]">File uploads need no sign-in. The agricultural officer adds files on the Weather data page.</p>
        ) : (
          <>
            <label className="block">
              <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">User name</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className={TEXT_INPUT} autoComplete="off" />
            </label>
            <label className="block">
              <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Access key</span>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className={TEXT_INPUT}
                autoComplete="new-password"
              />
              <span className="block mt-1 text-[12px] text-[#5B665E]">Shown masked and never displayed again.</span>
            </label>
          </>
        ))}
      {step === 3 && (
        <PillSelect label="Refresh schedule" value={schedule} onChange={setSchedule} options={SCHEDULES.map((s) => ({ value: s, label: s }))} />
      )}
      {step === 4 && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)] text-[12.5px] text-[#17271D] space-y-0.5">
            <span className="block">
              <span className="font-semibold">{name}</span> · {kind}
            </span>
            <span className="block text-[#5B665E] break-all">{endpoint}</span>
            <span className="block text-[#5B665E]">
              {schedule}
              {kind !== 'File upload' && secret ? ` · key ${'•'.repeat(Math.min(8, secret.length))}` : ''}
            </span>
          </div>
          <button type="button" disabled={tested === 'testing'} onClick={() => setTested('testing')} className={SECONDARY_BUTTON}>
            <RefreshCw className={`w-3.5 h-3.5 ${tested === 'testing' ? 'animate-spin' : ''}`} />
            <span>{tested === 'testing' ? 'Testing…' : 'Test connection'}</span>
          </button>
          {tested === 'ok' && (
            <p className="flex items-center gap-1.5 text-[12.5px] text-[#17271D]">
              <Check className="w-4 h-4 text-[#1F4A34]" strokeWidth={2} />
              Test passed (simulated). Save to start syncing.
            </p>
          )}
          <p className="flex items-center gap-1.5 text-[12px] text-[#5B665E]">
            <Info className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
            Simulated feed — the prototype does not contact any outside system.
          </p>
        </div>
      )}
    </CoopModal>
  );
};
