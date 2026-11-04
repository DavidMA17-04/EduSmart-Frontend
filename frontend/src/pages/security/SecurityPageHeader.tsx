import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export function SecurityPageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <span className="w-11 h-11 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {actions}
    </motion.header>
  );
}

export function todayLabel(): string {
  const text = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Costa_Rica',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
