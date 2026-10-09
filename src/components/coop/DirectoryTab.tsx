import React from 'react';
import { Building2, Info } from 'lucide-react';
import { COOP_DIRECTORY } from '../../data/musanzeData';
import { CARD_CLASS, IconCircle, NeutralChip } from './CoopUi';

export const DirectoryTab: React.FC<{ ownMembersCount: number }> = ({ ownMembersCount }) => (
  <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(31,74,52,0.08)]">
      <div>
        <h3 className="text-[16px] font-semibold text-[#17271D]">Cooperatives in Musanze</h3>
        <p className="text-[12px] text-[#5B665E]">{COOP_DIRECTORY.length} cooperatives using IHINGA AI</p>
      </div>
      <span className="flex items-center gap-1.5 text-[12px] text-[#5B665E]">
        <Info className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
        Simulated directory for the prototype
      </span>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
        <thead>
          <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
            <th className="py-2.5 pr-3 font-semibold">Cooperative</th>
            <th className="py-2.5 px-3 font-semibold">Sectors</th>
            <th className="py-2.5 px-3 font-semibold">Main crops</th>
            <th className="py-2.5 pl-3 font-semibold text-right">Members</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
          {COOP_DIRECTORY.map((c) => {
            const isOwn = c.members === null;
            return (
              <tr key={c.id} className={isOwn ? 'bg-[#E4ECDB]/40' : ''}>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <IconCircle icon={Building2} />
                    <div>
                      <span className="block font-semibold text-[#17271D]">{c.name}</span>
                      {isOwn && <NeutralChip>Your cooperative</NeutralChip>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-[#17271D]">{c.sectors}</td>
                <td className="py-3 px-3 text-[#5B665E]">{c.mainCrops}</td>
                <td className="py-3 pl-3 text-right font-semibold text-[#17271D]">{isOwn ? ownMembersCount : c.members}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);
