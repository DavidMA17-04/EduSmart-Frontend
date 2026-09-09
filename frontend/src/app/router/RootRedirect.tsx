import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

export const RootRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return <Navigate replace to={isAuthenticated ? '/admin' : '/login'} />;
};
