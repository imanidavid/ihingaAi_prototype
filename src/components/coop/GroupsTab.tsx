import React from 'react';
import { ArrowRight, FileText, MessageSquare, Plus, UserCheck, Users } from 'lucide-react';
import { CoopGroup } from '../../types';
import { RISK_LEVEL_COLORS } from '../../data/musanzeData';
import { CARD_CLASS, EmptyState, IconCircle, PRIMARY_BUTTON, SECONDARY_BUTTON } from './CoopUi';

export const GroupsTab: React.FC<{
  groups: CoopGroup[];
  onOpenGroup: (group: CoopGroup) => void;
  onMessageGroup: (groupName: string) => void;
  onCreateGroup: () => void;
}> = ({ groups, onOpenGroup, onMessageGroup, onCreateGroup }) => {
  if (groups.length === 0) {
    return (
      <div className={CARD_CLASS}>
        <EmptyState
          icon={Users}
          text="No groups yet."
          action={
            <button type="button" onClick={onCreateGroup} className={PRIMARY_BUTTON}>
              <Plus className="w-3.5 h-3.5" />
              <span>Create group</span>
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {groups.map((g) => (
        <div key={g.id} className={`${CARD_CLASS} p-5 flex flex-col justify-between gap-4`}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconCircle icon={Users} />
                <div>
                  <h3 className="text-[16px] font-semibold text-[#17271D] leading-tight">{g.name}</h3>
                  <p className="text-[12px] text-[#5B665E]">{g.sector} sector</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenGroup(g)}
                aria-label={`Open ${g.name}`}
                title="Open group"
                className="w-8 h-8 rounded-full bg-[#1F4A34] text-white flex items-center justify-center hover:bg-[#2C6343] cursor-pointer flex-shrink-0"
              >
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)]">
                <span className="block text-[#5B665E]">Members</span>
                <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">{g.membersCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)]">
                <span className="block text-[#5B665E]">Reports, 7 days</span>
                <span className="block text-[14px] font-semibold text-[#17271D] tabular-nums">{g.reports7Days}</span>
              </div>
            </div>

            <p className="text-[12.5px] text-[#17271D] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#1F4A34]" strokeWidth={1.5} />
              <span>Lead: {g.leadName || 'No group lead yet'}</span>
            </p>

            <div>
              <span className="block text-[12px] text-[#5B665E] mb-1.5">Active warnings</span>
              <div className="flex flex-wrap gap-1.5">
                {g.warnings.length === 0 && <span className="text-[12px] text-[#5B665E]">None</span>}
                {g.warnings.map((w) => (
                  <span
                    key={w.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-[#17271D] border"
                    style={{ backgroundColor: `${RISK_LEVEL_COLORS[w.level]}1F`, borderColor: `${RISK_LEVEL_COLORS[w.level]}4D` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RISK_LEVEL_COLORS[w.level] }} />
                    <span>{w.title}</span>
                    <span className="text-[#5B665E]">· {w.level}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[rgba(31,74,52,0.06)]">
            <button type="button" onClick={() => onOpenGroup(g)} className={`${SECONDARY_BUTTON} flex-1`}>
              <FileText className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>
            <button type="button" onClick={() => onMessageGroup(g.name)} className={`${PRIMARY_BUTTON} flex-1`}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message group</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
