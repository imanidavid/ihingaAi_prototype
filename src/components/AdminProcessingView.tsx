import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Info, Loader2, Play, RotateCcw, Settings2, Workflow } from 'lucide-react';
import { DataSourceStatus, ProcessingRun, ProcessingSettings } from '../types';
import {
  NOW_STAMP,
  PROCESSING_SCHEDULE,
  PROCESSING_STAGES,
  RAINFALL_NORMAL_MM_PER_DAY,
  sourceCompleteness,
  stampSortKey,
  PROCESSING_LABELS,
} from '../data/musanzeData';
import { PillSelect } from './PillSelect';
import {
  CARD_CLASS,
  ConfirmModal,
  IconCircle,
  NeutralChip,
  PageHeader,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from './coop/CoopUi';

const STEP_MS = 450;

interface AdminProcessingViewProps {
  runs: ProcessingRun[];
  settings: ProcessingSettings;
  dataSources: DataSourceStatus[];
  onRun: (run: ProcessingRun) => void;
  onSaveSettings: (next: ProcessingSettings) => void;
}

export const AdminProcessingView: React.FC<AdminProcessingViewProps> = ({
  runs,
  settings,
  dataSources,
  onRun,
  onSaveSettings,
}) => {
  // Index of the stage being processed; null = idle
  const [running, setRunning] = useState<{ stage: number; trigger: ProcessingRun['trigger'] } | null>(null);
  const [draft, setDraft] = useState<ProcessingSettings>(settings);
  const [confirmReprocess, setConfirmReprocess] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  const sortedRuns = useMemo(
    () => [...runs].map((r, i) => ({ r, i })).sort((a, b) => stampSortKey(b.r.startedAt) - stampSortKey(a.r.startedAt) || b.i - a.i).map(({ r }) => r),
    [runs]
  );
  const last = sortedRuns[0];

  // Quality metrics from the data sources and the settings
  const recordsToday = dataSources.reduce((s, d) => s + d.recordsToday, 0);
  const expectedToday = dataSources.reduce((s, d) => s + d.expectedToday, 0);
  const missing = Math.max(0, expectedToday - recordsToday);
  const outliersForThreshold = settings.outlierThresholdSd <= 2 ? 3 : settings.outlierThresholdSd >= 4 ? 0 : 1;

  useEffect(() => {
    if (!running) return;
    if (running.stage >= PROCESSING_STAGES.length) {
      onRun({
        id: `run-demo-${Date.now()}`,
        startedAt: NOW_STAMP,
        trigger: running.trigger,
        status: missing > 0 ? 'Completed with warnings' : 'Completed',
        durationMin: 4,
        recordsIn: recordsToday,
        gapsFilled: missing,
        outliersFlagged: outliersForThreshold,
      });
      setRunning(null);
      return;
    }
    const t = setTimeout(() => setRunning((r) => (r ? { ...r, stage: r.stage + 1 } : r)), STEP_MS);
    return () => clearTimeout(t);
  }, [running]);

  const stageState = (i: number): 'done' | 'running' | 'waiting' =>
    !running ? 'done' : i < running.stage ? 'done' : i === running.stage ? 'running' : 'waiting';
  const changed = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data processing"
        subtitle={`${PROCESSING_SCHEDULE.every} the system checks new data and updates the forecast · last update ${last ? last.startedAt : '—'} · next ${PROCESSING_SCHEDULE.nextAt}`}
        actions={
          <>
            <button
              type="button"
              disabled={!!running}
              onClick={() => setConfirmReprocess(true)}
              className={SECONDARY_BUTTON}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Redo today</span>
            </button>
            <button
              type="button"
              disabled={!!running}
              onClick={() => setRunning({ stage: 0, trigger: 'Run now' })}
              className={PRIMARY_BUTTON}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Update now</span>
            </button>
          </>
        }
      />

      {/* Pipeline */}
      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Steps of each update</h3>
          <span className="text-[12px] text-[#5B665E]">
            {running
              ? `${running.trigger === 'Reprocess' ? 'Redoing' : 'Updating'} · step ${Math.min(running.stage + 1, PROCESSING_STAGES.length)} of ${PROCESSING_STAGES.length}`
              : last
              ? `Last update ${PROCESSING_LABELS.status[last.status].toLowerCase()} at ${last.startedAt.slice(11)}`
              : 'Not updated yet'}
          </span>
        </div>
        {running && (
          <div className="w-full h-2 bg-[#F4F6EF] rounded-full overflow-hidden border border-[rgba(31,74,52,0.08)]">
            <div
              className="h-full bg-[#3E8E55] rounded-full transition-all"
              style={{ width: `${(running.stage / PROCESSING_STAGES.length) * 100}%` }}
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {PROCESSING_STAGES.map((st, i) => {
            const state = stageState(i);
            return (
              <div
                key={st.id}
                className={`p-3 rounded-xl border space-y-1.5 ${
                  state === 'running' ? 'border-[#1F4A34] bg-white' : 'border-[rgba(31,74,52,0.08)] bg-[#F4F6EF]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#5B665E] tabular-nums">Step {i + 1}</span>
                  {state === 'done' ? (
                    <Check className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={2} />
                  ) : state === 'running' ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#1F4A34] animate-spin" strokeWidth={2} />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-[#5B665E]" strokeWidth={1.5} />
                  )}
                </div>
                <span className="block text-[13px] font-semibold text-[#17271D]">{st.label}</span>
                <span className="block text-[11.5px] text-[#5B665E] leading-snug">
                  {st.id === 'aggregate' ? `${st.detail} (shown per ${PROCESSING_LABELS.aggregation[settings.aggregation].toLowerCase()})` : st.id === 'normals' ? `Normal rain used on charts: ${RAINFALL_NORMAL_MM_PER_DAY} mm a day` : st.detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quality metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Readings received today',
            value: `${recordsToday} of ${expectedToday}`,
            caption: missing > 0 ? `${missing} still missing (${Math.round((recordsToday / Math.max(1, expectedToday)) * 100)}% in) · from ${dataSources.length} sources` : `Nothing missing · from ${dataSources.length} sources`,
          },
          { label: 'Missing readings filled in', value: `${last ? last.gapsFilled : 0}`, caption: `Last update · ${PROCESSING_LABELS.gapMethod[settings.gapMethod].toLowerCase()}` },
          { label: 'Odd readings set aside', value: `${last ? last.outliersFlagged : 0}`, caption: `Last update · far from nearby stations (${PROCESSING_LABELS.outlier[settings.outlierThresholdSd].toLowerCase()})` },
        ].map((k) => (
          <div key={k.label} className={`${CARD_CLASS} p-5 flex items-start gap-3`}>
            <IconCircle icon={Workflow} />
            <div>
              <span className="block text-[12px] text-[#5B665E]">{k.label}</span>
              <span className="block text-[22px] font-semibold text-[#17271D] tabular-nums leading-tight">{k.value}</span>
              <span className="block text-[12px] text-[#5B665E]">{k.caption}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Run history */}
        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-7`}>
          <h3 className="text-[16px] font-semibold text-[#17271D] pb-3 border-b border-[rgba(31,74,52,0.08)]">Past updates</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                  <th className="py-2.5 pr-3 font-semibold">When</th>
                  <th className="py-2.5 px-3 font-semibold">Started by</th>
                  <th className="py-2.5 px-3 font-semibold">Result</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Readings</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Filled in</th>
                  <th className="py-2.5 pl-3 font-semibold text-right">Set aside</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                {sortedRuns.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 text-[#17271D] whitespace-nowrap">{r.startedAt}</td>
                    <td className="py-2.5 px-3 text-[#5B665E]">{PROCESSING_LABELS.trigger[r.trigger]}</td>
                    <td className="py-2.5 px-3">
                      <NeutralChip tone={r.status === 'Completed' ? 'tint' : 'outline'}>
                        <Check className="w-3 h-3" strokeWidth={2} />
                        {PROCESSING_LABELS.status[r.status]}
                      </NeutralChip>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#17271D]">{r.recordsIn}</td>
                    <td className="py-2.5 px-3 text-right text-[#17271D]">{r.gapsFilled}</td>
                    <td className="py-2.5 pl-3 text-right text-[#17271D]">{r.outliersFlagged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Settings */}
        <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-5 space-y-4`}>
          <div className="flex items-center gap-2 pb-3 border-b border-[rgba(31,74,52,0.08)]">
            <Settings2 className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.5} />
            <h3 className="text-[16px] font-semibold text-[#17271D]">How data is checked</h3>
          </div>
          <PillSelect
            label="When a reading is missing"
            value={draft.gapMethod}
            onChange={(v) => setDraft((d) => ({ ...d, gapMethod: v as ProcessingSettings['gapMethod'] }))}
            options={(Object.keys(PROCESSING_LABELS.gapMethod) as ProcessingSettings['gapMethod'][]).map((v) => ({ value: v, label: PROCESSING_LABELS.gapMethod[v] }))}
          />
          <PillSelect
            label="How strict with odd readings"
            value={String(draft.outlierThresholdSd)}
            onChange={(v) => setDraft((d) => ({ ...d, outlierThresholdSd: Number(v) }))}
            options={[2, 3, 4].map((n) => ({ value: String(n), label: PROCESSING_LABELS.outlier[n] }))}
          />
          <PillSelect
            label="Sectors without a station"
            value={draft.interpolation}
            onChange={(v) => setDraft((d) => ({ ...d, interpolation: v as ProcessingSettings['interpolation'] }))}
            options={(Object.keys(PROCESSING_LABELS.interpolation) as ProcessingSettings['interpolation'][]).map((v) => ({ value: v, label: PROCESSING_LABELS.interpolation[v] }))}
          />
          <PillSelect
            label="Show totals per"
            value={draft.aggregation}
            onChange={(v) => setDraft((d) => ({ ...d, aggregation: v as ProcessingSettings['aggregation'] }))}
            options={(Object.keys(PROCESSING_LABELS.aggregation) as ProcessingSettings['aggregation'][]).map((v) => ({ value: v, label: PROCESSING_LABELS.aggregation[v] }))}
          />
          <p className="flex items-start gap-1.5 text-[12px] text-[#5B665E]">
            <Info className="w-3.5 h-3.5 text-[#1F4A34] mt-0.5" strokeWidth={1.5} />
            Changes apply from the next update. Simulated in the prototype.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" disabled={!changed} onClick={() => setDraft(settings)} className={SECONDARY_BUTTON}>
              Discard
            </button>
            <button type="button" disabled={!changed} onClick={() => onSaveSettings(draft)} className={PRIMARY_BUTTON}>
              Save settings
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmReprocess}
        icon={RotateCcw}
        title="Redo today's update?"
        body="All of today's readings go through every step again with the current settings. The forecast updates when it finishes."
        confirmLabel="Redo today"
        onClose={() => setConfirmReprocess(false)}
        onConfirm={() => {
          setConfirmReprocess(false);
          setRunning({ stage: 0, trigger: 'Reprocess' });
        }}
      />
    </div>
  );
};
