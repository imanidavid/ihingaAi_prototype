import React, { useEffect, useState } from 'react';
import { UserX } from 'lucide-react';
import { AccessRequest } from '../../types';
import { ROLE_LABELS } from '../../data/musanzeData';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../coop/CoopUi';

const QUICK_REASONS = [
  'Could not confirm the staff or registration number.',
  'This person already has an account.',
  'Not working in Musanze District.',
];

/** Reject an access request; a reason is required and is shown to the applicant at sign-in. */
export const RejectRequestModal: React.FC<{
  request: AccessRequest | null;
  onClose: () => void;
  onReject: (requestId: string, reason: string) => void;
}> = ({ request, onClose, onReject }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (request) setReason('');
  }, [request]);

  if (!request) return null;

  return (
    <CoopModal
      isOpen
      onClose={onClose}
      title="Reject access request"
      subtitle={`${request.fullName} · ${ROLE_LABELS[request.role]}`}
      icon={UserX}
      maxWidth="max-w-[480px]"
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button
            type="button"
            disabled={reason.trim().length === 0}
            onClick={() => onReject(request.id, reason.trim())}
            className={PRIMARY_BUTTON}
          >
            Reject request
          </button>
        </>
      }
    >
      <div>
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Reason</span>
        <div className="flex flex-wrap gap-2 mb-2">
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={`px-3 py-1.5 rounded-full text-[12px] border cursor-pointer transition-colors ${
                reason === r
                  ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                  : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Tell the applicant why"
          aria-label="Reason for rejecting"
          className="w-full p-3 rounded-[16px] bg-white border border-[rgba(31,74,52,0.18)] text-[13px] text-[#17271D] placeholder:text-[#5B665E] focus:outline-none focus:border-[#1F4A34] resize-none"
        />
        <p className="text-[12px] text-[#5B665E] mt-1">The applicant sees this reason when they try to sign in.</p>
      </div>
    </CoopModal>
  );
};
