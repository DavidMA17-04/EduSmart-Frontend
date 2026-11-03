import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import styles from './ConnectionStatus.module.css';

type Status = 'online' | 'offline' | 'restored';

/**
 * Aviso flotante cuando el dispositivo pierde la conexión a internet, y una
 * confirmación breve cuando vuelve.
 */
export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>(() =>
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online',
  );
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const goOffline = () => {
      window.clearTimeout(timer.current);
      setStatus('offline');
    };
    const goOnline = () => {
      setStatus((current) => (current === 'offline' ? 'restored' : current));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setStatus('online'), 3500);
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      window.clearTimeout(timer.current);
    };
  }, []);

  if (status === 'online') return null;

  const offline = status === 'offline';
  return (
    <div
      aria-live="assertive"
      className={`${styles.banner} ${offline ? styles.offline : styles.restored}`}
      key={status}
      role="status"
    >
      <span className={styles.icon} aria-hidden="true">
        {offline ? <WifiOff size={18} /> : <Wifi size={18} />}
      </span>
      <span className={styles.text}>
        <strong>{offline ? 'Sin conexión a internet' : 'Conexión restablecida'}</strong>
        <span>
          {offline
            ? 'Los cambios no se guardarán hasta que vuelva la conexión.'
            : 'Ya puede seguir trabajando con normalidad.'}
        </span>
      </span>
    </div>
  );
}
