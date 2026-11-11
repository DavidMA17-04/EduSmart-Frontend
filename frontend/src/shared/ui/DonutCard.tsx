import { useState, type ComponentType, type SVGProps } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import styles from './DonutCard.module.css';

export type DonutSlice = {
  name: string;
  shortName: string;
  count: number;
  color: string;
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

type Props = {
  title: string;
  icon: IconComponent;
  slices: DonutSlice[];
  emptyText?: string;
  /** Override the center total when idle (defaults to sum of slices). */
  centerTotal?: number | string;
  centerLabel?: string;
};

export function DonutCard({
  title,
  icon: Icon,
  slices,
  emptyText = 'Sin datos para graficar.',
  centerTotal,
  centerLabel = 'Total',
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const hasData = slices.some((slice) => slice.count > 0);
  const activeSlice = activeIndex != null ? slices[activeIndex] : null;
  const value = activeSlice ? activeSlice.count : (centerTotal ?? total);
  const label = activeSlice ? activeSlice.shortName : centerLabel;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      {hasData ? (
        <div className={styles.donutRow}>
          <div className={styles.donutWrap}>
            <ResponsiveContainer width="100%" height={168}>
              <PieChart>
                <Pie
                  animationBegin={0}
                  animationDuration={700}
                  animationEasing="ease-out"
                  cx="50%"
                  cy="50%"
                  data={slices}
                  dataKey="count"
                  innerRadius={50}
                  isAnimationActive
                  nameKey="name"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {slices.map((slice, index) => {
                    const isActive = activeIndex === index;
                    const isDimmed = activeIndex != null && !isActive;
                    return (
                      <Cell
                        fill={slice.color}
                        key={slice.name}
                        style={{
                          cursor: 'pointer',
                          filter: isActive ? 'brightness(1.08)' : 'none',
                          opacity: isDimmed ? 0.4 : 1,
                          outline: 'none',
                          transition: 'opacity 0.4s ease, filter 0.4s ease',
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter}>
              <div className={styles.donutCenterContent} key={`${value}-${label}`}>
                <span className={styles.donutTotal}>{value}</span>
                <span className={styles.donutTotalLabel}>{label}</span>
              </div>
            </div>
          </div>
          <ul className={styles.legend}>
            {slices.map((slice, index) => (
              <li
                className={activeIndex === index ? styles.legendActive : undefined}
                key={slice.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span className={styles.legendDot} style={{ background: slice.color }} />
                <span className={styles.legendLabel}>{slice.name}</span>
                <span className={styles.legendCount}>
                  {slice.count} ({total > 0 ? Math.round((slice.count / total) * 100) : 0}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.muted}>{emptyText}</p>
      )}
    </div>
  );
}
