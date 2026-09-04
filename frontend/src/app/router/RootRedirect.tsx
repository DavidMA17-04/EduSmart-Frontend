import { Navigate } from 'react-router-dom';
import { getAccessToken } from '@/shared/auth';

export const RootRedirect = () => (
  <Navigate replace to={getAccessToken() ? '/admin' : '/login'} />
);
