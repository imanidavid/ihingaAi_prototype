import React, { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
  Search,
  UserCog,
  Users,
} from 'lucide-react';
import { AccountStatus, AppRole, UserAccount } from '../../types';
import { ROLE_LABELS, ROLE_ORDER } from '../../data/musanzeData';
import { COOPERATIVE_OPTIONS, MUSANZE_SECTORS, maskPhone } from '../../data/rwandaAdminData';
import { PillSelect } from '../PillSelect';
import {
  CARD_CLASS,
  ConfirmModal,
  CoopModal,
  EmptyState,
  NeutralChip,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  TEXT_INPUT,
} from '../coop/CoopUi';

const PAGE_SIZE = 10;

export const STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Active',
  pending: 'Waiting for approval',
  suspended: 'Suspended',
  rejected: 'Rejected',
};

/** "Musanze district" or "Kinigi, Busogo" (+ cooperative) */
export function scopeLabel(account: UserAccount): string {
  const scope = account.scope || { district: account.district, sectors: [] };
  const area = scope.sectors.length === 0 ? `${scope.district} district` : scope.sectors.join(', ');
  return scope.cooperative ? `${area} · ${scope.cooperative}` : area;
}

export const UsersTab: React.FC<{
  accounts: UserAccount[];
  currentAccountId: string;
  onSetStatus: (accountId: string, status: AccountStatus) => void;
  onChangeRole: (accountId: string, role: AppRole) => void;
  onUpdateScope: (accountId: string, scope: NonNullable<UserAccount['scope']>) => void;
}> = ({ accounts, currentAccountId, onSetStatus, onChangeRole, onUpdateScope }) => {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [roleTarget, setRoleTarget] = useState<UserAccount | null>(null);
  const [scopeTarget, setScopeTarget] = useState<UserAccount | null>(null);
  const [statusTarget, setStatusTarget] = useState<UserAccount | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => {
      if (roleFilter !== 'all' && a.role !== roleFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (q && !a.fullName.toLowerCase().includes(q) && !(a.email || '').toLowerCase().includes(q) && !a.phone.includes(q))
        return false;
      return true;
    });
  }, [accounts, query, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-[#5B665E] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email or phone"
            aria-label="Search users"
            className={`${TEXT_INPUT} pl-10`}
          />
        </div>
        <PillSelect
          className="md:col-span-3"
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
          options={[{ value: 'all', label: 'All roles' }, ...ROLE_ORDER.map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
        />
        <PillSelect
          className="md:col-span-3"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All statuses' },
            ...(Object.keys(STATUS_LABELS) as AccountStatus[]).map((s) => ({ value: s, label: STATUS_LABELS[s] })),
          ]}
        />
      </div>

      <p className="text-[12px] text-[#5B665E] tabular-nums">
        {filtered.length} of {accounts.length} accounts
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} text="No accounts match these filters." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                <th className="py-2.5 pr-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Role</th>
                <th className="py-2.5 px-3 font-semibold">Access area</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Last sign-in</th>
                <th className="py-2.5 px-3 font-semibold">Two-step</th>
                <th className="py-2.5 pl-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
              {rows.map((a) => {
                const isSelf = a.id === currentAccountId;
                const isDecided = a.status === 'active' || a.status === 'suspended';
                return (
                  <tr key={a.id} className="hover:bg-[#E4ECDB]/30">
                    <td className="py-3 pr-3">
                      <span className="block font-semibold text-[#17271D]">
                        {a.fullName}
                        {isSelf && <span className="font-normal text-[#5B665E]"> (you)</span>}
                      </span>
                      <span className="block text-[11.5px] text-[#5B665E]">{a.email || maskPhone(a.phone)}</span>
                    </td>
                    <td className="py-3 px-3 text-[#17271D]">{ROLE_LABELS[a.role]}</td>
                    <td className="py-3 px-3 text-[#5B665E]">{scopeLabel(a)}</td>
                    <td className="py-3 px-3">
                      <NeutralChip tone={a.status === 'active' ? 'tint' : 'outline'}>
                        {a.status === 'active' && <Check className="w-3 h-3" strokeWidth={2} />}
                        {a.status === 'suspended' && <Ban className="w-3 h-3" strokeWidth={1.5} />}
                        {STATUS_LABELS[a.status]}
                      </NeutralChip>
                    </td>
                    <td className="py-3 px-3 text-[#17271D] whitespace-nowrap">{a.lastSignIn || 'Never'}</td>
                    <td className="py-3 px-3">
                      <NeutralChip tone={a.twoStepEnabled ? 'tint' : 'outline'}>{a.twoStepEnabled ? 'On' : 'Off'}</NeutralChip>
                    </td>
                    <td className="py-3 pl-3">
                      <div className="flex items-center justify-end gap-1">
                        <RowAction
                          label={`Change role of ${a.fullName}`}
                          icon={UserCog}
                          disabled={isSelf || !isDecided}
                          onClick={() => setRoleTarget(a)}
                        />
                        <RowAction
                          label={`Edit access area of ${a.fullName}`}
                          icon={MapPin}
                          disabled={!isDecided}
                          onClick={() => setScopeTarget(a)}
                        />
                        {a.status === 'suspended' ? (
                          <RowAction label={`Reactivate ${a.fullName}`} icon={RotateCcw} onClick={() => setStatusTarget(a)} />
                        ) : (
                          <RowAction
                            label={`Suspend ${a.fullName}`}
                            icon={Ban}
                            disabled={isSelf || a.status !== 'active'}
                            onClick={() => setStatusTarget(a)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(31,74,52,0.06)] text-[12px] text-[#5B665E]">
          <span className="tabular-nums">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <span className="px-2 tabular-nums">
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <ChangeAccountRoleModal
        account={roleTarget}
        onClose={() => setRoleTarget(null)}
        onSave={(id, role) => {
          onChangeRole(id, role);
          setRoleTarget(null);
        }}
      />
      <ScopeModal
        account={scopeTarget}
        onClose={() => setScopeTarget(null)}
        onSave={(id, scope) => {
          onUpdateScope(id, scope);
          setScopeTarget(null);
        }}
      />
      <ConfirmModal
        isOpen={!!statusTarget}
        icon={statusTarget?.status === 'suspended' ? RotateCcw : Ban}
        title={statusTarget?.status === 'suspended' ? 'Reactivate account?' : 'Suspend account?'}
        body={
          statusTarget
            ? statusTarget.status === 'suspended'
              ? `${statusTarget.fullName} can sign in again.`
              : `${statusTarget.fullName} can no longer sign in until you reactivate the account.`
            : ''
        }
        confirmLabel={statusTarget?.status === 'suspended' ? 'Reactivate' : 'Suspend'}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => {
          if (statusTarget) onSetStatus(statusTarget.id, statusTarget.status === 'suspended' ? 'active' : 'suspended');
          setStatusTarget(null);
        }}
      />
    </div>
  );
};

const RowAction: React.FC<{
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, icon: Icon, onClick, disabled }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="w-8 h-8 rounded-full border border-[rgba(31,74,52,0.12)] bg-white flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
  >
    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
  </button>
);

const ChangeAccountRoleModal: React.FC<{
  account: UserAccount | null;
  onClose: () => void;
  onSave: (accountId: string, role: AppRole) => void;
}> = ({ account, onClose, onSave }) => {
  const [role, setRole] = useState<AppRole>('farmer');
  useEffect(() => {
    if (account) setRole(account.role);
  }, [account]);
  if (!account) return null;
  return (
    <CoopModal
      isOpen
      onClose={onClose}
      title="Change role"
      subtitle={account.fullName}
      icon={UserCog}
      maxWidth="max-w-[460px]"
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button type="button" disabled={role === account.role} onClick={() => onSave(account.id, role)} className={PRIMARY_BUTTON}>
            Save role
          </button>
        </>
      }
    >
      <PillSelect
        label="Role"
        value={role}
        onChange={(v) => setRole(v as AppRole)}
        options={ROLE_ORDER.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
      />
      <p className="text-[12.5px] text-[#5B665E]">
        The new role's permissions apply the next time {account.fullName.split(' ')[0]} signs in.
      </p>
    </CoopModal>
  );
};

const ScopeModal: React.FC<{
  account: UserAccount | null;
  onClose: () => void;
  onSave: (accountId: string, scope: NonNullable<UserAccount['scope']>) => void;
}> = ({ account, onClose, onSave }) => {
  const [sectors, setSectors] = useState<string[]>([]);
  const [cooperative, setCooperative] = useState('none');
  useEffect(() => {
    if (account) {
      setSectors(account.scope?.sectors || []);
      setCooperative(account.scope?.cooperative || 'none');
    }
  }, [account]);
  if (!account) return null;
  const district = account.scope?.district || account.district;
  const toggle = (s: string) => setSectors((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <CoopModal
      isOpen
      onClose={onClose}
      title="Access area"
      subtitle={`${account.fullName} · ${ROLE_LABELS[account.role]}`}
      icon={MapPin}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave(account.id, {
                district,
                sectors: sectors.length === MUSANZE_SECTORS.length ? [] : sectors,
                ...(cooperative !== 'none' ? { cooperative } : {}),
              })
            }
            className={PRIMARY_BUTTON}
          >
            Save access area
          </button>
        </>
      }
    >
      <div>
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">District</span>
        <p className="h-11 px-4 rounded-full bg-[#F4F6EF] border border-[rgba(31,74,52,0.10)] flex items-center text-[13px] text-[#17271D]">
          {district} (the prototype covers one district)
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-[#17271D]">Sectors</span>
          <span className="text-[12px] text-[#5B665E]">
            {sectors.length === 0 ? 'Whole district' : `${sectors.length} of ${MUSANZE_SECTORS.length}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={sectors.length === 0}
            onClick={() => setSectors([])}
            className={`px-3 h-9 rounded-full text-[12.5px] border cursor-pointer ${
              sectors.length === 0 ? 'bg-[#1F4A34] text-white border-[#1F4A34]' : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)]'
            }`}
          >
            Whole district
          </button>
          {MUSANZE_SECTORS.map((s) => {
            const on = sectors.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s)}
                className={`px-3 h-9 rounded-full text-[12.5px] border cursor-pointer flex items-center gap-1 ${
                  on ? 'bg-[#1F4A34] text-white border-[#1F4A34]' : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
                }`}
              >
                {on && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <PillSelect
        label="Cooperative"
        value={cooperative}
        onChange={setCooperative}
        options={[
          { value: 'none', label: 'No cooperative' },
          ...COOPERATIVE_OPTIONS.filter((c) => c !== 'None / Individual' && c !== 'Other cooperative').map((c) => ({
            value: c,
            label: c,
          })),
        ]}
      />
    </CoopModal>
  );
};
