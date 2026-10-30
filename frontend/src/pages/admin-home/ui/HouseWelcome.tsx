import { useEffect, useState } from 'react';
import { CalendarRange } from 'lucide-react';
import styles from './AdminHomePage.module.css';

function getGreeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function HouseWelcome({
  name,
  subtitle,
}: {
  name: string;
  subtitle: string;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className={styles.header}>
      <div>
        <h1>
          ¡{getGreeting(now)}, <span className={styles.nameHighlight}>{name}</span>!
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.dateBlock}>
        <CalendarRange size={16} />
        <span>{formatDate(now)}</span>
        <span className={styles.time}>{formatTime(now)}</span>
      </div>
    </header>
  );
}
