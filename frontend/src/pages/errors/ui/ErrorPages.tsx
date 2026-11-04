import { ArrowLeft, Home, LogIn } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { getSessionUser } from '@/shared/auth';
import { ErrorScreen, ErrorScreenAction } from '@/shared/ui/ErrorScreen';
import { destinationForSession } from '@/widgets/app-shell/model/territory';

function useHomeTarget() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return { path: '/login', label: 'Ir al inicio de sesión', loggedIn: false };
  return { path: destinationForSession(getSessionUser()), label: 'Volver al inicio', loggedIn: true };
}

function BackAction() {
  const navigate = useNavigate();
  if (typeof window === 'undefined' || window.history.length <= 1) return null;
  return (
    <ErrorScreenAction
      icon={<ArrowLeft aria-hidden="true" size={18} />}
      onClick={() => navigate(-1)}
      variant="secondary"
    >
      Regresar
    </ErrorScreenAction>
  );
}

/**
 * 404 de interfaz. Dentro de una casa (con menú) o, si `standalone`, a
 * pantalla completa para direcciones fuera del sistema.
 */
export function NotFoundPage({ standalone = false }: { standalone?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const home = useHomeTarget();

  return (
    <ErrorScreen
      actions={
        <>
          <ErrorScreenAction
            icon={
              home.loggedIn ? <Home aria-hidden="true" size={18} /> : <LogIn aria-hidden="true" size={18} />
            }
            onClick={() => navigate(home.path, { replace: true })}
          >
            {home.label}
          </ErrorScreenAction>
          <BackAction />
        </>
      }
      code="404"
      description={
        <p>
          La dirección que abrió no existe o fue movida. Revise el enlace o vuelva al inicio para
          seguir trabajando.
        </p>
      }
      detail={
        <>
          <span>Dirección:</span>
          <code>{location.pathname}</code>
        </>
      }
      eyebrow="Error 404"
      standalone={standalone}
      title="Página no encontrada"
      variant="not-found"
    />
  );
}
