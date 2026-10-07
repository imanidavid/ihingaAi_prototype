import React, { useEffect, useMemo, useState } from 'react';
import { Check, Search, UserCog, UserPlus, Users } from 'lucide-react';
import { CoopGroupRecord, CoopMember, CoopMemberRole, RegisteredFarmer } from '../../types';
import { COOP_MEMBER_ROLES } from '../../data/musanzeData';
import { maskPhone } from '../../data/rwandaAdminData';
import { PillSelect } from '../PillSelect';
import { CoopModal, PRIMARY_BUTTON, SECONDARY_BUTTON, TEXT_INPUT } from './CoopUi';

// ---------------------------------------------------------------------------
// Add member: search registered Musanze farmers → choose group
// ---------------------------------------------------------------------------
export const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  candidates: RegisteredFarmer[];
  groupRecords: CoopGroupRecord[];
  onAdd: (farmer: RegisteredFarmer, groupId: string) => void;
}> = ({ isOpen, onClose, candidates, groupRecords, onAdd }) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedId(null);
      setGroupId('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? candidates.filter(
          (c) => c.fullName.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.cell.toLowerCase().includes(q)
        )
      : candidates;
  }, [candidates, query]);

  const selected = candidates.find((c) => c.id === selectedId) || null;

  const handleSelect = (farmer: RegisteredFarmer) => {
    setSelectedId(farmer.id);
    // Suggest the group that farms in the same sector
    const sameSector = groupRecords.find((g) => g.sector === farmer.sector);
    setGroupId(sameSector ? sameSector.id : '');
  };

  return (
    <CoopModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add member"
      subtitle="Search registered farmers in Musanze"
      icon={UserPlus}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected || !groupId}
            onClick={() => selected && onAdd(selected, groupId)}
            className={PRIMARY_BUTTON}
          >
            Add member
          </button>
        </>
      }
    >
      <div className="relative">
        <Search className="w-4 h-4 text-[#5B665E] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, sector or cell"
          aria-label="Search registered farmers"
          className={`${TEXT_INPUT} pl-10`}
        />
      </div>

      <div className="rounded-[16px] border border-[rgba(31,74,52,0.10)] bg-white divide-y divide-[rgba(31,74,52,0.06)] max-h-64 overflow-y-auto">
        {results.length === 0 && (
          <p className="p-4 text-[12.5px] text-[#5B665E]">
            {candidates.length === 0
              ? 'Every registered farmer is already a member.'
              : 'No registered farmer matches this search.'}
          </p>
        )}
        {results.map((f) => {
          const isSelected = f.id === selectedId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => handleSelect(f)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                isSelected ? 'bg-[#E4ECDB]' : 'hover:bg-[#F4F6EF]'
              }`}
            >
              <div className="min-w-0">
                <span className="block text-[13px] font-semibold text-[#17271D]">{f.fullName}</span>
                <span className="block text-[12px] text-[#5B665E]">
                  {f.sector} · {f.cell} · {f.crops.join(', ')} · {maskPhone(f.phone)}
                </span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-[#1F4A34] flex-shrink-0" strokeWidth={2} />}
            </button>
          );
        })}
      </div>

      <PillSelect
        label="Group"
        value={groupId}
        onChange={setGroupId}
        placeholder={selected ? 'Choose a group' : 'Choose a farmer first'}
        disabled={!selected}
        options={groupRecords.map((g) => ({ value: g.id, label: g.name, hint: `${g.sector} sector` }))}
      />
    </CoopModal>
  );
};

// ---------------------------------------------------------------------------
// Change role (one group lead per group; one secretary and one treasurer)
// ---------------------------------------------------------------------------
export const ChangeRoleModal: React.FC<{
  member: CoopMember | null;
  members: CoopMember[];
  groupRecords: CoopGroupRecord[];
  onClose: () => void;
  onSave: (memberId: string, role: CoopMemberRole) => void;
}> = ({ member, members, groupRecords, onClose, onSave }) => {
  const [role, setRole] = useState<CoopMemberRole>('Member');

  useEffect(() => {
    if (member) setRole(member.role);
  }, [member]);

  if (!member) return null;

  const groupName = groupRecords.find((g) => g.id === member.groupId)?.name || '';
  const currentHolder =
    role === 'Group lead'
      ? members.find((m) => m.groupId === member.groupId && m.role === 'Group lead' && m.id !== member.id)
      : role === 'Secretary' || role === 'Treasurer'
      ? members.find((m) => m.role === role && m.id !== member.id)
      : undefined;

  return (
    <CoopModal
      isOpen
      onClose={onClose}
      title="Change role"
      subtitle={`${member.fullName} · ${groupName}`}
      icon={UserCog}
      maxWidth="max-w-[460px]"
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button
            type="button"
            disabled={role === member.role}
            onClick={() => onSave(member.id, role)}
            className={PRIMARY_BUTTON}
          >
            Save role
          </button>
        </>
      }
    >
      <PillSelect
        label="Role"
        value={role}
        onChange={(v) => setRole(v as CoopMemberRole)}
        options={COOP_MEMBER_ROLES.filter((r) => r !== 'Leader').map((r) => ({
          value: r,
          label: r,
          hint: r === 'Group lead' ? `One per group (${groupName})` : r === 'Member' ? undefined : 'One per cooperative',
        }))}
      />
      {currentHolder && (
        <p className="text-[12.5px] text-[#5B665E] leading-relaxed">
          {currentHolder.fullName} is the {role.toLowerCase()} now and will become a member.
        </p>
      )}
    </CoopModal>
  );
};

// ---------------------------------------------------------------------------
// Create group: name, lead, members
// ---------------------------------------------------------------------------
export const CreateGroupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  members: CoopMember[];
  groupRecords: CoopGroupRecord[];
  onCreate: (input: { name: string; leadId: string; memberIds: string[] }) => void;
}> = ({ isOpen, onClose, members, groupRecords, onCreate }) => {
  const [name, setName] = useState('');
  const [leadId, setLeadId] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setLeadId('');
      setMemberIds([]);
      setQuery('');
    }
  }, [isOpen]);

  const groupName = (id: string) => groupRecords.find((g) => g.id === id)?.name || '';
  // Officers of the cooperative keep their role, so only members and group leads can lead a new group
  const leadOptions = members.filter((m) => m.role === 'Member' || m.role === 'Group lead');
  const nameTaken = groupRecords.some((g) => g.name.toLowerCase() === name.trim().toLowerCase());
  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => m.id !== leadId)
      .filter((m) => !q || m.fullName.toLowerCase().includes(q) || m.cell.toLowerCase().includes(q));
  }, [members, leadId, query]);

  const toggleMember = (id: string) =>
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canCreate = name.trim().length > 0 && !nameTaken && !!leadId;
  const total = 1 + memberIds.filter((id) => id !== leadId).length;

  return (
    <CoopModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create group"
      subtitle="Members move from their current group"
      icon={Users}
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => onCreate({ name: name.trim(), leadId, memberIds: memberIds.filter((id) => id !== leadId) })}
            className={PRIMARY_BUTTON}
          >
            {leadId ? `Create group (${total} ${total === 1 ? 'member' : 'members'})` : 'Create group'}
          </button>
        </>
      }
    >
      <label className="block">
        <span className="block text-[12px] font-semibold text-[#17271D] mb-1.5">Group name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bisoke seed growers"
          className={TEXT_INPUT}
        />
        {nameTaken && <span className="block mt-1 text-[12px] text-[#17271D]">A group with this name already exists.</span>}
      </label>

      <PillSelect
        label="Group lead"
        value={leadId}
        onChange={setLeadId}
        searchable
        placeholder="Choose the group lead"
        options={leadOptions.map((m) => ({
          value: m.id,
          label: m.fullName,
          hint: `${groupName(m.groupId)} · ${m.cell}${m.role === 'Group lead' ? ' · Group lead now' : ''}`,
        }))}
      />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-[#17271D]">Members</span>
          <span className="text-[12px] text-[#5B665E] tabular-nums">{memberIds.length} selected</span>
        </div>
        <div className="relative mb-2">
          <Search className="w-4 h-4 text-[#5B665E] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members"
            aria-label="Search members"
            className={`${TEXT_INPUT} pl-10`}
          />
        </div>
        <div className="rounded-[16px] border border-[rgba(31,74,52,0.10)] bg-white divide-y divide-[rgba(31,74,52,0.06)] max-h-52 overflow-y-auto">
          {pool.length === 0 && <p className="p-4 text-[12.5px] text-[#5B665E]">No members match this search.</p>}
          {pool.map((m) => {
            const isSelected = memberIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggleMember(m.id)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected ? 'bg-[#E4ECDB]' : 'hover:bg-[#F4F6EF]'
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-[13px] text-[#17271D]">{m.fullName}</span>
                  <span className="block text-[11.5px] text-[#5B665E]">
                    {groupName(m.groupId)} · {m.cell} · {m.role}
                  </span>
                </span>
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-[#1F4A34] border-[#1F4A34]' : 'border-[rgba(31,74,52,0.30)]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </CoopModal>
  );
};
