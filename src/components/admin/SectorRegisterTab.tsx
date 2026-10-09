import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { SectorRegisterEntry } from '../../types';
import { totalRegisteredFarmers } from '../../data/musanzeData';
import { CARD_CLASS, ConfirmModal, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../coop/CoopUi';

/**
 * Registered farmers per sector. The administrator owns these numbers; the officer's dashboard,
 * warning reach and reports all read them from the store.
 */
export const SectorRegisterTab: React.FC<{
  sectorRegister: SectorRegisterEntry[];
  onSave: (farmersBySector: Record<string, number>) => void;
}> = ({ sectorRegister, onSave }) => {
  const toDraft = (entries: SectorRegisterEntry[]) =>
    Object.fromEntries(entries.map((e) => [e.sector, String(e.farmers)])) as Record<string, string>;
  const [draft, setDraft] = useState<Record<string, string>>(() => toDraft(sectorRegister));
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => setDraft(toDraft(sectorRegister)), [sectorRegister]);

  const parsed = (sector: string) => Number(draft[sector] || 0);
  const changed = sectorRegister.filter((e) => parsed(e.sector) !== e.farmers);
  const invalid = sectorRegister.some((e) => !draft[e.sector] || parsed(e.sector) <= 0);
  const draftTotal = sectorRegister.reduce((sum, e) => sum + parsed(e.sector), 0);

  return (
    <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(31,74,52,0.08)]">
        <div>
          <h3 className="text-[16px] font-semibold text-[#17271D]">Sector register</h3>
          <p className="text-[12px] text-[#5B665E]">
            Registered farmers in each sector · {totalRegisteredFarmers(sectorRegister).toLocaleString()} in Musanze.
            Warnings reach these farmers and the officer dashboard counts them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={changed.length === 0}
            onClick={() => setDraft(toDraft(sectorRegister))}
            className={SECONDARY_BUTTON}
          >
            Discard
          </button>
          <button
            type="button"
            disabled={changed.length === 0 || invalid}
            onClick={() => setIsConfirmOpen(true)}
            className={PRIMARY_BUTTON}
          >
            {changed.length === 0 ? 'Save changes' : `Save ${changed.length} ${changed.length === 1 ? 'change' : 'changes'}`}
          </button>
        </div>
      </div>

      {invalid && <p className="text-[12px] font-medium text-[#17271D]">Each sector needs at least 1 farmer.</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px] border-collapse">
          <thead>
            <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
              <th className="py-2.5 pr-3 text-left font-semibold">Sector</th>
              <th className="py-2.5 px-3 text-left font-semibold">Registered farmers</th>
              <th className="py-2.5 pl-3 text-left font-semibold">Last updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
            {sectorRegister.map((e) => {
              const isChanged = parsed(e.sector) !== e.farmers;
              return (
                <tr key={e.sector}>
                  <td className="py-2.5 pr-3 font-medium text-[#17271D]">{e.sector}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label={`Registered farmers in ${e.sector}`}
                      value={draft[e.sector] ?? ''}
                      onChange={(ev) =>
                        setDraft((prev) => ({ ...prev, [e.sector]: ev.target.value.replace(/[^0-9]/g, '').slice(0, 5) }))
                      }
                      className={`w-24 h-9 px-3 rounded-full bg-white border text-[12.5px] text-[#17271D] tabular-nums focus:outline-none focus:border-[#1F4A34] ${
                        isChanged ? 'border-[#3E8E55] ring-2 ring-[#3E8E55]/30' : 'border-[rgba(31,74,52,0.18)]'
                      }`}
                    />
                  </td>
                  <td className="py-2.5 pl-3 text-[#5B665E] tabular-nums">
                    {e.updatedAt} · {e.updatedBy}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-[rgba(31,74,52,0.12)]">
              <td className="py-2.5 pr-3 font-semibold text-[#17271D]">Total</td>
              <td className="py-2.5 px-3 font-semibold text-[#17271D] tabular-nums">{draftTotal.toLocaleString()}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        icon={Users}
        title="Save the sector register?"
        body={`${changed.map((e) => `${e.sector}: ${e.farmers} → ${parsed(e.sector)}`).join(' · ')}. New warnings reach the new numbers; warnings already sent keep their delivery records.`}
        confirmLabel="Save register"
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          onSave(Object.fromEntries(sectorRegister.map((e) => [e.sector, parsed(e.sector)])));
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
};
