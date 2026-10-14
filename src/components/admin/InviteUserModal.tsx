import React, { useEffect, useState } from 'react';
import { Check, Mail, UserPlus } from 'lucide-react';
import { AppRole, UserAccount } from '../../types';
import { NOW_STAMP, ROLE_LABELS } from '../../data/musanzeData';
import { COOPERATIVE_OPTIONS, MUSANZE_SECTORS, validateRwandaPhone } from '../../data/rwandaAdminData';
import { PillSelect } from '../PillSelect';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON, TEXT_INPUT } from '../coop/CoopUi';

/** Officials are only created by the administrator; farmers sign up themselves. */
const INVITE_ROLES: AppRole[] = ['officer', 'cooperative', 'researcher', 'admin'];

const chip = (on: boolean) =>
  `px-3 h-8 rounded-full text-[12px] border flex items-center gap-1 cursor-pointer ${
    on ? 'bg-[#1F4A34] text-white border-[#1F4A34]' : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
  }`;

/** Administrator creates an official's account; the person gets an invitation email to set a password. */
export const InviteUserModal: React.FC<{
  isOpen: boolean;
  accounts: UserAccount[];
  adminName: string;
  onClose: () => void;
  onInvite: (account: UserAccount) => void;
}> = ({ isOpen, accounts, adminName, onClose, onInvite }) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<AppRole>('officer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [cooperative, setCooperative] = useState('');
  const [sent, setSent] = useState<UserAccount | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFullName('');
    setRole('officer');
    setEmail('');
    setPhone('');
    setSectors([]);
    setCooperative('');
    setSent(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const emailTaken = accounts.some((a) => (a.email || '').toLowerCase() === email.trim().toLowerCase());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneValid = validateRwandaPhone(phone);
  const canSend =
    fullName.trim().split(/\s+/).length >= 2 && emailValid && !emailTaken && phoneValid && (role !== 'cooperative' || cooperative !== '');

  const send = () => {
    const account: UserAccount = {
      id: `acc-invite-${Date.now()}`,
      role,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      district: 'Musanze',
      preferredLanguage: 'en',
      status: 'invited',
      createdAt: NOW_STAMP.slice(0, 10),
      invitedAt: NOW_STAMP,
      invitedBy: adminName,
      twoStepEnabled: role === 'officer' || role === 'admin',
      scope: { district: 'Musanze', sectors, ...(role === 'cooperative' ? { cooperative } : {}) },
    };
    onInvite(account);
    setSent(account);
  };

  if (sent) {
    // Simulated invitation email, so the demo shows what the person receives
    return (
      <CoopModal
        isOpen
        onClose={onClose}
        title="Invitation sent"
        subtitle={`Email to ${sent.email} (simulated in the prototype)`}
        icon={Mail}
        footer={
          <button type="button" onClick={onClose} className={PRIMARY_BUTTON}>
            Done
          </button>
        }
      >
        <div className="rounded-xl border border-[rgba(31,74,52,0.12)] bg-white p-4 space-y-2 text-[13px] text-[#17271D]">
          <p className="text-[12px] text-[#5B665E]">Subject: Your IHINGA AI account is ready</p>
          <p>Hello {sent.fullName.split(' ')[0]},</p>
          <p>
            {sent.invitedBy} created your {ROLE_LABELS[sent.role].toLowerCase()} account on IHINGA AI for Musanze District.
          </p>
          <p>
            To start, open IHINGA AI, choose Sign in, enter this email address and set your password.
            {sent.twoStepEnabled ? ' You will also enter a code sent to your phone.' : ''}
          </p>
          <p className="text-[12px] text-[#5B665E]">If you did not expect this email, you can ignore it.</p>
        </div>
      </CoopModal>
    );
  }

  return (
    <CoopModal
      isOpen
      onClose={onClose}
      title="Add user"
      subtitle="For officials only. Farmers sign up themselves."
      icon={UserPlus}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button type="button" disabled={!canSend} onClick={send} className={`${PRIMARY_BUTTON} disabled:opacity-50`}>
            <Mail className="w-3.5 h-3.5" />
            Send invitation
          </button>
        </>
      }
    >
      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Full name</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Eric Habimana" className={TEXT_INPUT} />
      </label>
      <div>
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Role</span>
        <div className="flex flex-wrap gap-2">
          {INVITE_ROLES.map((r) => (
            <button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)} className={chip(role === r)}>
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Email (the invitation goes here)</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.rw" className={TEXT_INPUT} />
          {emailTaken && <span className="block text-[12px] font-medium text-[#17271D] mt-1">This email already has an account.</span>}
        </label>
        <label className="block">
          <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 788 000 000" className={TEXT_INPUT} />
        </label>
      </div>
      {role === 'cooperative' && (
        <PillSelect
          label="Cooperative"
          value={cooperative}
          onChange={setCooperative}
          placeholder="Choose cooperative"
          options={COOPERATIVE_OPTIONS.filter((c) => c !== 'None / Individual').map((c) => ({ value: c, label: c }))}
        />
      )}
      <div>
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Sectors they cover (none = all of Musanze)</span>
        <div className="flex flex-wrap gap-1.5">
          {MUSANZE_SECTORS.map((s) => {
            const on = sectors.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setSectors((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]))}
                className={chip(on)}
              >
                {on && <Check className="w-3 h-3" strokeWidth={2} />}
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </CoopModal>
  );
};
