import React, { useState } from 'react';
import { Check, History, UserCheck, X } from 'lucide-react';
import { AccessRequest, UserAccount } from '../../types';
import { ROLE_LABELS, stampSortKey } from '../../data/musanzeData';
import { CARD_CLASS, EmptyState, NeutralChip, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../coop/CoopUi';
import { RejectRequestModal } from './RejectRequestModal';

export const AccessRequestsTab: React.FC<{
  accessRequests: AccessRequest[];
  accounts: UserAccount[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}> = ({ accessRequests, accounts, onApprove, onReject }) => {
  const [rejecting, setRejecting] = useState<AccessRequest | null>(null);
  const byNewest = [...accessRequests].sort((a, b) => stampSortKey(b.submittedAt) - stampSortKey(a.submittedAt));
  const pending = byNewest.filter((r) => r.status === 'pending');
  const decided = byNewest.filter((r) => r.status !== 'pending');

  const details = (r: AccessRequest): string => {
    const account = accounts.find((a) => a.id === r.accountId);
    if (account?.officerDetails) return `Staff ID ${account.officerDetails.staffId} · ${account.officerDetails.districtOfAssignment} District`;
    if (account?.coopDetails)
      return `Registration ${account.coopDetails.registrationNumber} · ${account.coopDetails.membersCount} members · ${account.coopDetails.sector}`;
    if (account?.researcherDetails) return `${account.researcherDetails.institution} · ${account.researcherDetails.researchArea}`;
    return r.organizationOrArea;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={`${CARD_CLASS} p-5 md:p-6 lg:col-span-7`}>
        <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Waiting for a decision</h3>
          <p className="text-[12px] text-[#5B665E]">Approved accounts can sign in at once. Rejected applicants see your reason.</p>
        </div>
        {pending.length === 0 ? (
          <EmptyState icon={UserCheck} text="No access requests are waiting." />
        ) : (
          <div className="divide-y divide-[rgba(31,74,52,0.06)]">
            {pending.map((r) => (
              <div key={r.id} className="py-4 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="block text-[14px] font-semibold text-[#17271D]">{r.fullName}</span>
                    <span className="block text-[12.5px] text-[#5B665E]">
                      {ROLE_LABELS[r.role]} · {r.organizationOrArea}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#5B665E] tabular-nums">Sent {r.submittedAt}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.06)] text-[12.5px] text-[#17271D] space-y-0.5 tabular-nums">
                  <span className="block">{details(r)}</span>
                  <span className="block text-[#5B665E]">
                    {r.phone}
                    {r.email ? ` · ${r.email}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setRejecting(r)} className={SECONDARY_BUTTON}>
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button type="button" onClick={() => onApprove(r.id)} className={PRIMARY_BUTTON}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${CARD_CLASS} p-5 lg:col-span-5`}>
        <div className="pb-3 border-b border-[rgba(31,74,52,0.08)]">
          <h3 className="text-[16px] font-semibold text-[#17271D]">Decided</h3>
          <p className="text-[12px] text-[#5B665E] tabular-nums">{decided.length} requests</p>
        </div>
        {decided.length === 0 ? (
          <EmptyState icon={History} text="No decisions yet." />
        ) : (
          <div className="divide-y divide-[rgba(31,74,52,0.06)]">
            {decided.map((r) => (
              <div key={r.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[#17271D]">{r.fullName}</span>
                  <NeutralChip tone={r.status === 'approved' ? 'tint' : 'outline'}>
                    {r.status === 'approved' ? <Check className="w-3 h-3" strokeWidth={2} /> : <X className="w-3 h-3" strokeWidth={2} />}
                    {r.status === 'approved' ? 'Approved' : 'Rejected'}
                  </NeutralChip>
                </div>
                <span className="block text-[12px] text-[#5B665E]">
                  {ROLE_LABELS[r.role]} · {r.organizationOrArea}
                  {r.decidedAt ? ` · ${r.decidedAt}` : ''}
                </span>
                {r.decisionReason && <span className="block text-[12px] text-[#17271D]">Reason: {r.decisionReason}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <RejectRequestModal
        request={rejecting}
        onClose={() => setRejecting(null)}
        onReject={(id, reason) => {
          onReject(id, reason);
          setRejecting(null);
        }}
      />
    </div>
  );
};
