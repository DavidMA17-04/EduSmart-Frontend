import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { getSessionUser } from '@/shared/auth';

export const RootRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }
  const session = getSessionUser();
  return <Navigate replace to={session?.mustChangePassword ? '/admin/settings' : '/admin'} />;
};
