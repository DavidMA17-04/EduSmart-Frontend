import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { X } from 'lucide-react';
import styles from './Toast.module.css';

type ToastTone = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  push: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = ++toastId;
    setItems((current) => [...current, { id, message, tone }]);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const timers = items.map((item) =>
      window.setTimeout(() => dismiss(item.id), 2800),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [dismiss, items]);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} aria-live="polite">
        {items.map((item) => (
          <div
            className={`${styles.toast} ${
              item.tone === 'error'
                ? styles.error
                : item.tone === 'info'
                  ? styles.info
                  : styles.success
            }`}
            key={item.id}
            role="status"
          >
            <span>{item.message}</span>
            <button
              aria-label="Cerrar"
              className={styles.close}
              onClick={() => dismiss(item.id)}
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      push: (message: string) => {
        console.warn('ToastProvider missing:', message);
      },
    };
  }
  return ctx;
}
