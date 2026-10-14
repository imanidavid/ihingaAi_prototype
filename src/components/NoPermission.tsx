import React from 'react';
import { Lock } from 'lucide-react';
import { PermissionId } from '../types';
import { PERMISSIONS } from '../data/musanzeData';
import { CARD_CLASS, EmptyState } from './coop/CoopUi';

/** Shown instead of a page when the permission matrix does not allow it for the signed-in role. */
export const NoPermission: React.FC<{ permission: PermissionId }> = ({ permission }) => {
  const label = PERMISSIONS.find((p) => p.id === permission)?.label || permission;
  return (
    <div className={CARD_CLASS}>
      <EmptyState icon={Lock} text={`Your role does not have the “${label}” permission. Ask the administrator.`} />
    </div>
  );
};
