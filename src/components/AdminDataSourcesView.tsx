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
import { FORECAST_MODEL, NOW, PROCESSING_LABELS, PROCESSING_SCHEDULE, sourceCompleteness } from '../data/musanzeData';
import { ProcessingRun } from '../types';
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
  'Crop data': Database,
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
    {PROCESSING_LABELS.sourceStatus[status]}
  </NeutralChip>
);

interface AdminDataSourcesViewProps {
  dataSources: DataSourceStatus[];
  permissions: PermissionId[];
  onRefresh: (sourceId: string) => void;
  onAddSource: (source: DataSourceStatus) => void;
  /** Latest processing run (= latest forecast update) and how many sectors have a forecast. */
  lastRun?: ProcessingRun;
  sectorsForecast: number;
  onOpenProcessing: () => void;
}

export const AdminDataSourcesView: React.FC<AdminDataSourcesViewProps> = ({
  dataSources,
  permissions,
  onRefresh,
  onAddSource,
  lastRun,
  sectorsForecast,
  onOpenProcessing,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const canManage = permissions.includes('manage_data_sources');
  // Late or incomplete sources first
  const needsAttention = (d: DataSourceStatus) => d.status !== 'Healthy' || sourceCompleteness(d) < 100;
  const sorted = [...dataSources].sort((a, b) => Number(needsAttention(b)) - Number(needsAttention(a)));
  const lateCount = dataSources.filter(needsAttention).length;

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
        subtitle={`Where the forecast comes from · ${lateCount === 0 ? 'all data up to date' : `${lateCount} ${lateCount === 1 ? 'source needs' : 'sources need'} attention`} · simulated in the prototype`}
        actions={
          <button type="button" onClick={() => setIsWizardOpen(true)} className={PRIMARY_BUTTON}>
            <Plug className="w-3.5 h-3.5" />
            <span>Add a source</span>
          </button>
        }
      />

      {/* The forecast model */}
      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconCircle icon={Database} />
            <div>
              <h3 className="text-[16px] font-semibold text-[#17271D] leading-tight">{FORECAST_MODEL.name}</h3>
              <span className="text-[12px] text-[#5B665E]">Makes the rain and temperature forecast for every sector · simulated</span>
            </div>
          </div>
          <button type="button" onClick={onOpenProcessing} className={SECONDARY_BUTTON}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Updates and history</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
          <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)]">
            <span className="block text-[#5B665E]">Last forecast update</span>
            <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">{lastRun ? lastRun.startedAt : '—'}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)]">
            <span className="block text-[#5B665E]">Next update</span>
            <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">{PROCESSING_SCHEDULE.nextAt}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)]">
            <span className="block text-[#5B665E]">Sectors with a forecast</span>
            <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">{sectorsForecast} of 15</span>
          </div>
        </div>
        <div>
          <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Learned from</span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FORECAST_MODEL.trainedOn.map((t) => (
              <li key={t.what} className="p-3 rounded-xl bg-white border border-[rgba(31,74,52,0.08)] text-[12.5px]">
                <span className="block font-semibold text-[#17271D]">{t.source}</span>
                <span className="block text-[#5B665E]">
                  {t.what} · {t.years}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex items-start gap-1.5 text-[11.5px] text-[#5B665E]">
            <Info className="w-3.5 h-3.5 text-[#1F4A34] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            Prototype: the model and its data are simulated, and the years are illustrative. Naming the data owners does not mean they endorse IHINGA AI.
          </p>
        </div>
      </div>

      {/* The data the model reads every update (late ones first) */}
      <div className={`${CARD_CLASS} p-5 md:p-6`}>
        <h3 className="text-[16px] font-semibold text-[#17271D] pb-3 border-b border-[rgba(31,74,52,0.08)]">Data coming in</h3>
        <div className="divide-y divide-[rgba(31,74,52,0.06)]">
          {sorted.map((d) => {
            const pct = sourceCompleteness(d);
            const late = needsAttention(d);
            return (
              <div key={d.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <IconCircle icon={KIND_ICON[d.kind]} />
                  <div className="min-w-0 text-[12.5px]">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-[#17271D]">{d.name}</span>
                      <StatusChip status={d.status} />
                    </span>
                    <span className="block text-[#5B665E] mt-0.5">
                      {d.note} · updates: {d.schedule}
                    </span>
                    <span className={`block tabular-nums mt-0.5 ${late ? 'text-[#17271D] font-medium' : 'text-[#5B665E]'}`}>
                      {late && <AlertCircle className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={1.5} />}
                      Received today: {d.recordsToday} of {d.expectedToday} ({pct}%) · last update {d.lastSync}
                    </span>
                  </div>
                </div>
                {d.kind === 'File upload' ? (
                  <NeutralChip tone="outline">
                    <UserRound className="w-3 h-3" strokeWidth={1.5} />
                    Sent by the agricultural officer
                  </NeutralChip>
                ) : (
                  <button type="button" onClick={() => onRefresh(d.id)} className={SECONDARY_BUTTON}>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check now</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
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
const WIZARD_STEPS = ['Type', 'Web address', 'Sign-in', 'How often', 'Test'] as const;
const KINDS: DataSourceStatus['kind'][] = ['Station network', 'Satellite', 'Crop data', 'File upload'];
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
          <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Web address of the data</span>
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
        <PillSelect label="How often to check" value={schedule} onChange={setSchedule} options={SCHEDULES.map((s) => ({ value: s, label: s }))} />
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
