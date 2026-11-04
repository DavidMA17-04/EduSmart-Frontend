import { Navigate } from 'react-router-dom';
import { getSessionUser } from '@/shared/auth';
import { houseHomeOrLogin } from '@/widgets/app-shell/model/territory';

export function HouseHomeRedirect() {
  return <Navigate replace to={houseHomeOrLogin(getSessionUser()?.roles)} />;
}
