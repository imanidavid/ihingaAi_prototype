import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
  Search,
  UserCog,
  UserMinus,
  Users,
} from 'lucide-react';
import {
  CoopGroup,
  CoopGroupRecord,
  CoopMember,
  CoopMemberRole,
  CoopMessage,
  RegisteredFarmer,
  UserAccount,
} from '../types';
import {
  COOP_MEMBER_ROLES,
  REGISTERED_MUSANZE_FARMERS,
  formatDaysAgo,
} from '../data/musanzeData';
import { maskPhone } from '../data/rwandaAdminData';
import { PillSelect } from './PillSelect';
import {
  CARD_CLASS,
  ConfirmModal,
  EmptyState,
  NeutralChip,
  PageHeader,
  PRIMARY_BUTTON,
  SegmentedTabs,
  TEXT_INPUT,
} from './coop/CoopUi';
import { AddMemberModal, ChangeRoleModal, CreateGroupModal } from './coop/MemberModals';
import { GroupsTab } from './coop/GroupsTab';
import { PerformanceTab } from './coop/PerformanceTab';
import { DirectoryTab } from './coop/DirectoryTab';

type MembersTabId = 'members' | 'groups' | 'performance' | 'directory';

const PAGE_SIZE = 10;

interface CooperativeMembersViewProps {
  members: CoopMember[];
  groupRecords: CoopGroupRecord[];
  groups: CoopGroup[];
  messages: CoopMessage[];
  accounts: UserAccount[];
  onAddMember: (farmer: RegisteredFarmer, groupId: string) => void;
  onChangeRole: (memberId: string, role: CoopMemberRole) => void;
  onRemoveMember: (memberId: string) => void;
  onCreateGroup: (input: { name: string; leadId: string; memberIds: string[] }) => void;
  onMessageMember: (member: CoopMember) => void;
  onMessageGroup: (groupName: string) => void;
  onOpenGroup: (group: CoopGroup) => void;
}

