import { brandColors } from './brandColors';

/** Shared Recharts styling — only brand palette. */
export const chartTheme = {
  grid: {
    stroke: brandColors.border,
    strokeDasharray: '3 3',
  },
  axis: {
    tick: { fontSize: 11, fill: brandColors.muted },
    stroke: brandColors.border,
  },
  tooltip: {
    contentStyle: {
      borderRadius: 8,
      border: `1px solid ${brandColors.border}`,
      background: brandColors.surface,
      color: brandColors.navy,
      fontSize: 13,
    },
  },
  /** Ordered series fills for multi-series charts */
  series: [
    brandColors.primary,
    brandColors.gold,
    brandColors.green,
    brandColors.primaryHover,
    brandColors.goldDark,
    brandColors.navy,
    brandColors.muted,
    brandColors.danger,
  ] as const,
  area: {
    stroke: brandColors.primary,
    fill: brandColors.primaryLight,
  },
  bar: {
    fill: brandColors.primary,
  },
} as const;

export type ChartSeriesColor = (typeof chartTheme.series)[number];
