import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { ValidateBulkImportResponse } from '@/features/manage-user-import';
import { UserImportPreviewPanel } from '../UserBulkImportPage/UserImportPreviewPanel';

export const UserImportPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { importData?: ValidateBulkImportResponse; fileName?: string }
    | null;
  const importData = state?.importData;

  if (!importData || !(importData.records || importData.rows)) {
    return <Navigate replace to="/admin/users/import/bulk" />;
  }

  return (
    <UserImportPreviewPanel
      importData={importData}
      fileName={state?.fileName}
      variant="page"
      onBackToFileSelect={() => navigate('/admin/users/import/bulk')}
      onCancel={() => navigate('/admin/users')}
      onSuccess={() => navigate('/admin/users')}
    />
  );
};

export default UserImportPreviewPage;
