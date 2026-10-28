import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

export interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string> {
  /** Debe ser único por pantalla para la animación compartida. */
  id: string;
  value: T;
  options: TabOption<T>[];
  onChange: (value: T) => void;
}

/** Pestañas con indicador animado que se desliza entre opciones. */
export function CommunicationTabs<T extends string>({ id, value, options, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`relative whitespace-nowrap text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors ${
              selected ? 'text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {selected && (
              <motion.span
                layoutId={`${id}-tab-pill`}
                className="absolute inset-0 bg-[#0d2346] rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {option.icon}
              {option.label}
              {option.count !== undefined && option.count > 0 && (
                <motion.span
                  key={option.count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`min-w-[1.25rem] text-center text-[10px] font-bold px-1.5 py-px rounded-full ${
                    selected ? 'bg-[#cfac65] text-[#0d2346]' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {option.count}
                </motion.span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isSearching?: boolean;
}

export const CommunicationSearch: React.FC<SearchProps> = ({ value, onChange, placeholder, isSearching }) => (
  <div className="relative w-full md:w-80">
    <Search
      className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
        isSearching ? 'text-[#0d2346]' : 'text-slate-400'
      }`}
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-9 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d2346]/20 focus:border-[#0d2346] transition-colors [&::-webkit-search-cancel-button]:hidden"
    />
    <AnimatePresence>
      {value && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </AnimatePresence>
  </div>
);

/** Barra fina animada para indicar recargas en segundo plano. */
export const FetchingBar: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="h-0.5 w-full overflow-hidden rounded-full">
    <AnimatePresence>
      {active && (
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#cfac65] to-transparent"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '300%', opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  </div>
);