export const CooperativeMembersView: React.FC<CooperativeMembersViewProps> = ({
  members,
  groupRecords,
  groups,
  messages,
  accounts,
  onAddMember,
  onChangeRole,
  onRemoveMember,
  onCreateGroup,
  onMessageMember,
  onMessageGroup,
  onOpenGroup,
}) => {
  const [tab, setTab] = useState<MembersTabId>('members');
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [notAckOnly, setNotAckOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<CoopMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CoopMember | null>(null);

  const groupById = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);

  /** Latest active warning per group — "acknowledged" refers to it (same as the group drawer). */
  const latestWarningByGroup = useMemo(
    () =>
      new Map(
        groups.map((g) => [
          g.id,
          g.acknowledgement[0] ? { id: g.acknowledgement[0].warningId, title: g.acknowledgement[0].warningTitle } : null,
        ])
      ),
    [groups]
  );

  const hasAcknowledgedLatest = (m: CoopMember): boolean | null => {
    const latest = latestWarningByGroup.get(m.groupId);
    if (!latest) return null;
    return !!m.acknowledged[latest.id];
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (groupFilter !== 'all' && m.groupId !== groupFilter) return false;
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;
      if (notAckOnly && hasAcknowledgedLatest(m) !== false) return false;
      if (q && !m.fullName.toLowerCase().includes(q) && !m.cell.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [members, query, groupFilter, roleFilter, notAckOnly, latestWarningByGroup]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  // Registered Musanze farmers (seeded pool + farmer sign-ups) who are not members yet
  const addCandidates = useMemo(() => {
    const memberNames = new Set(members.map((m) => m.fullName.toLowerCase()));
    const fromAccounts: RegisteredFarmer[] = accounts
      .filter((a) => a.role === 'farmer' && a.status === 'active' && a.district === 'Musanze' && a.farmerDetails)
      .map((a) => ({
        id: a.id,
        fullName: a.fullName,
        sector: a.farmerDetails!.sector,
        cell: a.farmerDetails!.cell,
        phone: a.phone,
        crops: a.farmerDetails!.cropsGrown,
      }));
    return [...REGISTERED_MUSANZE_FARMERS, ...fromAccounts].filter((f) => !memberNames.has(f.fullName.toLowerCase()));
  }, [members, accounts]);

  const notAckSummary = notAckOnly
    ? groups
        .filter((g) => groupFilter === 'all' || g.id === groupFilter)
        .filter((g) => g.unacknowledgedWarningTitle)
        .map((g) => `${g.name}: ${g.unacknowledgedCount} (${g.unacknowledgedWarningTitle})`)
        .join(' · ')
    : '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members & groups"
        subtitle={`Musanze Potato Growers Cooperative · ${members.length} members in ${groups.length} groups`}
        actions={
          tab === 'members' ? (
            <button type="button" onClick={() => setIsAddOpen(true)} className={PRIMARY_BUTTON}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add member</span>
            </button>
          ) : tab === 'groups' ? (
            <button type="button" onClick={() => setIsCreateGroupOpen(true)} className={PRIMARY_BUTTON}>
              <Plus className="w-3.5 h-3.5" />
              <span>Create group</span>
            </button>
          ) : undefined
        }
      />

      <SegmentedTabs<MembersTabId>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'members', label: 'Members', count: members.length },
          { id: 'groups', label: 'Groups', count: groups.length },
          { id: 'performance', label: 'Performance' },
          { id: 'directory', label: 'Directory' },
        ]}
      />

      {tab === 'members' && (
        <div className={`${CARD_CLASS} p-5 md:p-6 space-y-4`}>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-[#5B665E] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => resetPage(setQuery)(e.target.value)}
                placeholder="Search name or cell"
                aria-label="Search members"
                className={`${TEXT_INPUT} pl-10`}
              />
            </div>
            <PillSelect
              className="md:col-span-3"
              value={groupFilter}
              onChange={resetPage(setGroupFilter)}
              options={[
                { value: 'all', label: 'All groups' },
                ...groups.map((g) => ({ value: g.id, label: g.name, hint: `${g.membersCount} members` })),
              ]}
            />
            <PillSelect
              className="md:col-span-2"
              value={roleFilter}
              onChange={resetPage(setRoleFilter)}
              options={[{ value: 'all', label: 'All roles' }, ...COOP_MEMBER_ROLES.map((r) => ({ value: r, label: r }))]}
            />
            <button
              type="button"
              aria-pressed={notAckOnly}
              onClick={() => resetPage(setNotAckOnly)(!notAckOnly)}
              className={`md:col-span-3 h-11 px-4 rounded-full border text-[12.5px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                notAckOnly
                  ? 'bg-[#1F4A34] text-white border-[#1F4A34]'
                  : 'bg-white text-[#17271D] border-[rgba(31,74,52,0.18)] hover:border-[#1F4A34]'
              }`}
            >
              {notAckOnly && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
              <span>Not acknowledged latest warning</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#5B665E]">
            <span className="tabular-nums">
              {filtered.length} of {members.length} members
            </span>
            {notAckSummary && <span>{notAckSummary}</span>}
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <EmptyState icon={Users} text="No members match these filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px] border-collapse tabular-nums">
                <thead>
                  <tr className="border-b border-[rgba(31,74,52,0.08)] text-[12px] text-[#5B665E]">
                    <th className="py-2.5 pr-3 font-semibold">Name</th>
                    <th className="py-2.5 px-3 font-semibold">Group</th>
                    <th className="py-2.5 px-3 font-semibold">Phone</th>
                    <th className="py-2.5 px-3 font-semibold">Role</th>
                    <th className="py-2.5 px-3 font-semibold">Crops</th>
                    <th className="py-2.5 px-3 font-semibold">Latest warning acknowledged</th>
                    <th className="py-2.5 px-3 font-semibold">Last active</th>
                    <th className="py-2.5 pl-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,74,52,0.06)]">
                  {pageRows.map((m) => {
                    const ack = hasAcknowledgedLatest(m);
                    const group = groupById.get(m.groupId);
                    return (
                      <tr key={m.id} className="hover:bg-[#E4ECDB]/30">
                        <td className="py-3 pr-3">
                          <span className="block font-semibold text-[#17271D]">{m.fullName}</span>
                          <span className="block text-[11.5px] text-[#5B665E]">
                            {m.sector} · {m.cell}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#17271D]">{group?.name}</td>
                        <td className="py-3 px-3 text-[#5B665E] whitespace-nowrap">{maskPhone(m.phone)}</td>
                        <td className="py-3 px-3">
                          <NeutralChip tone={m.role === 'Member' ? 'outline' : 'tint'}>{m.role}</NeutralChip>
                        </td>
                        <td className="py-3 px-3 text-[#5B665E]">{m.crops.join(', ')}</td>
                        <td className="py-3 px-3">
                          {ack === null ? (
                            <span className="text-[#5B665E]">No active warning</span>
                          ) : ack ? (
                            <NeutralChip>
                              <Check className="w-3 h-3" strokeWidth={2} />
                              Yes
                            </NeutralChip>
                          ) : (
                            <NeutralChip tone="outline">No</NeutralChip>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="block text-[#17271D]">{m.lastActive}</span>
                          <span className="block text-[11.5px] text-[#5B665E]">{formatDaysAgo(m.lastActive)}</span>
                        </td>
                        <td className="py-3 pl-3">
                          <div className="flex items-center justify-end gap-1">
                            <IconAction label={`Message ${m.fullName}`} onClick={() => onMessageMember(m)} icon={MessageSquare} />
                            <IconAction
                              label={`Change role of ${m.fullName}`}
                              onClick={() => setRoleTarget(m)}
                              icon={UserCog}
                              disabled={m.role === 'Leader'}
                            />
                            <IconAction
                              label={`Remove ${m.fullName}`}
                              onClick={() => setRemoveTarget(m)}
                              icon={UserMinus}
                              disabled={m.role === 'Leader'}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'groups' && (
        <GroupsTab groups={groups} onOpenGroup={onOpenGroup} onMessageGroup={onMessageGroup} onCreateGroup={() => setIsCreateGroupOpen(true)} />
      )}

      {tab === 'performance' && <PerformanceTab members={members} groups={groups} messages={messages} />}

      {tab === 'directory' && <DirectoryTab ownMembersCount={members.length} />}

      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        candidates={addCandidates}
        groupRecords={groupRecords}
        onAdd={(farmer, groupId) => {
          onAddMember(farmer, groupId);
          setIsAddOpen(false);
        }}
      />

      <ChangeRoleModal
        member={roleTarget}
        members={members}
        groupRecords={groupRecords}
        onClose={() => setRoleTarget(null)}
        onSave={(id, role) => {
          onChangeRole(id, role);
          setRoleTarget(null);
        }}
      />

      <ConfirmModal
        isOpen={!!removeTarget}
        title="Remove member?"
        icon={UserMinus}
        body={
          removeTarget
            ? `${removeTarget.fullName} will leave ${groupById.get(removeTarget.groupId)?.name}. They stop getting cooperative messages and meeting invitations.`
            : ''
        }
        confirmLabel="Remove member"
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) onRemoveMember(removeTarget.id);
          setRemoveTarget(null);
        }}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        members={members}
        groupRecords={groupRecords}
        onCreate={(input) => {
          onCreateGroup(input);
          setIsCreateGroupOpen(false);
          setTab('groups');
        }}
      />
    </div>
  );
};

const IconAction: React.FC<{
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  disabled?: boolean;
}> = ({ label, onClick, icon: Icon, disabled }) => (
  <button
    type="button"
    title={disabled ? 'The cooperative leader cannot be changed here' : label}
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="w-8 h-8 rounded-full border border-[rgba(31,74,52,0.12)] bg-white flex items-center justify-center text-[#1F4A34] hover:bg-[#E4ECDB] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
  >
    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
  </button>
);
