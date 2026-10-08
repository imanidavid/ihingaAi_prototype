import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Download, Lock, Table2, X } from 'lucide-react';
import { PermissionId, ReportItem } from '../types';
import { anonymisedReportId } from '../data/musanzeData';
import { MUSANZE_SECTORS } from '../data/rwandaAdminData';
import { PillSelect } from './PillSelect';
import { CARD_CLASS, EmptyState, NeutralChip, PageHeader, PRIMARY_BUTTON } from './coop/CoopUi';

const PAGE_SIZE = 10;
const REPORT_TYPES = ['Rainfall', 'Flood / damage', 'Crop condition', 'Pest / disease'];

interface ResearcherFieldDataViewProps {
  reports: ReportItem[];
  /** Permissions of the signed-in role (set by the administrator's permission matrix). */
  permissions: PermissionId[];
  onExport: (rows: number) => void;
}

export const ResearcherFieldDataView: React.FC<ResearcherFieldDataViewProps> = ({ reports, permissions, onExport }) => {
  const [sector, setSector] = useState('all');
  const [type, setType] = useState('all');
  const [check, setCheck] = useState('all');
  const [page, setPage] = useState(1);

  const canView = permissions.includes('view_research_data');
  const canExport = permissions.includes('export_data');

  // Only reports that reached an officer; never the farmer's name or cell
  const rows = useMemo(
    () =>
      reports
        .filter((r) => !['Not sent', 'Waiting to send'].includes(r.status))
        .filter((r) => sector === 'all' || r.sector === sector)
        .filter((r) => type === 'all' || r.type === type)
        .filter((r) => check === 'all' || (check === 'match' ? r.isConsistent : !r.isConsistent))
        .map((r) => ({
          id: anonymisedReportId(r.id),
          sector: r.sector,
          type: r.type,
          date: r.date,
          status: r.status,
          matches: !!r.isConsistent,
        })),
    [reports, sector, type, check]
  );

  if (!canView) {
    return (
      <div className="space-y-6">
        <PageHeader title="Field data" subtitle="Anonymised field reports" />
        <div className={CARD_CLASS}>
          <EmptyState icon={Lock} text="Your role no longer has the “View research data” permission. Ask the administrator." />
        </div>
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const exportCsv = () => {
    const csv = [
      ['report_id', 'sector', 'type', 'date', 'status', 'matches_forecast'],
      ...rows.map((r) => [r.id, r.sector, r.type, r.date, r.status, r.matches ? 'yes' : 'no']),
    ]
      .map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ihinga-field-data-anonymised.csv';
    a.click();
    URL.revokeObjectURL(url);
    onExport(rows.length);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field data"
        subtitle="Farmers' field reports, anonymised: no names, phones or cells"
        actions={
          <button
            type="button"
            disabled={!canExport || rows.length === 0}
            title={canExport ? undefined : 'Your role does not have the “Export data” permission'}
            onClick={exportCsv}
            className={PRIMARY_BUTTON}
          >
            {canExport ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>Export CSV ({rows.length})</span>
          </button>
        }
      />

      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PillSelect
            label="Sector"
            value={sector}
            onChange={(v) => {
              setSector(v);
              setPage(1);
            }}
            options={[{ value: 'all', label: 'All sectors' }, ...MUSANZE_SECTORS.map((s) => ({ value: s, label: s }))]}
          />
          <PillSelect
            label="Report type"
            value={type}
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
            options={[{ value: 'all', label: 'All types' }, ...REPORT_TYPES.map((t) => ({ value: t, label: t }))]}
          />
          <PillSelect
            label="Forecast check"
            value={check}
            onChange={(v) => {
              setCheck(v);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All reports' },
              { value: 'match', label: 'Matches forecast' },
              { value: 'differ', label: 'Differs from forecast' },
            ]}
          />
        </div>

        <p className="text-[12px] text-[#5B665E] tabular-nums">{rows.length} reports</p>

        {rows.length === 0 ? (
          <EmptyState icon={Table2} text="No reports match these filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                  <th className="py-2.5 pr-3 font-semibold">Report</th>
                  <th className="py-2.5 px-3 font-semibold">Sector</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Officer review</th>
                  <th className="py-2.5 pl-3 font-semibold">Forecast check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 font-semibold text-[#17271D]">{r.id}</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.sector}</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.type}</td>
                    <td className="py-2.5 px-3 text-[#5B665E] whitespace-nowrap">{r.date}</td>
                    <td className="py-2.5 px-3 text-[#17271D]">{r.status}</td>
                    <td className="py-2.5 pl-3">
                      <NeutralChip tone={r.matches ? 'tint' : 'outline'}>
                        {r.matches ? <Check className="w-3 h-3" strokeWidth={2} /> : <X className="w-3 h-3" strokeWidth={2} />}
                        {r.matches ? 'Matches' : 'Differs'}
                      </NeutralChip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > PAGE_SIZE && (
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
      </div>
    </div>
  );
};
