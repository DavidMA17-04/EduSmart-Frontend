import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { getSessionUser } from '@/shared/auth';
import { destinationForSession } from '@/widgets/app-shell/model/territory';

export const RootRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }
  return <Navigate replace to={destinationForSession(getSessionUser())} />;
};
