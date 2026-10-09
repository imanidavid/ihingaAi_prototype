import React, { useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, FileSpreadsheet, Info, Upload } from 'lucide-react';
import { UserAccount } from '../../types';
import { NOW, NOW_STAMP } from '../../data/musanzeData';
import {
  COOPERATIVE_OPTIONS,
  IMPORT_CSV_COLUMNS,
  SAMPLE_MEMBER_IMPORT_CSV,
  parseMemberCsv,
} from '../../data/rwandaAdminData';
import { PillSelect } from '../PillSelect';
import { CARD_CLASS, EmptyState, NeutralChip, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../coop/CoopUi';

/** Bulk import: cooperative member list (CSV) → preview with checks → import the valid rows. */
export const BulkImportTab: React.FC<{
  accounts: UserAccount[];
  onImport: (accounts: UserAccount[], cooperative: string) => void;
}> = ({ accounts, onImport }) => {
  const [cooperative, setCooperative] = useState('Musanze Potato Growers Cooperative');
  const [csv, setCsv] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => (csv === null ? null : parseMemberCsv(csv, accounts)), [csv, accounts]);
  const valid = parsed ? parsed.rows.filter((r) => r.errors.length === 0) : [];
  const invalid = parsed ? parsed.rows.length - valid.length : 0;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then((text) => {
      setCsv(text);
      setFileName(file.name);
    });
  };

  const handleImport = () => {
    const stamp = Date.now();
    const imported: UserAccount[] = valid.map((r, i) => ({
      id: `acc-import-${stamp}-${i}`,
      role: 'farmer',
      fullName: r.fullName,
      phone: r.phone,
      district: 'Musanze',
      preferredLanguage: 'rw',
      status: 'active',
      createdAt: NOW.dateFormatted,
      twoStepEnabled: false,
      scope: { district: 'Musanze', sectors: [r.sector], cooperative },
      farmerDetails: {
        sector: r.sector,
        cell: r.cell,
        farmSizeHa: 0,
        cropsGrown: r.crops.length > 0 ? r.crops : ['Irish Potato'],
        cooperative,
      },
    }));
    onImport(imported, cooperative);
    setCsv(null);
    setFileName('');
  };

  return (
    <div className="space-y-6">
      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
        <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Import cooperative members</h3>
          <p className="text-[12px] text-[#5B665E]">
            Upload a CSV with the columns {IMPORT_CSV_COLUMNS.join(', ')}. Separate several crops with “;”.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <PillSelect
            className="md:col-span-5"
            label="Cooperative"
            value={cooperative}
            onChange={setCooperative}
            options={COOPERATIVE_OPTIONS.filter((c) => c !== 'None / Individual' && c !== 'Other cooperative').map((c) => ({
              value: c,
              label: c,
            }))}
          />
          <div className="md:col-span-7 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <button type="button" onClick={() => fileRef.current?.click()} className={`${PRIMARY_BUTTON} h-11`}>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCsv(SAMPLE_MEMBER_IMPORT_CSV);
                setFileName('sample-members.csv');
              }}
              className={`${SECONDARY_BUTTON} h-11`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Use sample file</span>
            </button>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-[12px] text-[#5B665E]">
          <Info className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
          Imported farmers get an active account and can be added to a group by their cooperative leader.
        </p>
      </div>

      <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#17271D]">Preview</h3>
            <p className="text-[12px] text-[#5B665E] tabular-nums">
              {parsed && !parsed.headerError
                ? `${fileName} · ${valid.length} ready · ${invalid} with problems`
                : 'Choose a file to check it before importing'}
            </p>
          </div>
          <button type="button" disabled={valid.length === 0} onClick={handleImport} className={PRIMARY_BUTTON}>
            <Check className="w-3.5 h-3.5" />
            <span>{valid.length === 0 ? 'Import valid rows' : `Import ${valid.length} valid ${valid.length === 1 ? 'row' : 'rows'}`}</span>
          </button>
        </div>

        {!parsed ? (
          <EmptyState icon={FileSpreadsheet} text="No file chosen yet." />
        ) : parsed.headerError ? (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-white border border-[#17271D]/40 text-[12.5px] text-[#17271D]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{parsed.headerError}</span>
          </div>
        ) : parsed.rows.length === 0 ? (
          <EmptyState icon={FileSpreadsheet} text="The file has no rows." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                  <th className="py-2.5 pr-3 font-semibold">Line</th>
                  <th className="py-2.5 px-3 font-semibold">Name</th>
                  <th className="py-2.5 px-3 font-semibold">Phone</th>
                  <th className="py-2.5 px-3 font-semibold">Sector · cell</th>
                  <th className="py-2.5 px-3 font-semibold">Crops</th>
                  <th className="py-2.5 pl-3 font-semibold">Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                {parsed.rows.map((r) => (
                  <tr key={r.line}>
                    <td className="py-2.5 pr-3 text-[#5B665E]">{r.line}</td>
                    <td className="py-2.5 px-3 text-[#17271D] font-medium">{r.fullName || '—'}</td>
                    <td className="py-2.5 px-3 text-[#17271D] whitespace-nowrap">{r.phone || '—'}</td>
                    <td className="py-2.5 px-3 text-[#17271D]">
                      {r.sector || '—'} · {r.cell || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[#5B665E]">{r.crops.join(', ') || '—'}</td>
                    <td className="py-2.5 pl-3">
                      {r.errors.length === 0 ? (
                        <NeutralChip>
                          <Check className="w-3 h-3" strokeWidth={2} />
                          Ready
                        </NeutralChip>
                      ) : (
                        <span className="flex items-start gap-1.5 text-[12px] text-[#17271D]">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                          {r.errors.join(' · ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[12px] text-[#5B665E]">Checked against the account list at {NOW_STAMP}.</p>
      </div>
    </div>
  );
};
