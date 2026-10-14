import React, { useState } from 'react';
import { AccessRequest, AccountStatus, AppRole, RolePermissions, SectorRegisterEntry, UserAccount } from '../types';
import { PageHeader, PRIMARY_BUTTON, SegmentedTabs } from './coop/CoopUi';
import { InviteUserModal } from './admin/InviteUserModal';
import { UserPlus } from 'lucide-react';
import { UsersTab } from './admin/UsersTab';
import { AccessRequestsTab } from './admin/AccessRequestsTab';
import { PermissionMatrixTab } from './admin/PermissionMatrixTab';
import { BulkImportTab } from './admin/BulkImportTab';
import { SectorRegisterTab } from './admin/SectorRegisterTab';

type UsersTabId = 'users' | 'requests' | 'permissions' | 'import' | 'sectors';

interface AdminUsersViewProps {
  accounts: UserAccount[];
  accessRequests: AccessRequest[];
  rolePermissions: RolePermissions;
  currentAccountId: string;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onSetStatus: (accountId: string, status: AccountStatus) => void;
  onChangeRole: (accountId: string, role: AppRole) => void;
  onUpdateScope: (accountId: string, scope: NonNullable<UserAccount['scope']>) => void;
  onSavePermissions: (next: RolePermissions, changes: number) => void;
  onImportAccounts: (accounts: UserAccount[], cooperative: string) => void;
  /** Registered farmers per sector — the administrator owns these numbers. */
  sectorRegister: SectorRegisterEntry[];
  onSaveSectorRegister: (farmersBySector: Record<string, number>) => void;
  /** Officials are created by the administrator and receive an invitation email. */
  onInviteUser: (account: UserAccount) => void;
  onResendInvite: (accountId: string) => void;
  adminName: string;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = (props) => {
  const pendingCount = props.accessRequests.filter((r) => r.status === 'pending').length;
  const [tab, setTab] = useState<UsersTabId>(pendingCount > 0 ? 'requests' : 'users');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const invitedCount = props.accounts.filter((a) => a.status === 'invited').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & access"
        subtitle={`${props.accounts.length} accounts · ${pendingCount} access ${pendingCount === 1 ? 'request' : 'requests'} waiting · ${invitedCount} ${invitedCount === 1 ? 'invitation' : 'invitations'} not accepted yet`}
        actions={
          <button type="button" onClick={() => setIsInviteOpen(true)} className={PRIMARY_BUTTON}>
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add user</span>
          </button>
        }
      />
      <InviteUserModal
        isOpen={isInviteOpen}
        accounts={props.accounts}
        adminName={props.adminName}
        onClose={() => setIsInviteOpen(false)}
        onInvite={props.onInviteUser}
      />
      <SegmentedTabs<UsersTabId>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'users', label: 'Users', count: props.accounts.length },
          { id: 'requests', label: 'Access requests', count: pendingCount },
          { id: 'permissions', label: 'Permission matrix' },
          { id: 'import', label: 'Bulk import' },
          { id: 'sectors', label: 'Sector register' },
        ]}
      />
      {tab === 'users' && (
        <UsersTab
          accounts={props.accounts}
          currentAccountId={props.currentAccountId}
          onSetStatus={props.onSetStatus}
          onChangeRole={props.onChangeRole}
          onUpdateScope={props.onUpdateScope}
          onResendInvite={props.onResendInvite}
        />
      )}
      {tab === 'requests' && (
        <AccessRequestsTab
          accessRequests={props.accessRequests}
          accounts={props.accounts}
          onApprove={props.onApprove}
          onReject={props.onReject}
        />
      )}
      {tab === 'permissions' && (
        <PermissionMatrixTab rolePermissions={props.rolePermissions} onSave={props.onSavePermissions} />
      )}
      {tab === 'import' && <BulkImportTab accounts={props.accounts} onImport={props.onImportAccounts} />}
      {tab === 'sectors' && (
        <SectorRegisterTab sectorRegister={props.sectorRegister} onSave={props.onSaveSectorRegister} />
      )}
    </div>
  );
};
