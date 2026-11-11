import type { ComponentType, SVGProps } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartTheme } from '@/styles/chartTheme';
import styles from './ModuleBarChart.module.css';

export type ModuleBarPoint = {
  name: string;
  value: number;
  color?: string;
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

type Props = {
  title: string;
  icon: IconComponent;
  data: ModuleBarPoint[];
  emptyText?: string;
  unitSuffix?: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
};

export function ModuleBarChart({
  title,
  icon: Icon,
  data,
  emptyText = 'Sin datos para graficar.',
  unitSuffix = '',
  height = 220,
  layout = 'horizontal',
}: Props) {
  const hasData = data.some((row) => row.value > 0);

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      {hasData ? (
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              layout={layout === 'horizontal' ? 'vertical' : 'horizontal'}
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid {...chartTheme.grid} />
              {layout === 'horizontal' ? (
                <>
                  <XAxis type="number" tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={88}
                    tick={chartTheme.axis.tick}
                    stroke={chartTheme.axis.stroke}
                  />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
                  <YAxis tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
                </>
              )}
              <Tooltip
                contentStyle={chartTheme.tooltip.contentStyle}
                formatter={(value) => [`${value}${unitSuffix}`, title]}
              />
              <Bar
                animationBegin={0}
                animationDuration={700}
                dataKey="value"
                radius={[6, 6, 6, 6]}
              >
                {data.map((row, index) => (
                  <Cell
                    fill={row.color ?? chartTheme.series[index % chartTheme.series.length]}
                    key={row.name}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={styles.muted}>{emptyText}</p>
      )}
    </div>
  );
}
