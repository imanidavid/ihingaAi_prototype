import React, { useState } from 'react';
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import { PlanAheadItem } from '../../types';
import { PLAN_ALL_CROPS, formatPlanDue, planItemsForCrops } from '../../data/musanzeData';
import { ConfirmModal, EmptyState, NeutralChip, PRIMARY_BUTTON } from '../coop/CoopUi';
import { PlanAheadModal } from './PlanAheadModal';

/** Officer's list of plan-ahead items (Warnings → Plan ahead). Farmers see the ones for their crops. */
export const PlanAheadTab: React.FC<{
  items: PlanAheadItem[];
  authorName: string;
  onSave: (item: PlanAheadItem) => void;
  onRemove: (itemId: string) => void;
}> = ({ items, authorName, onSave, onRemove }) => {
  const [editing, setEditing] = useState<PlanAheadItem | 'new' | null>(null);
  const [toRemove, setToRemove] = useState<PlanAheadItem | null>(null);
  const sorted = planItemsForCrops(items, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-[#5B665E] max-w-xl">
          Season tasks for farmers. Each farmer sees the items for the crops they grow, plus items for all crops.
        </p>
        <button type="button" onClick={() => setEditing('new')} className={`${PRIMARY_BUTTON} inline-flex items-center gap-1.5`}>
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Add plan-ahead item</span>
        </button>
      </div>

      <div className="bg-[#FBFCF8] rounded-[16px] border border-[rgba(31,74,52,0.10)] shadow-[0_2px_12px_rgba(31,74,52,0.05)] divide-y divide-[rgba(31,74,52,0.06)] overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState icon={CalendarClock} text="No plan-ahead items. Farmers see an empty Plan ahead list." />
        ) : (
          sorted.map((item) => (
            <div key={item.id} className="p-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <NeutralChip>{item.category}</NeutralChip>
                  <NeutralChip tone="outline">{item.crop === PLAN_ALL_CROPS ? 'All crops' : item.crop}</NeutralChip>
                  <NeutralChip tone="outline">{formatPlanDue(item.due)}</NeutralChip>
                </div>
                <h4 className="text-[14px] font-semibold text-[#17271D] leading-snug">{item.title}</h4>
                <p className="text-[12.5px] text-[#5B665E] leading-relaxed">{item.reason}</p>
                {item.authorName && <p className="text-[11.5px] text-[#5B665E]">By {item.authorName}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  aria-label={`Edit ${item.title}`}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white border border-[rgba(31,74,52,0.18)] text-[12px] font-medium text-[#1F4A34] hover:bg-[#E4ECDB] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToRemove(item)}
                  aria-label={`Remove ${item.title}`}
                  title="Remove"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B665E] hover:text-[#17271D] hover:bg-[#E4ECDB] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <PlanAheadModal
        item={editing}
        authorName={authorName}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          onSave(item);
          setEditing(null);
        }}
      />
      <ConfirmModal
        isOpen={!!toRemove}
        title="Remove plan-ahead item?"
        body={toRemove ? `Farmers will no longer see "${toRemove.title}".` : ''}
        confirmLabel="Remove"
        icon={Trash2}
        onConfirm={() => {
          if (toRemove) onRemove(toRemove.id);
          setToRemove(null);
        }}
        onClose={() => setToRemove(null)}
      />
    </div>
  );
};
