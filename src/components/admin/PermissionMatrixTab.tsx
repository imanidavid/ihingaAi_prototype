import React, { useEffect, useMemo, useState } from 'react';
import { Check, Lock, ShieldCheck } from 'lucide-react';
import { AppRole, PermissionId, RolePermissions } from '../../types';
import { PERMISSIONS, ROLE_LABELS, ROLE_ORDER } from '../../data/musanzeData';
import { CARD_CLASS, ConfirmModal, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../coop/CoopUi';

/** Administrators always keep "Manage users", so nobody can lock themselves out. */
const isLocked = (role: AppRole, permission: PermissionId) => role === 'admin' && permission === 'manage_users';

export const PermissionMatrixTab: React.FC<{
  rolePermissions: RolePermissions;
  onSave: (next: RolePermissions, changes: number) => void;
}> = ({ rolePermissions, onSave }) => {
  const [draft, setDraft] = useState<RolePermissions>(rolePermissions);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => setDraft(rolePermissions), [rolePermissions]);

  const changes = useMemo(
    () =>
      ROLE_ORDER.reduce(
        (sum, role) =>
          sum +
          PERMISSIONS.filter((p) => draft[role].includes(p.id) !== rolePermissions[role].includes(p.id)).length,
        0
      ),
    [draft, rolePermissions]
  );

  const toggle = (role: AppRole, permission: PermissionId) => {
    if (isLocked(role, permission)) return;
    setDraft((prev) => ({
      ...prev,
      [role]: prev[role].includes(permission)
        ? prev[role].filter((p) => p !== permission)
        : [...prev[role], permission],
    }));
  };

  return (
    <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(31,74,52,0.08)]">
        <div>
          <h3 className="text-[16px] font-semibold text-[#17271D]">Permission matrix</h3>
          <p className="text-[12px] text-[#5B665E]">What each role can do. Changes apply after you save.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={changes === 0} onClick={() => setDraft(rolePermissions)} className={SECONDARY_BUTTON}>
            Discard
          </button>
          <button type="button" disabled={changes === 0} onClick={() => setIsConfirmOpen(true)} className={PRIMARY_BUTTON}>
            {changes === 0 ? 'Save changes' : `Save ${changes} ${changes === 1 ? 'change' : 'changes'}`}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px] border-collapse">
          <thead>
            <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
              <th className="py-2.5 pr-3 text-left font-semibold">Permission</th>
              {ROLE_ORDER.map((role) => (
                <th key={role} className="py-2.5 px-3 text-center font-semibold">
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
            {PERMISSIONS.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-3">
                  <span className="block font-medium text-[#17271D]">{p.label}</span>
                  <span className="block text-[11.5px] text-[#5B665E]">{p.hint}</span>
                </td>
                {ROLE_ORDER.map((role) => {
                  const on = draft[role].includes(p.id);
                  const changed = on !== rolePermissions[role].includes(p.id);
                  const locked = isLocked(role, p.id);
                  return (
                    <td key={role} className="py-3 px-3 text-center">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        aria-label={`${ROLE_LABELS[role]}: ${p.label}`}
                        disabled={locked}
                        title={locked ? 'Administrators always manage users' : undefined}
                        onClick={() => toggle(role, p.id)}
                        className={`w-7 h-7 rounded-full border inline-flex items-center justify-center transition-colors ${
                          locked ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          on ? 'bg-[#1F4A34] border-[#1F4A34] text-white' : 'bg-white border-[rgba(31,74,52,0.30)] hover:border-[#1F4A34]'
                        } ${changed ? 'ring-2 ring-offset-1 ring-[#3E8E55]' : ''}`}
                      >
                        {locked ? <Lock className="w-3 h-3" strokeWidth={2} /> : on && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        icon={ShieldCheck}
        title="Save permission changes?"
        body={`${changes} ${changes === 1 ? 'change' : 'changes'} to the permissions marked in the table. People get the new permissions the next time they sign in.`}
        confirmLabel="Save permissions"
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          onSave(draft, changes);
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
};
