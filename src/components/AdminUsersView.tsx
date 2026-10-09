import React, { useState } from 'react';
import { AccessRequest, AccountStatus, AppRole, RolePermissions, UserAccount } from '../types';
import { PageHeader, SegmentedTabs } from './coop/CoopUi';
import { UsersTab } from './admin/UsersTab';
import { AccessRequestsTab } from './admin/AccessRequestsTab';
import { PermissionMatrixTab } from './admin/PermissionMatrixTab';
import { BulkImportTab } from './admin/BulkImportTab';

type UsersTabId = 'users' | 'requests' | 'permissions' | 'import';

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
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = (props) => {
  const pendingCount = props.accessRequests.filter((r) => r.status === 'pending').length;
  const [tab, setTab] = useState<UsersTabId>(pendingCount > 0 ? 'requests' : 'users');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & access"
        subtitle={`${props.accounts.length} accounts · ${pendingCount} access ${pendingCount === 1 ? 'request' : 'requests'} waiting`}
      />
      <SegmentedTabs<UsersTabId>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'users', label: 'Users', count: props.accounts.length },
          { id: 'requests', label: 'Access requests', count: pendingCount },
          { id: 'permissions', label: 'Permission matrix' },
          { id: 'import', label: 'Bulk import' },
        ]}
      />
      {tab === 'users' && (
        <UsersTab
          accounts={props.accounts}
          currentAccountId={props.currentAccountId}
          onSetStatus={props.onSetStatus}
          onChangeRole={props.onChangeRole}
          onUpdateScope={props.onUpdateScope}
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
    </div>
  );
};
